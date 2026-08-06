'use client';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function TablaReportes({ datos, filtros }) {
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte AVISENA COL", 14, 20);

    doc.setFontSize(11);

    doc.text(`Tipo: ${filtros.tipoReporte || "Todos"}`, 14, 30);

    doc.text(`Galpón: ${filtros.galpon || "Todos"}`, 14, 38);

    autoTable(doc, {
      startY: 50,

      head: [["ID", "Tipo", "Fecha", "Galpón", "Cantidad"]],

      body: datos.map((item) => [
        item.id,
        item.tipo,
        item.fecha,
        item.galpon,
        item.cantidad,
      ]),
    });

    doc.save("reporte-avicola.pdf");
  };

  // EXPORTAR EXCEL
  const exportarExcel = () => {
    const data = datos.map((item) => ({
      ID: item.id,
      Tipo: item.tipo,
      Fecha: item.fecha,
      Galpon: item.galpon,
      Cantidad: item.cantidad,
    }));

    const hoja = XLSX.utils.json_to_sheet(data);

    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

    XLSX.writeFile(libro, "reporte-avicola.xlsx");
  };

  return (
    <>
      <section className="lg:col-span-7">
        <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <section className="p-2 border-b border-slate-200 dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <section className="space-y-1 flex items-center">
              <p className="text-lg text-on-surface-variant flex items-center gap-xs pr-4">
                <span className="material-symbols-outlined text-[#49E619] p-3">
                  filter_list
                </span>
                Filtros aplicados:
              </p>
              <p className="text-lg text-slate-500 p-2 border border-[#92ec77] rounded-4xl items-center gap-xs m-0 mr-3">
                Tipo: {filtros.tipoReporte || "Seleccione..."}
              </p>

              <p className="text-lg text-slate-500 p-2 border border-[#92ec77] rounded-4xl items-center gap-xs pr-4">
                Galpón: {filtros.galpon || "Seleccione..."}
              </p>
            </section>
            <section className="flex items-center gap-md">
              <section className="flex items-center gap-xs">
                <button
                  onClick={exportarPDF}
                  className="flex bg-[#e61919ad] text-black text-sm px-3 py-2 mr-8 rounded-xl font-semibold items-center hover:bg-[#be1717ad] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    picture_as_pdf
                  </span>
                  Exportar PDF
                </button>
                <button
                  onClick={exportarExcel}
                  className="flex bg-[#1ac963] text-black text-sm px-3 py-2 rounded-xl font-semibold items-center hover:bg-[#30bb6a] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    table_chart
                  </span>
                  Exportar Excel
                </button>
              </section>
            </section>
          </section>
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <section className="overflow-x-auto @container">
              <table className="font-size w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-background-dark/80 sticky top-0 text-center">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Galpón
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {datos.length > 0 ? (
                    datos.map((item) => (
                      <tr key={item.id} className="border-t border-gray-300">
                        <td className="px-6 py-4 text-l text-slate-800 uppercase tracking-wider">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 text-l text-slate-800 uppercase tracking-wider">
                          {item.tipo}
                        </td>
                        <td className="px-6 py-4 text-l text-slate-800 uppercase tracking-wider">
                          {item.fecha}
                        </td>
                        <td className="px-6 py-4 text-l text-slate-800 uppercase tracking-wider">
                          {item.galpon}
                        </td>
                        <td className="px-6 py-4 text-l text-slate-800 uppercase tracking-wider">
                          {item.cantidad}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-6 text-slate-500">
                        No hay datos para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </section>
        </section>
      </section>
    </>
  );
}
