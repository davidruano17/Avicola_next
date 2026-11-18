"use client";

import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FileText,
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { obtenerNombreGalpon } from "@/app/(dashboard)/reportes/page";

export default function TablaReportes({ datos = [], filtros = {}, resumen = {} }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const tipo = filtros.tipoReporte || "General";
  const esMortalidad = tipo === "Mortalidad de aves";
  const esProduccion = tipo === "Producción de huevos";
  const esClasificacion = tipo === "Clasificación de huevos";
  const esMorbilidad = tipo === "Morbilidad de aves";

  // Filtrado local en tabla
  const datosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return datos;
    const q = busqueda.toLowerCase().trim();

    return datos.filter((item) => {
      const fecha = (item.fecha || "").toLowerCase();
      const galpon = obtenerNombreGalpon(item.galpon).toLowerCase();
      const resp = (item.responsable || item.trabajador || "").toLowerCase();
      const causa = (item.causa || "").toLowerCase();
      const sintomas = (item.sintomas || "").toLowerCase();
      const afectacion = (item.afectacion || "").toLowerCase();
      const notas = (item.notas || item.observaciones || item.obs || "").toLowerCase();

      return (
        fecha.includes(q) ||
        galpon.includes(q) ||
        resp.includes(q) ||
        causa.includes(q) ||
        sintomas.includes(q) ||
        afectacion.includes(q) ||
        notas.includes(q)
      );
    });
  }, [datos, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const datosPaginados = datosFiltrados.slice(
    indiceInicio,
    indiceInicio + elementosPorPagina
  );

  const irPagina = (p) => {
    if (p >= 1 && p <= totalPaginas) {
      setPaginaActual(p);
    }
  };

  /* ═══════════════════════════════════════════════
     EXPORTACIÓN A EXCEL (XLSX)
     ═══════════════════════════════════════════════ */
  const exportarExcel = () => {
    if (!datos || datos.length === 0) return;

    let filasExcel = [];

    if (esMortalidad) {
      filasExcel = datos.map((d) => ({
        Fecha: d.fecha || "",
        Galpón: obtenerNombreGalpon(d.galpon),
        "Aves Bajas": Number(d.cantidad || 0),
        "Edad (Semanas)": d.edad || d.semanadevida || "N/A",
        Causa: d.causa || "No registrada",
        Necropsia: d.necropsia || "No realizada",
        "Disposición Final": d.disposicion || "N/A",
        Responsable: d.responsable || "N/A",
      }));
    } else if (esProduccion) {
      filasExcel = datos.map((d) => ({
        Fecha: d.fecha || "",
        Galpón: obtenerNombreGalpon(d.galpon),
        "Huevos Buenos": Number(d.huevosBuenos || 0),
        "Huevos Rotos": Number(d.huevosRotos || 0),
        Descarte: Number(d.descarte || 0),
        "Total Huevos": Number(d.totalHuevos || d.cantidad || 0),
        Jornada: d.jornada || "N/A",
        Responsable: d.trabajador || d.responsable || "N/A",
        Notas: d.notas || "",
      }));
    } else if (esClasificacion) {
      filasExcel = datos.map((d) => ({
        Código: d.id || "",
        Fecha: d.fecha || "",
        Galpón: obtenerNombreGalpon(d.galpon),
        "Panales (30 uds)": Math.floor(Number(d.panales || 0)),
        "Total Unidades": Number(d.unidades || d.cantidad || 0),
        "Unidades Sueltas": Math.floor(Number(d.totalSobrantes || 0)),
        "Valor Total": `$${Math.round(d.valorDinero || 0).toLocaleString("es-CO")}`,
        Responsable: d.responsable || "N/A",
        Observaciones: d.obs || "",
      }));
    } else if (esMorbilidad) {
      filasExcel = datos.map((d) => ({
        Fecha: d.fecha || "",
        Galpón: obtenerNombreGalpon(d.galpon),
        "Aves Afectadas": Number(d.cantidad || 0),
        Síntomas: d.sintomas || "",
        "Nivel Afectación": d.afectacion || "N/A",
        "Acción Tomada": d.accion || "N/A",
        Responsable: d.responsable || "N/A",
        Observaciones: d.observaciones || "",
      }));
    } else {
      filasExcel = datos.map((d) => ({
        Fecha: d.fecha || "",
        Galpón: obtenerNombreGalpon(d.galpon),
        Cantidad: Number(d.cantidad || 0),
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(filasExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    const tipoArchivo = tipo.replace(/ /g, "_");
    const fechaInicio = filtros.fechaInicio || "inicio";
    const fechaFin = filtros.fechaFin || "actual";

    XLSX.writeFile(
      workbook,
      `Reporte_${tipoArchivo}_${fechaInicio}_${fechaFin}.xlsx`
    );
  };

  /* ═══════════════════════════════════════════════
     UTILIDAD PARA CAPTURAR GRÁFICOS PARA PDF
     ═══════════════════════════════════════════════ */
  const obtenerImagenCanvas = (selector) => {
    if (typeof document === "undefined") return null;
    const canvas = document.querySelector(selector);
    if (!canvas || canvas.width === 0 || canvas.height === 0) return null;

    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");

      // Fondo blanco para garantizar nitidez y contraste en impresión
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 0, 0);

      return tempCanvas.toDataURL("image/png");
    } catch (err) {
      console.warn("No se pudo capturar el gráfico para PDF:", err);
      return null;
    }
  };

  /* ═══════════════════════════════════════════════
     EXPORTACIÓN A PDF (JSPDF + AUTOTABLE)
     ═══════════════════════════════════════════════ */
  const exportarPDF = () => {
    if (!datos || datos.length === 0) return;

    const doc = new jsPDF();
    const verdePrincipal = [73, 230, 25];
    const verdeOscuro = [25, 90, 15];
    const grisClaro = [246, 248, 246];
    const grisTexto = [80, 80, 80];

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const margen = 14;
    const anchoContenido = anchoPagina - margen * 2;

    let y = 38;

    // Encabezado Superior Banner
    doc.setFillColor(...verdePrincipal);
    doc.rect(0, 0, anchoPagina, 24, "F");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("AVISENA COL", margen, 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Sistema Integral de Gestión y Trazabilidad Avícola", margen, 17);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Informe: ${tipo}`, anchoPagina - margen, 11, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(
      `Generado: ${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`,
      anchoPagina - margen,
      17,
      { align: "right" }
    );

    // Título y filtros
    doc.setTextColor(20, 30, 45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Reporte Consolidado: ${tipo}`, margen, y);

    y += 7;
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      "Resumen ejecutivo y trazabilidad detallada de operaciones según los criterios de consulta.",
      margen,
      y
    );

    y += 10;

    // Tarjeta de Metadatos de Filtro
    doc.setFillColor(...grisClaro);
    doc.roundedRect(margen, y, anchoContenido, 28, 3, 3, "F");
    doc.setFillColor(...verdePrincipal);
    doc.roundedRect(margen, y, 4, 28, 2, 2, "F");

    y += 8;
    const c1 = margen + 10;
    const c2 = anchoPagina / 2 + 5;

    doc.setFontSize(8.5);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de Reporte:", c1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(tipo, c1 + 27, y);

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Galpón:", c2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(obtenerNombreGalpon(filtros.galpon), c2 + 15, y);

    y += 10;
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha Inicio:", c1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(filtros.fechaInicio || "Todo el historial", c1 + 22, y);

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha Fin:", c2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 20);
    doc.text(filtros.fechaFin || "Hasta la fecha", c2 + 18, y);

    y += 18;

    // Tarjetas de Métricas de Resumen
    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumen de Indicadores Clave", margen, y);

    y += 6;

    let tarjetasPDF = [];
    if (esProduccion) {
      tarjetasPDF = [
        { t: "TOTAL RECOLECCIÓN", v: `${resumen.totalCantidad.toLocaleString()} uds` },
        { t: "HUEVOS BUENOS", v: `${(resumen.totalHuevosBuenos || 0).toLocaleString()} uds` },
        { t: "HUEVOS ROTOS", v: `${(resumen.totalHuevosRotos || 0).toLocaleString()} uds` },
        { t: "DESCARTE", v: `${(resumen.totalHuevosDescarte || 0).toLocaleString()} uds` },
        { t: "MERMA (%)", v: `${resumen.tasaMerma || 0}%` },
      ];
    } else if (esClasificacion) {
      tarjetasPDF = [
        { t: "REGISTROS", v: String(resumen.totalRegistros) },
        { t: "TOTAL CLASIFICADO", v: `${(resumen.totalCantidad || 0).toLocaleString("es-CO")} uds` },
        { t: "PANALES (30)", v: `${Math.floor(resumen.totalPanales || 0).toLocaleString("es-CO")}` },
        { t: "SOBRANTES", v: `${Math.floor(resumen.totalSobrantes || 0).toLocaleString("es-CO")} uds` },
        { t: "VALOR ESTIMADO", v: `$${Math.round(resumen.totalDinero || 0).toLocaleString("es-CO")}` },
      ];
    } else if (esMortalidad) {
      tarjetasPDF = [
        { t: "REGISTROS", v: String(resumen.totalRegistros) },
        { t: "TOTAL BAJAS", v: `${resumen.totalCantidad.toLocaleString()} aves` },
        { t: "PROMEDIO", v: `${resumen.promedio} aves` },
        { t: "PICO MÁXIMO", v: `${resumen.maximo} aves` },
        { t: "CAUSA PRINCIPAL", v: String(resumen.causaPrincipal || "N/A") },
      ];
    } else {
      tarjetasPDF = [
        { t: "REGISTROS", v: String(resumen.totalRegistros) },
        { t: "TOTAL AFECTADAS", v: `${resumen.totalCantidad.toLocaleString()} aves` },
        { t: "PROMEDIO", v: `${resumen.promedio} aves` },
        { t: "GRAVEDAD", v: String(resumen.afectacionPrincipal || "N/A") },
        { t: "SÍNTOMA PPAL", v: String(resumen.causaPrincipal || "N/A") },
      ];
    }

    const gap = 3;
    const cardW = (anchoContenido - gap * (tarjetasPDF.length - 1)) / tarjetasPDF.length;

    tarjetasPDF.forEach((card, idx) => {
      const cardX = margen + idx * (cardW + gap);
      doc.setFillColor(...grisClaro);
      doc.roundedRect(cardX, y, cardW, 20, 2.5, 2.5, "F");

      doc.setTextColor(...grisTexto);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(card.t, cardX + cardW / 2, y + 6.5, { align: "center" });

      doc.setTextColor(20, 30, 45);
      doc.setFontSize(9.5);
      doc.text(card.v, cardX + cardW / 2, y + 14.5, { align: "center" });
    });

    y += 28;

    // Sección de Gráficos si existen en pantalla
    const imgBarra = obtenerImagenCanvas("#contenedor-chart-barra canvas");
    const imgDona = obtenerImagenCanvas("#contenedor-chart-dona canvas");

    if (imgBarra) {
      doc.setTextColor(...verdeOscuro);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Análisis y Tendencias Gráficas", margen, y);
      y += 5;

      const altoGrafico = 52;
      const bordeColor = [226, 232, 240];

      if (imgDona) {
        const anchoBarra = 114;
        const anchoDona = 65;
        const gapGrafico = 3;

        // Tarjeta para Barra
        doc.setDrawColor(...bordeColor);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margen, y, anchoBarra, altoGrafico, 2.5, 2.5, "FD");
        doc.addImage(
          imgBarra,
          "PNG",
          margen + 2,
          y + 2,
          anchoBarra - 4,
          altoGrafico - 4,
          undefined,
          "FAST"
        );

        // Tarjeta para Dona
        const xDona = margen + anchoBarra + gapGrafico;
        doc.setDrawColor(...bordeColor);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(xDona, y, anchoDona, altoGrafico, 2.5, 2.5, "FD");
        doc.addImage(
          imgDona,
          "PNG",
          xDona + 2,
          y + 2,
          anchoDona - 4,
          altoGrafico - 4,
          undefined,
          "FAST"
        );
      } else {
        // Solo barra a ancho completo
        doc.setDrawColor(...bordeColor);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margen, y, anchoContenido, altoGrafico, 2.5, 2.5, "FD");
        doc.addImage(
          imgBarra,
          "PNG",
          margen + 2,
          y + 2,
          anchoContenido - 4,
          altoGrafico - 4,
          undefined,
          "FAST"
        );
      }

      y += altoGrafico + 8;
    }

    // Tabla de Registros
    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Detalle Consolidado de Registros", margen, y);

    y += 5;

    let columnasPDF = [];
    let filasPDF = [];

    if (esMortalidad) {
      columnasPDF = [
        "Fecha",
        "Galpón",
        "Aves",
        "Edad",
        "Causa",
        "Necropsia",
        "Disposición",
      ];
      filasPDF = datos.map((d) => [
        d.fecha,
        obtenerNombreGalpon(d.galpon),
        d.cantidad,
        d.edad || d.semanadevida || "N/A",
        d.causa || "N/A",
        d.necropsia || "N/A",
        d.disposicion || "N/A",
      ]);
    } else if (esProduccion) {
      columnasPDF = [
        "Fecha",
        "Galpón",
        "Buenos",
        "Rotos",
        "Descarte",
        "Total",
        "Jornada",
        "Responsable",
      ];
      filasPDF = datos.map((d) => [
        d.fecha,
        obtenerNombreGalpon(d.galpon),
        d.huevosBuenos ?? 0,
        d.huevosRotos ?? 0,
        d.descarte ?? 0,
        d.totalHuevos ?? d.cantidad ?? 0,
        d.jornada || "N/A",
        d.trabajador || d.responsable || "N/A",
      ]);
    } else if (esClasificacion) {
      columnasPDF = [
        "Código",
        "Fecha",
        "Galpón",
        "Panales",
        "Unidades",
        "Sobrantes",
        "Total ($)",
        "Responsable",
      ];
      filasPDF = datos.map((d) => [
        d.id || "N/A",
        d.fecha,
        obtenerNombreGalpon(d.galpon),
        Math.floor(Number(d.panales ?? 0)).toLocaleString("es-CO"),
        Number(d.unidades ?? d.cantidad ?? 0).toLocaleString("es-CO"),
        Math.floor(Number(d.totalSobrantes ?? 0)).toLocaleString("es-CO"),
        `$${Math.round(d.valorDinero || 0).toLocaleString("es-CO")}`,
        d.responsable || "N/A",
      ]);
    } else if (esMorbilidad) {
      columnasPDF = [
        "Fecha",
        "Galpón",
        "Afectadas",
        "Síntomas",
        "Gravedad",
        "Acción",
        "Responsable",
      ];
      filasPDF = datos.map((d) => [
        d.fecha,
        obtenerNombreGalpon(d.galpon),
        d.cantidad ?? 0,
        d.sintomas || "N/A",
        d.afectacion || "N/A",
        d.accion || "N/A",
        d.responsable || "N/A",
      ]);
    } else {
      columnasPDF = ["Fecha", "Galpón", "Cantidad"];
      filasPDF = datos.map((d) => [
        d.fecha,
        obtenerNombreGalpon(d.galpon),
        d.cantidad,
      ]);
    }

    autoTable(doc, {
      startY: y,
      head: [columnasPDF],
      body: filasPDF,
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [40, 40, 40],
        halign: "center",
      },
      headStyles: {
        fillColor: verdePrincipal,
        textColor: [15, 23, 42],
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [250, 252, 250],
      },
      margin: {
        left: margen,
        right: margen,
        top: 18,
        bottom: 18,
      },
    });

    // Paginación y pie de página en cada hoja
    const totalHojas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalHojas; i++) {
      doc.setPage(i);

      // Si es página 2 o posterior, encabezado sutil de continuidad
      if (i > 1) {
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`AVISENA COL - Reporte Consolidado: ${tipo}`, margen, 11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...grisTexto);
        doc.text(
          obtenerNombreGalpon(filtros.galpon),
          anchoPagina - margen,
          11,
          { align: "right" }
        );
        doc.setDrawColor(226, 232, 240);
        doc.line(margen, 13.5, anchoPagina - margen, 13.5);
      }

      doc.setDrawColor(...verdePrincipal);
      doc.line(margen, altoPagina - 14, anchoPagina - margen, altoPagina - 14);

      doc.setTextColor(...grisTexto);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        "AVISENA COL - SENA Centro Agropecuario y de Biotecnología",
        margen,
        altoPagina - 8
      );
      doc.text(
        `Página ${i} de ${totalHojas}`,
        anchoPagina - margen,
        altoPagina - 8,
        { align: "right" }
      );
    }

    const tipoArchivo = tipo.replace(/ /g, "_");
    const fInicio = filtros.fechaInicio || "inicio";
    const fFin = filtros.fechaFin || "actual";

    doc.save(`Reporte_${tipoArchivo}_${fInicio}_${fFin}.pdf`);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Barra Superior con Buscador y Acciones de Exportación */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Detalle Consolidado de Registros
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mostrando {datosFiltrados.length} de {datos.length} registros encontrados
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Buscador Rápido */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en registros..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all w-full sm:w-56"
            />
          </div>

          {/* Botón Excel */}
          <button
            type="button"
            onClick={exportarExcel}
            disabled={datos.length === 0}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>

          {/* Botón PDF */}
          <button
            type="button"
            onClick={exportarPDF}
            disabled={datos.length === 0}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Tabla Adaptativa */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <th className="px-4 py-3.5">Fecha</th>
              <th className="px-4 py-3.5">Galpón</th>

              {esMortalidad && (
                <>
                  <th className="px-4 py-3.5">Aves Bajas</th>
                  <th className="px-4 py-3.5">Edad Semanas</th>
                  <th className="px-4 py-3.5">Causa</th>
                  <th className="px-4 py-3.5">Necropsia</th>
                  <th className="px-4 py-3.5">Disposición</th>
                </>
              )}

              {esProduccion && (
                <>
                  <th className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400">Buenos</th>
                  <th className="px-4 py-3.5 text-amber-600 dark:text-amber-400">Rotos</th>
                  <th className="px-4 py-3.5 text-rose-600 dark:text-rose-400">Descarte</th>
                  <th className="px-4 py-3.5">Total Recolectado</th>
                  <th className="px-4 py-3.5">Jornada</th>
                  <th className="px-4 py-3.5">Responsable</th>
                </>
              )}

              {esClasificacion && (
                <>
                  <th className="px-4 py-3.5">Panales (30)</th>
                  <th className="px-4 py-3.5">Total Unidades</th>
                  <th className="px-4 py-3.5">Sobrantes</th>
                  <th className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400">Valor Estimado</th>
                  <th className="px-4 py-3.5">Responsable</th>
                </>
              )}

              {esMorbilidad && (
                <>
                  <th className="px-4 py-3.5">Aves Afectadas</th>
                  <th className="px-4 py-3.5">Síntomas</th>
                  <th className="px-4 py-3.5">Nivel Afectación</th>
                  <th className="px-4 py-3.5">Acción</th>
                  <th className="px-4 py-3.5">Responsable</th>
                </>
              )}

              {!esMortalidad && !esProduccion && !esClasificacion && !esMorbilidad && (
                <th className="px-4 py-3.5">Cantidad</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {datosPaginados.length > 0 ? (
              datosPaginados.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {item.fecha || "N/A"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {obtenerNombreGalpon(item.galpon)}
                  </td>

                  {/* Mortalidad */}
                  {esMortalidad && (
                    <>
                      <td className="px-4 py-3 font-bold text-red-600 dark:text-red-400">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.edad || item.semanadevida || "N/A"}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.causa || "N/A"}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.necropsia || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.disposicion || "N/A"}
                      </td>
                    </>
                  )}

                  {/* Producción */}
                  {esProduccion && (
                    <>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {Number(item.huevosBuenos || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">
                        {Number(item.huevosRotos || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                        {Number(item.descarte || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                        {Number(item.totalHuevos || item.cantidad || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.jornada || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.trabajador || item.responsable || "N/A"}
                      </td>
                    </>
                  )}

                  {/* Clasificación */}
                  {esClasificacion && (
                    <>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {Math.floor(Number(item.panales || 0)).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900 dark:text-slate-100">
                        {Number(item.unidades || item.cantidad || 0).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-semibold">
                        {Math.floor(Number(item.totalSobrantes || 0)).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {`$${Math.round(item.valorDinero || 0).toLocaleString("es-CO")}`}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.responsable || "N/A"}
                      </td>
                    </>
                  )}

                  {/* Morbilidad */}
                  {esMorbilidad && (
                    <>
                      <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                        {item.cantidad}
                      </td>
                      <td className="px-4 py-3 font-medium max-w-xs truncate">
                        {item.sintomas || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg ${item.afectacion === "Crítico"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : item.afectacion === "Moderado"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {item.afectacion || "Leve"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {item.accion || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.responsable || "N/A"}
                      </td>
                    </>
                  )}

                  {/* General Fallback */}
                  {!esMortalidad && !esProduccion && !esClasificacion && !esMorbilidad && (
                    <td className="px-4 py-3 font-bold">{item.cantidad}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={esMortalidad || esProduccion || esClasificacion || esMorbilidad ? 8 : 3}
                  className="p-12 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm">
                      No se encontraron registros que coincidan con la búsqueda.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Inferior */}
      {datosFiltrados.length > elementosPorPagina && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>
            Página <strong className="text-slate-800 dark:text-slate-200">{paginaActual}</strong> de{" "}
            <strong className="text-slate-800 dark:text-slate-200">{totalPaginas}</strong> ({datosFiltrados.length} registros en total)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => irPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPaginas ||
                  Math.abs(p - paginaActual) <= 1
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <span key={p} className="flex items-center">
                    {prev && p - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                    <button
                      type="button"
                      onClick={() => irPagina(p)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${p === paginaActual
                          ? "bg-primary text-slate-950 font-black"
                          : "border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}

            <button
              type="button"
              onClick={() => irPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
