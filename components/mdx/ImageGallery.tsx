import React, { useState } from 'react';
import { MDXImage } from './MDXImage';

/**
 * 图片项接口
 */
interface GalleryImage {
  /** 媒体ID或图片URL */
  src: string;
  /** 替代文本 */
  alt: string;
  /** 图片标题 */
  title?: string;
  /** 图片描述 */
  description?: string;
  /** 是否为媒体ID */
  isMediaId?: boolean;
}

/**
 * 图片画廊组件属性接口
 */
interface ImageGalleryProps {
  /** 图片列表 */
  images: GalleryImage[];
  /** 列数（响应式） */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** 图片间距 */
  gap?: 'sm' | 'md' | 'lg';
  /** 是否启用灯箱模式 */
  enableLightbox?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 图片标题 */
  title?: string;
  /** 图片描述 */
  description?: string;
}

/**
 * 获取网格样式类名
 */
function getGridClasses(columns: ImageGalleryProps['columns'], gap: string) {
  const { sm = 1, md = 2, lg = 3 } = columns || {};
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return `grid grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} ${gapClasses[gap as keyof typeof gapClasses]}`;
}

/**
 * 灯箱模态框组件
 */
function LightboxModal({ 
  image, 
  isOpen, 
  onClose, 
  onPrevious, 
  onNext, 
  currentIndex, 
  totalImages 
}: {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalImages: number;
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
        aria-label="关闭灯箱"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 上一张按钮 */}
      {totalImages > 1 && (
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          aria-label="上一张图片"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 下一张按钮 */}
      {totalImages > 1 && (
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="下一张图片"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* 图片容器 */}
      <div 
        className="max-w-4xl max-h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {image.isMediaId ? (
          <MDXImage
            id={image.src}
            alt={image.alt}
            title={image.title}
            className="max-w-full max-h-full object-contain"
            priority={true}
            lazy={false}
          />
        ) : (
          <img
            src={image.src}
            alt={image.alt}
            title={image.title}
            className="max-w-full max-h-full object-contain"
          />
        )}
        
        {/* 图片信息 */}
        {(image.title || image.description) && (
          <div className="mt-4 text-center text-white">
            {image.title && (
              <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
            )}
            {image.description && (
              <p className="text-sm text-gray-300">{image.description}</p>
            )}
          </div>
        )}
        
        {/* 图片计数 */}
        {totalImages > 1 && (
          <div className="mt-4 text-center text-gray-300 text-sm">
            {currentIndex + 1} / {totalImages}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 图片画廊组件
 * 
 * 功能特性：
 * - 响应式网格布局
 * - 灯箱模式查看
 * - 键盘导航支持
 * - 支持媒体ID和直接URL
 * - 图片懒加载
 * - 无障碍访问支持
 */
export function ImageGallery({
  images,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 'md',
  enableLightbox = true,
  className = '',
  title,
  description,
  ...props
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 打开灯箱
  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  };

  // 关闭灯箱
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // 上一张图片
  const previousImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1);
    }
  };

  // 下一张图片
  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0);
    }
  };

  // 键盘事件处理
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    if (lightboxIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [lightboxIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`my-8 ${className}`} {...props}>
      {/* 画廊标题和描述 */}
      {(title || description) && (
        <div className="mb-6 text-center">
          {title && (
            <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* 图片网格 */}
      <div className={getGridClasses(columns, gap)}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`
              relative group overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800
              ${enableLightbox ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
            `}
            onClick={() => openLightbox(index)}
          >
            {/* 图片 */}
            {image.isMediaId ? (
              <MDXImage
                id={image.src}
                alt={image.alt}
                title={image.title}
                className="w-full h-full object-cover"
                showThumbnail={true}
              />
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                title={image.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* 悬停遮罩 */}
            {enableLightbox && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            )}

            {/* 图片标题（在图片上显示） */}
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">
                  {image.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 灯箱模态框 */}
      {enableLightbox && lightboxIndex !== null && (
        <LightboxModal
          image={images[lightboxIndex]}
          isOpen={true}
          onClose={closeLightbox}
          onPrevious={previousImage}
          onNext={nextImage}
          currentIndex={lightboxIndex}
          totalImages={images.length}
        />
      )}
    </div>
  );
}

// 导出类型
export type { ImageGalleryProps, GalleryImage };