'use client';

import { useState } from "react";

export default function FormGestionUsuarios({
  usuarios,
  setUsuarios,
  setUsuariosFiltrados
}) {

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [residencia, setResidencia] = useState("");
  const [fecha, setFecha] = useState("");
  const [rol, setRol] = useState("");

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

  /* guardar usuarios */
  function guardarUsuario() {
    const usuario = {
      id: Date.now(),
      nombre,
      email,
      telefono,
      documento,
      residencia,
      fecha,
      rol,
      estado: "ACTIVO",
    };

    if (!usuario.nombre || !usuario.email || !usuario.rol) {
      alert("Complete los campos obligatorios");
      return;
    }

    const nuevosUsuarios = [...usuarios, usuario];

    setUsuarios(nuevosUsuarios);
    setUsuariosFiltrados(nuevosUsuarios);
    
    guardarUsuarios(nuevosUsuarios);

    cerrarModal();
    limpiarFormulario();
  }

  /* ===== limpiar formulario ===== */
  function limpiarFormulario() {
    setNombre("");
    setEmail("");
    setTelefono("");
    setDocumento("");
    setResidencia("");
    setFecha("");
    setRol("");
  }

  return (
    <>
      <section className="flex flex-col lg:flex-row gap-4 justify-center">
        <section className="flex gap-3 flex-wrap">
          <button
            onClick={abrirModal}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#58db25] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Añadir Usuario</span>
          </button>
        </section>
      </section>
      {modalAbierto && (
        <section className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center" onClick={cerrarModal}>
          <section className="bg-white border border-slate-200 w-full max-w-2xl rounded-xl shadow-sm p-6 overflow-hidden relative " onClick={(e) => e.stopPropagation()} >
            <section className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-border-dark">
              <section className="flex items-center gap-2">
                <span className='material-icons text-[#49E619]'>add_box</span>
                <h2 className="text-lg font-bold justify-center">
                  Añadir Usuario
                </h2>
              </section>
              <button
                onClick={cerrarModal}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-2 p-6 items-center">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
              <input
                placeholder="Ingrese el nombre"
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
              <input
                placeholder="Ingrese el correo electrónico"
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
              <input
                type="tel"
                placeholder="Digite el número de celular"
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Documento</label>
              <input
                type="text"
                placeholder="Ingrese el documento de identidad"
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Residencia</label>
              <input
                placeholder="Dirección de residencia"
                className="pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={residencia}
                onChange={(e) => setResidencia(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de ingreso</label>
              <input
                type="date"
                className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 "
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Asignar rol</label>
              <select
                className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-lg bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <option value="">Seleccione un rol</option>
                <option value="Instructor lider">Instructor lider</option>
                <option value="Instructor investigador">
                  Instructor investigador
                </option>
                <option value="Aprendiz de contrato">
                  Aprendiz de contrato
                </option>
              </select>
            </section>

            <section className="flex justify-end gap-3 mt-6">
              <button onClick={cerrarModal} className="bg-[#e2e8f0] px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-300 transition-all">
                Cancelar
              </button>

              <button onClick={guardarUsuario} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#49E619] hover:bg-[#3dc407] px-6 font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] transition-all duration-200 ease-in-out">
                Guardar
              </button>
            </section>
          </section>
        </section>
      )}
    </>
  );
}
