export default function ProyekPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ color: '#fff', padding: '40px', background: '#0a0a0a', minHeight: '100vh' }}>
      <h1>Proyek: {params.id}</h1>
      <p>Halaman detail proyek akan datang.</p>
    </div>
  );
}