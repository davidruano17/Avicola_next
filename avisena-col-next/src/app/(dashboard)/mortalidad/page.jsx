'use client';

import jsPDF from 'jspdf';
import FormMortalidad from '@/components/FormMortalidad'
import { useState, useEffect, useMemo } from 'react';
import EstadisticasMortalidad from '@/components/EstadisticasMortalidad';

export default function Page() {

  const [registros, setRegistros] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setRegistros(JSON.parse(localStorage.getItem("registrosMortalidad")) || []);
    setLoaded(true);
  }, []);

  const texto = busqueda.toLowerCase();

  const filtrados = useMemo(() => {
    return registros.filter(
      (r) =>
        r.causa?.toLowerCase().includes(texto) ||
        r.fecha?.toLowerCase().includes(texto),
    );
  }, [registros, texto]);

  function agregarRegistro(nuevoRegistro) {
    setRegistros((prev) => [...prev, nuevoRegistro]);
  }

  function generarPDF(registro) {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Mortalidad Avícola", 20, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${registro.fecha}`, 20, 40);
    doc.text(`Cantidad: ${registro.cantidad}`, 20, 50);
    doc.text(`Causa: ${registro.causa}`, 20, 60);
    doc.text(`Necropsia: ${registro.necropsia}`, 20, 70);

    doc.save(`reporte_${registro.fecha}.pdf`);
  }

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("registrosMortalidad", JSON.stringify(registros));
  }, [registros, loaded]);
  
  return (
    <>
      <main className="bg-[#f6f7f8] dark:bg-[#141d1e] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <section className="flex h-full grow flex-col">
          <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="flex flex-wrap justify-between items-end gap-4 mb-8">
              <section className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold mb-2">
                  Mortalidad de las aves
                </h1>
                <p className="text-slate-500 text-lg">
                  Registra y gestiona organizadamente los datos relacionados con
                  la mortalidad de las aves, dentro de tu unidad avícola.
                </p>
              </section>
              <FormMortalidad agregarRegistro={agregarRegistro} />
            </section>
            <section className="min-w-full w-full text-center">
              {/**   Historial   */}

              <section className="lg:col-span-7">
                <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                  <section className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <section className="flex items-center gap-2">
                      <span className="material-icons text-[#49E619]">
                        history
                      </span>
                      <h2 className="text-lg font-semibold">
                        Historial de Mortalidad
                      </h2>
                    </section>
                    <section className="relative">
                      <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full sm:w-64 pl-9 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 outline-none"
                        placeholder="Buscar registros..."
                        type="text"
                      />
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <span className="material-icons text-sm">search</span>
                      </span>
                    </section>
                  </section>
                  <section className="overflow-x-auto custom-scrollbar">
                    <table className="font-size w-full text-center border-collapse">
                      <thead className="bg-slate-50 dark:bg-background-dark/80 sticky top-0 text-center">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                            {" "}
                            Cantidad
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {" "}
                            Causa
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Necropsia
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                            Exportar historial
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrados.map((item, index) => (
                          <tr key={`${item.fecha}-${index}`}>
                            <td className="p-2">{item.fecha}</td>
                            <td className="p-2">{item.cantidad}</td>
                            <td className="p-2">{item.causa}</td>
                            <td className="p-2">{item.necropsia}</td>
                            <td>
                              <button
                                onClick={() => generarPDF(item)}
                                className="bg-[#e61919ad] text-black px-3 py-1 rounded-lg font-semibold"
                              >
                                PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </section>
              </section>
            </section>
          </main>
          <EstadisticasMortalidad registros={registros} />
          
        </section>
      </main>
    </>
  );
}