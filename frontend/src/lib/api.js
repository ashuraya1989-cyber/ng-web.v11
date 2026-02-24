import { supabase } from './supabase';

/**
 * Nisha Goriel Photography - Serverless API Layer
 * This communicates directly with Supabase and mimics Axios for compatibility.
 */

// Base URL for Vercel API functions (empty string = relative URLs, correct for Vercel deployment)
export const API_BASE_URL = '';

// Helper to handle Supabase responses
const handleResponse = async (promise) => {
  const { data, error } = await promise;
  if (error) {
    const axiosError = new Error(error.message);
    axiosError.response = {
      status: error.code === 'PGRST116' ? 404 : 400,
      data: { detail: error.message }
    };
    throw axiosError;
  }
  return { data };
};

// --- AUTH API ---
export const authAPI = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.setItem('adminToken', data.session.access_token);
    return { data: { access_token: data.session.access_token, user: data.user } };
  },
  register: (email, password, name) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),
  getProfile: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: { id: user.id, email: user.email, name: user.user_metadata?.name } };
  },
  updatePassword: async (currentPassword, newPassword) => {
    // Supabase requires re-authentication before password change.
    // We re-sign-in with the current password to verify it first.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('Not authenticated');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      const err = new Error('Current password is incorrect');
      err.response = { status: 401, data: { detail: 'Current password is incorrect' } };
      throw err;
    }

    return supabase.auth.updateUser({ password: newPassword });
  },
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminToken');
  }
};

// --- GALLERY API ---
export const galleryAPI = {
  getImages: async (category = null) => {
    let query = supabase.from('gallery').select('*').order('order', { ascending: true });
    if (category) query = query.eq('category', category);
    return handleResponse(query);
  },
  uploadImage: async (formData) => {
    const file = formData.get('file');
    const title = formData.get('title');
    const category = formData.get('category') || 'wedding';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('gallery').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(filePath);
    const { data: maxOrderData } = await supabase.from('gallery').select('order').order('order', { ascending: false }).limit(1);
    const maxOrder = maxOrderData?.[0]?.order ?? -1;

    return handleResponse(supabase.from('gallery').insert([{
      url: publicUrl, title, category, order: maxOrder + 1
    }]).select().single());
  },
  deleteImage: async (id) => {
    // Fetch URL so we can also delete the file from Storage
    const { data: img } = await supabase.from('gallery').select('url').eq('id', id).single();
    if (img?.url) {
      try {
        const marker = '/storage/v1/object/public/gallery/';
        const idx = img.url.indexOf(marker);
        if (idx !== -1) {
          const filePath = decodeURIComponent(img.url.substring(idx + marker.length));
          await supabase.storage.from('gallery').remove([filePath]);
        }
      } catch (e) {
        console.warn('Could not delete storage file (DB row will still be removed):', e);
      }
    }
    return handleResponse(supabase.from('gallery').delete().eq('id', id));
  },
  updateImage: (id, data) => handleResponse(supabase.from('gallery').update(data).eq('id', id).select().single()),
  reorderImages: (images) => handleResponse(
    supabase.from('gallery').upsert(
      images.map((img, i) => ({ id: img.id, order: i })),
      { onConflict: 'id' }
    )
  )
};

