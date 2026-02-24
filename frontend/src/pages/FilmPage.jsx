import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { videosAPI } from '../lib/api';

const FilmPage = () => {
    const [videos, setVideos] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await videosAPI.getVideos();
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const currentVideo = videos[currentSlide];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % videos.length);
    }, [videos.length]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev - 1 + videos.length) % videos.length);
    }, [videos.length]);

    const playVideo = (video) => {
        if (video.display_type === 'link' && video.video_url) {
            window.open(video.video_url, '_blank');
        } else {
            setPlayingVideo(video);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (playingVideo) {
                if (e.key === 'Escape') setPlayingVideo(null);
                return;
            }
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playingVideo, nextSlide, prevSlide]);

    // Empty state
    if (!loading && videos.length === 0) {
        return (
            <div className="bg-background">
                <Navbar transparent />
                <section className="h-screen w-full relative flex items-center justify-center bg-primary">
                    <div className="text-center px-6">
                        <Play className="h-20 w-20 text-primary-foreground/30 mx-auto mb-8" />
                        <h1 className="text-primary-foreground text-elegant text-4xl lg:text-5xl mb-4">
                            Coming Soon
                        </h1>
                        <p className="text-primary-foreground/60 text-lg max-w-md mx-auto">
                            Our film portfolio is being updated. Check back soon for beautiful wedding films.
                        </p>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-background">
            <Navbar transparent />
            
            {/* Full Screen Film Slideshow */}
            <section className="h-screen w-full relative overflow-hidden">
                {/* Background Thumbnails */}
                {videos.map((video, index) => (
                    <div
                        key={video.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {video.thumbnail_url ? (
                            <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                            />
                        ) : video.vimeo_id ? (
                            <img
                                src={`https://vumbnail.com/${video.vimeo_id}_large.jpg`}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `https://vumbnail.com/${video.vimeo_id}.jpg`;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-primary" />
                        )}
                    </div>
                ))}
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Play Button - Center */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button
                        onClick={() => currentVideo && playVideo(currentVideo)}
                        className="w-32 h-32 rounded-full border-2 border-white/80 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
                    >
                        <Play className="w-12 h-12 ml-2" fill="white" />
                    </button>
                </div>

                {/* Title - Top */}
                <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-20 text-center">
                    <p className="text-white/60 text-modern text-sm uppercase tracking-[0.3em] mb-2">
                        Film
                    </p>
                </div>

                {/* Navigation Arrows */}
                {videos.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-10 h-10" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-10 h-10" />
                        </button>
                    </>
                )}

                {/* Video Info - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-10">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-white text-elegant text-2xl sm:text-3xl lg:text-5xl mb-2">
                                {currentVideo?.title}
                            </h2>
                            {currentVideo?.description && (
                                <p className="text-white/60 text-sm sm:text-lg max-w-xl">
                                    {currentVideo.description}
                                </p>
                            )}
                        </div>
                        
                        {/* Slide Counter */}
                        {videos.length > 1 && (
                            <div className="text-white/60 text-modern">
                                <span className="text-white text-xl sm:text-2xl">{String(currentSlide + 1).padStart(2, '0')}</span>
                                <span className="mx-2">/</span>
                                <span>{String(videos.length).padStart(2, '0')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {videos.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                        <div 
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${((currentSlide + 1) / videos.length) * 100}%` }}
                        />
                    </div>
                )}
            </section>

            <Footer />

            {/* Video Player Modal */}
            {playingVideo && (
                <div 
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onClick={() => setPlayingVideo(null)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 z-10"
                        onClick={() => setPlayingVideo(null)}
                    >
                        <X className="w-8 h-8" />
                    </Button>

                    <div 
                        className="w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {playingVideo.embed_url ? (
                            <iframe
                                src={`${playingVideo.embed_url}&autoplay=1`}
                                title={playingVideo.title}
                                className="w-full aspect-video max-h-full"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video 
                                src={playingVideo.video_url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilmPage;
