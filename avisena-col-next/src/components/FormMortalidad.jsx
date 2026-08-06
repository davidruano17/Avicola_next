"use client";

import { useState } from "react";

export default function FormMortalidad({ agregarRegistro, mostrarMensaje }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [galpon, setGalpon] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [edad, setEdad] = useState("");
  const [causa, setCausa] = useState("");
  const [necropsia, setNecropsia] = useState("");
  const [disposicion, setDisposicion] = useState("");

  function abrirModal() {
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    limpiarFormulario();
  }

  function limpiarFormulario() {
    setGalpon("");
    setCantidad("");
    setEdad("");
    setCausa("");
    setNecropsia("");
    setDisposicion("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevoRegistro = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString(),
      galpon,
      cantidad: Number(cantidad),
      edad: Number(edad),
      causa,
      necropsia,
      disposicion,
    };

    agregarRegistro(nuevoRegistro);

    mostrarMensaje("Registro guardado exitosamente");

    cerrarModal();
  }

  return (
    <>
      {/**   Formulario de registro   */}
      <section className="flex flex-col">
        <section className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={abrirModal}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
          >
            <span className="material-icons">add_box</span>
            <span>Nuevo Registro</span>
          </button>
        </section>
      </section>
      {modalAbierto && (
        <section className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <section className="bg-white border border-slate-200 w-full max-w-4xl rounded-xl shadow-sm p-6 overflow-hidden relative ">
            <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
              <section className="flex items-center gap-2">
                <span className="material-icons text-[#49E619]">add_box</span>
                <h2 className="text-lg font-bold justify-center">
                  Nuevo Registro de Mortalidad
                </h2>
              </section>
              <button
                onClick={cerrarModal}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </section>
            <form onSubmit={handleSubmit}>
              <section className="space-y-5 p-6 grid grid-cols-2 ">
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Galpón donde se produjo la mortalidad{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={galpon}
                    onChange={(e) => setGalpon(e.target.value)}
                    required
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  >
                    <option value="">Seleccione el galpón...</option>
                    <option value="01">01</option>
                    <option value="02">02</option>
                  </select>
                </section>
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Cantidad de aves muertas{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="0"
                    min="1"
                    required
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  />
                </section>
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Edad en semanas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ingrese la edad en semanas de las aves. Ej: 19"
                    min="1"
                    required
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  />
                </section>
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Causa de Muerte <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={causa}
                    onChange={(e) => setCausa(e.target.value)}
                    placeholder="Ingrese la causa de mortalidad..."
                    required
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  />
                </section>
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Resultado de Necropsia{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    type="text"
                    value={necropsia}
                    onChange={(e) => setNecropsia(e.target.value)}
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                    placeholder="Describa los hallazgos encontrados..."
                    required
                  />
                </section>
                <section className="space-y-1.5 p-1 m-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Disposición final <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    type="text"
                    value={disposicion}
                    onChange={(e) => setDisposicion(e.target.value)}
                    placeholder="Describa cuál será la disposición final del ave..."
                    required
                    className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  />
                </section>
              </section>
              <section className="content-end">
                <section className="flex justify-center space-y-1.5">
                  <button
                    type="button"
                    className="bg-[#e2e8f0] px-5 py-2.5 mr-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                    onClick={cerrarModal}
                  >
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
              </section>
            </form>
          </section>
        </section>
      )}
    </>
  );
}
