'use client';


import { useState } from "react";

export default function FormMortalidad({ agregarRegistro }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const [cantidad, setCantidad] = useState("");
  const [causa, setCausa] = useState("");
  const [necropsia, setNecropsia] = useState("");

  function abrirModal() {
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    limpiarFormulario();
  }

  function limpiarFormulario() {
    setCantidad("");
    setCausa("");
    setNecropsia("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevoRegistro = {
      fecha: new Date().toLocaleDateString(),
      cantidad: Number(cantidad),
      causa,
      necropsia,
    };

    agregarRegistro(nuevoRegistro);

    cerrarModal();
  }

  return (
    <>
      {/**   Formulario de registro   */}
      <section className="flex flex-col">
        <section className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={abrirModal} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out">
            <span className="material-icons">add_box</span>
            <span>Nuevo Registro</span>
          </button>
        </section>  
      </section>
      {modalAbierto && (
        <section className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center" onClick={cerrarModal}>
          <section className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-sm p-6 overflow-hidden relative " onClick={(e) => e.stopPropagation()}>
            <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
              <section className="flex items-center gap-2">
                <span className="material-icons text-[#49E619]">add_box</span>
                <h2 className="text-lg font-bold justify-center">Nuevo Registro de Mortalidad</h2>
              </section>
              
              <button onClick={cerrarModal} className="text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-icons">close</span>
              </button>
            </section>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <section className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cantidad de Aves Muertas <span className="text-red-500">*</span>
                </label>
                <section className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <span className="material-icons text-sm">app_registration</span>
                  </span>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0"
                    min="1"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  />
                </section>
              </section>
              <section className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Causa de Muerte <span className="text-red-500">*</span>
                </label>
                <section className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <span className="material-icons text-sm">category</span>
                  </span>
                  <select
                    value={causa}
                    onChange={(e) => setCausa(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  >
                    <option value="" disabled>
                      Seleccione una causa
                    </option>
                    <option value="Respiratoria">Respiratoria</option>
                    <option value="Digestiva">Digestiva</option>
                    <option value="Accidente">Accidente</option>
                    <option value="Desconocida">Desconocida</option>
                  </select>
                </section>
              </section>
              <section className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Resultado de Necropsia <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={necropsia}
                  onChange={(e) => setNecropsia(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background-dark/50 focus:ring-2 focus:ring-[#49E619]/40 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Describa los hallazgos encontrados..."
                  required
                ></textarea>
              </section>
              <section className="grid grid-cols-1 sm:grid-cols-1 gap-4 pt-4 ">
                <button type="button" className="bg-[#e2e8f0] px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all" onClick={cerrarModal}>
                  Cancelar
                </button>

                <button
                  className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
                  type="submit"
                >
                  <span className="material-icons text-sm">save</span>
                  Guardar Registro
                </button>
              </section>
            </form>
          </section>
        </section>
      )}
    </>
  );
}
