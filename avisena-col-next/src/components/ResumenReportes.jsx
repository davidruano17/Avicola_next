'use client';

export default function ResumenReportes({ resumen, tipoReporte }) {
  let tituloTotal = "Total";

  switch (tipoReporte) {
    case "Mortalidad de aves":
      tituloTotal = "Total de aves";
      break;

    case "Producción de huevos":
      tituloTotal = "Huevos producidos";
      break;

    case "Clasificación de huevos":
      tituloTotal = "Huevos clasificados";
      break;

    case "Morbilidad de aves":
      tituloTotal = "Aves enfermas";
      break;

    default:
      tituloTotal = "Total";
  }

  const tarjetas = [
    {
      titulo: "Registros",
      valor: resumen.totalRegistros,
      icono: "description",
    },
    {
      titulo: tituloTotal,
      valor: resumen.totalCantidad,
      icono: "calculate",
    },
    {
      titulo: "Promedio",
      valor: resumen.promedio,
      icono: "analytics",
    },
    {
      titulo: "Máximo",
      valor: resumen.maximo,
      icono: "trending_up",
    },
    {
      titulo: "Mínimo",
      valor: resumen.minimo,
      icono: "trending_down",
    },
  ];

  return (
    <section className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm p-6 mb-6">
      <section className="mb-5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Resumen del reporte
        </h2>
        <p className="text-lg text-slate-500 mt-1">
          Indicadores obtenidos a partir de los datos seleccionados.
        </p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tarjetas.map((tarjeta) => (
          <article
            key={tarjeta.titulo}
            className="border border-slate-200 rounded-xl p-5 bg-slate-50"
          >
            <section className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-500">
                {tarjeta.titulo}
              </h3>
              <span className="material-symbols-outlined text-[#49E619]">
                {tarjeta.icono}
              </span>
            </section>
            <p className="text-2xl font-bold text-slate-800">{tarjeta.valor}</p>
          </article>
        ))}
      </section>
      {tipoReporte === "Mortalidad de aves" && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <article className="border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-slate-500 mb-2">
              Causa principal
            </p>
            <p className="text-lg font-bold text-slate-800">
              {resumen.causaPrincipal || "Sin datos"}
            </p>
          </article>
          <article className="border border-slate-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-slate-500 mb-2">
              Galpón con mayor mortalidad
            </p>
            <p className="text-lg font-bold text-slate-800">
              {resumen.galponPrincipal || "Sin datos"}
            </p>
          </article>
        </section>
      )}
    </section>
  );
}
