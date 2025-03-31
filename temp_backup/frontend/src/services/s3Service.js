import AWS from 'aws-sdk';

// Initialize AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION || 'ap-south-1'
});

const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME || 'trisha.vid.ip';

/**
 * Upload a file to AWS S3
 * @param {File} file - The file to upload
 * @param {string} path - The path/key where the file will be stored in S3
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export const uploadFileToS3 = async (file, path) => {
    const params = {
        Bucket: bucketName,
        Key: path || `uploads/${file.name}`,
        Body: file,
        ContentType: file.type,
        ACL: 'public-read'
    };

    const { Location } = await s3.upload(params).promise();
    return Location;
};

/**
 * Delete a file from AWS S3
 * @param {string} fileKey - The key/path of the file to delete in S3
 * @returns {Promise}
 */
export const deleteFileFromS3 = async (fileKey) => {
    const params = {
        Bucket: bucketName,
        Key: fileKey
    };

    return s3.deleteObject(params).promise();
};

/**
 * Get a signed URL for a file in S3 (for temporary access)
 * @param {string} fileKey - The key/path of the file in S3
 * @param {number} expiresIn - Expiration time in seconds (default: 60)
 * @returns {Promise<string>} - The signed URL
 */
export const getSignedUrl = async (fileKey, expiresIn = 60) => {
    const params = {
        Bucket: bucketName,
        Key: fileKey,
        Expires: expiresIn
    };

    return s3.getSignedUrlPromise('getObject', params);
};

const s3Service = {
    uploadFileToS3,
    deleteFileFromS3,
    getSignedUrl
};

export default s3Service; 