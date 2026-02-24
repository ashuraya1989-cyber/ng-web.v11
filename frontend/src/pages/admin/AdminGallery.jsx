import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Trash2, Edit2, Loader2, GripVertical, CheckSquare, X, ImagePlus } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { galleryAPI, settingsAPI } from '../../lib/api';

const defaultCategories = [
    { id: 'wedding', name: 'Wedding', slug: 'wedding' },
    { id: 'pre-wedding', name: 'Pre-Wedding', slug: 'pre-wedding' },
];

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState(defaultCategories);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });
    const [editingImage, setEditingImage] = useState(null);
    const [deleteImage, setDeleteImage] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('wedding');
    const [selectedFiles, setSelectedFiles] = useState([]);  // multi-file queue
    const [isDragOver, setIsDragOver] = useState(false);     // drop zone hover
    const fileInputRef = useRef(null);

    // Drag-to-reorder state
    const [draggedImage, setDraggedImage] = useState(null);
    const [dragOverImage, setDragOverImage] = useState(null);

    const fetchImages = useCallback(async () => {
        try {
            const [imagesRes, settingsRes] = await Promise.all([
                galleryAPI.getImages(),
                settingsAPI.getSettings()
            ]);
            setImages(imagesRes.data);
            if (settingsRes.data.categories?.length > 0) {
                setCategories(settingsRes.data.categories);
                setUploadCategory(settingsRes.data.categories[0].slug);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchImages(); }, [fetchImages]);

    // ── Multi-file selection ────────────────────────────────────────────────
    const handleFileSelect = (files) => {
        const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!arr.length) return;
        setSelectedFiles(arr);
    };

    const handleDropZoneDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const removeFileFromQueue = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ── Upload all selected files one by one ────────────────────────────────
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFiles.length) { toast.error('Välj minst en bild'); return; }

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setUploadProgress({ current: i + 1, total: selectedFiles.length, fileName: file.name });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
            formData.append('category', uploadCategory);
            try {
                await galleryAPI.uploadImage(formData);
                successCount++;
            } catch (err) {
                console.error('Upload error:', file.name, err);
                failCount++;
            }
        }

        setUploading(false);
        setUploadProgress({ current: 0, total: 0, fileName: '' });
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (successCount > 0) toast.success(`${successCount} bild${successCount > 1 ? 'er' : ''} uppladdad${successCount > 1 ? 'e' : ''}!`);
        if (failCount > 0) toast.error(`${failCount} bild${failCount > 1 ? 'er' : ''} misslyckades`);
        fetchImages();
    };

    const handleDelete = async () => {
        if (!deleteImage) return;
        try {
            await galleryAPI.deleteImage(deleteImage.id);
            toast.success('Bild borttagen');
            setDeleteImage(null);
            fetchImages();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Kunde inte ta bort bild');
        }
    };

    const handleUpdate = async () => {
        if (!editingImage) return;
        try {
            await galleryAPI.updateImage(editingImage.id, { title: editingImage.title, category: editingImage.category });
            toast.success('Bild uppdaterad');
            setEditingImage(null);
            fetchImages();
        } catch (error) {
            console.error('Error updating image:', error);
            toast.error('Kunde inte uppdatera bild');
        }
    };

    const filteredImages = activeTab === 'all'
        ? images
        : images.filter(img => img.category === activeTab);

    // ── Drag-to-reorder handlers ────────────────────────────────────────────
    const handleDragStart = (e, image) => {
        setDraggedImage(image);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', image.id);
    };

    const handleDragEnter = (e, image) => {
        e.preventDefault();
        if (draggedImage && draggedImage.id !== image.id) setDragOverImage(image);
    };

    const handleDrop = async (e, targetImage) => {
        e.preventDefault();
        if (!draggedImage || draggedImage.id === targetImage.id) {
            setDraggedImage(null); setDragOverImage(null); return;
        }

        const reordered = [...images];
        const dragIdx = reordered.findIndex(img => img.id === draggedImage.id);
        const dropIdx = reordered.findIndex(img => img.id === targetImage.id);
        const [moved] = reordered.splice(dragIdx, 1);
        reordered.splice(dropIdx, 0, moved);

        setImages(reordered);
        setDraggedImage(null);
        setDragOverImage(null);

        try {
            await galleryAPI.reorderImages(reordered);
            toast.success('Ordning sparad');
        } catch {
            toast.error('Kunde inte spara ordning');
            fetchImages();
        }
    };

    const handleDragEnd = () => { setDraggedImage(null); setDragOverImage(null); };

    const progressPct = uploadProgress.total > 0
        ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
        : 0;

    return (
        <AdminLayout title="Gallery Management">

            {/* ── Upload Section ───────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h2 className="text-elegant text-xl mb-6">Ladda upp bilder</h2>
                <form onSubmit={handleUpload} className="space-y-4">

                    {/* Drop zone */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragOver
                                ? 'border-foreground bg-foreground/5'
                                : 'border-border hover:border-foreground/40 hover:bg-muted/30'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDropZoneDrop}
                    >
                        <ImagePlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            Dra och släpp bilder hit, eller klicka för att välja
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Du kan välja flera bilder samtidigt (JPG, PNG, WEBP)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files)}
                        />
                    </div>

                    {/* File queue preview */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {selectedFiles.length} bild{selectedFiles.length > 1 ? 'er' : ''} vald{selectedFiles.length > 1 ? 'a' : ''}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative group aspect-square rounded overflow-hidden bg-muted">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFileFromQueue(i); }}
                                            className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3 text-white" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                                            <p className="text-white text-[9px] truncate">{file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress bar during upload */}
                    {uploading && uploadProgress.total > 0 && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Laddar upp {uploadProgress.current} av {uploadProgress.total}...</span>
                                <span>{progressPct}%</span>
                            </div>
                            <Progress value={progressPct} className="h-2" />
                            <p className="text-xs text-muted-foreground truncate">{uploadProgress.fileName}</p>
                        </div>
                    )}

                    {/* Category selector + upload button */}
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-2 min-w-[160px]">
                            <Label className="text-modern text-sm uppercase tracking-wider text-muted-foreground">
                                Kategori
                            </Label>
                            <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" disabled={uploading || !selectedFiles.length}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Laddar upp...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {selectedFiles.length > 1
                                        ? `Ladda upp ${selectedFiles.length} bilder`
                                        : 'Ladda upp bild'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* ── Gallery Grid ─────────────────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 mb-6 flex-wrap">
                    <TabsTrigger value="all" className="text-modern text-xs uppercase tracking-wider data-[state=active]:bg-background">
                        Alla ({images.length})
                    </TabsTrigger>
                    {categories.map((cat) => (
                        <TabsTrigger
                            key={cat.id}
                            value={cat.slug}
                            className="text-modern text-xs uppercase tracking-wider data-[state=active]:bg-background"
                        >
                            {cat.name} ({images.filter(i => i.category === cat.slug).length})
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>Inga bilder i denna kategori</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                                <GripVertical className="h-4 w-4" />
                                Dra och släpp bilder för att ändra ordning — ordningen sparas automatiskt
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredImages.map((image) => (
                                    <div
                                        key={image.id}
                                        className={`group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-150 ${
                                            draggedImage?.id === image.id ? 'opacity-30 scale-95 ring-2 ring-foreground/30' : ''
                                        } ${
                                            dragOverImage?.id === image.id ? 'ring-2 ring-foreground ring-offset-2' : ''
                                        }`}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, image)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragEnter={(e) => handleDragEnter(e, image)}
                                        onDragLeave={() => setDragOverImage(null)}
                                        onDrop={(e) => handleDrop(e, image)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.title || 'Gallery image'}
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                size="icon" variant="ghost"
                                                className="text-white hover:bg-white/20"
                                                onClick={() => setEditingImage(image)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon" variant="ghost"
                                                className="text-red-400 hover:bg-red-500/20"
                                                onClick={() => setDeleteImage(image)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Drag handle */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
                                        </div>

                                        {/* Category badge */}
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-0.5 text-[10px] bg-black/60 text-white rounded backdrop-blur-sm">
                                                {categories.find(c => c.slug === image.category)?.name || image.category}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* ── Edit Dialog ──────────────────────────────────────────────── */}
            <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-elegant">Redigera bild</DialogTitle>
                    </DialogHeader>
                    {editingImage && (
                        <div className="space-y-4 py-4">
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                <img src={editingImage.url} alt={editingImage.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2">
                                <Label>Titel</Label>
                                <Input
                                    value={editingImage.title || ''}
                                    onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select value={editingImage.category} onValueChange={(value) => setEditingImage(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingImage(null)}>Avbryt</Button>
                        <Button onClick={handleUpdate}>Spara ändringar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ──────────────────────────────────────── */}
            <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ta bort bild</AlertDialogTitle>
                        <AlertDialogDescription>
                            Är du säker på att du vill ta bort denna bild? Åtgärden kan inte ångras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Ta bort
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </AdminLayout>
    );
};

export default AdminGallery;
