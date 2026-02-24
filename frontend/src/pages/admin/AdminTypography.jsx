import React, { useState, useEffect } from 'react';
import { Loader2, Save, Plus, X, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { toast } from 'sonner';
import { settingsAPI } from '../../lib/api';
import { useLoadAllFonts, useDynamicFonts } from '../../hooks/useDynamicFonts';

// Popular Google Fonts
const availableFonts = [
    { name: 'Cormorant Garamond', style: 'Elegant, klassisk' },
    { name: 'Playfair Display', style: 'Lyxig, tidlös' },
    { name: 'Montserrat', style: 'Modern, ren' },
    { name: 'Lora', style: 'Mjuk, romantisk' },
    { name: 'Raleway', style: 'Stilren, minimalistisk' },
    { name: 'Space Grotesk', style: 'Modern, teknisk' },
    { name: 'Great Vibes', style: 'Skript, elegant' },
    { name: 'Libre Baskerville', style: 'Klassisk, läsbar' },
    { name: 'Josefin Sans', style: 'Retro, geometrisk' },
    { name: 'Cinzel', style: 'Majestätisk, antik' },
    { name: 'Dancing Script', style: 'Lekfull, handskriven' },
    { name: 'Poppins', style: 'Vänlig, modern' },
    { name: 'Abril Fatface', style: 'Djärv, dramatisk' },
    { name: 'Tenor Sans', style: 'Sofistikerad, elegant' },
    { name: 'Italiana', style: 'Elegant, tunn' },
    { name: 'Bodoni Moda', style: 'Klassisk, mode' },
];

const defaultSiteTexts = {
    hero_tagline: { text: 'Wedding & Pre-Wedding Photography', font: 'Space Grotesk', color: 'rgba(255,255,255,0.8)', size: 'text-sm' },
    hero_title: { text: 'Nisha Goriel', font: 'Cormorant Garamond', color: '#ffffff', size: 'text-7xl' },
    hero_subtitle: { text: 'Photography', font: 'Cormorant Garamond', color: 'rgba(255,255,255,0.9)', size: 'text-7xl' },
    gallery_title: { text: 'Gallery', font: 'Cormorant Garamond', color: '#ffffff', size: 'text-5xl' },
    gallery_subtitle: { text: 'A collection of precious moments', font: 'Space Grotesk', color: 'rgba(255,255,255,0.7)', size: 'text-lg' },
    film_title: { text: 'Film', font: 'Cormorant Garamond', color: '#ffffff', size: 'text-5xl' },
    film_subtitle: { text: 'Moving stories captured in time', font: 'Space Grotesk', color: 'rgba(255,255,255,0.7)', size: 'text-lg' },
    contact_subtitle: { text: 'Kontakt', font: 'Space Grotesk', color: 'rgba(255,255,255,0.6)', size: 'text-sm' },
};

const defaultTypography = {
    heading_font: 'Cormorant Garamond',
    body_font: 'Space Grotesk',
    custom_fonts: [],
};

// Available text sizes
const textSizes = [
    { value: 'text-xs', label: 'XS (12px)' },
    { value: 'text-sm', label: 'SM (14px)' },
    { value: 'text-base', label: 'Base (16px)' },
    { value: 'text-lg', label: 'LG (18px)' },
    { value: 'text-xl', label: 'XL (20px)' },
    { value: 'text-2xl', label: '2XL (24px)' },
    { value: 'text-3xl', label: '3XL (30px)' },
    { value: 'text-4xl', label: '4XL (36px)' },
    { value: 'text-5xl', label: '5XL (48px)' },
    { value: 'text-6xl', label: '6XL (60px)' },
    { value: 'text-7xl', label: '7XL (72px)' },
    { value: 'text-8xl', label: '8XL (96px)' },
];

// Text section editor component
const TextSectionEditor = ({ label, sectionKey, value, onChange, allFonts }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Get font size in pixels for preview
    const getSizeInPx = (sizeClass) => {
        const sizeMap = {
            'text-xs': '12px', 'text-sm': '14px', 'text-base': '16px', 'text-lg': '18px',
            'text-xl': '20px', 'text-2xl': '24px', 'text-3xl': '30px', 'text-4xl': '36px',
            'text-5xl': '48px', 'text-6xl': '60px', 'text-7xl': '72px', 'text-8xl': '96px'
        };
        return sizeMap[sizeClass] || '24px';
    };
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border rounded-lg">
            <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg">
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: value.color }}
                        />
                        <div className="text-left">
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]" style={{ fontFamily: value.font }}>
                                {value.text || '(tom)'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                    {/* Text */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Text</Label>
                        <Input
                            value={value.text}
                            onChange={(e) => onChange(sectionKey, { ...value, text: e.target.value })}
                            placeholder="Ange text..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {/* Font */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Typsnitt</Label>
                            <Select 
                                value={value.font} 
                                onValueChange={(font) => onChange(sectionKey, { ...value, font })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {allFonts.map((font) => (
                                        <SelectItem key={font.name} value={font.name}>
                                            <span style={{ fontFamily: font.name }}>{font.name}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Size */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Storlek</Label>
                            <Select 
                                value={value.size || 'text-5xl'} 
                                onValueChange={(size) => onChange(sectionKey, { ...value, size })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {textSizes.map((size) => (
                                        <SelectItem key={size.value} value={size.value}>
                                            {size.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Color */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Färg</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={value.color?.startsWith('rgba') ? '#ffffff' : value.color}
                                    onChange={(e) => onChange(sectionKey, { ...value, color: e.target.value })}
                                    className="w-12 h-9 p-1 cursor-pointer"
                                />
                                <Input
                                    value={value.color}
                                    onChange={(e) => onChange(sectionKey, { ...value, color: e.target.value })}
                                    placeholder="#ffffff"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="p-4 bg-primary rounded-lg overflow-hidden">
                        <p 
                            className="text-center truncate"
                            style={{ 
                                fontFamily: `"${value.font}", serif`,
                                color: value.color,
                                fontSize: getSizeInPx(value.size || 'text-5xl')
                            }}
                        >
                            {value.text || 'Förhandsvisning'}
                        </p>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

const AdminTypography = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [siteTexts, setSiteTexts] = useState(defaultSiteTexts);
    const [typography, setTypography] = useState(defaultTypography);
    const [customFontUrl, setCustomFontUrl] = useState('');

    // Load all built-in fonts so font previews in dropdowns work
    useLoadAllFonts();
    // Apply selected fonts as CSS vars live while editing
    useDynamicFonts(typography, siteTexts);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsAPI.getSettings();
                if (response.data.site_texts) {
                    // Merge with defaults
                    const merged = { ...defaultSiteTexts };
                    Object.keys(response.data.site_texts).forEach(key => {
                        if (merged[key]) {
                            merged[key] = { ...merged[key], ...response.data.site_texts[key] };
                        }
                    });
                    setSiteTexts(merged);
                }
                if (response.data.typography) {
                    setTypography(prev => ({ ...prev, ...response.data.typography }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleTextChange = (key, value) => {
        setSiteTexts(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.updateSettings({ 
                site_texts: siteTexts,
                typography 
            });
            toast.success('Alla ändringar sparade!');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Kunde inte spara');
        } finally {
            setSaving(false);
        }
    };

    const addCustomFont = () => {
        if (!customFontUrl.trim()) {
            toast.error('Ange en Google Fonts URL');
            return;
        }
        
        const match = customFontUrl.match(/family=([^:&]+)/);
        if (!match) {
            toast.error('Ogiltig Google Fonts URL');
            return;
        }
        
        const fontName = match[1].replace(/\+/g, ' ');
        
        if (typography.custom_fonts?.some(f => f.name === fontName)) {
            toast.error('Detta typsnitt finns redan');
            return;
        }
        
        setTypography(prev => ({
            ...prev,
            custom_fonts: [...(prev.custom_fonts || []), { name: fontName, url: customFontUrl }]
        }));
        setCustomFontUrl('');
        toast.success(`${fontName} tillagt!`);
    };

    const removeCustomFont = (fontName) => {
        setTypography(prev => ({
            ...prev,
            custom_fonts: prev.custom_fonts?.filter(f => f.name !== fontName) || []
        }));
    };

    // Combine available fonts with custom fonts
    const allFonts = [
        ...availableFonts,
        ...(typography.custom_fonts || []).map(f => ({ name: f.name, style: 'Anpassat' }))
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl text-elegant">Typografi & Texter</h1>
                        <p className="text-muted-foreground mt-2">
                            Anpassa typsnitt och färg för varje textsektion
                        </p>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sparar...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Spara alla ändringar
                            </>
                        )}
                    </Button>
                </div>

                {/* Custom Fonts Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant text-lg">Lägg till egna typsnitt</CardTitle>
                        <CardDescription>Lägg till Google Fonts som inte finns i listan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-4">
                            <Input
                                value={customFontUrl}
                                onChange={(e) => setCustomFontUrl(e.target.value)}
                                placeholder="https://fonts.googleapis.com/css2?family=Your+Font"
                                className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addCustomFont}>
                                <Plus className="h-4 w-4 mr-2" />
                                Lägg till
                            </Button>
                        </div>
                        
                        {typography.custom_fonts && typography.custom_fonts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {typography.custom_fonts.map((font) => (
                                    <div 
                                        key={font.name}
                                        className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md"
                                    >
                                        <span className="text-sm" style={{ fontFamily: font.name }}>{font.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCustomFont(font.name)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hero Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Startsida (Hero)</CardTitle>
                        <CardDescription>Texter på startsidans huvudsektion</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TextSectionEditor
                            label="Tagline (liten text ovanför)"
                            sectionKey="hero_tagline"
                            value={siteTexts.hero_tagline}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                        <TextSectionEditor
                            label="Huvudtitel"
                            sectionKey="hero_title"
                            value={siteTexts.hero_title}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                        <TextSectionEditor
                            label="Undertitel"
                            sectionKey="hero_subtitle"
                            value={siteTexts.hero_subtitle}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                    </CardContent>
                </Card>

                {/* Gallery Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Galleri-sida</CardTitle>
                        <CardDescription>Texter på galleri-sidan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TextSectionEditor
                            label="Sidtitel"
                            sectionKey="gallery_title"
                            value={siteTexts.gallery_title}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                        <TextSectionEditor
                            label="Undertitel"
                            sectionKey="gallery_subtitle"
                            value={siteTexts.gallery_subtitle}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                    </CardContent>
                </Card>

                {/* Film Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Film-sida</CardTitle>
                        <CardDescription>Texter på film-sidan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TextSectionEditor
                            label="Sidtitel"
                            sectionKey="film_title"
                            value={siteTexts.film_title}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                        <TextSectionEditor
                            label="Undertitel"
                            sectionKey="film_subtitle"
                            value={siteTexts.film_subtitle}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                    </CardContent>
                </Card>

                {/* Contact Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Kontakt-sida</CardTitle>
                        <CardDescription>Texter på kontakt-sidan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <TextSectionEditor
                            label="Rubrik / etikett"
                            sectionKey="contact_subtitle"
                            value={siteTexts.contact_subtitle}
                            onChange={handleTextChange}
                            allFonts={allFonts}
                        />
                    </CardContent>
                </Card>

                {/* Save Button (bottom) */}
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        size="lg"
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sparar...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Spara alla ändringar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTypography;
