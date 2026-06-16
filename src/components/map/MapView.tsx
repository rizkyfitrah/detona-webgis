'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import MapTooltip from './MapTooltip';
import MapPanel from './MapPanel';
import MapSidebar from './MapSidebar';
import MapTopBar from './MapTopBar';
import MapBottomDashboard from './MapBottomDashboard';
import UserMenu from './UserMenu';
import MapWalkthrough from './MapWalkthrough';

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

function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

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
        const pulse = (!isHovered && !isSelected) ? 'animation: marker-pulse 2s ease-in-out infinite;' : '';

        return (
          <Marker
            key={p.id}
            position={[p.geom.coordinates[1], p.geom.coordinates[0]]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 ${isSelected ? 20 : isHovered ? 15 : 8}px ${color};transition:all 0.25s;${pulse}"></div>`,
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

function FloatingParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'rgba(204, 51, 51, 0.6)',
            borderRadius: '50%',
            filter: 'blur(1px)',
            pointerEvents: 'none',
            animation: `float 8s ease-in-out infinite`,
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
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
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

  useEffect(() => {
    fetchProyek().then(() => {
      setMounted(true);
      setMapReady(true);
    });
  }, [fetchProyek]);

  useEffect(() => {
    if (selectedProyek && mapRef.current) {
      const [lng, lat] = selectedProyek.geom.coordinates;
      mapRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  }, [selectedProyek]);

  useEffect(() => {
    if (selectedProyek) setSidebarOpen(false);
  }, [selectedProyek]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
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
      <MapContainer
        key={mapReady ? 'map-ready' : 'map-loading'}
        center={[-2.5, 114.5]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        zoomControl={false}
      >
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

      {mounted && <FloatingParticles />}

      <MapTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => setSidebarOpen(true)}
        visibleDivisi={visibleDivisi}
        toggleDivisi={toggleDivisi}
      />

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

      <UserMenu />

      <MapBottomDashboard proyekData={proyekData} />
      <MapWalkthrough />
      {tooltipData && <MapTooltip data={tooltipData} x={tooltipPos.x} y={tooltipPos.y} />}
      <MapPanel proyek={selectedProyek} onClose={() => setSelectedProyek(null)} />
    </div>
  );
}