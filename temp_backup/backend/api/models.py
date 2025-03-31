from django.db import models
from django.contrib.auth.models import AbstractUser
import os
import uuid
from django.conf import settings

class User(AbstractUser):
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.username

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.state}"

def user_directory_path(instance, filename):
    """
    File will be uploaded to S3 at uploads/user_<id>/<filename>
    """
    # Keep the original extension
    ext = filename.split('.')[-1]
    
    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}.{ext}"
    
    # Return path relative to media location
    return f"user_{instance.user.id}/{unique_filename}"

class UploadedFile(models.Model):
    FILE_TYPES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('txt', 'Text'),
        ('docx', 'Word'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=user_directory_path)
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    file_size = models.IntegerField(default=0)
    file_url = models.URLField(max_length=1000, blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.file_type:
            self.file_type = self.get_file_type()
        if not self.filename:
            self.filename = os.path.basename(self.file.name)
        if self.file and not self.file_size and hasattr(self.file, 'size'):
            self.file_size = self.file.size
        
        # Save the model instance
        super().save(*args, **kwargs)
        
        # Update the file_url after saving to ensure S3 URL is set correctly
        if self.file and not self.file_url:
            # Use the proper S3 URL format
            s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{settings.AWS_MEDIA_LOCATION}/{self.file.name}"
            self.file_url = s3_url
            self.__class__.objects.filter(pk=self.pk).update(file_url=self.file_url)
    
    def delete(self, *args, **kwargs):
        # Delete the file from S3 before deleting the database record
        if self.file:
            try:
                self.file.delete(save=False)
            except Exception:
                pass
        super().delete(*args, **kwargs)
    
    def get_file_type(self):
        extension = os.path.splitext(self.file.name)[1].lower()
        if extension == '.pdf':
            return 'pdf'
        elif extension in ['.xlsx', '.xls']:
            return 'excel'
        elif extension == '.txt':
            return 'txt'
        elif extension in ['.doc', '.docx']:
            return 'docx'
        else:
            return 'other'
    
    def __str__(self):
        return self.filename