// --- VIDEOS API ---
export const videosAPI = {
  getVideos: () => handleResponse(supabase.from('videos').select('*').order('created_at', { ascending: false })),
  addVideo: async (videoData) => {
    let embedUrl = videoData.embed_url;
    if (videoData.vimeo_id && !embedUrl) {
      embedUrl = `https://player.vimeo.com/video/${videoData.vimeo_id}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
    }
    return handleResponse(supabase.from('videos').insert([{ ...videoData, embed_url: embedUrl }]).select().single());
  },
  deleteVideo: (id) => handleResponse(supabase.from('videos').delete().eq('id', id)),
  updateVideo: (id, data) => handleResponse(supabase.from('videos').update(data).eq('id', id).select().single()),
};

// --- CONTACT API ---
export const contactAPI = {
  sendMessage: async (data) => {
    // 1. Save to Supabase via server-side API (captures real IP + geo)
    try {
      const saveRes = await fetch('/api/save-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!saveRes.ok) {
        // Fallback: save directly via Supabase client (no IP)
        await handleResponse(supabase.from('contact_messages').insert([data]));
      }
    } catch (err) {
      await handleResponse(supabase.from('contact_messages').insert([data]));
    }

    // 2. Send email via Vercel Function
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }

    return { data: { success: true } };
  },
  getMessages: () => handleResponse(supabase.from('contact_messages').select('*').order('created_at', { ascending: false })),
  markAsRead: (id) => handleResponse(supabase.from('contact_messages').update({ is_read: true }).eq('id', id)),
  deleteMessage: (id) => handleResponse(supabase.from('contact_messages').delete().eq('id', id)),
  replyToMessage: async (id, replyText) => {
    // Fetch the original message to get the recipient's email
    const { data: msg, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    // Send reply email via Vercel function
    const response = await fetch('/api/send-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: msg.email,
        name: msg.name,
        originalMessage: msg.message,
        replyText,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send reply');
    }

    // Mark message as read after replying
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);

    return { data: { message: 'Reply sent successfully' } };
  }
};

// --- ANALYTICS API ---
export const analyticsAPI = {
  logVisit: (data) => supabase.from('visitors').insert([data]),
  getVisitors: async (params = {}) => {
    let query = supabase.from('visitors').select('*').order('visit_start', { ascending: false });
    if (params.limit) query = query.limit(params.limit);
    if (params.date_from) query = query.gte('visit_start', params.date_from);
    if (params.date_to) query = query.lte('visit_start', params.date_to);

    const { data: visitors, error, count } = await query;
    if (error) throw error;
    return { data: { visitors, total: count || visitors.length } };
  },
  getStats: async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [total, todayCount, weekCount, topCountries, topPages] = await Promise.all([
      supabase.from('visitors').select('*', { count: 'exact', head: true }),
      supabase.from('visitors').select('*', { count: 'exact', head: true }).gte('visit_start', today),
      supabase.from('visitors').select('*', { count: 'exact', head: true }).gte('visit_start', lastWeek),
      supabase.rpc('get_top_countries'), // Fallback to manual if RPC missing
      supabase.rpc('get_top_pages')
    ]);

    // Manual fallback for top countries/pages if RPC fails (common in new projects)
    let countries = topCountries.data || [];
    let pages = topPages.data || [];

    if (!topCountries.data || topCountries.error) {
      const { data } = await supabase.from('visitors').select('country');
      const counts = (data || []).reduce((acc, v) => {
        if (v.country) acc[v.country] = (acc[v.country] || 0) + 1;
        return acc;
      }, {});
      countries = Object.entries(counts).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    }

    if (!topPages.data || topPages.error) {
      const { data } = await supabase.from('visitors').select('page_visited');
      const counts = (data || []).reduce((acc, v) => {
        acc[v.page_visited] = (acc[v.page_visited] || 0) + 1;
        return acc;
      }, {});
      pages = Object.entries(counts).map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    }

    // Calculate real average duration from visitors with duration data
    const { data: durationData } = await supabase
      .from('visitors')
      .select('duration_seconds')
      .not('duration_seconds', 'is', null);
    const durations = (durationData || []).map(v => v.duration_seconds).filter(d => d > 0);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    return {
      data: {
        total_visitors: total.count || 0,
        today_visitors: todayCount.count || 0,
        week_visitors: weekCount.count || 0,
        avg_duration_seconds: avgDuration,
        top_countries: countries,
        top_pages: pages
      }
    };
  }
};

// --- SETTINGS API ---
export const settingsAPI = {
  getSettings: () => handleResponse(supabase.from('settings').select('*').eq('id', 'site_settings').single()),
  updateSettings: async (data) => {
    // Server-side save via service role key (bypasses RLS)
    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Kunde inte spara inställningar');
    return result;
  },
  getPublicSettings: async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 'site_settings').single();
    return { data: data || getDefaultSettings() };
  },
  getAnimations: async () => {
    const { data } = await supabase.from('settings').select('animation_settings').eq('id', 'site_settings').single();
    return { data: data?.animation_settings || {} };
  },
  testEmail: async (toEmail) => {
    const response = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send test email');
    }
    return response.json();
  },
};

// --- AXIOS COMPATIBILITY LAYER ---
const api = {
  get: async (url, config = {}) => {
    if (url === '/analytics/stats') return analyticsAPI.getStats();
    if (url === '/analytics/visitors') return analyticsAPI.getVisitors(config.params);
    if (url === '/gallery') return galleryAPI.getImages(config.params?.category);
    if (url === '/videos') return videosAPI.getVideos();
    if (url === '/contact') return contactAPI.getMessages();
    if (url === '/settings/public') return settingsAPI.getPublicSettings();
    if (url === '/settings/animations') return settingsAPI.getAnimations();
    return handleResponse(supabase.from(url.replace('/', '')).select('*'));
  },
  post: async (url, data) => {
    if (url === '/auth/login') return authAPI.login(data.email, data.password);
    if (url === '/contact') return contactAPI.sendMessage(data);
    if (url === '/analytics/visit') return analyticsAPI.logVisit(data);
    return handleResponse(supabase.from(url.replace('/', '')).insert([data]));
  },
  put: async (url, data) => {
    const id = url.split('/').pop();
    const table = url.split('/')[1];
    return handleResponse(supabase.from(table).update(data).eq('id', id));
  },
  delete: async (url) => {
    const id = url.split('/').pop();
    const table = url.split('/')[1];
    return handleResponse(supabase.from(table).delete().eq('id', id));
  }
};

function getDefaultSettings() {
  return {
    logo_url: "",
    contact_image_url: "",
    contact_info: { location: "Stockholm, Sweden", phone: "+46 70 123 4567", email: "info@nishagoriel.com", hours: "Mon - Fri: 9:00 - 18:00" },
    button_labels: { view_gallery: "View Gallery", book_session: "Book a Session", book_now: "Book Now", get_in_touch: "Get in Touch", send_message: "Skicka meddelande" },
    categories: [{ id: "wedding", name: "Wedding", slug: "wedding" }, { id: "pre-wedding", name: "Pre-Wedding", slug: "pre-wedding" }],
    site_texts: { hero_tagline: { text: "Wedding & Pre-Wedding Photography", font: "Space Grotesk", color: "rgba(255,255,255,0.8)", size: "text-sm" }, hero_title: { text: "Nisha Goriel", font: "Cormorant Garamond", color: "#ffffff", size: "text-7xl" }, hero_subtitle: { text: "Photography", font: "Cormorant Garamond", color: "rgba(255,255,255,0.9)", size: "text-7xl" } },
    typography: { heading_font: "Cormorant Garamond", body_font: "Space Grotesk" }
  };
}

export default api;
export { supabase };
