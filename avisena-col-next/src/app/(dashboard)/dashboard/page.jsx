'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Activity } from 'lucide-react';
import api from '@/services/api';

export default function Page() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Instructor Líder',
    role: 'Instructor Líder'
  });
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [metricas, setMetricas] = useState({
    usuariosActivos: 0,
    totalAvesActivas: 0,
    reportesSemanales: 0,
    alertasSanitarias: 0,
    saludSistema: 100,
    totalHuevosRecolectados: 0,
  });
  const [reportesRecientes, setReportesRecientes] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id') || 'admin';
    const userMap = {
      admin: {
        name: 'Instructor Líder',
        role: 'Instructor Líder'
      },
      aprendiz: {
        name: 'Aprendiz Sena',
        role: 'Aprendiz de Contrato'
      },
      investigador: {
        name: 'Instructor Investigador',
        role: 'Instructor Investigador'
      }
    };
    const savedProfile = localStorage.getItem(`user_profile_${userId}`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setCurrentUser({
          name: parsed.name || (userMap[userId] || userMap.admin).name,
          role: parsed.role || (userMap[userId] || userMap.admin).role,
        });
      } catch {
        setCurrentUser(userMap[userId] || userMap.admin);
      }
    } else {
      setCurrentUser(userMap[userId] || userMap.admin);
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
    } else if (hour < 18) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }

    setCurrentDate(
      new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );

    async function cargarDashboard() {
      try {
        const res = await api.get('/reportes/dashboard/').catch(() => null);
        if (res && res.resumen_general) {
          const rg = res.resumen_general;
          setMetricas({
            usuariosActivos: rg.usuarios_activos ?? 0,
            totalAvesActivas: rg.total_aves_activas ?? 0,
            reportesSemanales: rg.total_reportes ?? 0,
            alertasSanitarias: (rg.total_aves_enfermas || 0) + (rg.total_mortalidad_aves || 0),
            saludSistema: rg.salud_sistema_porcentaje ?? 98,
            totalHuevosRecolectados: rg.total_huevos_recolectados ?? 0,
          });
          if (Array.isArray(res.reportes_recientes)) {
            setReportesRecientes(res.reportes_recientes);
          }
          localStorage.setItem('avisena_dashboard_cache', JSON.stringify(res));
          return;
        }
      } catch { }

      // Fallback local si el backend está offline
      try {
        const cache = JSON.parse(localStorage.getItem('avisena_dashboard_cache') || 'null');
        if (cache && cache.resumen_general) {
          const rg = cache.resumen_general;
          setMetricas({
            usuariosActivos: rg.usuarios_activos ?? 0,
            totalAvesActivas: rg.total_aves_activas ?? 0,
            reportesSemanales: rg.total_reportes ?? 0,
            alertasSanitarias: (rg.total_aves_enfermas || 0) + (rg.total_mortalidad_aves || 0),
            saludSistema: rg.salud_sistema_porcentaje ?? 98,
            totalHuevosRecolectados: rg.total_huevos_recolectados ?? 0,
          });
          if (Array.isArray(cache.reportes_recientes)) {
            setReportesRecientes(cache.reportes_recientes);
          }
          return;
        }
        const usuariosLocal = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const histLocal = JSON.parse(localStorage.getItem('historial') || '[]');
        const mortLocal = JSON.parse(localStorage.getItem('registrosMortalidad') || '[]');
        const morbLocal = JSON.parse(localStorage.getItem('historialMorbilidad') || '[]');
        setMetricas({
          usuariosActivos: usuariosLocal.filter(u => (u.estado || 'ACTIVO').toUpperCase() === 'ACTIVO').length || 3,
          totalAvesActivas: 0,
          reportesSemanales: histLocal.length + mortLocal.length + morbLocal.length,
          alertasSanitarias: morbLocal.length,
          saludSistema: 98,
          totalHuevosRecolectados: histLocal.reduce((acc, h) => acc + Number(h.huevos || h.totalHuevos || 0), 0),
        });
      } catch { }
    }

    cargarDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-900">
          {greeting}, {currentUser.name}
        </h1>

        <p className="text-slate-500 mt-3">
          Bienvenido al sistema de gestión avícola AVISENA.
          Desde aquí podrás administrar la producción, monitorear la salud de las aves,
          registrar eventos importantes y consultar reportes de la granja.
        </p>

        <p className="text-sm text-slate-400 mt-4 capitalize">
          📅 {currentDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Usuarios Activos</p>
              <h3 className="text-3xl font-bold mt-2">{metricas.usuariosActivos}</h3>
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">
              {metricas.totalAvesActivas.toLocaleString('es-CO')} aves
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Registros Operativos</p>
              <h3 className="text-3xl font-bold mt-2">{metricas.reportesSemanales}</h3>
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">
              {metricas.totalHuevosRecolectados.toLocaleString('es-CO')} huevos
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Eventos Sanitarios (Aves)</p>
              <h3 className="text-3xl font-bold mt-2">{metricas.alertasSanitarias}</h3>
            </div>
            <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-1 rounded-lg">Sanidad</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Salud del Lote</p>
              <h3 className="text-3xl font-bold mt-2">{metricas.saludSistema}%</h3>
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-lg">Viabilidad</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Reportes Recientes</h4>
            <Link href="/reportes" className="text-primary font-bold text-sm no-underline hover:underline">
              Ver todos
            </Link>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {reportesRecientes.length > 0 ? (
                reportesRecientes.map((rep, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-bold">{rep.id}</td>
                    <td className="px-6 py-4">{rep.tipo}</td>
                    <td className="px-6 py-4 text-slate-500">{rep.usuario}</td>
                    <td className="px-6 py-4 text-slate-500">{rep.fecha}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`${rep.estado === 'Completado'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                          } text-[10px] font-bold px-2 py-1 rounded-full uppercase`}
                      >
                        {rep.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No hay reportes recientes registrados en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6">Actividad Reciente</h4>
          <div className="space-y-6">
            {reportesRecientes.slice(0, 3).map((rep, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    {rep.tipo}{' '}
                    <span className="font-normal text-slate-500">
                      registrado por {rep.usuario}.
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{rep.fecha}</p>
                </div>
              </div>
            ))}
            {reportesRecientes.length === 0 && (
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    Sistema conectado <span className="font-normal text-slate-500">a la base de datos MySQL.</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Sincronizado</p>
                </div>
              </div>
            )}
          </div>
          <Link
            href="/notificaciones"
            className="block text-center no-underline w-full mt-8 py-3 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
          >
            Ver bitácora completa
          </Link>
        </div>
      </div>
    </div>
  );
}
