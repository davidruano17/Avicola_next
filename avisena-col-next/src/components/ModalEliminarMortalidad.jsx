export default function ModalEliminarMortalidad({
  abierto,
  cerrar,
  registro,
  registros,
  setRegistros,
  mostrarMensaje,
}) {
  if (!abierto) return null;

  function eliminarRegistro() {
    const nuevosRegistros = registros.filter((r) => r.id !== registro.id);

    setRegistros(nuevosRegistros);

    localStorage.setItem(
      "registrosMortalidad",
      JSON.stringify(nuevosRegistros),
    );

    mostrarMensaje("Registro eliminado correctamente");

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

          <h2 className="text-xl font-bold">Eliminar Registro</h2>
        </section>

        <section className="py-6">
          <p className="text-slate-600">
            ¿Está seguro de que desea eliminar el registro de mortalidad por
            causa <strong>{registro?.causa}</strong> del galpón{" "}
            <strong>{registro?.galpon}</strong>?
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
            onClick={eliminarRegistro}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Eliminar
          </button>
        </section>
      </section>
    </section>
  );
}
