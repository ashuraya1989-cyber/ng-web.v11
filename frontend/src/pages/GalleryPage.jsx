import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { galleryAPI, settingsAPI } from '../lib/api';
import { useDynamicFonts } from '../hooks/useDynamicFonts';

const defaultCategories = [
    { id: 'wedding',     name: 'Wedding',     slug: 'wedding'     },
    { id: 'pre-wedding', name: 'Pre-Wedding', slug: 'pre-wedding' },
];

const defaultTexts = {
    gallery_title:    { text: 'Gallery',                          font: 'Cormorant Garamond', color: '#ffffff',              size: 'text-6xl' },
    gallery_subtitle: { text: 'A collection of precious moments', font: 'Space Grotesk',      color: 'rgba(255,255,255,0.5)', size: 'text-sm' },
};

const twToPx = cls => {
    const m = { 'text-xs':'12px','text-sm':'14px','text-base':'16px','text-lg':'18px',
        'text-xl':'20px','text-2xl':'24px','text-3xl':'30px','text-4xl':'36px',
        'text-5xl':'48px','text-6xl':'60px','text-7xl':'72px','text-8xl':'96px' };
    return m[cls] || '48px';
};

const GalleryPage = () => {
    const [activeTab, setActiveTab]   = useState('all');
    const [images, setImages]         = useState([]);
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading]       = useState(true);
    const [siteTexts, setSiteTexts]   = useState(defaultTexts);
    const [typography, setTypography] = useState({ heading_font:'Cormorant Garamond', body_font:'Space Grotesk', custom_fonts:[] });
    const [animationSettings, setAnimationSettings] = useState({ gallery_animation:'fade', animation_speed:'normal' });

    // Slideshow state
    const [currentIdx, setCurrentIdx]       = useState(0);
    const [visibleIdx, setVisibleIdx]       = useState(0);   // which slide is fully visible
    const [transitioning, setTransitioning] = useState(false);
    const autoTimer = useRef(null);
    const touchStart = useRef(null);

    useDynamicFonts(typography, siteTexts);

    // Map admin animation_speed → CSS duration
    const speedMap = { slow: '1.4s', normal: '0.9s', fast: '0.4s' };
    const fadeDuration = speedMap[animationSettings.animation_speed] || '0.9s';

    // Map gallery_animation → CSS transition style
    const getSlideTransition = (isCurrent) => {
        const speed = fadeDuration;
        const type = animationSettings.gallery_animation || 'fade';
        if (type === 'none') return { opacity: isCurrent ? 1 : 0, transition: 'none' };
        if (type === 'zoom') return {
            opacity: isCurrent ? 1 : 0,
            transform: isCurrent ? 'scale(1)' : 'scale(1.06)',
            transition: `opacity ${speed} cubic-bezier(0.4,0,0.2,1), transform ${speed} cubic-bezier(0.4,0,0.2,1)`,
        };
        if (type === 'slide') return {
            opacity: isCurrent ? 1 : 0,
            transform: isCurrent ? 'translateX(0)' : 'translateX(40px)',
            transition: `opacity ${speed} ease, transform ${speed} ease`,
        };
        if (type === 'bounce') return {
            opacity: isCurrent ? 1 : 0,
            transform: isCurrent ? 'scale(1)' : 'scale(0.97)',
            transition: `opacity ${speed} cubic-bezier(0.34,1.56,0.64,1), transform ${speed} cubic-bezier(0.34,1.56,0.64,1)`,
        };
        // default: fade
        return {
            opacity: isCurrent ? 1 : 0,
            transition: `opacity ${speed} cubic-bezier(0.4,0,0.2,1)`,
        };
    };

    useEffect(() => {
        (async () => {
            try {
                const [imagesRes, settingsRes] = await Promise.all([
                    galleryAPI.getImages(),
                    settingsAPI.getPublicSettings(),
                ]);
                setImages(imagesRes.data || []);
                if (settingsRes.data?.categories?.length > 0) setCategories(settingsRes.data.categories);
                if (settingsRes.data?.site_texts)       setSiteTexts(p => ({ ...p, ...settingsRes.data.site_texts }));
                if (settingsRes.data?.typography)       setTypography(p => ({ ...p, ...settingsRes.data.typography }));
                if (settingsRes.data?.animation_settings) setAnimationSettings(p => ({ ...p, ...settingsRes.data.animation_settings }));
            } catch (e) { console.log('Gallery fetch error', e); }
            finally { setLoading(false); }
        })();
    }, []);

    // Reset to first slide when tab changes
    useEffect(() => { setCurrentIdx(0); setVisibleIdx(0); }, [activeTab]);

    const displayImages = activeTab === 'all'
        ? images
        : images.filter(img => img.category === activeTab);

    // Crossfade transition
    const goTo = useCallback((nextIdx) => {
        if (transitioning || displayImages.length < 2) return;
        setTransitioning(true);
        setCurrentIdx(nextIdx);
        // After fade completes, update visible
        setTimeout(() => {
            setVisibleIdx(nextIdx);
            setTransitioning(false);
        }, 900);
    }, [transitioning, displayImages.length]);

    const next = useCallback(() => {
        goTo((currentIdx + 1) % displayImages.length);
    }, [goTo, currentIdx, displayImages.length]);

    const prev = useCallback(() => {
        goTo((currentIdx - 1 + displayImages.length) % displayImages.length);
    }, [goTo, currentIdx, displayImages.length]);

    // Auto-advance
    useEffect(() => {
        if (displayImages.length < 2) return;
        clearTimeout(autoTimer.current);
        autoTimer.current = setTimeout(next, 5000);
        return () => clearTimeout(autoTimer.current);
    }, [next, displayImages.length]);

    // Keyboard
    useEffect(() => {
        const h = e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [next, prev]);

    // Touch swipe
    const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
    const onTouchEnd   = e => {
        if (!touchStart.current) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 48) diff > 0 ? next() : prev();
        touchStart.current = null;
    };

    const getCategoryName = slug => categories.find(c => c.slug === slug || c.id === slug)?.name || slug;

    return (
        <div style={{ background:'#080808', height:'100svh', overflow:'hidden', position:'relative' }}>
            <Navbar transparent />

            {/* ── Full-screen slides (all stacked, opacity transition) ── */}
            <div
                style={{ position:'absolute', inset:0 }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {loading ? (
                    // Loading shimmer
                    <div style={{ position:'absolute', inset:0, background:'#080808', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <div style={{ textAlign:'center' }}>
                            <div style={{ width:1, height:48, background:'linear-gradient(to bottom,#c9a96e,transparent)', margin:'0 auto 16px' }}/>
                            <p style={{ fontSize:9, letterSpacing:'0.45em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)' }}>Loading</p>
                        </div>
                    </div>
                ) : displayImages.length === 0 ? (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'rgba(255,255,255,0.2)' }}>Inga bilder</p>
                    </div>
                ) : (
                    displayImages.map((img, idx) => {
                        const isCurrent = idx === currentIdx;
                        return (
                            <div key={img.id} style={{
                                position:'absolute', inset:0,
                                zIndex: isCurrent ? 1 : 0,
                                ...getSlideTransition(isCurrent),
                            }}>
                                <img
                                    src={img.url}
                                    alt={img.title || ''}
                                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                                />
                            </div>
                        );
                    })
                )}

                {/* Gradient layers */}
                <div style={{ position:'absolute', inset:0, zIndex:2,
                    background:'linear-gradient(to top, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.1) 40%, rgba(8,8,8,0.4) 100%)' }}/>

                {/* Gold top line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:3,
                    background:'linear-gradient(90deg,transparent,#c9a96e,#e8d5b0,#c9a96e,transparent)' }}/>

                {/* ── Arrow nav ── */}
                {displayImages.length > 1 && (
                    <>
                        <button onClick={prev} aria-label="Föregående" style={{
                            position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', zIndex:10,
                            width:48, height:48, borderRadius:'50%',
                            background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)',
                            cursor:'pointer', color:'rgba(255,255,255,0.75)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            backdropFilter:'blur(8px)', transition:'all 0.2s',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,169,110,0.18)';e.currentTarget.style.borderColor='rgba(201,169,110,0.4)';e.currentTarget.style.color='#c9a96e';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.35)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.75)';}}
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <button onClick={next} aria-label="Nästa" style={{
                            position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', zIndex:10,
                            width:48, height:48, borderRadius:'50%',
                            background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)',
                            cursor:'pointer', color:'rgba(255,255,255,0.75)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            backdropFilter:'blur(8px)', transition:'all 0.2s',
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(201,169,110,0.18)';e.currentTarget.style.borderColor='rgba(201,169,110,0.4)';e.currentTarget.style.color='#c9a96e';}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.35)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.75)';}}
                        >
                            <ChevronRight size={20}/>
                        </button>
                    </>
                )}

                {/* ── Bottom UI ── */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:5, padding:'0 24px 32px' }}>

                    {/* Current image info */}
                    {displayImages[currentIdx] && (
                        <div style={{ marginBottom:24, display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
                            <div>
                                <p style={{ fontSize:9, letterSpacing:'0.35em', textTransform:'uppercase', color:'#c9a96e', marginBottom:6, fontWeight:600 }}>
                                    {getCategoryName(displayImages[currentIdx].category)}
                                </p>
                                <h2 style={{
                                    fontFamily: siteTexts?.gallery_title?.font
                                        ? `"${siteTexts.gallery_title.font}",Georgia,serif`
                                        : "'Cormorant Garamond',Georgia,serif",
                                    fontSize:'clamp(22px,4vw,38px)', fontWeight:300,
                                    color: siteTexts?.gallery_title?.color || '#fff',
                                    margin:0, lineHeight:1.1, letterSpacing:'0.03em',
                                }}>
                                    {displayImages[currentIdx].title}
                                </h2>
                            </div>

                            {/* Counter */}
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:300, color:'#fff', lineHeight:1 }}>
                                    {String(currentIdx+1).padStart(2,'0')}
                                </span>
                                <span style={{ fontSize:13, color:'rgba(255,255,255,0.25)', margin:'0 5px' }}>/</span>
                                <span style={{ fontSize:13, color:'rgba(255,255,255,0.25)' }}>
                                    {String(displayImages.length).padStart(2,'0')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── Category tabs ── */}
                    <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                        <div style={{
                            display:'inline-flex', alignItems:'center', gap:3,
                            background:'rgba(8,8,8,0.65)',
                            backdropFilter:'blur(20px)',
                            border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:40, padding:'4px',
                        }}>
                            {[{ id:'all', name:'Alla', slug:'all' }, ...categories].map(cat => {
                                const active = activeTab === cat.slug;
                                return (
                                    <button key={cat.id} onClick={() => setActiveTab(cat.slug)} style={{
                                        padding:'9px 22px', borderRadius:32, border:'none',
                                        cursor:'pointer', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
                                        fontWeight: active ? 700 : 400,
                                        background: active ? 'linear-gradient(135deg,#c9a96e,#b8935a)' : 'transparent',
                                        color: active ? '#000' : 'rgba(255,255,255,0.5)',
                                        transition:'all 0.2s ease', whiteSpace:'nowrap',
                                    }}>
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress dots */}
                    {displayImages.length > 1 && (
                        <div style={{ display:'flex', justifyContent:'center', gap:6 }}>
                            {displayImages.map((_, i) => (
                                <button key={i} onClick={() => goTo(i)} aria-label={`Bild ${i+1}`} style={{
                                    width: i===currentIdx ? 28 : 6, height:6, borderRadius:3,
                                    border:'none', cursor:'pointer', padding:0,
                                    background: i===currentIdx ? '#c9a96e' : 'rgba(255,255,255,0.22)',
                                    transition:'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                                }}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GalleryPage;
