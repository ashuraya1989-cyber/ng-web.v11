import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary text-primary-foreground py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Logo */}
                    <Link to="/" className="text-elegant text-xl tracking-wider">
                        Nisha Goriel Photography
                    </Link>

                    {/* Navigation */}
                    <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                        <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm uppercase tracking-wider">
                            Home
                        </Link>
                        <Link to="/gallery" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm uppercase tracking-wider">
                            Gallery
                        </Link>
                        <Link to="/film" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm uppercase tracking-wider">
                            Film
                        </Link>
                        <Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-xs sm:text-sm uppercase tracking-wider">
                            Contact
                        </Link>
                    </nav>

                    {/* Social */}
                    <div className="flex items-center gap-4">
                        <a 
                            href="https://instagram.com/nishagoriel" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                        >
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
                    <p className="text-primary-foreground/50 text-sm">
                        © {currentYear} Nisha Goriel Photography. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
