'use client';

export default function FiltrosReportes({
  filtros,
  setFiltros,
  generarReporte,
}) {
  const handleChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm p-6 mb-6 mt-6">
      <section className="mb-5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Filtros del reporte
        </h2>
        <p className="text-lg text-slate-500 mt-1">
          Selecciona los criterios para generar el reporte.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tipo de reporte
          </label>
          <select
            name="tipoReporte"
            value={filtros.tipoReporte}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#49E619]/40 focus:border-[#49E619] transition-all"
          >
            <option value="">Selecciona una opción...</option>
            <option value="Producción de huevos">Producción de huevos</option>
            <option value="Clasificación de huevos">
              Clasificación de huevos
            </option>
            <option value="Mortalidad de aves">Mortalidad de aves</option>
            <option value="Morbilidad de aves">Morbilidad de aves</option>
          </select>
        </section>
        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Galpón
          </label>
          <select
            name="galpon"
            value={filtros.galpon}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#49E619]/40 focus:border-[#49E619] transition-all"
          >
            <option value="">Todos los galpones</option>
            <option value="Galpón 1">Galpón 1</option>
            <option value="Galpón 2">Galpón 2</option>
          </select>
        </section>
        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Fecha de inicio
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#49E619]/40 focus:border-[#49E619] transition-all"
          />
        </section>
        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Fecha de fin
          </label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-[#49E619]/40 focus:border-[#49E619] transition-all"
          />
        </section>
      </section>
      <section className="flex justify-end mt-6 pt-5 border-t border-slate-200">
        <button
          onClick={generarReporte}
          disabled={!filtros.tipoReporte}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#49E619] hover:bg-[#58db25] px-6 py-3 text-sm font-bold text-black shadow-[0_8px_15px_rgba(73,230,25,0.18)] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <span className="material-symbols-outlined text-[20px]">
            assessment
          </span>
          Generar reporte
        </button>
      </section>
    </section>
  );
}
