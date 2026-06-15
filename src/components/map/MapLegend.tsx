'use client';

export default function MapLegend({
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
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        background: 'rgba(10, 10, 10, 0.65)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(204, 51, 51, 0.3)',
        borderRadius: '10px',
        padding: '16px 20px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(204,51,51,0.1)',
      }}
    >
      <div style={{ fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', color: '#D0D0D0' }}>
        Filter
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => toggleDivisi('supply_chain')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: visibleDivisi.supply_chain ? '#fff' : '#666',
            transition: 'color 0.2s',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#3B82F6',
              boxShadow: visibleDivisi.supply_chain ? '0 0 8px #3B82F6' : 'none',
              opacity: visibleDivisi.supply_chain ? 1 : 0.4,
              display: 'inline-block',
            }}
          />
          <span>Gudang (SC)</span>
        </button>
        <button
          onClick={() => toggleDivisi('operasional')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: visibleDivisi.operasional ? '#fff' : '#666',
            transition: 'color 0.2s',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#F97316',
              boxShadow: visibleDivisi.operasional ? '0 0 8px #F97316' : 'none',
              opacity: visibleDivisi.operasional ? 1 : 0.4,
              display: 'inline-block',
            }}
          />
          <span>Tambang (OPS)</span>
        </button>
      </div>
    </div>
  );
}