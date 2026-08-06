export default function TablaGestionUsuarios({
  usuarios,
  usuariosCompletos,
  setUsuarios,
  setUsuariosFiltrados,
  setModalEditarAbierto,
  setUsuarioEditar,
  setModalEliminarAbierto,
  setUsuarioEliminar,
}) {
  function eliminarUsuario(id) {
    const nuevosUsuarios = usuarios.filter((u) => u.id !== id);

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));
  }

  function habilitarUsuario(id) {
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
  }

  function deshabilitarUsuario(id) {
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
  }

  function editarUsuario(usuario) {
    setUsuarioEditar(usuario);
    setModalEditarAbierto(true);
  }

  return (
    <>
      <tbody>
        {usuarios.map((u) => (
          <tr
            key={u.id}
            className={u.estado === "INACTIVO" ? "opacity-50" : ""}
          >
            <td className="p-2 font-semibold">{u.nombre}</td>
            <td className="p-2">{u.email}</td>
            <td className="p-2">{u.telefono}</td>
            <td className="p-2">{u.documento}</td>
            <td className="p-2 font-bold">{u.rol}</td>
            <td className="p-2">{u.residencia}</td>
            <td className="p-2">{u.fecha}</td>

            <td className="px-6 py-5 text-right">
              <section className="flex justify-end gap-2">
                <button
                  onClick={() => habilitarUsuario(u.id)}
                  className="p-2 rounded-lg bg-green-100 text-green-500 hover:bg-green-200"
                >
                  <span className="material-symbols-outlined text-lg">
                    check_circle
                  </span>
                </button>

                <button
                  onClick={() => deshabilitarUsuario(u.id)}
                  className="p-2 rounded-lg bg-yellow-100 text-yellow-500 hover:bg-yellow-200"
                >
                  <span className="material-symbols-outlined text-lg">
                    block
                  </span>
                </button>

                <button
                  onClick={() => editarUsuario(u)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-500 hover:bg-blue-200"
                >
                  <span className="material-symbols-outlined text-lg">
                    edit
                  </span>
                </button>

                <button
                  onClick={() => {
                    setUsuarioEliminar(u);
                    setModalEliminarAbierto(true);
                  }}
                  className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                </button>
              </section>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  );
}
