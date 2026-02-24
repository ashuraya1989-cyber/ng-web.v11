import React, { useState, useEffect } from 'react';
import { Images, Video, MessageSquare, Eye } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { galleryAPI, videosAPI, contactAPI } from '../../lib/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        images: 0,
        videos: 0,
        messages: 0,
        unreadMessages: 0,
    });
    const [recentMessages, setRecentMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [imagesRes, videosRes, messagesRes] = await Promise.all([
                    galleryAPI.getImages(),
                    videosAPI.getVideos(),
                    contactAPI.getMessages(),
                ]);

                const messages = messagesRes.data;
                const unread = messages.filter(m => !m.is_read).length;

                setStats({
                    images: imagesRes.data.length,
                    videos: videosRes.data.length,
                    messages: messages.length,
                    unreadMessages: unread,
                });

                setRecentMessages(messages.slice(0, 5));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        {
            title: 'Total Images',
            value: stats.images,
            icon: Images,
            description: 'In gallery',
        },
        {
            title: 'Videos',
            value: stats.videos,
            icon: Video,
            description: 'Uploaded',
        },
        {
            title: 'Messages',
            value: stats.messages,
            icon: MessageSquare,
            description: `${stats.unreadMessages} unread`,
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground text-modern uppercase tracking-wider">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-light text-foreground text-elegant">
                                    {loading ? '...' : stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Messages */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-elegant text-xl">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : recentMessages.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No messages yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {recentMessages.map((message) => (
                                <div 
                                    key={message.id} 
                                    className={`p-4 rounded-lg border ${
                                        message.is_read 
                                            ? 'border-border bg-background' 
                                            : 'border-foreground/20 bg-muted/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-foreground">
                                                {message.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {message.email}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(message.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {message.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a 
                    href="/admin/gallery" 
                    className="p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors group"
                >
                    <Images className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                    <h3 className="font-medium text-foreground">Manage Gallery</h3>
                    <p className="text-sm text-muted-foreground">Upload and organize photos</p>
                </a>
                <a 
                    href="/admin/videos" 
                    className="p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors group"
                >
                    <Video className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                    <h3 className="font-medium text-foreground">Manage Videos</h3>
                    <p className="text-sm text-muted-foreground">Add Vimeo videos</p>
                </a>
                <a 
                    href="/admin/messages" 
                    className="p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors group"
                >
                    <MessageSquare className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                    <h3 className="font-medium text-foreground">View Messages</h3>
                    <p className="text-sm text-muted-foreground">Check contact requests</p>
                </a>
                <a 
                    href="/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 bg-card border border-border rounded-lg hover:border-foreground/30 transition-colors group"
                >
                    <Eye className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                    <h3 className="font-medium text-foreground">View Website</h3>
                    <p className="text-sm text-muted-foreground">See live changes</p>
                </a>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
