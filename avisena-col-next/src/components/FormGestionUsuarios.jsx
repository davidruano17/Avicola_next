"use client";

import { useState } from "react";
import api from "@/services/api";

export default function FormGestionUsuarios({
  usuarios,
  setUsuarios,
  setUsuariosFiltrados,
  roles,
  setRoles,
  mostrarMensaje,
  setPaginaActual,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [residencia, setResidencia] = useState("");
  const [fecha, setFecha] = useState("");
  const [rol, setRol] = useState("");
  const [tipoDoc, setTipoDoc] = useState("CC");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  function abrirModal() {
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    limpiarFormulario();
  }

  function guardarUsuarios(data) {
    localStorage.setItem("usuarios", JSON.stringify(data));
  }

  async function guardarUsuario() {
    const usuario = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim() || "3000000000",
      documento: documento.trim() || String(Date.now()).slice(-8),
      residencia: residencia.trim() || "Granja Avícola",
      fecha: fecha || new Date().toISOString().split('T')[0],
      rol,
      tipoDoc: tipoDoc || "CC",
      password: password.trim(),
      estado: "ACTIVO",
    };

    if (!usuario.nombre || !usuario.email || !usuario.rol || !usuario.password) {
      alert("Complete los campos obligatorios: Nombre, Correo electrónico, Contraseña y Rol");
      return;
    }

    if (usuario.password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      const res = await api.post('/usuarios/', usuario);
      const usuarioFinal = res?.id
        ? { ...res, estado: (res.estado || 'ACTIVO').toUpperCase() }
        : { ...usuario, id: Date.now(), estado: 'ACTIVO' };
      const nuevosUsuarios = [...usuarios, usuarioFinal];
      setUsuarios(nuevosUsuarios);
      setUsuariosFiltrados(nuevosUsuarios);
      setPaginaActual(Math.ceil(nuevosUsuarios.length / 5));
      guardarUsuarios(nuevosUsuarios);
      mostrarMensaje("Usuario registrado correctamente en la base de datos");
      cerrarModal();
      limpiarFormulario();
    } catch (err) {
      console.warn("Fallo al crear usuario:", err?.message || err);
      alert(err?.message || "No se pudo registrar el usuario. Verifique los datos ingresados.");
    }
  }

  function limpiarFormulario() {
    setNombre("");
    setEmail("");
    setTelefono("");
    setDocumento("");
    setResidencia("");
    setFecha("");
    setRol("");
    setTipoDoc("CC");
    setPassword("");
    setMostrarPassword(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        className="flex h-11 w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-primary hover:bg-[#58db25] px-5 text-sm font-bold text-black shadow-[0_4px_12px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-xl">person_add</span>
        <span>Añadir Usuario</span>
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
                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Añadir Nuevo Usuario
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

            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                guardarUsuario();
              }}
              className="flex flex-col flex-1 min-h-0"
            >
              <section className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 overflow-y-auto max-h-[62vh] sm:max-h-[60vh]">
                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese el nombre completo"
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </section>

                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    placeholder="Ingrese el correo electrónico"
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </section>

                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Tipo de Documento
                  </label>
                  <select
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
                    value={tipoDoc}
                    onChange={(e) => setTipoDoc(e.target.value)}
                  >
                    <option value="">Seleccione el tipo de documento</option>
                    <option value="CC">CC - Cédula de ciudadanía</option>
                    <option value="TI">TI - Tarjeta de identidad</option>
                    <option value="CE">CE - Cédula de extranjería</option>
                    <option value="PPT">PPT - Permiso por protección temporal</option>
                    <option value="PASAPORTE">PASAPORTE - Pasaporte</option>
                  </select>
                </section>

                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    No. Documento de Identidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese el documento de identidad"
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
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
                    value={residencia}
                    onChange={(e) => setResidencia(e.target.value)}
                  />
                </section>

                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Fecha de ingreso
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </section>

                <section className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Asignar Rol *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    required
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rolItem) => (
                      <option key={rolItem} value={rolItem}>
                        {rolItem}
                      </option>
                    ))}
                  </select>
                </section>

                <section className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Asignar Contraseña *
                  </label>
                  <aside className="relative">
                    <input
                      type={mostrarPassword ? "text" : "password"}
                      placeholder="Ingrese una contraseña para el usuario (mínimo 8 caracteres)"
                      className="w-full h-11 pl-3.5 pr-11 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/50 placeholder:text-slate-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword(!mostrarPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {mostrarPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </aside>
                </section>
              </section>

              {/* Botones de acción */}
              <section className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-[#58db25] text-black font-bold text-sm shadow-[0_4px_12px_rgba(73,230,25,0.25)] transition-all duration-200 flex items-center justify-center cursor-pointer"
                >
                  Guardar Usuario
                </button>
              </section>
            </form>
          </section>
        </section>
      )}
    </>
  );
}
