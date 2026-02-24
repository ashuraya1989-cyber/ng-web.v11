import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Calendar, Trash2, CheckCircle, Circle, MessageSquare, Send, Loader2, Reply, Globe, Monitor } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { contactAPI } from '../../lib/api';

// Helper to parse user agent string
const parseUserAgent = (ua) => {
    if (!ua) return 'Okänd enhet';
    
    let device = 'Dator';
    let browser = '';
    let os = '';
    
    // Detect mobile
    if (/mobile/i.test(ua)) device = 'Mobil';
    if (/tablet|ipad/i.test(ua)) device = 'Surfplatta';
    
    // Detect OS
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os/i.test(ua)) os = 'Mac';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    
    // Detect browser
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    
    return `${device}${os ? ` • ${os}` : ''}${browser ? ` • ${browser}` : ''}`;
};

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [replyDialog, setReplyDialog] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await contactAPI.getMessages();
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Kunde inte ladda meddelanden');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleMarkAsRead = async (id) => {
        try {
            await contactAPI.markAsRead(id);
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === id ? { ...msg, is_read: true } : msg
                )
            );
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => ({ ...prev, is_read: true }));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteMessage) return;
        
        try {
            await contactAPI.deleteMessage(deleteMessage.id);
            toast.success('Meddelande borttaget');
            setMessages(prev => prev.filter(msg => msg.id !== deleteMessage.id));
            if (selectedMessage?.id === deleteMessage.id) {
                setSelectedMessage(null);
            }
            setDeleteMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Kunde inte ta bort meddelande');
        }
    };

    const openReplyDialog = (message) => {
        setReplyDialog(message);
        setReplyText(`Hej ${message.name.split(' ')[0]},\n\nTack för ditt meddelande!\n\n\n\nMed vänliga hälsningar,\nNisha Goriel Photography`);
    };

    const handleSendReply = async () => {
        if (!replyDialog || !replyText.trim()) {
            toast.error('Skriv ett meddelande först');
            return;
        }

        setSendingReply(true);
        try {
            await contactAPI.replyToMessage(replyDialog.id, replyText);
            toast.success(`Svar skickat till ${replyDialog.email}`);
            setReplyDialog(null);
            setReplyText('');
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Kunde inte skicka svar. Kontrollera e-postinställningarna.');
        } finally {
            setSendingReply(false);
        }
    };

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <AdminLayout title="Meddelanden">
            {/* Stats */}
            <div className="mb-6">
                <Badge variant="secondary" className="text-modern">
                    {unreadCount} olästa {unreadCount === 1 ? 'meddelande' : 'meddelanden'}
                </Badge>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-lg">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Inga meddelanden än</h3>
                    <p className="text-muted-foreground">Kontaktförfrågningar visas här</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Messages List */}
                    <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => {
                                    setSelectedMessage(message);
                                    if (!message.is_read) {
                                        handleMarkAsRead(message.id);
                                    }
                                }}
                                className={`bg-card border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedMessage?.id === message.id 
                                        ? 'border-foreground' 
                                        : message.is_read 
                                            ? 'border-border hover:border-foreground/30' 
                                            : 'border-foreground/30 bg-muted/50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {message.is_read ? (
                                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-foreground fill-foreground" />
                                        )}
                                        <h3 className="font-medium text-foreground">
                                            {message.name}
                                        </h3>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(message.created_at), 'd MMM yyyy')}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {message.message}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:sticky lg:top-6">
                        {selectedMessage ? (
                            <div className="bg-card border border-border rounded-lg p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-elegant text-2xl text-foreground">
                                            {selectedMessage.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {format(new Date(selectedMessage.created_at), "d MMMM yyyy 'kl.' HH:mm")}
                                        </p>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteMessage(selectedMessage)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                            {selectedMessage.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                            {selectedMessage.phone || 'Ej angiven'}
                                        </span>
                                    </div>
                                    {/* IP and Location */}
                                    {selectedMessage.ip_address && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {selectedMessage.ip_address}
                                                {selectedMessage.city && selectedMessage.country && (
                                                    <span className="text-muted-foreground ml-2">
                                                        ({selectedMessage.city}, {selectedMessage.country})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {/* Device Info */}
                                    {selectedMessage.user_agent && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Monitor className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {parseUserAgent(selectedMessage.user_agent)}
                                            </span>
                                        </div>
                                    )}
                                    {selectedMessage.booking_date && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">
                                                {format(new Date(selectedMessage.booking_date), 'd MMMM yyyy')}
                                            </span>
                                        </div>
                                    )}
                                    {selectedMessage.venue && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-foreground">{selectedMessage.venue}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Message */}
                                <div className="border-t border-border pt-6">
                                    <h3 className="text-sm text-muted-foreground text-modern uppercase tracking-wider mb-3">
                                        Meddelande
                                    </h3>
                                    <p className="text-foreground whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 pt-6 border-t border-border space-y-3">
                                    <Button 
                                        className="w-full bg-foreground text-background hover:bg-foreground/90"
                                        onClick={() => openReplyDialog(selectedMessage)}
                                    >
                                        <Reply className="mr-2 h-4 w-4" />
                                        Svara kunden
                                    </Button>
                                    <a href={`tel:${selectedMessage.phone}`} className="block">
                                        <Button variant="outline" className="w-full">
                                            <Phone className="mr-2 h-4 w-4" />
                                            Ring {selectedMessage.name.split(' ')[0]}
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                                <p>Välj ett meddelande för att se detaljer</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reply Dialog */}
            <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-elegant">Svara {replyDialog?.name}</DialogTitle>
                    </DialogHeader>
                    {replyDialog && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                <p className="text-muted-foreground">Till: <span className="text-foreground">{replyDialog.email}</span></p>
                            </div>
                            <div className="space-y-2">
                                <Label>Ditt svar</Label>
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={10}
                                    className="resize-none"
                                    placeholder="Skriv ditt svar här..."
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Svaret skickas via din konfigurerade e-postleverantör
                            </p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyDialog(null)}>
                            Avbryt
                        </Button>
                        <Button 
                            onClick={handleSendReply} 
                            disabled={sendingReply || !replyText.trim()}
                            className="bg-foreground text-background hover:bg-foreground/90"
                        >
                            {sendingReply ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Skickar...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Skicka svar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteMessage} onOpenChange={() => setDeleteMessage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ta bort meddelande</AlertDialogTitle>
                        <AlertDialogDescription>
                            Är du säker på att du vill ta bort meddelandet från {deleteMessage?.name}? 
                            Detta kan inte ångras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
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

export default AdminMessages;
