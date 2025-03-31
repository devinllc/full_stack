import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()

# Initialize Firebase Admin SDK
firebase_app = None
try:
    # Try to get existing app
    firebase_app = firebase_admin.get_app()
    logger.info("Using existing Firebase app")
except ValueError:
    # App doesn't exist, need to create it
    try:
        # Try to use service account json file first
        cred_path = os.path.join(settings.BASE_DIR.parent, 'backend', 'firebase-credentials.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with credential file")
        else:
            # Fall back to settings dict
            try:
                cred = credentials.Certificate(settings.FIREBASE_CONFIG)
                firebase_app = firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized with settings credential dict")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase with settings: {str(e)}")
                # Create a dummy app with minimal config to prevent further errors
                firebase_app = firebase_admin.initialize_app(credentials.ApplicationDefault())
                logger.warning("Using application default credentials as fallback")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        # Continue without Firebase - authentication will fail but app won't crash

class FirebaseAuthBackend(BaseBackend):
    """
    Custom authentication backend for Firebase.
    Verifies Firebase tokens and authenticates users.
    """
    def authenticate(self, request, token=None, **kwargs):
        if not token or firebase_app is None:
            return None
            
        try:
            # Verify the token with Firebase
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
            
            # Get user info from Firebase
            firebase_user = auth.get_user(uid)
            
            # Get or create user in our database
            try:
                user = User.objects.get(email=firebase_user.email)
            except User.DoesNotExist:
                # Create a new user
                username = firebase_user.email.split('@')[0]
                # Ensure username is unique
                base_username = username
                count = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{count}"
                    count += 1
                    
                user = User(
                    username=username,
                    email=firebase_user.email,
                    first_name=firebase_user.display_name.split()[0] if firebase_user.display_name else '',
                    last_name=' '.join(firebase_user.display_name.split()[1:]) if firebase_user.display_name and len(firebase_user.display_name.split()) > 1 else '',
                    phone_number=firebase_user.phone_number or ''
                )
                user.set_unusable_password()  # No password, since auth is handled by Firebase
                user.save()
                
            return user
            
        except Exception as e:
            # Invalid token or other error
            logger.error(f"Firebase authentication error: {str(e)}")
            return None
            
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 