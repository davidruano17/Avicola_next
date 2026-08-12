"use client";

import { useState } from "react";
import FiltrosReportes from "@/components/FiltrosReportes";
import TablaReportes from "@/components/TablaReportes";
import ResumenReportes from "@/components/ResumenReportes";
import GraficosReportes from "@/components/GraficosReportes";

export default function ReportesView() {
  const [filtros, setFiltros] = useState({
    tipoReporte: "",
    fechaInicio: "",
    fechaFin: "",
    galpon: "",
  });

  const [datos, setDatos] = useState([]);

  const [resumen, setResumen] = useState({
    totalRegistros: 0,
    totalCantidad: 0,
    promedio: 0,
    maximo: 0,
    minimo: 0,
    causaPrincipal: "Sin datos",
    galponPrincipal: "Sin datos",
  });

  function obtenerDatosReporte(tipo) {
    switch (tipo) {
      case "Mortalidad de aves": {
        const datosMortalidad =
          JSON.parse(localStorage.getItem("registrosMortalidad")) || [];

        return datosMortalidad;
      }

      case "Producción de huevos":
        return JSON.parse(localStorage.getItem("produccion")) || [];

      case "Clasificación de huevos":
        return JSON.parse(localStorage.getItem("clasificacion")) || [];

      case "Morbilidad de aves":
        return JSON.parse(localStorage.getItem("morbilidad")) || [];

      default:
        return [];
    }
  }
  const generarReporte = () => {
    const reportes = obtenerDatosReporte(filtros.tipoReporte);
    const filtrados = reportes.filter((item) => {
      const galponSeleccionado =
        filtros.galpon === "Galpón 1"
          ? "01"
          : filtros.galpon === "Galpón 2"
            ? "02"
            : "";

      const fechaItem = new Date(item.fecha);

      const fechaInicio = filtros.fechaInicio
        ? new Date(filtros.fechaInicio)
        : null;

      const fechaFin = filtros.fechaFin
        ? new Date(`${filtros.fechaFin}T23:59:59`)
        : null;

      return (
        (galponSeleccionado === "" || item.galpon === galponSeleccionado) &&
        (!fechaInicio || fechaItem >= fechaInicio) &&
        (!fechaFin || fechaItem <= fechaFin)
      );
    });
    const totalCantidad = filtrados.reduce(
      (acc, item) => acc + Number(item.cantidad),
      0,
    );

    const promedio =
      filtrados.length > 0 ? totalCantidad / filtrados.length : 0;

    const cantidades = filtrados.map((item) => Number(item.cantidad));

    const maximo = cantidades.length > 0 ? Math.max(...cantidades) : 0;

    const minimo = cantidades.length > 0 ? Math.min(...cantidades) : 0;

    const contadorCausas = {};

    filtrados.forEach((item) => {
      contadorCausas[item.causa] =
        (contadorCausas[item.causa] || 0) + item.cantidad;
    });

    const causaPrincipal =
      Object.keys(contadorCausas).length > 0
        ? Object.entries(contadorCausas).reduce((a, b) =>
            a[1] > b[1] ? a : b,
          )[0]
        : "Sin datos";

    const contadorGalpones = {};
    filtrados.forEach((item) => {
      contadorGalpones[item.galpon] =
        (contadorGalpones[item.galpon] || 0) + item.cantidad;
    });

    const galponPrincipal =
      Object.keys(contadorGalpones).length > 0
        ? Object.entries(contadorGalpones).reduce((a, b) =>
            a[1] > b[1] ? a : b,
          )[0]
        : "Sin datos";

    setResumen({
      totalRegistros: filtrados.length,
      totalCantidad,
      promedio: Number(promedio.toFixed(2)),
      maximo,
      minimo,
      causaPrincipal,
      galponPrincipal,
    });

    setDatos(filtrados);
  };

  return (
    <>
      <main className="bg-[#f6f7f8] dark:bg-[#141d1e] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <section className="flex h-full grow flex-col">
          <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="flex flex-col gap-1">
              <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">
                Generación de reportes
              </h1>
              <p className="text-slate-500 text-lg">
                Genera reportes relacionados con las actividades de tu unidad
                avícola como producción de huevos, clasificación de huevos,
                mortalidad y morbilidad de las aves.
              </p>
            </section>

            <FiltrosReportes
              filtros={filtros}
              setFiltros={setFiltros}
              generarReporte={generarReporte}
            />

            <ResumenReportes
              resumen={resumen}
              tipoReporte={filtros.tipoReporte}
            />

            <GraficosReportes datos={datos} tipoReporte={filtros.tipoReporte} />

            <TablaReportes datos={datos} filtros={filtros} resumen={resumen} />
          </main>
        </section>
      </main>
    </>
  );
}
