# Unified Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of your File Manager application on Vercel.

## Prerequisites

1. A **Vercel account** - Sign up at [vercel.com](https://vercel.com)
2. A **GitHub account** - Sign up at [github.com](https://github.com)
3. Your project code pushed to a GitHub repository
4. An AWS S3 bucket already set up (see [AWS Setup Guide](./AWS_SETUP.md))

## Part 1: Frontend Deployment

### Step 1: Connect Vercel to GitHub

1. Log in to your [Vercel account](https://vercel.com)
2. Click on the **"Add New..."** button and select **"Project"**
3. Under **"Import Git Repository"**, connect your GitHub account if you haven't already
4. Find and select your File Manager repository

### Step 2: Configure the Frontend Project

1. After selecting your repository, you'll see a configuration screen
2. Set the **Project Name** to something like `filemanager-frontend`
3. Set the **Framework Preset** to **React**
4. Set the **Root Directory** to `filemanager/frontend` (adjust if your structure is different)
5. Under **Build and Output Settings**:
   - Build command: `npm run build`
   - Output directory: `build`

### Step 3: Set Frontend Environment Variables

1. Expand the **Environment Variables** section
2. Add the following variables:
   - `REACT_APP_API_URL`: Leave this blank for now (we'll update it after backend deployment)
   - `REACT_APP_S3_BUCKET`: Your AWS S3 bucket name (e.g., `trisha.vid.ip`)
   - `REACT_APP_S3_REGION`: Your AWS S3 region (e.g., `ap-south-1`)

### Step 4: Deploy Frontend

1. Click the **Deploy** button
2. Vercel will start the deployment process
3. Wait for the build to complete (this may take a few minutes)
4. Note down your frontend URL (e.g., `https://filemanager-frontend.vercel.app`)

## Part 2: Backend Deployment

### Step 1: Prepare Your Django Backend for Vercel

1. Create a file named `vercel.json` in the root of your project with the following content:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "filemanager/backend/vercel_wsgi.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "filemanager/backend/vercel_wsgi.py"
    }
  ]
}
```

2. Create a file named `filemanager/backend/vercel_wsgi.py` with the following content:

```python
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
```

3. Update your `filemanager/backend/backend/settings.py` for production:

```python
# Add Vercel URL to ALLOWED_HOSTS
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.vercel.app', '.now.sh']

# Add CORS configuration for Vercel
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-url.vercel.app",  # Replace with your actual frontend URL
]

# Configure static files for Vercel
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Step 2: Create a Requirements File

Create or update your `requirements.txt` file in the `filemanager/backend` directory to include:

```
django==5.1.7
django-cors-headers
djangorestframework
django-storages
boto3
gunicorn
```

### Step 3: Create a New Vercel Project for Backend

1. Go back to Vercel dashboard
2. Click on the **"Add New..."** button and select **"Project"**
3. Select the same GitHub repository
4. Set the **Project Name** to something like `filemanager-backend`
5. Set the **Framework Preset** to **Other**
6. Leave the **Root Directory** as the repository root (not the backend directory)
7. Keep the default build settings

### Step 4: Set Backend Environment Variables

1. Expand the **Environment Variables** section
2. Add the following variables:
   - `SECRET_KEY`: A secure random string
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_STORAGE_BUCKET_NAME`: Your S3 bucket name
   - `AWS_S3_REGION_NAME`: Your S3 region
   - `CORS_ALLOWED_ORIGINS`: Your frontend Vercel URL (comma-separated if multiple)

### Step 5: Deploy Backend

1. Click the **Deploy** button
2. Vercel will start the deployment process
3. Wait for the build to complete
4. Note down your backend URL (e.g., `https://filemanager-backend.vercel.app`)

## Part 3: Connecting Frontend to Backend

### Step 1: Update Frontend Environment Variables

1. Go to your frontend project in Vercel dashboard
2. Click on **Settings** > **Environment Variables**
3. Find the `REACT_APP_API_URL` variable
4. Set its value to your backend URL (e.g., `https://filemanager-backend.vercel.app`)
5. Click **Save**

### Step 2: Redeploy Frontend

1. Go to the **Deployments** tab
2. Click on the three dots (...) next to your latest deployment
3. Select **Redeploy**
4. This will rebuild your frontend with the updated API URL

## Part 4: Final Configuration

### Update CORS Settings in Backend

1. Go to your backend settings.py file in your repository
2. Find the `CORS_ALLOWED_ORIGINS` setting
3. Add your frontend URL to the list
4. Commit and push the changes
5. This will trigger a redeployment on Vercel

### Configure S3 CORS for Production

