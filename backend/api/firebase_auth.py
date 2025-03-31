import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
import os
import logging
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()

# Initialize Firebase Admin SDK - but only if credentials are available
firebase_app = None
try:
    # First check if app is already initialized
    try:
        firebase_app = firebase_admin.get_app()
        logger.info("Using existing Firebase app")
    except ValueError:
        # App doesn't exist, try different initialization methods
        
        # Method 1: Try credentials file
        cred_path = os.path.join(settings.BASE_DIR.parent, 'backend', 'firebase-credentials.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with credential file")
        
        # Method 2: Try settings.FIREBASE_CONFIG
        elif hasattr(settings, 'FIREBASE_CONFIG') and settings.FIREBASE_CONFIG is not None:
            if all(key in settings.FIREBASE_CONFIG for key in ['project_id', 'private_key', 'client_email']):
                cred = credentials.Certificate(settings.FIREBASE_CONFIG)
                firebase_app = firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized with settings credential dict")
            else:
                logger.warning("FIREBASE_CONFIG exists but is missing required fields")
        
        # Method 3: Try application default credentials (for cloud environments)
        else:
            try:
                # We need to set project ID explicitly for application default credentials
                firebase_app = firebase_admin.initialize_app(options={
                    'projectId': 'filemanagerss',  # Hardcode the project ID
                })
                logger.info("Firebase initialized with application default credentials")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase with default credentials: {str(e)}")
                
except Exception as e:
    logger.error(f"Failed to initialize Firebase: {str(e)}")

class FirebaseAuthBackend(BaseBackend):
    """
    Custom authentication backend for Firebase.
    Verifies Firebase tokens and authenticates users.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate using Firebase or fallback to standard authentication
        """
        # If firebase_token in kwargs, try to authenticate with Firebase
        firebase_token = kwargs.get('firebase_token')
        if firebase_token and firebase_app is not None:
            try:
                # Verify the Firebase token
                decoded_token = auth.verify_id_token(firebase_token)
                uid = decoded_token.get('uid')
                
                # Get user info from Firebase
                user_info = auth.get_user(uid)
                
                # Return user info for further processing
                return {'uid': uid, 'email': user_info.email, 'firebase_user': True}
            except Exception as e:
                logger.error(f"Firebase authentication error: {str(e)}")
                return None
                
        # No token or Firebase not initialized, return None to allow other backends
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 

class FirebaseAuthentication(BaseAuthentication):
    """
    DRF Authentication class for Firebase
    """
    def authenticate(self, request):
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer' not in auth_header:
            return None

        token = auth_header.split(' ')[1]
        
        # Authenticate token
        firebase_backend = FirebaseAuthBackend()
        user = firebase_backend.authenticate(request, firebase_token=token)
        
        if user:
            return (user, token)
        return None 