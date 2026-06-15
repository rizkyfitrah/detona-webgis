'use client';

interface TooltipData {
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
  if (!data) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 15,
        top: y - 10,
        zIndex: 9999,
        background: 'rgba(10, 10, 10, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(204, 51, 51, 0.4)',
        borderRadius: '10px',
        padding: '14px 18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(204,51,51,0.2)',
        pointerEvents: 'none',
        transition: 'opacity 0.2s ease',
        maxWidth: '260px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: data.tipe === 'gudang' ? '#3B82F6' : '#F97316',
            boxShadow: `0 0 8px ${data.tipe === 'gudang' ? '#3B82F6' : '#F97316'}`,
          }}
        />
        <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>{data.nama}</span>
      </div>
      <div style={{ fontSize: '11px', color: '#B0B0B0', marginBottom: '6px' }}>
        {data.divisi === 'supply_chain' ? 'Supply Chain' : 'Operasional'} • {data.tipe}
      </div>
      <div style={{ fontSize: '11px', color: '#D0D0D0' }}>
        {data.divisi === 'supply_chain'
          ? `Stok: ${data.data_summary?.stok_ton ?? '-'} ton | Kapasitas: ${data.data_summary?.kapasitas_ton ?? '-'} ton`
          : `Progress: ${data.data_summary?.progress_mingguan_persen ?? '-'}% | Tim: ${data.data_summary?.jumlah_tim ?? '-'}`}
      </div>
    </div>
  );
}