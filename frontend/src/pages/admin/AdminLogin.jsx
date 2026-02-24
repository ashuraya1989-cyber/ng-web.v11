import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { authAPI } from '../../lib/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authAPI.login(formData.email, formData.password);
            localStorage.setItem('adminToken', response.data.access_token);
            toast.success('Welcome back!');
            navigate('/admin');
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.detail || 'Invalid credentials';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-12">
                    <h1 className="text-elegant text-3xl tracking-wider mb-2">
                        Nisha Goriel
                    </h1>
                    <p className="text-muted-foreground text-modern text-sm uppercase tracking-widest">
                        Admin Panel
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                    <h2 className="text-foreground text-elegant text-2xl mb-8 text-center">
                        Sign In
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="email" 
                                className="text-modern text-sm uppercase tracking-wider text-muted-foreground"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="admin@example.com"
                                className="bg-background"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label 
                                htmlFor="password" 
                                className="text-modern text-sm uppercase tracking-wider text-muted-foreground"
                            >
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="bg-background pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 text-modern uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Back to website */}
                <p className="text-center mt-8 text-muted-foreground text-sm">
                    <a href="/" className="hover:text-foreground transition-colors">
                        ← Back to website
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
