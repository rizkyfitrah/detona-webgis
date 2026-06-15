'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';

// Perbaiki ikon default Leaflet (kadang tidak muncul di Next.js)
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
  geom: {
    coordinates: [number, number]; // [lng, lat]
  };
}

// Komponen untuk filter dan reload data saat filter berubah
function MapFilters({ visibleDivisi, toggleDivisi }: {
  visibleDivisi: { supply_chain: boolean; operasional: boolean };
  toggleDivisi: (d: 'supply_chain' | 'operasional') => void;
}) {
  return (
    <div className="absolute top-4 left-4 z-[1000] flex gap-2">
      <button
        onClick={() => toggleDivisi('supply_chain')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition shadow-lg ${
          visibleDivisi.supply_chain
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        🔵 Supply Chain
      </button>
      <button
        onClick={() => toggleDivisi('operasional')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition shadow-lg ${
          visibleDivisi.operasional
            ? 'bg-orange-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        🟠 Operasional
      </button>
    </div>
  );
}

// Komponen untuk menampilkan marker
function ProyekMarkers({ proyekData, visibleDivisi }: {
  proyekData: Proyek[];
  visibleDivisi: { supply_chain: boolean; operasional: boolean };
}) {
  const filtered = proyekData.filter((p) => visibleDivisi[p.divisi]);

  return (
    <>
      {filtered.map((p) => (
        <Marker
          key={p.id}
          position={[p.geom.coordinates[1], p.geom.coordinates[0]]} // Leaflet: [lat, lng]
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 14px; height: 14px;
              background: ${p.tipe === 'gudang' ? '#3B82F6' : '#F97316'};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 0 10px ${p.tipe === 'gudang' ? '#3B82F6' : '#F97316'};
            "></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          })}
        >
          <Popup>
            <div className="text-sm text-gray-900">
              <h3 className="font-bold text-base mb-1">{p.nama_lokasi}</h3>
              <p className="text-xs mb-2 text-gray-600">{p.divisi === 'supply_chain' ? 'Supply Chain' : 'Operasional'} • {p.tipe}</p>
              <pre className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                {JSON.stringify(p.data_summary, null, 2)}
              </pre>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function MapView() {
  const [proyekData, setProyekData] = useState<Proyek[]>([]);
  const [visibleDivisi, setVisibleDivisi] = useState({
    supply_chain: true,
    operasional: true,
  });

  const fetchProyek = useCallback(async () => {
    const { data, error } = await supabase
      .from('lokasi_proyek')
      .select('*');
    
    if (error) {
      console.error('Gagal mengambil data:', error);
      return;
    }
    
    const formatted: Proyek[] = (data || []).map((item: any) => ({
      id: item.id,
      nama_lokasi: item.nama_lokasi,
      divisi: item.divisi,
      tipe: item.tipe,
      status: item.status,
      data_summary: item.data_summary,
      geom: {
        coordinates: item.geom?.coordinates || [0, 0],
      },
    }));
    
    setProyekData(formatted);
  }, []);

  useEffect(() => {
    fetchProyek();
  }, [fetchProyek]);

  const toggleDivisi = (divisi: 'supply_chain' | 'operasional') => {
    setVisibleDivisi((prev) => ({ ...prev, [divisi]: !prev[divisi] }));
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[-2.5, 114.5]}
        zoom={5}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        {/* Tile layer dark theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <ProyekMarkers proyekData={proyekData} visibleDivisi={visibleDivisi} />
        <MapFilters visibleDivisi={visibleDivisi} toggleDivisi={toggleDivisi} />
      </MapContainer>
    </div>
  );
}