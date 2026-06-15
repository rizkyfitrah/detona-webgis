'use client';

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'operasional';
  tipe: 'gudang' | 'tambang';
  status: string;
  data_summary: any;
  geom: { coordinates: [number, number] };
}

export default function MapSidebar({
  proyekData,
  visibleDivisi,
  searchQuery,
  onSelectProyek,
  isOpen,
  onClose,
}: {
  proyekData: Proyek[];
  visibleDivisi: { supply_chain: boolean; operasional: boolean };
  searchQuery: string;
  onSelectProyek: (proyek: Proyek) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const filtered = proyekData.filter((p) => {
    if (!visibleDivisi[p.divisi]) return false;
    if (searchQuery && !p.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '72px',
        left: isOpen ? '16px' : '-320px',
        bottom: '16px',
        width: '280px',
        maxWidth: '90vw',
        background: 'rgba(20, 20, 20, 0.35)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(204, 51, 51, 0.25)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        zIndex: 999,
        transition: 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        overflowY: 'auto',
      }}
    >
      {/* Header: jumlah hasil + tombol tutup */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ fontSize: '12px', color: '#B0B0B0', fontWeight: 500 }}>
          {filtered.length} proyek ditemukan
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#CC3333',
            cursor: 'pointer',
            fontSize: '16px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(204,51,51,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          ✕
        </button>
      </div>

      {/* Daftar proyek */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#A0A0A0', marginTop: '24px', fontSize: '12px' }}>
          Tidak ada proyek ditemukan
        </div>
      ) : (
        filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProyek(p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              color: '#fff',
              transition: 'all 0.2s ease',
              width: '100%',
              marginBottom: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(204,51,51,0.12)';
              e.currentTarget.style.borderColor = 'rgba(204,51,51,0.35)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: p.tipe === 'gudang' ? '#3B82F6' : '#F97316',
                boxShadow: `0 0 8px ${p.tipe === 'gudang' ? '#3B82F6' : '#F97316'}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.nama_lokasi}
              </div>
              <div style={{ fontSize: '10px', color: '#A0A0A0' }}>
                {p.divisi === 'supply_chain' ? 'SC' : 'OPS'} • {p.tipe}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}