import UserImage from '@/models/UserImage';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Recursively scans an object for Cloudinary URLs that might be in the UserImage collection
 * and marks them as isTemporary: false.
 * @param {Object} data - The object to scan (e.g., customDesign object)
 */
export async function finalizeImagesInObject(data) {
  if (!data || typeof data !== 'object') return;

  const urls = [];
  const publicIds = [];
  const seen = new Set();

  // Helper to extract URLs and Public IDs
  const extractInfo = (obj) => {
    if (!obj || seen.has(obj)) return;
    
    // Only track objects and arrays for recursion
    if (typeof obj === 'object') {
      seen.add(obj);
    }

    if (typeof obj === 'string') {
      if (obj.includes('cloudinary.com') || obj.startsWith('http')) {
        urls.push(obj);
        
        // Extract publicId if it's a Cloudinary URL
        if (obj.includes('cloudinary.com')) {
          try {
            const parts = obj.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
              let idParts = parts.slice(uploadIndex + 1);
              if (idParts[0].startsWith('v') && !isNaN(idParts[0].substring(1))) {
                idParts = idParts.slice(1);
              }
              const lastPart = idParts[idParts.length - 1];
              const dotIndex = lastPart.lastIndexOf('.');
              if (dotIndex !== -1) {
                idParts[idParts.length - 1] = lastPart.substring(0, dotIndex);
              }
              publicIds.push(idParts.join('/'));
            }
          } catch (e) {
            console.error('Failed to extract publicId from URL:', obj);
          }
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(extractInfo);
    } else if (typeof obj === 'object') {
      // Don't scan huge internal objects like Mongoose models or buffers
      if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
        // If it's a Mongoose document, we should have ideally used .toObject() before passing
        // but as a safety, let's not recurse too deep into complex classes
        if (typeof obj.toObject === 'function') {
           const plain = obj.toObject();
           Object.values(plain).forEach(extractInfo);
           return;
        }
      }
      
      try {
        Object.values(obj).forEach(extractInfo);
      } catch (e) {
        // Fallback for objects that can't be easily iterated
      }
    }
  };

  extractInfo(data);

  if (urls.length > 0 || publicIds.length > 0) {
    try {
      // Mark all these images as permanent by matching URL OR publicId
      const result = await UserImage.updateMany(
        { 
          $or: [
            { url: { $in: urls } },
            { publicId: { $in: publicIds } }
          ],
          isTemporary: true 
        },
        { $set: { isTemporary: false } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Finalized ${result.modifiedCount} images.`);
      }
    } catch (err) {
      console.error('Failed to finalize images:', err);
    }
  }
}

/**
 * DEPRECATED/DISABLED: Deletes UserImage records where isTemporary: true.
 * This has been disabled per user request to ensure no images are lost.
 */
export async function cleanupTemporaryImages() {
  console.log('[Cleanup] Cleanup is currently disabled.');
  return { deletedCount: 0, status: 'disabled' };
}

/**
 * Utility to optimize Cloudinary URLs with auto format and quality.
 * Also handles trimming and basic sanitization.
 */
export function getOptimizedImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  const trimmedUrl = url.trim();
  
  // If it's already a full URL
  if (trimmedUrl.startsWith('http') && trimmedUrl.includes('cloudinary.com')) {
    if (trimmedUrl.includes('/upload/')) {
      const parts = trimmedUrl.split('/upload/');
      const prefix = parts[0];
      const suffix = parts[1];
      
      // Add f_auto,q_auto if not already present in the transformation chain
      if (!suffix.includes('f_auto') && !suffix.includes('q_auto')) {
        return `${prefix}/upload/f_auto,q_auto/${suffix}`;
      }
    }
    return trimmedUrl;
  }
  
  // If it looks like a Cloudinary public ID (no spaces, no dots except extension)
  if (!trimmedUrl.includes('/') && !trimmedUrl.includes(' ')) {
     const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dklavcjrl';
     return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${trimmedUrl}`;
  }

  return trimmedUrl;
}
