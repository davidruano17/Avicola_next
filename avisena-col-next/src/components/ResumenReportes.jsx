"use client";

import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  AlertTriangle,
  HeartPulse,
  Egg,
  DollarSign,
  Building,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react";

export default function ResumenReportes({ resumen, tipoReporte }) {
  let tarjetas = [];
  let indicadoresEspeciales = [];

  switch (tipoReporte) {
    case "Mortalidad de aves":
      tarjetas = [
        {
          titulo: "Total de Bajas (Aves)",
          valor: resumen.totalCantidad.toLocaleString(),
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          icon: AlertTriangle,
        },
        {
          titulo: "Promedio por Registro",
          valor: `${resumen.promedio} aves`,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          icon: Activity,
        },
        {
          titulo: "Pico Máximo en Registro",
          valor: `${resumen.maximo} aves`,
          color: "text-rose-600",
          bgColor: "bg-rose-500/10",
          icon: TrendingUp,
        },
        {
          titulo: "Pico Mínimo en Registro",
          valor: `${resumen.minimo} aves`,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          icon: TrendingDown,
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Causa Principal de Mortalidad",
          valor: resumen.causaPrincipal,
          subtitulo: "Mayor frecuencia de ocurrencia",
          icon: AlertTriangle,
        },
        {
          titulo: "Galpón con Mayor Mortalidad",
          valor: resumen.galponPrincipal,
          subtitulo: "Galpón con mayor concentración de bajas",
          icon: Building,
        },
      ];
      break;

    case "Producción de huevos":
      tarjetas = [
        {
          titulo: "Total Huevos Producidos",
          valor: resumen.totalCantidad.toLocaleString(),
          color: "text-primary",
          bgColor: "bg-primary/10",
          icon: Egg,
        },
        {
          titulo: "Huevos Buenos (Comerciales)",
          valor: (resumen.totalHuevosBuenos || 0).toLocaleString(),
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          icon: CheckCircle2,
        },
        {
          titulo: "Huevos Rotos",
          valor: (resumen.totalHuevosRotos || 0).toLocaleString(),
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          icon: AlertTriangle,
        },
        {
          titulo: "Huevos Descarte",
          valor: (resumen.totalHuevosDescarte || 0).toLocaleString(),
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          icon: Trash2,
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Tasa de Merma (Rotos + Descarte)",
          valor: `${resumen.tasaMerma || 0}%`,
          subtitulo: "Porcentaje sobre la producción total",
          icon: TrendingDown,
        },
        {
          titulo: "Galpón con Mayor Producción",
          valor: resumen.galponPrincipal,
          subtitulo: "Mayor volumen de recolección acumulado",
          icon: Building,
        },
      ];
      break;

    case "Clasificación de huevos":
      tarjetas = [
        {
          titulo: "Total Huevos Clasificados",
          valor: `${(resumen.totalCantidad || 0).toLocaleString("es-CO")} uds`,
          color: "text-primary",
          bgColor: "bg-primary/10",
          icon: Egg,
        },
        {
          titulo: "Panales Completos (30 uds)",
          valor: `${Math.floor(resumen.totalPanales || 0).toLocaleString("es-CO")} panales`,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          icon: Layers,
        },
        {
          titulo: "Unidades Sueltas (Sobrantes)",
          valor: `${Math.floor(resumen.totalSobrantes || 0).toLocaleString("es-CO")} uds`,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          icon: Activity,
        },
        {
          titulo: "Valor Total Estimado",
          valor: `$${Math.round(resumen.totalDinero || 0).toLocaleString("es-CO")}`,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          icon: DollarSign,
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Calibre / Categoría Predominante",
          valor: resumen.categoriaPrincipal,
          subtitulo: "Categoría de mayor volumen clasificado",
          icon: Sparkles,
        },
        {
          titulo: "Galpón con Mayor Volumen Clasificado",
          valor: resumen.galponPrincipal,
          subtitulo: "Origen del mayor lote procesado",
          icon: Building,
        },
      ];
      break;

    case "Morbilidad de aves":
      tarjetas = [
        {
          titulo: "Aves con Síntomas",
          valor: resumen.totalCantidad.toLocaleString(),
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          icon: HeartPulse,
        },
        {
          titulo: "Promedio por Incidencia",
          valor: `${resumen.promedio} aves`,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          icon: Activity,
        },
        {
          titulo: "Gravedad Predominante",
          valor: resumen.afectacionPrincipal || "Sin datos",
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          icon: AlertTriangle,
        },
        {
          titulo: "Mayor Afectación en 1 Registro",
          valor: `${resumen.maximo} aves`,
          color: "text-red-600",
          bgColor: "bg-red-500/10",
          icon: TrendingUp,
        },
      ];
      indicadoresEspeciales = [
        {
          titulo: "Síntoma o Cuadro Clínico Principal",
          valor: resumen.causaPrincipal,
          subtitulo: "Mayor frecuencia detectada",
          icon: HeartPulse,
        },
        {
          titulo: "Galpón con Mayor Morbilidad",
          valor: resumen.galponPrincipal,
          subtitulo: "Requiere mayor vigilancia sanitaria",
          icon: Building,
        },
      ];
      break;

    default:
      tarjetas = [
        {
          titulo: "Total Registros",
          valor: resumen.totalRegistros,
          color: "text-slate-600 dark:text-slate-300",
          bgColor: "bg-slate-200/50 dark:bg-slate-800",
          icon: Layers,
        },
        {
          titulo: "Total Unidades",
          valor: resumen.totalCantidad.toLocaleString(),
          color: "text-primary",
          bgColor: "bg-primary/10",
          icon: Activity,
        },
        {
          titulo: "Promedio",
          valor: resumen.promedio,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          icon: Activity,
        },
        {
          titulo: "Máximo",
          valor: resumen.maximo,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          icon: TrendingUp,
        },
      ];
      break;
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Métricas y Resumen Ejecutivo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Indicadores clave consolidados a partir de los filtros seleccionados.
        </p>
      </div>

      {/* Grid de Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icon;
          return (
            <article
              key={tarjeta.titulo}
              className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/80 dark:bg-slate-800/50 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {tarjeta.titulo}
                </h3>
                <span className={`p-2 rounded-xl ${tarjeta.bgColor} ${tarjeta.color}`}>
                  <Icono className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {tarjeta.valor}
              </p>
            </article>
          );
        })}
      </div>

      {/* Indicadores Especiales (Insights) */}
      {indicadoresEspeciales.length > 0 && (
        <div
          className={`grid grid-cols-1 ${indicadoresEspeciales.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"
            } gap-4 mt-4`}
        >
          {indicadoresEspeciales.map((indicador) => {
            const Icono = indicador.icon;
            return (
              <article
                key={indicador.titulo}
                className="flex items-center gap-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 bg-gradient-to-r from-slate-50/90 to-white dark:from-slate-800/60 dark:to-slate-800/30"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icono className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {indicador.titulo}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                    {indicador.valor || "Sin datos"}
                  </p>
                  {indicador.subtitulo && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {indicador.subtitulo}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
