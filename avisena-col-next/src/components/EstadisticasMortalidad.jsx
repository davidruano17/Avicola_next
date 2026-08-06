'use client';



export default function EstadisticasMortalidad({ registros }) {

    const total = registros.reduce((acc, item) => acc + Number(item.cantidad), 0);

    const actas = registros.length;

    const causaPrincipal = (() => {
      const contador = {};

      registros.forEach((r) => {
        contador[r.causa] = (contador[r.causa] || 0) + 1;
      });

      return (
        Object.entries(contador).sort((a, b) => b[1] - a[1])[0]?.[0] || "--"
      );
    })();

    const tasa = ((total / 1000) * 100).toFixed(1);

    

  return (
    <>
      {/**   Estadísticas   */}

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 px-7">
        <section className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark flex items-center justify-center text-center gap-4">
          <section className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-icons text-red-500">trending_up</span>
          </section>
          <section>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Mortalidad Total Mensual
            </p>
            <section className="text-2xl font-bold">
              {total}
            </section>
          </section>
        </section>
        <section className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark flex items-center justify-center text-center gap-4">
          <section className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-icons text-amber-400">analytics</span>
          </section>
          <section>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Causa Principal
            </p>
            <section className="text-2xl font-bold">
              {causaPrincipal}
            </section>
          </section>
        </section>
        <section className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark flex items-center justify-center text-center gap-4">
          <section className="h-10 w-10 rounded-lg bg-secondary-teal/10 flex items-center justify-center">
            <span className="material-icons text-[#11a331] text-secondary-teal">task_alt</span>
          </section>
          <section>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Actas Generadas
            </p>
            <section className="text-2xl font-bold">
              {actas}
            </section>
          </section>
        </section>
        <section className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark flex items-center gap-4 justify-center text-center relative overflow-hidden">
          <section className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <span className="material-icons text-amber-500">warning</span>
          </section>
          <section>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Tasa de Mortalidad
            </p>
            <section className="text-2xl font-bold">
              {tasa}%
            </section>
          </section>
        </section>
      </section>
    </>
  );
}
