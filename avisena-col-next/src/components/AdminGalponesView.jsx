'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import FormLoteNuevo from '@/components/FormLoteNuevo';

export default function AdminGalponesView() {
  const [showModal, setShowModal] = useState(false);
  const [editRegistro, setEditRegistro] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const [detalleRegistro, setDetalleRegistro] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const storedData = localStorage.getItem('historialgalpones');
    const fallbackData = localStorage.getItem('historialLotes');
    const data = storedData
      ? JSON.parse(storedData)
      : fallbackData
        ? JSON.parse(fallbackData)
        : [];

    if (!storedData && fallbackData) {
      localStorage.setItem('historialgalpones', JSON.stringify(data));
      localStorage.removeItem('historialLotes');
    }

    setRegistros(data);
  }, []);

  const showNotification = (title, message) => {
    setToast({ show: true, title, message });
    setTimeout(() => setToast({ show: false, title: '', message: '' }), 4000);
  };

  const guardarRegistro = (formDataSubmit) => {
    if (editRegistro) {
      const registroActualizado = {
        ...editRegistro,
        fecha: formDataSubmit.fecha,
        hora: formDataSubmit.hora,
        lote: formDataSubmit.galpon || '',
        pesoPromedio: formDataSubmit.pesopromedio || '',
        numeroAves: formDataSubmit.numerodeaves || '',
        linea: formDataSubmit.linea,
        responsable: formDataSubmit.responsable,
        galpon: formDataSubmit.galpon || '',
        semanadevida: formDataSubmit.semanadevida || '',
        certificados: formDataSubmit.certificados || editRegistro.certificados || '',
        observaciones: formDataSubmit.observaciones || ''
      };

      const nuevosRegistros = registros.map((registro) =>
        registro.id === editRegistro.id ? registroActualizado : registro
      );
      localStorage.setItem('historialgalpones', JSON.stringify(nuevosRegistros));
      setRegistros(nuevosRegistros);
      showNotification('Registro actualizado', 'El lote se ha editado correctamente.');
      setEditRegistro(null);
      setShowModal(false);
      return;
    }

    const nuevoRegistro = {
      id: Date.now(),
      fecha: formDataSubmit.fecha,
      hora: formDataSubmit.hora,
      lote: formDataSubmit.galpon || '',
      pesoPromedio: formDataSubmit.pesopromedio || '',
      numeroAves: formDataSubmit.numerodeaves || '',
      linea: formDataSubmit.linea,
      responsable: formDataSubmit.responsable,
      galpon: formDataSubmit.galpon || '',
      semanadevida: formDataSubmit.semanadevida || '',
      certificados: formDataSubmit.certificados || '',
      observaciones: formDataSubmit.observaciones || ''
    };

    const nuevosRegistros = [nuevoRegistro, ...registros];
    localStorage.setItem('historialgalpones', JSON.stringify(nuevosRegistros));
    setRegistros(nuevosRegistros);
    showNotification('¡Registro guardado!', 'El lote se ha agregado correctamente.');
    setShowModal(false);
  };

  const eliminarRegistro = (registroId) => {
    const nuevosRegistros = registros.filter((registro) => registro.id !== registroId);
    localStorage.setItem('historialgalpones', JSON.stringify(nuevosRegistros));
    setRegistros(nuevosRegistros);
    showNotification('Registro eliminado', 'El registro del lote fue borrado correctamente.');
  };

  const editarRegistro = (registroId) => {
    const registro = registros.find((item) => item.id === registroId);
    if (!registro) return;
    setEditRegistro(registro);
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const partes = dateStr.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dateStr;
  };

  const getCertificadoName = (certificado) => {
    if (!certificado) return '';
    return typeof certificado === 'string' ? certificado : certificado.name || '';
  };

  const getCertificadoDataUrl = (certificado) => {
    if (!certificado || typeof certificado === 'string') return '';
    return certificado.data || '';
  };

  const downloadCertificado = (certificado) => {
    const dataUrl = getCertificadoDataUrl(certificado);
    if (!dataUrl) {
      showNotification('Sin archivo', 'No hay certificado disponible para descargar.');
      return;
    }

    const fileName = getCertificadoName(certificado) || `certificado_${Date.now()}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadReport = (registro, format) => {
    if (!registro) return;

    const reportData = {
      fecha: formatDate(registro.fecha),
      hora: registro.hora,
      galpon: registro.galpon,
      pesoPromedio: registro.pesoPromedio,
      semanaDeVida: registro.semanadevida,
      numeroAves: registro.numeroAves,
      linea: registro.linea,
      responsable: registro.responsable,
      certificados: getCertificadoName(registro.certificados),
      observaciones: registro.observaciones,
    };

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Informe de Galpón', 14, 20);

      const fields = [
        ['Fecha de ingreso', reportData.fecha],
        ['Hora de ingreso', reportData.hora],
        ['Galpón', reportData.galpon],
        ['Peso promedio', reportData.pesoPromedio],
        ['Semana de vida', reportData.semanaDeVida],
        ['Número de aves', reportData.numeroAves],
        ['Línea de aves', reportData.linea],
        ['Responsable', reportData.responsable],
        ['Certificados', reportData.certificados],
        ['Observaciones', reportData.observaciones],
      ];

      let y = 32;
      doc.setFontSize(11);
      fields.forEach(([label, value]) => {
        const text = `${label}: ${value || 'N/A'}`;
        doc.text(text, 14, y);
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save(`informe_${registro.galpon || 'galpon'}_${registro.id}.pdf`);
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe_${registro.galpon || 'galpon'}_${registro.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (format === 'csv') {
      const headers = ['Fecha de ingreso', 'Hora de ingreso', 'Galpón', 'Peso promedio', 'Semana de vida', 'Número de aves', 'Línea de aves', 'Responsable', 'Certificados', 'Observaciones'];
      const values = [
        reportData.fecha,
        reportData.hora,
        reportData.galpon,
        reportData.pesoPromedio,
        reportData.semanaDeVida,
        reportData.numeroAves,
        reportData.linea,
        reportData.responsable,
        reportData.certificados,
        reportData.observaciones,
      ];
      const csv = `${headers.join(',')}\n${values.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `informe_${registro.galpon || 'galpon'}_${registro.id}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printDetalleRegistro = (registro) => {
    if (!registro) return;

    const content = `
      <html>
        <head>
          <title>Informe de Galpón</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 16px; }
            p { margin: 8px 0; }
            .field { margin-bottom: 12px; }
            .field strong { display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Informe de Galpón</h1>
          <div class="field"><strong>Fecha de ingreso</strong><p>${formatDate(registro.fecha)}</p></div>
          <div class="field"><strong>Hora de ingreso</strong><p>${registro.hora}</p></div>
          <div class="field"><strong>Galpón</strong><p>${registro.galpon}</p></div>
          <div class="field"><strong>Peso promedio</strong><p>${registro.pesoPromedio}</p></div>
          <div class="field"><strong>Semana de vida</strong><p>${registro.semanadevida}</p></div>
          <div class="field"><strong>Número de aves</strong><p>${registro.numeroAves}</p></div>
          <div class="field"><strong>Línea de aves</strong><p>${registro.linea}</p></div>
          <div class="field"><strong>Responsable</strong><p>${registro.responsable}</p></div>
          <div class="field"><strong>Certificados</strong><p>${getCertificadoName(registro.certificados)}</p></div>
          <div class="field"><strong>Observaciones</strong><p>${registro.observaciones || 'No hay observaciones registradas.'}</p></div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportarCSV = () => {
    if (registros.length === 0) {
      showNotification('Sin datos', 'No hay registros para exportar.');
      return;
    }

    const headers = ['Fecha de ingreso', 'Hora de ingreso', 'Lote', 'Peso promedio', 'Numero de aves', 'Semana de vida', 'Linea de aves', 'Responsable', 'Certificados', 'Observaciones'];
    const rows = registros.map((registro) => [
      formatDate(registro.fecha),
      registro.hora,
      registro.galpon,
      registro.pesoPromedio || '',
      registro.numeroAves,
      registro.semanadevida,
      registro.linea,
      registro.responsable || '',
      getCertificadoName(registro.certificados),
      registro.observaciones || ''
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
    (registro.galpon || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (registro.linea || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (registro.responsable || '').toLowerCase().includes(buscar.toLowerCase()) ||
    (registro.observaciones || '').toLowerCase().includes(buscar.toLowerCase())
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
            <h2 className="text-3xl font-bold mb-2">Registro de Galpones</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Control y seguimiento de tus lotes de aves.</p>
          </section>
          <section className="flex justify-end items-center">
            <button
              onClick={() => {
                setEditRegistro(null);
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 min-w-[220px] bg-primary hover:bg-[#3dbd14] text-black text-sm font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all border-none cursor-pointer"
            >
              <span className="material-icons">add_circle</span>
              <span>Agregar nuevo galpon</span>
            </button>
          </section>
        </section>

        {/* Formulario Modal */}
        {showModal && (
          <FormLoteNuevo
            onSubmit={guardarRegistro}
            onClose={() => {
              setShowModal(false);
              setEditRegistro(null);
            }}
            initialData={editRegistro}
          />
        )}

        <section className="w-full space-y-8">
          <section className="bg-white dark:bg-background-dark/40 border border-slate-200 dark:border-primary/10 rounded-xl shadow-xl overflow-hidden">
            <section className="p-6 border-b border-slate-200 dark:border-primary/10 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <section className="flex items-center gap-2 text-slate-800 dark:text-white">
                <span className="material-symbols-outlined text-primary"></span>
                <h3 className="text-lg font-semibold">Historial de Galpones</h3>
              </section>
              <section className="flex justify-center">
                <section className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Filtrar por Galpon..."
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
                    <th className="px-6 py-2">Galpon</th>
                    <th className="px-6 py-2">Peso promedio</th>
                    <th className="px-6 py-2">Semana de vida</th>
                    <th className="px-6 py-4">Numero de aves</th>
                    <th className="px-6 py-4">Linea de aves</th>
                    <th className="px-6 py-4">Responsable</th>
                    <th className="px-6 py-4">Certificados</th>
                    <th className="px-6 py-4">Informe</th>
                    <th className="px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-primary/10 text-sm">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-slate-500">
                        No se encontraron registros de Galpones.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((registro, index) => (
                      <tr key={index} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{formatDate(registro.fecha)}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.hora}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.galpon}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.pesoPromedio}</td>
                        <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">{registro.semanadevida}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{registro.numeroAves}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{registro.linea}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{registro.responsable}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{getCertificadoName(registro.certificados)}</td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                          <button
                            onClick={() => {
                              setDetalleRegistro(registro);
                              setShowDetalleModal(true);
                            }}
                            className="text-primary hover:underline"
                            type="button"
                          >
                            Ver informe
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => editarRegistro(registro.id)}
                              className="p-2 rounded-lg bg-yellow-100 text-yellow-500 hover:bg-yellow-200 transition-colors"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => eliminarRegistro(registro.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {showDetalleModal && detalleRegistro && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 overflow-y-auto">
                  <div className="w-full max-w-md max-h-[calc(100vh-4rem)] rounded-3xl bg-white dark:bg-zinc-900 p-3 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Detalle de Informe</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Observaciones completas del registro seleccionado.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDetalleModal(false)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                      <div className="grid gap-3 sm:grid-cols-2 mb-4 text-sm text-slate-700 dark:text-slate-200">
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Fecha</span>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{formatDate(detalleRegistro.fecha)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Hora</span>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{detalleRegistro.hora}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Galpón</span>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{detalleRegistro.galpon}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Peso promedio</span>
                          <p className="mt-2">{detalleRegistro.pesoPromedio}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Semana de vida</span>
                          <p className="mt-2">{detalleRegistro.semanadevida}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Número de aves</span>
                          <p className="mt-2">{detalleRegistro.numeroAves}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Línea de aves</span>
                          <p className="mt-2">{detalleRegistro.linea}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-950 p-3 border border-slate-200 dark:border-zinc-800">
                          <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">Responsable</span>
                          <p className="mt-2">{detalleRegistro.responsable}</p>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-200 dark:border-zinc-800 mb-4">
                        <h4 className="text-sm font-bold uppercase text-slate-500 mb-2">Observaciones</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{detalleRegistro.observaciones || 'No hay observaciones registradas.'}</p>
                      </div>

                      <div className="rounded-3xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-200 dark:border-zinc-800 mb-4">
                        <h4 className="text-sm font-bold uppercase text-slate-500 mb-2">Certificados</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{getCertificadoName(detalleRegistro.certificados) || 'N/A'}</p>
                        {getCertificadoDataUrl(detalleRegistro.certificados) && (
                          <div className="grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => downloadCertificado(detalleRegistro.certificados)}
                              className="w-full bg-primary hover:bg-[#3dbd14] text-black px-3 py-2 rounded-2xl font-semibold transition-all text-sm"
                            >
                              Descargar
                            </button>
                            <button
                              type="button"
                              onClick={() => window.open(getCertificadoDataUrl(detalleRegistro.certificados), '_blank')}
                              className="w-full bg-slate-200 dark:bg-zinc-900 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-2xl font-semibold transition-all text-sm"
                            >
                              Abrir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => printDetalleRegistro(detalleRegistro)}
                        className="w-full bg-slate-300 dark:bg-zinc-800 text-slate-900 dark:text-white px-2 py-2 rounded-xl font-semibold text-xs transition-all"
                      >
                        Imprimir
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadReport(detalleRegistro, 'pdf')}
                        className="w-full bg-[#1c64f2] hover:bg-[#1653c3] text-white px-2 py-2 rounded-xl font-semibold text-xs transition-all"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

