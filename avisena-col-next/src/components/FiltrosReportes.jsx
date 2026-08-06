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
    <>
      <section className="flex mb-6 items-center pt-3 flex-wrap">
        <section className="flex items-center justify-center py-1">
          <label className="text-lg font-bold p-2">Tipo de Reporte</label>
          <select
            name="tipoReporte"
            value={filtros.tipoReporte}
            onChange={handleChange}
            className="pl-4 pr-7 py-2.5 border text-slate-700 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 appearance-none"
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

        <section className="flex items-center justify-center py-1">
          <label className="text-lg font-bold p-2">Seleccione el galpón</label>
          <select
            name="galpon"
            value={filtros.galpon}
            onChange={handleChange}
            className="pl-4 pr-7 py-2.5 border text-slate-700 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2 appearance-none"
          >
            <option value="">Selecciona una opción...</option>
            <option value="Galpón 1">Galpón 1</option>
            <option value="Galpón 2">Galpón 2</option>
          </select>
        </section>

        <section className="flex items-center justify-center py-1">
          <label className="text-lg font-bold p-2">Fecha Inicio</label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
            className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2"
          />
        </section>
        <section className="flex items-center justify-center py-1">
          <label className="text-lg font-bold p-2">Fecha Fin</label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={handleChange}
            className="pl-4 pr-4 py-2.5 border text-slate-700 border-slate-200 rounded-xl bg-slate-50 outline-none transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-[#49E619]/40 col-span-2"
          />
        </section>

        <section className="flex items-center justify-center pl-4">
          <button
            onClick={generarReporte}
            className="w-auto flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#49E619] hover:bg-[#58db25] px-6 text-sm font-bold text-black shadow-[0_10px_15px_rgba(73,230,25,0.2)] active:scale-95 transition-all duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined">refresh</span>
            Generar Reporte
          </button>
        </section>
      </section>
    </>
  );
}
