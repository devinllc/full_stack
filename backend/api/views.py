from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import logging
from .serializers import (
    UserSerializer, UserRegisterSerializer, UploadedFileSerializer, 
    AddressSerializer, FileStatsSerializer
)
from .models import UploadedFile, Address
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import models
from django.utils import timezone
import datetime
from rest_framework.views import APIView

# Set up logger
logger = logging.getLogger(__name__)

User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        # Check if Firebase token is provided
        firebase_token = request.data.get('firebase_token')
        
        if firebase_token:
            try:
                # Try to find a Firebase backend
                from django.contrib.auth import get_backends
                backends = get_backends()
                firebase_backend = None
                
                for backend in backends:
                    if 'FirebaseAuthBackend' in backend.__class__.__name__:
                        firebase_backend = backend
                        break
                
                if not firebase_backend:
                    return Response({'detail': 'Firebase authentication backend not available'}, 
                                   status=status.HTTP_400_BAD_REQUEST)
                
                # Try to authenticate with the token
                user = firebase_backend.authenticate(request, token=firebase_token)
                
                if user:
                    # Explicitly set the backend when logging in
                    login(request, user, backend=firebase_backend.__class__.__module__ + '.' + firebase_backend.__class__.__name__)
                    # User already exists, return token
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'user': UserSerializer(user).data,
                        'token': token.key
                    }, status=status.HTTP_200_OK)
                
                # If we get here, couldn't authenticate with Firebase token
                return Response({'detail': 'Invalid Firebase token'}, 
                               status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                logger.error(f"Firebase registration error: {str(e)}")
                return Response({'detail': f'Firebase registration error: {str(e)}'}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        # Traditional registration flow
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Check if the request contains Firebase token
            firebase_token = request.data.get('firebase_token')
            
            if firebase_token:
                # Attempt Firebase authentication first
                try:
                    from .firebase_auth import FirebaseAuthBackend
                    firebase_backend = FirebaseAuthBackend()
                    firebase_user = firebase_backend.authenticate(request, firebase_token=firebase_token)
                    
                    if firebase_user:
                        # Firebase authentication successful
                        try:
                            # Check if user exists in our database
                            user = User.objects.get(email=firebase_user['email'])
                        except User.DoesNotExist:
                            # Create user from Firebase data
                            username = firebase_user['email'].split('@')[0]
                            # Ensure username is unique
                            base_username = username
                            count = 1
                            while User.objects.filter(username=username).exists():
                                username = f"{base_username}{count}"
                                count += 1
                            
                            user = User.objects.create_user(
                                username=username,
                                email=firebase_user['email'],
                            )
                            user.set_unusable_password()
                            user.save()
                        
                        # Generate token for the user
                        token, _ = Token.objects.get_or_create(user=user)
                        return Response({
                            'token': token.key,
                            'user_id': user.id,
                            'email': user.email,
                            'username': user.username
                        })
                    else:
                        # Firebase authentication failed, continue with standard login
                        pass
                except Exception as e:
                    # Log Firebase authentication error but continue with standard login
                    logger.error(f"Firebase authentication failed: {str(e)}")
            
            # Standard username/password authentication
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = authenticate(username=username, password=password)
            
            if not user:
                # Try email as username for better UX
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Login successful
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'username': user.username
            })
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({'error': 'Login failed'}, status=500)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Successfully logged out'})

@method_decorator(csrf_exempt, name='dispatch')
class UploadedFileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            logger.info(f"Received file upload: {file_obj.name}, size: {file_obj.size} bytes")
            
            # Use default_storage which is configured as S3Boto3Storage in settings.py
            storage = default_storage
            logger.info(f"Using storage backend: {storage.__class__.__name__}")
            
            # The save method will properly use the user_directory_path defined in the model
            instance = serializer.save(
                user=self.request.user,
                file=file_obj,
                filename=file_obj.name,
                file_size=file_obj.size
            )
            
            # Log file path and URL for debugging
            logger.info(f"File saved as: {instance.file.name}")
            logger.info(f"File URL: {instance.file_url}")
        else:
            serializer.save(user=self.request.user)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as default, unset any existing default
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # If this is set as default, unset any existing default
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(pk=serializer.instance.pk).update(is_default=False)
        serializer.save()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics for the current user
    """
    user = request.user
    
    # Get total number of files
    total_files = UploadedFile.objects.filter(user=user).count()
    
    # Get total size of all files
    total_size = UploadedFile.objects.filter(user=user).aggregate(
        total_size=models.Sum('file_size')
    )['total_size'] or 0
    
    # Get count of recently uploaded files (last 30 days)
    thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
    recent_files = UploadedFile.objects.filter(
        user=user,
        upload_date__gte=thirty_days_ago
    ).count()
    
    # Get file type breakdown
    file_types = {}
    # Extract file extensions from filenames
    user_files = UploadedFile.objects.filter(user=user)
    for file in user_files:
        if file.filename:
            ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown'
            file_types[ext] = file_types.get(ext, 0) + 1
    
    # Get files per user (only for the current user in this case)
    files_per_user = {
        user.username: total_files
    }
    
    # Prepare data for serializer
    data = {
        'total_files': total_files,
        'total_size': total_size,
        'recent_files': recent_files,
        'file_types': file_types,
        'files_per_user': files_per_user
    }
    
    serializer = FileStatsSerializer(data)
    return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
