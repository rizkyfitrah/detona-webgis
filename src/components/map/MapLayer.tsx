'use client';

export default function MapLayer({
  visibleDivisi,
  toggleDivisi,
}: {
  visibleDivisi: { supply_chain: boolean; operasional: boolean };
  toggleDivisi: (d: 'supply_chain' | 'operasional') => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '90px',
        right: '16px',
        zIndex: 1000,
        background: 'rgba(20, 20, 20, 0.4)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        border: '1px solid rgba(204, 51, 51, 0.3)',
        borderRadius: '16px',
        padding: '14px 18px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', color: '#D0D0D0', fontSize: '11px', textTransform: 'uppercase' }}>
        Layer
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => toggleDivisi('supply_chain')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: visibleDivisi.supply_chain ? '#fff' : '#666',
            transition: 'color 0.2s',
          }}
        >
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#3B82F6',
            boxShadow: visibleDivisi.supply_chain ? '0 0 8px #3B82F6' : 'none',
            opacity: visibleDivisi.supply_chain ? 1 : 0.4,
            display: 'inline-block',
          }} />
          <span>Gudang (SC)</span>
        </button>
        <button
          onClick={() => toggleDivisi('operasional')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: visibleDivisi.operasional ? '#fff' : '#666',
            transition: 'color 0.2s',
          }}
        >
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#F97316',
            boxShadow: visibleDivisi.operasional ? '0 0 8px #F97316' : 'none',
            opacity: visibleDivisi.operasional ? 1 : 0.4,
            display: 'inline-block',
          }} />
          <span>Tambang (OPS)</span>
        </button>
      </div>
    </div>
  );
}