'use client';

import { useState } from "react";
import FiltrosReportes from '@/components/FiltrosReportes';
import TablaReportes from '@/components/TablaReportes';

export default function Page() {
  const [filtros, setFiltros] = useState({
    tipoReporte: "",
    fechaInicio: "",
    fechaFin: "",
    galpon: "",
  });

  const [datos, setDatos] = useState([]);

  const generarReporte = () => {
    // Se colocan datos como ejemplo para filtrar información
    const reportes = [
      {
        id: 1,
        tipo: "Producción de huevos",
        fecha: "2026-06-01",
        galpon: "Galpón 1",
        cantidad: 250,
      },
      {
        id: 2,
        tipo: "Producción de huevos",
        fecha: "2026-06-02",
        galpon: "Galpón 1",
        cantidad: 2,
      },
      {
        id: 3,
        tipo: "Clasificación de huevos",
        fecha: "2026-06-01",
        galpon: "Galpón 1",
        cantidad: 10,
      },
      {
        id: 4,
        tipo: "Clasificación de huevos",
        fecha: "2026-06-02",
        galpon: "Galpón 1",
        cantidad: 11,
      },
      {
        id: 5,
        tipo: "Mortalidad de aves",
        fecha: "2026-06-01",
        galpon: "Galpón 1",
        cantidad: 1,
      },
      {
        id: 6,
        tipo: "Mortalidad de aves",
        fecha: "2026-06-02",
        galpon: "Galpón 1",
        cantidad: 3,
      },
    ];

    const filtrados = reportes.filter((item) => {
      const fechaItem = new Date(item.fecha);
      const fechaInicio = filtros.fechaInicio
        ? new Date(filtros.fechaInicio)
        : null;

      const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;

      return (
        (filtros.tipoReporte === "" || item.tipo === filtros.tipoReporte) &&
        (filtros.galpon === "" || item.galpon === filtros.galpon) &&
        (!fechaInicio || fechaItem >= fechaInicio) &&
        (!fechaFin || fechaItem <= fechaFin)
      );
    });

    setDatos(filtrados);
  };

  return (
    <>
      <main className="bg-[#f6f7f8] dark:bg-[#141d1e] text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <section className="flex h-full grow flex-col">
          <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <section className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold mb-2">
                Generación de reportes
              </h1>
              <p className="text-slate-500 text-lg">
                Genera reportes relacionados con las actividades de tu unidad
                avícola como producción de huevos, clasificación de huevos,
                mortalidad y morbilidad de las aves, entre otras...
              </p>
            </section>

            <FiltrosReportes
              filtros={filtros}
              setFiltros={setFiltros}
              generarReporte={generarReporte}
            />

            <TablaReportes datos={datos} filtros={filtros} />

            
          </main>
        </section>
      </main>
    </>
  );
}
