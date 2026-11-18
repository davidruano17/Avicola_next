"use client";

import { useState } from "react";
import api from "@/services/api";

export default function RolesGestionUsuarios({
  roles,
  setRoles,
  rolesObjetos = [],
  setRolesObjetos,
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

  const agregarRol = async () => {
    if (!nuevoRol.trim()) return;

    if (
      roles.some((rol) => rol.toLowerCase() === nuevoRol.trim().toLowerCase())
    ) {
      alert("Ese rol ya existe");
      return;
    }

    try {
      const creado = await api.post('/roles/', { nombre: nuevoRol.trim() });
      if (creado && setRolesObjetos) {
        const nuevosObj = [...rolesObjetos, creado];
        setRolesObjetos(nuevosObj);
        localStorage.setItem("roles_objetos", JSON.stringify(nuevosObj));
      }
    } catch (err) {
      console.warn("Fallo al registrar rol en API, guardando en respaldo:", err);
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

  const confirmarEliminarRol = async () => {
    if (!rolAEliminar) return;

    const rolObj = rolesObjetos.find(
      (r) => (r.nombre || r.rol_nombre || "").toLowerCase() === rolAEliminar.toLowerCase()
    );
    const rolId = rolObj?.id || rolObj?.rol_id;
    if (rolId) {
      try {
        await api.delete(`/roles/${rolId}/`);
      } catch (err) {
        console.warn("Fallo al eliminar rol en API, actualizando respaldo local:", err);
      }
    }

    if (setRolesObjetos) {
      const nuevosObj = rolesObjetos.filter(
        (r) => (r.nombre || r.rol_nombre || "").toLowerCase() !== rolAEliminar.toLowerCase()
      );
      setRolesObjetos(nuevosObj);
      localStorage.setItem("roles_objetos", JSON.stringify(nuevosObj));
    }

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

  const guardarEdicion = async (rolViejo) => {
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

    const rolObj = rolesObjetos.find(
      (r) => (r.nombre || r.rol_nombre || "").toLowerCase() === rolViejo.toLowerCase()
    );
    const rolId = rolObj?.id || rolObj?.rol_id;
    if (rolId) {
      try {
        await api.put(`/roles/${rolId}/`, { nombre: nombreEditado.trim() });
      } catch (err) {
        console.warn("Fallo al editar rol en API, actualizando respaldo local:", err);
      }
    }

    if (setRolesObjetos) {
      const nuevosObj = rolesObjetos.map((r) =>
        (r.nombre || r.rol_nombre || "").toLowerCase() === rolViejo.toLowerCase()
          ? { ...r, nombre: nombreEditado.trim(), rol_nombre: nombreEditado.trim() }
          : r
      );
      setRolesObjetos(nuevosObj);
      localStorage.setItem("roles_objetos", JSON.stringify(nuevosObj));
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
      <button
        type="button"
        onClick={abrirModal}
        className="flex h-11 w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#58db25] px-5 text-sm font-bold text-black shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-xl">badge</span>
        <span>Roles</span>
      </button>
      {modalAbierto && (
        <section
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 p-3 sm:p-6 flex items-center justify-center overflow-y-auto"
          onClick={cerrarModal}
        >
          <section
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <section className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <section className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">badge</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Gestión de Roles
                </h2>
              </section>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </section>

            {/* Cuerpo del modal con scroll */}
            <section className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 flex flex-col">
              {/* Lista de roles */}
              <section className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Roles Existentes ({roles.length})
                </label>
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
                  {roles.map((rol) => (
                    <section
                      key={rol}
                      className="flex items-center justify-between gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60 transition-all"
                    >
                      {rolEditando === rol ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="flex-1 h-9 px-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#49E619]/50"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => guardarEdicion(rol)}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 transition-colors flex items-center justify-center"
                            title="Guardar"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRolEditando(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center"
                            title="Cancelar"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate pr-2">
                            {rol}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => editarRol(rol)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                              title="Editar rol"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarRol(rol)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                              title="Eliminar rol"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </section>
                  ))}
                </section>
              </section>

              {/* Formulario para añadir rol */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  agregarRol();
                }}
                className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2"
              >
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Añadir un nuevo rol
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del nuevo rol..."
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="flex-1 h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto h-11 px-6 rounded-lg bg-primary hover:bg-[#58db25] font-bold text-black text-sm shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Agregar</span>
                  </button>
                </div>
              </form>
            </section>
          </section>
        </section>
      )}

      {/* Modal Confirmación de Eliminación */}
      {modalEliminarRol && (
        <section
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4"
          onClick={() => {
            setModalEliminarRol(false);
            setRolAEliminar(null);
          }}
        >
          <section
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <section className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <section className="flex items-center gap-3">
                <section className="size-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                  <span className="material-symbols-outlined text-2xl">
                    warning
                  </span>
                </section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Eliminar rol
                </h2>
              </section>
              <button
                type="button"
                onClick={() => {
                  setModalEliminarRol(false);
                  setRolAEliminar(null);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </section>
            <section className="px-6 py-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                ¿Está seguro de que desea eliminar el rol{" "}
                <strong className="text-slate-900 dark:text-white font-bold">"{rolAEliminar}"</strong>?
              </p>
            </section>

            {/* Botones */}
            <section className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setModalEliminarRol(false);
                  setRolAEliminar(null);
                }}
                className="w-full sm:w-auto h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-sm transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarEliminarRol}
                className="w-full sm:w-auto h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition shadow-sm"
              >
                Eliminar
              </button>
            </section>
          </section>
        </section>
      )}

      {/* Modal Rol en Uso */}
      {modalRolEnUso && (
        <section
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-70 flex items-center justify-center p-4"
          onClick={() => {
            setModalRolEnUso(false);
            setRolAEliminar(null);
          }}
        >
          <section
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <section className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <section className="flex items-center gap-3">
                <section className="size-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <span className="material-symbols-outlined text-2xl">
                    lock
                  </span>
                </section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  No se puede eliminar
                </h2>
              </section>
              <button
                type="button"
                onClick={() => {
                  setModalRolEnUso(false);
                  setRolAEliminar(null);
                }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </section>
            <section className="px-6 py-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                El rol{" "}
                <strong className="text-slate-900 dark:text-white font-bold">"{rolAEliminar}"</strong> no
                puede eliminarse porque está asignado a uno o más usuarios.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
                Para eliminar este rol, primero debes asignar otro rol a los
                usuarios que lo tienen actualmente.
              </p>
            </section>
            <section className="flex justify-end px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setModalRolEnUso(false);
                  setRolAEliminar(null);
                }}
                className="w-full sm:w-auto h-10 px-5 rounded-lg bg-primary hover:bg-[#58db25] text-black font-bold text-sm shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition"
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
