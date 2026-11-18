"use client";

import { useMemo } from "react";
import { Calendar, RotateCcw, BarChart3, Filter } from "lucide-react";

export default function FiltrosReportes({
  filtros,
  setFiltros,
  listaGalpones = ["01", "02"],
  generarReporte,
  cambiarTipoReporte,
  limpiarFiltros,
}) {
  const handleChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  // Garantizar que 'Galpón 01' vaya primero y 'Galpón 02' de segundo
  const galponesOrdenados = useMemo(() => {
    const mapa = new Map();
    // Siempre asegurar 1 (01) y 2 (02) en las primeras posiciones
    mapa.set(1, "01");
    mapa.set(2, "02");

    (listaGalpones || []).forEach((g) => {
      if (!g) return;
      const limpio = String(g)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/^galp[oó]n\s*/i, "")
        .trim();
      const num = parseInt(limpio, 10);
      if (!isNaN(num) && num > 0) {
        if (!mapa.has(num)) {
          mapa.set(num, String(num).padStart(2, "0"));
        }
      } else if (limpio) {
        if (!mapa.has(limpio)) {
          mapa.set(limpio, limpio);
        }
      }
    });

    const claves = Array.from(mapa.keys());
    const numericos = claves
      .filter((k) => typeof k === "number")
      .sort((a, b) => a - b);
    const noNumericos = claves
      .filter((k) => typeof k !== "number")
      .sort((a, b) => String(a).localeCompare(String(b)));

    return [...numericos, ...noNumericos].map((k) => {
      const val = mapa.get(k);
      return {
        value: val,
        label: `Galpón ${val}`,
      };
    });
  }, [listaGalpones]);

  const valorSeleccionado = useMemo(() => {
    if (!filtros.galpon) return "";
    const norm = String(filtros.galpon)
      .replace(/^galp[oó]n\s*/i, "")
      .replace(/^0+/, "")
      .trim();
    const match = galponesOrdenados.find(
      (g) =>
        g.value === filtros.galpon ||
        g.value.replace(/^0+/, "") === norm
    );
    return match ? match.value : filtros.galpon;
  }, [filtros.galpon, galponesOrdenados]);

  const aplicarRangoFechas = (tipoRango) => {
    const hoy = new Date();
    const formatear = (d) => d.toISOString().split("T")[0];

    let inicio = "";
    let fin = formatear(hoy);

    if (tipoRango === "hoy") {
      inicio = fin;
    } else if (tipoRango === "7dias") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      inicio = formatear(d);
    } else if (tipoRango === "esteMes") {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      inicio = formatear(d);
    } else if (tipoRango === "mesAnterior") {
      const dInicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const dFin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      inicio = formatear(dInicio);
      fin = formatear(dFin);
    } else if (tipoRango === "esteAno") {
      inicio = `${hoy.getFullYear()}-01-01`;
    }

    setFiltros((prev) => ({
      ...prev,
      fechaInicio: inicio,
      fechaFin: fin,
    }));
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary/10 text-primary">
              <Filter className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Criterios de Consulta
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Selecciona el tipo de informe, galpón y ventana temporal para consolidar la información.
          </p>
        </div>

        {/* Accesos rápidos de fechas */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 sm:pt-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
            Rápido:
          </span>
          <button
            type="button"
            onClick={() => aplicarRangoFechas("hoy")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => aplicarRangoFechas("7dias")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            onClick={() => aplicarRangoFechas("esteMes")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Este mes
          </button>
          <button
            type="button"
            onClick={() => aplicarRangoFechas("mesAnterior")}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Mes anterior
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        {/* Tipo de Reporte */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Tipo de reporte <span className="text-red-500">*</span>
          </label>
          <select
            name="tipoReporte"
            value={filtros.tipoReporte}
            onChange={cambiarTipoReporte}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">Selecciona una opción...</option>
            <option value="Producción de huevos"> Producción de huevos</option>
            <option value="Clasificación de huevos"> Clasificación de huevos</option>
            <option value="Mortalidad de aves"> Mortalidad de aves</option>
            <option value="Morbilidad de aves"> Morbilidad de aves</option>
          </select>
        </div>

        {/* Galpón */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Galpón
          </label>
          <select
            name="galpon"
            value={valorSeleccionado}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">Todos los galpones</option>
            {galponesOrdenados.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha de Inicio */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha de inicio
          </label>
          <input
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          />
        </div>

        {/* Fecha de Fin */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha de fin
          </label>
          <input
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-medium text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={limpiarFiltros}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer
        </button>

        <button
          type="button"
          onClick={generarReporte}
          disabled={!filtros.tipoReporte}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-[#3dbd14] px-7 py-3 text-sm font-black text-slate-950 shadow-[0_8px_20px_rgba(73,230,25,0.25)] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <BarChart3 className="w-5 h-5 text-slate-950" />
          Generar Reporte
        </button>
      </div>
    </section>
  );
}
