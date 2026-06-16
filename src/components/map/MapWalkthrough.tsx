'use client';

import { useState, useEffect } from 'react';

interface Step {
  title: string;
  desc: string;
  targetSelector: string;
}

const steps: Step[] = [
  {
    title: 'Selamat Datang di DETONA',
    desc: 'Platform monitoring proyek bahan peledak dan drilling & blasting terintegrasi.',
    targetSelector: '',
  },
  {
    title: 'Cari Proyek',
    desc: 'Gunakan search bar ini untuk mencari proyek berdasarkan nama.',
    targetSelector: '.search-wrapper',
  },
  {
    title: 'Filter Layer',
    desc: 'Klik "Layer" untuk menampilkan atau menyembunyikan Gudang dan Tambang.',
    targetSelector: '[data-tut="layer-btn"]',
  },
  {
    title: 'Dashboard Bawah',
    desc: 'Di bagian bawah terdapat ringkasan seluruh proyek dan KPI penting.',
    targetSelector: '[data-tut="bottom-dashboard"]',
  },
  {
    title: 'Profil & Keluar',
    desc: 'Klik ikon profil di pojok kiri atas untuk melihat akun atau keluar.',
    targetSelector: '[data-tut="user-menu"]',
  },
  {
    title: 'Siap Menggunakan!',
    desc: 'Anda kini siap memonitor semua proyek. Klik "Selesai" untuk menutup panduan.',
    targetSelector: '',
  },
];

export default function MapWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-walkthrough', handleOpen);
    return () => window.removeEventListener('open-walkthrough', handleOpen);
  }, []);

  // Bersihkan highlight & overlay saat walkthrough ditutup
  useEffect(() => {
    if (!isOpen) {
      setTargetRect(null);
      setPos(null);
    }
  }, [isOpen]);

  // Hitung posisi card & target rect setiap langkah
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (!step.targetSelector) {
      setTargetRect(null);
      setPos(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      // Posisi card: default di bawah target, jika terlalu ke bawah tampilkan di atas
      let top = rect.bottom + 12;
      if (top + 200 > window.innerHeight) {
        top = rect.top - 200 - 12;
      }
      let left = rect.left + rect.width / 2 - 140;
      if (left < 10) left = 10;
      if (left + 280 > window.innerWidth) left = window.innerWidth - 290;

      setPos({ top, left });
    } else {
      setTargetRect(null);
      setPos(null);
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Overlay gelap dengan "lubang" di sekitar target
  const overlayStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 4999,
        background: `rgba(0, 0, 0, 0.6)`,
        clipPath: `polygon(
          0% 0%, 0% 100%, ${targetRect.left - 6}px 100%, ${targetRect.left - 6}px ${targetRect.top - 6}px,
          ${targetRect.right + 6}px ${targetRect.top - 6}px, ${targetRect.right + 6}px ${targetRect.bottom + 6}px,
          ${targetRect.left - 6}px ${targetRect.bottom + 6}px, ${targetRect.left - 6}px 100%, 100% 100%, 100% 0%
        )`,
        pointerEvents: 'none',
      }
    : {
        position: 'fixed',
        inset: 0,
        zIndex: 4999,
        background: 'rgba(0, 0, 0, 0.6)',
        pointerEvents: 'none',
      };

  return (
    <>
      {/* Overlay gelap dengan lubang */}
      <div style={overlayStyle} />

      {/* Highlight border pada target (selain overlay) */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            border: '3px solid #CC3333',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(204,51,51,0.8)',
            zIndex: 5000,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Card walkthrough */}
      <div
        style={{
          position: 'fixed',
          top: pos ? pos.top : '50%',
          left: pos ? pos.left : '50%',
          transform: pos ? 'none' : 'translate(-50%, -50%)',
          zIndex: 5002,
          width: '280px',
          background: 'rgba(15, 15, 15, 0.9)',
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          border: '1px solid rgba(204, 51, 51, 0.5)',
          borderRadius: '16px',
          padding: '18px',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(204,51,51,0.4)',
          transition: 'top 0.3s ease, left 0.3s ease',
        }}
      >
        {/* Indikator langkah */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                height: '3px',
                flex: 1,
                borderRadius: '2px',
                background: i <= currentStep ? '#CC3333' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#F5F5F5' }}>
          {step.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#B0B0B0', lineHeight: '1.5', marginBottom: '16px' }}>
          {step.desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: currentStep === 0 ? '#666' : '#D0D0D0',
              padding: '6px 14px',
              fontSize: '12px',
              cursor: currentStep === 0 ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sebelumnya
          </button>
          <span style={{ fontSize: '11px', color: '#808080' }}>
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, #8B0000, #CC3333)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              padding: '6px 18px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </>
  );
}