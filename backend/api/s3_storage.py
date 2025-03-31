from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
import os
import logging

logger = logging.getLogger(__name__)

class NoCheckS3Storage(S3Boto3Storage):
    """
    Custom S3 storage class that bypasses the existence check
    to avoid the 403 Forbidden error on HeadObject operation.
    Also doesn't set ACLs since the bucket has ACLs disabled.
    """
    
    def __init__(self, *args, **kwargs):
        # Initialize with the media location
        kwargs['location'] = settings.AWS_MEDIA_LOCATION
        # Don't set ACL since bucket has object ownership enforced
        kwargs['default_acl'] = None
        super().__init__(*args, **kwargs)
    
    def get_available_name(self, name, max_length=None):
        """
        Override to skip the exists() check that causes the 403 error.
        Instead, we'll just use a new name to avoid conflicts.
        """
        if self.file_overwrite:
            return name
        
        # Generate a unique filename with the original extension
        base_name, extension = os.path.splitext(name)
        name = f"{base_name}_{os.urandom(8).hex()}{extension}"
        
        return name
        
    def exists(self, name):
        """
        Override to always return False - this avoids the Head request
        that checks if a file exists, which is causing the 403 error.
        """
        return False
        
    def _save(self, name, content):
        """
        Save the file to S3 without setting ACLs.
        """
        # Log the save for debugging
        logger.info(f"Saving file {name} to S3 using NoCheckS3Storage")
        
        # Make sure we don't try to set ACLs
        params = self.get_object_parameters(name)
        if 'ACL' in params:
            logger.info("Removing ACL parameter from S3 upload")
            del params['ACL']
            
        # Save without ACL
        return super()._save(name, content)

class S3MediaStorage(S3Boto3Storage):
    """
    Custom storage backend for AWS S3 media files.
    """
    location = settings.AWS_MEDIA_LOCATION
    file_overwrite = False
    
    def __init__(self, *args, **kwargs):
        # Don't set ACL since bucket has object ownership enforced
        kwargs['default_acl'] = None
        super().__init__(*args, **kwargs)
    
    def get_available_name(self, name, max_length=None):
        """
        Returns a filename that's free on the target storage system, and
        available for new content to be written to.
        """
        # This is the standard method for getting a unique filename
        return super().get_available_name(name, max_length)
    
    def _save(self, name, content):
        """
        Save and retrieve the name of the file without setting ACLs.
        """
        # Log the attempted save for debugging
        logger.info(f"Saving file {name} to S3 bucket {settings.AWS_STORAGE_BUCKET_NAME} in location {self.location}")
        
        # Make sure we don't try to set ACLs
        params = self.get_object_parameters(name)
        if 'ACL' in params:
            logger.info("Removing ACL parameter from S3 upload")
            del params['ACL']
        
        # Call the parent save method
        return super()._save(name, content) 