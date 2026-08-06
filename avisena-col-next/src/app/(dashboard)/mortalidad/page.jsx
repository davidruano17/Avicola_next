'use client';

import jsPDF from 'jspdf';
import { useState, useEffect } from 'react';
import FormMortalidad from '@/components/FormMortalidad'
import EstadisticasMortalidad from '@/components/EstadisticasMortalidad';
import ModalEditarMortalidad from '@/components/ModalEditarMortalidad';
import ModalEliminarMortalidad from '@/components/ModalEliminarMortalidad';
import TablaMortalidad from '@/components/TablaMortalidad';

export default function Page() {

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [registroEliminar, setRegistroEliminar] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const [registros, setRegistros] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("registrosMortalidad")) || [];
    } catch {
      return [];
    }
  });

  function abrirEditar(registro) {
    setRegistroEditar(registro);
    setModalEditarAbierto(true);
  }
  function abrirEliminar(registro) {
    setRegistroEliminar(registro);
    setModalEliminarAbierto(true);
  }
  function agregarRegistro(nuevoRegistro) {
    setRegistros((prev) => [...prev, nuevoRegistro]);
  }

  function generarPDF(registro) {
    const doc = new jsPDF();
    const verdePrincipal = [70, 200, 25];
    const verdeOscuro = [35, 120, 20];
    const grisClaro = [246, 247, 248];
    const grisTexto = [80, 80, 80];
    const anchoPagina = doc.internal.pageSize.getWidth();
    const margen = 15;
    const anchoContenido = anchoPagina - margen * 2;

    doc.setFillColor(...verdePrincipal);
    doc.rect(0, 0, anchoPagina, 26, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AVISENA COL", margen, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Sistema de gestión y seguimiento avícola", margen, 17);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Reporte de mortalidad", anchoPagina - margen, 11, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Generado: ${new Date().toLocaleDateString()}`,
      anchoPagina - margen,
      17,
      { align: "right" },
    );

    let y = 45;

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Registro de mortalidad avícola", margen, y);

    y += 8;

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Información detallada del evento registrado", margen, y);

    y += 12;

    doc.setFillColor(...grisClaro);
    doc.roundedRect(margen, y, anchoContenido, 68, 4, 4, "F");
    doc.setFillColor(...verdePrincipal);
    doc.roundedRect(margen, y, 5, 68, 2, 2, "F");

    y += 12;

    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("INFORMACIÓN DEL REGISTRO", margen + 12, y);

    y += 11;

    const columna1 = margen + 12;
    const columna2 = anchoPagina / 2 + 5;

    doc.setFontSize(9);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", columna1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(String(registro.fecha || "--"), columna1 + 27, y);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Galpón:", columna2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(String(registro.galpon || "--"), columna2 + 27, y);

    y += 13;

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Cantidad:", columna1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(`${registro.cantidad || 0} aves`, columna1 + 27, y);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Edad:", columna2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(`${registro.edad || "--"} semanas`, columna2 + 27, y);

    y += 13;

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Causa de muerte:", columna1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);

    const causa = doc.splitTextToSize(String(registro.causa || "--"), 105);
    doc.text(causa, columna1 + 35, y);

    y += 25;

    const altoPagina = doc.internal.pageSize.getHeight();

    function verificarEspacio(alturaNecesaria) {
      const limiteInferior = altoPagina - 30;

      if (y + alturaNecesaria > limiteInferior) {
        doc.addPage();

        y = 25;

        doc.setFillColor(...verdePrincipal);
        doc.rect(0, 0, anchoPagina, 23, "F");
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("AVISENA COL", margen, 11);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Sistema de gestión y seguimiento avícola", margen, 17);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Reporte de mortalidad", anchoPagina - margen, 11, {
          align: "right",
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
          `Generado: ${new Date().toLocaleDateString()}`,
          anchoPagina - margen,
          17,
          { align: "right" },
        );
      }

      doc.setDrawColor(...verdePrincipal);
      doc.line(margen, altoPagina - 18, anchoPagina - margen, altoPagina - 18);
      doc.setTextColor(...grisTexto);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "AVISENA COL - Sistema de gestión avícola",
        margen,
        altoPagina - 11,
      );
      doc.text(
        "Documento generado automáticamente",
        anchoPagina - margen,
        altoPagina - 11,
        { align: "right" },
      );
    }

    function agregarSeccion(titulo, contenido) {
      const texto = doc.splitTextToSize(
        String(contenido || "No se registró información."),
        anchoContenido - 20,
      );
      const altura = 24 + texto.length * 5;
      verificarEspacio(altura);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 225, 220);
      doc.roundedRect(margen, y, anchoContenido, altura, 4, 4, "FD");
      doc.setFillColor(...verdePrincipal);
      doc.roundedRect(margen, y, anchoContenido, 12, 4, 4, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(titulo, margen + 8, y + 8);
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(texto, margen + 8, y + 20);

      y += altura + 10;
    }
    agregarSeccion("RESULTADO DE NECROPSIA", registro.necropsia);
    agregarSeccion("DISPOSICIÓN FINAL", registro.disposicion);

    doc.setDrawColor(...verdePrincipal);
    doc.line(margen, altoPagina - 18, anchoPagina - margen, altoPagina - 18);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "AVISENA COL - Sistema de gestión avícola",
      margen,
      altoPagina - 11,
    );
    doc.text(
      "Documento generado automáticamente",
      anchoPagina - margen,
      altoPagina - 11,
      { align: "right" },
    );
    const fechaArchivo = registro.fecha.replaceAll("/", "-");

    doc.save(
      `Reporte_Mortalidad_Galpon_${registro.galpon}_${fechaArchivo}.pdf`,
    );
  }

  function mostrarMensaje(texto) {
    setMensaje(texto);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  }

  useEffect(() => {
    localStorage.setItem("registrosMortalidad", JSON.stringify(registros));
  }, [registros]);
  return (
    <>
      <main className="bg-[#f6f7f8] dark:bg-[#141d1e] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <section className="flex h-full grow flex-col">
          <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="flex flex-wrap justify-between items-end gap-4 mb-8">
              <section className="flex flex-col gap-1">
                <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">
                  Mortalidad de las aves
                </h1>
                <p className="text-slate-500 text-lg">
                  Registra y gestiona organizadamente los datos relacionados con
                  la mortalidad de las aves, dentro de tu unidad avícola.
                </p>
              </section>
              <FormMortalidad
                agregarRegistro={agregarRegistro}
                mostrarMensaje={mostrarMensaje}
              />
            </section>
            <TablaMortalidad
              registros={registros}
              abrirEditar={abrirEditar}
              abrirEliminar={abrirEliminar}
              generarPDF={generarPDF}
            />
            <ModalEditarMortalidad
              abierto={modalEditarAbierto}
              cerrar={() => {
                setModalEditarAbierto(false);
                setRegistroEditar(null);
              }}
              registro={registroEditar}
              registros={registros}
              setRegistros={setRegistros}
              mostrarMensaje={mostrarMensaje}
            />
            <ModalEliminarMortalidad
              abierto={modalEliminarAbierto}
              cerrar={() => {
                setModalEliminarAbierto(false);
                setRegistroEliminar(null);
              }}
              registro={registroEliminar}
              registros={registros}
              setRegistros={setRegistros}
              mostrarMensaje={mostrarMensaje}
            />
          </main>
          <EstadisticasMortalidad registros={registros} />
        </section>
      </main>
      {mensaje && (
        <section className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 z-50">
          <span className="material-symbols-outlined">check_circle</span>
          {mensaje}
        </section>
      )}
    </>
  );
}