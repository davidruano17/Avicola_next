'use client';


import { useState, useEffect } from 'react';
import FiltrosGestionUsuarios from "../components/FiltrosGestionUsuarios";
import FormGestionUsuarios from "../components/FormGestionUsuarios";
import TablaGestionUsuarios from '../components/TablaGestionUsuarios';

export default function GestionUsuariosView() {

    const [usuarios, setUsuarios] = useState([]);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  
    useEffect(() => {
      const datos = JSON.parse(localStorage.getItem("usuarios")) || [];
      setUsuarios(datos);
      setUsuariosFiltrados(datos);
    }, []);

    const total = usuarios.length;
    const activos = usuarios.filter((u) => u.estado === "ACTIVO").length;
    const inactivos = usuarios.filter((u) => u.estado === "INACTIVO").length;
    
  return (
    <>
      <section className="bg-[#f6f7f8] dark:bg-[#141d1e] font-sans text-slate-900 dark:text-slate-100 min-h-screen">
        <section className="flex h-full grow flex-col">
          <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="flex flex-wrap justify-between items-end gap-4 mb-8">
              <section className="flex flex-col gap-1">
                <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">Gestión de Usuarios</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">
                  Administra el acceso al sistema, los roles y los datos del
                  personal encargado de las operaciones avícolas
                </p>
              </section>
              <FormGestionUsuarios
                usuarios={usuarios}
                setUsuarios={setUsuarios}
                setUsuariosFiltrados={setUsuariosFiltrados}
              />
            </section>
            <FiltrosGestionUsuarios
              usuarios={usuarios}
              setUsuariosFiltrados={setUsuariosFiltrados}
            />
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <section className="overflow-x-auto @container">
                <table className="font-size w-full text-center border-collapse">
                  <thead className='bg-slate-50 dark:bg-background-dark/80 sticky top-0 text-center'>
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Documento</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Residencia</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de ingreso</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
                    </tr>
                  </thead>
                  <TablaGestionUsuarios
                    usuarios={usuariosFiltrados}
                    setUsuarios={setUsuarios}
                    setUsuariosFiltrados={setUsuariosFiltrados}
                  />
                </table>
              </section>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4">
                <section className="size-12 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
                  <span className="material-symbols-outlined text-3xl">groups</span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Usuarios</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center">
                    {total}
                  </h3>
                </section>
              </section>
              <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4">
                <section className="size-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e]">
                  <span className="material-symbols-outlined text-3xl">person_check</span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Usuarios Activos</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center">
                    {activos}
                  </h3>
                </section>
              </section>
              <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4">
                <section className="size-12 rounded-full bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24]">
                  <span className="material-symbols-outlined text-3xl">person_off</span>
                </section>
                <section>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Usuarios Inhabilitados</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white text-center">
                    {inactivos}
                  </h3>
                </section>
              </section>
            </section>
          </main>
          <footer className="mt-auto px-10 py-6 text-center border-t border-slate-200 dark:border-slate-800">
            <section className="flex flex-col items-center gap-4">
              <section className="flex items-center gap-6 opacity-60">
                <section className="flex flex-col items-center">
                  <span className="text-l">Sistema de Gestión Avicola</span>
                </section>
              </section>
              <p className="text-l text-slate-500">© 2026 AVISENA COL</p>
            </section>
          </footer>
        </section>
      </section>
    </>
  );
}
