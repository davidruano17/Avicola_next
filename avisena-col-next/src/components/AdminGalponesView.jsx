'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import FormLoteNuevo from "@/features/galpones/formlotenuevo";

export default function AdminGalponesView() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const itemsPerPage = 5;

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('historialLotes')) || [];
    setRegistros(data);
  }, []);

  const showNotification = (title, message) => {
    setToast({ show: true, title, message });
    setTimeout(() => setToast({ show: false, title: '', message: '' }), 4000);
  };

  const guardarRegistro = (formDataSubmit) => {
    const nuevoRegistro = {
      id: Date.now(),
      fecha: formDataSubmit.fecha,
      hora: formDataSubmit.hora,
      lote: formDataSubmit.lote,
      numeroAves: formDataSubmit.numerodeaves || '',
      linea: formDataSubmit.linea,
      responsable: formDataSubmit.responsable,
      galpon: formDataSubmit.galpon || ''
    };

    const nuevosRegistros = [nuevoRegistro, ...registros];
    localStorage.setItem('historialLotes', JSON.stringify(nuevosRegistros));
    setRegistros(nuevosRegistros);
    showNotification('¡Registro guardado!', 'El lote se ha agregado correctamente.');
    setShowModal(false);
  };

  const eliminarRegistro = (registroId) => {
    const nuevosRegistros = registros.filter((registro) => registro.id !== registroId);
    localStorage.setItem('historialLotes', JSON.stringify(nuevosRegistros));
    setRegistros(nuevosRegistros);
    showNotification('Registro eliminado', 'El registro del lote fue borrado correctamente.');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const partes = dateStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dateStr;
  };

  const exportarCSV = () => {
    if (registros.length === 0) {
      showNotification('Sin datos', 'No hay registros para exportar.');
      return;
    }

    const headers = ['Fecha de ingreso', 'Hora de ingreso', 'Lote', 'Numero de aves', 'Linea de aves', 'Responsable', 'Galpón'];
    const rows = registros.map((registro) => [
      formatDate(registro.fecha),
      registro.hora,
      registro.lote,
      registro.numeroAves,
      registro.linea,
      registro.responsable,
      registro.galpon || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_lotes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Exportación exitosa', 'El historial se ha descargado en formato CSV.');
  };

  const registrosFiltrados = registros.filter((registro) =>
    (registro.lote || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (registro.linea || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (registro.responsable || '').toLowerCase().includes(buscar.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = registrosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(registrosFiltrados.length / itemsPerPage), 1);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <section className="flex h-full grow flex-col">
      <main className="flex flex-1 flex-col py-8 px-6 md:px-8 lg:px-12 w-full">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 justify-between">
          <section className="lg:col-span-2 text-left">
            <h2 className="text-3xl font-bold mb-2">Registro de lotes</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Control y seguimiento de tus lotes de aves.</p>
          </section>
          <section className="flex justify-end items-center">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 min-w-[220px] bg-primary hover:bg-[#3dbd14] text-black text-sm font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              <span className="material-icons">add_circle</span>
              <span>Agregar Nuevo Lote</span>
            </button>
          </section>
        </section>

        {/* Formulario Modal */}
        {showModal && (
          <FormLoteNuevo onSubmit={guardarRegistro} onClose={() => setShowModal(false)} />
        )}

        <section className="w-full space-y-8">
          <section className="bg-white dark:bg-background-dark/40 border border-slate-200 dark:border-primary/10 rounded-xl shadow-xl overflow-hidden">
            <section className="p-6 border-b border-slate-200 dark:border-primary/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <section className="flex items-center gap-2 text-slate-800 dark:text-white">
                <span className="material-symbols-outlined text-primary"></span>
                <h3 className="text-lg font-semibold">Historial de Lotes</h3>
              </section>
              <section className="flex justify-center">
                <section className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Filtrar por lote..."
                    value={buscar}
                    onChange={(e) => {
                      setBuscar(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on search
                    }}
                    className="bg-slate-100 dark:bg-background-dark border-none rounded-lg text-sm pl-4 py-2 focus:ring-1 focus:ring-primary w-full text-slate-800 dark:text-white"
                  />
                </section>
              </section>
              <section className="flex justify-end">
                <button
                  onClick={exportarCSV}
                  className="bg-primary hover:bg-[#3dbd14] text-black p-2 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98] border-none cursor-pointer"
                  title="Exportar a CSV"
                >
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                </button>
              </section>
            </section>

            <section className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-background-dark/60 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Fecha de ingreso</th>
                    <th className="px-6 py-4">Hora de ingreso</th>
                    <th className="px-6 py-2">Lote</th>
                    <th className="px-6 py-4">Numero de aves</th>
                    <th className="px-6 py-4">Linea de aves</th>
                    <th className="px-6 py-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-primary/10 text-sm">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        No se encontraron registros de lotes.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((registro, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatDate(registro.fecha)}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.hora}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.lote}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{registro.numeroAves}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{registro.linea}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{registro.responsable}</td>
                        <td className="px-6 py-4 text-center">
                          
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => eliminarRegistro(registro.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Eliminar"
                          >
                            <span className="material-icons w-4 h-4 inline">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <article className="px-6 py-4 bg-slate-50 dark:bg-background-dark/20 flex justify-between items-center text-xs text-slate-500">
                <span>Registro de galpones</span>
                <article className="flex gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 font-bold rounded transition-all bg-primary hover:bg-[#3dbd14] active:scale-[0.98] border-none cursor-pointer ${currentPage === 1
                      ? 'text-black cursor-not-allowed'
                      : 'bg-primary hover:bg-[#3dbd14] text-black shadow-sm shadow-primary/20'
                      }`}
                  >
                    Anterior
                  </button>
                  <button
                    className="px-3 py-1 text-black bg-primary hover:bg-[#3dbd14] font-bold rounded shadow-sm shadow-primary/20 border-none cursor-default"
                  >
                    {currentPage}
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 font-bold rounded transition-all bg-primary hover:bg-[#3dbd14] active:scale-[0.98] border-none cursor-pointer ${currentPage === totalPages
                      ? ' text-black cursor-not-allowed'
                      : 'bg-primary hover:bg-[#3dbd14] text-black shadow-sm shadow-primary/20'
                      }`}
                  >
                    Siguiente
                  </button>
                </article>
              </article>
            </section>
          </section>
        </section>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex gap-3 animate-bounce z-50">
            <span className="material-icons text-emerald-400">check_circle</span>
            <div>
              <p className="font-bold text-sm">{toast.title}</p>
              <p className="text-xs text-slate-400">{toast.message}</p>
            </div>
          </div>
        )}
      </main>
    </section>
  )
}