Make sure your AWS S3 CORS configuration includes your production domains:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000", 
      "https://your-frontend-url.vercel.app"
    ],
    "ExposeHeaders": []
  }
]
```

## Firebase Configuration

After deploying the application, you'll need to set up Firebase credentials:

## Option 1: Add Firebase Credentials File (Recommended)

1. Once your application is deployed, navigate to the backend directory on your server
2. Create a file named `firebase-credentials.json` with the following content:

```json
{
    "type": "service_account",
    "project_id": "filemanagerss",
    "private_key_id": "97adb5d0b2c5fcbe8ed6933415872046450acf2a",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqIfzyEF7OIvLu\nyqu3aNOaposyw5CDOx5phHPN666+mGLzPMMazaM/QRxUE4ZXkBuwVdffSkCUhy+b\nNHuuYlmEkp4tGuxZW6P4DdsKCsmBCw45tVmSANn2E1os+/SQcpdL5mgzXn3SfL3k\nRuGiEEZq5faQQSTXCv99xyt0Whp/bu4t1KYJOCuWJtZB574IWUa7Jj5PhqQLQN7Z\nTEXm1smZl5NgpFDbO1qE45yc3xQbcIMvFmZisxoCDiTvSWl493pB2HyKdClPKnmZ\ntR02+cKPJsJ/FTNRjIrqO0NvfP/HdHN+xhpIxEMXzcQvw7r8UIECO/K5ewGnAbbr\nlr+Q/BSnAgMBAAECggEAF1juCcNeBJ3ehrnrZ2e2+kHMAnMSBuBQY8dDI8l/GTV3\nsXeaMrhw+azpbU73SwGXZdMx+mOJ30LPXADkzuE89ajalMgIEpnf3kT7Kof2b9i2\nOAx/YT5FVbQBgQDb5rgYXoMdCPJOWVoNrnZdCnd/TQuH6Eii/JvMGf+rd/PRhRaD\njNPJIJyldSRL2f8ydG3T0NMtLHiNIRHvQtvYMSg6i9aKhYS23SoqBq0grdNV0PHK\nNHqKkDNrAxVUBKQD3WPVZ5af1clvcOgeLuvKlOlz9a6AH3kgP/q+ERRnRSFlayVG\nyyRBHZfI9K4FmhgxHEpsIY0q5NNrutQwUrl/AazQmQKBgQDkcbFRWV4WR7PunBec\n2+Tyx6xJa82PfdI/TV1MI8dPAEHEQYHzJP8tGRIUjz4rrF3IX/1mpYpCyJ8WbdI7\nlIkrxT77+7ho05amhz7lM4mJIwV9yBMKjm/PLhUi/ix/ai9OG0Riy0d03S/LDwqr\np73aJBQvtwwR6k55U0snnRewZQKBgQC+p6criPKIQISLJhduAomEe8FJ4pBSMFeM\nT32tFB/zBVFDdEij0FYQr6KtpYsE/DrvsDYgXdUhUAZhYruCEbeKwzDRF0A1pti0\nulYk3YNicgJN/E2IE8MFgD8NOTEn6OgRpqJR+xDtt2fuGWnT8wAdO7qAnv0Nov1U\nTXLHH3nyGwKBgQCm/LyjPHJcUvmiOBPCo7LODUtROC5A77Zac5D5cUXl58grT79Q\nHwEw1By1TqghgJPlPtWazPMuMjyoRorg5okGp96Mj8qTReffvwkove2RgzomYbQZ\niVkN1x+4PpgEY3hE3gW1Oeb39B9VjZ89LxbGeI0Q+/sktWO7qDlNsbV5SQKBgQCX\n0jHQ/TEFRztFA4RM2kBf+5ykFYMPr+dHmFVf6lK211kq+gKOUGz4xKQq21SlF6Zn\nEE9J3u7FpFAwZMskfK9IFL9fAcDj+IVBBdFrceoaDue+6ldjMTlvu/x5rz1xpoqG\n48cGuYN1iUN920bmvO8uWE3f9rtUjKJm63WnE22sWQKBgQC0puG2Vp64eVwAdt+e\ndzsT/YcxxD5yeyWoXqvpUgDsA+H4DjbGG1tiBb0mIAB6dNAvcaZafvuY4xEeb+KM\noTT9zOd5HqvW1bTVAFVEzFvu27Dfl6Uv46wR7IdOKV/kwfx/XHZvcCYEwFBprfit\nCAXBswhcBDUK9WL3hUhiQhec0w==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@filemanagerss.iam.gserviceaccount.com",
    "client_id": "115884559446423160364",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40filemanagerss.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}
