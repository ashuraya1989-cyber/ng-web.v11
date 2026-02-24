import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { galleryAPI, settingsAPI } from '../lib/api';
import { useDynamicFonts } from '../hooks/useDynamicFonts';
import { getAnimationConfig, speeds } from '../lib/animations';

const defaultLabels = {
    view_gallery: 'View Gallery',
    book_session: 'Book a Session',
    book_now: 'Book Now',
    get_in_touch: 'Get in Touch',
};

const defaultTexts = {
    hero_tagline: { text: 'Wedding & Pre-Wedding Photography', font: 'Space Grotesk', color: 'rgba(255,255,255,0.8)', size: 'text-sm' },
    hero_title: { text: 'Nisha Goriel', font: 'Cormorant Garamond', color: '#ffffff', size: 'text-7xl' },
    hero_subtitle: { text: 'Photography', font: 'Cormorant Garamond', color: 'rgba(255,255,255,0.9)', size: 'text-7xl' },
};

const defaultTypography = {
    heading_font: 'Cormorant Garamond',
    body_font: 'Space Grotesk',
    custom_fonts: [],
};

const defaultAnimations = {
    hero_animation: 'fade',
    gallery_animation: 'fade',
    page_transition: 'fade',
    animation_speed: 'normal',
};

const HomePage = () => {
    const [images, setImages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [labels, setLabels] = useState(defaultLabels);
    const [siteTexts, setSiteTexts] = useState(defaultTexts);
    const [typography, setTypography] = useState(defaultTypography);
    const [animationSettings, setAnimationSettings] = useState(defaultAnimations);
    const [categories, setCategories] = useState([
        { id: 'wedding', name: 'Wedding', slug: 'wedding' },
        { id: 'pre-wedding', name: 'Pre-Wedding', slug: 'pre-wedding' },
    ]);

    // Load dynamic fonts
    useDynamicFonts(typography, siteTexts);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [imagesRes, settingsRes] = await Promise.all([
                    galleryAPI.getImages(),
                    settingsAPI.getPublicSettings()
                ]);
                
                // Only use images from database (no demo images)
                setImages(imagesRes.data);
                
                if (settingsRes.data.button_labels) {
                    setLabels(prev => ({ ...prev, ...settingsRes.data.button_labels }));
                }
                if (settingsRes.data.categories && settingsRes.data.categories.length > 0) {
                    setCategories(settingsRes.data.categories);
                }
                if (settingsRes.data.site_texts) {
                    setSiteTexts(prev => ({ ...prev, ...settingsRes.data.site_texts }));
                }
                if (settingsRes.data.typography) {
                    setTypography(prev => ({ ...prev, ...settingsRes.data.typography }));
                }
                if (settingsRes.data.animation_settings) {
                    setAnimationSettings(prev => ({ ...prev, ...settingsRes.data.animation_settings }));
                }
            } catch (error) {
                console.log('Using defaults');
            }
        };
        fetchData();
    }, []);

    // Auto-advance slideshow
    useEffect(() => {
    // Auto-advance slideshow (only when images exist)
    const interval = setInterval(() => {
        if (images.length > 0) {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }
    }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    };

    const currentImage = images[currentSlide];
    
    // Get category name for current image
    const getCategoryName = (categorySlug) => {
        const cat = categories.find(c => c.slug === categorySlug || c.id === categorySlug);
        return cat ? cat.name : categorySlug;
    };

    // Get animation config based on settings
    const heroAnimation = getAnimationConfig(animationSettings.hero_animation, animationSettings.animation_speed);
    const speed = speeds[animationSettings.animation_speed] || speeds.normal;

    return (
        <motion.div 
            className="bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: speed }}
        >
            <Navbar transparent />
            
            {/* Hero - Full Screen Slideshow */}
            <section className="relative h-screen w-full overflow-hidden bg-primary">
                {/* Background Images with Animation */}
                <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: speed * 2 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={images[currentSlide]?.url}
                                alt={images[currentSlide]?.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
                    )}
                </AnimatePresence>
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content with Animation */}
                <motion.div 
                    className="relative z-10 h-full flex flex-col items-center justify-center px-6"
                    {...heroAnimation}
                >
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.p 
                            className={`text-modern uppercase tracking-[0.3em] mb-6 ${siteTexts.hero_tagline.size}`}
                            style={{ 
                                color: siteTexts.hero_tagline.color,
                                fontFamily: `"${siteTexts.hero_tagline.font}", sans-serif`
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: speed }}
                        >
                            {siteTexts.hero_tagline.text}
                        </motion.p>
                        <h1 className="leading-tight mb-8">
                            <span
                                className="block text-5xl sm:text-6xl lg:text-7xl"
                                style={{ 
                                    color: siteTexts.hero_title.color,
                                    fontFamily: `"${siteTexts.hero_title.font}", serif`
                                }}
                            >
                                {siteTexts.hero_title.text}
                            </span>
                            <span 
                                className="block italic text-4xl sm:text-5xl lg:text-7xl"
                                style={{ 
                                    color: siteTexts.hero_subtitle.color,
                                    fontFamily: `"${siteTexts.hero_subtitle.font}", serif`
                                }}
                            >
                                {siteTexts.hero_subtitle.text}
                            </span>
                        </h1>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                            <Link to="/gallery">
                                <Button 
                                    size="lg"
                                    className="bg-white text-black hover:bg-white/90 px-10 py-6 text-modern uppercase tracking-wider"
                                >
                                    {labels.view_gallery}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <button 
                                    className="inline-flex items-center justify-center border-2 border-white text-white bg-transparent hover:bg-white hover:text-black px-10 py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 rounded-md"
                                >
                                    {labels.book_session}
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'bg-white w-12' 
                                    : 'bg-white/40 w-6 hover:bg-white/60'
                            }`}
                        />
                    ))}
                </div>

                {/* Current Image Title */}
                <div className="absolute bottom-10 right-10 z-20 text-right hidden md:block">
                    <p className="text-white/60 text-modern text-xs uppercase tracking-wider mb-1">
                        {getCategoryName(currentImage?.category)}
                    </p>
                    <p className="text-white text-elegant text-lg">
                        {currentImage?.title}
                    </p>
                </div>
            </section>

            <Footer />
        </motion.div>
    );
};

export default HomePage;
