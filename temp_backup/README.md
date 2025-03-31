# File Manager Application

A modern, secure file management system with user authentication, file upload/download functionality, analytics dashboard, and user profile management.

## Features

- **Secure Authentication**
  - Email/password login
  - Firebase authentication integration (optional)
  - Token-based API security

- **Comprehensive File Management**
  - Upload files with progress tracking
  - Download files with a simple click
  - View file details (name, type, size, upload date)
  - Organize and manage your documents

- **Powerful Dashboard**
  - View total files and storage used
  - Analyze file types with visual breakdowns
  - Track recent uploads and usage patterns

- **User Profile Management**
  - Edit personal information
  - Manage multiple addresses
  - Update contact details

- **Cloud Storage Integration**
  - AWS S3 for reliable file storage
  - Scalable architecture
  - Fast and reliable access

## System Architecture

### Backend (Django REST API)
- Django REST Framework for API endpoints
- PostgreSQL database for structured data
- AWS S3 integration for file storage
- Token-based authentication

### Frontend (React.js)
- Modern React with hooks and functional components
- Material-UI for responsive design
- Chart.js for analytics visualization
- Axios for API communication

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL (or SQLite for development)
- AWS account with S3 bucket (for production)

### Local Development Setup

#### Backend Setup
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Navigate to backend directory
cd filemanager/backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver 8002
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd filemanager/frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Deployment

This application is configured for easy deployment on Vercel for both frontend and backend:

- **Single Platform Deployment**: Both frontend and backend can be deployed on Vercel
- **Serverless Architecture**: Backend runs as serverless functions
- **Automatic Deployments**: Automatically deploys when you push to GitHub
- **Environment Configuration**: Easy environment variable management

For detailed deployment instructions, see:
- [Unified Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)
- [AWS S3 Setup Guide](./docs/AWS_SETUP.md)

## Configuration

See the [Configuration Guide](./docs/CONFIGURATION.md) for detailed information on setting up environment variables and application settings.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please contact the development team or open an issue in the repository. 