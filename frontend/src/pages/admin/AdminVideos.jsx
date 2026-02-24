import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit2, Loader2, Video, Upload, Link as LinkIcon, Play } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { videosAPI } from '../../lib/api';

const AdminVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [deleteVideo, setDeleteVideo] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        vimeo_url: '',
        video_url: '',
        description: '',
        thumbnail_url: '',
        display_type: 'embed',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const thumbnailInputRef = useRef(null);

    const fetchVideos = useCallback(async () => {
        try {
            const response = await videosAPI.getVideos();
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const extractVimeoId = (url) => {
        if (!url) return null;
        const patterns = [
            /vimeo\.com\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/,
            /vimeo\.com\/video\/(\d+)/,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Thumbnail must be smaller than 2MB');
            return;
        }

        setUploadingThumbnail(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData(prev => ({ ...prev, thumbnail_url: event.target.result }));
            setUploadingThumbnail(false);
        };
        reader.readAsDataURL(file);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            vimeo_url: '',
            video_url: '',
            description: '',
            thumbnail_url: '',
            display_type: 'embed',
        });
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        
        let vimeoId = null;
        if (formData.display_type === 'embed') {
            vimeoId = extractVimeoId(formData.vimeo_url);
            if (!vimeoId) {
                toast.error('Invalid Vimeo URL');
                return;
            }
        } else if (!formData.video_url) {
            toast.error('Please enter a video link');
            return;
        }

        setSubmitting(true);
        try {
            await videosAPI.addVideo({
                title: formData.title,
                vimeo_id: vimeoId,
                video_url: formData.display_type === 'link' ? formData.video_url : null,
                description: formData.description,
                thumbnail_url: formData.thumbnail_url,
                display_type: formData.display_type,
            });
            toast.success('Video added successfully');
            setIsAddDialogOpen(false);
            resetForm();
            fetchVideos();
        } catch (error) {
            console.error('Error adding video:', error);
            toast.error('Failed to add video');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditDialog = (video) => {
        setEditingVideo({
            ...video,
            vimeo_url: video.vimeo_id ? `https://vimeo.com/${video.vimeo_id}` : '',
        });
    };

    const handleUpdateVideo = async () => {
        if (!editingVideo) return;
        
        let vimeoId = editingVideo.vimeo_id;
        if (editingVideo.display_type === 'embed' && editingVideo.vimeo_url) {
            vimeoId = extractVimeoId(editingVideo.vimeo_url);
        }

        setSubmitting(true);
        try {
            await videosAPI.updateVideo(editingVideo.id, {
                title: editingVideo.title,
                description: editingVideo.description,
                vimeo_id: vimeoId,
                video_url: editingVideo.video_url,
                thumbnail_url: editingVideo.thumbnail_url,
                display_type: editingVideo.display_type,
            });
            toast.success('Video updated');
            setEditingVideo(null);
            fetchVideos();
        } catch (error) {
            console.error('Error updating video:', error);
            toast.error('Failed to update video');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteVideo = async () => {
        if (!deleteVideo) return;
        
        try {
            await videosAPI.deleteVideo(deleteVideo.id);
            toast.success('Video deleted');
            setDeleteVideo(null);
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Failed to delete video');
        }
    };

    return (
        <AdminLayout title="Film Management">
            {/* Add Video Button */}
            <div className="mb-8">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Lägg till Film
                </Button>
            </div>

            {/* Videos Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-video bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-lg">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Inga filmer än</h3>
                    <p className="text-muted-foreground mb-4">Lägg till din första film</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Lägg till Film
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((video) => (
                        <div key={video.id} className="bg-card border border-border rounded-lg overflow-hidden">
                            {/* Thumbnail/Preview */}
                            <div className="aspect-video bg-muted relative group">
                                {video.thumbnail_url ? (
                                    <img 
                                        src={video.thumbnail_url} 
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : video.vimeo_id ? (
                                    <img 
                                        src={`https://vumbnail.com/${video.vimeo_id}.jpg`}
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="h-12 w-12 text-muted-foreground/30" />
                                    </div>
                                )}
                                
                                {/* Type Badge */}
                                <div className="absolute top-2 left-2">
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        video.display_type === 'embed' 
                                            ? 'bg-black/60 text-white' 
                                            : 'bg-white/90 text-black'
                                    }`}>
                                        {video.display_type === 'embed' ? 'Embed' : 'Link'}
                                    </span>
                                </div>

                                {/* Play icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                    <Play className="h-12 w-12 text-white" fill="white" />
                                </div>
                            </div>

                            {/* Video Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-foreground text-elegant truncate">
                                            {video.title}
                                        </h3>
                                        {video.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => openEditDialog(video)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteVideo(video)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Video Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-elegant">Lägg till Film</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddVideo} className="space-y-6 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label>Titel *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="t.ex. Sara & Johan's Bröllop"
                                required
                            />
                        </div>

                        {/* Display Type */}
                        <div className="space-y-3">
                            <Label>Visningstyp</Label>
                            <RadioGroup
                                value={formData.display_type}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, display_type: value }))}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="embed" id="embed" />
                                    <Label htmlFor="embed" className="font-normal cursor-pointer">
                                        Embed (Vimeo)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="link" id="link" />
                                    <Label htmlFor="link" className="font-normal cursor-pointer">
                                        Extern länk
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Conditional Fields */}
                        {formData.display_type === 'embed' ? (
                            <div className="space-y-2">
                                <Label>Vimeo URL *</Label>
                                <Input
                                    value={formData.vimeo_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vimeo_url: e.target.value }))}
                                    placeholder="https://vimeo.com/123456789"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Videon visas inbäddad utan Vimeo-branding
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Video-länk *</Label>
                                <Input
                                    value={formData.video_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                                    placeholder="https://example.com/video.mp4"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Besökare öppnar länken i nytt fönster
                                </p>
                            </div>
                        )}

                        {/* Thumbnail */}
                        <div className="space-y-2">
                            <Label>Miniatyrbild (valfri)</Label>
                            <div className="flex items-center gap-4">
                                {formData.thumbnail_url ? (
                                    <div className="w-24 h-16 rounded overflow-hidden bg-muted">
                                        <img 
                                            src={formData.thumbnail_url} 
                                            alt="Thumbnail" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-16 rounded bg-muted flex items-center justify-center">
                                        <Video className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    onChange={handleThumbnailUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    disabled={uploadingThumbnail}
                                >
                                    {uploadingThumbnail ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Ladda upp
                                        </>
                                    )}
                                </Button>
                                {formData.thumbnail_url && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Egen miniatyrbild visas istället för Vimeo-thumbnail
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Beskrivning (valfri)</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Kort beskrivning av filmen"
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                                Avbryt
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Lägger till...
                                    </>
                                ) : (
                                    'Lägg till Film'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Video Dialog */}
            <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-elegant">Redigera Film</DialogTitle>
                    </DialogHeader>
                    {editingVideo && (
                        <div className="space-y-6 py-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Titel</Label>
                                <Input
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            {/* Display Type */}
                            <div className="space-y-3">
                                <Label>Visningstyp</Label>
                                <RadioGroup
                                    value={editingVideo.display_type || 'embed'}
                                    onValueChange={(value) => setEditingVideo(prev => ({ ...prev, display_type: value }))}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="embed" id="edit-embed" />
                                        <Label htmlFor="edit-embed" className="font-normal cursor-pointer">
                                            Embed (Vimeo)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="link" id="edit-link" />
                                        <Label htmlFor="edit-link" className="font-normal cursor-pointer">
                                            Extern länk
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Conditional Fields */}
                            {(editingVideo.display_type || 'embed') === 'embed' ? (
                                <div className="space-y-2">
                                    <Label>Vimeo URL</Label>
                                    <Input
                                        value={editingVideo.vimeo_url || ''}
                                        onChange={(e) => setEditingVideo(prev => ({ ...prev, vimeo_url: e.target.value }))}
                                        placeholder="https://vimeo.com/123456789"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Video-länk</Label>
                                    <Input
                                        value={editingVideo.video_url || ''}
                                        onChange={(e) => setEditingVideo(prev => ({ ...prev, video_url: e.target.value }))}
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            )}

                            {/* Thumbnail */}
                            <div className="space-y-2">
                                <Label>Miniatyrbild URL</Label>
                                <Input
                                    value={editingVideo.thumbnail_url || ''}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                    placeholder="https://example.com/thumbnail.jpg"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Beskrivning</Label>
                                <Textarea
                                    value={editingVideo.description || ''}
                                    onChange={(e) => setEditingVideo(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingVideo(null)}>
                            Avbryt
                        </Button>
                        <Button onClick={handleUpdateVideo} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sparar...
                                </>
                            ) : (
                                'Spara ändringar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ta bort film</AlertDialogTitle>
                        <AlertDialogDescription>
                            Är du säker på att du vill ta bort denna film? Detta kan inte ångras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteVideo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Ta bort
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminVideos;
