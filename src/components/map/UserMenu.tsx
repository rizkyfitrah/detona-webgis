'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.email || 'User';
        setUserName(name);
        setInitials(name.substring(0, 2).toUpperCase());
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div
      data-tut="user-menu"
      style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1201 }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: open ? 'rgba(204, 51, 51, 0.2)' : 'rgba(10, 10, 10, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${open ? 'rgba(204, 51, 51, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
          color: '#fff',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          letterSpacing: '0.5px',
        }}
      >
        {initials}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '0',
            minWidth: '200px',
            background: 'rgba(10, 10, 10, 0.9)',
            backdropFilter: 'blur(24px) saturate(200%)',
            WebkitBackdropFilter: 'blur(24px) saturate(200%)',
            border: '1px solid rgba(204, 51, 51, 0.35)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6), 0 0 20px rgba(204,51,51,0.2)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#D0D0D0',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              wordBreak: 'break-all',
            }}
          >
            {userName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#CC3333',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              width: '100%',
              padding: '6px 4px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(204,51,51,0.15)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#CC3333';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}