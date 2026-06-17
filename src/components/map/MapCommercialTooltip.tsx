'use client';

interface CommercialData {
  proyek: {
    nama_lokasi: string;
    divisi: string;
  };
  volume: number;
  hargaSatuan: number;
  revenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  ppn: number;
  satuan: string;
}

export default function MapCommercialTooltip({
  data,
  x,
  y,
}: {
  data: CommercialData | null;
  x: number;
  y: number;
}) {
  if (!data) return null;

  const { proyek } = data;
  const profitColor = data.profit >= 0 ? '#10B981' : '#EF4444';

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 15,
        top: y - 10,
        zIndex: 9999,
        background: 'rgba(10, 10, 10, 0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${profitColor}40`,
        borderRadius: '12px',
        padding: '14px 18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(204,51,51,0.2)',
        pointerEvents: 'none',
        minWidth: '220px',
        maxWidth: '260px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: profitColor,
          boxShadow: `0 0 8px ${profitColor}`,
        }} />
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{proyek.nama_lokasi}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#B0B0B0', marginBottom: '8px' }}>
        {proyek.divisi.replace(/_/g, ' ')}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#A0A0A0' }}>Volume</span>
          <span style={{ fontWeight: 500 }}>{data.volume.toLocaleString()} {data.satuan}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#A0A0A0' }}>Revenue</span>
          <span style={{ fontWeight: 500, color: '#10B981' }}>Rp {data.revenue.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#A0A0A0' }}>Cost</span>
          <span style={{ fontWeight: 500, color: '#EF4444' }}>Rp {data.totalCost.toLocaleString()}</span>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Profit</span>
          <span style={{ color: profitColor }}>Rp {data.profit.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: '#A0A0A0' }}>Margin</span>
          <span style={{ color: profitColor, fontWeight: 600 }}>{data.margin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}