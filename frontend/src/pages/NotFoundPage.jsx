import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
            <p className="text-muted-foreground text-modern text-sm uppercase tracking-[0.3em] mb-4">
                404
            </p>
            <h1 className="text-foreground text-elegant text-5xl lg:text-7xl mb-6">
                Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-12">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-foreground border border-foreground/30 px-8 py-4 text-modern text-sm uppercase tracking-wider hover:bg-foreground hover:text-background transition-all duration-300 rounded-md"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
            </Link>
        </div>
    );
};

export default NotFoundPage;
