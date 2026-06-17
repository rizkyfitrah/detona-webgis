'use client';

import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';
import { type Proyek } from './MapSidebar';

interface CommercialData {
  proyek: Proyek;
  volume: number;
  hargaSatuan: number;
  revenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  ppn: number;
  satuan: string;
}

const pricing: Record<string, number> = {
  drill_services: 120000,
  blast_services: 150000,
  drill_blast_services: 200000,
  quarry_mining: 100000,
};

const pricingSC: Record<string, number> = {
  ANFO: 15000000,
  Emulsi: 20000000,
  Detonator: 50000000,
  Boster: 30000000,
};

export default function MapCommercialLayer({
  visible,
  onCommercialClick,
  onHoverCommercial,
  onHoverEnd,
}: {
  visible: boolean;
  onCommercialClick: (data: Proyek) => void;
  onHoverCommercial: (data: CommercialData, pos: { x: number; y: number }) => void;
  onHoverEnd: () => void;
}) {
  const [commercialList, setCommercialList] = useState<CommercialData[]>([]);

  useEffect(() => {
    if (!visible) return;

    const fetchData = async () => {
      // Ambil SEMUA proyek dari database
      const { data: allProyek, error } = await supabase
        .from('lokasi_proyek')
        .select('*');

      if (error) {
        console.error('❌ Gagal fetch:', error.message);
        return;
      }

      // Filter: hanya tampilkan proyek yang TIDAK memiliki flag internal = true
      const filtered = (allProyek || []).filter((p: any) => {
        if (p.data_summary?.internal === true) return false;
        return true;
      });

      console.log(`📦 Total proyek: ${allProyek?.length}, Komersial: ${filtered.length}`);

      const withRevenue = filtered.map((p: any) => {
        let volume = 0, hargaSatuan = 0, satuan = '';
        const s = p.data_summary || {};
        if (p.divisi === 'supply_chain') {
          volume = s.stok_ton || 0;
          hargaSatuan = pricingSC[s.jenis_bahan] || 15000000;
          satuan = 'ton';
        } else {
          switch (p.divisi) {
            case 'drill_services':
              volume = (s.total_lubang || 0) * 10;
              hargaSatuan = pricing[p.divisi] || 100000;
              satuan = 'm³';
              break;
            case 'blast_services':
            case 'drill_blast_services':
              volume = s.volume_batuan_m3 || 0;
              hargaSatuan = pricing[p.divisi] || 100000;
              satuan = 'm³';
              break;
            case 'quarry_mining':
              volume = s.volume_produksi_m3 || 0;
              hargaSatuan = pricing[p.divisi] || 100000;
              satuan = 'm³';
              break;
          }
        }
        const revenue = volume * hargaSatuan;
        return {
          proyek: {
            id: p.id,
            nama_lokasi: p.nama_lokasi,
            divisi: p.divisi as Proyek['divisi'],
            tipe: p.tipe,
            status: p.status,
            data_summary: s,
            geom: { coordinates: p.geom?.coordinates || [0, 0] },
          },
          volume,
          hargaSatuan,
          revenue,
          totalCost: 0,
          profit: 0,
          margin: 0,
          ppn: revenue * 0.11,
          satuan,
        };
      });

      // Ambil total cost dari cost_project
      const ids = withRevenue.map(item => item.proyek.id);
      if (ids.length > 0) {
        const { data: costRows } = await supabase
          .from('cost_project')
          .select('proyek_id, jumlah')
          .in('proyek_id', ids);

        if (costRows) {
          const costMap: Record<string, number> = {};
          costRows.forEach(row => {
            costMap[row.proyek_id] = (costMap[row.proyek_id] || 0) + Number(row.jumlah);
          });
          withRevenue.forEach(item => {
            item.totalCost = costMap[item.proyek.id] || 0;
            item.profit = item.revenue - item.totalCost;
            item.margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
          });
        }
      }

      setCommercialList(withRevenue);
    };

    fetchData();
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {commercialList.map(item => {
        const { proyek } = item;
        const color = item.profit >= 0 ? '#10B981' : '#EF4444';
        return (
          <Marker
            key={proyek.id}
            position={[proyek.geom.coordinates[1], proyek.geom.coordinates[0]]}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:20px;height:20px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;box-shadow:0 0 10px ${color};">${item.profit >= 0 ? '▲' : '▼'}</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
            eventHandlers={{
              mouseover: (e) => {
                const pos = (e.originalEvent as MouseEvent);
                onHoverCommercial(item, { x: pos.clientX, y: pos.clientY });
              },
              mouseout: () => onHoverEnd(),
              click: () => onCommercialClick(proyek),
            }}
          >
            <Popup>
              <div style={{ color: '#333', fontFamily: 'Inter', minWidth: '180px' }}>
                <strong>{proyek.nama_lokasi}</strong><br />
                <span style={{ fontSize: '12px', color: '#666' }}>{proyek.divisi.replace(/_/g, ' ')}</span><br />
                <span style={{ fontSize: '11px', color: '#888' }}>Klik untuk detail komersial</span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}