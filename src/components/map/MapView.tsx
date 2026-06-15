'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import MapTooltip from './MapTooltip';
import MapPanel from './MapPanel';
import MapLegend from './MapLegend';
import MapSidebar from './MapSidebar';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Proyek {
  id: string;
  nama_lokasi: string;
  divisi: 'supply_chain' | 'operasional';
  tipe: 'gudang' | 'tambang';
  status: string;
  data_summary: any;
  geom: { coordinates: [number, number] };
}

// Ambil instance map
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// Render marker dengan highlight untuk yang dipilih
function ProyekMarkers({
  proyekData,
  visibleDivisi,
  onHover,
  onHoverEnd,
  onClickProyek,
  hoveredId,
  selectedId,
}: {
  proyekData: Proyek[];
  visibleDivisi: { supply_chain: boolean; operasional: boolean };
  onHover: (data: any, position: { x: number; y: number }) => void;
  onHoverEnd: () => void;
  onClickProyek: (proyek: Proyek) => void;
  hoveredId: string | null;
  selectedId: string | null;
}) {
  const filtered = proyekData.filter((p) => visibleDivisi[p.divisi]);

  return (
    <>
      {filtered.map((p) => {
        const isSelected = selectedId === p.id;
        const isHovered = hoveredId === p.id;
        const size = isSelected ? 22 : isHovered ? 18 : 14;
        const color = p.tipe === 'gudang' ? '#3B82F6' : '#F97316';

        return (
          <Marker
            key={p.id}
            position={[p.geom.coordinates[1], p.geom.coordinates[0]]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="
                width:${size}px;height:${size}px;
                background:${color};
                border:2px solid white;
                border-radius:50%;
                box-shadow:0 0 ${isSelected ? 20 : isHovered ? 15 : 8}px ${color};
                transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
              "></div>`,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            })}
            eventHandlers={{
              mouseover: (e) => {
                const pos = (e.originalEvent as MouseEvent);
                onHover({ id: p.id, nama: p.nama_lokasi, divisi: p.divisi, tipe: p.tipe, status: p.status, data_summary: p.data_summary }, { x: pos.clientX, y: pos.clientY });
              },
              mouseout: () => onHoverEnd(),
              click: () => onClickProyek(p),
            }}
          />
        );
      })}
    </>
  );
}

// Partikel latar (hanya mount di klien)
function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.4 + 0.1,
          }}
        />
      ))}
    </div>
  );
}

export default function MapView() {
  const [proyekData, setProyekData] = useState<Proyek[]>([]);
  const [visibleDivisi, setVisibleDivisi] = useState({ supply_chain: true, operasional: true });
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedProyek, setSelectedProyek] = useState<Proyek | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const fetchProyek = useCallback(async () => {
    const { data, error } = await supabase.from('lokasi_proyek').select('*');
    if (error) { console.error(error); return; }
    setProyekData((data || []).map((item: any) => ({
      id: item.id,
      nama_lokasi: item.nama_lokasi,
      divisi: item.divisi,
      tipe: item.tipe,
      status: item.status,
      data_summary: item.data_summary,
      geom: { coordinates: item.geom?.coordinates || [0, 0] },
    })));
  }, []);

  useEffect(() => { fetchProyek(); }, [fetchProyek]);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (selectedProyek && mapRef.current) {
      const [lng, lat] = selectedProyek.geom.coordinates;
      mapRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  }, [selectedProyek]);

  // Tutup sidebar saat panel terbuka
  useEffect(() => {
    if (selectedProyek) setSidebarOpen(false);
  }, [selectedProyek]);

  // Tutup sidebar saat klik di luar
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        sidebarRef.current && !sidebarRef.current.contains(target) &&
        searchBarRef.current && !searchBarRef.current.contains(target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const handleHover = (data: any, pos: { x: number; y: number }) => {
    setTooltipData(data);
    setTooltipPos(pos);
    setHoveredId(data.id);
  };
  const handleHoverEnd = () => { setTooltipData(null); setHoveredId(null); };
  const handleMarkerClick = (proyek: Proyek) => setSelectedProyek(proyek);
  const toggleDivisi = (d: 'supply_chain' | 'operasional') =>
    setVisibleDivisi((prev) => ({ ...prev, [d]: !prev[d] }));

  return (
    <div className="relative w-full h-screen" style={{ background: '#0a0a0a' }}>
      <MapContainer center={[-2.5, 114.5]} zoom={5} style={{ height: '100%', width: '100%', background: 'transparent' }} zoomControl={false}>
        <MapController mapRef={mapRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ProyekMarkers
          proyekData={proyekData}
          visibleDivisi={visibleDivisi}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          onClickProyek={handleMarkerClick}
          hoveredId={hoveredId}
          selectedId={selectedProyek?.id ?? null}
        />
      </MapContainer>

      {/* Partikel latar */}
      {mounted && <FloatingParticles />}

      {/* Search Bar */}
      <div
        ref={searchBarRef}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10, 10, 10, 0.75)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: '1px solid rgba(204, 51, 51, 0.35)',
          borderRadius: '12px',
          padding: '0 12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          width: '260px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Cari proyek..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSidebarOpen(true)}
          style={{
            flex: 1,
            padding: '10px 8px',
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSidebarOpen(true); }}
            style={{ background: 'none', border: 'none', color: '#A0A0A0', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Sidebar (hilang sempurna saat tertutup) */}
      <div ref={sidebarRef}>
        <MapSidebar
          proyekData={proyekData}
          visibleDivisi={visibleDivisi}
          searchQuery={searchQuery}
          onSelectProyek={handleMarkerClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Legenda / Filter (hilang saat panel terbuka) */}
      {!selectedProyek && (
        <MapLegend visibleDivisi={visibleDivisi} toggleDivisi={toggleDivisi} />
      )}

      {tooltipData && <MapTooltip data={tooltipData} x={tooltipPos.x} y={tooltipPos.y} />}
      <MapPanel proyek={selectedProyek} onClose={() => setSelectedProyek(null)} />
    </div>
  );
}