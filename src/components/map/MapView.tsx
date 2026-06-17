'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import MapTooltip from './MapTooltip';
import MapCommercialTooltip from './MapCommercialTooltip';
import MapPanel from './MapPanel';
import MapSidebar, { type Proyek } from './MapSidebar';
import MapTopBar from './MapTopBar';
import MapBottomDashboard from './MapBottomDashboard';
import UserMenu from './UserMenu';
import MapCommercialLayer from './MapCommercialLayer';

// Perbaiki ikon default Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Ambil instance map
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
}

// Warna per divisi
const divisiColors: Record<string, string> = {
  supply_chain: '#3B82F6',
  drill_services: '#06B6D4',
  blast_services: '#F97316',
  drill_blast_services: '#8B5CF6',
  quarry_mining: '#10B981',
};

// Marker proyek operasional
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
  visibleDivisi: {
    supply_chain: boolean;
    drill_services: boolean;
    blast_services: boolean;
    drill_blast_services: boolean;
    quarry_mining: boolean;
  };
  onHover: (data: any, position: { x: number; y: number }) => void;
  onHoverEnd: () => void;
  onClickProyek: (p: Proyek) => void;
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
        const color = divisiColors[p.divisi] || '#ccc';
        const pulse = !isHovered && !isSelected ? 'animation: marker-pulse 2s ease-in-out infinite;' : '';

        return (
          <Marker
            key={p.id}
            position={[p.geom.coordinates[1], p.geom.coordinates[0]]}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 ${isSelected ? 20 : isHovered ? 15 : 8}px ${color};transition:all 0.25s;${pulse}"></div>`,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            })}
            eventHandlers={{
              mouseover: (e) => {
                const pos = (e.originalEvent as MouseEvent);
                onHover(
                  {
                    id: p.id,
                    nama: p.nama_lokasi,
                    divisi: p.divisi,
                    tipe: p.tipe,
                    status: p.status,
                    data_summary: p.data_summary,
                  },
                  { x: pos.clientX, y: pos.clientY }
                );
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

// Partikel latar
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
            animation: 'float 8s ease-in-out infinite',
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
  const [visibleDivisi, setVisibleDivisi] = useState({
    supply_chain: true,
    drill_services: true,
    blast_services: true,
    drill_blast_services: true,
    quarry_mining: true,
  });
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [commercialTooltip, setCommercialTooltip] = useState<any>(null);
  const [commercialTooltipPos, setCommercialTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedProyek, setSelectedProyek] = useState<Proyek | null>(null);
  const [panelMode, setPanelMode] = useState<'default' | 'commercial'>('default');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showCommercial, setShowCommercial] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const fetchProyek = useCallback(async () => {
    const { data, error } = await supabase.from('lokasi_proyek').select('*');
    if (error) {
      console.error(error);
      return;
    }
    setProyekData(
      (data || []).map((item: any) => ({
        id: item.id,
        nama_lokasi: item.nama_lokasi,
        divisi: item.divisi as Proyek['divisi'],
        tipe: item.tipe,
        status: item.status,
        data_summary: item.data_summary,
        geom: { coordinates: item.geom?.coordinates || [0, 0] },
      }))
    );
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
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (sidebarRef.current && !sidebarRef.current.contains(target)) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [sidebarOpen]);

  const handleHover = (data: any, pos: { x: number; y: number }) => {
    setTooltipData(data);
    setTooltipPos(pos);
    setHoveredId(data.id);
  };
  const handleHoverEnd = () => {
    setTooltipData(null);
    setHoveredId(null);
  };

  const handleCommercialHover = (data: any, pos: { x: number; y: number }) => {
    setCommercialTooltip(data);
    setCommercialTooltipPos(pos);
  };
  const handleCommercialHoverEnd = () => {
    setCommercialTooltip(null);
  };

  const handleMarkerClick = (p: Proyek) => {
    setSelectedProyek(p);
    setPanelMode('default');
  };

  const handleCommercialClick = (p: Proyek) => {
    setSelectedProyek(p);
    setPanelMode('commercial');
  };

  const toggleDivisi = (d: string) =>
    setVisibleDivisi((prev) => ({ ...prev, [d]: !(prev as any)[d] }));

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

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
          attribution='&copy; OSM &copy; CARTO'
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
        <MapCommercialLayer
          visible={showCommercial}
          onCommercialClick={handleCommercialClick}
          onHoverCommercial={handleCommercialHover}
          onHoverEnd={handleCommercialHoverEnd}
        />
      </MapContainer>

      {mounted && <FloatingParticles />}

      <MapTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => setSidebarOpen(true)}
        visibleDivisi={visibleDivisi}
        toggleDivisi={toggleDivisi}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        showCommercial={showCommercial}
        onToggleCommercial={() => setShowCommercial(!showCommercial)}
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

      {tooltipData && <MapTooltip data={tooltipData} x={tooltipPos.x} y={tooltipPos.y} />}
      {commercialTooltip && (
        <MapCommercialTooltip
          data={commercialTooltip}
          x={commercialTooltipPos.x}
          y={commercialTooltipPos.y}
        />
      )}
      <MapPanel proyek={selectedProyek} onClose={() => setSelectedProyek(null)} mode={panelMode} />
    </div>
  );
}