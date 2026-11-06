import api from "@/services/api";

export default function ModalEliminarUsuario({
  abierto,
  cerrar,
  usuario,
  usuarios,
  setUsuarios,
  setUsuariosFiltrados,
  mostrarMensaje,
}) {
  if (!abierto) return null;

  async function eliminarUsuario() {
    try {
      if (usuario.id && typeof usuario.id === 'number' && usuario.id < 100000000000) {
        await api.delete(`/usuarios/${usuario.id}/`);
      }
    } catch (err) {
      console.warn("Fallo al eliminar en API, aplicando respaldo local:", err);
    }

    const nuevosUsuarios = usuarios.filter((u) => u.id !== usuario.id);

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));

    mostrarMensaje("Usuario eliminado correctamente");

    cerrar();
  }

  return (
    <section
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={cerrar}
    >
      <section
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-800">
          <section className="flex items-center gap-3">
            <section className="size-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">
                warning
              </span>
            </section>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Eliminar Usuario
            </h2>
          </section>
          <button
            type="button"
            onClick={cerrar}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </section>

        <section className="px-5 sm:px-6 py-5 sm:py-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            ¿Está seguro de que desea eliminar permanentemente al usuario{" "}
            <strong className="text-slate-900 dark:text-white font-bold">{usuario?.nombre}</strong>?
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </section>

        <section className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={cerrar}
            className="w-full sm:w-auto h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm transition flex items-center justify-center cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={eliminarUsuario}
            className="w-full sm:w-auto h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center cursor-pointer"
          >
            Eliminar
          </button>
        </section>
      </section>
    </section>
  );
}
