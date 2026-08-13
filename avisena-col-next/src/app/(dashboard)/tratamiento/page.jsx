"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormTratamiento from '@/components/FormTratamiento';


export default function TratamientoView() {
  const [tratamientos, setTratamientos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  const [defaultFormData, setDefaultFormData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tratamientosGuardados = localStorage.getItem('tratamientos');
    if (tratamientosGuardados) {
      setTratamientos(JSON.parse(tratamientosGuardados));
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('autofill') === 'true') {
      setDefaultFormData({
        fechaInicio: searchParams.get('fechaInicio') || '',
        galpon: searchParams.get('galpon') || '1',
        lote: searchParams.get('lote') || 'L1',
        observaciones: searchParams.get('observaciones') || '',
      });
      setMostrarFormulario(true);
    }
  }, [searchParams]);

  const showNotification = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 4000);
  };

  const guardarTratamiento = (formData) => {
    const nuevoTratamiento = {
      id: Date.now(),
      ...formData,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString()
    };

    const tratamientosActualizados = [nuevoTratamiento, ...tratamientos];
    setTratamientos(tratamientosActualizados);
    localStorage.setItem('tratamientos', JSON.stringify(tratamientosActualizados));

    setMostrarFormulario(false);
    showNotification('✓ Tratamiento registrado correctamente');
  };

  const eliminarTratamiento = (id) => {
    const tratamientosActualizados = tratamientos.filter(t => t.id !== id);
    setTratamientos(tratamientosActualizados);
    localStorage.setItem('tratamientos', JSON.stringify(tratamientosActualizados));
    showNotification('✓ Tratamiento eliminado');
  };

  const completarTratamiento = (id) => {
    const tratamientosActualizados = tratamientos.map(t =>
      t.id === id ? { ...t, estado: 'Completado' } : t
    );
    setTratamientos(tratamientosActualizados);
    localStorage.setItem('tratamientos', JSON.stringify(tratamientosActualizados));
    showNotification('✓ Tratamiento marcado como completado');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      'Activo': 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
      'Completado': 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
    };
    return clases[estado] || clases['Activo'];
  };

  const getTipoBadge = (tipo) => {
    const colores = {
      'Antimicrobiano': 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
      'Antiparasitario': 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400',
      'Vitaminas': 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
      'Antiinflamatorio': 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400',
      'Vacuna': 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
    };
    return colores[tipo] || colores['Antimicrobiano'];
  };

  return (
     <section className="layout-container">
      <main className="main-container w-full">
        <section className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">Gestión de Tratamientos</h1>
            <p className="text-slate-500 dark:text-slate-400">Registro y seguimiento de tratamientos aplicados.</p>
          </div>
                    <button
                            onClick={() => {
                              setDefaultFormData(null);
                              setMostrarFormulario(true);
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 min-w-[220px] bg-primary hover:bg-[#3dbd14] text-black text-sm font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all border-none cursor-pointer"
                          >
                            Agregar Nuevo Tratamiento
                    </button>
        </section>
        

        {notificacion && (
          <article className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg animate-pulse z-40">
            {notificacion}
          </article>
        )}

        {mostrarFormulario && (
          <FormTratamiento
            onSubmit={(data) => {
              guardarTratamiento(data);
              setDefaultFormData(null);
            }}
            onClose={() => {
              setMostrarFormulario(false);
              setDefaultFormData(null);
            }}
            defaultData={defaultFormData}
          />
        )}

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Medicamento</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Tipo</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Ubicación</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Vía Admin.</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Inicio</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Duración</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Morbilidad / Diagnóstico</th>
                  <th className="text-left p-4 font-bold text-slate-900 dark:text-white">Responsable</th>
                  <th className="text-left p-2 font-bold text-slate-900 dark:text-white">Estado</th>
                  <th className="text-center p-4 font-bold text-slate-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tratamientos.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center p-8 text-slate-500 dark:text-slate-400">
                      No hay tratamientos registrados aún
                    </td>
                  </tr>
                ) : (
                  tratamientos.map(tratamiento => (
                    <tr key={tratamiento.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{tratamiento.medicamento}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tratamiento.dosis}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold ${getTipoBadge(tratamiento.tipo)}`}>
                          {tratamiento.tipo}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">G{tratamiento.galpon} - {tratamiento.lote}</p>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{tratamiento.viaAdministracion}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{formatDate(tratamiento.fechaInicio)}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{tratamiento.duracion} días</p>
                      </td>
                      <td className="p-4 text-xs text-slate-600 dark:text-slate-300 max-w-[220px] truncate font-medium" title={tratamiento.observaciones}>
                        {tratamiento.observaciones || <span className="text-slate-400 font-normal italic">Sin morbilidad asociada</span>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{tratamiento.responsable}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-bold border ${getEstadoBadge(tratamiento.estado)}`}>
                          {tratamiento.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        {tratamiento.estado === 'Activo' && (
                          <button
                            onClick={() => completarTratamiento(tratamiento.id)}
                            className="text-emerald-500 hover:text-emerald-700 transition-colors"
                            title="Completar"
                          >
                            <span className="material-icons w-4 h-4 inline">check_circle</span>
                          </button>
                        )}
                        <button
                          onClick={() => eliminarTratamiento(tratamiento.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-icons w-4 h-4 inline">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {tratamientos.length > 0 && (
          <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Total de Tratamientos</p>
              <h3 className="text-3xl font-black text-primary">{tratamientos.length}</h3>
            </article>
            <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Activos</p>
              <h3 className="text-3xl font-black text-emerald-500">{tratamientos.filter(t => t.estado === 'Activo').length}</h3>
            </article>
            <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Completados</p>
              <h3 className="text-3xl font-black text-slate-500">{tratamientos.filter(t => t.estado === 'Completado').length}</h3>
            </article>
          </section>
        )}
      </main>
    </section>
  );
}
