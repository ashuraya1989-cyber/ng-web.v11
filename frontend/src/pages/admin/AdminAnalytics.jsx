import React, { useState, useEffect } from 'react';
import { Loader2, Users, Globe, Clock, TrendingUp, MapPin, Calendar, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import api from '../../lib/api';

const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const AdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [visitors, setVisitors] = useState([]);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchData = async () => {
        try {
            const [statsRes, visitorsRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/analytics/visitors', { params: { limit: 50 } })
            ]);
            setStats(statsRes.data);
            setVisitors(visitorsRes.data.visitors);
            setTotalVisitors(visitorsRes.data.total);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Kunde inte hämta statistik');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        toast.success('Statistik uppdaterad');
    };

    const handleFilter = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
            if (dateTo) params.date_to = new Date(dateTo).toISOString();
            
            const response = await api.get('/analytics/visitors', { params });
            setVisitors(response.data.visitors);
            setTotalVisitors(response.data.total);
        } catch (error) {
            console.error('Error filtering:', error);
            toast.error('Kunde inte filtrera');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <AdminLayout title="Besöksstatistik">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Besöksstatistik">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground mt-2">
                            Spåra besökare, deras plats och tid på sidan
                        </p>
                    </div>
                    <Button 
                        onClick={handleRefresh} 
                        disabled={refreshing}
                        variant="outline"
                    >
                        {refreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Uppdatera
                    </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Totalt besökare</p>
                                        <p className="text-3xl font-bold text-elegant">{stats.total_visitors}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Idag</p>
                                        <p className="text-3xl font-bold text-elegant">{stats.today_visitors}</p>
                                    </div>
                                    <Calendar className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Senaste 7 dagar</p>
                                        <p className="text-3xl font-bold text-elegant">{stats.week_visitors}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Snitt besökstid</p>
                                        <p className="text-3xl font-bold text-elegant">{formatDuration(stats.avg_duration_seconds)}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Top Countries & Pages */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-elegant flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Topp länder
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.top_countries.length > 0 ? (
                                    <div className="space-y-3">
                                        {stats.top_countries.map((country, index) => (
                                            <div key={country.country} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                                                    <span className="font-medium">{country.country}</span>
                                                </div>
                                                <span className="text-muted-foreground">{country.count} besök</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Ingen data ännu</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-elegant flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Populära sidor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {stats.top_pages.length > 0 ? (
                                    <div className="space-y-3">
                                        {stats.top_pages.map((page, index) => (
                                            <div key={page.page} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                                                    <span className="font-medium">{page.page || '/'}</span>
                                                </div>
                                                <span className="text-muted-foreground">{page.count} besök</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">Ingen data ännu</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filter */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Filtrera besökare</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Från datum</Label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Till datum</Label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <Button onClick={handleFilter}>Filtrera</Button>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    fetchData();
                                }}
                            >
                                Rensa
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Visitors Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-elegant">Senaste besökare</CardTitle>
                        <CardDescription>Totalt {totalVisitors} besökare loggade</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Datum/Tid</th>
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">IP-adress</th>
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Land</th>
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Stad</th>
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Sida</th>
                                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tid på sidan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visitors.length > 0 ? (
                                        visitors.map((visitor) => (
                                            <tr key={visitor.id} className="border-b border-border/50 hover:bg-muted/30">
                                                <td className="py-3 px-2">{formatDate(visitor.visit_start)}</td>
                                                <td className="py-3 px-2 font-mono text-xs">{visitor.ip_address}</td>
                                                <td className="py-3 px-2">{visitor.country || '-'}</td>
                                                <td className="py-3 px-2">{visitor.city || '-'}</td>
                                                <td className="py-3 px-2">{visitor.page_visited || '/'}</td>
                                                <td className="py-3 px-2">{formatDuration(visitor.duration_seconds)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                                Inga besökare loggade ännu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminAnalytics;
