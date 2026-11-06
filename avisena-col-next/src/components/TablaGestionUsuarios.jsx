"use client";

import api from "@/services/api";

export default function TablaGestionUsuarios({
  usuarios,
  usuariosCompletos,
  setUsuarios,
  setUsuariosFiltrados,
  setModalEditarAbierto,
  setUsuarioEditar,
  setModalEliminarAbierto,
  setUsuarioEliminar,
  mostrarMensaje,
}) {
  function eliminarUsuario(id) {
    const nuevosUsuarios = usuarios.filter((u) => u.id !== id);

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));
  }

  async function habilitarUsuario(id) {
    const nuevosUsuarios = usuariosCompletos.map((u) =>
      u.id === id ? { ...u, estado: "ACTIVO" } : u,
    );

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados((usuariosActuales) =>
      usuariosActuales.map((u) =>
        u.id === id ? { ...u, estado: "ACTIVO" } : u,
      ),
    );

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));

    // Actualizar estado en la base de datos MySQL mediante la API
    try {
      if (typeof id === 'number' && id < 100000000000) {
        await api.patch(`/usuarios/${id}/`, { estado: 'Activo' });
      }
      if (mostrarMensaje) mostrarMensaje("Usuario habilitado como ACTIVO correctamente");
    } catch (err) {
      console.warn("Fallo al actualizar estado en el servidor:", err);
      if (mostrarMensaje) mostrarMensaje("Estado actualizado en el navegador (servidor no disponible)");
    }
  }

  async function deshabilitarUsuario(id) {
    const nuevosUsuarios = usuariosCompletos.map((u) =>
      u.id === id ? { ...u, estado: "INACTIVO" } : u,
    );

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados((usuariosActuales) =>
      usuariosActuales.map((u) =>
        u.id === id ? { ...u, estado: "INACTIVO" } : u,
      ),
    );

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));

    // Actualizar estado en la base de datos MySQL mediante la API
    try {
      if (typeof id === 'number' && id < 100000000000) {
        await api.patch(`/usuarios/${id}/`, { estado: 'Inactivo' });
      }
      if (mostrarMensaje) mostrarMensaje("Usuario inhabilitado como INACTIVO correctamente");
    } catch (err) {
      console.warn("Fallo al actualizar estado en el servidor:", err);
      if (mostrarMensaje) mostrarMensaje("Estado actualizado en el navegador (servidor no disponible)");
    }
  }

  function editarUsuario(usuario) {
    setUsuarioEditar(usuario);
    setModalEditarAbierto(true);
  }

  return (
    <>
      <tbody>
        {usuarios.length === 0 ? (
          <tr>
            <td colSpan="9" className="py-12 text-center text-slate-500 dark:text-slate-400">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                  person_search
                </span>
                <p className="text-sm font-medium">No se encontraron usuarios</p>
                <p className="text-xs text-slate-400">Intenta cambiar los filtros de búsqueda</p>
              </div>
            </td>
          </tr>
        ) : (
          usuarios.map((u) => {
            const esActivo = (u.estado || "ACTIVO").toUpperCase() === "ACTIVO";
            return (
              <tr
                key={u.id}
                className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                  !esActivo ? "bg-slate-50/40 dark:bg-slate-900/40 opacity-75" : ""
                }`}
              >
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-left font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-slate-900 dark:text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {u.nombre ? u.nombre.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span>{u.nombre}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-left text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {u.email}
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {u.telefono || "-"}
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {u.tipoDoc ? `${u.tipoDoc} ${u.documento}` : u.documento}
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      esActivo
                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {esActivo ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {u.residencia || "-"}
                </td>
                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {u.fecha || "-"}
                </td>

                <td className="px-4 sm:px-5 py-3.5 sm:py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    {!esActivo ? (
                      <button
                        type="button"
                        onClick={() => habilitarUsuario(u.id)}
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-900/60 transition-colors flex items-center justify-center cursor-pointer"
                        title="Habilitar usuario"
                      >
                        <span className="material-symbols-outlined text-lg">
                          check_circle
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => deshabilitarUsuario(u.id)}
                        className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 transition-colors flex items-center justify-center cursor-pointer"
                        title="Inhabilitar usuario"
                      >
                        <span className="material-symbols-outlined text-lg">
                          block
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => editarUsuario(u)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-center cursor-pointer"
                      title="Editar usuario"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUsuarioEliminar(u);
                        setModalEliminarAbierto(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors flex items-center justify-center cursor-pointer"
                      title="Eliminar usuario"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </>
  );
}
