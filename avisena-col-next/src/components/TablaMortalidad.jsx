'use client';

import { useState, useMemo } from "react";

export default function TablaMortalidad({
  registros,
  abrirEditar,
  abrirEliminar,
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
    <section className="w-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Cabecera de la tabla con título y buscador responsive */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#49E619]">history</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Historial de Mortalidad
            </h2>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 outline-none transition-all"
              placeholder="Buscar registros..."
              type="text"
            />
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-lg">search</span>
            </span>
          </div>
        </div>

        {/* Contenedor con scroll horizontal para pantallas pequeñas */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-center border-collapse min-w-[950px]">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-center">
              <tr>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[110px]">
                  Fecha
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[85px]">
                  Galpón
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[90px]">
                  Cantidad
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[110px]">
                  Edad (semanas)
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[140px]">
                  Causa
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                  Necropsia
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                  Disposición final
                </th>
                <th className="px-3 sm:px-4 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[110px]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {registrosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No se encontraron registros de mortalidad.
                  </td>
                </tr>
              ) : (
                registrosPaginados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.fecha}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {item.galpon}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.cantidad} aves
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {item.edad} sem.
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {item.causa}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left max-w-xs break-words">
                      {item.necropsia || "--"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-left max-w-xs break-words">
                      {item.disposicion || "--"}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => abrirEditar(item)}
                          title="Editar registro"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 transition"
                        >
                          <span className="material-symbols-outlined text-base">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEliminar(item)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 transition"
                        >
                          <span className="material-symbols-outlined text-base">
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
        </div>

        {/* Paginación responsive */}
        {registrosOrdenados.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Mostrando{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {(paginaActual - 1) * registrosPorPagina + 1}
              </strong>{" "}
              a{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {Math.min(
                  paginaActual * registrosPorPagina,
                  registrosOrdenados.length,
                )}
              </strong>{" "}
              de{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {registrosOrdenados.length}
              </strong>{" "}
              registros
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaginaActual((pagina) => Math.max(pagina - 1, 1))}
                disabled={paginaActual === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base">
                  chevron_left
                </span>
              </button>
              <span className="px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                Página {paginaActual} de {totalPaginas || 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPaginaActual((pagina) =>
                    Math.min(pagina + 1, totalPaginas),
                  )
                }
                disabled={paginaActual >= totalPaginas}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-base">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
