'use client';

import { useEffect, useRef } from 'react';

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'operasional';
  tipe: 'gudang' | 'tambang';
  status: string;
  data_summary: any;
  geom: { coordinates: [number, number] };
}

export default function MapPanel({
  proyek,
  onClose,
}: {
  proyek: Proyek | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.transform = proyek ? 'translateX(0)' : 'translateX(100%)';
    }
  }, [proyek]);

  if (!proyek) return null;

  const isSupply = proyek.divisi === 'supply_chain';

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '380px',
        maxWidth: '90vw',
        height: '100vh',
        background: 'rgba(15, 15, 15, 0.45)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        borderLeft: '1px solid rgba(204, 51, 51, 0.3)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.05)',
        zIndex: 2000,
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        padding: '0',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Area scroll */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 32px' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            color: '#CC3333',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(204,51,51,0.2)';
            e.currentTarget.style.borderColor = 'rgba(204,51,51,0.5)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#CC3333';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ width: '30px', height: '2px', background: '#CC3333', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
            {proyek.nama_lokasi}
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: isSupply ? 'rgba(59,130,246,0.12)' : 'rgba(249,115,22,0.12)', color: isSupply ? '#60A5FA' : '#FB923C', border: `1px solid ${isSupply ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`, fontWeight: 500 }}>
              {isSupply ? 'Supply Chain' : 'Operasional'}
            </span>
            <span style={{ fontSize: '12px', color: '#B0B0B0', textTransform: 'capitalize' }}>{proyek.tipe}</span>
            <span style={{ fontSize: '11px', color: proyek.status === 'aktif' ? '#4ade80' : '#f87171', marginLeft: 'auto', background: proyek.status === 'aktif' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', padding: '2px 10px', borderRadius: '20px' }}>
              {proyek.status}
            </span>
          </div>
        </div>

        {/* Ringkasan Data */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px', color: '#D0D0D0' }}>Ringkasan Data</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(proyek.data_summary || {}).map(([key, value]) => (
              <div
                key={key}
                className="data-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(204,51,51,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(204,51,51,0.3)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ color: '#A0A0A0', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 500 }}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tombol Buka Webapp (sticky di bawah) */}
      <div style={{
        padding: '20px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(15,15,15,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <button
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #8B0000, #CC3333)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(204,51,51,0.3)',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(204,51,51,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(204,51,51,0.3)';
          }}
          onClick={() => alert('Fitur buka webapp akan datang di sprint berikutnya.')}
        >
          Buka Webapp Proyek
        </button>
      </div>
    </div>
  );
}