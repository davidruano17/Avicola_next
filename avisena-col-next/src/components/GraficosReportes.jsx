"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function GraficosReportes({ datos, tipoReporte }) {
  if (!datos || datos.length === 0) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Comportamiento del reporte
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          No hay datos suficientes para generar el gráfico.
        </p>
      </section>
    );
  }

  let tituloGrafico = "Cantidad registrada por fecha";
  let etiqueta = "Cantidad";

  switch (tipoReporte) {
    case "Mortalidad de aves":
      tituloGrafico = "Mortalidad de aves por fecha";
      etiqueta = "Aves fallecidas";
      break;

    case "Producción de huevos":
      tituloGrafico = "Producción de huevos por fecha";
      etiqueta = "Huevos producidos";
      break;

    case "Clasificación de huevos":
      tituloGrafico = "Clasificación de huevos por fecha";
      etiqueta = "Huevos clasificados";
      break;

    case "Morbilidad de aves":
      tituloGrafico = "Morbilidad de aves por fecha";
      etiqueta = "Aves enfermas";
      break;

    default:
      tituloGrafico = "Cantidad registrada por fecha";
      etiqueta = "Cantidad";
  }
  const cantidadesPorFecha = {};
  datos.forEach((item) => {
    const fecha = item.fecha;
    cantidadesPorFecha[fecha] =
      (cantidadesPorFecha[fecha] || 0) + Number(item.cantidad || 0);
  });
  const fechas = Object.keys(cantidadesPorFecha).sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const cantidades = fechas.map((fecha) => cantidadesPorFecha[fecha]);
  const data = {
    labels: fechas,
    datasets: [
      {
        label: etiqueta,
        data: cantidades,
        backgroundColor: "rgba(164, 251, 137, 0.36)",
        borderColor: "#49E619",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: tituloGrafico,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${etiqueta}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fecha",
        },
        grid: {
          color: "rgba(73, 230, 25, 0.08)",
        },
      },

      y: {
        beginAtZero: true,

        title: {
          display: true,
          text: etiqueta,
        },

        grid: {
          color: "rgba(73, 230, 25, 0.12)",
        },

        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 mb-6">
      <section className="mb-5">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Comportamiento del reporte
        </h2>
        <p className="text-lg text-slate-500 mt-1">
          Visualización del comportamiento de los registros durante el período
          seleccionado.
        </p>
      </section>
      <section className="h-87.5">
        <Bar data={data} options={options} />
      </section>
    </section>
  );
}
