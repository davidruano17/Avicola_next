"use client";

import { useState, useMemo } from "react";

export default function TablaMortalidad({
  registros,
  abrirEditar,
  abrirEliminar,
  generarPDF,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const texto = busqueda.toLowerCase();

  const filtrados = useMemo(() => {
    return registros.filter(
      (r) =>
        r.fecha?.toLowerCase().includes(texto) ||
        r.galpon?.toLowerCase().includes(texto) ||
        r.causa?.toLowerCase().includes(texto) ||
        r.necropsia?.toLowerCase().includes(texto) ||
        r.disposicion?.toLowerCase().includes(texto) ||
        r.edad?.toString().includes(texto),
    );
  }, [registros, texto]);

  const registrosOrdenados = useMemo(() => {
    return [...filtrados].sort((a, b) => b.id - a.id);
  }, [filtrados]);

  const totalPaginas = Math.ceil(
    registrosOrdenados.length / registrosPorPagina,
  );
  const registrosPaginados = useMemo(() => {
    const startIndex = (paginaActual - 1) * registrosPorPagina;
    return registrosOrdenados.slice(
      startIndex,
      startIndex + registrosPorPagina,
    );
  }, [registrosOrdenados, paginaActual, registrosPorPagina]);

  return (
    <section className="min-w-full w-full text-center">
      <section className="lg:col-span-7">
        <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <section className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <section className="flex items-center gap-2">
              <span className="material-icons text-primary">history</span>
              <h2 className="text-lg font-semibold">Historial de Mortalidad</h2>
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
          <section className="overflow-x-auto w-full custom-scrollbar">
            <table className="font-size min-w-275 w-full text-center table-fixed border-collapse">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[4%]" />
                <col className="w-[6%]" />
                <col className="w-[8%]" />
                <col className="w-[12%]" />
                <col className="w-[26%]" />
                <col className="w-[26%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="bg-slate-50 dark:bg-background-dark/80 sticky top-0 text-center">
                <tr className="w-full">
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[8%]">
                    Fecha
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[4%]">
                    Galpon
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[6%]">
                    Cantidad
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[8%]">
                    Edad en semanas
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[12%]">
                    Causa
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[26%]">
                    Necropsia
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[26%]">
                    Disposición final
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[10%]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-slate-500">
                      No hay registros de mortalidad.
                    </td>
                  </tr>
                ) : (
                  registrosPaginados.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">{item.fecha}</td>
                      <td className="p-2">{item.galpon}</td>
                      <td className="p-2">{item.cantidad}</td>
                      <td className="p-2">{item.edad}</td>
                      <td className="p-2">{item.causa}</td>
                      <td className="p-2 wrap-break-word whitespace-normal">
                        {item.necropsia}
                      </td>
                      <td className="p-2 wrap-break-word whitespace-normal">
                        {item.disposicion}
                      </td>
                      <td>
                        <button
                          onClick={() => abrirEditar(item)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200 m-1"
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => abrirEliminar(item)}
                          className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 m-1"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                        <button
                          onClick={() => generarPDF(item)}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 m-1"
                        >
                          <span className="material-symbols-outlined">
                            picture_as_pdf
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
          {registrosOrdenados.length > 0 && (
            <section className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-border-dark">
              <p className="text-sm text-slate-500">
                Mostrando{" "}
                <strong>{(paginaActual - 1) * registrosPorPagina + 1}</strong> a{" "}
                <strong>
                  {Math.min(
                    paginaActual * registrosPorPagina,
                    registrosOrdenados.length,
                  )}
                </strong>{" "}
                de <strong>{registrosOrdenados.length}</strong> registros
              </p>
              <section className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((pagina) => Math.max(pagina - 1, 1))
                  }
                  disabled={paginaActual === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <span className="px-3 text-sm font-semibold text-slate-700">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaActual((pagina) =>
                      Math.min(pagina + 1, totalPaginas),
                    )
                  }
                  disabled={paginaActual === totalPaginas}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </section>
            </section>
          )}
        </section>
      </section>
    </section>
  );
}
