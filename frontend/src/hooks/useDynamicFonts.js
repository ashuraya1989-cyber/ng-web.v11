import { useEffect } from 'react';

// All fonts available in the admin typography panel
// These are ALL pre-loaded so switching fonts works instantly without delay
const BUILTIN_FONTS = [
    'Cormorant Garamond',
    'Playfair Display',
    'Montserrat',
    'Lora',
    'Raleway',
    'Space Grotesk',
    'Great Vibes',
    'Libre Baskerville',
    'Josefin Sans',
    'Cinzel',
    'Dancing Script',
    'Poppins',
    'Abril Fatface',
    'Tenor Sans',
    'Italiana',
    'Bodoni Moda',
];

// Weight + italic variants to load for each font
const WEIGHT_STRING = ':ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400';

let builtinLoaded = false;

/**
 * Load ALL built-in fonts once at app startup (called from App.js via useLoadAllFonts).
 * This ensures every font in the admin dropdown works immediately.
 */
export const useLoadAllFonts = () => {
    useEffect(() => {
        if (builtinLoaded) return;
        builtinLoaded = true;

        const families = BUILTIN_FONTS.map(f => `family=${f.replace(/ /g, '+')}${WEIGHT_STRING}`).join('&');
        const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

        if (!document.querySelector(`link[data-fonts="builtin"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.setAttribute('data-fonts', 'builtin');
            document.head.appendChild(link);
        }
    }, []);
};

/**
 * Per-page hook: applies the admin-selected heading/body fonts as CSS variables,
 * and loads any custom Google Fonts URLs added via admin panel.
 *
 * @param {object} typography  - { heading_font, body_font, custom_fonts: [{name, url}] }
 * @param {object} siteTexts   - optional: { hero_title: { font }, ... } — loads any extra fonts used per element
 */
export const useDynamicFonts = (typography, siteTexts = null) => {
    useEffect(() => {
        if (!typography) return;

        const { heading_font, body_font, custom_fonts = [] } = typography;

        // ── 1. Apply CSS variables ─────────────────────────────────────────────
        if (heading_font) {
            document.documentElement.style.setProperty(
                '--font-heading', `"${heading_font}", Georgia, serif`
            );
            // Legacy vars kept for backward compat
            document.documentElement.style.setProperty(
                '--font-elegant', `"${heading_font}", Georgia, serif`
            );
        }
        if (body_font) {
            document.documentElement.style.setProperty(
                '--font-body', `"${body_font}", sans-serif`
            );
            document.documentElement.style.setProperty(
                '--font-modern', `"${body_font}", sans-serif`
            );
        }

        // ── 2. Collect all fonts actually used in site_texts elements ──────────
        const extraFonts = new Set();
        if (siteTexts) {
            Object.values(siteTexts).forEach(section => {
                if (section?.font) extraFonts.add(section.font);
            });
        }
        // Also include heading/body just in case they're not in builtins
        if (heading_font) extraFonts.add(heading_font);
        if (body_font) extraFonts.add(body_font);

        // Remove fonts that are already in BUILTIN_FONTS (they're pre-loaded)
        const customFontNames = custom_fonts.map(f => f.name);
        const nonBuiltin = [...extraFonts].filter(
            f => !BUILTIN_FONTS.includes(f) && !customFontNames.includes(f)
        );

        // Load any non-builtin standard Google Fonts
        if (nonBuiltin.length > 0) {
            const families = nonBuiltin.map(f => `family=${f.replace(/ /g, '+')}${WEIGHT_STRING}`).join('&');
            const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                document.head.appendChild(link);
            }
        }

        // ── 3. Load custom font URLs (added via admin panel) ──────────────────
        custom_fonts.forEach(font => {
            if (!font.url) return;
            if (!document.querySelector(`link[href="${font.url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = font.url;
                document.head.appendChild(link);
            }
        });

    }, [typography, siteTexts]);
};

export default useDynamicFonts;
