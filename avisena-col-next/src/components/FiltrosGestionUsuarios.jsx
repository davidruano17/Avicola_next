'use client';

import { useState } from "react";

export default function FiltrosGestionUsuarios({
  usuarios,
  setUsuariosFiltrados,
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
    }

    return (
      <>
        <section className="flex gap-4 mb-6">
          <section>
            <label className="text-lg font-bold p-2">Rol</label>
            <select
              className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos</option>
              <option>Instructor lider</option>
              <option>Instructor investigador</option>
              <option>Aprendiz de contrato</option>
            </select>
          </section>

          <section>
            <label className="text-lg font-bold p-2">Documento</label>
            <input
              type="text"
              placeholder="Buscar documento"
              className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2"
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.target.value)}
            />
          </section>

          <section className="flex items-end">
            <button onClick={aplicarFiltros} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#58db25] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out">
              <span className="material-symbols-outlined">filter_list</span>
              <span>Filtrar</span>
            </button>
          </section>
        </section>
      </>
    );
}
