'use client';

import React from "react";

const ModalHistorial = ({
  isOpen,
  onClose,
  historial = [],
  onExport,
  onDeleteItem,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <article className="relative bg-white dark:bg-zinc-900 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-5xl border border-slate-100 dark:border-zinc-800 animate-slide-up z-10 p-6">
        <header className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-[#0c2317] dark:text-white">
            Historial Completo
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExport && onExport()}
              className="text-sm font-bold text-[#0c2317] bg-[#f1fdf7] dark:bg-emerald-950/10 px-3 py-2 rounded-lg hover:bg-[#e6fbef] transition-colors"
            >
              Exportar
            </button>
            <button
              onClick={() => {
                if (
                  onClear &&
                  window.confirm(
                    "¿Borrar todo el historial? Esta acción no se puede deshacer.",
                  )
                )
                  onClear();
              }}
              className="text-sm font-bold text-white bg-red-500 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Borrar Todo
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 flex cursor-pointer bg-transparent border-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        <section className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfdfd] dark:bg-zinc-900 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest border-b border-slate-50 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Fecha / Edad</th>
                <th className="px-6 py-4">Galpón</th>
                <th className="px-6 py-4 text-center">Huevos</th>
                <th className="px-6 py-4 text-center">Alimento (KG)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
              {historial.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {item.fecha}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.edad}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {item.galpon}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-slate-800 dark:text-slate-200">
                    {item.huevos.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    {item.alimento.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => onDeleteItem && onDeleteItem(idx)}
                      className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer bg-transparent border-none"
                      title="Borrar registro"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                    <button
                      className="text-slate-300 hover:text-[#2ea66d] p-1 transition-colors cursor-pointer bg-transparent border-none"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </article>
    </dialog>
  );
};

export default ModalHistorial;
