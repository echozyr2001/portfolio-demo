/**
 * MediaService Usage Examples
 * 
 * This file demonstrates how to use the MediaService for processing
 * and storing media files with Base64 encoding.
 */

import { mediaService, MediaService } from './media-service';
import { formatFileSize, createMediaUrl, generateAltTextSuggestion } from './media-utils';

// Example 1: Basic file upload and processing
export async function uploadImageExample(file: File) {
  try {
    console.log(`Processing file: ${file.name} (${formatFileSize(file.size)})`);
    
    // Process and store the file
    const mediaRecord = await mediaService.processAndStore(file);
    
    console.log('File processed successfully:', {
      id: mediaRecord.id,
      filename: mediaRecord.filename,
      dimensions: `${mediaRecord.width}x${mediaRecord.height}`,
      optimizedSize: formatFileSize(mediaRecord.optimizedSize || 0),
      compressionRatio: `${Math.round((mediaRecord.compressionRatio || 1) * 100)}%`,
      blurhash: mediaRecord.blurhash,
    });
    
    return mediaRecord;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Example 2: Custom MediaService configuration
export function createCustomMediaService() {
  const customService = new MediaService({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    compressionQuality: 0.9, // Higher quality
    maxWidth: 2560, // 4K width
    maxHeight: 1440, // 4K height
    thumbnailSize: 300, // Larger thumbnails
  });
  
  return customService;
}

// Example 3: Batch processing multiple files
export async function batchUploadExample(files: File[]) {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await mediaService.processAndStore(file);
      results.push({ success: true, file: file.name, data: result });
    } catch (error) {
      results.push({ success: false, file: file.name, error: error.message });
    }
  }
  
  return results;
}

// Example 4: Generate media URLs for different use cases
export function generateMediaUrls(mediaId: string) {
  return {
    // Full size image
    full: createMediaUrl(mediaId),
    
    // Thumbnail version
    thumbnail: createMediaUrl(mediaId, { thumbnail: true }),
    
    // Metadata only
    info: createMediaUrl(mediaId, { info: true }),
  };
}

// Example 5: Create responsive image component data
export async function createResponsiveImageData(mediaId: string) {
  const mediaRecord = await mediaService.getMediaById(mediaId);
  
  if (!mediaRecord) {
    throw new Error('Media not found');
  }
  
  return {
    id: mediaRecord.id,
    src: createMediaUrl(mediaId),
    thumbnail: createMediaUrl(mediaId, { thumbnail: true }),
    alt: mediaRecord.alt || generateAltTextSuggestion(mediaRecord.originalName),
    width: mediaRecord.width,
    height: mediaRecord.height,
    blurhash: mediaRecord.blurhash,
    aspectRatio: mediaRecord.width && mediaRecord.height 
      ? mediaRecord.width / mediaRecord.height 
      : 1,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
}

// Example 6: Handle file upload in API route
export async function handleFileUploadInAPI(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Validate file before processing
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large (max 5MB)');
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // Process the file
  const mediaRecord = await mediaService.processAndStore(file);
  
  return {
    success: true,
    data: {
      id: mediaRecord.id,
      url: mediaRecord.url,
      filename: mediaRecord.filename,
      size: mediaRecord.size,
      dimensions: {
        width: mediaRecord.width,
        height: mediaRecord.height,
      },
      urls: generateMediaUrls(mediaRecord.id),
    },
  };
}

// Example 7: Media gallery management
export class MediaGallery {
  async getAllMedia(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    const mediaFiles = await mediaService.getAllMedia(limit, offset);
    
    return {
      items: mediaFiles.map(media => ({
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        size: formatFileSize(media.size),
        dimensions: `${media.width}x${media.height}`,
        createdAt: media.createdAt,
        urls: generateMediaUrls(media.id),
        alt: media.alt || generateAltTextSuggestion(media.originalName),
      })),
      pagination: {
        page,
        limit,
        total: mediaFiles.length,
        hasMore: mediaFiles.length === limit,
      },
    };
  }
  
  async deleteMedia(id: string) {
    await mediaService.deleteMedia(id);
    return { success: true, message: 'Media deleted successfully' };
  }
  
  async updateAltText(id: string, alt: string) {
    await mediaService.updateAltText(id, alt);
    return { success: true, message: 'Alt text updated successfully' };
  }
}

// Example 8: Error handling patterns
export async function safeMediaUpload(file: File) {
  try {
    return await mediaService.processAndStore(file);
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('File too large')) {
        return {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: 'Please choose a file smaller than 5MB',
        };
      }
      
      if (error.message.includes('File type not allowed')) {
        return {
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: 'Please upload a valid image file (JPEG, PNG, WebP, GIF)',
        };
      }
      
      if (error.message.includes('File is empty')) {
        return {
          success: false,
          error: 'EMPTY_FILE',
          message: 'The selected file is empty',
        };
      }
    }
    
    // Generic error
    return {
      success: false,
      error: 'UPLOAD_FAILED',
      message: 'Failed to upload file. Please try again.',
    };
  }
}

// Example 9: Integration with React components
export interface MediaComponentProps {
  mediaId: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export async function getMediaPropsForComponent(mediaId: string): Promise<{
  src: string;
  thumbnail: string;
  width: number;
  height: number;
  alt: string;
  blurhash: string;
}> {
  const media = await mediaService.getMediaById(mediaId);
  
  if (!media) {
    throw new Error(`Media with ID ${mediaId} not found`);
  }
  
  return {
    src: createMediaUrl(mediaId),
    thumbnail: createMediaUrl(mediaId, { thumbnail: true }),
    width: media.width || 0,
    height: media.height || 0,
    alt: media.alt || generateAltTextSuggestion(media.originalName),
    blurhash: media.blurhash || '',
  };
}

// Export the gallery instance
export const mediaGallery = new MediaGallery();