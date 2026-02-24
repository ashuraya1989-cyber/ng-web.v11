import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
    const currentImage = images[currentIndex];

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    }, [currentIndex, images.length, onClose, onNavigate]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    if (!currentImage) return null;

    return (
        <div className="lightbox-overlay flex items-center justify-center animate-fade-in">
            {/* Close Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                onClick={onClose}
            >
                <X className="w-6 h-6" />
            </Button>

            {/* Navigation - Previous */}
            {currentIndex > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 z-10 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => onNavigate(currentIndex - 1)}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>
            )}

            {/* Image */}
            <div className="max-w-[90vw] max-h-[90vh] relative">
                <img
                    src={currentImage.url}
                    alt={currentImage.title || 'Gallery image'}
                    className="max-w-full max-h-[90vh] object-contain"
                />
                
                {/* Caption */}
                {currentImage.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-primary-foreground text-elegant text-lg text-center">
                            {currentImage.title}
                        </p>
                        {currentImage.description && (
                            <p className="text-primary-foreground/70 text-sm text-center mt-2">
                                {currentImage.description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation - Next */}
            {currentIndex < images.length - 1 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 z-10 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => onNavigate(currentIndex + 1)}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-primary-foreground/60 text-sm">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageLightbox;
