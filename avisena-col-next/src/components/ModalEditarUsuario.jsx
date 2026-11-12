"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

export default function ModalEditarUsuario({
  abierto,
  cerrar,
  usuario,
  roles,
  usuarios,
  setUsuarios,
  setUsuariosFiltrados,
  mostrarMensaje,
}) {
  const [datos, setDatos] = useState({
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    residencia: "",
    fecha: "",
    rol: "",
  });
  const [cambiarPassword, setCambiarPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");

  useEffect(() => {
    if (usuario) {
      setDatos({
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        documento: usuario.documento,
        residencia: usuario.residencia,
        fecha: usuario.fecha,
        rol: usuario.rol,
      });
      setCambiarPassword(false);
      setNuevaPassword("");
      setConfirmarPassword("");
      setMostrarPassword(false);
      setMostrarConfirmarPassword(false);
      setErrorPassword("");
    }
  }, [usuario]);

  async function guardarCambios() {
    if (cambiarPassword) {
      const p1 = nuevaPassword.trim();
      const p2 = confirmarPassword.trim();

      if (!p1) {
        setErrorPassword("Debe ingresar la nueva contraseña");
        return;
      }
      if (p1.length < 8) {
        setErrorPassword("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (p1 !== p2) {
        setErrorPassword("Las contraseñas no coinciden");
        return;
      }
    }

    const payload = { ...datos };
    if (cambiarPassword && nuevaPassword.trim()) {
      payload.password = nuevaPassword.trim();
    }

    let respuestaApi = null;
    if (usuario?.id && Number(usuario.id) < 100000000000) {
      try {
        respuestaApi = await api.patch(`/usuarios/${usuario.id}/`, payload);
      } catch (err) {
        console.warn("Fallo al actualizar usuario en API, guardando en respaldo local:", err);
      }
    }

    const nuevosUsuarios = usuarios.map((u) => {
      if (u.id === usuario.id) {
        const actualizado = {
          ...u,
          ...datos,
          ...(respuestaApi || {}),
          estado: ((respuestaApi?.estado || u.estado || "ACTIVO")).toUpperCase(),
        };
        if (cambiarPassword && nuevaPassword.trim()) {
          actualizado.password = nuevaPassword.trim();
        }
        return actualizado;
      }
      return u;
    });

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);

    localStorage.setItem("usuarios", JSON.stringify(nuevosUsuarios));

    mostrarMensaje("Usuario actualizado correctamente");

    cerrar();
  }

  if (!abierto) return null;
  return (
    <>
      <section
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 p-3 sm:p-6 flex items-center justify-center overflow-y-auto"
        onClick={cerrar}
      >
        <section
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado */}
          <section className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <section className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">edit</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Editar Usuario
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

          {/* Formulario */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              guardarCambios();
            }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <section className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 max-h-[62vh] sm:max-h-[60vh]">
              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Nombre *
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el nombre"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  value={datos.nombre}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      nombre: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  E-mail *
                </label>
                <input
                  type="email"
                  placeholder="Ingrese el correo electrónico"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  value={datos.email}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      email: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Digite el número de celular"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  value={datos.telefono}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      telefono: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Documento
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el documento de identidad"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  value={datos.documento}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      documento: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Residencia
                </label>
                <input
                  type="text"
                  placeholder="Dirección de residencia"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                  value={datos.residencia}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      residencia: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Fecha de ingreso
                </label>
                <input
                  type="date"
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
                  value={datos.fecha}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      fecha: e.target.value,
                    })
                  }
                />
              </section>

              <section className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Asignar rol *
                </label>
                <select
                  className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
                  value={datos.rol}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      rol: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((rolItem) => (
                    <option key={rolItem} value={rolItem}>
                      {rolItem}
                    </option>
                  ))}
                </select>
              </section>

              {/* Opción condicional de restablecimiento de contraseña */}
              <section className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-3 cursor-pointer select-none group py-1">
                  <input
                    type="checkbox"
                    checked={cambiarPassword}
                    onChange={(e) => {
                      setCambiarPassword(e.target.checked);
                      if (!e.target.checked) {
                        setNuevaPassword("");
                        setConfirmarPassword("");
                        setErrorPassword("");
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/40 cursor-pointer accent-[#49E619]"
                  />
                  <section className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-lg">
                      key
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      Restablecer contraseña de este usuario
                    </span>
                  </section>
                </label>

                {cambiarPassword && (
                  <section className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Nueva Contraseña */}
                      <section className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Nueva Contraseña *
                        </label>
                        <aside className="relative">
                          <input
                            type={mostrarPassword ? "text" : "password"}
                            placeholder="Mínimo 4 caracteres"
                            className="w-full h-10 px-3 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                            value={nuevaPassword}
                            onChange={(e) => {
                              setNuevaPassword(e.target.value);
                              if (errorPassword) setErrorPassword("");
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1"
                            title={mostrarPassword ? "Ocultar" : "Mostrar"}
                          >
                            <span className="material-symbols-outlined text-base select-none">
                              {mostrarPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </aside>
                      </section>

                      {/* Confirmar Contraseña */}
                      <section className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Confirmar Contraseña *
                        </label>
                        <aside className="relative">
                          <input
                            type={mostrarConfirmarPassword ? "text" : "password"}
                            placeholder="Repita la contraseña"
                            className="w-full h-10 px-3 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                            value={confirmarPassword}
                            onChange={(e) => {
                              setConfirmarPassword(e.target.value);
                              if (errorPassword) setErrorPassword("");
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1"
                            title={mostrarConfirmarPassword ? "Ocultar" : "Mostrar"}
                          >
                            <span className="material-symbols-outlined text-base select-none">
                              {mostrarConfirmarPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </aside>
                      </section>
                    </section>

                    {errorPassword && (
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5 pt-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errorPassword}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      El usuario deberá iniciar sesión con esta nueva contraseña a partir de su próximo acceso.
                    </p>
                  </section>
                )}
              </section>
            </section>


            {/* Botones de acción */}
            <section className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={cerrar}
                className="w-full sm:w-auto h-11 px-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto h-11 px-6 rounded-lg border-0 bg-primary hover:bg-[#58db25] font-bold text-black text-sm shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Guardar Cambios</span>
              </button>
            </section>
          </form>
        </section>
      </section>
    </>
  );
}

