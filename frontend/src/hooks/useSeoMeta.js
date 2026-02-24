import { useEffect } from 'react';
import { settingsAPI } from '../lib/api';

/**
 * Reads SEO settings from Supabase and injects them into <head>.
 * Call once in App.jsx — affects all pages.
 */
const useSeoMeta = () => {
    useEffect(() => {
        settingsAPI.getPublicSettings().then(res => {
            const seo = res?.data?.seo || {};
            const favicon = res?.data?.favicon_url || '';

            // ── Title ──────────────────────────────────────────────────────────
            if (seo.meta_title) {
                document.title = seo.meta_title;
                setMeta('og:title', seo.meta_title, true);
            }

            // ── Description ────────────────────────────────────────────────────
            if (seo.meta_description) {
                setMeta('description', seo.meta_description);
                setMeta('og:description', seo.meta_description, true);
            }

            // ── Keywords ───────────────────────────────────────────────────────
            if (seo.meta_keywords) {
                setMeta('keywords', seo.meta_keywords);
            }

            // ── OG Image ───────────────────────────────────────────────────────
            if (seo.og_image) {
                setMeta('og:image', seo.og_image, true);
            }

            // ── Favicon ────────────────────────────────────────────────────────
            if (favicon) {
                ['favicon', 'apple-touch-icon'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.href = favicon;
                });
                // Also update any other icon links
                document.querySelectorAll("link[rel~='icon']").forEach(el => {
                    el.href = favicon;
                });
            }
        }).catch(() => {
            // Silent — defaults from index.html remain
        });
    }, []);
};

// Helper: set or create a <meta> tag
const setMeta = (nameOrProperty, content, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProperty);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

export default useSeoMeta;
