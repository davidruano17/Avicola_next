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

    // Producción de huevos
    totalHuevosBuenos: 0,
    totalHuevosRotos: 0,
    totalHuevosDescarte: 0,

    causaPrincipal: "Sin datos",
    categoriaPrincipal: "Sin datos",
    galponPrincipal: "Sin datos",
  });

  function obtenerDatosReporte(tipo) {
    switch (tipo) {
      case "Mortalidad de aves": {
        const datosMortalidad =
          JSON.parse(localStorage.getItem("registrosMortalidad")) || [];

        return datosMortalidad;
      }

      case "Producción de huevos": {
        const producciones =
          JSON.parse(localStorage.getItem("produccionesPendientes")) || [];

        return producciones.map((item) => ({
          ...item,
          cantidad: Number(item.huevosBuenos || 0),
          huevosBuenos: Number(item.huevosBuenos || 0),
          huevosRotos: Number(item.huevosRotos || 0),
          descarte: Number(item.descarte || 0),
        }));
      }

      case "Clasificación de huevos": {
        const clasificaciones =
          JSON.parse(localStorage.getItem("avisena_storage")) || [];

        return clasificaciones.map((item) => ({
          ...item,
          cantidad: Number(item.unidades || 0),
        }));
      }

      case "Morbilidad de aves": {
        const morbilidad =
          JSON.parse(localStorage.getItem("historialMorbilidad")) || [];

        return morbilidad.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad || 0),
        }));
      }

      default:
        return [];
    }
  }
  const generarReporte = () => {
    const reportes = obtenerDatosReporte(filtros.tipoReporte);

    const filtrados = reportes.filter((item) => {
      const fechaItem = new Date(item.fecha);

      const fechaInicio = filtros.fechaInicio
        ? new Date(`${filtros.fechaInicio}T00:00:00`)
        : null;

      const fechaFin = filtros.fechaFin
        ? new Date(`${filtros.fechaFin}T23:59:59`)
        : null;

      return (
        (!filtros.galpon || item.galpon === filtros.galpon) &&
        (!fechaInicio || fechaItem >= fechaInicio) &&
        (!fechaFin || fechaItem <= fechaFin)
      );
    });

    const cantidades = filtrados.map((item) => Number(item.cantidad || 0));

    let totalHuevosBuenos = 0;
    let totalHuevosRotos = 0;
    let totalHuevosDescarte = 0;

    if (filtros.tipoReporte === "Producción de huevos") {
      totalHuevosBuenos = filtrados.reduce(
        (total, item) => total + Number(item.huevosBuenos || 0),
        0,
      );

      totalHuevosRotos = filtrados.reduce(
        (total, item) => total + Number(item.huevosRotos || 0),
        0,
      );

      totalHuevosDescarte = filtrados.reduce(
        (total, item) => total + Number(item.descarte || 0),
        0,
      );
    }

    const totalCantidad = cantidades.reduce(
      (acc, cantidad) => acc + cantidad,
      0,
    );

    const promedio =
      cantidades.length > 0 ? totalCantidad / cantidades.length : 0;

    const maximo = cantidades.length > 0 ? Math.max(...cantidades) : 0;

    const minimo = cantidades.length > 0 ? Math.min(...cantidades) : 0;

    let causaPrincipal = "Sin datos";

    if (filtros.tipoReporte === "Mortalidad de aves") {
      const contadorCausas = {};

      filtrados.forEach((item) => {
        if (!item.causa) return;

        contadorCausas[item.causa] =
          (contadorCausas[item.causa] || 0) + Number(item.cantidad || 0);
      });

      if (Object.keys(contadorCausas).length > 0) {
        causaPrincipal = Object.entries(contadorCausas).reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0];
      }
    }

    if (filtros.tipoReporte === "Morbilidad de aves") {
      const contadorSintomas = {};

      filtrados.forEach((item) => {
        if (!item.sintomas) return;

        const sintomas = item.sintomas
          .split(",")
          .map((sintoma) => sintoma.trim())
          .filter(Boolean);

        sintomas.forEach((sintoma) => {
          contadorSintomas[sintoma] =
            (contadorSintomas[sintoma] || 0) + Number(item.cantidad || 0);
        });
      });

      if (Object.keys(contadorSintomas).length > 0) {
        causaPrincipal = Object.entries(contadorSintomas).reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0];
      }
    }

    let categoriaPrincipal = "Sin datos";

    if (filtros.tipoReporte === "Clasificación de huevos") {
      const contadorCategorias = {};

      filtrados.forEach((item) => {
        if (!item.detalles) return;

        Object.entries(item.detalles).forEach(([categoria, datosCategoria]) => {
          const cantidad = Number(datosCategoria?.hoy || 0);

          if (cantidad > 0) {
            contadorCategorias[categoria] =
              (contadorCategorias[categoria] || 0) + cantidad;
          }
        });
      });

      if (Object.keys(contadorCategorias).length > 0) {
        categoriaPrincipal = Object.entries(contadorCategorias).reduce(
          (a, b) => (a[1] > b[1] ? a : b),
        )[0];
      }
    }

    const contadorGalpones = {};

    filtrados.forEach((item) => {
      if (!item.galpon) return;

      contadorGalpones[item.galpon] =
        (contadorGalpones[item.galpon] || 0) + Number(item.cantidad || 0);
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

      totalHuevosBuenos,
      totalHuevosRotos,
      totalHuevosDescarte,

      causaPrincipal,
      categoriaPrincipal,
      galponPrincipal,
    });

    setDatos(filtrados);
  };
  const cambiarTipoReporte = (e) => {
    const nuevoTipo = e.target.value;

    setFiltros({
      ...filtros,
      tipoReporte: nuevoTipo,
    });

    setDatos([]);

    setResumen({
      totalRegistros: 0,
      totalCantidad: 0,
      promedio: 0,
      maximo: 0,
      minimo: 0,
      causaPrincipal: "Sin datos",
      categoriaPrincipal: "Sin datos",
      galponPrincipal: "Sin datos",
    });
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
              cambiarTipoReporte={cambiarTipoReporte}
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
