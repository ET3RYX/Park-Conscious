import axios from 'axios';

/**
 * Reusable utility for direct frontend-to-Cloudinary image uploads.
 * Bypasses Vercel body-size limits and timeout issues.
 * 
 * @param {File} file - The file object from a file input
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlyx0r3nn';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'park_conscious';

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data && response.data.secure_url) {
      console.log('%c[CLOUDINARY_NEXUS] Media Uplink Established:', 'color: #10b981; font-weight: bold;', response.data.secure_url);
      return response.data.secure_url;
    } else {
      throw new Error('Failed to retrieve secure URL from Cloudinary response.');
    }
  } catch (error) {
    console.error('[CLOUDINARY_UPLOAD_ERROR]:', error);
    const message = error.response?.data?.error?.message || error.message || 'Unknown upload error.';
    throw new Error(`Cloudinary Upload Failed: ${message}`);
  }
};

const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150 MB

/**
 * Upload a video file directly to Cloudinary.
 * @param {File} file - A video File object
 * @returns {Promise<string>} - The secure URL of the uploaded video
 */
export const uploadVideoToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlyx0r3nn';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'park_conscious';

  if (!file) throw new Error('No file provided for upload.');
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`Video is too large (max 150 MB). Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (response.data?.secure_url) {
      console.log('%c[CLOUDINARY_NEXUS] Video Uplink Established:', 'color: #6366f1; font-weight: bold;', response.data.secure_url);
      return response.data.secure_url;
    }
    throw new Error('Failed to retrieve secure URL from Cloudinary response.');
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message || 'Unknown upload error.';
    throw new Error(`Cloudinary Video Upload Failed: ${message}`);
  }
};
