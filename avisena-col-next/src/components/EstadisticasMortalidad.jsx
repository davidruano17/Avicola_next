export default function EstadisticasMortalidad({
  registros = [],
  poblacionTotal = 0,
  poblacionActiva = 0,
}) {
  const total = registros.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);

  const causaPrincipal = (() => {
    const contador = {};

    registros.forEach((r) => {
      if (r.causa) {
        contador[r.causa] = (contador[r.causa] || 0) + Number(r.cantidad || 0);
      }
    });

    const principal = Object.entries(contador).sort((a, b) => b[1] - a[1])[0];

    return principal ? `${principal[0]} - ${principal[1]} aves` : "--";
  })();

  const galponCritico = (() => {
    const contador = {};

    registros.forEach((r) => {
      if (r.galpon) {
        contador[r.galpon] = (contador[r.galpon] || 0) + Number(r.cantidad || 0);
      }
    });

    const principal = Object.entries(contador).sort((a, b) => b[1] - a[1])[0];

    return principal ? `Galpón ${principal[0]} - ${principal[1]} aves` : "--";
  })();

  // Cálculo dinámico de la tasa de mortalidad:
  // Usa la población inicial ingresada en los galpones.
  // Cuando se conecte a la base de datos, el valor provendrá de la API (ej: GET /api/galpones/).
  // Si aún no hay galpones cargados, se usa una base referencial de 1.000 aves.
  const baseCalculo =
    Number(poblacionTotal) > 0 ? Number(poblacionTotal) : (total > 0 ? 1000 : 0);
  const tasa =
    baseCalculo > 0 ? ((total / baseCalculo) * 100).toFixed(2) : "0.00";

  return (
    <>
      {/**   Estadísticas   */}

      <section className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mortalidad Total */}
        <section className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <section className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">trending_up</span>
          </section>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider truncate">
              Mortalidad Total
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {total} <span className="text-xs font-normal text-slate-500">aves</span>
            </p>
          </div>
        </section>

        {/* Causa Principal */}
        <section className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <section className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </section>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider truncate">
              Causa Principal
            </p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate" title={causaPrincipal}>
              {causaPrincipal}
            </p>
          </div>
        </section>

        {/* Galpón Más Afectado */}
        <section className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <section className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">domain</span>
          </section>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider truncate">
              Galpón Más Afectado
            </p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate" title={galponCritico}>
              {galponCritico}
            </p>
          </div>
        </section>

        {/* Tasa de Mortalidad */}
        <section className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <section className="h-11 w-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </section>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider truncate">
              Tasa de Mortalidad
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {tasa}%
            </p>
            <p
              className="text-[11px] text-slate-400 dark:text-slate-500 truncate"
              title={
                baseCalculo > 0
                  ? `Población viva: ${poblacionActiva.toLocaleString()} aves de ${baseCalculo.toLocaleString()} ingresadas inicialmente`
                  : "Calculado sobre base referencial de 1.000 aves"
              }
            >
              {baseCalculo > 0
                ? `Vivas: ${poblacionActiva.toLocaleString()} / Inicial: ${baseCalculo.toLocaleString()}`
                : "Base ref.: 1.000 aves"}
            </p>
          </div>
        </section>
      </section>
    </>
  );
}
