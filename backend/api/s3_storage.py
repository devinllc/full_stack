from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class S3MediaStorage(S3Boto3Storage):
    """
    Custom storage backend for AWS S3 media files.
    """
    location = settings.AWS_MEDIA_LOCATION
    file_overwrite = False 
    
    def get_available_name(self, name, max_length=None):
        """
        Returns a filename that's free on the target storage system, and
        available for new content to be written to.
        """
        # This is the standard method for getting a unique filename
        return super().get_available_name(name, max_length)
    
    def _save(self, name, content):
        """
        Save and retrieve the name of the file.
        """
        # Log the attempted save for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Saving file {name} to S3 bucket {settings.AWS_STORAGE_BUCKET_NAME} in location {self.location}")
        
        # Call the parent save method
        return super()._save(name, content) 