import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

const GalleryGrid = ({ images, columns = 3 }) => {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const getColumnClass = () => {
        switch (columns) {
            case 2:
                return 'grid-cols-1 md:grid-cols-2';
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
                return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <>
            <div className={`grid ${getColumnClass()} gap-4 md:gap-6`}>
                {images.map((image, index) => (
                    <div
                        key={image.id || index}
                        className="gallery-item group cursor-pointer image-hover-zoom relative aspect-[4/5] bg-muted rounded-sm overflow-hidden"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={image.url}
                            alt={image.title || `Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        
                        {/* Overlay */}
                        <div className="gallery-overlay flex flex-col justify-end p-6">
                            {image.title && (
                                <h3 className="text-primary-foreground text-elegant text-lg mb-1">
                                    {image.title}
                                </h3>
                            )}
                            {image.category && (
                                <p className="text-primary-foreground/70 text-modern text-xs uppercase tracking-wider">
                                    {image.category}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <ImageLightbox
                    images={images}
                    currentIndex={lightboxIndex}
                    onClose={closeLightbox}
                    onNavigate={setLightboxIndex}
                />
            )}
        </>
    );
};

export default GalleryGrid;
