import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

// Public pages
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import FilmPage from './pages/FilmPage';
import ContactPage from './pages/ContactPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGallery from './pages/admin/AdminGallery';
import AdminVideos from './pages/admin/AdminVideos';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTypography from './pages/admin/AdminTypography';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import VisitorTracker from './components/VisitorTracker';
import NotFoundPage from './pages/NotFoundPage';
import useSeoMeta from './hooks/useSeoMeta';
import { useLoadAllFonts } from './hooks/useDynamicFonts';

function App() {
    useSeoMeta();       // Load SEO + favicon from admin settings
    useLoadAllFonts();  // Pre-load ALL 16 typography fonts so admin changes work instantly
    return (
        <Router>
            <VisitorTracker />
            <div className="min-h-screen bg-background text-foreground">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/film" element={<FilmPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route 
                        path="/admin" 
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/gallery" 
                        element={
                            <ProtectedRoute>
                                <AdminGallery />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/videos" 
                        element={
                            <ProtectedRoute>
                                <AdminVideos />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/messages" 
                        element={
                            <ProtectedRoute>
                                <AdminMessages />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/settings" 
                        element={
                            <ProtectedRoute>
                                <AdminSettings />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/typography" 
                        element={
                            <ProtectedRoute>
                                <AdminTypography />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/admin/analytics" 
                        element={
                            <ProtectedRoute>
                                <AdminAnalytics />
                            </ProtectedRoute>
                        } 
                    />
                    {/* 404 - Catch all unmatched routes */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <Toaster position="top-right" />
            </div>
        </Router>
    );
}

export default App;
