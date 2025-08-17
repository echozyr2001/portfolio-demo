import React, { useState, useEffect } from 'react';
import { MediaRecord } from '@/lib/media-service';

/**
 * MDX图片组件属性接口
 */
interface MDXImageProps {
  /** 媒体记录ID */
  id?: string;
  /** 图片源地址 */
  src?: string;
  /** 替代文本 */
  alt: string;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 是否优先加载 */
  priority?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示缩略图 */
  showThumbnail?: boolean;
  /** 是否启用懒加载 */
  lazy?: boolean;
  /** 图片标题 */
  title?: string;
  /** 是否作为内联元素渲染（不使用figure包装） */
  inline?: boolean;
}

/**
 * 生成Blurhash SVG占位符
 */
function generateBlurhashSVG(blurhash: string, width: number = 100, height: number = 100): string {
  // 简化的blurhash到SVG转换 - 生成渐变色占位符
  const colors = ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
  const gradientStops = colors.map((color, index) => 
    `<stop offset="${(index * 50)}%" stop-color="${color}"/>`
  ).join('');
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradientStops}
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;
}

/**
 * 获取媒体记录
 */
async function getMediaById(id: string): Promise<MediaRecord | null> {
  try {
    const response = await fetch(`/api/media/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load media:', error);
    return null;
  }
}

/**
 * MDX图片组件
 * 
 * 支持多种图片源：
 * 1. 媒体ID引用 - 通过id属性引用数据库中的媒体记录
 * 2. 直接URL - 通过src属性直接指定图片URL
 * 3. Base64数据 - 支持Base64编码的图片数据
 * 
 * 功能特性：
 * - Blurhash占位符
 * - 懒加载支持
 * - 缩略图预览
 * - 响应式设计
 * - 错误处理
 * - 暗色主题支持
 */
export function MDXImage({ 
  id,
  src,
  alt, 
  width, 
  height, 
  priority = false,
  className = '',
  showThumbnail = false,
  lazy = true,
  title,
  inline = false,
  ...props 
}: MDXImageProps) {
  const [mediaData, setMediaData] = useState<MediaRecord | null>(null);
  const [isLoading, setIsLoading] = useState(!!id); // 只有通过ID加载时才显示loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 如果提供了ID，从API加载媒体数据
  useEffect(() => {
    if (!id) return;

    async function loadMedia() {
      try {
        const media = await getMediaById(id!); // id is guaranteed to be defined here
        if (media) {
          setMediaData(media);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error('Failed to load media:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadMedia();
  }, [id]);

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // 处理图片加载错误
  const handleImageError = () => {
    setHasError(true);
    setImageLoaded(true);
  };

  // 如果正在加载媒体数据，显示骨架屏
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg ${className}`}
        style={{ 
          width: width || 800, 
          height: height || 400,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      >
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }

  // 如果加载失败，显示错误占位符
  if (hasError && !src) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center ${className}`}
        style={{ 
          width: width || 800, 
          height: height || 400,
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">图片加载失败</p>
          {alt && <p className="text-xs mt-1">{alt}</p>}
        </div>
      </div>
    );
  }

  // 确定图片源
  let imageSrc: string;
  let imageWidth: number | undefined;
  let imageHeight: number | undefined;
  let blurhash: string | undefined;

  if (mediaData) {
    // 使用媒体记录数据
    if (mediaData.storageType === 'base64' && mediaData.base64Data) {
      imageSrc = showThumbnail && mediaData.thumbnailBase64
        ? `data:${mediaData.mimeType};base64,${mediaData.thumbnailBase64}`
        : `data:${mediaData.mimeType};base64,${mediaData.base64Data}`;
    } else if (mediaData.storageType === 's3' && mediaData.s3Url) {
      imageSrc = mediaData.s3Url;
    } else {
      imageSrc = mediaData.url; // 回退到API端点
    }
    
    imageWidth = width || mediaData.width || undefined;
    imageHeight = height || mediaData.height || undefined;
    blurhash = mediaData.blurhash || undefined;
  } else if (src) {
    // 使用直接提供的src
    imageSrc = src;
    imageWidth = width;
    imageHeight = height;
  } else {
    // 没有有效的图片源
    return null;
  }

  // 如果是内联模式，直接返回img标签
  if (inline) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        title={title}
        width={imageWidth}
        height={imageHeight}
        className={`inline-block ${className} ${hasError ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
        {...props}
      />
    );
  }

  return (
    <figure className={`my-6 ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {/* Blurhash占位符 */}
        {!imageLoaded && blurhash && (
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              backgroundImage: `url("data:image/svg+xml;base64,${btoa(generateBlurhashSVG(blurhash, imageWidth, imageHeight))}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(5px)',
            }}
          />
        )}
        
        {/* 主图片 */}
        <img
          src={imageSrc}
          alt={alt}
          title={title}
          width={imageWidth}
          height={imageHeight}
          className={`
            w-full h-auto transition-opacity duration-300 
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            ${hasError ? 'hidden' : ''}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
          {...props}
        />
        
        {/* 加载指示器 */}
        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {/* 图片说明 */}
      {(title || alt) && (
        <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {title || alt}
        </figcaption>
      )}
    </figure>
  );
}

// 导出类型
export type { MDXImageProps };