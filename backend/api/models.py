import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

def user_directory_path(instance, filename):
    # File will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f'user_{instance.user.id}/{filename}'

class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    # Add custom fields here

    def __str__(self):
        return self.username

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='USA')
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.state}, {self.postal_code}"

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
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='other')
    file_size = models.IntegerField(default=0)
    file_url = models.URLField(max_length=1000, blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.file_type:
            self.file_type = self.get_file_type()
        if not self.filename and self.file:
            self.filename = os.path.basename(self.file.name)
        if self.file and not self.file_size and hasattr(self.file, 'size'):
            self.file_size = self.file.size
        
        # Save the model instance first
        super().save(*args, **kwargs)
        
        # Update the file_url after saving
        if self.file and not self.file_url:
            try:
                self.file_url = self.file.url
                # Use update to avoid another save cycle
                self.__class__.objects.filter(pk=self.pk).update(file_url=self.file_url)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting file URL: {str(e)}")
    
    def delete(self, *args, **kwargs):
        # Delete the file from S3 before deleting the database record
        if self.file:
            try:
                self.file.delete(save=False)
            except Exception as e:
                # Log the error but continue with deletion
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting file from storage: {str(e)}")
        super().delete(*args, **kwargs)
    
    def get_file_type(self):
        if not self.file:
            return 'other'
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
