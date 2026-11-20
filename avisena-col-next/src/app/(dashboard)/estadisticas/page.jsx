'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Send,
  HelpCircle,
  Activity,
  Layers,
  DollarSign,
  Info
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EstadisticasPage() {
  // ─── FILTROS Y PARÁMETROS ───
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [galpon, setGalpon] = useState('todos');
  const [modulo, setModulo] = useState('general');
  const [filtroPreset, setFiltroPreset] = useState('todos');

  // ─── ESTADOS DE DATOS ───
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // ─── ASISTENTE IA OLLAMA ───
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiEngineStatus, setAiEngineStatus] = useState({ model: '', active: false });

  // ─── PAGINACIÓN TABLA ───
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const recordsPerPage = 7;

  // ─── CARGA INICIAL Y SINCRONIZACIÓN AUTOMÁTICA ───
  useEffect(() => {
    syncLocalAndFetch();
  }, [fechaInicio, fechaFin, galpon, modulo]);

  // Aplica presets de fecha
  const aplicarPresetFechas = (preset) => {
    setFiltroPreset(preset);
    const hoy = new Date();
    if (preset === '7dias') {
      const inicio = new Date(hoy.getTime() - 7 * 86400000);
      setFechaInicio(inicio.toISOString().slice(0, 10));
      setFechaFin(hoy.toISOString().slice(0, 10));
    } else if (preset === '30dias') {
      const inicio = new Date(hoy.getTime() - 30 * 86400000);
      setFechaInicio(inicio.toISOString().slice(0, 10));
      setFechaFin(hoy.toISOString().slice(0, 10));
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  };

  /**
   * Sincroniza datos que el usuario haya guardado en su navegador (localStorage)
   * hacia la base de datos SQL del servidor y luego consulta las estadísticas agregadas.
   */
  const syncLocalAndFetch = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Sincronizar registros del cliente si existen en localStorage
      if (typeof window !== 'undefined') {
        const localData = {
          producciones: JSON.parse(localStorage.getItem('produccionesPendientes') || '[]'),
          clasificaciones: JSON.parse(localStorage.getItem('avisena_storage') || '[]'),
          mortalidad: JSON.parse(localStorage.getItem('registrosMortalidad') || '[]'),
          morbilidad: JSON.parse(localStorage.getItem('historialMorbilidad') || '[]'),
          finanzas: JSON.parse(localStorage.getItem('avisena_transacciones') || '[]')
        };

        const totalLocalRecords =
          localData.producciones.length +
          localData.clasificaciones.length +
          localData.mortalidad.length +
          localData.morbilidad.length +
          localData.finanzas.length;

        if (totalLocalRecords > 0) {
          setSyncing(true);
          await fetch('/api/estadisticas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localData)
          }).catch((e) => console.warn('Sync opcional no completado:', e));
          setSyncing(false);
        }
      }

      // 2. Consultar estadísticas calculadas desde la base de datos
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      if (galpon !== 'todos') params.append('galpon', galpon);
      if (modulo !== 'general') params.append('modulo', modulo);

      const res = await fetch(`/api/estadisticas?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Error al obtener estadísticas`);

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error en la respuesta');

      setStats(data);

      // Iniciar el panel de IA con un diagnóstico predeterminado si está vacío
      if (aiMessages.length === 0 && data.conclusiones) {
        setAiMessages([
          {
            role: 'assistant',
            content: data.conclusiones.join('\n\n')
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  // ─── CONSULTAR OLLAMA IA ───
  const handleAskAI = async (questionToAsk) => {
    const q = (questionToAsk || aiQuestion).trim();
    if (!q || aiLoading || !stats) return;

    const userMsg = { role: 'user', content: q };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/estadisticas/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          statsSummary: stats,
          history: aiMessages.slice(-4)
        })
      });

      const data = await res.json();
      setAiEngineStatus({
        model: data.model || 'Local Heuristics',
        active: !data.fallback
      });

      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || data.error || 'Sin respuesta',
          fallback: data.fallback,
          instruction: data.instruction
        }
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No fue posible comunicar con el motor de IA. Revisa si Ollama está en ejecución.',
          fallback: true
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // ─── EXPORTACIONES ───
  const exportarAExcel = () => {
    if (!stats) return;
    const wb = XLSX.utils.book_new();

    // Hoja 1: KPIs
    const kpiData = [
      ['Indicador', 'Valor', 'Variación'],
      ['Total Huevos Producidos', stats.kpis?.totalHuevosProducidos, `${stats.kpis?.variacionProduccion}%`],
      ['Huevos Buenos (Aptos)', stats.kpis?.totalHuevosBuenos, `${stats.kpis?.porcentajeHuevosBuenos}%`],
      ['Huevos Rotos', stats.kpis?.totalHuevosRotos, ''],
      ['Huevos Descarte', stats.kpis?.totalHuevosDescarte, ''],
      ['Total Mortalidad Aves', stats.kpis?.totalMortalidad, `${stats.kpis?.variacionMortalidad}%`],
      ['Aves Afectadas Morbilidad', stats.kpis?.totalMorbilidadAfectados, ''],
      ['Ingresos Totales (COP)', stats.kpis?.ingresosTotales, ''],
      ['Gastos Totales (COP)', stats.kpis?.gastosTotales, ''],
      ['Balance Neto (COP)', stats.kpis?.balanceFinanciero, '']
    ];
    const wsKpis = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKpis, 'Resumen_KPIs');

    // Hoja 2: Serie Temporal
    if (stats.tendencias?.produccion?.length) {
      const wsProd = XLSX.utils.json_to_sheet(stats.tendencias.produccion);
      XLSX.utils.book_append_sheet(wb, wsProd, 'Produccion_Diaria');
    }

    // Hoja 3: Galpones
    if (stats.distribuciones?.porGalpon?.length) {
      const wsGalp = XLSX.utils.json_to_sheet(stats.distribuciones.porGalpon);
      XLSX.utils.book_append_sheet(wb, wsGalp, 'Rendimiento_Galpones');
    }

    XLSX.writeFile(wb, `AVISENA_Estadisticas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportarAPDF = () => {
    if (!stats) return;
    const doc = new jsPDF();

    doc.setFillColor(70, 200, 25);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AVISENA COL - INFORME ESTADÍSTICO Y ANALÍTICO', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')} | Periodo: ${stats.periodo?.inicio} al ${stats.periodo?.fin}`, 14, 18);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Indicadores Clave de Desempeño (KPIs)', 14, 34);

    const kpiRows = [
      ['Total Huevos Producidos', stats.kpis?.totalHuevosProducidos?.toLocaleString('es-CO'), `${stats.kpis?.variacionProduccion}%`],
      ['Huevos Buenos (Calidad Comercial)', stats.kpis?.totalHuevosBuenos?.toLocaleString('es-CO'), `${stats.kpis?.porcentajeHuevosBuenos}%`],
      ['Huevos Rotos y Descarte', `${(stats.kpis?.totalHuevosRotos || 0) + (stats.kpis?.totalHuevosDescarte || 0)}`, ''],
      ['Mortalidad Acumulada', `${stats.kpis?.totalMortalidad || 0} aves`, `${stats.kpis?.variacionMortalidad}%`],
      ['Balance Financiero Operativo', `$${(stats.kpis?.balanceFinanciero || 0).toLocaleString('es-CO')}`, '']
    ];

    autoTable(doc, {
      startY: 38,
      head: [['Métrica', 'Valor Registrado', 'Variación vs Periodo Previo']],
      body: kpiRows,
      theme: 'striped',
      headStyles: { fillColor: [40, 140, 20] }
    });

    const nextY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Diagnóstico y Conclusiones Técnicas', 14, nextY);

    const conclusionLines = (stats.conclusiones || []).map((c) => [c]);
    autoTable(doc, {
      startY: nextY + 4,
      head: [['Conclusión y Hallazgo Estadístico']],
      body: conclusionLines,
      theme: 'grid',
      headStyles: { fillColor: [50, 60, 80] }
    });

    doc.save(`AVISENA_Reporte_Estadistico_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportarACSV = () => {
    if (!stats?.tendencias?.produccion?.length) return;
    const headers = ['Fecha', 'Huevos Buenos', 'Huevos Rotos', 'Descarte', 'Total'];
    const rows = stats.tendencias.produccion.map((r) => [r.fecha, r.buenos, r.rotos, r.descarte, r.total]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `produccion_estadisticas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── CONFIGURACIONES DE GRÁFICAS (CHART.JS) ───
  const lineChartData = useMemo(() => {
    const dates = stats?.tendencias?.produccion?.map((p) => p.fecha) || [];
    const buenos = stats?.tendencias?.produccion?.map((p) => p.buenos) || [];
    const rotos = stats?.tendencias?.produccion?.map((p) => p.rotos) || [];
    const descarte = stats?.tendencias?.produccion?.map((p) => p.descarte) || [];

    return {
      labels: dates,
      datasets: [
        {
          label: 'Huevos Buenos',
          data: buenos,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        },
        {
          label: 'Huevos Rotos',
          data: rotos,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          fill: false,
          tension: 0.3,
          borderWidth: 1.8
        },
        {
          label: 'Descarte',
          data: descarte,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          fill: false,
          tension: 0.3,
          borderWidth: 1.8
        }
      ]
    };
  }, [stats]);

  const barChartGalponData = useMemo(() => {
    const galpones = stats?.distribuciones?.porGalpon?.map((g) => g.galpon) || [];
    const totales = stats?.distribuciones?.porGalpon?.map((g) => g.totalHuevos) || [];
    const promedios = stats?.distribuciones?.porGalpon?.map((g) => g.promedioHuevosDiarios) || [];

    return {
      labels: galpones,
      datasets: [
        {
          label: 'Huevos Producidos',
          data: totales,
          backgroundColor: '#3b82f6',
          borderRadius: 8
        },
        {
          label: 'Promedio Diario',
          data: promedios,
          backgroundColor: '#10b981',
          borderRadius: 8
        }
      ]
    };
  }, [stats]);

  const doughnutHuevoData = useMemo(() => {
    const items = stats?.distribuciones?.calibreHuevos || [];
    return {
      labels: items.map((i) => `Tipo ${i.tipo}`),
      datasets: [
        {
          data: items.map((i) => i.cantidad),
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#64748b'],
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };
  }, [stats]);

  const doughnutMortaData = useMemo(() => {
    const items = stats?.distribuciones?.causasMortalidad || [];
    return {
      labels: items.map((i) => i.causa),
      datasets: [
        {
          data: items.map((i) => i.cantidad),
          backgroundColor: ['#ef4444', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#6b7280'],
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    };
  }, [stats]);

  // ─── FILTRADO Y PAGINACIÓN DE TABLA DETALLADA ───
  const filteredTableData = useMemo(() => {
    const list = stats?.tendencias?.produccion || [];
    if (!searchTerm) return list;
    return list.filter((r) => r.fecha.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [stats, searchTerm]);

  const totalPages = Math.ceil(filteredTableData.length / recordsPerPage) || 1;
  const currentTableRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredTableData.slice(start, start + recordsPerPage);
  }, [filteredTableData, currentPage]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ─── ENCABEZADO ─── */}
      <section className="bg-white dark:bg-[#0d121e] rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-[#1c2a44] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Estadísticas y Análisis Inteligente
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Monitoreo bioestadístico, cálculo de variaciones, detección de anomalías y consultoría con IA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={syncLocalAndFetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Recalcular indicadores desde la base de datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading || syncing ? 'animate-spin text-emerald-500' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Actualizar'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={exportarAExcel}
              disabled={!stats}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800"
              title="Descargar libro de cálculo en Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={exportarAPDF}
              disabled={!stats}
              className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer border border-rose-200 dark:border-rose-800"
              title="Descargar informe ejecutivo en PDF (.pdf)"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── BARRA DE FILTROS INTERACTIVOS ─── */}
      <section className="bg-white dark:bg-[#0d121e] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-[#1c2a44] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-sm">
            <Filter className="w-4 h-4 text-emerald-500" />
            <span>Filtros de Análisis</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => aplicarPresetFechas('todos')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filtroPreset === 'todos'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Histórico Completo
            </button>
            <button
              onClick={() => aplicarPresetFechas('7dias')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filtroPreset === '7dias'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => aplicarPresetFechas('30dias')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                filtroPreset === '30dias'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Últimos 30 días
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setFiltroPreset('custom');
              }}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setFiltroPreset('custom');
              }}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Galpón
            </label>
            <select
              value={galpon}
              onChange={(e) => setGalpon(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos los galpones</option>
              <option value="1">Galpón 1</option>
              <option value="2">Galpón 2</option>
              <option value="3">Galpón 3</option>
              <option value="4">Galpón 4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Módulo de Análisis
            </label>
            <select
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">Visión Integral (General)</option>
              <option value="produccion">Producción de Huevos</option>
              <option value="mortalidad">Mortalidad y Bajas</option>
              <option value="clasificacion">Calidad y Clasificación</option>
              <option value="finanzas">Finanzas y Rendimiento</option>
            </select>
          </div>
        </div>

        {stats?.metadatos && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>Fuente: {stats.metadatos.motorBaseDatos}</span>
            <span>Último cálculo: {new Date(stats.metadatos.ultimaActualizacion).toLocaleTimeString('es-CO')}</span>
          </div>
        )}
      </section>

      {/* ─── MENSAJE DE ERROR ─── */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── TARJETAS KPI PRINCIPALES ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Producción de Huevos */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                Producción Total
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats?.kpis?.totalHuevosProducidos?.toLocaleString('es-CO') || '0'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Promedio: {stats?.kpis?.promedioHuevosDiarios || 0} huevos/día
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                (stats?.kpis?.variacionProduccion || 0) >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}
            >
              {(stats?.kpis?.variacionProduccion || 0) >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {stats?.kpis?.variacionProduccion > 0 ? '+' : ''}
              {stats?.kpis?.variacionProduccion || 0}%
            </span>
            <span className="text-[11px] text-slate-400">vs periodo anterior</span>
          </div>
        </div>

        {/* KPI 2: Tasa de Calidad */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                Tasa de Calidad (Aptos)
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats?.kpis?.porcentajeHuevosBuenos || 0}%
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.kpis?.totalHuevosBuenos?.toLocaleString('es-CO') || 0} huevos buenos
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rotos: {stats?.kpis?.totalHuevosRotos || 0}</span>
            <span>Descarte: {stats?.kpis?.totalHuevosDescarte || 0}</span>
          </div>
        </div>

        {/* KPI 3: Mortalidad Acumulada */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                Mortalidad Acumulada
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                {stats?.kpis?.totalMortalidad || 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.kpis?.eventosMortalidad || 0} incidentes registrados
              </p>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                (stats?.kpis?.variacionMortalidad || 0) <= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
              }`}
            >
              {(stats?.kpis?.variacionMortalidad || 0) <= 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              {stats?.kpis?.variacionMortalidad > 0 ? '+' : ''}
              {stats?.kpis?.variacionMortalidad || 0}%
            </span>
            <span className="text-[11px] text-slate-400">vs periodo anterior</span>
          </div>
        </div>

        {/* KPI 4: Balance Financiero */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                Balance Operativo
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                ${Math.abs(stats?.kpis?.balanceFinanciero || 0).toLocaleString('es-CO')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {(stats?.kpis?.balanceFinanciero || 0) >= 0 ? 'Superávit neto' : 'Déficit operativo'}
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Ingresos: ${(stats?.kpis?.ingresosTotales || 0).toLocaleString('es-CO')}</span>
            <span>Gastos: ${(stats?.kpis?.gastosTotales || 0).toLocaleString('es-CO')}</span>
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN DE GRÁFICAS 1: TENDENCIA TEMPORAL Y COMPARATIVA GALPONES ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Líneas: Evolución de Producción */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Evolución Temporal de la Producción
              </h2>
              <p className="text-xs text-slate-500">
                Monitoreo diario de huevos aptos, roturas y descartes
              </p>
            </div>
            {stats?.tendencias?.produccionTrend && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Tendencia: {stats.tendencias.produccionTrend.direction} (m = {stats.tendencias.produccionTrend.slope})
              </span>
            )}
          </div>

          <div className="h-72 w-full">
            {stats?.tendencias?.produccion?.length ? (
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: { position: 'top', labels: { boxWidth: 12 } }
                  },
                  scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(200, 200, 200, 0.15)' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No hay registros para este periodo.
              </div>
            )}
          </div>
        </div>

        {/* Gráfica de Barras: Comparativa Galpones */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Rendimiento por Galpón
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Producción total acumulada vs promedio diario
          </p>

          <div className="h-72 w-full">
            {stats?.distribuciones?.porGalpon?.length ? (
              <Bar
                data={barChartGalponData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10 } }
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.15)' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sin datos de galpones.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN DE DISTRIBUCIONES: CALIBRE DE HUEVOS Y CAUSAS DE MORTALIDAD ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribución por Calibre */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Distribución por Calibre (Clasificación)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Participación porcentual de calibres AAA, AA, A, B, C y Jumbo
          </p>

          <div className="h-64 flex items-center justify-center">
            {stats?.distribuciones?.calibreHuevos?.length ? (
              <Doughnut
                data={doughnutHuevoData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12 } }
                  }
                }}
              />
            ) : (
              <span className="text-sm text-slate-400">Sin clasificaciones en el periodo</span>
            )}
          </div>
        </div>

        {/* Causas de Mortalidad */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Causas Principales de Mortalidad
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Diagnóstico de bajas biológicas y factores predisponentes
          </p>

          <div className="h-64 flex items-center justify-center">
            {stats?.distribuciones?.causasMortalidad?.length ? (
              <Doughnut
                data={doughnutMortaData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12 } }
                  }
                }}
              />
            ) : (
              <span className="text-sm text-slate-400">Mortalidad nula en este periodo</span>
            )}
          </div>
        </div>
      </section>

      {/* ─── ANOMALÍAS Y ESTADÍSTICAS DESCRIPTIVAS ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estadísticas Descriptivas (Media, Desviación, IQR) */}
        <div className="bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-500" />
            <span>Estadística Descriptiva</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Parámetros numéricos de la producción diaria
          </p>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Media Aritmética (μ):</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.descriptivas?.produccion?.mean || 0} huevos
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Mediana (Q2):</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.descriptivas?.produccion?.median || 0} huevos
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Desviación Estándar (σ):</span>
              <strong className="text-slate-800 dark:text-slate-200">
                ±{stats?.descriptivas?.produccion?.stdDev || 0}
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Rango Intercuartil (IQR):</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.descriptivas?.produccion?.iqr || 0} (Q1: {stats?.descriptivas?.produccion?.q1} - Q3: {stats?.descriptivas?.produccion?.q3})
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Mínimo / Máximo:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {stats?.descriptivas?.produccion?.min || 0} / {stats?.descriptivas?.produccion?.max || 0}
              </strong>
            </div>
          </div>
        </div>

        {/* Anomalías / Outliers Detectados */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d121e] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#1c2a44]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Valores Atípicos y Detección de Anomalías</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Eventos fuera de las vallas de Tukey (1.5 × IQR)
          </p>

          {stats?.anomalias?.length ? (
            <div className="space-y-3">
              {stats.anomalias.map((anomalia, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 mb-1">
                      {anomalia.categoria}: {anomalia.type}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Fecha: <strong>{anomalia.fecha}</strong> | Registro registrado:{' '}
                      <strong className="text-amber-800 dark:text-amber-300">{anomalia.metric}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Rango estadístico esperado: {anomalia.expectedRange?.min} a {anomalia.expectedRange?.max}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-800 uppercase">
                    Severidad {anomalia.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Comportamiento Estadístico Estable
              </p>
              <p className="text-xs text-slate-400 mt-1">
                No se registraron picos anómalos ni caídas atípicas fuera de los márgenes tolerables.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── ASISTENTE IA OLLAMA INTEGRADO ─── */}
      <section className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Asesor Estadístico Inteligente (Ollama)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80">
                Formula preguntas en lenguaje natural sobre las métricas calculadas de la granja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                aiEngineStatus.active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${aiEngineStatus.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {aiEngineStatus.active ? `Ollama Activo (${aiEngineStatus.model})` : 'Motor Heurístico Local'}
            </span>
          </div>
        </div>

        {/* Botones de preguntas predefinidas */}
        <div className="flex flex-wrap gap-2">
          {[
            '¿Cómo se compara la producción con el periodo anterior?',
            '¿Qué galpón es el más eficiente y cuál requiere inspección?',
            '¿Existen anomalías sanitarias o picos de mortalidad?',
            'Genera un plan de acción para optimizar la recolección'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleAskAI(prompt)}
              disabled={aiLoading}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors cursor-pointer border border-white/10 disabled:opacity-50"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Historial de la conversación */}
        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4 max-h-80 overflow-y-auto space-y-3 text-sm">
          {aiMessages.map((msg, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-emerald-600/30 border border-emerald-500/30 ml-8 text-right'
                  : 'bg-white/5 border border-white/10 mr-8 text-left'
              }`}
            >
              <div className="text-[11px] font-bold text-emerald-400 mb-1">
                {msg.role === 'user' ? 'Tú (Consulta Técnica)' : 'AVISENA Asistente IA'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-slate-100 text-xs sm:text-sm">
                {msg.content}
              </div>
              {msg.instruction && (
                <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-amber-300/90 font-mono">
                  ℹ️ {msg.instruction}
                </div>
              )}
            </div>
          ))}

          {aiLoading && (
            <div className="p-4 bg-white/5 rounded-xl flex items-center gap-3 text-emerald-300 text-xs animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analizando datos y procesando respuesta técnica...</span>
            </div>
          )}
        </div>

        {/* Input para formular preguntas */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAI();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Escribe tu consulta sobre los datos avícolas (ej: ¿Por qué aumentaron los rotos?)..."
            className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuestion.trim()}
            className="h-12 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </form>
      </section>

      {/* ─── TABLA DETALLADA DE REGISTROS ─── */}
      <section className="bg-white dark:bg-[#0d121e] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-[#1c2a44] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registros Consolidados por Fecha
            </h2>
            <p className="text-xs text-slate-500">
              Detalle cronológico de producción y calidad
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por fecha..."
              className="h-9 px-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={exportarACSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Fecha</th>
                <th className="py-3 px-4">Huevos Buenos</th>
                <th className="py-3 px-4">Huevos Rotos</th>
                <th className="py-3 px-4">Descarte</th>
                <th className="py-3 px-4">Total Producido</th>
                <th className="py-3 px-4 rounded-r-xl">Tasa de Aprobación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentTableRecords.map((row, index) => {
                const total = row.total || row.buenos + row.rotos + row.descarte;
                const pct = total > 0 ? Math.round((row.buenos / total) * 1000) / 10 : 0;
                return (
                  <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.fecha}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{row.buenos.toLocaleString('es-CO')}</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-medium">{row.rotos}</td>
                    <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-medium">{row.descarte}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{total.toLocaleString('es-CO')}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${pct >= 95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}

              {currentTableRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron registros en el rango seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Página {currentPage} de {totalPages} ({filteredTableData.length} registros)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
