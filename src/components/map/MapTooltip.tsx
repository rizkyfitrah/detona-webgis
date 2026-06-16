'use client';

import { useEffect, useState, useRef } from 'react';

interface TooltipData {
  id: string;
  nama: string;
  divisi: string;
  tipe: string;
  status: string;
  data_summary: any;
}

export default function MapTooltip({
  data,
  x,
  y,
}: {
  data: TooltipData | null;
  x: number;
  y: number;
}) {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

  useEffect(() => {
    if (data) {
      setVisible(true);
      const tooltipWidth = 270;
      const tooltipHeight = 160; // lebih tinggi karena progress bar
      let newX = x + 20;
      let newY = y - 80;

      if (newX + tooltipWidth > window.innerWidth - 10) {
        newX = x - tooltipWidth - 20;
      }
      if (newY + tooltipHeight > window.innerHeight - 10) {
        newY = y - tooltipHeight - 20;
      }
      if (newY < 10) newY = 10;
      if (newX < 10) newX = 10;

      setAdjustedX(newX);
      setAdjustedY(newY);
    } else {
      setVisible(false);
    }
  }, [data, x, y]);

  if (!data) return null;

  const isSupply = data.divisi === 'supply_chain';
  const summary = data.data_summary || {};

  // Hitung progress
  let progressPercent = 0;
  let progressLabel = '';
  let progressDetail = '';

  if (isSupply) {
    const kapasitas = summary.kapasitas_ton || 1;
    const stok = summary.stok_ton || 0;
    progressPercent = Math.min((stok / kapasitas) * 100, 100);
    progressLabel = `Stok ${stok} / ${kapasitas} ton`;
    progressDetail = `${progressPercent.toFixed(0)}% terisi`;
  } else {
    // Tambang: gunakan progress_mingguan_persen sebagai capaian bulanan
    const volume = summary.volume_batuan_m3 ?? 0;
    const persen = summary.progress_mingguan_persen ?? 0;
    progressPercent = Math.min(persen, 100);
    progressLabel = `Produksi ${volume.toLocaleString()} m³`;
    progressDetail = `Capaian ${progressPercent}% bulan ini`;
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 9999,
        background: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        border: '1px solid rgba(204, 51, 51, 0.35)',
        borderRadius: '14px',
        padding: '16px 18px 14px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        minWidth: '240px',
        maxWidth: '280px',
      }}
    >
      {/* Panah kecil */}
      <div
        style={{
          position: 'absolute',
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '7px solid rgba(204, 51, 51, 0.35)',
        }}
      />

      {/* Header: indikator + nama */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: data.tipe === 'gudang' ? '#3B82F6' : '#F97316',
            boxShadow: `0 0 10px ${data.tipe === 'gudang' ? '#3B82F6' : '#F97316'}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px' }}>{data.nama}</span>
      </div>

      {/* Sub info */}
      <div style={{ fontSize: '11px', color: '#B0B0B0', marginBottom: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span>{isSupply ? 'SC' : 'OPS'} • {data.tipe}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: data.status === 'aktif' ? '#4ade80' : '#f87171' }}>
          <span style={{ fontSize: '10px' }}>{data.status === 'aktif' ? '●' : '●'}</span>
          {data.status}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '6px' }}>
        <div style={{
          height: '6px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '6px',
        }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: isSupply
                ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                : 'linear-gradient(90deg, #F97316, #FB923C)',
              borderRadius: '3px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#D0D0D0', fontWeight: 500 }}>{progressLabel}</span>
          <span style={{ color: '#A0A0A0' }}>{progressDetail}</span>
        </div>
      </div>
    </div>
  );
}