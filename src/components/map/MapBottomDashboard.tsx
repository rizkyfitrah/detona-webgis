'use client';

import { useState, useEffect } from 'react';

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'operasional';
  tipe: 'gudang' | 'tambang';
  status: string;
  data_summary: any;
}

export default function MapBottomDashboard({
  proyekData,
}: {
  proyekData: Proyek[];
}) {
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- Perhitungan metrik ---
  const total = proyekData.length;
  const gudangAktif = proyekData.filter(p => p.tipe === 'gudang' && p.status === 'aktif').length;
  const tambangAktif = proyekData.filter(p => p.tipe === 'tambang' && p.status === 'aktif').length;

  const gudangList = proyekData.filter(p => p.tipe === 'gudang');
  const tambangList = proyekData.filter(p => p.tipe === 'tambang');

  let avgGudangProgress = 0;
  if (gudangList.length > 0) {
    const progresses = gudangList.map(p => {
      const kap = p.data_summary?.kapasitas_ton || 1;
      const stok = p.data_summary?.stok_ton || 0;
      return Math.min((stok / kap) * 100, 100);
    });
    avgGudangProgress = Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length);
  }

  let avgTambangProgress = 0;
  if (tambangList.length > 0) {
    const progresses = tambangList.map(p => {
      const volume = p.data_summary?.volume_batuan_m3 || 0;
      const target = p.data_summary?.target_batuan_m3 || 50000;
      return target > 0 ? Math.min((volume / target) * 100, 100) : 0;
    });
    avgTambangProgress = Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length);
  }

  const totalStok = gudangList.reduce((acc, p) => acc + (p.data_summary?.stok_ton || 0), 0);
  const totalVolume = tambangList.reduce((acc, p) => acc + (p.data_summary?.volume_batuan_m3 || 0), 0);

  const today = new Date();
  const perluInspeksi = gudangList.filter(p => {
    if (!p.data_summary?.inspeksi_terakhir) return false;
    const inspeksiDate = new Date(p.data_summary.inspeksi_terakhir);
    const diffDays = Math.floor((today.getTime() - inspeksiDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  }).length + tambangList.filter(p => (p.data_summary?.progress_mingguan_persen || 0) < 30).length;

  return (
    <div
      data-tut="bottom-dashboard"
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
      {/* Total Proyek */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '50px' }}>
        <span style={{ fontSize: '10px', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>Total</span>
        <span style={{ fontSize: '28px', fontWeight: 700, color: '#F5F5F5', lineHeight: '1' }}>{total}</span>
      </div>

      <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.08)' }} />

      {/* Progres Gudang */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', boxShadow: '0 0 6px #3B82F6' }} />
          <span style={{ fontSize: '12px', color: '#D0D0D0', fontWeight: 500 }}>Gudang</span>
          <span style={{ fontSize: '11px', color: '#A0A0A0' }}>{gudangAktif} aktif</span>
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${avgGudangProgress}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ fontSize: '10px', color: '#B0B0B0', textAlign: 'right' }}>{avgGudangProgress}% stok terisi</div>
      </div>

      <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.08)' }} />

      {/* Progres Tambang */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316', boxShadow: '0 0 6px #F97316' }} />
          <span style={{ fontSize: '12px', color: '#D0D0D0', fontWeight: 500 }}>Tambang</span>
          <span style={{ fontSize: '11px', color: '#A0A0A0' }}>{tambangAktif} aktif</span>
        </div>
        <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${avgTambangProgress}%`, background: 'linear-gradient(90deg, #F97316, #FB923C)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ fontSize: '10px', color: '#B0B0B0', textAlign: 'right' }}>{avgTambangProgress}% capaian target</div>
      </div>

      <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.08)' }} />

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch', minWidth: 'fit-content' }}>
        {/* Total Stok */}
        <div
          style={{
            background: hoveredCard === 'stok' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.06)',
            border: `1px solid ${hoveredCard === 'stok' ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)'}`,
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '130px',
            boxShadow: hoveredCard === 'stok' ? '0 0 15px rgba(59,130,246,0.2)' : 'none',
            transform: hoveredCard === 'stok' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={() => setHoveredCard('stok')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={{ fontSize: '10px', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>Total Stok</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{totalStok.toLocaleString()} <span style={{ fontSize: '12px', color: '#A0A0A0' }}>ton</span></span>
        </div>

        {/* Total Volume Produksi */}
        <div
          style={{
            background: hoveredCard === 'produksi' ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.06)',
            border: `1px solid ${hoveredCard === 'produksi' ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.2)'}`,
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '130px',
            boxShadow: hoveredCard === 'produksi' ? '0 0 15px rgba(249,115,22,0.2)' : 'none',
            transform: hoveredCard === 'produksi' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={() => setHoveredCard('produksi')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={{ fontSize: '10px', color: '#FB923C', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>Total Produksi</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{totalVolume.toLocaleString()} <span style={{ fontSize: '12px', color: '#A0A0A0' }}>m³</span></span>
        </div>

        {/* Perlu Inspeksi */}
        <div
          style={{
            background: hoveredCard === 'inspeksi'
              ? (perluInspeksi > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.15)')
              : (perluInspeksi > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(74,222,128,0.06)'),
            border: `1px solid ${
              hoveredCard === 'inspeksi'
                ? (perluInspeksi > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(74,222,128,0.4)')
                : (perluInspeksi > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)')
            }`,
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '130px',
            boxShadow: hoveredCard === 'inspeksi'
              ? (perluInspeksi > 0 ? '0 0 15px rgba(239,68,68,0.2)' : '0 0 15px rgba(74,222,128,0.2)')
              : 'none',
            transform: hoveredCard === 'inspeksi' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={() => setHoveredCard('inspeksi')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span style={{ fontSize: '10px', color: perluInspeksi > 0 ? '#F87171' : '#4ADE80', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 500 }}>Perlu Inspeksi</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{perluInspeksi}</span>
        </div>
      </div>
    </div>
  );
}