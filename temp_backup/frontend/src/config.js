// API URL Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002';

// S3 Configuration
const S3_BUCKET = process.env.REACT_APP_S3_BUCKET || 'trisha.vid.ip';
const S3_REGION = process.env.REACT_APP_S3_REGION || 'ap-south-1';

// Export configuration
export default API_URL;
export { S3_BUCKET, S3_REGION }; 