'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import FormLoteNuevo from '@/components/formlotenuevo';

export default function AdminGalponesView() {
  const [showModal, setShowModal] = useState(false);
  const [editRegistro, setEditRegistro] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, title: '', message: '' });
  const [detalleRegistro, setDetalleRegistro] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [registroPendienteEliminar, setRegistroPendienteEliminar] = useState(null);
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
    setRegistroPendienteEliminar(registroId);
  };

  const confirmarEliminacion = () => {
    if (registroPendienteEliminar === null) return;

    const nuevosRegistros = registros.filter((registro) => registro.id !== registroPendienteEliminar);
    localStorage.setItem('historialgalpones', JSON.stringify(nuevosRegistros));
    setRegistros(nuevosRegistros);
    setRegistroPendienteEliminar(null);
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

  const downloadReport = async (registro, format) => {
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
      const certificado = registro.certificados;
      const certificadoData = getCertificadoDataUrl(certificado);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const green = [57, 169, 0];

      doc.setFillColor(...green);
      doc.rect(0, 0, pageWidth, 7, 'F');
      doc.setTextColor(25, 25, 25);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text('SERVICIO NACIONAL DE APRENDIZAJE - SENA', pageWidth / 2, 20, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.text('Informe de seguimiento avícola', pageWidth / 2, 27, { align: 'center' });

      let logoUrl;
      try {
        const logoResponse = await fetch('/assets/images/logo-sena-verde-complementario-svg-2022.svg');
        if (!logoResponse.ok) {
          throw new Error('No se pudo cargar el logotipo del SENA para el PDF.');
        }
        logoUrl = URL.createObjectURL(await logoResponse.blob());
        const logoImage = new Image();
        await new Promise((resolve, reject) => {
          logoImage.onload = resolve;
          logoImage.onerror = () => reject(new Error('No se pudo preparar el logotipo del SENA.'));
          logoImage.src = logoUrl;
        });
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = logoImage.naturalWidth;
        logoCanvas.height = logoImage.naturalHeight;
        logoCanvas.getContext('2d').drawImage(logoImage, 0, 0);
        doc.addImage(logoCanvas.toDataURL('image/png'), 'PNG', pageWidth - margin - 22, 10, 22, 22);
      } catch (error) {
        console.error('No se pudo preparar el logotipo del SENA para el PDF.', error);
        showNotification('No se pudo generar el PDF', error.message || 'No se pudo preparar el logotipo del SENA.');
        return;
      } finally {
        if (logoUrl) URL.revokeObjectURL(logoUrl);
      }

      doc.setDrawColor(...green);
      doc.setLineWidth(0.7);
      doc.line(margin, 34, pageWidth - margin, 34);
      doc.setFontSize(15);
      doc.text('INFORME DE REGISTRO DE GALPÓN', pageWidth / 2, 45, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Evidencia | ${reportData.fecha || 'Fecha no registrada'}`, pageWidth / 2, 52, { align: 'center' });

      const drawField = (x, y, width, label, value, height = 23) => {
        doc.setFillColor(247, 249, 250);
        doc.setDrawColor(220, 226, 232);
        doc.roundedRect(x, y, width, height, 2, 2, 'FD');
        doc.setFont('times', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(label.toUpperCase(), x + 4, y + 6);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(35, 45, 55);
        const displayValue = value === ''
          ? ''
          : value === null || value === undefined
            ? 'No registrado'
            : String(value);
        if (displayValue) {
          const lines = doc.splitTextToSize(displayValue, width - 8);
          doc.text(lines.slice(0, Math.max(1, Math.floor((height - 9) / 4.5))), x + 4, y + 14);
        }
      };

      const gap = 5;
      const contentWidth = pageWidth - margin * 2;
      const detailsWidth = contentWidth;
      const columnWidth = (contentWidth - gap) / 2;
      const pairedFields = [
        [['Fecha de ingreso', reportData.fecha], ['Hora de ingreso', reportData.hora]],
        [['Galpón', reportData.galpon], ['Peso promedio', reportData.pesoPromedio]],
        [['Semana de vida', reportData.semanaDeVida], ['Número de aves', reportData.numeroAves]],
        [['Línea de aves', reportData.linea], ['Responsable', reportData.responsable]],
      ];

      let y = 62;
      pairedFields.forEach((row) => {
        drawField(margin, y, columnWidth, row[0][0], row[0][1]);
        drawField(margin + columnWidth + gap, y, columnWidth, row[1][0], row[1][1]);
        y += 26;
      });

      const observationLines = doc.splitTextToSize(
        String(reportData.observaciones || 'No hay observaciones registradas.'),
        contentWidth - 8
      );
      const observationHeight = 75;
      drawField(margin, y, contentWidth, 'Observaciones', '', observationHeight);
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(35, 45, 55);
      doc.text(observationLines.slice(0, 11), margin + 4, y + 14);

      doc.setFillColor(...green);
      doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');

      const pdfBytes = new Uint8Array(doc.output('arraybuffer'));

      try {
        const pdfCombinado = await PDFDocument.load(pdfBytes);

        if (certificadoData) {
          const base64 = certificadoData.split(',')[1];
          if (!base64) throw new Error('El certificado no tiene un contenido válido.');
          const certificadoBytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
          const nombreCertificado = getCertificadoName(certificado).toLowerCase();
          const tipoCertificado = typeof certificado === 'object' ? certificado.type : '';
          const certificadoPage = pdfCombinado.addPage([595.28, 841.89]);
          const certificateMargin = 36;
          const certificateTop = 72;
          const certificateBottom = 36;
          const boxWidth = certificadoPage.getWidth() - certificateMargin * 2;
          const boxHeight = certificadoPage.getHeight() - certificateTop - certificateBottom;
          certificadoPage.drawRectangle({
            x: 0,
            y: certificadoPage.getHeight() - 8,
            width: certificadoPage.getWidth(),
            height: 8,
            color: rgb(green[0] / 255, green[1] / 255, green[2] / 255),
          });
          certificadoPage.drawText('CERTIFICADO ADJUNTO', {
            x: certificateMargin,
            y: certificadoPage.getHeight() - 42,
            size: 14,
            color: rgb(0.18, 0.24, 0.31),
          });
          certificadoPage.drawText(getCertificadoName(certificado), {
            x: certificateMargin,
            y: certificadoPage.getHeight() - 60,
            size: 9,
            color: rgb(0.39, 0.45, 0.53),
            maxWidth: boxWidth,
          });

          if (tipoCertificado === 'application/pdf' || nombreCertificado.endsWith('.pdf')) {
            const [paginaCertificado] = await pdfCombinado.embedPdf(certificadoBytes, [0]);
            const scale = Math.min(boxWidth / paginaCertificado.width, boxHeight / paginaCertificado.height);
            const drawWidth = paginaCertificado.width * scale;
            const drawHeight = paginaCertificado.height * scale;
            certificadoPage.drawPage(paginaCertificado, {
              x: certificateMargin + (boxWidth - drawWidth) / 2,
              y: certificateBottom + (boxHeight - drawHeight) / 2,
              width: drawWidth,
              height: drawHeight,
            });
          } else if (tipoCertificado === 'image/png' || nombreCertificado.endsWith('.png')) {
            const imagen = await pdfCombinado.embedPng(certificadoBytes);
            const scale = Math.min(boxWidth / imagen.width, boxHeight / imagen.height);
            const drawWidth = imagen.width * scale;
            const drawHeight = imagen.height * scale;
            certificadoPage.drawImage(imagen, {
              x: certificateMargin + (boxWidth - drawWidth) / 2,
              y: certificateBottom + (boxHeight - drawHeight) / 2,
              width: drawWidth,
              height: drawHeight,
            });
          } else if (tipoCertificado === 'image/jpeg' || tipoCertificado === 'image/jpg' || /\.(jpe?g)$/.test(nombreCertificado)) {
            const imagen = await pdfCombinado.embedJpg(certificadoBytes);
            const scale = Math.min(boxWidth / imagen.width, boxHeight / imagen.height);
            const drawWidth = imagen.width * scale;
            const drawHeight = imagen.height * scale;
            certificadoPage.drawImage(imagen, {
              x: certificateMargin + (boxWidth - drawWidth) / 2,
              y: certificateBottom + (boxHeight - drawHeight) / 2,
              width: drawWidth,
              height: drawHeight,
            });
          } else {
            throw new Error('El certificado debe ser un PDF, JPG o PNG para incluirlo en la segunda hoja.');
          }
        }

        const finalPdf = await pdfCombinado.save();
        const blob = new Blob([finalPdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe_${registro.galpon || 'galpon'}_${registro.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error('No se pudo generar el informe PDF con el certificado en una hoja separada.', error);
        showNotification('No se pudo generar el PDF', error.message || 'Revisa el archivo del certificado e inténtalo de nuevo.');
      }
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
                                className="p-2 rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200 transition-colors"
                                title="Editar"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  edit
                                </span>
                              </button>

                              <button
                                onClick={() => eliminarRegistro(registro.id)}
                                className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                title="Eliminar"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  delete
                                </span>
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
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => downloadReport(detalleRegistro, 'pdf')}
                        className="w-full bg-[#1c64f2] hover:bg-[#1653c3] text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all"
                      >
                        Descargar PDF
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

        {registroPendienteEliminar !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirmar-eliminar-galpon-titulo"
              className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-background-dark"
            >
              <span className="material-symbols-outlined mb-3 text-5xl text-red-500">warning</span>
              <h2 id="confirmar-eliminar-galpon-titulo" className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                ¿Estás seguro de eliminar este registro?
              </h2>
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-300">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRegistroPendienteEliminar(null)}
                  className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarEliminacion}
                  className="rounded-lg bg-red-500 px-5 py-2 font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </section>
          </div>
        )}

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
