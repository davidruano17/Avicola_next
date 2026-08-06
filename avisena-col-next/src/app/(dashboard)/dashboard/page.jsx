'use client';

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function Page() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Instructor Líder',
    role: 'Instructor Líder'
  });
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');
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
    setCurrentUser(userMap[userId] || userMap.admin);

    setCurrentUser(userMap[userId] || userMap.admin);

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
              <h3 className="text-3xl font-bold mt-2">124</h3>
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">+12%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Reportes Semanales</p>
              <h3 className="text-3xl font-bold mt-2">45</h3>
            </div>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">-5%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Alertas de Alimento</p>
              <h3 className="text-3xl font-bold mt-2">3</h3>
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg">+1%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium text-sm">Salud del Sistema</p>
              <h3 className="text-3xl font-bold mt-2">98%</h3>
            </div>
            <span className="bg-slate-100 text-slate-400 text-xs font-bold px-2 py-1 rounded-lg">0%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Reportes Recientes</h4>
            <button className="text-primary font-bold text-sm">Ver todos</button>
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
              <tr>
                <td className="px-6 py-4 font-bold">#00124</td>
                <td className="px-6 py-4">Alimentación</td>
                <td className="px-6 py-4 text-slate-500">Juan Perez</td>
                <td className="px-6 py-4 text-slate-500">Hace 15m</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Completado</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold">#00123</td>
                <td className="px-6 py-4">Mortalidad</td>
                <td className="px-6 py-4 text-slate-500">Maria Ruiz</td>
                <td className="px-6 py-4 text-slate-500">Hace 1h</td>
                <td className="px-6 py-4">
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pendiente</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6">Actividad Reciente</h4>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-bold">Nuevo usuario <span className="font-normal text-slate-500">registrado en el sistema.</span></p>
                <p className="text-[10px] text-slate-400 mt-1">Hace 10 minutos</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors">
            Ver bitácora completa
          </button>
        </div>
      </div>
    </div>
  );
}
