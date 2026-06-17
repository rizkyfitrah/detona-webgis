'use client';

import { useState, useEffect } from 'react';

interface Proyek {
  id: string;
  divisi: string;
  tipe: string;
  status: string;
  data_summary: any;
}

export default function MapBottomDashboard({ proyekData }: { proyekData: Proyek[] }) {
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const total = proyekData.length;
  const divisiList = [
    { key: 'supply_chain', label: 'SC', color: '#3B82F6' },
    { key: 'drill_services', label: 'Drill', color: '#06B6D4' },
    { key: 'blast_services', label: 'Blast', color: '#F97316' },
    { key: 'drill_blast_services', label: 'D&B', color: '#8B5CF6' },
    { key: 'quarry_mining', label: 'Quarry', color: '#10B981' },
  ];

  let avgProgress = 0;
  if (total > 0) {
    avgProgress = Math.round(
      proyekData
        .map((p) => {
          const s = p.data_summary || {};
          switch (p.divisi) {
            case 'supply_chain': return Math.min(((s.stok_ton || 0) / (s.kapasitas_ton || 1)) * 100, 100);
            case 'drill_services': return s.progress_persen || 0;
            case 'blast_services':
            case 'drill_blast_services': return Math.min(((s.volume_batuan_m3 || 0) / (s.target_batuan_m3 || 50000)) * 100, 100);
            case 'quarry_mining': return Math.min(((s.volume_produksi_m3 || 0) / (s.target_bulanan_m3 || 50000)) * 100, 100);
            default: return 0;
          }
        })
        .reduce((a, b) => a + b, 0) / total
    );
  }

  return (
    <div
      data-tut="bottom-dashboard"
      className="bottom-dashboard"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 1100,
        background: 'rgba(20, 20, 20, 0.3)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(204, 51, 51, 0.25)',
        borderRadius: '20px',
        padding: '18px 26px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        overflowX: 'auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '50px' }}>
        <span style={{ fontSize: '10px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>Total</span>
        <span className="total-number" style={{ fontSize: '28px', fontWeight: 700, color: '#F5F5F5', lineHeight: '1' }}>{total}</span>
      </div>

      <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.08)' }} />

      <div className="progress-section" style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#D0D0D0', fontWeight: 500 }}>Progres Global</span>
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${avgProgress}%`, background: 'linear-gradient(90deg, #CC3333, #F97316)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ fontSize: '10px', color: '#B0B0B0', textAlign: 'right' }}>{avgProgress}%</div>
      </div>

      <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.08)' }} />

      <div className="kpi-cards" style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 'fit-content' }}>
        {divisiList.map((d) => {
          const count = proyekData.filter((p) => p.divisi === d.key).length;
          return (
            <div
              key={d.key}
              className="kpi-card"
              style={{
                background: `${d.color}15`,
                border: `1px solid ${d.color}40`,
                borderRadius: '10px',
                padding: '8px 14px',
                textAlign: 'center',
                minWidth: '65px',
                cursor: 'default',
                transition: 'all 0.2s ease',
                transform: hoveredCard === d.key ? 'translateY(-2px)' : 'none',
                boxShadow: hoveredCard === d.key ? `0 0 10px ${d.color}40` : 'none',
              }}
              onMouseEnter={() => setHoveredCard(d.key)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="kpi-label" style={{ fontSize: '9px', color: d.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{d.label}</div>
              <div className="kpi-value" style={{ fontSize: '18px', fontWeight: 600 }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}