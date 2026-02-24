import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Eye, EyeOff, Loader2, UserPlus, Key, Mail, Upload, Image, Trash2, MapPin, Plus, Tags, Type, X, ImageIcon, Send, Sparkles, Server, Download, UploadCloud } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { authAPI, settingsAPI } from '../../lib/api';
import { supabase } from '../../lib/supabase';

// Email provider options with free tier info
const EMAIL_PROVIDERS = [
    { value: 'none', label: 'No Provider', free: '', fields: [] },
    { value: 'mailtrap', label: 'Mailtrap', free: '1,000/month', fields: ['api_key'] },
    { value: 'mailgun', label: 'Mailgun', free: '5,000/month', fields: ['api_key', 'domain'] },
    { value: 'sendgrid', label: 'SendGrid', free: '100/day', fields: ['api_key'] },
    { value: 'brevo', label: 'Brevo', free: '300/day', fields: ['api_key'] },
    { value: 'mailjet', label: 'Mailjet', free: '200/day', fields: ['api_key', 'api_secret'] },
    { value: 'resend', label: 'Resend', free: '3,000/month', fields: ['api_key'] },
    { value: 'smtp', label: 'SMTP (Custom)', free: 'Unlimited', fields: ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password'] },
];

// Animation options
const ANIMATION_OPTIONS = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'none', label: 'None' },
];

const SPEED_OPTIONS = [
    { value: 'slow', label: 'Slow (0.8s)' },
    { value: 'normal', label: 'Normal (0.5s)' },
    { value: 'fast', label: 'Fast (0.25s)' },
];

