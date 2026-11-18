"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import FiltrosGestionUsuarios from "@/components/FiltrosGestionUsuarios";
import FormGestionUsuarios from "@/components/FormGestionUsuarios";
import TablaGestionUsuarios from "@/components/TablaGestionUsuarios";
import RolesGestionUsuarios from "@/components/RolesGestionUsuarios";
import ModalEditarUsuario from "@/components/ModalEditarUsuario";
import ModalEliminarUsuario from "@/components/ModalEliminarUsuario";

export default function Page() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

  const [roles, setRoles] = useState([
    "Instructor lider",
    "Instructor investigador",
    "Aprendiz de contrato",
  ]);
  const [rolesObjetos, setRolesObjetos] = useState([]);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;
  const ultimoUsuario = paginaActual * usuariosPorPagina;
  const primerUsuario = ultimoUsuario - usuariosPorPagina;
  const usuariosOrdenados = [...usuariosFiltrados].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );
  const usuariosPaginados = usuariosOrdenados.slice(
    primerUsuario,
    ultimoUsuario,
  );
  const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina);

  function mostrarMensaje(mensaje) {
    setMensajeToast(mensaje);
    setMostrarToast(true);

    setTimeout(() => {
      setMostrarToast(false);
    }, 3000);
  }

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/usuarios/').catch(() => null),
          api.get('/roles/').catch(() => null)
        ]);

        const usersListRaw = Array.isArray(usersRes) ? usersRes : (usersRes?.results || []);
        if (usersListRaw.length > 0) {
          const usersList = usersListRaw.map((u) => ({
            ...u,
            estado: (u.estado || "ACTIVO").toUpperCase(),
          }));
          // Preservar usuarios locales creados sin conexión pendientes de sincronizar
          const guardados = (JSON.parse(localStorage.getItem("usuarios")) || []).map((u) => ({
            ...u,
            estado: (u.estado || "ACTIVO").toUpperCase(),
          }));
          const pendientesLocales = guardados.filter(g =>
            !usersList.some(u => String(u.id) === String(g.id)) &&
            (typeof g.id === 'string' && g.id.startsWith('temp_') || Number(g.id) > 100000000000)
          );
          const combinados = [...pendientesLocales, ...usersList];
          setUsuarios(combinados);
          setUsuariosFiltrados(combinados);
          localStorage.setItem("usuarios", JSON.stringify(combinados));
        } else {
          const datos = (JSON.parse(localStorage.getItem("usuarios")) || []).map((u) => ({
            ...u,
            estado: (u.estado || "ACTIVO").toUpperCase(),
          }));
          setUsuarios(datos);
          setUsuariosFiltrados(datos);
        }

        const rolesList = Array.isArray(rolesRes) ? rolesRes : (rolesRes?.results || []);
        if (rolesList.length > 0) {
          setRolesObjetos(rolesList);
          localStorage.setItem("roles_objetos", JSON.stringify(rolesList));
          const nombres = rolesList.map(r => r.nombre || r.rol_nombre || r);
          setRoles(nombres);
          localStorage.setItem("roles", JSON.stringify(nombres));
        } else {
          const rolesGuardados = JSON.parse(localStorage.getItem("roles"));
          if (rolesGuardados) setRoles(rolesGuardados);
          const rolesObjGuardados = JSON.parse(localStorage.getItem("roles_objetos") || "[]");
          if (rolesObjGuardados.length > 0) setRolesObjetos(rolesObjGuardados);
        }
      } catch (err) {
        const datos = (JSON.parse(localStorage.getItem("usuarios")) || []).map((u) => ({
          ...u,
          estado: (u.estado || "ACTIVO").toUpperCase(),
        }));
        setUsuarios(datos);
        setUsuariosFiltrados(datos);
      }
    }

    cargarDatos();
  }, []);

  const total = usuarios.length;
  const activos = usuarios.filter((u) => (u.estado || "ACTIVO").toUpperCase() === "ACTIVO").length;
  const inactivos = usuarios.filter((u) => (u.estado || "").toUpperCase() === "INACTIVO").length;

  return (
    <>
      <section className=" font-sans text-slate-900 dark:text-slate-100 min-h-screen">
        <section className="flex h-full grow flex-col">
          <main className="w-full max-w-10xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
            <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
              <section className="flex flex-col gap-1 max-w-2xl">
                <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                  Gestión de Usuarios
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-normal">
                  Administra el acceso al sistema, los roles y los datos del
                  personal encargado de las operaciones avícolas
                </p>
              </section>
              <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
                <FormGestionUsuarios
                  usuarios={usuarios}
                  setUsuarios={setUsuarios}
                  setUsuariosFiltrados={setUsuariosFiltrados}
                  roles={roles}
                  setRoles={setRoles}
                  mostrarMensaje={mostrarMensaje}
                  setPaginaActual={setPaginaActual}
                />
                <RolesGestionUsuarios
                  roles={roles}
                  setRoles={setRoles}
                  rolesObjetos={rolesObjetos}
                  setRolesObjetos={setRolesObjetos}
                  usuarios={usuarios}
                  setUsuarios={setUsuarios}
                  setUsuariosFiltrados={setUsuariosFiltrados}
                />
              </section>
            </section>
            <FiltrosGestionUsuarios
              usuarios={usuarios}
              setUsuariosFiltrados={setUsuariosFiltrados}
              roles={roles}
              setPaginaActual={setPaginaActual}
            />
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <section className="overflow-x-auto w-full">
                <table className="min-w-[950px] w-full text-center border-collapse">
                  <thead className="bg-slate-50/90 dark:bg-slate-800/80 sticky top-0 text-center backdrop-blur-xs">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                        Nombre
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                        E-mail
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Teléfono
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Número de Documento
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Rol
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Estado
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Residencia
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Fecha de ingreso
                      </th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <TablaGestionUsuarios
                    usuarios={usuariosPaginados}
                    setUsuarios={setUsuarios}
                    setUsuariosFiltrados={setUsuariosFiltrados}
                    setModalEditarAbierto={setModalEditarAbierto}
                    setUsuarioEditar={setUsuarioEditar}
                    setModalEliminarAbierto={setModalEliminarAbierto}
                    setUsuarioEliminar={setUsuarioEliminar}
                    usuariosCompletos={usuarios}
                    mostrarMensaje={mostrarMensaje}
                  />
                </table>
              </section>
              {usuariosFiltrados.length > 0 && (
                <section className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
                    Mostrando {primerUsuario + 1} a{" "}
                    {Math.min(ultimoUsuario, usuariosFiltrados.length)} de{" "}
                    {usuariosFiltrados.length} usuarios
                  </p>

                  <section className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPaginaActual((pagina) => Math.max(pagina - 1, 1))
                      }
                      disabled={paginaActual === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined">
                        chevron_left
                      </span>
                    </button>

                    <span className="px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Página {paginaActual} de {totalPaginas}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPaginaActual((pagina) =>
                          Math.min(pagina + 1, totalPaginas),
                        )
                      }
                      disabled={paginaActual === totalPaginas}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined">
                        chevron_right
                      </span>
                    </button>
                  </section>
                </section>
              )}
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-start sm:justify-center gap-4">
                <section className="size-12 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                  <span className="material-symbols-outlined text-3xl">
                    groups
                  </span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Total Usuarios
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-left sm:text-center">
                    {total}
                  </h3>
                </section>
              </section>
              <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-start sm:justify-center gap-4">
                <section className="size-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] shrink-0">
                  <span className="material-symbols-outlined text-3xl">
                    person_check
                  </span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Usuarios Activos
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-left sm:text-center">
                    {activos}
                  </h3>
                </section>
              </section>
              <section className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-start sm:justify-center gap-4 sm:col-span-2 lg:col-span-1">
                <section className="size-12 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] shrink-0">
                  <span className="material-symbols-outlined text-3xl">
                    person_off
                  </span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Usuarios Inhabilitados
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-left sm:text-center">
                    {inactivos}
                  </h3>
                </section>
              </section>
            </section>
          </main>
          <ModalEditarUsuario
            abierto={modalEditarAbierto}
            cerrar={() => setModalEditarAbierto(false)}
            usuario={usuarioEditar}
            roles={roles}
            usuarios={usuarios}
            setUsuarios={setUsuarios}
            setUsuariosFiltrados={setUsuariosFiltrados}
            mostrarMensaje={mostrarMensaje}
          />
          <ModalEliminarUsuario
            abierto={modalEliminarAbierto}
            cerrar={() => setModalEliminarAbierto(false)}
            usuario={usuarioEliminar}
            usuarios={usuarios}
            setUsuarios={setUsuarios}
            setUsuariosFiltrados={setUsuariosFiltrados}
            mostrarMensaje={mostrarMensaje}
          />
        </section>
      </section>
      {mostrarToast && (
        <section className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 z-50">
          <span className="material-symbols-outlined">check_circle</span>
          {mensajeToast}
        </section>
      )}
    </>
  );
}
