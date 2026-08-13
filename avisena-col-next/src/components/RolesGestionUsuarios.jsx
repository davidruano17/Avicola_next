"use client";

import { useState } from "react";

export default function RolesGestionUsuarios({
  roles,
  setRoles,
  usuarios,
  setUsuarios,
  setUsuariosFiltrados,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoRol, setNuevoRol] = useState("");
  const [rolEditando, setRolEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");
  const [modalEliminarRol, setModalEliminarRol] = useState(false);
  const [rolAEliminar, setRolAEliminar] = useState(null);
  const [modalRolEnUso, setModalRolEnUso] = useState(false);

  function abrirModal() {
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setNuevoRol("");
  }

  const agregarRol = () => {
    if (!nuevoRol.trim()) return;

    if (
      roles.some((rol) => rol.toLowerCase() === nuevoRol.trim().toLowerCase())
    ) {
      alert("Ese rol ya existe");
      return;
    }

    const nuevosRoles = [...roles, nuevoRol.trim()];

    setRoles(nuevosRoles);
    localStorage.setItem("roles", JSON.stringify(nuevosRoles));

    setNuevoRol("");
    cerrarModal();
  };

  const eliminarRol = (rolEliminar) => {
    const usuariosConRol = usuarios.filter(
      (usuario) => usuario.rol === rolEliminar,
    );

    if (usuariosConRol.length > 0) {
      setRolAEliminar(rolEliminar);
      setModalRolEnUso(true);
      return;
    }

    setRolAEliminar(rolEliminar);
    setModalEliminarRol(true);
  };

  const confirmarEliminarRol = () => {
    if (!rolAEliminar) return;

    const nuevosRoles = roles.filter((rol) => rol !== rolAEliminar);

    setRoles(nuevosRoles);

    localStorage.setItem("roles", JSON.stringify(nuevosRoles));

    setModalEliminarRol(false);
    setRolAEliminar(null);
  };

  const editarRol = (rol) => {
    setRolEditando(rol);
    setNombreEditado(rol);
  };

  const guardarEdicion = (rolViejo) => {
    if (!nombreEditado.trim()) return;

    if (nombreEditado.trim() === rolViejo) {
      setRolEditando(null);
      setNombreEditado("");
      return;
    }

    if (
      roles.some(
        (rol) =>
          rol.toLowerCase() === nombreEditado.trim().toLowerCase() &&
          rol !== rolViejo,
      )
    ) {
      alert("Ese rol ya existe");
      return;
    }

    const nuevosRoles = roles.map((rol) =>
      rol === rolViejo ? nombreEditado.trim() : rol,
    );
    const usuariosActualizados = usuarios.map((usuario) =>
      usuario.rol === rolViejo
        ? { ...usuario, rol: nombreEditado.trim() }
        : usuario,
    );

    setUsuarios(usuariosActualizados);
    setUsuariosFiltrados(usuariosActualizados);
    localStorage.setItem("usuarios", JSON.stringify(usuariosActualizados));

    setRoles(nuevosRoles);
    localStorage.setItem("roles", JSON.stringify(nuevosRoles));

    setRolEditando(null);
    setNombreEditado("");
  };

  return (
    <>
      <section className="flex flex-col lg:flex-row gap-4 justify-center">
        <section className="flex gap-3 flex-wrap">
          <button
            onClick={abrirModal}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#58db25] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined">badge</span>
            <span>Roles</span>
          </button>
        </section>
      </section>
      {modalAbierto && (
        <section
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={cerrarModal}
        >
          <section
            className="bg-white border border-slate-200 w-max rounded-xl shadow-sm p-6 overflow-hidden relative "
            onClick={(e) => e.stopPropagation()}
          >
            <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
              <section className="flex items-center gap-2">
                <span className="material-icons text-[#49E619]">badge</span>
                <h2 className="text-lg font-bold justify-center">
                  Gestión de Roles
                </h2>
              </section>
              <button
                onClick={cerrarModal}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </section>

            {/* Lista de roles */}
            <section className="w-max grid grid-cols-1 md:grid-cols-3 gap-2 p-6 items-center">
              {roles.map((rol) => (
                <section
                  key={rol}
                  className="flex justify-between items-center pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                >
                  {rolEditando === rol ? (
                    <>
                      <input
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                      />
                      <section className="flex gap-2 p-2">
                        <button onClick={() => guardarEdicion(rol)}>💾</button>
                        <button onClick={() => setRolEditando(null)}>❌</button>
                      </section>
                    </>
                  ) : (
                    <>
                      <span>{rol}</span>
                      <section className="flex gap-2 p-2">
                        <button onClick={() => editarRol(rol)}>✏️</button>

                        <button onClick={() => eliminarRol(rol)}>🗑️</button>
                      </section>
                    </>
                  )}
                </section>
              ))}
            </section>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-2 p-6 items-center">
              <label className="block text-l text-center font-medium text-slate-700 dark:text-slate-300">
                Añade un nuevo rol
              </label>
              <input
                type="text"
                placeholder="Nuevo rol"
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
              />
              <button
                onClick={agregarRol}
                className="flex ml-4 h-12 w-max cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
              >
                Agregar
              </button>
            </section>
          </section>
        </section>
      )}
      {modalEliminarRol && (
        <section
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center px-4"
          onClick={() => {
            setModalEliminarRol(false);
            setRolAEliminar(null);
          }}
        >
          <section
            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <section className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <section className="flex items-center gap-3">
                <section className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600">
                    warning
                  </span>
                </section>
                <h2 className="text-lg font-bold text-slate-800">
                  Eliminar rol
                </h2>
              </section>
              <button
                onClick={() => {
                  setModalEliminarRol(false);
                  setRolAEliminar(null);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </section>
            <section className="px-6 py-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                ¿Está seguro de que desea eliminar el rol{" "}
                <strong className="text-slate-900">"{rolAEliminar}"</strong>?
              </p>
            </section>

            {/* Botones */}
            <section className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setModalEliminarRol(false);
                  setRolAEliminar(null);
                }}
                className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarEliminarRol}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </section>
          </section>
        </section>
      )}
      {modalRolEnUso && (
        <section
          className="fixed inset-0 bg-black/50 z-70 flex items-center justify-center px-4"
          onClick={() => {
            setModalRolEnUso(false);
            setRolAEliminar(null);
          }}
        >
          <section
            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <section className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <section className="flex items-center gap-3">
                <section className="size-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600">
                    warning
                  </span>
                </section>
                <h2 className="text-lg font-bold text-slate-800">
                  No se puede eliminar
                </h2>
              </section>
              <button
                onClick={() => {
                  setModalRolEnUso(false);
                  setRolAEliminar(null);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </section>
            <section className="px-6 py-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                El rol{" "}
                <strong className="text-slate-900">"{rolAEliminar}"</strong> no
                puede eliminarse porque está asignado a uno o más usuarios.
              </p>
              <p className="text-slate-500 text-sm mt-3">
                Para eliminar este rol, primero debes asignar otro rol a los
                usuarios que lo tienen actualmente.
              </p>
            </section>
            <section className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setModalRolEnUso(false);
                  setRolAEliminar(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#49E619] text-black font-semibold hover:bg-[#3dc407] transition"
              >
                Entendido
              </button>
            </section>
          </section>
        </section>
      )}
    </>
  );
}
