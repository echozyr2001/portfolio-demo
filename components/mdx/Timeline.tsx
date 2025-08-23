/**
 * Timeline Component
 * 
 * A flexible timeline component for displaying chronological events
 */

"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';

/**
 * Timeline item interface
 */
interface TimelineItem {
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Date or time period */
  date: string;
  /** Item type/category */
  type?: string;
  /** Item status */
  status?: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  /** Custom icon */
  icon?: React.ReactNode;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Whether this item is highlighted */
  highlighted?: boolean;
}

/**
 * Timeline component props
 */
interface TimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  /** Timeline orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Timeline variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Show connecting lines */
  showConnectors?: boolean;
  /** Custom className */
  className?: string;
  /** Timeline title */
  title?: string;
}

/**
 * Get status configuration
 */
function getStatusConfig(status: TimelineItem['status']) {
  const configs = {
    completed: {
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    'in-progress': {
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    planned: {
      color: 'bg-gray-400',
      textColor: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      borderColor: 'border-gray-200 dark:border-gray-700'
    },
    cancelled: {
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  };

  return configs[status || 'completed'];
}

/**
 * Default icons for different statuses
 */
function getDefaultIcon(status: TimelineItem['status']) {
  const icons = {
    completed: (
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
    'in-progress': (
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    planned: (
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
    cancelled: (
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    )
  };

  return icons[status || 'completed'];
}

/**
 * Timeline Item Component
 */
function TimelineItemComponent({ 
  item, 
  isLast, 
  showConnectors, 
  variant 
}: { 
  item: TimelineItem; 
  isLast: boolean; 
  showConnectors: boolean; 
  variant: TimelineProps['variant'];
}) {
  const statusConfig = getStatusConfig(item.status);
  const icon = item.icon || getDefaultIcon(item.status);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 py-2">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
          ${statusConfig.color}
          ${item.highlighted ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        `}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{item.title}</h4>
            <span className="text-xs text-gray-500 flex-shrink-0">{item.date}</span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Connector line */}
      {showConnectors && !isLast && (
        <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Icon */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10
        ${statusConfig.color}
        ${item.highlighted ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}
      `}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.date}
            </span>
            {item.type && (
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(item.metadata).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Timeline Component
 */
export function Timeline({
  items,
  orientation = 'vertical',
  variant = 'default',
  showConnectors = true,
  className = '',
  title,
  ...props
}: TimelineProps) {
  if (!items || items.length === 0) {
    return null;
  }

  if (orientation === 'horizontal') {
    return (
      <div className={`my-8 ${className}`} {...props}>
        {title && (
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        )}
        
        <div className="flex overflow-x-auto pb-4 gap-6">
          {items.map((item, index) => {
            const statusConfig = getStatusConfig(item.status);
            const icon = item.icon || getDefaultIcon(item.status);
            
            return (
              <div key={index} className="flex-shrink-0 w-64">
                <div className="text-center">
                  {/* Icon */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3
                    ${statusConfig.color}
                    ${item.highlighted ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}
                  `}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {showConnectors && index < items.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical timeline
  return (
    <div className={`my-8 ${className}`} {...props}>
      {title && (
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      
      <div className="space-y-0">
        {items.map((item, index) => (
          <TimelineItemComponent
            key={index}
            item={item}
            isLast={index === items.length - 1}
            showConnectors={showConnectors}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

// Export types
export type { TimelineProps, TimelineItem };