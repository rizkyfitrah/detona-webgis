'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts';
import { supabase } from '@/lib/supabase';

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'drill_services' | 'blast_services' | 'drill_blast_services' | 'quarry_mining';
  tipe: string;
  status: string;
  data_summary: any;
  total_cost?: number; // <-- tambahkan ini
  geom: { coordinates: [number, number] };
}

const divisiColors: Record<string, string> = {
  supply_chain: '#3B82F6',
  drill_services: '#06B6D4',
  blast_services: '#F97316',
  drill_blast_services: '#8B5CF6',
  quarry_mining: '#10B981',
};

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

function generateDailyData(divisi: string) {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    let value = 0;
    switch (divisi) {
      case 'supply_chain': value = Math.floor(Math.random() * 50 + 10); break;
      case 'drill_services': value = Math.floor(Math.random() * 30 + 5); break;
      case 'blast_services': value = Math.floor(Math.random() * 2000 + 500); break;
      case 'drill_blast_services': value = Math.floor(Math.random() * 2500 + 800); break;
      case 'quarry_mining': value = Math.floor(Math.random() * 3000 + 1000); break;
    }
    data.push({ date: label, value });
  }
  return data;
}

function generateMonthlyRevenue() {
  const data = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
    const value = Math.floor(Math.random() * 150000000 + 50000000);
    data.push({ month: label, revenue: value });
  }
  return data;
}

const CustomTooltipDefault = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(204,51,51,0.4)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '12px', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: 0, color: '#B0B0B0' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#FB923C' }}>{payload[0].value} m³</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipCommercial = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(204,51,51,0.4)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '12px', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: 0, color: '#B0B0B0' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#10B981' }}>Rp {payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const cardStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid rgba(255,255,255,0.06)',
};

