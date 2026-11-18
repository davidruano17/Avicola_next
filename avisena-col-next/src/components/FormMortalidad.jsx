"use client";

import { useState } from "react";

export default function FormMortalidad({
  agregarRegistro,
  mostrarMensaje,
  galpones = [],
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [galpon, setGalpon] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [edad, setEdad] = useState("");
  const [causa, setCausa] = useState("");
  const [necropsia, setNecropsia] = useState("");
  const [disposicion, setDisposicion] = useState("");
  const [errorStock, setErrorStock] = useState("");

  const galponSeleccionado = galpones.find(
    (g) =>
      String(g.galpon).trim().toLowerCase() === String(galpon).trim().toLowerCase() ||
      String(g.id) === String(galpon) ||
      String(g.lote).trim().toLowerCase() === String(galpon).trim().toLowerCase() ||
      String(g.galpon).trim().replace(/^0+/, "") === String(galpon).trim().replace(/^0+/, "")
  );

  const avesDisponibles = Number(
    galponSeleccionado?.numeroAves ?? galponSeleccionado?.numerodeaves ?? 0
  );

  function abrirModal() {
    setModalAbierto(true);
    setErrorStock("");
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
    setErrorStock("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!galponSeleccionado) {
      setErrorStock("Por favor seleccione un galpón válido.");
      return;
    }

    if (avesDisponibles <= 0) {
      setErrorStock("El galpón seleccionado no tiene aves vivas disponibles.");
      return;
    }

    const cantNum = Number(cantidad);
    if (cantNum > avesDisponibles) {
      setErrorStock(
        `No puedes registrar más de ${avesDisponibles.toLocaleString()} aves muertas para este galpón.`
      );
      return;
    }

    const nuevoRegistro = {
      id: Date.now(),
      fecha: new Date().toISOString().split("T")[0],
      galpon: galponSeleccionado.galpon || galpon,
      galponId: galponSeleccionado.id || null,
      cantidad: cantNum,
      edad: Number(edad),
      causa,
      necropsia,
      disposicion,
    };

    agregarRegistro(nuevoRegistro);
    cerrarModal();
  }

  return (
    <>
      {/** Botón abrir modal responsive */}
      <div className="flex">
        <button
          type="button"
          onClick={abrirModal}
          className="w-full sm:w-auto flex h-11 sm:h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#49E619] hover:bg-[#3dc407] px-5 sm:px-6 text-sm font-bold text-black shadow-md shadow-[#49E619]/20 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">add_box</span>
          <span>Nuevo Registro</span>
        </button>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-[#49E619]/10 flex items-center justify-center text-[#49E619]">
                  <span className="material-symbols-outlined text-xl">add_box</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Nuevo Registro de Mortalidad
                </h2>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Formulario con scroll vertical */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Galpón */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      Galpón donde se produjo la mortalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={galpon}
                      onChange={(e) => {
                        setGalpon(e.target.value);
                        setErrorStock("");
                      }}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                    >
                      <option value="">Seleccione el galpón...</option>
                      {galpones.map((g) => {
                        const nombre = g.galpon || g.lote || `ID ${g.id}`;
                        const aves = Number(g.numeroAves ?? g.numerodeaves ?? 0);
                        return (
                          <option key={g.id || nombre} value={nombre} disabled={aves <= 0}>
                            Galpón {nombre} ({aves.toLocaleString()} aves disponibles) {aves <= 0 ? "- Sin aves" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {/* Indicador de aves disponibles en tiempo real */}
                    {galponSeleccionado && (
                      <div
                        className={`text-xs font-medium flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg transition-all ${
                          avesDisponibles > 0
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                            : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {avesDisponibles > 0 ? "check_circle" : "error"}
                        </span>
                        <span>
                          {avesDisponibles > 0
                            ? `Población activa: ${avesDisponibles.toLocaleString()} aves disponibles para este galpón.`
                            : "Este galpón no tiene aves disponibles (población en 0)."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fila: Cantidad, Edad y Causa de Muerte en una sola fila */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-2">
                    {/* Cantidad */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Cantidad de aves muertas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                          setCantidad(e.target.value);
                          setErrorStock("");
                        }}
                        placeholder="0"
                        min="1"
                        max={avesDisponibles > 0 ? avesDisponibles : undefined}
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      />
                      {errorStock && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          {errorStock}
                        </p>
                      )}
                    </div>

                    {/* Edad */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Edad en semanas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        placeholder="Ej: 19"
                        min="1"
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      />
                    </div>

                    {/* Causa */}
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        Causa de Muerte <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={causa}
                        onChange={(e) => setCausa(e.target.value)}
                        placeholder="Ej: Asfixia, estrés térmico..."
                        required
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      />
                    </div>
                  </div>

                  {/* Resultado de Necropsia */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      Resultado de Necropsia <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={necropsia}
                      onChange={(e) => setNecropsia(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 resize-y"
                      placeholder="Describa los hallazgos encontrados..."
                      required
                    />
                  </div>

                  {/* Disposición final */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      Disposición final <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={disposicion}
                      onChange={(e) => setDisposicion(e.target.value)}
                      placeholder="Describa cuál será la disposición final del ave..."
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción en el pie del modal */}
              <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
                <button
                  type="button"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-all"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#49E619] hover:bg-[#3dc407] px-6 text-sm font-bold text-black shadow-md shadow-[#49E619]/20 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}