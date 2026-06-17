'use client';

import { useEffect, useState } from 'react';

export default function MapTopBar({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  visibleDivisi,
  toggleDivisi,
  onZoomIn,
  onZoomOut,
  showCommercial,
  onToggleCommercial,
}: {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSearchFocus: () => void;
  visibleDivisi: {
    supply_chain: boolean;
    drill_services: boolean;
    blast_services: boolean;
    drill_blast_services: boolean;
    quarry_mining: boolean;
  };
  toggleDivisi: (d: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  showCommercial?: boolean;
  onToggleCommercial?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState('');
  const [layerOpen, setLayerOpen] = useState(false);

  useEffect(() => {
    setVisible(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenWalkthrough = () => {
    window.dispatchEvent(new Event('open-walkthrough'));
  };

  const layers = [
    { key: 'supply_chain', label: 'Supply Chain', color: '#3B82F6' },
    { key: 'drill_services', label: 'Drill Services', color: '#06B6D4' },
    { key: 'blast_services', label: 'Blast Services', color: '#F97316' },
    { key: 'drill_blast_services', label: 'Drill & Blast', color: '#8B5CF6' },
    { key: 'quarry_mining', label: 'Quarry Mining', color: '#10B981' },
  ];

  return (
    <div
      className="topbar-inner"
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-30px)',
        opacity: visible ? 1 : 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(204, 51, 51, 0.4)',
        borderRadius: '28px',
        padding: '10px 20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(204,51,51,0.3)',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {/* Logo */}
      <div className="topbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #8B0000, #CC3333)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            filter: 'drop-shadow(0 0 10px rgba(204,51,51,0.9))',
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />
        <span
          className="topbar-logo-text"
          style={{
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '2px',
            color: '#F5F5F5',
            textShadow: '0 0 15px rgba(204,51,51,0.3)',
          }}
        >
          DETONA
        </span>
      </div>

      <div
        style={{
          width: '1px',
          height: '22px',
          background: 'linear-gradient(to bottom, transparent, rgba(204,51,51,0.5), transparent)',
        }}
      />

      {/* Search bar */}
      <div
        className="topbar-search search-wrapper"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '14px',
          padding: '0 14px',
          height: '38px',
          width: '240px',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CC3333"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Cari proyek..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={(e) => {
            onSearchFocus();
            e.currentTarget.parentElement!.style.borderColor = '#CC3333';
            e.currentTarget.parentElement!.style.boxShadow = '0 0 12px rgba(204,51,51,0.4)';
            e.currentTarget.parentElement!.style.background = 'rgba(255,255,255,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.parentElement!.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.parentElement!.style.boxShadow = 'none';
            e.currentTarget.parentElement!.style.background = 'rgba(255,255,255,0.08)';
          }}
          style={{
            flex: 1,
            padding: '6px 8px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#CC3333',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Layer dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          data-tut="layer-btn"
          className="topbar-layer-btn"
          onClick={() => setLayerOpen(!layerOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: layerOpen ? 'rgba(204,51,51,0.1)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '6px 10px',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 22 8.5 12 15 2 8.5" />
            <polyline points="2 15.5 12 22 22 15.5" />
          </svg>
          <span>Layer</span>
        </button>
        {layerOpen && (
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              background: 'rgba(10,10,10,0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(204,51,51,0.3)',
              borderRadius: '12px',
              padding: '10px 14px',
              minWidth: '200px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              zIndex: 1300,
            }}
          >
            {layers.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleDivisi(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: (visibleDivisi as any)[item.key] ? '#fff' : '#666',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '4px 0',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.color,
                    opacity: (visibleDivisi as any)[item.key] ? 1 : 0.4,
                  }}
                />
                <span>{item.label}</span>
              </button>
            ))}
            {/* Toggle Komersial */}
            {onToggleCommercial && (
              <button
                onClick={onToggleCommercial}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: showCommercial ? '#fff' : '#666',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '4px 0',
                  marginTop: '4px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#CC3333',
                    opacity: showCommercial ? 1 : 0.4,
                  }}
                />
                <span>💰 Komersial</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Jam */}
      <div
        className="topbar-time"
        style={{
          fontSize: '12px',
          color: '#B0B0B0',
          fontWeight: 300,
          letterSpacing: '1px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {time}
      </div>

      {/* Tombol Help */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleOpenWalkthrough}
          title="Panduan & Bantuan"
          className="topbar-help-btn"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#A0A0A0',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>

      {/* Tombol Zoom */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="topbar-zoom-btn"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#A0A0A0',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="topbar-zoom-btn"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#A0A0A0',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}