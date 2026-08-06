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

  function eliminarUsuario() {
    const nuevosUsuarios = usuarios.filter((u) => u.id !== usuario.id);

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));

    mostrarMensaje("Usuario eliminado correctamente");

    cerrar();
  }

  return (
    <section
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={cerrar}
    >
      <section
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="flex items-center gap-2 border-b pb-4">
          <span className="material-symbols-outlined text-red-500">
            warning
          </span>

          <h2 className="text-xl font-bold">Eliminar Usuario</h2>
        </section>

        <section className="py-6">
          <p className="text-slate-600">
            ¿Está seguro de eliminar al usuario{" "}
            <strong>{usuario?.nombre}</strong>?
          </p>
        </section>

        <section className="flex justify-end gap-3">
          <button
            onClick={cerrar}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
          >
            Cancelar
          </button>

          <button
            onClick={eliminarUsuario}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </section>
      </section>
    </section>
  );
}
