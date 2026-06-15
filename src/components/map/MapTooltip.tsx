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
      // Hitung ulang posisi agar tidak keluar layar
      const tooltipWidth = 260;
      const tooltipHeight = 140; // perkiraan
      let newX = x + 20; // offset dari kursor
      let newY = y - 70;

      if (newX + tooltipWidth > window.innerWidth - 10) {
        newX = x - tooltipWidth - 20; // geser ke kiri
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

  let highlightText = '';
  if (isSupply) {
    highlightText = `Stok: ${summary.stok_ton ?? '-'} / ${summary.kapasitas_ton ?? '-'} ton`;
  } else {
    highlightText = `Progress: ${summary.progress_mingguan_persen ?? '-'}%`;
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
        padding: '16px 18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        minWidth: '220px',
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
      <div style={{ fontSize: '11px', color: '#B0B0B0', marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span>{isSupply ? 'SC' : 'OPS'} • {data.tipe}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: data.status === 'aktif' ? '#4ade80' : '#f87171' }}>
          <span style={{ fontSize: '10px' }}>{data.status === 'aktif' ? '●' : '●'}</span>
          {data.status}
        </span>
      </div>

      {/* Highlight */}
      <div style={{
        fontSize: '12px',
        color: '#E0E0E0',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '8px',
        padding: '8px 10px',
        marginTop: '4px',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: '#C0C0C0' }}>{highlightText}</span>
      </div>
    </div>
  );
}