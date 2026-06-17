// src/components/map/MapTooltip.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface TooltipData {
  id: string;
  nama: string;
  divisi: string;
  tipe: string;
  status: string;
  data_summary: any;
  // Untuk komersial, kita tambahkan revenue, cost, profit, margin (opsional)
  revenue?: number;
  cost?: number;
  profit?: number;
  margin?: number;
}

// Pricing (sama seperti di MapPanel)
const pricing: Record<string, number> = {
  drill_services: 120000,
  blast_services: 150000,
  drill_blast_services: 200000,
  quarry_mining: 100000,
};

const pricingSC: Record<string, number> = {
  ANFO: 15000000,
  Emulsi: 20000000,
  Detonator: 50000000,
  Boster: 30000000,
};

export default function MapTooltip({
  data,
  x,
  y,
  mode = 'default',
}: {
  data: TooltipData | null;
  x: number;
  y: number;
  mode?: 'default' | 'commercial';
}) {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

  useEffect(() => {
    if (data) {
      setVisible(true);
      const tooltipWidth = mode === 'commercial' ? 300 : 260;
      const tooltipHeight = mode === 'commercial' ? 200 : 140;
      let newX = x + 20;
      let newY = y - (mode === 'commercial' ? 100 : 70);

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
  }, [data, x, y, mode]);

  if (!data) return null;

  const summary = data.data_summary || {};

  // Hitung volume, revenue, cost, profit, margin jika belum diberikan
  let volume = 0;
  let hargaSatuan = 0;
  let satuan = '';
  let revenue = data.revenue ?? 0;
  let cost = data.cost ?? 0;
  let profit = data.profit ?? 0;
  let margin = data.margin ?? 0;

  // Jika data komersial belum dihitung, kita hitung dari data_summary
  if (mode === 'commercial' && !data.revenue) {
    if (data.divisi === 'supply_chain') {
      volume = summary.stok_ton || 0;
      hargaSatuan = pricingSC[summary.jenis_bahan] || 15000000;
      satuan = 'ton';
      revenue = volume * hargaSatuan;
      // Cost akan tetap 0 jika tidak ada data
      profit = revenue - cost;
      margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    } else {
      switch (data.divisi) {
        case 'drill_services':
          volume = (summary.total_lubang || 0) * 10;
          hargaSatuan = pricing[data.divisi] || 100000;
          satuan = 'm³';
          break;
        case 'blast_services':
        case 'drill_blast_services':
          volume = summary.volume_batuan_m3 || 0;
          hargaSatuan = pricing[data.divisi] || 100000;
          satuan = 'm³';
          break;
        case 'quarry_mining':
          volume = summary.volume_produksi_m3 || 0;
          hargaSatuan = pricing[data.divisi] || 100000;
          satuan = 'm³';
          break;
        default:
          volume = 0;
          satuan = '';
      }
      revenue = volume * hargaSatuan;
      profit = revenue - cost;
      margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    }
  }

  const isCommercial = mode === 'commercial';

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
        padding: isCommercial ? '18px 20px' : '16px 18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(204,51,51,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        minWidth: isCommercial ? '280px' : '220px',
        maxWidth: '320px',
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
            background: isCommercial ? '#10B981' : data.tipe === 'gudang' ? '#3B82F6' : '#F97316',
            boxShadow: `0 0 10px ${isCommercial ? '#10B981' : data.tipe === 'gudang' ? '#3B82F6' : '#F97316'}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px' }}>{data.nama}</span>
      </div>

      {/* Sub info */}
      <div style={{ fontSize: '11px', color: '#B0B0B0', marginBottom: isCommercial ? '12px' : '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span>{data.divisi === 'supply_chain' ? 'SC' : data.divisi.replace(/_/g, ' ')} • {data.tipe}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: data.status === 'aktif' ? '#4ade80' : '#f87171' }}>
          <span style={{ fontSize: '10px' }}>{data.status === 'aktif' ? '●' : '●'}</span>
          {data.status}
        </span>
      </div>

      {/* --- MODE DEFAULT: Progress bar stok/produksi --- */}
      {!isCommercial && (
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
                width: `${(() => {
                  if (data.divisi === 'supply_chain') {
                    const kap = summary.kapasitas_ton || 1;
                    const stok = summary.stok_ton || 0;
                    return Math.min((stok / kap) * 100, 100);
                  } else if (data.divisi === 'drill_services') {
                    return summary.progress_persen || 0;
                  } else if (data.divisi === 'blast_services' || data.divisi === 'drill_blast_services') {
                    const vol = summary.volume_batuan_m3 || 0;
                    const target = summary.target_batuan_m3 || 50000;
                    return Math.min((vol / target) * 100, 100);
                  } else if (data.divisi === 'quarry_mining') {
                    const prod = summary.volume_produksi_m3 || 0;
                    const target = summary.target_bulanan_m3 || 50000;
                    return Math.min((prod / target) * 100, 100);
                  }
                  return 0;
                })()}%`,
                background: data.divisi === 'supply_chain' ? '#3B82F6' : '#F97316',
                borderRadius: '3px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: '#D0D0D0', fontWeight: 500 }}>
              {data.divisi === 'supply_chain'
                ? `Stok: ${summary.stok_ton ?? '-'} / ${summary.kapasitas_ton ?? '-'} ton`
                : data.divisi === 'drill_services'
                ? `${summary.total_lubang ?? '-'} lubang`
                : `Volume: ${(summary.volume_batuan_m3 || summary.volume_produksi_m3 || 0).toLocaleString()} m³`}
            </span>
            <span style={{ color: '#A0A0A0' }}>
              {data.divisi === 'supply_chain'
                ? `${Math.min(((summary.stok_ton || 0) / (summary.kapasitas_ton || 1)) * 100, 100).toFixed(0)}%`
                : data.divisi === 'drill_services'
                ? `${summary.progress_persen || 0}%`
                : `${Math.min(((summary.volume_batuan_m3 || summary.volume_produksi_m3 || 0) / (summary.target_batuan_m3 || summary.target_bulanan_m3 || 50000)) * 100, 100).toFixed(0)}%`}
            </span>
          </div>
        </div>
      )}

      {/* --- MODE KOMERSIAL: Revenue, Profit, Margin --- */}
      {isCommercial && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#B0B0B0' }}>Volume</span>
            <span style={{ fontWeight: 500 }}>{volume.toLocaleString()} {satuan}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#B0B0B0' }}>Harga</span>
            <span style={{ fontWeight: 500 }}>Rp {hargaSatuan.toLocaleString()}/{satuan}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#B0B0B0' }}>Revenue</span>
            <span style={{ fontWeight: 600, color: '#10B981' }}>Rp {revenue.toLocaleString()}</span>
          </div>
          {cost > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#B0B0B0' }}>Cost</span>
              <span style={{ fontWeight: 600, color: '#EF4444' }}>Rp {cost.toLocaleString()}</span>
            </div>
          )}
          <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#B0B0B0' }}>Profit</span>
            <span style={{ fontWeight: 600, color: profit >= 0 ? '#10B981' : '#EF4444' }}>Rp {profit.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#B0B0B0' }}>Margin</span>
            <span style={{ fontWeight: 600, color: margin >= 0 ? '#10B981' : '#EF4444' }}>{margin.toFixed(1)}%</span>
          </div>
          {/* Progress bar margin */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${Math.min(Math.max(margin, 0), 100)}%`, background: margin >= 0 ? '#10B981' : '#EF4444', borderRadius: '2px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}