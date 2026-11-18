"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { BarChart3, PieChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficosReportes({ datos, tipoReporte }) {
  if (!datos || datos.length === 0) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Análisis Gráfico
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay datos suficientes para generar las gráficas del período seleccionado.
        </p>
      </section>
    );
  }

  // Agrupación por fechas ordenadas
  const fechasSet = new Set();
  datos.forEach((item) => {
    if (item.fecha) fechasSet.add(item.fecha);
  });
  const fechas = Array.from(fechasSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Opciones base de ChartJS
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    barPercentage: 0.68,
    categoryPercentage: 0.75,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { family: "Inter, sans-serif", size: 12, weight: 600 },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.08)" },
        ticks: { color: "#94a3b8", font: { size: 11 }, precision: 0 },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { family: "Inter, sans-serif", size: 11, weight: 600 },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: "72%",
  };

  // Construcción de datasets según el tipo de reporte
  let dataBarra = null;
  let dataDoughnut = null;
  let tituloDoughnut = "";

  if (tipoReporte === "Producción de huevos") {
    // Datos temporales de Buenos, Rotos y Descarte
    const agrupado = {};
    let totalBuenos = 0;
    let totalRotos = 0;
    let totalDescarte = 0;

    fechas.forEach((f) => {
      agrupado[f] = { buenos: 0, rotos: 0, descarte: 0 };
    });

    datos.forEach((d) => {
      if (agrupado[d.fecha]) {
        const b = Number(d.huevosBuenos || 0);
        const r = Number(d.huevosRotos || 0);
        const desc = Number(d.descarte || 0);
        agrupado[d.fecha].buenos += b;
        agrupado[d.fecha].rotos += r;
        agrupado[d.fecha].descarte += desc;
        totalBuenos += b;
        totalRotos += r;
        totalDescarte += desc;
      }
    });

    dataBarra = {
      labels: fechas,
      datasets: [
        {
          label: "Buenos (Comerciales)",
          data: fechas.map((f) => agrupado[f].buenos),
          backgroundColor: "#10b981",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Rotos",
          data: fechas.map((f) => agrupado[f].rotos),
          backgroundColor: "#f59e0b",
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Descarte",
          data: fechas.map((f) => agrupado[f].descarte),
          backgroundColor: "#f43f5e",
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    dataDoughnut = {
      labels: ["Buenos", "Rotos", "Descarte"],
      datasets: [
        {
          data: [totalBuenos, totalRotos, totalDescarte],
          backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
          borderWidth: 0,
          spacing: 4,
          borderRadius: 4,
        },
      ],
    };
    tituloDoughnut = "Calidad de Producción";
  } else if (tipoReporte === "Clasificación de huevos") {
    const cantidadesPorFecha = {};
    const categoriasConteo = {};

    datos.forEach((d) => {
      cantidadesPorFecha[d.fecha] =
        (cantidadesPorFecha[d.fecha] || 0) + Number(d.cantidad || 0);

      if (d.detalles) {
        Object.entries(d.detalles).forEach(([cat, val]) => {
          const c = Number(val?.hoy || val?.unidades || 0);
          if (c > 0) {
            categoriasConteo[cat] = (categoriasConteo[cat] || 0) + c;
          }
        });
      }
    });

    dataBarra = {
      labels: fechas,
      datasets: [
        {
          label: "Huevos clasificados",
          data: fechas.map((f) => cantidadesPorFecha[f] || 0),
          backgroundColor: "rgba(14, 165, 233, 0.75)",
          borderColor: "#0ea5e9",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const catLabels = Object.keys(categoriasConteo);
    if (catLabels.length > 0) {
      dataDoughnut = {
        labels: catLabels,
        datasets: [
          {
            data: catLabels.map((c) => categoriasConteo[c]),
            backgroundColor: [
              "#0ea5e9",
              "#10b981",
              "#6366f1",
              "#f59e0b",
              "#8b5cf6",
              "#14b8a6",
              "#f43f5e",
              "#64748b",
            ],
            borderWidth: 0,
            spacing: 4,
            borderRadius: 4,
          },
        ],
      };
      tituloDoughnut = "Distribución por Calibre";
    }
  } else if (tipoReporte === "Mortalidad de aves") {
    const cantidadesPorFecha = {};
    const causasConteo = {};

    datos.forEach((d) => {
      cantidadesPorFecha[d.fecha] =
        (cantidadesPorFecha[d.fecha] || 0) + Number(d.cantidad || 0);
      if (d.causa) {
        causasConteo[d.causa] =
          (causasConteo[d.causa] || 0) + Number(d.cantidad || 0);
      }
    });

    dataBarra = {
      labels: fechas,
      datasets: [
        {
          label: "Aves fallecidas",
          data: fechas.map((f) => cantidadesPorFecha[f] || 0),
          backgroundColor: "rgba(225, 29, 72, 0.75)",
          borderColor: "#e11d48",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const causasLabels = Object.keys(causasConteo);
    if (causasLabels.length > 0) {
      dataDoughnut = {
        labels: causasLabels,
        datasets: [
          {
            data: causasLabels.map((c) => causasConteo[c]),
            backgroundColor: [
              "#e11d48",
              "#f97316",
              "#eab308",
              "#6366f1",
              "#64748b",
              "#0d9488",
            ],
            borderWidth: 0,
            spacing: 4,
            borderRadius: 4,
          },
        ],
      };
      tituloDoughnut = "Causas de Mortalidad";
    }
  } else {
    // Morbilidad u otros
    const cantidadesPorFecha = {};
    const sintomasConteo = {};

    datos.forEach((d) => {
      cantidadesPorFecha[d.fecha] =
        (cantidadesPorFecha[d.fecha] || 0) + Number(d.cantidad || 0);
      if (d.afectacion) {
        sintomasConteo[d.afectacion] =
          (sintomasConteo[d.afectacion] || 0) + Number(d.cantidad || 0);
      }
    });

    dataBarra = {
      labels: fechas,
      datasets: [
        {
          label: "Aves con afección",
          data: fechas.map((f) => cantidadesPorFecha[f] || 0),
          backgroundColor: "rgba(217, 119, 6, 0.75)",
          borderColor: "#d97706",
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    const afectLabels = Object.keys(sintomasConteo);
    if (afectLabels.length > 0) {
      dataDoughnut = {
        labels: afectLabels,
        datasets: [
          {
            data: afectLabels.map((a) => sintomasConteo[a]),
            backgroundColor: [
              "#f43f5e",
              "#f59e0b",
              "#10b981",
              "#6366f1",
              "#64748b",
            ],
            borderWidth: 0,
            spacing: 4,
            borderRadius: 4,
          },
        ],
      };
      tituloDoughnut = "Nivel de Gravedad";
    }
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Tendencia y Distribución
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Comportamiento cronológico y desglose cualitativo del reporte.
          </p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 ${dataDoughnut ? "lg:grid-cols-3" : "lg:grid-cols-1"
          } gap-6`}
      >
        {/* Gráfico Principal (Barras Temporales) */}
        <div
          id="contenedor-chart-barra"
          className={`${dataDoughnut ? "lg:col-span-2" : "lg:col-span-1"
            } p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80`}
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Evolución en el Tiempo
            </h3>
          </div>
          <div className="h-[300px]">
            {dataBarra && <Bar data={dataBarra} options={baseOptions} />}
          </div>
        </div>

        {/* Gráfico Secundario (Distribución en Dona) */}
        {dataDoughnut && (
          <div
            id="contenedor-chart-dona"
            className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {tituloDoughnut}
              </h3>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut data={dataDoughnut} options={doughnutOptions} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
