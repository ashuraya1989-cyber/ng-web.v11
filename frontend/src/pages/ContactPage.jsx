import React, { useState, useEffect, useRef } from 'react';
import {
  Send, CheckCircle, Loader2, MapPin, Phone, Mail, Clock,
  ChevronLeft, ChevronRight, CalendarDays, X, Instagram
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { contactAPI, settingsAPI } from '../lib/api';
import { useDynamicFonts } from '../hooks/useDynamicFonts';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const TURNSTILE_SITE_KEY   = process.env.REACT_APP_TURNSTILE_SITE_KEY || '';
const INSTAGRAM_URL        = 'https://instagram.com/nishagoriel';

// ─── Locale ──────────────────────────────────────────────────────────────────
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

// ─── Luxury Calendar ─────────────────────────────────────────────────────────
const LuxuryCalendar = ({ selected, onSelect, onClose }) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState({
    year:  selected ? selected.getFullYear() : today.getFullYear(),
    month: selected ? selected.getMonth()    : today.getMonth(),
  });
  const [hovered, setHovered] = useState(null);

  const firstDay    = new Date(view.year, view.month, 1);
  const lastDay     = new Date(view.year, view.month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(view.year, view.month, d));

  const prevMonth = () => setView(v => ({ year: v.month===0?v.year-1:v.year, month: v.month===0?11:v.month-1 }));
  const nextMonth = () => setView(v => ({ year: v.month===11?v.year+1:v.year, month: v.month===11?0:v.month+1 }));

  const isPast    = d => d && d < today;
  const isToday   = d => d && d.getTime() === today.getTime();
  const isSel     = d => d && selected && d.getTime() === selected.getTime();
  const isWeekend = d => d && (d.getDay()===0 || d.getDay()===6);

  const yearOptions = [today.getFullYear(), today.getFullYear()+1, today.getFullYear()+2];

  return (
    <div style={{
      background: '#111', border: '1px solid #2a2a2a',
      borderRadius: 20, overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
        padding: '20px 20px 16px',
        borderBottom: '1px solid #2a2a2a',
        position: 'relative',
      }}>
        <button type="button" onClick={onClose} style={{
          position:'absolute', top:12, right:12, width:28, height:28,
          borderRadius:'50%', background:'rgba(255,255,255,0.08)',
          border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', color:'#888',
        }}>
          <X size={13}/>
        </button>

        {/* Selected display */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize:9, letterSpacing:'0.4em', textTransform:'uppercase', color:'#c9a96e', fontWeight:600, marginBottom:6 }}>Booking Date</p>
          {selected ? (
            <>
              <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:36, fontWeight:300, color:'#fff', lineHeight:1 }}>{selected.getDate()}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', marginTop:4, letterSpacing:'0.06em' }}>
                {MONTHS_LONG[selected.getMonth()]} {selected.getFullYear()}
              </p>
            </>
          ) : (
            <p style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:22, fontWeight:300, color:'rgba(255,255,255,0.25)', fontStyle:'italic' }}>
              Select a date
            </p>
          )}
        </div>

        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <button type="button" onClick={prevMonth} style={{
            width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer',
            color:'#ccc', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <ChevronLeft size={15}/>
          </button>

          <div style={{ textAlign:'center', flex:1 }}>
            <p style={{ fontSize:15, fontWeight:600, color:'#fff', letterSpacing:'0.06em' }}>{MONTHS_LONG[view.month]}</p>
            <div style={{ display:'flex', gap:4, justifyContent:'center', marginTop:6, flexWrap:'wrap' }}>
              {yearOptions.map(y => (
                <button key={y} type="button" onClick={() => setView(v=>({...v,year:y}))} style={{
                  fontSize:10, padding:'2px 10px', borderRadius:20, border:'none', cursor:'pointer',
                  background: view.year===y ? 'linear-gradient(135deg,#c9a96e,#b8935a)' : 'rgba(255,255,255,0.07)',
                  color: view.year===y ? '#000' : '#888', fontWeight: view.year===y?700:400,
                  transition:'all 0.15s',
                }}>{y}</button>
              ))}
            </div>
          </div>

          <button type="button" onClick={nextMonth} style={{
            width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer',
            color:'#ccc', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <ChevronRight size={15}/>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'16px 16px 20px', background:'#111' }}>
        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
          {DAYS_SHORT.map((d,i) => (
            <div key={d} style={{
              textAlign:'center', fontSize:9, fontWeight:700,
              letterSpacing:'0.12em', padding:'4px 0',
              color: i>=5 ? '#c9a96e' : '#555',
            }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px 0' }}>
          {cells.map((d,i) => {
            if (!d) return <div key={i}/>;
            const past=isPast(d), sel=isSel(d), tod=isToday(d), wknd=isWeekend(d);
            const hov = hovered && !past && hovered.getTime()===d.getTime();
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'1px 0' }}>
                <button
                  type="button"
                  disabled={past}
                  onClick={() => onSelect(d)}
                  onMouseEnter={() => !past && setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width:34, height:34, borderRadius:'50%', border: tod&&!sel?'1.5px solid #c9a96e':'1.5px solid transparent',
                    cursor: past?'not-allowed':'pointer', fontSize:13,
                    fontWeight: sel?700:tod?600:400, transition:'all 0.12s ease',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: sel ? 'linear-gradient(135deg,#c9a96e,#b8935a)' : hov ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: sel?'#000' : past?'#333' : wknd?'#c9a96e' : '#e0e0e0',
                    transform: hov&&!sel?'scale(1.12)':sel?'scale(1.05)':'scale(1)',
                    boxShadow: sel?'0 4px 16px rgba(201,169,110,0.45)':'none',
                  }}
                >{d.getDate()}</button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          marginTop:14, paddingTop:12, borderTop:'1px solid #1e1e1e',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8,
        }}>
          <button type="button"
            onClick={() => { setView({ year:today.getFullYear(), month:today.getMonth() }); onSelect(today); }}
            style={{ fontSize:11, padding:'5px 14px', borderRadius:20, border:'1px solid #2a2a2a',
              background:'rgba(255,255,255,0.05)', cursor:'pointer', color:'#aaa', fontWeight:500, letterSpacing:'0.05em' }}>
            Idag
          </button>
          <div style={{ display:'flex', gap:3, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {MONTHS_SHORT.map((m,i) => {
              const isPastM = i < today.getMonth() && view.year === today.getFullYear();
              if (isPastM) return null;
              const active = view.month===i;
              return (
                <button key={m} type="button" onClick={() => setView(v=>({...v, month:i}))} style={{
                  fontSize:9, padding:'3px 7px', borderRadius:10, border:'none', cursor:'pointer',
                  background: active?'linear-gradient(135deg,#c9a96e,#b8935a)':'rgba(255,255,255,0.06)',
                  color: active?'#000':'#666', fontWeight:active?700:400, transition:'all 0.12s',
                }}>{m}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Format helpers ───────────────────────────────────────────────────────────
const formatDate = d => !d ? '' : d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
const formatDateISO = d => {
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ─── Floating label input (dark variant) ─────────────────────────────────────
const Field = ({ id, name, type='text', value, onChange, required, label, as='input', rows }) => {
  const base = {
    width:'100%', background:'transparent',
    border:'none', borderBottom:'1px solid rgba(255,255,255,0.22)',
    borderRadius:0, outline:'none',
    color:'rgba(255,255,255,0.92)',          // lighter — easier to read
    fontSize:17,                              // one step up from 15
    padding:'24px 0 10px', fontFamily:'inherit',
    transition:'border-color 0.2s',
  };
  const focusLabel = lbl => {
    lbl.style.top = '-2px';
    lbl.style.fontSize = '10px';
    lbl.style.color = '#c9a96e';             // solid gold when focused
    lbl.style.letterSpacing = '0.25em';
  };
  const blurLabel = (lbl, hasValue) => {
    if (!hasValue) {
      lbl.style.top = '24px';
      lbl.style.fontSize = '11px';
      lbl.style.color = 'rgba(255,255,255,0.45)';
      lbl.style.letterSpacing = '0.18em';
    } else {
      lbl.style.color = 'rgba(201,169,110,0.55)'; // soft gold when filled
    }
  };
  return (
    <div style={{ position:'relative', marginBottom:0 }}>
      <label htmlFor={id} style={{
        position:'absolute', top:24, left:0,
        fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase',
        color:'rgba(255,255,255,0.45)',      // lighter label
        pointerEvents:'none',
        transition:'all 0.2s ease',
      }}>
        {label}{required ? ' *' : ''}
      </label>

      {as === 'textarea' ? (
        <textarea
          id={id} name={name} value={value} onChange={onChange}
          required={required} rows={rows||4} placeholder=" "
          style={{ ...base, resize:'none', lineHeight:1.7 }}
          onFocus={e => {
            e.target.style.borderBottomColor='#c9a96e';
            e.target.style.boxShadow='0 2px 0 rgba(201,169,110,0.25)';
            focusLabel(e.target.previousSibling);
          }}
          onBlur={e => {
            e.target.style.borderBottomColor = e.target.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.22)';
            e.target.style.boxShadow='none';
            blurLabel(e.target.previousSibling, !!e.target.value);
          }}
          onInput={e => { if (e.target.value) focusLabel(e.target.previousSibling); }}
        />
      ) : (
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          required={required} placeholder=" "
          style={base}
          onFocus={e => {
            e.target.style.borderBottomColor='#c9a96e';
            e.target.style.boxShadow='0 2px 0 rgba(201,169,110,0.25)';
            focusLabel(e.target.previousSibling);
          }}
          onBlur={e => {
            e.target.style.borderBottomColor = e.target.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.22)';
            e.target.style.boxShadow='none';
            blurLabel(e.target.previousSibling, !!e.target.value);
          }}
          onInput={e => { if (e.target.value) focusLabel(e.target.previousSibling); }}
        />
      )}
    </div>
  );
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
const defaultLabels = { send_message: 'Skicka meddelande' };
const defaultTexts  = {
  contact_subtitle: { text: 'Kontakt', font: 'Space Grotesk', color: 'rgba(255,255,255,0.5)', size: 'text-sm' },
};

// ─── Main ContactPage ─────────────────────────────────────────────────────────
const ContactPage = () => {
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', booking_date:null, venue:'', message:'' });
  const [calendarOpen, setCalendarOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isSubmitted, setIsSubmitted]     = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [turnstileKey, setTurnstileKey]   = useState(0);
  const [contactInfo, setContactInfo]     = useState({ location:'Stockholm, Sweden', phone:'+46 70 123 4567', email:'info@nishagoriel.com', hours:'Mon - Fri: 9:00 - 18:00' });
  const [labels, setLabels]               = useState(defaultLabels);
  const [contactImageUrl, setContactImageUrl] = useState('');
  const [contactImageOpacity, setContactImageOpacity] = useState(30);
  const [siteTexts, setSiteTexts]         = useState(defaultTexts);
  const [typography, setTypography]       = useState({ custom_fonts:[] });
  const calendarRef = useRef(null);

  useDynamicFonts(typography, siteTexts);

  // Turnstile
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    window.turnstileSuccessCallback = token => setTurnstileToken(token);
    if (document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`)) return;
    const s = document.createElement('script');
    s.src = TURNSTILE_SCRIPT_URL; s.async = true; s.defer = true;
    document.head.appendChild(s);
    return () => { delete window.turnstileSuccessCallback; };
  }, []);

  // Load admin settings
  useEffect(() => {
    settingsAPI.getPublicSettings().then(r => {
      if (r.data?.contact_info)      setContactInfo(p => ({ ...p, ...r.data.contact_info }));
      if (r.data?.button_labels)     setLabels(p => ({ ...p, ...r.data.button_labels }));
      if (r.data?.contact_image_url) setContactImageUrl(r.data.contact_image_url);
      if (r.data?.contact_image_opacity !== undefined) setContactImageOpacity(r.data.contact_image_opacity);
      if (r.data?.site_texts)        setSiteTexts(p => ({ ...p, ...r.data.site_texts }));
      if (r.data?.typography)        setTypography(p => ({ ...p, ...r.data.typography }));
    }).catch(() => {});
  }, []);

  // Close calendar on outside click
  useEffect(() => {
    const h = e => { if (calendarRef.current && !calendarRef.current.contains(e.target)) setCalendarOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleChange  = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleDateSelect = date => { setFormData(p => ({ ...p, booking_date: date })); setCalendarOpen(false); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (TURNSTILE_SITE_KEY && !turnstileToken) { toast.error('Vänligen vänta tills säkerhetskontrollen är klar.'); return; }
    setIsSubmitting(true);
    try {
      const submitData = { ...formData, booking_date: formatDateISO(formData.booking_date) };
      if (TURNSTILE_SITE_KEY) submitData.turnstile_token = turnstileToken;
      await contactAPI.sendMessage(submitData);
      setIsSubmitted(true);
      toast.success('Meddelande skickat!');
    } catch (err) {
      console.error(err);
      toast.error('Kunde inte skicka meddelande. Försök igen.');
    } finally { setIsSubmitting(false); }
  };

  const handleSendAnother = () => {
    setIsSubmitted(false);
    setFormData({ name:'', email:'', phone:'', booking_date:null, venue:'', message:'' });
    setTurnstileToken(null); setTurnstileKey(k => k+1);
  };

  // ── Thank you page ──────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            border: '1px solid rgba(201,169,110,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
            background: 'rgba(201,169,110,0.08)',
          }}>
            <CheckCircle size={40} style={{ color: '#c9a96e' }}/>
          </div>

          <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 12 }}>Tack</p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: 300, color: '#fff',
            marginBottom: 16, lineHeight: 1.1,
          }}>
            Tack för ditt meddelande
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 40, fontSize: 15 }}>
            Ditt meddelande har skickats. Jag återkommer så snart som möjligt.
          </p>

          <button onClick={handleSendAnother} style={{
            padding: '14px 40px', borderRadius: 40,
            border: '1px solid rgba(201,169,110,0.4)',
            background: 'rgba(201,169,110,0.1)', color: '#c9a96e',
            cursor: 'pointer', fontSize: 11, letterSpacing: '0.25em',
            textTransform: 'uppercase', fontWeight: 600,
            transition: 'all 0.2s', width: '100%', maxWidth: 280,
          }}>
            Skicka nytt meddelande
          </button>
        </div>
      </div>
    );
  }
  // Map tailwind size class → px (matches AdminTypography exactly)
  const twToPx = (cls) => {
    const m = { 'text-xs':'12px','text-sm':'14px','text-base':'16px','text-lg':'18px',
      'text-xl':'20px','text-2xl':'24px','text-3xl':'30px','text-4xl':'36px',
      'text-5xl':'48px','text-6xl':'60px','text-7xl':'72px','text-8xl':'96px' };
    return m[cls] || '36px';
  };

  // ── Main page ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background:'#0a0a0a', minHeight:'100vh', position:'relative' }}>
      {contactImageUrl && (
        <>
          <img src={contactImageUrl} alt="" style={{
            position:'fixed', inset:0, width:'100%', height:'100%',
            objectFit:'cover', pointerEvents:'none', zIndex:0,
            opacity: (contactImageOpacity / 100),
          }}/>
          <div style={{
            position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
            background:`rgba(10,10,10,${1 - (contactImageOpacity / 100)})`,
          }}/>
        </>
      )}

      <Navbar transparent />

      <div style={{ position:'relative', zIndex:1, maxWidth:640, margin:'0 auto', padding:'0 20px 80px' }}>

        {/* ── Title block — admin-controlled ── */}
        <div style={{ paddingTop:96, marginBottom:44, textAlign:'center' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,#c9a96e,transparent)', marginBottom:28 }}/>

          {/* contact_subtitle = rubrik, admin-styrd (text/typsnitt/storlek/färg) */}
          <h1 style={{
            fontFamily: siteTexts?.contact_subtitle?.font ? `"${siteTexts.contact_subtitle.font}",sans-serif` : 'inherit',
            fontSize: twToPx(siteTexts?.contact_subtitle?.size || 'text-sm'),
            color: siteTexts?.contact_subtitle?.color || 'rgba(255,255,255,0.5)',
            letterSpacing:'0.38em', textTransform:'uppercase', fontWeight:600,
            margin:0,
          }}>
            {siteTexts?.contact_subtitle?.text || 'Kontakt'}
          </h1>

          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(201,169,110,0.35),transparent)', marginTop:28 }}/>
        </div>

        <form onSubmit={handleSubmit}>
          <p style={{ fontSize:9, letterSpacing:'0.4em', textTransform:'uppercase', color:'#c9a96e', marginBottom:36, fontWeight:600 }}>
            Skicka ett meddelande
          </p>

          {/* Name + Email */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'0 32px' }}>
            <Field id="name"  name="name"  value={formData.name}  onChange={handleChange} required label="Namn"/>
            <Field id="email" name="email" type="email" value={formData.email} onChange={handleChange} required label="Email"/>
          </div>

          <div style={{ marginTop:28 }}>
            <Field id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required label="Telefon"/>
          </div>

          {/* Date picker */}
          <div ref={calendarRef} style={{ marginTop:28 }}>
            <button
              type="button"
              onClick={() => setCalendarOpen(o => !o)}
              style={{
                width:'100%', background:'transparent', border:'none',
                borderBottom:`1px solid ${calendarOpen?'#c9a96e':'rgba(255,255,255,0.12)'}`,
                borderRadius:0, padding:'22px 0 10px', cursor:'pointer',
                textAlign:'left', position:'relative', transition:'border-color 0.2s',
              }}
            >
              <span style={{ display:'block', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(201,169,110,0.65)', marginBottom:6, fontWeight:600 }}>
                Önskat datum
              </span>
              <span style={{ display:'flex', alignItems:'center', justifyContent:'space-between', color:formData.booking_date?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.3)', fontSize:17 }}>
                <span style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <CalendarDays size={14} style={{ color:formData.booking_date?'#c9a96e':'rgba(255,255,255,0.2)', flexShrink:0 }}/>
                  {formData.booking_date ? formatDate(formData.booking_date) : 'Välj ditt bröllopsdatum'}
                </span>
                {formData.booking_date && (
                  <span onClick={e=>{e.stopPropagation();setFormData(p=>({...p,booking_date:null}));}}
                    style={{ fontSize:11, color:'#555', cursor:'pointer', padding:'2px 6px', borderRadius:8 }}>✕</span>
                )}
              </span>
              <span style={{ position:'absolute', bottom:-1, left:0, height:2, borderRadius:1, background:'linear-gradient(90deg,#c9a96e,#b8935a)', width:calendarOpen?'100%':'0%', transition:'width 0.3s ease' }}/>
            </button>
            {calendarOpen && (
              <div style={{ marginTop:10, animation:'calFade 0.18s ease' }}>
                <style>{`@keyframes calFade{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <LuxuryCalendar selected={formData.booking_date} onSelect={handleDateSelect} onClose={()=>setCalendarOpen(false)}/>
              </div>
            )}
          </div>

          <div style={{ marginTop:28 }}>
            <Field id="venue" name="venue" value={formData.venue} onChange={handleChange} label="Plats / Venue"/>
          </div>

          <div style={{ marginTop:28 }}>
            <Field id="message" name="message" as="textarea" rows={5} value={formData.message} onChange={handleChange} required label="Meddelande"/>
          </div>

          {TURNSTILE_SITE_KEY && (
            <div key={turnstileKey} className="cf-turnstile" style={{ marginTop:24 }}
              data-sitekey={TURNSTILE_SITE_KEY} data-callback="turnstileSuccessCallback" data-appearance="execute"/>
          )}

          {/* Send button */}
          <div style={{ marginTop:44 }}>
            <button
              type="submit" disabled={isSubmitting}
              style={{
                width:'100%', padding:'18px 32px', borderRadius:14, border:'none',
                cursor:isSubmitting?'not-allowed':'pointer',
                background:isSubmitting?'rgba(201,169,110,0.3)':'linear-gradient(135deg,#c9a96e 0%,#b8935a 50%,#c9a96e 100%)',
                color:isSubmitting?'rgba(0,0,0,0.4)':'#000',
                fontSize:11, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase',
                display:'flex', alignItems:'center', justifyContent:'center', gap:12,
                transition:'all 0.3s ease',
                boxShadow:isSubmitting?'none':'0 8px 32px rgba(201,169,110,0.3)',
              }}
              onMouseEnter={e=>{if(!isSubmitting){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(201,169,110,0.45)';}}}
              onMouseLeave={e=>{if(!isSubmitting){e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 32px rgba(201,169,110,0.3)';}}}
            >
              {isSubmitting
                ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Skickar...</>
                : <>{labels.send_message||'Skicka meddelande'} <Send size={15}/></>
              }
            </button>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        </form>

        {/* ── Contact info — under button ── */}
        <div style={{ marginTop:64 }}>
          <div style={{ height:1, background:'linear-gradient(90deg,rgba(201,169,110,0.25),transparent)', marginBottom:40 }}/>
          <p style={{ fontSize:9, letterSpacing:'0.4em', textTransform:'uppercase', color:'#c9a96e', marginBottom:32, fontWeight:600 }}>Kontaktuppgifter</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:24 }}>
            {contactInfo.location && (
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <MapPin size={15} style={{ color:'#c9a96e' }}/>
                </div>
                <div>
                  <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:4, fontWeight:600 }}>Plats</p>
                  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, lineHeight:1.5, margin:0 }}>{contactInfo.location}</p>
                </div>
              </div>
            )}
            {contactInfo.phone && (
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Phone size={15} style={{ color:'#c9a96e' }}/>
                </div>
                <div>
                  <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:4, fontWeight:600 }}>Telefon</p>
                  <a href={`tel:${contactInfo.phone}`} style={{ color:'rgba(255,255,255,0.7)', fontSize:14, textDecoration:'none' }}>{contactInfo.phone}</a>
                </div>
              </div>
            )}
            {contactInfo.email && (
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Mail size={15} style={{ color:'#c9a96e' }}/>
                </div>
                <div>
                  <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:4, fontWeight:600 }}>Email</p>
                  <a href={`mailto:${contactInfo.email}`} style={{ color:'rgba(255,255,255,0.7)', fontSize:14, textDecoration:'none' }}>{contactInfo.email}</a>
                </div>
              </div>
            )}
            {contactInfo.hours && (
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Clock size={15} style={{ color:'#c9a96e' }}/>
                </div>
                <div>
                  <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:4, fontWeight:600 }}>Öppettider</p>
                  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, lineHeight:1.5, margin:0 }}>{contactInfo.hours}</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop:40, paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:9, color:'rgba(255,255,255,0.35)', textDecoration:'none', fontSize:12, letterSpacing:'0.15em', transition:'color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#c9a96e'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}
            >
              <Instagram size={16}/> @nishagoriel
            </a>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default ContactPage;
