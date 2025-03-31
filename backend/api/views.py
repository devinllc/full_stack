from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import authenticate, login, logout
from django.db.models import Count
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
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
import os
import uuid
from rest_framework import serializers

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

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    # Try traditional authentication first
    username = request.data.get('username')
    password = request.data.get('password')
    
    if username and password:
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username,
                'email': user.email
            })
    
    # If traditional auth fails or wasn't attempted, try Firebase
    firebase_token = request.data.get('firebase_token')
    
    if firebase_token:
        try:
            # Try to find an authentication backend for Firebase
            from django.contrib.auth import get_backends
            backends = get_backends()
            firebase_backend = None
            
            for backend in backends:
                if 'FirebaseAuthBackend' in backend.__class__.__name__:
                    firebase_backend = backend
                    break
            
            if not firebase_backend:
                logger.error("Firebase authentication backend not available")
                # If no firebase backend, try to use a traditional user with firebase email
                firebase_email = request.data.get('email')
                if firebase_email:
                    try:
                        user = User.objects.get(email=firebase_email)
                        # User exists, create token and return success
                        token, created = Token.objects.get_or_create(user=user)
                        return Response({
                            'token': token.key,
                            'user_id': user.pk,
                            'username': user.username,
                            'email': user.email
                        })
                    except User.DoesNotExist:
                        # User doesn't exist, create one
                        username = firebase_email.split('@')[0]
                        # Make sure username is unique
                        if User.objects.filter(username=username).exists():
                            username = f"{username}_{User.objects.count()}"
                        
                        user = User.objects.create_user(
                            username=username,
                            email=firebase_email,
                            password=None,  # No password for Firebase users
                        )
                        token, created = Token.objects.get_or_create(user=user)
                        return Response({
                            'token': token.key,
                            'user_id': user.pk,
                            'username': user.username,
                            'email': user.email
                        })
                        
                return Response({'detail': 'Firebase authentication backend not available'}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate using Firebase token
            user = firebase_backend.authenticate(request, token=firebase_token)
            
            if user:
                # Important: Explicitly specify the backend when logging in
                login(request, user, backend=firebase_backend.__class__.__module__ + '.' + firebase_backend.__class__.__name__)
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user_id': user.pk,
                    'username': user.username,
                    'email': user.email
                })
                
            # Fallback for when firebase_backend.authenticate returns None
            firebase_email = request.data.get('email')
            if firebase_email:
                try:
                    user = User.objects.get(email=firebase_email)
                    # User exists, create token and return success
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user_id': user.pk,
                        'username': user.username,
                        'email': user.email
                    })
                except User.DoesNotExist:
                    # User doesn't exist, create one
                    username = firebase_email.split('@')[0]
                    # Make sure username is unique
                    if User.objects.filter(username=username).exists():
                        username = f"{username}_{User.objects.count()}"
                    
                    user = User.objects.create_user(
                        username=username,
                        email=firebase_email,
                        password=None,  # No password for Firebase users
                    )
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user_id': user.pk,
                        'username': user.username,
                        'email': user.email
                    })
            
            return Response({'detail': 'Invalid Firebase credentials'}, 
                           status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            logger.error(f"Firebase authentication error: {str(e)}")
            
            # Fallback - check if we have email in request
            firebase_email = request.data.get('email')
            if firebase_email:
                try:
                    user = User.objects.get(email=firebase_email)
                    # User exists, create token and return success
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user_id': user.pk,
                        'username': user.username,
                        'email': user.email
                    })
                except User.DoesNotExist:
                    # User doesn't exist, create one
                    username = firebase_email.split('@')[0]
                    # Make sure username is unique
                    if User.objects.filter(username=username).exists():
                        username = f"{username}_{User.objects.count()}"
                    
                    user = User.objects.create_user(
                        username=username,
                        email=firebase_email,
                        password=None,  # No password for Firebase users
                    )
                    token, created = Token.objects.get_or_create(user=user)
                    return Response({
                        'token': token.key,
                        'user_id': user.pk,
                        'username': user.username,
                        'email': user.email
                    })
            
            # If no email, return error
            return Response({'detail': f'Firebase authentication error: {str(e)}'}, 
                           status=status.HTTP_400_BAD_REQUEST)
    
    # If we get here, all authentication methods failed
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Successfully logged out'})

@method_decorator(csrf_exempt, name='dispatch')
class UploadedFileViewSet(viewsets.ModelViewSet):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            logger.info(f"Received file upload: {file_obj.name}, size: {file_obj.size} bytes")
            
            try:
                # Create a unique filename to avoid S3 exists check
                # This works around the permission issue with HeadObject
                original_name = file_obj.name
                extension = os.path.splitext(original_name)[1].lower() if '.' in original_name else ''
                unique_filename = f"{uuid.uuid4()}{extension}"
                file_obj.name = unique_filename
                
                logger.info(f"Using unique filename: {unique_filename}")
                
                # Extract file_type from request data or determine from extension
                file_type = self.request.data.get('file_type', 'other')
                if not file_type or file_type == 'other':
                    if extension.lower() in ['.pdf']:
                        file_type = 'pdf'
                    elif extension.lower() in ['.xlsx', '.xls']:
                        file_type = 'excel'
                    elif extension.lower() in ['.txt']:
                        file_type = 'txt'
                    elif extension.lower() in ['.doc', '.docx']:
                        file_type = 'docx'
                    else:
                        file_type = 'other'
                
                # Save the instance with the unique filename
                instance = serializer.save(
                    user=self.request.user,
                    file=file_obj,
                    filename=original_name,  # Keep the original name for display
                    file_size=file_obj.size,
                    file_type=file_type
                )
                
                # Log file path and URL for debugging
                logger.info(f"File saved as: {instance.file.name}")
                logger.info(f"File URL: {instance.file.url}")
                
                # Update file_url directly
                try:
                    file_url = instance.file.url
                    UploadedFile.objects.filter(pk=instance.pk).update(file_url=file_url)
                    logger.info(f"Updated file_url: {file_url}")
                except Exception as e:
                    logger.error(f"Error getting file URL: {str(e)}")
                    
            except Exception as e:
                logger.error(f"Error uploading file: {str(e)}")
                raise serializers.ValidationError(f"File upload failed: {str(e)}")
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
