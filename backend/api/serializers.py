from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address, UploadedFile, User
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number']
        read_only_fields = ['id', 'email']  # Don't allow email changes via PATCH

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'postal_code', 'country', 'is_default', 'user']
        read_only_fields = ['user']

class UploadedFileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    file_url = serializers.URLField(read_only=True)
    file_size = serializers.IntegerField(read_only=True, required=False)
    file_type = serializers.CharField(required=False)  # Make file_type optional
    filename = serializers.CharField(required=False)  # Make filename optional
    
    class Meta:
        model = UploadedFile
        fields = ['id', 'user', 'file', 'filename', 'file_type', 'file_size', 'file_url', 'upload_date']
        read_only_fields = ['id', 'user', 'file_url', 'upload_date']

class UserRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}
        
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class FileStatsSerializer(serializers.Serializer):
    total_files = serializers.IntegerField()
    total_size = serializers.IntegerField()
    recent_files = serializers.IntegerField()
    file_types = serializers.DictField(child=serializers.IntegerField())
    files_per_user = serializers.DictField(child=serializers.IntegerField()) 