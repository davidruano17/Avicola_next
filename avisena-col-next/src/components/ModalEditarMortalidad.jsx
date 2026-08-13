"use client";

import { useState, useEffect } from "react";

export default function ModalEditarMortalidad({
  abierto,
  cerrar,
  registro,
  registros,
  setRegistros,
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
  useEffect(() => {
    if (registro) {
      setDatos({
        galpon: registro.galpon,
        cantidad: registro.cantidad,
        edad: registro.edad,
        causa: registro.causa,
        necropsia: registro.necropsia,
        disposicion: registro.disposicion,
      });
    }
  }, [registro]);

  function guardarCambios() {
    if (!registro) return;

    const nuevosRegistros = registros.map((r) =>
      r.id === registro.id
        ? {
            ...r,
            ...datos,
            cantidad: Number(datos.cantidad),
            edad: Number(datos.edad),
          }
        : r,
    );

    setRegistros(nuevosRegistros);

    localStorage.setItem(
      "registrosMortalidad",
      JSON.stringify(nuevosRegistros),
    );
    mostrarMensaje("Registro actualizado correctamente");

    cerrar();
  }

  if (!abierto) return null;
  return (
    <>
      <section
        className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center"
      >
        <section
          className="bg-white border border-slate-200 w-full max-w-4xl rounded-xl shadow-sm p-6 overflow-hidden relative "
        >
          <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
            <section className="flex items-center gap-2">
              <span className="material-icons text-primary">edit</span>
              <h2 className="text-lg font-bold justify-center">
                Editar registro de mortalidad
              </h2>
            </section>
            <button
              onClick={cerrar}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </section>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              guardarCambios();
            }}
          >
            <section className="space-y-5 p-6 grid grid-cols-2 ">
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Galpón donde se produjo la mortalidad{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  required
                  value={datos.galpon}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      galpon: e.target.value,
                    })
                  }
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
                  placeholder="0"
                  min="1"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.cantidad}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      cantidad: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Edad en semanas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Ingrese la edad en semanas de las aves. Ej: 19"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.edad}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      edad: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Causa de Muerte <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ingrese la causa de mortalidad..."
                  required
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.causa}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      causa: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Resultado de Necropsia <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="Describa los hallazgos encontrados..."
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.necropsia}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      necropsia: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Disposición final <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Describa cuál será la disposición final del ave..."
                  required
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.disposicion}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      disposicion: e.target.value,
                    })
                  }
                />
              </section>
            </section>
            <section className="content-end">
              <section className="flex justify-center space-y-1.5">
                <button
                  type="button"
                  className="bg-[#e2e8f0] px-5 py-2.5 mr-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                  onClick={cerrar}
                >
                  Cancelar
                </button>
                <button
                  className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-primary hover:bg-[#58db25] px-6 font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
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
    </>
  );
}
