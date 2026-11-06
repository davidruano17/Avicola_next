export default function ModalEliminarMortalidad({
  abierto,
  cerrar,
  registro,
  eliminarRegistro,
  mostrarMensaje,
}) {
  if (!abierto) return null;

  function confirmarEliminacion() {
    eliminarRegistro(registro);
    cerrar();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={cerrar}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-5 sm:p-6 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="size-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Eliminar Registro
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ¿Está seguro de que desea eliminar el registro de mortalidad por
            causa <strong className="text-slate-900 dark:text-white font-semibold">{registro?.causa}</strong> del galpón{" "}
            <strong className="text-slate-900 dark:text-white font-semibold">{registro?.galpon}</strong>?
          </p>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">restore</span>
            <span>
              Al eliminar este registro, se reincorporarán <strong>{registro?.cantidad} aves</strong> al inventario activo del Galpón <strong>{registro?.galpon}</strong>.
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={cerrar}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarEliminacion}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            <span>Eliminar Registro</span>
          </button>
        </div>
      </div>
    </div>
  );
}
