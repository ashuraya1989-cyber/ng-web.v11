import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram } from 'lucide-react';
import { settingsAPI } from '../../lib/api';

const INSTAGRAM_URL = 'https://instagram.com/nishagoriel';

const Navbar = ({ transparent = false }) => {
    const [isScrolled, setIsScrolled]       = useState(false);
    const [isMobileMenuOpen, setMobileMenu] = useState(false);
    const [logoUrl, setLogoUrl]             = useState('');
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        settingsAPI.getPublicSettings()
            .then(r => { if (r.data?.logo_url) setLogoUrl(r.data.logo_url); })
            .catch(() => {});
    }, []);

    useEffect(() => { setMobileMenu(false); }, [location]);

    const navLinks = [
        { href: '/',        label: 'Home'    },
        { href: '/gallery', label: 'Gallery' },
        { href: '/film',    label: 'Film'    },
        { href: '/contact', label: 'Contact' },
    ];

    const isActive = path => location.pathname === path;
    const solid    = !transparent || isScrolled;

    // Logo text/image — used in two places (center bar + mobile)
    const LogoContent = () => logoUrl ? (
        <img src={logoUrl} alt="Nisha Goriel Photography"
            style={{ height: 50, width: 'auto', objectFit: 'contain', display: 'block' }}/>
    ) : (
        <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 26, fontWeight: 300, color: '#fff',
            letterSpacing: '0.06em', lineHeight: 1, whiteSpace: 'nowrap',
        }}>
            Nisha Goriel
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', fontWeight: 300, marginLeft: 10 }}>
                Photography
            </span>
        </span>
    );

    return (
        <>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: solid ? 'rgba(10,10,10,0.96)' : 'transparent',
                backdropFilter: solid ? 'blur(16px)' : 'none',
                borderBottom: solid ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition: 'background 0.4s ease, border-color 0.4s ease',
            }}>
                {/* Three-column layout: [Instagram left] [Logo center] [Nav/Burger right] */}
                <div style={{
                    maxWidth: 1200, margin: '0 auto', padding: '0 20px',
                    height: 72, display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                }}>

                    {/* ── LEFT: Instagram icon — gold, visible on BOTH mobile and desktop ── */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#c9a96e', textDecoration: 'none',
                                transition: 'opacity 0.2s',
                                // Same height as logo for visual balance
                                height: 50, width: 50,
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <Instagram size={28} strokeWidth={1.4}/>
                        </a>
                    </div>

                    {/* ── CENTER: Logo ── */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <LogoContent />
                    </Link>

                    {/* ── RIGHT: Desktop nav links / Mobile hamburger ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>

                        {/* Desktop nav */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
                            {navLinks.map(link => (
                                <Link key={link.href} to={link.href} style={{
                                    fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                                    fontWeight: 500, textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
                                    transition: 'all 0.2s',
                                    background: isActive(link.href) ? 'rgba(201,169,110,0.12)' : 'transparent',
                                    color: isActive(link.href) ? '#c9a96e' : 'rgba(255,255,255,0.7)',
                                }}
                                onMouseEnter={e => { if (!isActive(link.href)) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                                onMouseLeave={e => { if (!isActive(link.href)) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent'; }}}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenu(o => !o)}
                            className="mobile-burger"
                            aria-label="Menu"
                            style={{
                                display: 'none',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 10,
                                width: 44, height: 44,
                                cursor: 'pointer',
                                alignItems: 'center', justifyContent: 'center',
                                color: '#fff', transition: 'all 0.2s', flexShrink: 0,
                            }}
                        >
                            {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
                        </button>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        .desktop-nav  { display: none !important; }
                        .mobile-burger { display: flex !important; }
                    }
                    @media (min-width: 769px) {
                        .desktop-nav  { display: flex !important; }
                        .mobile-burger { display: none !important; }
                    }
                `}</style>
            </nav>

            {/* ── Mobile slide-down menu ── */}
            <div style={{
                position: 'fixed', top: 72, left: 0, right: 0, zIndex: 99,
                background: 'rgba(8,8,8,0.98)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(201,169,110,0.15)',
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-8px)',
                opacity: isMobileMenuOpen ? 1 : 0,
                pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                transition: 'transform 0.25s ease, opacity 0.25s ease',
            }}>
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #c9a96e, transparent)' }}/>
                <div style={{ padding: '16px 20px 24px' }}>
                    {navLinks.map((link) => (
                        <Link key={link.href} to={link.href}
                            onClick={() => setMobileMenu(false)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 20px', borderRadius: 12, marginBottom: 4,
                                textDecoration: 'none', transition: 'all 0.18s',
                                background: isActive(link.href) ? 'rgba(201,169,110,0.1)' : 'transparent',
                                border: isActive(link.href) ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
                            }}
                        >
                            <span style={{
                                fontSize: 18, letterSpacing: '0.08em',
                                fontFamily: "'Cormorant Garamond', Georgia, serif",
                                fontWeight: isActive(link.href) ? 600 : 300,
                                color: isActive(link.href) ? '#c9a96e' : '#ffffff',
                            }}>
                                {link.label}
                            </span>
                            {isActive(link.href) && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e' }}/>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Backdrop */}
            {isMobileMenuOpen && (
                <div onClick={() => setMobileMenu(false)} style={{
                    position: 'fixed', inset: 0, zIndex: 98,
                    background: 'rgba(0,0,0,0.4)',
                }}/>
            )}
        </>
    );
};

export default Navbar;