const AdminSettings = () => {
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);
    const contactImageInputRef = useRef(null);
    const faviconInputRef = useRef(null);
    
    // Site settings
    const [siteSettings, setSiteSettings] = useState({
        logo_url: '',
        favicon_url: '',
        contact_image_url: '',
        contact_image_opacity: 30,
        seo: {
            meta_title: 'Nisha Goriel Photography',
            meta_description: 'Wedding & Pre-Wedding Photography i Stockholm. Boka din fotografering idag.',
            meta_keywords: 'bröllopsfotograf, stockholm, bröllop, pre-wedding, fotografi',
            og_image: '',
        },
        mailtrap_api_key: '',
        recipient_email: 'info@nishagoriel.com',
        contact_info: {
            location: 'Stockholm, Sweden',
            phone: '+46 70 123 4567',
            email: 'info@nishagoriel.com',
            hours: 'Mon - Fri: 9:00 - 18:00',
        },
        button_labels: {
            view_gallery: 'View Gallery',
            book_session: 'Book a Session',
            book_now: 'Book Now',
            get_in_touch: 'Get in Touch',
            send_message: 'Skicka meddelande',
        },
        categories: [
            { id: 'wedding', name: 'Wedding', slug: 'wedding' },
            { id: 'pre-wedding', name: 'Pre-Wedding', slug: 'pre-wedding' },
        ],
        email_provider: {
            provider: 'none',
            api_key: '',
            api_secret: '',
            domain: '',
            smtp_host: '',
            smtp_port: 587,
            smtp_username: '',
            smtp_password: '',
            sender_email: 'onboarding@resend.dev',
            sender_name: 'Nisha Goriel Photography',
        },
        animation_settings: {
            hero_animation: 'fade',
            gallery_animation: 'fade',
            page_transition: 'fade',
            animation_speed: 'normal',
        }
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingContact, setSavingContact] = useState(false);
    const [savingButtons, setSavingButtons] = useState(false);
    const [savingCategories, setSavingCategories] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingContactImage, setUploadingContactImage] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [savingSeo, setSavingSeo] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [savingAnimations, setSavingAnimations] = useState(false);
    
    // New category form
    const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
    
    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
        api: false,
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // New admin form
    const [newAdminForm, setNewAdminForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [addingAdmin, setAddingAdmin] = useState(false);

    // Import/Export state
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const importFileInputRef = useRef(null);

    // === EXPORT ALL DATA (ZIP with images) ===
    const handleExportAll = async () => {
        setExporting(true);
        try {
            const zip = new JSZip();
            const imagesFolder = zip.folder('images');

            // Fetch all database data in parallel
            const [settingsRes, galleryRes, videosRes, messagesRes, visitorsRes] = await Promise.all([
                supabase.from('settings').select('*').eq('id', 'site_settings').single(),
                supabase.from('gallery').select('*').order('order', { ascending: true }),
                supabase.from('videos').select('*').order('created_at', { ascending: false }),
                supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
                supabase.from('visitors').select('*').order('visit_start', { ascending: false }).limit(5000),
            ]);

            const galleryData = galleryRes.data || [];

            // Download each gallery image and add to zip
            const galleryWithPaths = [];
            let downloadedImages = 0;
            for (const img of galleryData) {
                try {
                    const marker = '/storage/v1/object/public/gallery/';
                    const idx = img.url ? img.url.indexOf(marker) : -1;
                    if (idx !== -1) {
                        const filePath = decodeURIComponent(img.url.substring(idx + marker.length));
                        const response = await fetch(img.url);
                        if (response.ok) {
                            const arrayBuffer = await response.arrayBuffer();
                            imagesFolder.file(filePath, arrayBuffer);
                            galleryWithPaths.push({ ...img, _backup_path: filePath });
                            downloadedImages++;
                        } else {
                            galleryWithPaths.push(img);
                        }
                    } else {
                        galleryWithPaths.push(img);
                    }
                } catch (e) {
                    console.warn('Could not download image for backup:', img.url, e);
                    galleryWithPaths.push(img);
                }
            }

            const exportData = {
                _meta: {
                    version: '2.0',
                    exported_at: new Date().toISOString(),
                    source: window.location.hostname,
                    image_count: downloadedImages,
                },
                settings: settingsRes.data || {},
                gallery: galleryWithPaths,
                videos: videosRes.data || [],
                contact_messages: messagesRes.data || [],
                visitors: visitorsRes.data || [],
            };

            zip.file('data.json', JSON.stringify(exportData, null, 2));

            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ng-backup-${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Backup klar! ${downloadedImages} bilder + all data exporterad.`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Kunde inte exportera data: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    // === IMPORT ALL DATA ===
    const handleImportFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
            toast.error('Välj en .zip eller .json-fil');
            return;
        }
        setImportFile(file);
        setShowImportConfirm(true);
    };

    const handleImportConfirm = async () => {
        if (!importFile) return;
        setShowImportConfirm(false);
        setImporting(true);

        try {
            let data;
            const isZip = importFile.name.endsWith('.zip');

            if (isZip) {
                // ── ZIP import: extract data.json + re-upload images ──────────────
                const zip = await JSZip.loadAsync(importFile);
                const dataJsonFile = zip.file('data.json');
                if (!dataJsonFile) {
                    toast.error('Ogiltig backup: data.json saknas i ZIP-filen');
                    setImporting(false);
                    return;
                }
                const text = await dataJsonFile.async('text');
                try { data = JSON.parse(text); } catch {
                    toast.error('Ogiltig JSON i backup-filen');
                    setImporting(false);
                    return;
                }

                // Re-upload gallery images to new Supabase Storage
                if (Array.isArray(data.gallery)) {
                    let uploadedCount = 0;
                    for (const img of data.gallery) {
                        if (img._backup_path) {
                            const zipEntry = zip.file(`images/${img._backup_path}`);
                            if (zipEntry) {
                                try {
                                    const arrayBuffer = await zipEntry.async('arraybuffer');
                                    const ext = img._backup_path.split('.').pop().toLowerCase();
                                    const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };
                                    const contentType = mimeTypes[ext] || 'image/jpeg';
                                    const { error: upErr } = await supabase.storage
                                        .from('gallery')
                                        .upload(img._backup_path, arrayBuffer, { contentType, upsert: true });
                                    if (!upErr) {
                                        const { data: { publicUrl } } = supabase.storage
                                            .from('gallery')
                                            .getPublicUrl(img._backup_path);
                                        img.url = publicUrl;
                                        uploadedCount++;
                                    } else {
                                        console.error('Image re-upload error:', upErr);
                                    }
                                } catch (e) {
                                    console.error('Could not re-upload image:', img._backup_path, e);
                                }
                            }
                        }
                        delete img._backup_path; // clean up meta field
                    }
                    if (uploadedCount > 0) toast.info(`${uploadedCount} bilder återuppladdade till Storage`);
                }
            } else {
                // ── Legacy JSON import ────────────────────────────────────────────
                const text = await importFile.text();
                try { data = JSON.parse(text); } catch {
                    toast.error('Ogiltig JSON-fil');
                    setImporting(false);
                    return;
                }
            }

            let importedCount = 0;

            // Import settings
            if (data.settings && typeof data.settings === 'object') {
                const settingsToSave = { ...data.settings };
                delete settingsToSave.id;
                delete settingsToSave.created_at;
                delete settingsToSave.updated_at;
                await settingsAPI.updateSettings(settingsToSave);
                importedCount++;
            }

            // Import gallery
            if (Array.isArray(data.gallery) && data.gallery.length > 0) {
                const galleryItems = data.gallery.map((img, i) => ({ ...img, order: img.order ?? i }));
                const { error } = await supabase.from('gallery').upsert(galleryItems, { onConflict: 'id' });
                if (error) console.error('Gallery import error:', error);
                else importedCount += galleryItems.length;
            }

            // Import videos
            if (Array.isArray(data.videos) && data.videos.length > 0) {
                const { error } = await supabase.from('videos').upsert(data.videos, { onConflict: 'id' });
                if (error) console.error('Videos import error:', error);
                else importedCount += data.videos.length;
            }

            // Import contact messages
            if (Array.isArray(data.contact_messages) && data.contact_messages.length > 0) {
                const { error } = await supabase.from('contact_messages').upsert(data.contact_messages, { onConflict: 'id' });
                if (error) console.error('Messages import error:', error);
                else importedCount += data.contact_messages.length;
            }

            // Import visitors in chunks
            if (Array.isArray(data.visitors) && data.visitors.length > 0) {
                const chunkSize = 500;
                for (let i = 0; i < data.visitors.length; i += chunkSize) {
                    const chunk = data.visitors.slice(i, i + chunkSize);
                    const { error } = await supabase.from('visitors').upsert(chunk, { onConflict: 'id' });
                    if (error) console.error('Visitors import chunk error:', error);
                    else importedCount += chunk.length;
                }
            }

            toast.success(`Import klar! ${importedCount} objekt importerade.`);

            // Reload settings
            try {
                const settingsRes = await settingsAPI.getSettings();
                setSiteSettings(prev => ({
                    ...prev,
                    ...settingsRes.data,
                    contact_info: { ...prev.contact_info, ...(settingsRes.data.contact_info || {}) },
                    button_labels: { ...prev.button_labels, ...(settingsRes.data.button_labels || {}) },
                    categories: settingsRes.data.categories?.length > 0 ? settingsRes.data.categories : prev.categories,
                    email_provider: { ...prev.email_provider, ...(settingsRes.data.email_provider || {}) },
                    animation_settings: { ...prev.animation_settings, ...(settingsRes.data.animation_settings || {}) },
                }));
            } catch { /* ignore reload errors */ }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Import misslyckades: ' + (error.message || 'Okänt fel'));
        } finally {
            setImporting(false);
            setImportFile(null);
            if (importFileInputRef.current) importFileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, settingsRes] = await Promise.all([
                    authAPI.getProfile(),
                    settingsAPI.getSettings()
                ]);
                setProfile(profileRes.data);
                setSiteSettings(prev => ({
                    ...prev,
                    ...settingsRes.data,
                    contact_info: {
                        ...prev.contact_info,
                        ...(settingsRes.data.contact_info || {})
                    },
                    button_labels: {
                        ...prev.button_labels,
                        ...(settingsRes.data.button_labels || {})
                    },
                    categories: settingsRes.data.categories?.length > 0 
                        ? settingsRes.data.categories 
                        : prev.categories,
                    email_provider: {
                        ...prev.email_provider,
                        ...(settingsRes.data.email_provider || {})
                    },
                    animation_settings: {
                        ...prev.animation_settings,
                        ...(settingsRes.data.animation_settings || {})
                    },
                    seo: {
                        ...prev.seo,
                        ...(settingsRes.data.seo || {})
                    },
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Välj en bildfil');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Loggan måste vara mindre än 2MB');
            return;
        }

        setUploadingLogo(true);

        try {
            const ext = file.name.split('.').pop();
            const path = `settings/logo.${ext}`;
            // Upload to Supabase Storage (overwrite existing)
            const { error: upErr } = await supabase.storage
                .from('gallery')
                .upload(path, file, { upsert: true });
            if (upErr) throw upErr;

            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(path);

            // Add cache-bust so browser doesn't show old logo
            const url = `${publicUrl}?v=${Date.now()}`;
            await settingsAPI.updateSettings({ logo_url: url });
            setSiteSettings(prev => ({ ...prev, logo_url: url }));
            toast.success('Logga uppladdad');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Kunde inte ladda upp logga: ' + (error.message || ''));
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleRemoveLogo = async () => {
        try {
            await settingsAPI.updateSettings({ logo_url: '' });
            setSiteSettings(prev => ({ ...prev, logo_url: '' }));
            toast.success('Logga borttagen');
        } catch (error) {
            console.error('Error removing logo:', error);
            toast.error('Kunde inte ta bort logga');
        }
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
            toast.error('Välj en bild eller .ico-fil');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('Favicon måste vara mindre än 1MB');
            return;
        }
        setUploadingFavicon(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `settings/favicon.${ext}`;
            const { error: upErr } = await supabase.storage
                .from('gallery')
                .upload(path, file, { upsert: true });
            if (upErr) throw upErr;
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(path);
            const url = `${publicUrl}?v=${Date.now()}`;
            await settingsAPI.updateSettings({ favicon_url: url });
            setSiteSettings(prev => ({ ...prev, favicon_url: url }));
            // Update favicon in browser immediately
            let link = document.querySelector("link[rel~='icon']");
            if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
            link.href = url;
            toast.success('Favicon uppladdad');
        } catch (error) {
            console.error('Error uploading favicon:', error);
            toast.error('Kunde inte ladda upp favicon: ' + (error.message || ''));
        } finally {
            setUploadingFavicon(false);
        }
    };

    const handleRemoveFavicon = async () => {
        try {
            await settingsAPI.updateSettings({ favicon_url: '' });
            setSiteSettings(prev => ({ ...prev, favicon_url: '' }));
            toast.success('Favicon borttagen');
        } catch (error) {
            toast.error('Kunde inte ta bort favicon');
        }
    };

    const handleSaveSeo = async () => {
        setSavingSeo(true);
        try {
            await settingsAPI.updateSettings({ seo: siteSettings.seo });
            toast.success('SEO-inställningar sparade');
        } catch (error) {
            console.error('Error saving SEO:', error);
            toast.error('Kunde inte spara SEO-inställningar');
        } finally {
            setSavingSeo(false);
        }
    };

    const handleContactImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Välj en bildfil');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Bilden måste vara mindre än 5MB');
            return;
        }

        setUploadingContactImage(true);

        try {
            const ext = file.name.split('.').pop();
            const path = `settings/contact-bg.${ext}`;
            const { error: upErr } = await supabase.storage
                .from('gallery')
                .upload(path, file, { upsert: true });
            if (upErr) throw upErr;

            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(path);

            const url = `${publicUrl}?v=${Date.now()}`;
            await settingsAPI.updateSettings({ contact_image_url: url });
            setSiteSettings(prev => ({ ...prev, contact_image_url: url }));
            toast.success('Kontaktbild uppladdad');
        } catch (error) {
            console.error('Error uploading contact image:', error);
            toast.error('Kunde inte ladda upp bilden: ' + (error.message || ''));
        } finally {
            setUploadingContactImage(false);
        }
    };

    const handleRemoveContactImage = async () => {
        try {
            await settingsAPI.updateSettings({ contact_image_url: '' });
            setSiteSettings(prev => ({ ...prev, contact_image_url: '' }));
            toast.success('Kontaktbild borttagen');
        } catch (error) {
            console.error('Error removing contact image:', error);
            toast.error('Kunde inte ta bort bilden');
        }
    };

    const handleSaveEmailSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        
        try {
            await settingsAPI.updateSettings({
                mailtrap_api_key: siteSettings.mailtrap_api_key,
                recipient_email: siteSettings.recipient_email,
            });
            toast.success('E-postinställningar sparade');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Kunde inte spara inställningar');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSaveContactInfo = async (e) => {
        e.preventDefault();
        setSavingContact(true);
        
        try {
            await settingsAPI.updateSettings({
                contact_info: siteSettings.contact_info,
            });
            toast.success('Kontaktinformation sparad');
        } catch (error) {
            console.error('Error saving contact info:', error);
            toast.error('Kunde inte spara kontaktinformation');
        } finally {
            setSavingContact(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Lösenorden matchar inte');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error('Lösenordet måste vara minst 8 tecken');
            return;
        }

        setChangingPassword(true);
        try {
            await authAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
            toast.success('Lösenord uppdaterat');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            const message = error.response?.data?.detail || 'Kunde inte byta lösenord';
            toast.error(message);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        
        if (newAdminForm.password.length < 8) {
            toast.error('Lösenordet måste vara minst 8 tecken');
            return;
        }

        setAddingAdmin(true);
        try {
            await authAPI.register(newAdminForm.email, newAdminForm.password, newAdminForm.name);
            toast.success('Ny admin tillagd');
            setNewAdminForm({ name: '', email: '', password: '' });
        } catch (error) {
            console.error('Error adding admin:', error);
            const message = error.response?.data?.detail || 'Kunde inte lägga till admin';
            toast.error(message);
        } finally {
            setAddingAdmin(false);
        }
    };

    const updateContactInfo = (field, value) => {
        setSiteSettings(prev => ({
            ...prev,
            contact_info: {
                ...prev.contact_info,
                [field]: value
            }
        }));
    };

    const updateButtonLabel = (field, value) => {
        setSiteSettings(prev => ({
            ...prev,
            button_labels: {
                ...prev.button_labels,
                [field]: value
            }
        }));
    };

    const handleSaveButtonLabels = async (e) => {
        e.preventDefault();
        setSavingButtons(true);
        
        try {
            await settingsAPI.updateSettings({
                button_labels: siteSettings.button_labels,
            });
            toast.success('Knapptexter sparade');
        } catch (error) {
            console.error('Error saving button labels:', error);
            toast.error('Kunde inte spara knapptexter');
        } finally {
            setSavingButtons(false);
        }
    };

    const addCategory = () => {
        if (!newCategory.name.trim()) {
            toast.error('Ange ett kategorinamn');
            return;
        }
        
        const slug = newCategory.slug.trim() || newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const id = slug;
        
        // Check for duplicates
        if (siteSettings.categories.some(c => c.slug === slug || c.id === id)) {
            toast.error('Denna kategori finns redan');
            return;
        }
        
        setSiteSettings(prev => ({
            ...prev,
            categories: [...prev.categories, { id, name: newCategory.name.trim(), slug }]
        }));
        setNewCategory({ name: '', slug: '' });
    };

    const removeCategory = (categoryId) => {
        setSiteSettings(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== categoryId)
        }));
    };

    const handleSaveCategories = async (e) => {
        e.preventDefault();
        setSavingCategories(true);
        
        try {
            await settingsAPI.updateSettings({
                categories: siteSettings.categories,
            });
            toast.success('Kategorier sparade');
        } catch (error) {
            console.error('Error saving categories:', error);
            toast.error('Kunde inte spara kategorier');
        } finally {
            setSavingCategories(false);
        }
    };

    // Email Provider Functions
    const updateEmailProvider = (field, value) => {
        setSiteSettings(prev => ({
            ...prev,
            email_provider: {
                ...prev.email_provider,
                [field]: value
            }
        }));
    };

    const handleSaveEmailProvider = async (e) => {
        e.preventDefault();
        setSavingEmail(true);
        
        try {
            await settingsAPI.updateSettings({
                email_provider: siteSettings.email_provider,
                recipient_email: siteSettings.recipient_email,
            });
            toast.success('E-postinställningar sparade');
        } catch (error) {
            console.error('Error saving email provider:', error);
            toast.error('Kunde inte spara e-postinställningar');
        } finally {
            setSavingEmail(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast.error('Ange en e-postadress för test');
            return;
        }
        
        setTestingEmail(true);
        try {
            await settingsAPI.testEmail(testEmailAddress);
            toast.success('Testmail skickat! Kolla din inkorg.');
        } catch (error) {
            console.error('Error sending test email:', error);
            // Show the actual error from the server so user knows what to fix
            const msg = error.message || error.response?.data?.detail || 'Kunde inte skicka testmail';
            toast.error(msg, { duration: 8000 });
        } finally {
            setTestingEmail(false);
        }
    };

    const getCurrentProviderFields = () => {
        const provider = EMAIL_PROVIDERS.find(p => p.value === siteSettings.email_provider?.provider);
        return provider?.fields || [];
    };

    // Animation Functions
    const updateAnimationSetting = (field, value) => {
        setSiteSettings(prev => ({
            ...prev,
            animation_settings: {
                ...prev.animation_settings,
                [field]: value
            }
        }));
    };

    const handleSaveAnimations = async (e) => {
        e.preventDefault();
        setSavingAnimations(true);
        
        try {
            await settingsAPI.updateSettings({
                animation_settings: siteSettings.animation_settings,
            });
            toast.success('Animationsinställningar sparade');
        } catch (error) {
            console.error('Error saving animations:', error);
            toast.error('Kunde inte spara animationsinställningar');
        } finally {
            setSavingAnimations(false);
        }
    };

    return (
        <AdminLayout title="Inställningar">
            <div className="max-w-2xl space-y-8">
                {/* Import / Export */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Import & Export
                        </CardTitle>
                        <CardDescription>
                            Säkerhetskopiera eller återställ allt innehåll: inställningar, galleri, videos, meddelanden, besökare, e-postleverantörskonfiguration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleExportAll}
                                disabled={exporting}
                                variant="outline"
                                className="flex-1"
                            >
                                {exporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Exporterar...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Exportera allt
                                    </>
                                )}
                            </Button>
                            <input
                                type="file"
                                ref={importFileInputRef}
                                onChange={handleImportFileSelect}
                                accept=".zip,.json"
                                className="hidden"
                            />
                            <Button
                                onClick={() => importFileInputRef.current?.click()}
                                disabled={importing}
                                variant="outline"
                                className="flex-1"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importerar...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                        Importera backup
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            Export skapar en komplett ZIP-backup med all data OCH alla bilder. Import fungerar med .zip (rekommenderas för migrering) eller äldre .json-filer.
                        </p>
                    </CardContent>
                </Card>

                <Separator />

                {/* Logo Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Image className="h-5 w-5" />
                            Logga
                        </CardTitle>
                        <CardDescription>Ladda upp din företagslogga (rekommenderat: PNG med transparent bakgrund)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                                    {siteSettings.logo_url ? (
                                        <img 
                                            src={siteSettings.logo_url} 
                                            alt="Logo" 
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <span className="text-xs">Ingen logga</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                    >
                                        {uploadingLogo ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Laddar upp...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Ladda upp logga
                                            </>
                                        )}
                                    </Button>
                                    {siteSettings.logo_url && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={handleRemoveLogo}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Ta bort
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Favicon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Favicon (Webbläsar-ikon)
                        </CardTitle>
                        <CardDescription>Ikonen som visas i webbläsarfliken och bokmärken. Använd PNG eller ICO, 32×32 eller 64×64px.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                                {siteSettings.favicon_url ? (
                                    <img src={siteSettings.favicon_url} alt="Favicon" className="w-10 h-10 object-contain" />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <Sparkles className="h-6 w-6 mx-auto mb-1 opacity-40" />
                                        <span className="text-xs">Ingen ikon</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <input type="file" ref={faviconInputRef} onChange={handleFaviconUpload} accept="image/*,.ico" className="hidden" />
                                <Button type="button" variant="outline" onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}>
                                    {uploadingFavicon ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Laddar upp...</> : <><Upload className="mr-2 h-4 w-4" />Ladda upp favicon</>}
                                </Button>
                                {siteSettings.favicon_url && (
                                    <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleRemoveFavicon}>
                                        <Trash2 className="mr-2 h-4 w-4" />Ta bort
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground">Rekommenderat: PNG 64×64px med transparent bakgrund</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            SEO — Google &amp; sociala medier
                        </CardTitle>
                        <CardDescription>Metadata som visas i Google-sökresultat och när du delar sidan på Instagram/Facebook.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Sidtitel <span className="text-muted-foreground text-xs">(visas i Google)</span></Label>
                                <Input
                                    value={siteSettings.seo?.meta_title || ''}
                                    onChange={e => setSiteSettings(prev => ({ ...prev, seo: { ...prev.seo, meta_title: e.target.value } }))}
                                    placeholder="Nisha Goriel Photography – Stockholm"
                                    maxLength={60}
                                />
                                <p className="text-xs text-muted-foreground">{(siteSettings.seo?.meta_title || '').length}/60 tecken — Google visar max 60</p>
                            </div>

                            <div className="space-y-1">
                                <Label>Beskrivning <span className="text-muted-foreground text-xs">(visas under titeln i Google)</span></Label>
                                <textarea
                                    value={siteSettings.seo?.meta_description || ''}
                                    onChange={e => setSiteSettings(prev => ({ ...prev, seo: { ...prev.seo, meta_description: e.target.value } }))}
                                    placeholder="Professionell bröllopsfotograf i Stockholm. Boka din fotografering idag."
                                    maxLength={160}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                                <p className="text-xs text-muted-foreground">{(siteSettings.seo?.meta_description || '').length}/160 tecken — Google visar max 160</p>
                            </div>

                            <div className="space-y-1">
                                <Label>Nyckelord <span className="text-muted-foreground text-xs">(kommaseparerade)</span></Label>
                                <Input
                                    value={siteSettings.seo?.meta_keywords || ''}
                                    onChange={e => setSiteSettings(prev => ({ ...prev, seo: { ...prev.seo, meta_keywords: e.target.value } }))}
                                    placeholder="bröllopsfotograf, stockholm, bröllop, fotografi"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Delningsbild (OG Image) <span className="text-muted-foreground text-xs">(URL till bild som visas vid delning)</span></Label>
                                <Input
                                    value={siteSettings.seo?.og_image || ''}
                                    onChange={e => setSiteSettings(prev => ({ ...prev, seo: { ...prev.seo, og_image: e.target.value } }))}
                                    placeholder="https://din-supabase-url/storage/v1/object/public/gallery/..."
                                />
                                <p className="text-xs text-muted-foreground">Tips: ladda upp en bild i galleriet och klistra in URL:en här. Rekommenderat 1200×630px.</p>
                            </div>

                            <Button onClick={handleSaveSeo} disabled={savingSeo}>
                                {savingSeo ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sparar...</> : 'Spara SEO'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Page Image */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Kontaktsidans Bakgrundsbild
                        </CardTitle>
                        <CardDescription>Bakgrundsbilden som visas på kontaktsidan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-6">
                                <div className="w-48 h-32 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                                    {siteSettings.contact_image_url ? (
                                        <img 
                                            src={siteSettings.contact_image_url} 
                                            alt="Kontaktbild" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <span className="text-xs">Ingen bild</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        ref={contactImageInputRef}
                                        onChange={handleContactImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => contactImageInputRef.current?.click()}
                                        disabled={uploadingContactImage}
                                    >
                                        {uploadingContactImage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Laddar upp...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Ladda upp bild
                                            </>
                                        )}
                                    </Button>
                                    {siteSettings.contact_image_url && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={handleRemoveContactImage}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Ta bort
                                        </Button>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Rekommenderad storlek: 1200x1600px
                                    </p>
                                </div>
                            </div>

                            {/* Opacity slider */}
                            <div className="space-y-3 pt-2 border-t border-border mt-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Bild-opacitet (bakgrundsmörker)</Label>
                                    <span className="text-sm font-mono font-semibold">
                                        {siteSettings.contact_image_opacity ?? 30}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={siteSettings.contact_image_opacity ?? 30}
                                    onChange={(e) => {
                                        setSiteSettings(prev => ({ ...prev, contact_image_opacity: Number(e.target.value) }));
                                    }}
                                    className="w-full accent-yellow-500"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Transparent (0%)</span>
                                    <span>Mörk (100%)</span>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={async () => {
                                        try {
                                            await settingsAPI.updateSettings({ contact_image_opacity: siteSettings.contact_image_opacity ?? 30 });
                                            toast.success('Opacitet sparad');
                                        } catch {
                                            toast.error('Kunde inte spara opacitet');
                                        }
                                    }}
                                >
                                    Spara opacitet
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gallery Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Tags className="h-5 w-5" />
                            Gallerikategorier
                        </CardTitle>
                        <CardDescription>Hantera kategorier för galleriet (t.ex. Wedding, Pre-Wedding)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveCategories} className="space-y-4">
                            {/* Existing categories */}
                            <div className="space-y-2">
                                <Label>Nuvarande kategorier</Label>
                                <div className="flex flex-wrap gap-2">
                                    {siteSettings.categories.map((cat) => (
                                        <div 
                                            key={cat.id}
                                            className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md"
                                        >
                                            <span className="text-sm">{cat.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(cat.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Add new category */}
                            <div className="space-y-2">
                                <Label>Lägg till ny kategori</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Kategorinamn (t.ex. Porträtt)"
                                        className="flex-1"
                                    />
                                    <Input
                                        value={newCategory.slug}
                                        onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="Slug (valfritt)"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addCategory}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Slug genereras automatiskt om du lämnar den tom
                                </p>
                            </div>
                            
                            <Button type="submit" disabled={savingCategories}>
                                {savingCategories ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sparar...
                                    </>
                                ) : (
                                    'Spara kategorier'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Button Labels */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Type className="h-5 w-5" />
                            Knapptexter
                        </CardTitle>
                        <CardDescription>Anpassa texten på alla knappar på webbplatsen</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveButtonLabels} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Visa Galleri (View Gallery)</Label>
                                <Input
                                    value={siteSettings.button_labels.view_gallery}
                                    onChange={(e) => updateButtonLabel('view_gallery', e.target.value)}
                                    placeholder="View Gallery"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Boka Session (Book a Session)</Label>
                                <Input
                                    value={siteSettings.button_labels.book_session}
                                    onChange={(e) => updateButtonLabel('book_session', e.target.value)}
                                    placeholder="Book a Session"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Boka Nu (Book Now)</Label>
                                <Input
                                    value={siteSettings.button_labels.book_now}
                                    onChange={(e) => updateButtonLabel('book_now', e.target.value)}
                                    placeholder="Book Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kontakta Oss (Get in Touch)</Label>
                                <Input
                                    value={siteSettings.button_labels.get_in_touch}
                                    onChange={(e) => updateButtonLabel('get_in_touch', e.target.value)}
                                    placeholder="Get in Touch"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Skicka Meddelande</Label>
                                <Input
                                    value={siteSettings.button_labels.send_message}
                                    onChange={(e) => updateButtonLabel('send_message', e.target.value)}
                                    placeholder="Skicka meddelande"
                                />
                            </div>
                            <Button type="submit" disabled={savingButtons}>
                                {savingButtons ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sparar...
                                    </>
                                ) : (
                                    'Spara knapptexter'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contact Info Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Kontaktinformation
                        </CardTitle>
                        <CardDescription>Informationen som visas på kontaktsidan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveContactInfo} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Plats</Label>
                                <Input
                                    value={siteSettings.contact_info.location}
                                    onChange={(e) => updateContactInfo('location', e.target.value)}
                                    placeholder="t.ex. Stockholm, Sweden"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefon</Label>
                                <Input
                                    value={siteSettings.contact_info.phone}
                                    onChange={(e) => updateContactInfo('phone', e.target.value)}
                                    placeholder="+46 70 123 4567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-post (visas på sidan)</Label>
                                <Input
                                    type="email"
                                    value={siteSettings.contact_info.email}
                                    onChange={(e) => updateContactInfo('email', e.target.value)}
                                    placeholder="info@nishagoriel.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Öppettider</Label>
                                <Input
                                    value={siteSettings.contact_info.hours}
                                    onChange={(e) => updateContactInfo('hours', e.target.value)}
                                    placeholder="t.ex. Mån - Fre: 9:00 - 18:00"
                                />
                            </div>
                            <Button type="submit" disabled={savingContact}>
                                {savingContact ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sparar...
                                    </>
                                ) : (
                                    'Spara kontaktinformation'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Email Provider Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            E-postleverantör
                        </CardTitle>
                        <CardDescription>
                            Välj leverantör och konfigurera – kontaktformuläret skickar e-post via denna inställning
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveEmailProvider} className="space-y-4">

                            {/* Recipient email - always visible */}
                            <div className="space-y-2">
                                <Label>Mottagare (din e-post)</Label>
                                <Input
                                    type="email"
                                    value={siteSettings.recipient_email}
                                    onChange={(e) => setSiteSettings(prev => ({ ...prev, recipient_email: e.target.value }))}
                                    placeholder="Vart kontaktförfrågningar skickas"
                                />
                                <p className="text-xs text-muted-foreground">Hit skickas alla meddelanden från kontaktformuläret</p>
                            </div>

                            <Separator />
                            <div className="space-y-2">
                                <Label>Leverantör</Label>
                                <Select 
                                    value={siteSettings.email_provider?.provider || 'none'} 
                                    onValueChange={(value) => updateEmailProvider('provider', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Välj leverantör" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EMAIL_PROVIDERS.map((provider) => (
                                            <SelectItem key={provider.value} value={provider.value}>
                                                {provider.label} {provider.free && <span className="text-muted-foreground ml-2">({provider.free} free)</span>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* ── Resend-specifik varning ── */}
                            {siteSettings.email_provider?.provider === 'resend' && (
                                <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm space-y-2">
                                    <p className="font-semibold text-amber-400">⚠️ Viktigt – Resend avsändaradress</p>
                                    <p className="text-muted-foreground">
                                        <strong>onboarding@resend.dev</strong> fungerar <em>bara</em> för att skicka till den e-postadress du registrerade på resend.com. 
                                        För att skicka till valfri mottagare måste du verifiera en egen domän.
                                    </p>
                                    <p className="text-muted-foreground">
                                        <strong>Snabbfix utan domän:</strong> Sätt <em>Avsändar-e-post</em> till <code className="bg-muted px-1 rounded">onboarding@resend.dev</code> och <em>Mottagare</em> till exakt samma e-post som du registrerade på resend.com.
                                    </p>
                                    <p className="text-muted-foreground">
                                        <strong>Permanent lösning:</strong> Verifiera din domän på <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline text-amber-400">resend.com/domains</a> → lägg in DNS-poster hos din domänleverantör → sätt sedan t.ex. <code className="bg-muted px-1 rounded">noreply@dindomän.com</code> som avsändaradress.
                                    </p>
                                </div>
                            )}

                            {getCurrentProviderFields().includes('api_key') && (
                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input
                                        type="password"
                                        value={siteSettings.email_provider?.api_key || ''}
                                        onChange={(e) => updateEmailProvider('api_key', e.target.value)}
                                        placeholder="Ange API-nyckel"
                                    />
                                </div>
                            )}

                            {getCurrentProviderFields().includes('api_secret') && (
                                <div className="space-y-2">
                                    <Label>API Secret</Label>
                                    <Input
                                        type="password"
                                        value={siteSettings.email_provider?.api_secret || ''}
                                        onChange={(e) => updateEmailProvider('api_secret', e.target.value)}
                                        placeholder="Ange API-hemlighet"
                                    />
                                </div>
                            )}

                            {getCurrentProviderFields().includes('domain') && (
                                <div className="space-y-2">
                                    <Label>Domän</Label>
                                    <Input
                                        type="text"
                                        value={siteSettings.email_provider?.domain || ''}
                                        onChange={(e) => updateEmailProvider('domain', e.target.value)}
                                        placeholder="t.ex. mg.example.com"
                                    />
                                </div>
                            )}

                            {getCurrentProviderFields().includes('smtp_host') && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>SMTP Host</Label>
                                            <Input
                                                type="text"
                                                value={siteSettings.email_provider?.smtp_host || ''}
                                                onChange={(e) => updateEmailProvider('smtp_host', e.target.value)}
                                                placeholder="smtp.example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>SMTP Port</Label>
                                            <Input
                                                type="number"
                                                value={siteSettings.email_provider?.smtp_port || 587}
                                                onChange={(e) => updateEmailProvider('smtp_port', parseInt(e.target.value))}
                                                placeholder="587"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SMTP Användarnamn</Label>
                                        <Input
                                            type="text"
                                            value={siteSettings.email_provider?.smtp_username || ''}
                                            onChange={(e) => updateEmailProvider('smtp_username', e.target.value)}
                                            placeholder="Användarnamn"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SMTP Lösenord</Label>
                                        <Input
                                            type="password"
                                            value={siteSettings.email_provider?.smtp_password || ''}
                                            onChange={(e) => updateEmailProvider('smtp_password', e.target.value)}
                                            placeholder="Lösenord"
                                        />
                                    </div>
                                </>
                            )}

                            {siteSettings.email_provider?.provider !== 'none' && (
                                <>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Avsändarnamn</Label>
                                            <Input
                                                type="text"
                                                value={siteSettings.email_provider?.sender_name || ''}
                                                onChange={(e) => updateEmailProvider('sender_name', e.target.value)}
                                                placeholder="Nisha Goriel Photography"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Avsändar-e-post</Label>
                                            <Input
                                                type="email"
                                                value={siteSettings.email_provider?.sender_email || ''}
                                                onChange={(e) => updateEmailProvider('sender_email', e.target.value)}
                                                placeholder="onboarding@resend.dev eller din@domän.com"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={savingEmail}>
                                    {savingEmail ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sparar...
                                        </>
                                    ) : (
                                        'Spara leverantör'
                                    )}
                                </Button>
                            </div>

                            {siteSettings.email_provider?.provider !== 'none' && (
                                <div className="pt-4 border-t space-y-2">
                                    <Label>Testa konfigurationen</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="email"
                                            value={testEmailAddress}
                                            onChange={(e) => setTestEmailAddress(e.target.value)}
                                            placeholder="test@example.com"
                                            className="flex-1"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={handleTestEmail}
                                            disabled={testingEmail}
                                        >
                                            {testingEmail ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Skicka test
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* Animation Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Animationer
                        </CardTitle>
                        <CardDescription>Anpassa animationer och övergångar på webbplatsen</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveAnimations} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Hero-animation</Label>
                                    <Select 
                                        value={siteSettings.animation_settings?.hero_animation || 'fade'} 
                                        onValueChange={(value) => updateAnimationSetting('hero_animation', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ANIMATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Galleri-animation</Label>
                                    <Select 
                                        value={siteSettings.animation_settings?.gallery_animation || 'fade'} 
                                        onValueChange={(value) => updateAnimationSetting('gallery_animation', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ANIMATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Sidövergång</Label>
                                    <Select 
                                        value={siteSettings.animation_settings?.page_transition || 'fade'} 
                                        onValueChange={(value) => updateAnimationSetting('page_transition', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ANIMATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Animationshastighet</Label>
                                    <Select 
                                        value={siteSettings.animation_settings?.animation_speed || 'normal'} 
                                        onValueChange={(value) => updateAnimationSetting('animation_speed', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SPEED_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" disabled={savingAnimations}>
                                {savingAnimations ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sparar...
                                    </>
                                ) : (
                                    'Spara animationer'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Byt lösenord
                        </CardTitle>
                        <CardDescription>Uppdatera ditt admin-lösenord</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nuvarande lösenord</Label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                    >
                                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Nytt lösenord</Label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                        minLength={8}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    >
                                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Bekräfta nytt lösenord</Label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    >
                                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" disabled={changingPassword}>
                                {changingPassword ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uppdaterar...
                                    </>
                                ) : (
                                    'Uppdatera lösenord'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Separator />

                {/* Add New Admin */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Lägg till ny admin
                        </CardTitle>
                        <CardDescription>Skapa ett nytt admin-konto för teammedlemmar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Namn</Label>
                                <Input
                                    value={newAdminForm.name}
                                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Admin namn"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-post</Label>
                                <Input
                                    type="email"
                                    value={newAdminForm.email}
                                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lösenord</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newAdminForm.password}
                                        onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Minst 8 tecken"
                                        required
                                        minLength={8}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button type="submit" disabled={addingAdmin}>
                                {addingAdmin ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Lägger till...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Lägg till admin
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Import Confirmation Dialog */}
            <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bekräfta import</AlertDialogTitle>
                        <AlertDialogDescription>
                            Är du säker på att du vill importera data från <strong>{importFile?.name}</strong>?
                            {importFile?.name.endsWith('.zip') 
                                ? ' ZIP-backupen innehåller bilder som kommer att laddas upp till Storage samt all databasdata.' 
                                : ' JSON-backupen innehåller all databasdata.'
                            } Existerande poster med samma ID skrivs över.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setImportFile(null); if (importFileInputRef.current) importFileInputRef.current.value = ''; }}>
                            Avbryt
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleImportConfirm}>
                            Importera
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminSettings;