```

## Option 2: Use Environment Variables

Alternatively, you can set these Firebase credentials as environment variables in your Vercel project settings:

1. Go to your backend project in Vercel dashboard
2. Click on **Settings** > **Environment Variables**
3. Add the following environment variables (copy exactly as shown):

```
FIREBASE_PROJECT_ID=filemanagerss
FIREBASE_PRIVATE_KEY_ID=97adb5d0b2c5fcbe8ed6933415872046450acf2a
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqIfzyEF7OIvLu\nyqu3aNOaposyw5CDOx5phHPN666+mGLzPMMazaM/QRxUE4ZXkBuwVdffSkCUhy+b\nNHuuYlmEkp4tGuxZW6P4DdsKCsmBCw45tVmSANn2E1os+/SQcpdL5mgzXn3SfL3k\nRuGiEEZq5faQQSTXCv99xyt0Whp/bu4t1KYJOCuWJtZB574IWUa7Jj5PhqQLQN7Z\nTEXm1smZl5NgpFDbO1qE45yc3xQbcIMvFmZisxoCDiTvSWl493pB2HyKdClPKnmZ\ntR02+cKPJsJ/FTNRjIrqO0NvfP/HdHN+xhpIxEMXzcQvw7r8UIECO/K5ewGnAbbr\nlr+Q/BSnAgMBAAECggEAF1juCcNeBJ3ehrnrZ2e2+kHMAnMSBuBQY8dDI8l/GTV3\nsXeaMrhw+azpbU73SwGXZdMx+mOJ30LPXADkzuE89ajalMgIEpnf3kT7Kof2b9i2\nOAx/YT5FVbQBgQDb5rgYXoMdCPJOWVoNrnZdCnd/TQuH6Eii/JvMGf+rd/PRhRaD\njNPJIJyldSRL2f8ydG3T0NMtLHiNIRHvQtvYMSg6i9aKhYS23SoqBq0grdNV0PHK\nNHqKkDNrAxVUBKQD3WPVZ5af1clvcOgeLuvKlOlz9a6AH3kgP/q+ERRnRSFlayVG\nyyRBHZfI9K4FmhgxHEpsIY0q5NNrutQwUrl/AazQmQKBgQDkcbFRWV4WR7PunBec\n2+Tyx6xJa82PfdI/TV1MI8dPAEHEQYHzJP8tGRIUjz4rrF3IX/1mpYpCyJ8WbdI7\nlIkrxT77+7ho05amhz7lM4mJIwV9yBMKjm/PLhUi/ix/ai9OG0Riy0d03S/LDwqr\np73aJBQvtwwR6k55U0snnRewZQKBgQC+p6criPKIQISLJhduAomEe8FJ4pBSMFeM\nT32tFB/zBVFDdEij0FYQr6KtpYsE/DrvsDYgXdUhUAZhYruCEbeKwzDRF0A1pti0\nulYk3YNicgJN/E2IE8MFgD8NOTEn6OgRpqJR+xDtt2fuGWnT8wAdO7qAnv0Nov1U\nTXLHH3nyGwKBgQCm/LyjPHJcUvmiOBPCo7LODUtROC5A77Zac5D5cUXl58grT79Q\nHwEw1By1TqghgJPlPtWazPMuMjyoRorg5okGp96Mj8qTReffvwkove2RgzomYbQZ\niVkN1x+4PpgEY3hE3gW1Oeb39B9VjZ89LxbGeI0Q+/sktWO7qDlNsbV5SQKBgQCX\n0jHQ/TEFRztFA4RM2kBf+5ykFYMPr+dHmFVf6lK211kq+gKOUGz4xKQq21SlF6Zn\nEE9J3u7FpFAwZMskfK9IFL9fAcDj+IVBBdFrceoaDue+6ldjMTlvu/x5rz1xpoqG\n48cGuYN1iUN920bmvO8uWE3f9rtUjKJm63WnE22sWQKBgQC0puG2Vp64eVwAdt+e\ndzsT/YcxxD5yeyWoXqvpUgDsA+H4DjbGG1tiBb0mIAB6dNAvcaZafvuY4xEeb+KM\noTT9zOd5HqvW1bTVAFVEzFvu27Dfl6Uv46wR7IdOKV/kwfx/XHZvcCYEwFBprfit\nCAXBswhcBDUK9WL3hUhiQhec0w==\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@filemanagerss.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=115884559446423160364
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40filemanagerss.iam.gserviceaccount.com
```

4. Click **Save** and redeploy your backend

Both methods will ensure Firebase authentication works correctly after deployment.

## Troubleshooting

1. **Database Issues**: 
   - Vercel's serverless environment doesn't support persistent databases. Consider using a database service like Supabase, Neon, or MongoDB Atlas.

2. **API Connection Problems**:
   - Check browser console for CORS errors
   - Verify your CORS settings in Django
   - Make sure the API URL in frontend environment variables is correct

3. **S3 Upload Issues**:
   - Verify AWS credentials are correctly set
   - Check S3 bucket permissions and CORS settings

4. **Function Execution Timeout**:
   - Vercel serverless functions have execution time limits. If operations take too long, consider optimizing or using a different hosting solution for the backend.

## Ongoing Maintenance

When you make changes to your code:
1. Push the changes to your GitHub repository
2. Vercel will automatically detect the changes and redeploy your application

Remember that environment variables set in the Vercel dashboard will override any in your code, so update them there if needed. 