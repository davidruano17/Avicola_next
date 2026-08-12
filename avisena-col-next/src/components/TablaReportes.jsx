'use client';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TablaReportes({ datos, filtros, resumen }) {
  const esMortalidad = filtros.tipoReporte === "Mortalidad de aves";
  const obtenerNombreGalpon = (galpon) => {
    if (galpon === "01") return "Galpón 1";
    if (galpon === "02") return "Galpón 2";
    return galpon || "Todos";
  };
  const exportarPDF = () => {
    const doc = new jsPDF();
    const verdePrincipal = [70, 200, 25];
    const verdeOscuro = [35, 120, 20];
    const grisClaro = [246, 247, 248];
    const grisTexto = [80, 80, 80];

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const margen = 15;
    const anchoContenido = anchoPagina - margen * 2;

    let y = 45;

    doc.setFillColor(...verdePrincipal);
    doc.rect(0, 0, anchoPagina, 26, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AVISENA COL", margen, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Sistema de gestión y seguimiento avícola", margen, 17);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      `Reporte de ${filtros.tipoReporte || "datos"}`,
      anchoPagina - margen,
      11,
      {
        align: "right",
      },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Generado: ${new Date().toLocaleDateString()}`,
      anchoPagina - margen,
      17,
      { align: "right" },
    );

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(
      `Reporte consolidado de ${filtros.tipoReporte || "datos"}`,
      margen,
      y,
    );

    y += 8;

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `Resumen de los registros de ${filtros.tipoReporte || "datos"} según los filtros seleccionados`,
      margen,
      y,
    );

    y += 12;

    doc.setFillColor(...grisClaro);
    doc.roundedRect(margen, y, anchoContenido, 55, 4, 4, "F");
    doc.setFillColor(...verdePrincipal);
    doc.roundedRect(margen, y, 5, 55, 2, 2, "F");

    y += 12;

    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Información del reporte", margen + 12, y);

    y += 11;

    const columna1 = margen + 12;
    const columna2 = anchoPagina / 2 + 5;

    doc.setFontSize(9);
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Tipo:", columna1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(filtros.tipoReporte || "Todos", columna1 + 27, y);

    // Galpón
    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Galpón:", columna2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(obtenerNombreGalpon(filtros.galpon), columna2 + 27, y);

    y += 13;

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha inicio:", columna1, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(filtros.fechaInicio || "No especificada", columna1 + 35, y);

    doc.setTextColor(...grisTexto);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha fin:", columna2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(filtros.fechaFin || "No especificada", columna2 + 32, y);

    y += 27;

    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen del reporte", margen, y);

    y += 8;

    const tituloTotal = esMortalidad
      ? "TOTAL DE AVES"
      : filtros.tipoReporte === "Producción de huevos"
        ? "HUEVOS PRODUCIDOS"
        : filtros.tipoReporte === "Clasificación de huevos"
          ? "HUEVOS CLASIFICADOS"
          : filtros.tipoReporte === "Morbilidad de aves"
            ? "AVES ENFERMAS"
            : "TOTAL";

    const tarjetas = [
      {
        titulo: "REGISTROS",
        valor: resumen.totalRegistros,
      },
      {
        titulo: "TOTAL DE AVES",
        valor: resumen.totalCantidad,
      },
      {
        titulo: "PROMEDIO",
        valor: resumen.promedio,
      },
      {
        titulo: "MÁXIMO",
        valor: resumen.maximo,
      },
      {
        titulo: "MÍNIMO",
        valor: resumen.minimo,
      },
    ];

    const espacioTarjeta = 3;
    const anchoTarjeta = (anchoContenido - espacioTarjeta * 4) / 5;
    tarjetas.forEach((tarjeta, index) => {
      const x = margen + index * (anchoTarjeta + espacioTarjeta);

      doc.setFillColor(...grisClaro);
      doc.roundedRect(x, y, anchoTarjeta, 25, 3, 3, "F");
      doc.setTextColor(...grisTexto);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(tarjeta.titulo, x + anchoTarjeta / 2, y + 8, {
        align: "center",
      });
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(12);
      doc.text(String(tarjeta.valor), x + anchoTarjeta / 2, y + 18, {
        align: "center",
      });
    });

    y += 35;

    if (esMortalidad) {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 225, 220);
      doc.roundedRect(margen, y, anchoContenido, 30, 4, 4, "FD");
      doc.setTextColor(...verdeOscuro);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Indicadores principales", margen + 8, y + 9);
      doc.setTextColor(...grisTexto);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        `Causa principal: ${resumen.causaPrincipal || "Sin datos"}`,
        margen + 8,
        y + 19,
      );
      doc.text(
        `Galpón con mayor mortalidad: ${obtenerNombreGalpon(resumen.galponPrincipal)}`,
        margen + 95,
        y + 19,
      );
      y += 40;
    } else {
      y += 10;
    }

    doc.setTextColor(...verdeOscuro);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Detalle de registros", margen, y);

    y += 7;

    const columnas = esMortalidad
      ? [
          "Fecha",
          "Galpón",
          "Cantidad",
          "Edad en semanas",
          "Causa",
          "Necropsia",
          "Disposición final",
        ]
      : ["Fecha", "Galpón", "Cantidad"];
    const filas = datos.map((item) => {
      if (esMortalidad) {
        return [
          item.fecha,
          obtenerNombreGalpon(item.galpon),
          item.cantidad,
          item.edad,
          item.causa,
          item.necropsia,
          item.disposicion,
        ];
      }
      return [item.fecha, obtenerNombreGalpon(item.galpon), item.cantidad];
    });
    autoTable(doc, {
      startY: y,
      head: [[columnas]],
      body: filas,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: verdePrincipal,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: {
        left: margen,
        right: margen,
      },
    });

    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
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
        `Página ${i} de ${paginas}`,
        anchoPagina - margen,
        altoPagina - 11,
        { align: "right" },
      );
    }
    const tipoArchivo = filtros.tipoReporte
      ? filtros.tipoReporte.replaceAll(" ", "_")
      : "Reporte";
    const fechaInicio = filtros.fechaInicio || "inicio";
    const fechaFin = filtros.fechaFin || "actual";
    doc.save(`Reporte_${tipoArchivo}_${fechaInicio}_${fechaFin}.pdf`);
  };

  return (
    <>
      <section className="lg:col-span-7">
        <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <section className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <section>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Detalle de registros
              </h2>
              <p className="text-lg text-slate-500 mt-1">
                Registros encontrados según los filtros seleccionados
              </p>
            </section>
            <button
              onClick={exportarPDF}
              disabled={datos.length === 0}
              className="flex items-center justify-center gap-2 bg-[#e61919ad] hover:bg-[#be1717ad] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm px-4 py-2.5 rounded-xl font-semibold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                picture_as_pdf
              </span>
              Exportr PDF
            </button>
          </section>
          <section className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-background-dark/80">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Galpón
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  {esMortalidad && (
                    <>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Edad en semanas
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Causa
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Necropsia
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Disposición final
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {datos.length > 0 ? (
                  datos.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.fecha} </td>
                      <td className="p-2">
                        {obtenerNombreGalpon(item.galpon)}{" "}
                      </td>
                      <td className="p-2">{item.cantidad}</td>
                      {esMortalidad && (
                        <>
                          <td className="p-2">{item.edad}</td>
                          <td className="p-2">{item.causa}</td>
                          <td className="p-2">{item.necropsia}</td>
                          <td className="p-2">{item.disposicion}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={esMortalidad ? 7 : 3}
                      className="p-8 text-sm text-slate-500"
                    >
                      No hay datos para mostrar.{" "}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>
      </section>
    </>
  );
}
