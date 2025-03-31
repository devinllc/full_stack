# AWS S3 Setup Guide for Non-Technical Users

This guide will walk you through setting up an AWS S3 bucket for file storage in your File Manager application. Amazon S3 (Simple Storage Service) is a cloud storage service that allows you to store and retrieve files.

## Prerequisites

1. An **AWS account** - Sign up at [aws.amazon.com](https://aws.amazon.com)

## Step 1: Sign in to AWS Management Console

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click on **"Sign In to the Console"** in the top-right corner
3. Enter your AWS account credentials

## Step 2: Create an S3 Bucket

1. Once logged in, search for **"S3"** in the search bar at the top
2. Click on **"S3"** in the search results
3. Click the **"Create bucket"** button
4. Fill in the following details:
   - **Bucket name**: Choose a unique name (e.g., `your-company-filemanager`)
   - **AWS Region**: Select a region close to your users (e.g., `ap-south-1` for India)
   - **Object Ownership**: Select **"ACLs disabled"**
   - **Block Public Access settings**: For security, keep all boxes checked to block public access
   - **Bucket Versioning**: Optional, but recommended for production use
   - **Default encryption**: Enable with **"Amazon S3 managed keys (SSE-S3)"**
5. Click **"Create bucket"** at the bottom of the page

## Step 3: Configure CORS (Cross-Origin Resource Sharing)

CORS allows your web application to interact with your S3 bucket:

1. From the S3 dashboard, click on your newly created bucket
2. Click on the **"Permissions"** tab
3. Scroll down to **"Cross-origin resource sharing (CORS)"** and click **"Edit"**
4. Enter the following CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": ["http://localhost:3000", "https://your-frontend-url.vercel.app"],
       "ExposeHeaders": []
     }
   ]
   ```
   Replace `https://your-frontend-url.vercel.app` with your actual frontend URL
5. Click **"Save changes"**

## Step 4: Create an IAM User for API Access

You need to create a user with programmatic access to your S3 bucket:

1. From the AWS Management Console, search for **"IAM"** and click on it
2. In the left sidebar, click on **"Users"**
3. Click **"Add users"**
4. Enter a username (e.g., `filemanager-app`)
5. Under **"Select AWS access type"**, check **"Access key - Programmatic access"**
6. Click **"Next: Permissions"**
7. Click **"Attach existing policies directly"**
8. Search for **"S3"** and select **"AmazonS3FullAccess"**
   - For production, consider creating a more restrictive custom policy
9. Click **"Next: Tags"** (no tags needed)
10. Click **"Next: Review"**
11. Click **"Create user"**
12. **IMPORTANT**: You will see the **Access key ID** and **Secret access key**. Copy both of these values and store them securely. You will not be able to see the secret access key again.

## Step 5: Update Application Settings

You'll need to update your application settings with the S3 configuration:

### For the Backend (Django):

In your `settings.py` file or environment variables:

```python
AWS_ACCESS_KEY_ID = 'your-access-key-id'
AWS_SECRET_ACCESS_KEY = 'your-secret-access-key'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
AWS_S3_REGION_NAME = 'your-selected-region'
```

### For the Frontend (React):

In your environment variables:

```
REACT_APP_S3_BUCKET=your-bucket-name
REACT_APP_S3_REGION=your-selected-region
```

## Security Best Practices

1. **Never commit AWS credentials to your code repository**
2. Use environment variables or secure secret management
3. Regularly rotate your access keys
4. Use the principle of least privilege - only grant necessary permissions
5. Enable MFA (Multi-Factor Authentication) for your AWS account

## Troubleshooting

1. **Access Denied errors**:
   - Check your IAM user permissions
   - Verify your access keys are correct

2. **CORS issues**:
   - Double-check your CORS configuration
   - Make sure your frontend URL is in the allowed origins

3. **Bucket not found**:
   - Verify your bucket name and region

## Cost Management

AWS S3 is not free, but costs are typically low for small to medium applications:

- Storage: ~$0.023 per GB per month
- Data transfer: Free for inbound, ~$0.09 per GB for outbound
- Requests: ~$0.005 per 1,000 requests

To monitor costs:
1. From the AWS Management Console, click on your account name in the top-right
2. Select **"Billing Dashboard"**
3. Use **"AWS Budgets"** to set up alerts for excessive spending

## Getting Help

If you need assistance, please contact the development team or consult the [AWS S3 documentation](https://docs.aws.amazon.com/s3/). 