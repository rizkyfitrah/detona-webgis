'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { supabase } from '@/lib/supabase';

// Tipe data titik proyek
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

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [proyekData, setProyekData] = useState<Proyek[]>([]);
  const [visibleDivisi, setVisibleDivisi] = useState({
    supply_chain: true,
    operasional: true,
  });

  // Ambil data dari Supabase
  const fetchProyek = useCallback(async () => {
    const { data, error } = await supabase
      .from('lokasi_proyek')
      .select('*');
    if (error) {
      console.error('Gagal mengambil data:', error);
      return;
    }
    // Konversi geometry ke format yang mudah
    const formatted: Proyek[] = data.map((item: any) => ({
      id: item.id,
      nama_lokasi: item.nama_lokasi,
      divisi: item.divisi,
      tipe: item.tipe,
      status: item.status,
      data_summary: item.data_summary,
      geom: {
        coordinates: item.geom.coordinates, // asumsi GeoJSON Point
      },
    }));
    setProyekData(formatted);
  }, []);

  // Inisialisasi peta
  useEffect(() => {
    if (map.current) return; // cegah inisialisasi ganda

    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key) {
      console.error('MapTiler key tidak ditemukan');
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: `https://api.maptiler.com/maps/dark-v2/style.json?key=${key}`,
      center: [114.5, -2.5], // tengah Indonesia
      zoom: 4.5,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');

    // Setelah peta siap, ambil data
    map.current.on('load', () => {
      fetchProyek();
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [fetchProyek]);

  // Update layer titik ketika data atau filter berubah
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Filter data berdasarkan divisi
    const filtered = proyekData.filter((p) => visibleDivisi[p.divisi]);

    // Format ke GeoJSON FeatureCollection
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filtered.map((p) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: p.geom.coordinates,
        },
        properties: {
          id: p.id,
          nama: p.nama_lokasi,
          divisi: p.divisi,
          tipe: p.tipe,
          status: p.status,
          data_summary: p.data_summary,
        },
      })),
    };

    // Hapus source & layer lama jika ada
    if (map.current.getSource('proyek')) {
      (map.current.getSource('proyek') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.current.addSource('proyek', {
        type: 'geojson',
        data: geojson,
      });

      // Layer lingkaran sebagai titik
      map.current.addLayer({
        id: 'titik-proyek',
        type: 'circle',
        source: 'proyek',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'tipe'],
            'gudang', '#3B82F6', // biru
            'tambang', '#F97316', // oranye
            '#ccc',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Event klik pada titik
      map.current.on('click', 'titik-proyek', (e) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          console.log('Klik titik:', props);
          // TODO: tampilkan panel detail (Sprint 3)
          alert(`Klik: ${props.nama}\n${JSON.stringify(props.data_summary, null, 2)}`);
        }
      });

      // Ubah kursor saat hover
      map.current.on('mouseenter', 'titik-proyek', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'titik-proyek', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    }
  }, [proyekData, visibleDivisi]);

  // Toggle filter divisi
  const toggleDivisi = (divisi: 'supply_chain' | 'operasional') => {
    setVisibleDivisi((prev) => ({ ...prev, [divisi]: !prev[divisi] }));
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Filter toggle */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => toggleDivisi('supply_chain')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            visibleDivisi.supply_chain
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          🔵 Supply Chain
        </button>
        <button
          onClick={() => toggleDivisi('operasional')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            visibleDivisi.operasional
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-gray-800 text-gray-300'
          }`}
        >
          🟠 Operasional
        </button>
      </div>
    </div>
  );
}