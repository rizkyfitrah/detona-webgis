'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'operasional';
  tipe: 'gudang' | 'tambang';
  status: string;
  data_summary: any;
  geom: { coordinates: [number, number] };
}

// Generate data harian dummy
function generateDailyData(type: 'gudang' | 'tambang') {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStr = date.getDate().toString().padStart(2, '0');
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    const label = `${dayStr}/${monthStr}`;

    let value = 0;
    if (type === 'gudang') {
      // Pengeluaran handak harian (ton) dengan variasi acak
      value = Math.floor(Math.random() * 50 + 10);
    } else {
      // Produksi harian (m³)
      value = Math.floor(Math.random() * 2000 + 500);
    }
    data.push({ date: label, value });
  }
  return data;
}

// Tooltip kustom premium
const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(204, 51, 51, 0.4)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        }}
      >
        <p style={{ margin: 0, color: '#B0B0B0' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 600, color: type === 'gudang' ? '#60A5FA' : '#FB923C' }}>
          {type === 'gudang' ? `${payload[0].value} ton` : `${payload[0].value} m³`}
        </p>
      </div>
    );
  }
  return null;
};

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

  const dailyData = useMemo(() => {
    if (!proyek) return [];
    return generateDailyData(proyek.tipe);
  }, [proyek]);

  if (!proyek) return null;

  const isSupply = proyek.divisi === 'supply_chain';
  const summary = proyek.data_summary || {};

  // Hitung progress
  let progressPercent = 0;
  let progressLabel = '';
  let targetLabel = '';

  if (isSupply) {
    const kapasitas = summary.kapasitas_ton || 1;
    const stok = summary.stok_ton || 0;
    progressPercent = Math.min((stok / kapasitas) * 100, 100);
    progressLabel = `Stok ${stok} / ${kapasitas} ton`;
  } else {
    const volume = summary.volume_batuan_m3 || 0;
    const target = summary.target_batuan_m3 || 50000;
    progressPercent = Math.min((volume / target) * 100, 100);
    progressLabel = `Produksi ${volume.toLocaleString()} m³`;
    targetLabel = `Target: ${target.toLocaleString()} m³/bulan`;
  }

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
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            color: '#CC3333',
            fontSize: '20px',
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
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '30px', height: '2px', background: '#CC3333', marginBottom: '18px' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '0.5px', margin: '0 0 10px 0' }}>
            {proyek.nama_lokasi}
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '14px',
              padding: '5px 14px',
              borderRadius: '20px',
              background: isSupply ? 'rgba(59,130,246,0.12)' : 'rgba(249,115,22,0.12)',
              color: isSupply ? '#60A5FA' : '#FB923C',
              border: `1px solid ${isSupply ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`,
              fontWeight: 500,
            }}>
              {isSupply ? 'Supply Chain' : 'Operasional'}
            </span>
            <span style={{ fontSize: '14px', color: '#B0B0B0', textTransform: 'capitalize' }}>{proyek.tipe}</span>
            <span style={{
              fontSize: '13px',
              color: proyek.status === 'aktif' ? '#4ade80' : '#f87171',
              marginLeft: 'auto',
              background: proyek.status === 'aktif' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              padding: '3px 12px',
              borderRadius: '20px',
            }}>
              {proyek.status}
            </span>
          </div>
        </div>

        {/* Highlight Cards */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
          {isSupply ? (
            <>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>STOK</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.stok_ton ?? '-'}<span style={{ fontSize: '14px', color: '#B0B0B0' }}> ton</span></div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>JENIS</div>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{summary.jenis_bahan ?? '-'}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>INSPEKSI</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{summary.inspeksi_terakhir ?? '-'}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>VOLUME</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.volume_batuan_m3 ?? '-'}<span style={{ fontSize: '14px', color: '#B0B0B0' }}> m³</span></div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>BOR</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.lubang_bor ?? '-'}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '6px' }}>TIM</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{summary.jumlah_tim ?? '-'}</div>
              </div>
            </>
          )}
        </div>

        {/* Line Chart Premium */}
        <div style={{
          marginBottom: '28px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#B0B0B0', fontWeight: 500 }}>
              {isSupply ? 'Pengeluaran Handak Harian (30 Hari)' : 'Produksi Harian (30 Hari)'}
            </span>
            <span style={{ fontSize: '11px', color: isSupply ? '#60A5FA' : '#FB923C' }}>
              {isSupply ? 'ton' : 'm³'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isSupply ? '#3B82F6' : '#F97316'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isSupply ? '#3B82F6' : '#F97316'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#808080' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#808080' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip type={isSupply ? 'gudang' : 'tambang'} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isSupply ? '#3B82F6' : '#F97316'}
                strokeWidth={2}
                fill="url(#colorLine)"
                dot={false}
                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: isSupply ? '#3B82F6' : '#F97316' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', color: '#B0B0B0' }}>
            <span>{isSupply ? 'Level Stok' : 'Capaian Produksi'}</span>
            <span>{progressPercent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: isSupply
                  ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                  : 'linear-gradient(90deg, #F97316, #FB923C)',
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{progressLabel}</span>
            {!isSupply && <span>{targetLabel}</span>}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '1px', marginBottom: '14px', color: '#D0D0D0' }}>Aktivitas Terbaru</h3>
          {[
            { icon: '✓', text: 'Inspeksi rutin selesai', time: '12 Jun' },
            { icon: '↻', text: isSupply ? 'Pengiriman bahan peledak' : 'Pengeboran selesai', time: '10 Jun' },
            { icon: '⚠', text: 'Pengecekan K3', time: '8 Jun' },
          ].map((act, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(204,51,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#CC3333' }}>{act.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#E0E0E0' }}>{act.text}</div>
                <div style={{ fontSize: '12px', color: '#909090' }}>{act.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Koordinat & PJ */}
        <div style={{ fontSize: '14px', color: '#A0A0A0', marginBottom: '8px' }}>
          Koordinat: {proyek.geom.coordinates[1].toFixed(4)}, {proyek.geom.coordinates[0].toFixed(4)}
        </div>
        <div style={{ fontSize: '14px', color: '#A0A0A0' }}>
          Penanggung Jawab: {isSupply ? 'Andi Pratama' : 'Budi Setiawan'} (Supervisor)
        </div>
      </div>

      {/* Tombol Sticky */}
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
            padding: '16px',
            background: 'linear-gradient(135deg, #8B0000, #CC3333)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 600,
            fontSize: '16px',
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