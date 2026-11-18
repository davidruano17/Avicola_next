"use client";

import { useState, useEffect } from "react";

export default function ModalEditarMortalidad({
  abierto,
  cerrar,
  registro,
  galpones = [],
  editarRegistro,
  mostrarMensaje,
}) {
  const [datos, setDatos] = useState({
    galpon: "",
    cantidad: "",
    edad: "",
    causa: "",
    necropsia: "",
    disposicion: "",
  });
  const [errorStock, setErrorStock] = useState("");

  const limpiarGalponStr = (val) =>
    String(val ?? "")
      .replace(/^galp[oó]n\s*/i, "")
      .replace(/^0+/, "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    if (registro) {
      const galponLimpio =
        String(registro.galpon ?? "")
          .replace(/^galp[oó]n\s*/i, "")
          .replace(/^0+/, "")
          .trim() || String(registro.galpon ?? "");
      setDatos({
        galpon: galponLimpio,
        cantidad: registro.cantidad,
        edad: registro.edad,
        causa: registro.causa,
        necropsia: registro.necropsia,
        disposicion: registro.disposicion,
      });
      setErrorStock("");
    }
  }, [registro]);

  const galponSeleccionado = galpones.find(
    (g) =>
      limpiarGalponStr(g.galp_numero_galpon ?? g.galpon) === limpiarGalponStr(datos.galpon) ||
      limpiarGalponStr(g.lote) === limpiarGalponStr(datos.galpon) ||
      String(g.id) === String(datos.galpon)
  );

  // Si es el mismo galpón original, el límite es el saldo actual + las aves de este registro
  const esMismoGalpon =
    registro &&
    (String(registro.galpon).trim().toLowerCase() === String(datos.galpon).trim().toLowerCase() ||
      String(registro.galpon).trim().replace(/^0+/, "") ===
        String(datos.galpon).trim().replace(/^0+/, ""));

  const avesBaseGalpon = Number(
    galponSeleccionado?.numeroAves ?? galponSeleccionado?.numerodeaves ?? 0
  );

  const avesDisponiblesParaEditar = esMismoGalpon
    ? avesBaseGalpon + Number(registro?.cantidad || 0)
    : avesBaseGalpon;

  function guardarCambios() {
    if (!registro) return;

    if (!galponSeleccionado) {
      setErrorStock("Por favor seleccione un galpón válido.");
      return;
    }

    const nuevaCant = Number(datos.cantidad);
    if (nuevaCant <= 0) {
      setErrorStock("La cantidad de aves debe ser al menos 1.");
      return;
    }

    if (nuevaCant > avesDisponiblesParaEditar) {
      setErrorStock(
        `No puedes registrar más de ${avesDisponiblesParaEditar.toLocaleString()} aves muertas para este galpón.`
      );
      return;
    }

    const registroActualizado = {
      ...registro,
      ...datos,
      galpon: galponSeleccionado.galpon || datos.galpon,
      galponId: galponSeleccionado.id || registro.galponId || null,
      cantidad: nuevaCant,
      edad: Number(datos.edad),
    };

    editarRegistro(registroActualizado, registro);
    cerrar();
  }

  if (!abierto) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          {/* Cabecera del Modal */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-xl">edit</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Editar Registro de Mortalidad
              </h2>
            </div>
            <button
              type="button"
              onClick={cerrar}
              className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Formulario scrolleable */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              guardarCambios();
            }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Galpón */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    Galpón donde se produjo la mortalidad <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                    required
                    value={datos.galpon}
                    onChange={(e) => {
                      setDatos({
                        ...datos,
                        galpon: e.target.value,
                      });
                      setErrorStock("");
                    }}
                  >
                    <option value="">Seleccione el galpón...</option>
                    {galpones.map((g) => {
                      const nombre = g.galpon || g.lote || `ID ${g.id}`;
                      const aves = Number(g.numeroAves ?? g.numerodeaves ?? 0);
                      return (
                        <option key={g.id || nombre} value={nombre}>
                          Galpón {nombre} ({aves.toLocaleString()} aves disponibles)
                        </option>
                      );
                    })}
                  </select>

                  {/* Indicador de aves disponibles para este registro */}
                  {galponSeleccionado && (
                    <div
                      className={`text-xs font-medium flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg transition-all ${
                        avesDisponiblesParaEditar > 0
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {avesDisponiblesParaEditar > 0 ? "check_circle" : "error"}
                      </span>
                      <span>
                        {avesDisponiblesParaEditar > 0
                          ? `Aves disponibles para este registro: ${avesDisponiblesParaEditar.toLocaleString()} aves.`
                          : "Este galpón no tiene aves disponibles."}
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
                      placeholder="0"
                      min="1"
                      max={avesDisponiblesParaEditar > 0 ? avesDisponiblesParaEditar : undefined}
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      value={datos.cantidad}
                      onChange={(e) => {
                        setDatos({
                          ...datos,
                          cantidad: e.target.value,
                        });
                        setErrorStock("");
                      }}
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
                      min="1"
                      required
                      placeholder="Ej: 19"
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      value={datos.edad}
                      onChange={(e) =>
                        setDatos({
                          ...datos,
                          edad: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Causa */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      Causa de Muerte <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ingrese la causa de mortalidad..."
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      value={datos.causa}
                      onChange={(e) =>
                        setDatos({
                          ...datos,
                          causa: e.target.value,
                        })
                      }
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
                    required
                    placeholder="Describa los hallazgos encontrados..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 resize-y"
                    value={datos.necropsia}
                    onChange={(e) =>
                      setDatos({
                        ...datos,
                        necropsia: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Disposición final */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    Disposición final <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describa cuál será la disposición final del ave..."
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 resize-y"
                    value={datos.disposicion}
                    onChange={(e) =>
                      setDatos({
                        ...datos,
                        disposicion: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
              <button
                type="button"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-all"
                onClick={cerrar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[#49E619] hover:bg-[#3dc407] px-6 text-sm font-bold text-black shadow-md shadow-[#49E619]/20 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
