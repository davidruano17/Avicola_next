"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ModalHistorial from "@/components/ModalHistorial";

const Page = () => {
  const obtenerFechaFormateada = () => {
    const ahora = new Date();
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${ahora.getDate()} ${meses[ahora.getMonth()]}, ${ahora.getFullYear()}`;
  };

  // Modales
  const [isModalRecoleccionOpen, setIsModalRecoleccionOpen] = useState(false);
  const [isModalAlimentoOpen, setIsModalAlimentoOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  // Formulario Recolección
  const [fechaRecoleccion, setFechaRecoleccion] = useState("2026-05-28");
  const [edadSemanasRecoleccion, setEdadSemanasRecoleccion] = useState("22");
  const [nombreTrabajador, setNombreTrabajador] = useState("John Doe");
  const [galponOrigen, setGalponOrigen] = useState("01"); // Se modifica el estado de Galpón Ponedoras - A a 01
  const [huevosBuenos, setHuevosBuenos] = useState("1220");
  const [huevosRotosInput, setHuevosRotosInput] = useState("20");
  const [descarte, setDescarte] = useState("0");
  const [notas, setNotas] = useState("");
  const [lote, setLote] = useState("");
  const [lineaGenetica, setLineaGenetica] = useState("");

  const [produccionesPendientes, setProduccionesPendientes] = useState([]);
  const [produccionesPendientesCargadas, setProduccionesPendientesCargadas] =
    useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("produccionesPendientes");
    setProduccionesPendientes(saved ? JSON.parse(saved) : []);
    setProduccionesPendientesCargadas(true);
  }, []);
  const [produccionEnEdicion, setProduccionEnEdicion] = useState(null);

  const [clasificacionData, setClasificacionData] = useState({
    aaa: { hoy: 420, ayer: 400, acumulado: 820, precioUsd: 0.18 },
    aa: { hoy: 380, ayer: 360, acumulado: 740, precioUsd: 0.15 },
    a: { hoy: 310, ayer: 290, acumulado: 600, precioUsd: 0.12 },
    b: { hoy: 110, ayer: 100, acumulado: 210, precioUsd: 0.09 },
    rotos: { hoy: 20, ayer: 15, acumulado: 35, precioUsd: 0.05 },
  });

  const [historial, setHistorial] = useState([
    {
      fecha: "24 oct, 2023",
      edad: "22 Semanas",
      galpon: "Galpón A",
      huevos: 420,
      alimento: 45.5,
    },
    {
      fecha: "24 oct, 2023",
      edad: "22 Semanas",
      galpon: "Galpón B",
      huevos: 380,
      alimento: 40.2,
    },
  ]);

  const [alimentoConsumido, setAlimentoConsumido] = useState(110.0);

  // Cálculo alimento
  const [nroAves, setNroAves] = useState("1000");
  const [gAve, setGAve] = useState("110");
  const [alimentoInput, setAlimentoInput] = useState("");

  const totalHuevos = Object.values(clasificacionData).reduce(
    (sum, item) => sum + Number(item.hoy || 0),
    0,
  );

  const reqAlimentoKg = (Number(nroAves || 0) * Number(gAve || 0)) / 1000;
  const bultosRequeridos = reqAlimentoKg / 50;
  const previewBultos = alimentoInput
    ? (parseFloat(alimentoInput) / 50).toFixed(1)
    : "0.0";

  const cubetas = Math.floor(totalHuevos / 30);
  const sueltos = totalHuevos % 30;
  const fcrScore =
    totalHuevos > 0
      ? (alimentoConsumido / (totalHuevos / 12)).toFixed(1)
      : "0.0";

  const handleRecoleccionSubmit = (e) => {
    e.preventDefault();

    const produccion = {
      fecha: fechaRecoleccion,
      galpon: galponOrigen,
      lote,
      lineaGenetica,
      edadSemanas: edadSemanasRecoleccion,
      trabajador: nombreTrabajador,
      huevosBuenos: Number(huevosBuenos),
      huevosRotos: Number(huevosRotosInput),
      descarte,
      notas,
      clasificado: false,
    };

    if (produccionEnEdicion) {
      setProduccionesPendientes((prev) =>
        prev.map((item) =>
          item.id === produccionEnEdicion.id
            ? {
                ...item,
                ...produccion,
              }
            : item,
        ),
      );
      setProduccionEnEdicion(null);
    } else {
      setProduccionesPendientes((prev) => [
        {
          id: Date.now(),
          ...produccion,
        },
        ...prev,
      ]);
    }

    handleLimpiarFormulario();
    setIsModalRecoleccionOpen(false);
  };

  const abrirEdicionProduccion = (produccion) => {
    setProduccionEnEdicion(produccion);
    setFechaRecoleccion(produccion.fecha);
    setEdadSemanasRecoleccion(produccion.edadSemanas);
    setNombreTrabajador(produccion.trabajador);
    setGalponOrigen(produccion.galpon);
    setHuevosBuenos(produccion.huevosBuenos.toString());
    setHuevosRotosInput(produccion.huevosRotos.toString());
    setDescarte(produccion.descarte.toString());
    setNotas(produccion.notas);
    setLote(produccion.lote);
    setLineaGenetica(produccion.lineaGenetica);
    setIsModalRecoleccionOpen(true);
  };

  const handleLimpiarFormulario = () => {
    setFechaRecoleccion("2026-05-28");
    setEdadSemanasRecoleccion("22");
    setNombreTrabajador("");
    setGalponOrigen("01");  // Se modifica el estado de Galpón Ponedoras - A a 01
    setHuevosBuenos("0");
    setHuevosRotosInput("0");
    setDescarte("0");
    setNotas("");
    setLote("");
    setLineaGenetica("");
    setProduccionEnEdicion(null);
  };

  const clasificarProduccion = (produccion) => {
    localStorage.setItem("produccionSeleccionada", JSON.stringify(produccion));
    window.location.href = "/registro_clasificacion";
  };

  const handleAlimentoSubmit = (e) => {
    e.preventDefault();

    const kg = parseFloat(alimentoInput);
    if (kg > 0) {
      setAlimentoConsumido((prev) => prev + kg);
    }

    setIsModalAlimentoOpen(false);
    setAlimentoInput("");
  };

  useEffect(() => {
    if (isModalRecoleccionOpen || isModalAlimentoOpen || isHistorialOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalRecoleccionOpen, isModalAlimentoOpen, isHistorialOpen]);

  useEffect(() => {
    if (!produccionesPendientesCargadas) return;
    localStorage.setItem(
      "produccionesPendientes",
      JSON.stringify(produccionesPendientes),
    );
  }, [produccionesPendientes, produccionesPendientesCargadas]);

  // Exportar historial a CSV
  const handleExportHistorial = () => {
    if (!historial || historial.length === 0) return;
    const headers = [
      "fecha",
      "edad",
      "galpon",
      "lote",
      "lineaGenetica",
      "trabajador",
      "huevosBuenos",
      "huevosRotos",
      "descarte",
      "notas",
      "huevos",
      "alimento",
      "clasificacion",
    ];
    const rows = historial.map((h) => [
      h.fecha,
      h.edad,
      h.galpon,
      h.lote || "",
      h.lineaGenetica || "",
      h.trabajador || "",
      h.huevosBuenos || 0,
      h.huevosRotos || 0,
      h.descarte || "",
      h.notas || "",
      h.huevos,
      h.alimento,
      h.clasificacion ? JSON.stringify(h.clasificacion) : "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteItem = (index) => {
    setHistorial((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearHistorial = () => {
    if (
      window.confirm(
        "¿Borrar todo el historial? Esta acción no se puede deshacer.",
      )
    ) {
      setHistorial([]);
    }
  };

  const weeklyData = [
    { day: "Lun", huevos: 65, alimento: 35 },
    { day: "Mar", huevos: 63, alimento: 37 },
    { day: "Mié", huevos: 70, alimento: 30 },
    { day: "Jue", huevos: 60, alimento: 40 },
    { day: "Vie", huevos: 68, alimento: 32 },
    { day: "Sáb", huevos: 72, alimento: 28 },
    { day: "Dom", huevos: 62, alimento: 38 },
  ];

  const historialVisible = historial.slice(0, 5);

  return (
    <main className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <section className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <section className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold mb-2">
              Registro de Producción de huevos
            </h1>
            <p className="text-slate-500 text-lg">
              Lleva un control detallado de la produccion diaria y monitorea el
              porcentaje de produccion y productividad de tus lotes.
            </p>
          </section>

          <button
            onClick={() => setIsModalRecoleccionOpen(true)}
            className="bg-primary hover:bg-[#3dbd14]  text-black px-5 py-2 rounded-xl font-bold shadow-xl transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              add_circle
            </span>
            Nueva Recolección
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">
                Total Huevos Hoy
              </p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {totalHuevos.toLocaleString()}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              egg
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">
                Edad de las Aves
              </p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                {edadSemanasRecoleccion} Semanas
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              calendar_today
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">
                Total Recolecciones Hoy
              </p>
              <h3 className="text-3xl font-black text-[#2ea66d] leading-tight">
                {historial.length + 1}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              layers
            </span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">
                Galpón Monitoreado
              </p>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[140px]">
                {galponOrigen}
              </h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">
              location_on
            </span>
          </article>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <section className="lg:col-span-2 space-y-8">
            <article className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <header className="flex justify-between items-center mb-6">
                <h3 className="text-[#3dbd14] dark:text-white font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                    trending_up
                  </span>
                  Índice de Conversión Alimenticia
                </h3>
                <span className="bg-[#2ea66d] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Bueno
                </span>
              </header>

              <section className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Alimento Consumido (KG)
                  </span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {alimentoConsumido.toFixed(1)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Producción Estimada
                  </span>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    {totalHuevos.toLocaleString()}
                  </p>
                </div>
              </section>

              <div className="flex items-center justify-between p-4 bg-[#e8f7f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/20 m-0">
                <div>
                  <p className="text-xs font-bold text-[#278d5c] dark:text-emerald-400">
                    Puntaje CA Actual
                  </p>
                  <p className="text-4xl font-black text-[#0c2317] dark:text-emerald-300 mt-1">
                    {fcrScore}
                  </p>
                </div>
                <span className="material-symbols-outlined text-4xl text-[#2ea66d]/20 font-bold">
                  monitoring
                </span>
              </div>
            </article>

            <article className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100/80 dark:border-zinc-800/80 overflow-hidden">
              <header className="p-6 border-b border-slate-50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-slate-800 dark:text-white font-bold">
                    Producciones Pendientes
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Registros creados en Producción que aún no se han
                    clasificado.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-xs font-bold">
                    {produccionesPendientes.length} pendientes
                  </span>
                  <button
                    onClick={() => setIsHistorialOpen(true)}
                    className="text-[#2ea66d] text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Ver Todo
                  </button>
                </div>
              </header>

              <section className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#fcfdfd] dark:bg-zinc-900 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest border-b border-slate-50 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-4">Fecha</th>
                      <th className="px-4 py-4">Galpón</th>
                      <th className="px-4 py-4">Lote</th>
                      <th className="px-4 py-4">Línea</th>
                      <th className="px-4 py-4">Edad</th>
                      <th className="px-4 py-4">Buenos</th>
                      <th className="px-4 py-4">Rotos</th>
                      <th className="px-4 py-4">Descarte</th>
                      <th className="px-4 py-4">Trabajador</th>
                      <th className="px-4 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                    {produccionesPendientes.length > 0 ? (
                      produccionesPendientes.slice(0, 5).map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.fecha}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.galpon}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.lote || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.lineaGenetica || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.edadSemanas} Semanas
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                            {item.huevosBuenos}
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                            {item.huevosRotos}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.descarte}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {item.trabajador || "-"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-3 h-full">
                              <button
                                type="button"
                                onClick={() => clasificarProduccion(item)}
                                className="inline-flex items-center justify-center min-w-[110px] h-10 bg-[#3dbd14] hover:bg-[#3dbd14] text-black rounded-lg text-sm font-semibold transition-all"
                              >
                                Clasificar
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirEdicionProduccion(item)}
                                className="flex items-center justify-center h-10 w-10 rounded-lg text-slate-400 hover:text-[#2ea66d] hover:bg-slate-100 transition-all bg-transparent border border-[#2ea66d]/30 cursor-pointer"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-xl">
                                  edit
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                        >
                          No hay producciones pendientes de clasificar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </article>
          </section>

          <aside className="space-y-8">
            <article className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100/80 dark:border-zinc-800/80 shadow-sm">
              <header className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                  calculate
                </span>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                  Cálculo de Alimento
                </h4>
              </header>

              <section className="space-y-5">
                <section className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Nro. de Aves
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nroAves}
                      onChange={(e) =>
                        setNroAves(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl text-sm py-2.5 px-3 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] text-slate-800 dark:text-slate-200 font-bold text-center"
                    />
                  </label>

                  <label className="flex flex-col text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    g / Ave
                    <input
                      type="text"
                      inputMode="numeric"
                      value={gAve}
                      onFocus={(e) => {
                        if (e.target.value === "0") setGAve("");
                      }}
                      onChange={(e) =>
                        setGAve(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl text-sm py-2.5 px-3 focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] text-slate-800 dark:text-slate-200 font-bold text-center"
                    />
                  </label>
                </section>

                <aside className="p-4 bg-[#e8f7f0] dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/10 flex justify-between items-center">
                  <section>
                    <p className="text-[10px] font-bold text-[#2ea66d] uppercase tracking-widest">
                      Requerimiento
                    </p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                      {reqAlimentoKg.toFixed(1)}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        kg
                      </span>
                    </p>
                  </section>
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold cursor-pointer hover:rotate-45 transition-transform">
                    sync
                  </span>
                </aside>

                <footer className="pt-4 border-t border-slate-50 dark:border-zinc-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Inventario
                  </p>

                  <header className="flex items-center justify-between gap-4">
                    <section className="bg-slate-50 dark:bg-zinc-950 px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                        Bultos (50kg)
                      </p>
                      <p className="font-extrabold text-sm mt-1.5 text-slate-800 dark:text-white">
                        {bultosRequeridos.toFixed(1)}
                      </p>
                    </section>

                    <button
                      onClick={() => setIsModalAlimentoOpen(true)}
                      className="bg-[#3dbd14] text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-[#278d5c] transition-all cursor-pointer shadow-sm border-none whitespace-nowrap"
                    >
                      Suministrar
                    </button>
                  </header>
                </footer>
              </section>
            </article>
          </aside>
        </section>

        <article className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-100/80 dark:border-zinc-800/80 mb-8">
          <header className="flex justify-between items-center mb-8">
            <h3 className="text-slate-800 dark:text-white font-bold">
              Tendencia Semanal de Producción
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#2ea66d] rounded-sm" /> Huevos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#bbf7d0] dark:bg-emerald-800 rounded-sm" />{" "}
                Alimento
              </span>
            </div>
          </header>

          <section className="flex justify-between items-end gap-2 sm:gap-4 h-64 px-2 sm:px-6">
            {weeklyData.map((data, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="w-full max-w-[40px] bg-slate-50 dark:bg-zinc-950/40 rounded-full h-48 flex flex-col justify-end overflow-hidden border border-slate-100 dark:border-zinc-900/50 relative shadow-inner">
                  <div
                    className="bg-[#bbf7d0] dark:bg-emerald-800/50 w-full rounded-t-full transition-all duration-700 ease-out group-hover:opacity-90"
                    style={{ height: `${data.alimento}%` }}
                  />
                  <div
                    className="bg-[#2ea66d] w-full rounded-b-full transition-all duration-700 ease-out group-hover:bg-[#278d5c]"
                    style={{ height: `${data.huevos}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 mt-1">
                  {data.day}
                </span>
              </div>
            ))}
          </section>
        </article>
      </section>

      <ModalHistorial
        isOpen={isHistorialOpen}
        onClose={() => setIsHistorialOpen(false)}
        historial={historial}
        onExport={handleExportHistorial}
        onDeleteItem={handleDeleteItem}
        onClear={handleClearHistorial}
      />

      {isModalRecoleccionOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              handleLimpiarFormulario();
              setIsModalRecoleccionOpen(false);
            }}
          />
          <article className="relative bg-white dark:bg-zinc-900 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-xl border border-slate-100 dark:border-zinc-800 animate-slide-up z-10 p-8">
            <header className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50 dark:border-zinc-800">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#0c2317] dark:text-white">
                <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                  edit_note
                </span>
                Registro de Recolección de Huevos
              </h3>
              <button
                onClick={() => {
                  handleLimpiarFormulario();
                  setIsModalRecoleccionOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 flex cursor-pointer bg-transparent border-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <form onSubmit={handleRecoleccionSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Fecha de Recolección
                  <input
                    type="date"
                    value={fechaRecoleccion}
                    onChange={(e) => setFechaRecoleccion(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Edad en Semanas
                  <input
                    type="text"
                    inputMode="numeric"
                    value={edadSemanasRecoleccion}
                    onChange={(e) =>
                      setEdadSemanasRecoleccion(
                        e.target.value.replace(/[^\d]/g, ""),
                      )
                    }
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Nombre del Trabajador
                  <input
                    type="text"
                    placeholder="Ingresar nombre"
                    value={nombreTrabajador}
                    onChange={(e) => setNombreTrabajador(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Galpón / Origen
                  <select
                    value={galponOrigen}
                    onChange={(e) => setGalponOrigen(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {/** Se modifica para que en lugar de Galpón Ponedoras, aparezca Galpón 01 o Galpón 02 */}
                    <option value="">Seleccione el galpón...</option>
                    <option value="01">Galpón 01</option>  
                    <option value="02">Galpón 02</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Lote
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800"
                  />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Línea Genética
                  <select
                    value={lineaGenetica}
                    onChange={(e) => setLineaGenetica(e.target.value)}
                    className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Hy-Line Brown">Hy-Line Brown</option>
                    <option value="Hy-Line W36">Hy-Line W36</option>
                    <option value="Lohmann Brown">Lohmann Brown</option>
                    <option value="ISA Brown">ISA Brown</option>
                    <option value="Dekalb White">Dekalb White</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Buenos
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={huevosBuenos}
                    onChange={(e) =>
                      setHuevosBuenos(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Rotos
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={huevosRotosInput}
                    onChange={(e) =>
                      setHuevosRotosInput(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Descarte
                  <input
                    type="text"
                    inputMode="numeric"
                    min="0"
                    value={descarte}
                    onChange={(e) =>
                      setDescarte(e.target.value.replace(/[^\d]/g, ""))
                    }
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Notas
                  <input
                    type="text"
                    placeholder="ej., Huevos dañados encontrados"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="mt-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1 focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold text-slate-800 dark:text-slate-200"
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50 dark:border-zinc-800">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-[#3dbd14]  text-black font-bold py-3 rounded-xl  transition-all cursor-pointer text-center text-sm shadow-sm border-none"
                >
                  {produccionEnEdicion
                    ? "Actualizar Registro"
                    : "Guardar Registro"}
                </button>
                <button
                  type="button"
                  onClick={handleLimpiarFormulario}
                  className="flex-1 border border-[#3dbd14] text-black font-bold py-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer text-center text-sm bg-transparent"
                >
                  Limpiar Formulario
                </button>
              </div>
            </form>
          </article>
        </dialog>
      )}

      {isModalAlimentoOpen && (
        <dialog
          open
          className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex items-center justify-center min-h-screen p-4 m-0 w-full max-w-none"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalAlimentoOpen(false)}
          />
          <article className="relative bg-white dark:bg-zinc-950 rounded-3xl text-left overflow-hidden shadow-2xl w-full max-w-md border border-slate-100 dark:border-zinc-800/80 animate-slide-up z-10">
            <section className="p-8">
              <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-[#2ea66d] font-bold">
                    inventory_2
                  </span>
                  Ingreso de Alimento
                </h3>
                <button
                  onClick={() => setIsModalAlimentoOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <form onSubmit={handleAlimentoSubmit} className="space-y-6">
                <label className="flex flex-col space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Tipo de Alimento
                  <select className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 py-3 px-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                    <option value="inicio">Inicio (0-4 semanas)</option>
                    <option value="crecimiento">
                      Crecimiento (5-18 semanas)
                    </option>
                    <option value="produccion">Producción (19+ semanas)</option>
                  </select>
                </label>

                <label className="flex flex-col space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Cantidad (kg)
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={alimentoInput}
                    onChange={(e) =>
                      setAlimentoInput(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-[#2ea66d]/50 py-3 px-4 text-lg font-bold text-slate-800 dark:text-slate-200"
                  />
                </label>

                <figure className="bg-primary/5 p-4 rounded-xl border border-primary/10 m-0">
                  <figcaption className="flex justify-between items-center text-xs text-primary font-bold uppercase tracking-wider mb-1">
                    Equivalente en Bultos
                  </figcaption>
                  <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                    {previewBultos}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      Bultos (50kg)
                    </span>
                  </p>
                </figure>

                <menu className="flex gap-4 mt-4 p-0">
                  <button
                    type="submit"
                    className="flex-1 bg-[#3dbd14] text-black font-bold py-4 rounded-xl hover:bg-[#3dbd14] transition-all cursor-pointer shadow-lg shadow-primary/20 border-none"
                  >
                    Registrar Entrada
                  </button>
                </menu>
              </form>
            </section>
          </article>
        </dialog>
      )}
    </main>
  );
};

export default Page;
