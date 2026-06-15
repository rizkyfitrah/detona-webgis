'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export default function LoginForm() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [entrance, setEntrance] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const errorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setEntrance(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Error animation
  useEffect(() => {
    if (errorRef.current) {
      errorRef.current.style.maxHeight = error ? `${errorRef.current.scrollHeight}px` : '0px';
    }
  }, [error]);

  // Parallax mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Akun berhasil dibuat! Silakan cek email untuk verifikasi.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes breathe {
          0% { filter: drop-shadow(0 0 8px rgba(204, 51, 51, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(204, 51, 51, 0.8)); }
          100% { filter: drop-shadow(0 0 8px rgba(204, 51, 51, 0.6)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          75% { transform: translateY(5px) rotate(-0.5deg); }
        }
        @keyframes lightSweep {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(204, 51, 51, 0.3); }
          50% { border-color: rgba(204, 51, 51, 0.7); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in { animation: fadeIn 1.2s ease forwards; }
        .animate-fade-up {
          animation: fadeUp 0.8s ease forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          opacity: 0;
        }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-light-sweep {
          background-size: 200% auto;
          animation: lightSweep 3s linear infinite;
        }
        .animate-border-glow { animation: borderGlow 3s ease-in-out infinite; }
        .animate-subtle-pulse { animation: subtlePulse 3s ease-in-out infinite; }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }

        /* Responsive Media Queries */
        @media (max-width: 1024px) {
          .left-panel {
            width: 50% !important;
            padding: 40px !important;
          }
          .right-panel {
            width: 50% !important;
            min-width: auto !important;
            padding: 40px !important;
          }
        }

        @media (max-width: 768px) {
          .container-split {
            flex-direction: column !important;
          }
          .left-panel {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: 35vh !important;
            padding: 30px !important;
            justify-content: flex-end !important;
            background: linear-gradient(to bottom, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.5) 100%) !important;
            z-index: 2 !important;
          }
          .left-panel h2 {
            font-size: 20px !important;
          }
          .left-panel .pilar {
            display: none !important;
          }
          .right-panel {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: 65vh !important;
            padding: 30px 25px !important;
            border-left: none !important;
            border-top: 1px solid rgba(204, 51, 51, 0.3) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            background: rgba(20, 20, 20, 0.4) !important;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.5) !important;
            justify-content: flex-start !important;
          }
          .logo-text {
            font-size: 28px !important;
          }
          .tagline {
            font-size: 12px !important;
            margin-left: 44px !important;
          }
          .flip-card {
            padding: 30px 25px !important;
          }
        }

        @media (max-width: 480px) {
          .left-panel {
            min-height: 25vh !important;
            padding: 20px !important;
          }
          .right-panel {
            padding: 20px 15px !important;
          }
          .flip-card {
            padding: 25px 20px !important;
            border-radius: 2px 12px 2px 12px !important;
          }
          .form-input {
            padding: 14px 14px 6px 38px !important;
            font-size: 14px !important;
          }
          .form-label {
            left: 38px !important;
            font-size: 12px !important;
          }
        }

        /* Smooth scrolling and font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Glass highlight on card */
        .glass-highlight {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.1) 0%,
            transparent 50%
          );
          pointer-events: none;
          border-radius: inherit;
          transition: opacity 0.3s ease;
        }

        /* Particle effect */
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(204, 51, 51, 0.6);
          border-radius: 50%;
          filter: blur(1px);
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="container-split"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {/* Partikel Latar Belakang */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}

        {/* ===== BACKGROUND FULLSCREEN ===== */}
        <div
          className={entrance ? 'animate-fade-in' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/images/mining-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: `${mousePos.x * 5 + 47.5}% ${mousePos.y * 5 + 47.5}%`,
            opacity: entrance ? 1 : 0,
            transition: 'background-position 0.6s ease-out',
          }}
        />

        {/* ===== OVERLAY KIRI ===== */}
        <div
          className={entrance ? 'animate-fade-in' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.2) 100%)',
            zIndex: 1,
            animationDelay: '0.3s',
            opacity: entrance ? 1 : 0,
          }}
        />

        {/* ===== LEFT PANEL – BRANDING ===== */}
        <div
          className="left-panel"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            zIndex: 2,
            color: '#fff',
          }}
        >
          {/* Logo + Nama */}
          <div className={entrance ? 'animate-fade-up delay-100' : ''} style={{ marginBottom: '40px', opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                className="animate-breathe"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8B0000, #CC3333)',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  filter: 'drop-shadow(0 0 15px rgba(204,51,51,0.8))',
                }}
              />
              <h1
                className={`${playfair.className} logo-text`}
                style={{
                  fontSize: '42px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: '#F5F5F5',
                  margin: 0,
                  textShadow: '0 0 20px rgba(204,51,51,0.3)',
                }}
              >
                DETONA
              </h1>
            </div>
            <p
              className={`${inter.className} tagline`}
              style={{
                fontSize: '16px',
                color: '#B0B0B0',
                letterSpacing: '3px',
                margin: '0 0 0 64px',
                textTransform: 'uppercase',
                fontWeight: 300,
              }}
            >
              Your Projects, One View.
            </p>
          </div>

          {/* Value Proposition */}
          <div className={entrance ? 'animate-fade-up delay-200' : ''} style={{ marginBottom: '60px', opacity: 0 }}>
            <h2
              className={playfair.className}
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#F5F5F5',
                lineHeight: 1.4,
                marginBottom: '16px',
                maxWidth: '500px',
              }}
            >
              Kendalikan Setiap Proyek <br />
              <span style={{ color: '#CC3333' }}>Dari Satu Layar.</span>
            </h2>
            <p className={inter.className} style={{ fontSize: '15px', color: '#A0A0A0', lineHeight: 1.6, maxWidth: '450px' }}>
              Platform monitoring proyek bahan peledak dan drilling & blasting
              terintegrasi untuk manajemen yang presisi dan aman.
            </p>
          </div>

          {/* Pilar */}
          <div className={`pilar ${entrance ? 'animate-fade-up delay-300' : ''}`} style={{ display: 'flex', gap: '40px', marginBottom: '60px', opacity: 0 }}>
            {['Precision', 'Safety', 'Reliability'].map((title) => (
              <div key={title}>
                <div style={{ width: '32px', height: '2px', background: '#CC3333', marginBottom: '12px' }} />
                <p className={inter.className} style={{ fontSize: '14px', color: '#D0D0D0', fontWeight: 600, marginBottom: '4px' }}>
                  {title}
                </p>
                <p className={inter.className} style={{ fontSize: '12px', color: '#909090', maxWidth: '120px' }}>
                  {title === 'Precision' ? 'Akurasi tinggi dalam monitoring setiap titik proyek.' :
                   title === 'Safety' ? 'Memenuhi standar K3 dan regulasi bahan peledak.' :
                   'Sistem selalu aktif dan data real-time 24/7.'}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={entrance ? 'animate-fade-up delay-400' : ''} style={{ opacity: 0 }}>
            <p className={inter.className} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
              © 2026 PT DETONA Nusantara. All rights reserved.
            </p>
          </div>
        </div>

        {/* ===== RIGHT PANEL – GLASS ===== */}
        <div
          className="right-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '40%',
            minWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 60px',
            background: 'rgba(20, 20, 20, 0.25)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderLeft: '1px solid rgba(204, 51, 51, 0.3)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
            zIndex: 2,
            opacity: entrance ? 1 : 0,
            transition: 'opacity 0.6s ease 0.8s',
          }}
        >
          {/* Grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              pointerEvents: 'none',
            }}
          />
          {/* Glow */}
          <div
            className="animate-subtle-pulse"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(204,51,51,0.25) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          {/* ===== FLIP CONTAINER (TRUE 3D) ===== */}
          <div style={{ perspective: '1200px', width: '100%' }}>
            <div
              style={{
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d',
                transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
                width: '100%',
              }}
            >
              {/* ===== FRONT: SIGN IN ===== */}
              <div style={{ backfaceVisibility: 'hidden', width: '100%' }}>
                <div className={entrance ? 'animate-fade-up delay-100' : ''} style={{ opacity: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    <div style={{ width: '40px', height: '2px', background: '#CC3333' }} />
                    <div style={{ width: '4px', height: '2px', background: '#CC3333' }} />
                  </div>
                  <p className={inter.className} style={{ fontSize: '12px', color: '#A0A0A0', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Masuk ke Dashboard
                  </p>
                  <h2 className={playfair.className} style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', marginBottom: '40px' }}>
                    Selamat Datang
                  </h2>
                </div>

                {/* Card with light sweep */}
                <div
                  className={`${entrance ? 'animate-scale-in delay-200' : ''} animate-border-glow`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  style={{
                    position: 'relative',
                    background: 'rgba(10, 10, 10, 0.5)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(204, 51, 51, 0.3)',
                    borderRadius: '4px 20px 4px 20px',
                    padding: '44px 40px',
                    boxShadow: isHovering
                      ? '0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(204,51,51,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : '0 25px 60px rgba(0,0,0,0.7), 0 0 20px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    overflow: 'hidden',
                    opacity: entrance ? 1 : 0,
                  }}
                >
                  {/* Highlight glass mengikuti mouse */}
                  <div
                    className="glass-highlight"
                    style={{
                      '--mouse-x': `${mousePos.x * 100}%`,
                      '--mouse-y': `${mousePos.y * 100}%`,
                    } as React.CSSProperties}
                  />

                  {/* Light sweep effect */}
                  <div
                    className="animate-light-sweep"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                      backgroundSize: '200% auto',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Ornamen sudut */}
                  <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '30px', height: '30px', borderTop: '2px solid rgba(204,51,51,0.7)', borderLeft: '2px solid rgba(204,51,51,0.7)', borderRadius: '4px 0 0 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '30px', height: '30px', borderTop: '2px solid rgba(204,51,51,0.7)', borderRight: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 4px 0 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '30px', height: '30px', borderBottom: '2px solid rgba(204,51,51,0.7)', borderLeft: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 0 0 4px', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '30px', height: '30px', borderBottom: '2px solid rgba(204,51,51,0.7)', borderRight: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 0 4px 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />

                  {/* Garis dekoratif */}
                  <div style={{ position: 'absolute', top: '12px', left: '10%', width: '80%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), rgba(204,51,51,0.3), rgba(255,255,255,0.15), transparent)', transition: 'all 0.5s ease', opacity: isHovering ? 1 : 0.4 }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '10%', width: '80%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(204,51,51,0.3), rgba(255,255,255,0.15), rgba(204,51,51,0.3), transparent)', transition: 'all 0.5s ease', opacity: isHovering ? 1 : 0.4 }} />

                  {/* Titik dekoratif */}
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* Email */}
                    <div className={entrance ? 'animate-fade-up delay-200' : ''} style={{ position: 'relative', opacity: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: email ? '#CC3333' : '#A0A0A0', transition: 'all 0.3s ease', zIndex: 2 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8l6 4 6-4" />
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder=" "
                        className={`${inter.className} form-input`}
                        style={{
                          width: '100%',
                          padding: '16px 16px 8px 42px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          lineHeight: '1.2',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#CC3333';
                          e.target.style.boxShadow = '0 0 12px rgba(204,51,51,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                      />
                      <label
                        className={`${inter.className} form-label`}
                        style={{
                          position: 'absolute',
                          left: '42px',
                          top: email ? '6px' : '14px',
                          fontSize: email ? '10px' : '14px',
                          color: email ? '#CC3333' : '#A0A0A0',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                      >
                        Email
                      </label>
                    </div>

                    {/* Password */}
                    <div className={entrance ? 'animate-fade-up delay-300' : ''} style={{ position: 'relative', opacity: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: password ? '#CC3333' : '#A0A0A0', transition: 'all 0.3s ease', zIndex: 2 }}>
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="16" r="1" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=" "
                        className={`${inter.className} form-input`}
                        style={{
                          width: '100%',
                          padding: '16px 16px 8px 42px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          lineHeight: '1.2',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#CC3333';
                          e.target.style.boxShadow = '0 0 12px rgba(204,51,51,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                      />
                      <label
                        className={`${inter.className} form-label`}
                        style={{
                          position: 'absolute',
                          left: '42px',
                          top: password ? '6px' : '14px',
                          fontSize: password ? '10px' : '14px',
                          color: password ? '#CC3333' : '#A0A0A0',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                      >
                        Password
                      </label>
                    </div>

                    {/* Error */}
                    <div
                      ref={errorRef}
                      style={{
                        maxHeight: '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), margin 0.5s ease',
                        margin: '0',
                      }}
                    >
                      <div style={{ color: '#FCA5A5', fontSize: '12px', background: 'rgba(204,51,51,0.12)', borderLeft: '3px solid #CC3333', borderRadius: '0 6px 6px 0', padding: '10px 14px' }}>
                        {error}
                      </div>
                    </div>

                    {/* Tombol Sign In (perbaikan tanpa shorthand background) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`${inter.className} ${entrance ? 'animate-fade-up delay-300' : ''}`}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '16px',
                        letterSpacing: '3px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundImage: loading
                          ? 'linear-gradient(135deg, #4a4a4a, #3a3a3a)'
                          : 'linear-gradient(135deg, #8B0000 0%, #CC3333 50%, #8B0000 100%)',
                        backgroundSize: '200% auto',
                        backgroundPosition: '0% center',
                        boxShadow: loading
                          ? 'none'
                          : '0 8px 25px rgba(204,51,51,0.5), 0 0 15px rgba(204,51,51,0.2)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        marginTop: '8px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        opacity: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 14px 35px rgba(204,51,51,0.7), 0 0 30px rgba(204,51,51,0.4)';
                          e.currentTarget.style.backgroundPosition = '100% center';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(204,51,51,0.5), 0 0 15px rgba(204,51,51,0.2)';
                          e.currentTarget.style.backgroundPosition = '0% center';
                        }
                      }}
                    >
                      {loading ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                        </svg>
                      ) : 'Masuk'}
                    </button>
                  </form>
                </div>

                {/* Toggle Sign In → Sign Up */}
                <div className={entrance ? 'animate-fade-up delay-300' : ''} style={{ marginTop: '28px', fontSize: '13px', color: '#909090', textAlign: 'center', opacity: 0 }}>
                  Belum punya akun?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className={inter.className}
                    style={{
                      background: 'none', border: 'none', color: '#CC3333', cursor: 'pointer',
                      fontWeight: 500, fontSize: '13px', textDecoration: 'none', padding: 0,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#CC3333')}
                  >
                    Buat akun baru
                  </button>
                </div>
              </div>

              {/* ===== BACK: SIGN UP ===== */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className={entrance ? 'animate-fade-up delay-100' : ''} style={{ opacity: 0 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                    <div style={{ width: '40px', height: '2px', background: '#CC3333' }} />
                    <div style={{ width: '4px', height: '2px', background: '#CC3333' }} />
                  </div>
                  <p className={inter.className} style={{ fontSize: '12px', color: '#A0A0A0', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Buat Akun Baru
                  </p>
                  <h2 className={playfair.className} style={{ fontSize: '24px', fontWeight: 600, color: '#F5F5F5', marginBottom: '40px' }}>
                    Daftar DETONA
                  </h2>
                </div>

                {/* Card Sign Up */}
                <div
                  className={`${entrance ? 'animate-scale-in delay-200' : ''} animate-border-glow`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  style={{
                    position: 'relative',
                    background: 'rgba(10, 10, 10, 0.5)',
                    backdropFilter: 'blur(30px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                    border: '1px solid rgba(204, 51, 51, 0.3)',
                    borderRadius: '4px 20px 4px 20px',
                    padding: '44px 40px',
                    boxShadow: isHovering
                      ? '0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(204,51,51,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : '0 25px 60px rgba(0,0,0,0.7), 0 0 20px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    overflow: 'hidden',
                    opacity: entrance ? 1 : 0,
                  }}
                >
                  <div
                    className="glass-highlight"
                    style={{
                      '--mouse-x': `${mousePos.x * 100}%`,
                      '--mouse-y': `${mousePos.y * 100}%`,
                    } as React.CSSProperties}
                  />
                  <div
                    className="animate-light-sweep"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                      backgroundSize: '200% auto',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Ornamen sudut */}
                  <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '30px', height: '30px', borderTop: '2px solid rgba(204,51,51,0.7)', borderLeft: '2px solid rgba(204,51,51,0.7)', borderRadius: '4px 0 0 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '30px', height: '30px', borderTop: '2px solid rgba(204,51,51,0.7)', borderRight: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 4px 0 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '30px', height: '30px', borderBottom: '2px solid rgba(204,51,51,0.7)', borderLeft: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 0 0 4px', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '30px', height: '30px', borderBottom: '2px solid rgba(204,51,51,0.7)', borderRight: '2px solid rgba(204,51,51,0.7)', borderRadius: '0 0 4px 0', transition: 'all 0.6s ease', opacity: isHovering ? 1 : 0.5 }} />

                  {/* Garis dekoratif */}
                  <div style={{ position: 'absolute', top: '12px', left: '10%', width: '80%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), rgba(204,51,51,0.3), rgba(255,255,255,0.15), transparent)', transition: 'all 0.5s ease', opacity: isHovering ? 1 : 0.4 }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '10%', width: '80%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(204,51,51,0.3), rgba(255,255,255,0.15), rgba(204,51,51,0.3), transparent)', transition: 'all 0.5s ease', opacity: isHovering ? 1 : 0.4 }} />

                  {/* Titik dekoratif */}
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />
                  <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '4px', height: '4px', backgroundColor: '#CC3333', boxShadow: '0 0 6px #CC3333', borderRadius: '50%', transition: 'all 0.4s ease', transform: isHovering ? 'scale(1.5)' : 'scale(1)' }} />

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    {/* Email */}
                    <div style={{ position: 'relative' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: email ? '#CC3333' : '#A0A0A0', transition: 'all 0.3s ease', zIndex: 2 }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M6 8l6 4 6-4" />
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder=" "
                        className={`${inter.className} form-input`}
                        style={{
                          width: '100%',
                          padding: '16px 16px 8px 42px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          lineHeight: '1.2',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#CC3333';
                          e.target.style.boxShadow = '0 0 12px rgba(204,51,51,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                      />
                      <label
                        className={`${inter.className} form-label`}
                        style={{
                          position: 'absolute',
                          left: '42px',
                          top: email ? '6px' : '14px',
                          fontSize: email ? '10px' : '14px',
                          color: email ? '#CC3333' : '#A0A0A0',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                      >
                        Email
                      </label>
                    </div>

                    {/* Password */}
                    <div style={{ position: 'relative' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: password ? '#CC3333' : '#A0A0A0', transition: 'all 0.3s ease', zIndex: 2 }}>
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="16" r="1" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                      </svg>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder=" "
                        className={`${inter.className} form-input`}
                        style={{
                          width: '100%',
                          padding: '16px 16px 8px 42px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                          lineHeight: '1.2',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#CC3333';
                          e.target.style.boxShadow = '0 0 12px rgba(204,51,51,0.3)';
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                      />
                      <label
                        className={`${inter.className} form-label`}
                        style={{
                          position: 'absolute',
                          left: '42px',
                          top: password ? '6px' : '14px',
                          fontSize: password ? '10px' : '14px',
                          color: password ? '#CC3333' : '#A0A0A0',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                          fontWeight: 500,
                        }}
                      >
                        Password
                      </label>
                    </div>

                    {/* Error */}
                    <div
                      style={{
                        maxHeight: '0px',
                        overflow: 'hidden',
                        transition: 'max-height 0.5s ease',
                        margin: '0',
                      }}
                    >
                      <div style={{ color: '#FCA5A5', fontSize: '12px', background: 'rgba(204,51,51,0.12)', borderLeft: '3px solid #CC3333', borderRadius: '0 6px 6px 0', padding: '10px 14px' }}>
                        {error}
                      </div>
                    </div>

                    {/* Tombol Daftar (perbaikan tanpa shorthand background) */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`${inter.className}`}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '16px',
                        letterSpacing: '3px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundImage: loading
                          ? 'linear-gradient(135deg, #4a4a4a, #3a3a3a)'
                          : 'linear-gradient(135deg, #8B0000 0%, #CC3333 50%, #8B0000 100%)',
                        backgroundSize: '200% auto',
                        backgroundPosition: '0% center',
                        boxShadow: loading
                          ? 'none'
                          : '0 8px 25px rgba(204,51,51,0.5), 0 0 15px rgba(204,51,51,0.2)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        marginTop: '8px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 14px 35px rgba(204,51,51,0.7), 0 0 30px rgba(204,51,51,0.4)';
                          e.currentTarget.style.backgroundPosition = '100% center';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(204,51,51,0.5), 0 0 15px rgba(204,51,51,0.2)';
                          e.currentTarget.style.backgroundPosition = '0% center';
                        }
                      }}
                    >
                      {loading ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3" fill="none" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                        </svg>
                      ) : 'Buat Akun'}
                    </button>
                  </form>
                </div>

                {/* Toggle Sign Up → Sign In */}
                <div className={entrance ? 'animate-fade-up delay-300' : ''} style={{ marginTop: '28px', fontSize: '13px', color: '#909090', textAlign: 'center', opacity: 0 }}>
                  Sudah punya akun?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className={inter.className}
                    style={{
                      background: 'none', border: 'none', color: '#CC3333', cursor: 'pointer',
                      fontWeight: 500, fontSize: '13px', textDecoration: 'none', padding: 0,
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#CC3333')}
                  >
                    Masuk di sini
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}