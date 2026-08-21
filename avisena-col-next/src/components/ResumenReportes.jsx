"use client";

export default function ResumenReportes({ resumen, tipoReporte }) {
  let tarjetas = [];
  let indicadoresEspeciales = [];

  switch (tipoReporte) {
    case "Mortalidad de aves":
      tarjetas = [
        {
          titulo: "Total de aves",
          valor: resumen.totalCantidad,
          icono: "pets",
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
      indicadoresEspeciales = [
        {
          titulo: "Causa principal",
          valor: resumen.causaPrincipal,
        },
        {
          titulo: "Galpón con mayor mortalidad",
          valor: resumen.galponPrincipal,
        },
      ];
      break;

    case "Producción de huevos":
      tarjetas = [
        {
          titulo: "Total de huevos producidos",
          valor: resumen.totalCantidad,
          icono: "egg",
        },
        {
          titulo: "Total de huevos buenos",
          valor: resumen.totalBuenos,
          icono: "check_circle",
        },
        {
          titulo: "Total de huevos rotos",
          valor: resumen.totalRotos,
          icono: "egg_alt",
        },
        {
          titulo: "Total de huevos descarte",
          valor: resumen.totalDescarte,
          icono: "delete",
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Galpón con mayor producción",
          valor: resumen.galponPrincipal,
        },
      ];
      break;

    case "Clasificación de huevos":
      tarjetas = [
        {
          titulo: "Total clasificado",
          valor: resumen.totalCantidad,
          icono: "egg",
        },
        {
          titulo: "Promedio",
          valor: resumen.promedio,
          icono: "analytics",
        },
        {
          titulo: "Máxima clasificación",
          valor: resumen.maximo,
          icono: "trending_up",
        },
        {
          titulo: "Mínima clasificación",
          valor: resumen.minimo,
          icono: "trending_down",
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Categoría predominante",
          valor: resumen.categoriaPrincipal,
        },
        {
          titulo: "Galpón con mayor clasificación",
          valor: resumen.galponPrincipal,
        },
      ];
      break;

    case "Morbilidad de aves":
      tarjetas = [
        {
          titulo: "Total de aves afectadas",
          valor: resumen.totalCantidad,
          icono: "sick",
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
      indicadoresEspeciales = [
        {
          titulo: "Enfermedad / causa principal",
          valor: resumen.causaPrincipal,
        },
        {
          titulo: "Galpón con mayor morbilidad",
          valor: resumen.galponPrincipal,
        },
      ];
      break;

    default:
      tarjetas = [
        {
          titulo: "Registros",
          valor: resumen.totalRegistros,
          icono: "description",
        },
        {
          titulo: "Total",
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
      break;
  }

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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      {indicadoresEspeciales.length > 0 && (
        <section
          className={`grid grid-cols-1 ${
            indicadoresEspeciales.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-1"
          } gap-4 mt-4`}
        >
          {indicadoresEspeciales.map((indicador) => (
            <article
              key={indicador.titulo}
              className="border border-slate-200 rounded-xl p-5 bg-white"
            >
              <p className="text-sm font-semibold text-slate-500 mb-2">
                {indicador.titulo}
              </p>
              <p className="text-lg font-bold text-slate-800">
                {indicador.valor || "Sin datos"}
              </p>
            </article>
          ))}
        </section>
      )}
    </section>
  );
}
