# Configuration Guide for File Manager Application

This guide explains how to configure the File Manager application for different environments and scenarios.

## Environment Variables

### Backend Environment Variables

The backend application requires several environment variables to be set up. Create a `.env` file in the `backend` directory by copying the provided `.env.sample` file.

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `'django-insecure-random-string'` |
| `DEBUG` | Debug mode (set to False in production) | `True` or `False` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `localhost,127.0.0.1,yourdomain.com` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `'AKIAXXXXXXXXXX'` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `'xxxxxxxxxxxxxx'` |
| `AWS_STORAGE_BUCKET_NAME` | S3 bucket name | `'your-bucket-name'` |
| `AWS_S3_REGION_NAME` | AWS region for S3 bucket | `'us-east-1'` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `'your-project-id'` |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | `'your-private-key-id'` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key with newlines | `'-----BEGIN PRIVATE KEY-----\nYOUR_KEY_CONTENT\n-----END PRIVATE KEY-----\n'` |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | `'firebase-adminsdk-xxx@project.iam.gserviceaccount.com'` |
| `FIREBASE_CLIENT_ID` | Firebase client ID | `'your-client-id'` |
| `FIREBASE_CLIENT_CERT_URL` | Firebase client certificate URL | `'https://www.googleapis.com/robot/v1/metadata/x509/...'` |

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory by copying the provided `.env.sample` file.

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `'http://localhost:8000'` |
| `REACT_APP_AWS_ACCESS_KEY_ID` | AWS access key | `'AKIAXXXXXXXXXX'` |
| `REACT_APP_AWS_SECRET_ACCESS_KEY` | AWS secret key | `'xxxxxxxxxxxxxx'` |
| `REACT_APP_AWS_REGION` | AWS region | `'us-east-1'` |
| `REACT_APP_AWS_BUCKET_NAME` | S3 bucket name | `'your-bucket-name'` |
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key | `'your-api-key'` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `'your-project.firebaseapp.com'` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID | `'your-project-id'` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `'your-project.appspot.com'` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `'your-sender-id'` |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID | `'your-app-id'` |

## Setting Up Environment Variables

### Local Development

For local development, create `.env` files in both the `backend` and `frontend` directories, based on the provided `.env.sample` files.

Example `.env` file for backend:
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=your-s3-region
```

### Production Environment

In production, set these environment variables according to your hosting platform's instructions. For example:

- **Heroku**: Set environment variables in the dashboard or using the CLI.
- **AWS Elastic Beanstalk**: Use the console or configuration files.
- **Docker**: Include in docker-compose.yml or pass at runtime.
- **Vercel**: Set in the project settings.

## Backend Configuration (Django)

### Essential Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `'your-secret-key'` |
| `DEBUG` | Debug mode (set to False in production) | `False` |
| `ALLOWED_HOSTS` | List of allowed hosts | `['example.com', 'www.example.com']` |
| `DATABASE_URL` | Database connection string | `'postgres://user:password@localhost/dbname'` |

### AWS S3 Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `'AKIAXXXXXXXXXX'` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `'xxxxxxxxxxxxxx'` |
| `AWS_STORAGE_BUCKET_NAME` | S3 bucket name | `'your-bucket-name'` |
| `AWS_S3_REGION_NAME` | S3 region | `'ap-south-1'` |
| `AWS_S3_CUSTOM_DOMAIN` | Custom domain for S3 (optional) | `'your-bucket.s3.amazonaws.com'` |
| `AWS_MEDIA_LOCATION` | Media folder in S3 | `'uploads'` |

### CORS Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ALLOWED_ORIGINS` | List of allowed origins | `['https://yourdomain.com']` |
| `CORS_ALLOW_CREDENTIALS` | Allow credentials | `True` |

### Example `.env` File for Development

```
SECRET_KEY=your-dev-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@localhost/filemanager

AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=ap-south-1
AWS_MEDIA_LOCATION=uploads

CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=True
```

## Frontend Configuration (React)

### Essential Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `'https://api.example.com'` |
| `REACT_APP_S3_BUCKET` | S3 bucket name | `'your-bucket-name'` |
| `REACT_APP_S3_REGION` | S3 region | `'ap-south-1'` |

### Example `.env` File for Development

```
REACT_APP_API_URL=http://localhost:8002
REACT_APP_S3_BUCKET=your-bucket-name
REACT_APP_S3_REGION=ap-south-1
```

## Database Configuration

The application uses PostgreSQL as its default database. The connection is configured through the `DATABASE_URL` environment variable.

### Local Development Database

For local development, you can:

1. Install PostgreSQL locally
2. Use Docker to run a PostgreSQL container
3. Use SQLite for simple development (not recommended for production)

### Example Local PostgreSQL Setup

```bash
# Create a database
createdb filemanager

# Set environment variable
export DATABASE_URL=postgres://localhost/filemanager
```

## Security Best Practices

1. **Never commit sensitive information** (like secret keys, passwords) to your code repository
2. Use different secret keys for development and production
3. Restrict CORS origins to only the domains that need to access your API
4. Regularly rotate your AWS access keys
5. Use HTTPS for all production traffic

## Deployment Configuration

See the following guides for platform-specific deployment configurations:

- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Backend Deployment Guide](./BACKEND_DEPLOYMENT.md)
- [AWS Setup Guide](./AWS_SETUP.md)

## Troubleshooting Common Configuration Issues

### "Access Denied" Errors with S3

1. Check your AWS credentials
2. Verify bucket permissions
3. Check your CORS configuration

### Database Connection Issues

1. Verify the database URL format
2. Check if the database server is running
3. Make sure the credentials are correct

### CORS Issues

1. Verify the `CORS_ALLOWED_ORIGINS` setting includes your frontend domain
2. Check for http vs https mismatch
3. Use developer tools network tab to see the exact CORS error

## Getting Help

If you need assistance with configuration, please contact the development team or consult the project's documentation repository. 