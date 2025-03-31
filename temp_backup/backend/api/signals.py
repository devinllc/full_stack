from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import UploadedFile
import os

@receiver(pre_delete, sender=UploadedFile)
def delete_file_on_model_delete(sender, instance, **kwargs):
    """
    Delete the file from the filesystem when the UploadedFile instance is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path) 