"use client";

import { useState } from "react";

export default function FiltrosGestionUsuarios({
  usuarios,
  setUsuariosFiltrados,
  roles,
  setPaginaActual,
}) {
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroDocumento, setFiltroDocumento] = useState("");

  function aplicarFiltros() {
    const filtrados = usuarios.filter((u) => {
      const porRol = filtroRol === "" || u.rol === filtroRol;

      const porDocumento =
        filtroDocumento === "" || u.documento.includes(filtroDocumento);

      return porRol && porDocumento;
    });

    setUsuariosFiltrados(filtrados);
    setPaginaActual(1);
  }

  function limpiarFiltros() {
    setFiltroRol("");
    setFiltroDocumento("");
    setUsuariosFiltrados(usuarios);
    setPaginaActual(1);
  }

  return (
    <>
      <section className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            aplicarFiltros();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 items-end"
        >
          <section className="sm:col-span-1 lg:col-span-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Filtrar por rol
            </label>
            <select
              className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </section>

          <section className="sm:col-span-1 lg:col-span-5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Filtrar por No. de documento de identidad
            </label>
            <input
              type="text"
              placeholder="Buscar por número de documento..."
              className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.target.value)}
            />
          </section>

          <section className="sm:col-span-2 lg:col-span-3 flex gap-2 w-full">
            <button
              type="submit"
              className="flex-1 h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-primary hover:bg-[#58db25] px-4 text-sm font-bold text-black shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out whitespace-nowrap flex"
            >
              <span className="material-symbols-outlined text-lg">filter_list</span>
              <span>Filtrar</span>
            </button>
            {(filtroRol !== "" || filtroDocumento !== "") && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="h-11 px-3.5 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors shrink-0 cursor-pointer"
                title="Limpiar filtros"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </section>
        </form>
      </section>
    </>
  );
}
