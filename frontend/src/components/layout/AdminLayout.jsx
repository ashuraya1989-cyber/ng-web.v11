import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Images, 
    Video, 
    MessageSquare, 
    Settings, 
    LogOut,
    Menu,
    X,
    ChevronRight,
    Type,
    BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';

const AdminLayout = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/gallery', label: 'Gallery', icon: Images },
        { href: '/admin/videos', label: 'Film', icon: Video },
        { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
        { href: '/admin/analytics', label: 'Statistik', icon: BarChart3 },
        { href: '/admin/typography', label: 'Typografi & Text', icon: Type },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <span className="text-elegant text-lg">Admin Panel</span>
                    <div className="w-10" />
                </div>
            </div>

            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 z-30 h-screen w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-border">
                        <Link to="/" className="text-elegant text-xl tracking-wider">
                            Nisha Goriel
                        </Link>
                        <p className="text-muted-foreground text-xs mt-1 text-modern uppercase tracking-wider">
                            Admin Panel
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-modern text-sm transition-all duration-200 ${
                                        isActive(item.href)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    {isActive(item.href) && (
                                        <ChevronRight className="w-4 h-4 ml-auto" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </Button>
                        <Link to="/" className="block mt-2">
                            <Button
                                variant="outline"
                                className="w-full"
                            >
                                View Website
                            </Button>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 z-20 bg-black/50"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                {/* Page Header */}
                <div className="bg-background border-b border-border px-6 py-6">
                    <h1 className="text-elegant text-2xl lg:text-3xl">{title}</h1>
                </div>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
