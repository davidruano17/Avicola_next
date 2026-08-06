'use client';

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-8">
        <h1 className="text-4xl font-black mb-2 text-slate-900 dark:text-white">Reportes Diarios</h1>
        <p className="text-slate-500 dark:text-slate-400">Seguimiento de la producción diaria.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Producción Huevos</h3>
          <p className="text-slate-500 text-sm mb-4">Estadísticas diarias de producción.</p>
          <button className="bg-primary hover:bg-[#3dbd14] text-black px-4 py-2 rounded-lg font-bold transition-all">Ver Reporte</button>
        </article>

        <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Mortalidad Registrada</h3>
          <p className="text-slate-500 text-sm mb-4">Casos de mortalidad del día.</p>
          <button className="bg-primary hover:bg-[#3dbd14] text-black px-4 py-2 rounded-lg font-bold transition-all">Ver Reporte</button>
        </article>

        <article className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Morbilidad Detectada</h3>
          <p className="text-slate-500 text-sm mb-4">Incidencias de salud del día.</p>
          <button className="bg-primary hover:bg-[#3dbd14] text-black px-4 py-2 rounded-lg font-bold transition-all">Ver Reporte</button>
        </article>
      </section>
    </main>
  );
}
