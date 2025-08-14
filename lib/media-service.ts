import sharp from 'sharp';
import { encode } from 'blurhash';
import { db } from './db';
import { media } from './schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Media processing configuration
interface MediaConfig {
  maxFileSize: number; // 5MB - Base64 storage limit
  allowedTypes: string[]; // Allowed MIME types
  compressionQuality: number; // 0.8 - Compression quality
  maxWidth: number; // 1920 - Maximum width
  maxHeight: number; // 1080 - Maximum height
  thumbnailSize: number; // 200 - Thumbnail size
}

// Optimized image data interface
interface OptimizedImageData {
  originalBase64: string;
  thumbnailBase64: string;
  width: number;
  height: number;
  size: number;
  optimizedSize: number;
  blurhash: string;
  compressionRatio: number;
}

// Media record interface
interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  storageType: 'base64' | 's3';
  base64Data: string | null;
  thumbnailBase64: string | null;
  s3Bucket: string | null;
  s3Key: string | null;
  s3Url: string | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
  alt: string | null;
  compressionRatio: number | null;
  optimizedSize: number | null;
  createdAt: Date;
}

export class MediaService {
  private static readonly DEFAULT_CONFIG: MediaConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ],
    compressionQuality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    thumbnailSize: 200,
  };

  private config: MediaConfig;

  constructor(config?: Partial<MediaConfig>) {
    this.config = { ...MediaService.DEFAULT_CONFIG, ...config };
  }

  /**
   * Process and store a file with Base64 encoding
   */
  async processAndStore(file: File): Promise<MediaRecord> {
    // 1. Validate file type and size
    this.validateFile(file);

    // 2. Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Optimize image
    const optimizedData = await this.optimizeImage(buffer, file.type);

    // 4. Generate unique filename and ID
    const id = nanoid();
    const filename = `${id}.${this.getFileExtension(file.name)}`;

    // 5. Create media record
    const mediaRecord: MediaRecord = {
      id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/api/media/${id}`, // API endpoint for serving media
      storageType: 'base64',
      base64Data: optimizedData.originalBase64,
      thumbnailBase64: optimizedData.thumbnailBase64,
      s3Bucket: null,
      s3Key: null,
      s3Url: null,
      width: optimizedData.width,
      height: optimizedData.height,
      blurhash: optimizedData.blurhash,
      alt: null,
      compressionRatio: optimizedData.compressionRatio,
      optimizedSize: optimizedData.optimizedSize,
      createdAt: new Date(),
    };

    // 6. Save to database
    await db.insert(media).values(mediaRecord);

    return mediaRecord;
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB.`);
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${this.config.allowedTypes.join(', ')}`);
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File is empty.');
    }
  }

  /**
   * Optimize image with compression and resizing
   */
  async optimizeImage(buffer: Buffer, mimeType: string): Promise<OptimizedImageData> {
    // Handle SVG files separately (no processing needed)
    if (mimeType === 'image/svg+xml') {
      const base64Data = buffer.toString('base64');
      return {
        originalBase64: base64Data,
        thumbnailBase64: base64Data, // SVG can be used as thumbnail
        width: 0, // SVG dimensions are flexible
        height: 0,
        size: buffer.length,
        optimizedSize: buffer.length,
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj', // Default blurhash for SVG
        compressionRatio: 1.0,
      };
    }

    // Process raster images with Sharp
    let sharpInstance = sharp(buffer);
    
    // Get original metadata
    const metadata = await sharpInstance.metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Calculate new dimensions while maintaining aspect ratio
    const { width: newWidth, height: newHeight } = this.calculateDimensions(
      originalWidth,
      originalHeight,
      this.config.maxWidth,
      this.config.maxHeight
    );

    // Optimize and compress the image
    const optimizedBuffer = await sharpInstance
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ 
        quality: Math.round(this.config.compressionQuality * 100),
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    // Generate thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(this.config.thumbnailSize, this.config.thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ 
        quality: 70,
        progressive: true,
      })
      .toBuffer();

    // Generate blurhash
    const blurhash = await this.generateBlurhash(thumbnailBuffer);

    // Convert to Base64
    const originalBase64 = optimizedBuffer.toString('base64');
    const thumbnailBase64 = thumbnailBuffer.toString('base64');

    // Calculate compression ratio
    const compressionRatio = optimizedBuffer.length / buffer.length;

    return {
      originalBase64,
      thumbnailBase64,
      width: newWidth,
      height: newHeight,
      size: buffer.length,
      optimizedSize: optimizedBuffer.length,
      blurhash,
      compressionRatio,
    };
  }

  /**
   * Generate blurhash for image placeholder
   */
  private async generateBlurhash(imageBuffer: Buffer): Promise<string> {
    try {
      // Resize to small dimensions for blurhash calculation
      const { data, info } = await sharp(imageBuffer)
        .resize(32, 32, { fit: 'cover' })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Generate blurhash
      const blurhash = encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        4, // X components
        4  // Y components
      );

      return blurhash;
    } catch (error) {
      console.error('Failed to generate blurhash:', error);
      // Return a default blurhash if generation fails
      return 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
    }
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth > originalHeight) {
      // Landscape orientation
      const width = Math.min(originalWidth, maxWidth);
      const height = Math.round(width / aspectRatio);
      return { width, height };
    } else {
      // Portrait orientation
      const height = Math.min(originalHeight, maxHeight);
      const width = Math.round(height * aspectRatio);
      return { width, height };
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || 'jpg' : 'jpg';
  }

  /**
   * Get media record by ID
   */
  async getMediaById(id: string): Promise<MediaRecord | null> {
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return result[0] || null;
  }

  /**
   * Delete media record
   */
  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  /**
   * Update media alt text
   */
  async updateAltText(id: string, alt: string): Promise<void> {
    await db.update(media)
      .set({ alt })
      .where(eq(media.id, id));
  }

  /**
   * Get all media records with pagination
   */
  async getAllMedia(limit: number = 50, offset: number = 0): Promise<MediaRecord[]> {
    return await db.select()
      .from(media)
      .limit(limit)
      .offset(offset)
      .orderBy(media.createdAt);
  }

  /**
   * Generate thumbnail from existing media
   */
  async regenerateThumbnail(id: string, size?: number): Promise<void> {
    const mediaRecord = await this.getMediaById(id);
    if (!mediaRecord || !mediaRecord.base64Data) {
      throw new Error('Media record not found or no base64 data available');
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(mediaRecord.base64Data, 'base64');
    
    // Generate new thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(size || this.config.thumbnailSize, size || this.config.thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 70, progressive: true })
      .toBuffer();

    const thumbnailBase64 = thumbnailBuffer.toString('base64');

    // Update database
    await db.update(media)
      .set({ thumbnailBase64 })
      .where(eq(media.id, id));
  }
}

// Export singleton instance
export const mediaService = new MediaService();

// Export types
export type { MediaRecord, OptimizedImageData, MediaConfig };