function DefaultChart({ data, color, proyek }: { data: any[]; color: string; proyek: Proyek }) {
  return (
    <div className="chart-container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '28px' }}>
      <div style={{ fontSize: '12px', color: '#B0B0B0', marginBottom: '10px' }}>
        {proyek.divisi === 'supply_chain' ? 'Pengeluaran Handak Harian (30 Hari)' : 'Produksi Harian (30 Hari)'}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`color-${proyek.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#808080' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltipDefault />} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#color-${proyek.id})`} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CommercialChart({ data, color }: { data: any[]; color: string }) {
  return (
    <div className="chart-container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '28px' }}>
      <div style={{ fontSize: '12px', color: '#B0B0B0', marginBottom: '10px' }}>
        Revenue Bulanan (12 Bulan Terakhir)
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#808080' }} axisLine={false} tickLine={false} width={50} />
          <Tooltip content={<CustomTooltipCommercial />} />
          <Bar dataKey="revenue" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MapPanel({
  proyek,
  onClose,
  mode = 'default',
}: {
  proyek: Proyek | null;
  onClose: () => void;
  mode?: 'default' | 'commercial';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.transform = proyek ? 'translateX(0)' : 'translateX(100%)';
    }
  }, [proyek]);

  useEffect(() => {
    if (!proyek) return;
    // Ambil langsung dari field total_cost (jika sudah ditambahkan di database)
    if (proyek.total_cost !== undefined) {
      setTotalCost(proyek.total_cost);
      return;
    }
    // Fallback: query langsung ke cost_project (hanya jika field belum ada)
    supabase
      .from('cost_project')
      .select('jumlah')
      .eq('proyek_id', proyek.id)
      .then(({ data }) => {
        const total = (data || []).reduce((sum: number, r: any) => sum + Number(r.jumlah), 0);
        setTotalCost(total);
      });
  }, [proyek]);

  const dailyData = useMemo(() => {
    if (!proyek) return [];
    return generateDailyData(proyek.divisi);
  }, [proyek]);

  const monthlyData = useMemo(() => {
    if (!proyek) return [];
    return generateMonthlyRevenue();
  }, [proyek]);

  if (!proyek) return null;

  const summary = proyek.data_summary || {};
  const currentColor = mode === 'commercial' ? '#10B981' : divisiColors[proyek.divisi] || '#F97316';
  const isCommercial = mode === 'commercial';

  let defaultCards = null;
  if (!isCommercial) {
    switch (proyek.divisi) {
      case 'supply_chain':
        defaultCards = (
          <>
            <div className="panel-card" style={cardStyle}><div className="label">STOK</div><div className="value">{summary.stok_ton ?? '-'} ton</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">JENIS</div><div className="value">{summary.jenis_bahan ?? '-'}</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">INSPEKSI</div><div className="value">{summary.inspeksi_terakhir ?? '-'}</div></div>
          </>
        );
        break;
      case 'drill_services':
        defaultCards = (
          <>
            <div className="panel-card" style={cardStyle}><div className="label">LUBANG</div><div className="value">{summary.total_lubang ?? '-'}</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">RIG</div><div className="value">{summary.jumlah_rig ?? '-'}</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">PROGRES</div><div className="value">{summary.progress_persen ?? '-'}%</div></div>
          </>
        );
        break;
      case 'blast_services':
        defaultCards = (
          <>
            <div className="panel-card" style={cardStyle}><div className="label">VOLUME</div><div className="value">{summary.volume_batuan_m3 ?? '-'} m³</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">HANDAK</div><div className="value">{summary.pemakaian_handak_kg ?? '-'} kg</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">TIM</div><div className="value">{summary.jumlah_tim ?? '-'}</div></div>
          </>
        );
        break;
      case 'drill_blast_services':
        defaultCards = (
          <>
            <div className="panel-card" style={cardStyle}><div className="label">VOLUME</div><div className="value">{summary.volume_batuan_m3 ?? '-'} m³</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">LUBANG</div><div className="value">{summary.total_lubang ?? '-'}</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">RIG/TIM</div><div className="value">{summary.jumlah_rig ?? '-'}/{summary.jumlah_tim ?? '-'}</div></div>
          </>
        );
        break;
      case 'quarry_mining':
        defaultCards = (
          <>
            <div className="panel-card" style={cardStyle}><div className="label">PRODUKSI</div><div className="value">{summary.volume_produksi_m3 ?? '-'} m³</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">ALAT</div><div className="value">{summary.alat_berat ?? '-'}</div></div>
            <div className="panel-card" style={cardStyle}><div className="label">PEKERJA</div><div className="value">{summary.jumlah_pekerja ?? '-'}</div></div>
          </>
        );
        break;
    }
  }

  let progressPercent = 0;
  let progressLabel = '';
  let targetLabel = '';
  if (!isCommercial) {
    switch (proyek.divisi) {
      case 'supply_chain': {
        const kap = summary.kapasitas_ton || 1;
        const stok = summary.stok_ton || 0;
        progressPercent = Math.min((stok / kap) * 100, 100);
        progressLabel = `Stok ${stok}/${kap} ton`;
        break;
      }
      case 'drill_services':
        progressPercent = summary.progress_persen || 0;
        progressLabel = `${summary.total_lubang || 0} lubang`;
        targetLabel = `Target: ${summary.target_bulanan || '-'} m`;
        break;
      case 'blast_services':
      case 'drill_blast_services': {
        const vol = summary.volume_batuan_m3 || 0;
        const target = summary.target_batuan_m3 || 50000;
        progressPercent = Math.min((vol / target) * 100, 100);
        progressLabel = `Volume ${vol.toLocaleString()} m³`;
        targetLabel = `Target: ${target.toLocaleString()} m³/bulan`;
        break;
      }
      case 'quarry_mining': {
        const prod = summary.volume_produksi_m3 || 0;
        const target = summary.target_bulanan_m3 || 50000;
        progressPercent = Math.min((prod / target) * 100, 100);
        progressLabel = `Produksi ${prod.toLocaleString()} m³`;
        targetLabel = `Target: ${target.toLocaleString()} m³/bulan`;
        break;
      }
    }
  }

  let commercialCards = null;
  if (isCommercial) {
    let volume = 0;
    let hargaSatuan = 0;

    if (proyek.divisi === 'supply_chain') {
      volume = summary.stok_ton || 0;
      hargaSatuan = pricingSC[summary.jenis_bahan] || 15000000;
    } else {
      switch (proyek.divisi) {
        case 'drill_services': volume = (summary.total_lubang || 0) * 10; hargaSatuan = pricing[proyek.divisi] || 100000; break;
        case 'blast_services':
        case 'drill_blast_services': volume = summary.volume_batuan_m3 || 0; hargaSatuan = pricing[proyek.divisi] || 100000; break;
        case 'quarry_mining': volume = summary.volume_produksi_m3 || 0; hargaSatuan = pricing[proyek.divisi] || 100000; break;
      }
    }

    const revenue = volume * hargaSatuan;
    const ppn = revenue * 0.11;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    commercialCards = (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <div style={{ flex: '1 1 45%', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#A0A0A0' }}>REVENUE</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>Rp {revenue.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 45%', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#A0A0A0' }}>COST</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#EF4444' }}>Rp {totalCost.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 45%', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#A0A0A0' }}>PROFIT</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: profit >= 0 ? '#10B981' : '#EF4444' }}>Rp {profit.toLocaleString()}</div>
        </div>
        <div style={{ flex: '1 1 45%', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '10px', color: '#A0A0A0' }}>MARGIN</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: margin >= 0 ? '#10B981' : '#EF4444' }}>{margin.toFixed(1)}%</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="map-panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '380px',
        maxWidth: '90vw',
        height: '100vh',
        background: 'rgba(15, 15, 15, 0.45)',
        backdropFilter: 'blur(32px) saturate(200%)',
        borderLeft: '1px solid rgba(204, 51, 51, 0.3)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
        zIndex: 2000,
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div style={{ flex: 1, padding: '36px 32px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', color: '#CC3333', fontSize: '20px', cursor: 'pointer' }}>✕</button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ width: '30px', height: '2px', background: '#CC3333', marginBottom: '18px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 600 }}>{proyek.nama_lokasi}</h2>
            {isCommercial && <span style={{ fontSize: '12px', background: '#10B98120', color: '#10B981', padding: '2px 8px', borderRadius: '12px', border: '1px solid #10B98140' }}>KOMERSIAL</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(204,51,51,0.1)', color: currentColor, fontWeight: 500 }}>{proyek.divisi.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: '14px', color: '#B0B0B0', textTransform: 'capitalize' }}>{proyek.tipe}</span>
            <span style={{ fontSize: '13px', color: proyek.status === 'aktif' ? '#4ade80' : '#f87171', marginLeft: 'auto', background: proyek.status === 'aktif' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', padding: '3px 12px', borderRadius: '20px' }}>{proyek.status}</span>
          </div>
        </div>

        {!isCommercial && <div className="panel-cards" style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>{defaultCards}</div>}
        {isCommercial && commercialCards}

        {isCommercial ? <CommercialChart data={monthlyData} color={currentColor} /> : <DefaultChart data={dailyData} color={currentColor} proyek={proyek} />}

        {!isCommercial && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#B0B0B0', marginBottom: '8px' }}>
              <span>{proyek.divisi === 'supply_chain' ? 'Level Stok' : 'Capaian'}</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: `linear-gradient(90deg, ${currentColor}, ${currentColor}88)`, borderRadius: '4px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#A0A0A0', marginTop: '6px' }}>
              <span>{progressLabel}</span>
              {targetLabel && <span>{targetLabel}</span>}
            </div>
          </div>
        )}

        {isCommercial && (
          <div style={{ marginBottom: '28px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#D0D0D0', marginBottom: '12px' }}>Detail Komersial</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                let volume = 0, hargaSatuan = 0;
                if (proyek.divisi === 'supply_chain') {
                  volume = summary.stok_ton || 0;
                  hargaSatuan = pricingSC[summary.jenis_bahan] || 15000000;
                } else {
                  switch (proyek.divisi) {
                    case 'drill_services': volume = (summary.total_lubang || 0) * 10; hargaSatuan = pricing[proyek.divisi] || 100000; break;
                    case 'blast_services':
                    case 'drill_blast_services': volume = summary.volume_batuan_m3 || 0; hargaSatuan = pricing[proyek.divisi] || 100000; break;
                    case 'quarry_mining': volume = summary.volume_produksi_m3 || 0; hargaSatuan = pricing[proyek.divisi] || 100000; break;
                  }
                }
                const revenue = volume * hargaSatuan;
                const ppn = revenue * 0.11;
                const profit = revenue - totalCost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#B0B0B0' }}>Volume</span><span style={{ fontWeight: 500 }}>{volume.toLocaleString()} {proyek.divisi === 'supply_chain' ? 'ton' : 'm³'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#B0B0B0' }}>Harga Satuan</span><span style={{ fontWeight: 500 }}>Rp {hargaSatuan.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#B0B0B0' }}>Revenue</span><span style={{ fontWeight: 500, color: '#10B981' }}>Rp {revenue.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#B0B0B0' }}>Total Cost</span><span style={{ fontWeight: 500, color: '#EF4444' }}>Rp {totalCost.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: '#B0B0B0' }}>PPN (11%)</span><span style={{ fontWeight: 500, color: '#F59E0B' }}>Rp {ppn.toLocaleString()}</span></div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}><span>Profit</span><span style={{ color: profit >= 0 ? '#10B981' : '#EF4444' }}>Rp {profit.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#A0A0A0' }}><span>Margin</span><span style={{ color: margin >= 0 ? '#10B981' : '#EF4444' }}>{margin.toFixed(1)}%</span></div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#D0D0D0', marginBottom: '14px' }}>Aktivitas Terbaru</h3>
          {[{ icon: '✓', text: 'Inspeksi rutin selesai', time: '12 Jun' }, { icon: '↻', text: 'Pekerjaan lapangan', time: '10 Jun' }, { icon: '⚠', text: 'Pengecekan K3', time: '8 Jun' }].map((act, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(204,51,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#CC3333' }}>{act.icon}</span>
              <div><div style={{ fontSize: '14px', color: '#E0E0E0' }}>{act.text}</div><div style={{ fontSize: '12px', color: '#909090' }}>{act.time}</div></div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '14px', color: '#A0A0A0', marginBottom: '8px' }}>Koordinat: {proyek.geom.coordinates[1].toFixed(4)}, {proyek.geom.coordinates[0].toFixed(4)}</div>
        <div style={{ fontSize: '14px', color: '#A0A0A0' }}>Penanggung Jawab: Andi Pratama (Supervisor)</div>
      </div>

      <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,15,15,0.8)', backdropFilter: 'blur(20px)' }}>
        <button
          style={{ width: '100%', padding: '16px', background: `linear-gradient(135deg, #8B0000, ${currentColor})`, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '16px', cursor: 'pointer', boxShadow: `0 8px 20px ${currentColor}40`, transition: 'all 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${currentColor}60`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 20px ${currentColor}40`; }}
          onClick={() => window.open(`/proyek/${proyek.id}`, '_blank')}
        >Buka Webapp Proyek</button>
      </div>
    </div>
  );
}