"use client";

import { useState, useEffect } from "react";

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
    }
  }, [usuario]);

  function guardarCambios() {
    const nuevosUsuarios = usuarios.map((u) =>
      u.id === usuario.id
        ? {
            ...u,
            ...datos,
          }
        : u,
    );

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
        className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center"
        onClick={cerrar}
      >
        <section
          className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-sm p-6 overflow-hidden relative "
          onClick={(e) => e.stopPropagation()}
        >
          <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
            <section className="flex items-center gap-2">
              <span className="material-icons text-[#49E619]">edit</span>
              <h2 className="text-lg font-bold justify-center">
                Editar Usuario
              </h2>
            </section>
            <button
              onClick={cerrar}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </section>
          <form>
            <section className="space-y-5 p-6 grid grid-cols-2 ">
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre
                </label>
                <input
                  placeholder="Ingrese el nombre"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.nombre}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      nombre: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  E-mail
                </label>
                <input
                  placeholder="Ingrese el correo electrónico"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.email}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      email: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="Digite el número de celular"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.telefono}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      telefono: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Documento
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el documento de identidad"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.documento}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      documento: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Residencia
                </label>
                <input
                  placeholder="Dirección de residencia"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.residencia}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      residencia: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fecha de ingreso
                </label>
                <input
                  type="date"
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
                  value={datos.fecha}
                  onChange={(e) =>
                    setDatos({
                      ...datos,
                      fecha: e.target.value,
                    })
                  }
                />
              </section>
              <section className="space-y-1.5 p-1 m-0 grid col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Asignar rol
                </label>
                <select
                  className="w-full pl-5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40"
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
            </section>
            <section className="content-end">
              <section className="flex justify-center space-y-1.5">
                <button
                  onClick={cerrar}
                  className="bg-[#e2e8f0] px-5 py-2.5 mr-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>

                <button
                  onClick={guardarCambios}
                  className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
                >
                  Guardar
                </button>
              </section>
            </section>
          </form>
        </section>
      </section>
    </>
  );
}
