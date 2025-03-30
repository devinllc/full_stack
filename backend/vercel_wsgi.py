import os
from django.core.wsgi import get_wsgi_application

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Set environment variables for production
os.environ['DEBUG'] = 'False'

# Get the WSGI application
application = get_wsgi_application()

# Vercel expects a lambda function handler
def handler(request, **kwargs):
    return application(request, **kwargs) 