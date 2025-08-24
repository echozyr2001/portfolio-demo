'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MediaManager, type MediaFile } from './MediaManager'
import { Image, Plus, X } from 'lucide-react'

export interface MediaSelectorProps {
  // Selected media
  selectedMedia?: MediaFile[]
  
  // Configuration
  multiple?: boolean
  accept?: string[]
  maxFiles?: number
  
  // Callbacks
  onMediaSelect?: (media: MediaFile[]) => void
  onMediaUpload?: (files: File[]) => Promise<MediaFile[]>
  onMediaDelete?: (file: MediaFile) => Promise<void>
  onMediaUpdate?: (file: MediaFile, updates: Partial<MediaFile>) => Promise<void>
  
  // Data source
  availableMedia?: MediaFile[]
  
  // UI
  placeholder?: string
  className?: string
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  selectedMedia = [],
  multiple = false,
  accept = ['image/*'],
  maxFiles = 1,
  onMediaSelect,
  onMediaUpload,
  onMediaDelete,
  onMediaUpdate,
  availableMedia = [],
  placeholder = "Select media",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempSelection, setTempSelection] = useState<MediaFile[]>(selectedMedia)

  const handleConfirmSelection = () => {
    onMediaSelect?.(tempSelection)
    setIsOpen(false)
  }

  const handleRemoveMedia = (mediaToRemove: MediaFile) => {
    const newSelection = selectedMedia.filter(m => m.id !== mediaToRemove.id)
    onMediaSelect?.(newSelection)
  }

  const canAddMore = multiple && selectedMedia.length < maxFiles

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected Media Display */}
      {selectedMedia.length > 0 && (
        <div className="space-y-2">
          {multiple ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {selectedMedia.map((media) => (
                <div key={media.id} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {media.mimeType.startsWith('image/') ? (
                      <img
                        src={media.thumbnailUrl || media.url}
                        alt={media.alt || media.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMedia(media)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <p className="text-xs text-center mt-1 truncate" title={media.originalFilename}>
                    {media.originalFilename}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative group max-w-xs">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedMedia[0].mimeType.startsWith('image/') ? (
                  <img
                    src={selectedMedia[0].thumbnailUrl || selectedMedia[0].url}
                    alt={selectedMedia[0].alt || selectedMedia[0].filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveMedia(selectedMedia[0])}
              >
                <X className="h-3 w-3" />
              </Button>
              
              <p className="text-sm mt-2 text-muted-foreground">
                {selectedMedia[0].originalFilename}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selection Button */}
      {(selectedMedia.length === 0 || canAddMore) && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-solid"
              onClick={() => setTempSelection(selectedMedia)}
            >
              <Plus className="h-8 w-8" />
              <span>{selectedMedia.length === 0 ? placeholder : 'Add more media'}</span>
              {multiple && (
                <Badge variant="secondary" className="text-xs">
                  {selectedMedia.length}/{maxFiles}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Select Media</span>
                <div className="flex items-center gap-2">
                  {tempSelection.length > 0 && (
                    <Badge variant="secondary">
                      {tempSelection.length} selected
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmSelection}
                      disabled={tempSelection.length === 0}
                    >
                      Select ({tempSelection.length})
                    </Button>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 min-h-0">
              <MediaManager
                files={availableMedia}
                selectedFiles={tempSelection}
                multiple={multiple}
                accept={accept}
                maxFiles={maxFiles}
                onFileSelect={setTempSelection}
                onFileUpload={onMediaUpload}
                onFileDelete={onMediaDelete}
                onFileUpdate={onMediaUpdate}
                className="h-full"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Selection Info */}
      {multiple && selectedMedia.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedMedia.length} of {maxFiles} files selected
        </div>
      )}
    </div>
  )
}

export default MediaSelector
