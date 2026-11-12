"use client";

export default function ModalConfirmacionEliminar({
  abierto,
  cerrar,
  confirmar,
  titulo = "Confirmar eliminación",
  mensaje,
  textoConfirmar = "Eliminar",
}) {
  if (!abierto) return null;

  const confirmarEliminacion = () => {
    confirmar();
    cerrar();
  };

  return (
    <section
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={cerrar}
    >
      <section
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <section className="flex items-center gap-2 border-b pb-4">
          <span className="material-symbols-outlined text-red-500">
            warning
          </span>
          <h2 className="text-xl font-bold">{titulo}</h2>
        </section>

        <section className="py-6">
          <p className="text-slate-600 whitespace-pre-line">{mensaje}</p>
        </section>

        <section className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrar}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarEliminacion}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            {textoConfirmar}
          </button>
        </section>
      </section>
    </section>
  );
}
