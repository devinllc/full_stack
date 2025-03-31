# File Manager Application

A modern file management application with secure authentication, file uploads to AWS S3, and user profile management.

## Features

- Secure authentication with token-based login
- File upload, download, and management capabilities
- AWS S3 integration for reliable cloud storage
- User profile management with address capabilities
- Modern React UI with Material-UI components

## System Architecture

- **Frontend**: React with Material-UI
- **Backend**: Django REST Framework
- **Storage**: AWS S3
- **Database**: PostgreSQL

## Prerequisites

- Python 3.8+
- Node.js 14+ and npm
- PostgreSQL
- AWS S3 bucket

## Local Development Setup

### Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd filemanager
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend` directory with the following variables:
   ```
   # Django settings
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   # Database settings
   DB_NAME=file_manager
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_HOST=localhost
   DB_PORT=5432

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
   AWS_S3_REGION_NAME=your-s3-region

   # CORS settings
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the Django server:
   ```
   python manage.py runserver 8002
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:8002
   ```

4. Start the development server:
   ```
   npm start
   ```

5. The application should now be running at [http://localhost:3000](http://localhost:3000)

## Deployment

### Backend Deployment

1. Set environment variables in your hosting environment
2. Configure CORS settings for your frontend domain
3. Set DEBUG=False for production
4. Configure a proper database for production
5. Use a WSGI server like Gunicorn

### Frontend Deployment

1. Build the frontend for production:
   ```
   npm run build
   ```
2. Deploy the contents of the build folder to your hosting service

## Environment Variables

### Backend

- `SECRET_KEY`: Django secret key
- `DEBUG`: Enable/disable debug mode
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: Database configuration
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_STORAGE_BUCKET_NAME`: S3 bucket name
- `AWS_S3_REGION_NAME`: S3 region
- `CORS_ALLOWED_ORIGINS`: Frontend URLs allowed to access the API

### Frontend

- `REACT_APP_API_URL`: Backend API URL

## Important Notes

- Make sure your S3 bucket is properly configured for your needs
- For S3 buckets with "Bucket owner enforced" Object Ownership, ACLs are disabled by default
- Always keep your credentials secure and never commit them to version control

## Troubleshooting

### S3 Permission Issues

If you encounter S3 permission issues:

1. Verify your AWS credentials are correct
2. Check your S3 bucket permissions
3. For buckets with Object Ownership set to "Bucket owner enforced", make sure the code doesn't try to set ACLs

### CORS Issues

If you encounter CORS issues:

1. Make sure your backend CORS settings include your frontend URL
2. Check the network tab in your browser's developer tools for specific CORS errors

## License

[MIT License](LICENSE) 