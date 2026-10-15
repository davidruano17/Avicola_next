"use client";

import React, { useState, useEffect } from "react";
import ModalHistorial from "@/components/ModalHistorial";

const normalizarGalpon = (galpon) => String(galpon || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/^galpon\s*/i, "")
  .trim()
  .toLowerCase();

const DashboardProduccion = () => {

  /* ─── FECHA Y MES ─── */
  const obtenerFechaFormateada = () => {
    const ahora = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${ahora.getDate()} de ${meses[ahora.getMonth()]}, ${ahora.getFullYear()}`;
  };
  const obtenerNombreMes = () => {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return meses[new Date().getMonth()];
  };

  const hoy = new Date().toISOString().slice(0, 10);
  const mesActual = new Date().toISOString().slice(0, 7);
  const horaActual = new Date().toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  /* ─── MODALES ─── */
  const [isModalRecoleccionOpen, setIsModalRecoleccionOpen] = useState(false);
  const [isModalIcaAlimentoOpen, setIsModalIcaAlimentoOpen] = useState(false);
  const [isHistorialOpen, setIsHistorialOpen] = useState(false);

  /* ─── FORMULARIO RECOLECCIÓN ─── */
  const [fechaRecoleccion, setFechaRecoleccion] = useState(hoy);
  const [edadSemanasRecoleccion, setEdadSemanasRecoleccion] = useState("");
  const [nombrePerfil, setNombrePerfil] = useState("");
  const [nombreTrabajador, setNombreTrabajador] = useState("");
  const [galponOrigen, setGalponOrigen] = useState("Galpón 1");
  const [registrosGalpones, setRegistrosGalpones] = useState([]);
  const [huevosBuenos, setHuevosBuenos] = useState("");
  const [huevosRotosInput, setHuevosRotosInput] = useState("");
  const [descarte, setDescarte] = useState("");
  const [notas, setNotas] = useState("");
  const [hora, setHora] = useState(horaActual);
  const [jornada, setJornada] = useState("Mañana");
  const [lineaGenetica, setLineaGenetica] = useState("");

  /* ─── DATOS GLOBALES ─── */
  const [produccionesPendientes, setProduccionesPendientes] = useState([]);
  const [produccionEnEdicion, setProduccionEnEdicion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [alimentoInput, setAlimentoInput] = useState("");
  const [alimentoEnEdicion, setAlimentoEnEdicion] = useState(null);

  /* ─── PARÁMETROS FCR ─── */
  const [nroAves, setNroAves] = useState("1500");
  // ✅ Estándar técnico: 115 g/ave/día para gallina adulta ponedora
  const [gAve, setGAve] = useState("115");

  /* ─── ACUMULADORES MENSUALES ─── */
  const [alimentoMes, setAlimentoMes] = useState({
    mes: mesActual, registros: [], total: 0,
  });
  const [huevosMes, setHuevosMes] = useState({
    mes: mesActual, buenos: 0, rotos: 0, descarte: 0,
  });

  useEffect(() => {
    const cargarRegistrosGalpones = () => {
      try {
        const registrosGuardados = localStorage.getItem("historialgalpones");
        const registros = registrosGuardados ? JSON.parse(registrosGuardados) : [];
        if (!Array.isArray(registros)) {
          throw new Error("El historial de galpones no tiene un formato válido.");
        }
        setRegistrosGalpones(registros);
      } catch (error) {
        console.error("No se pudieron cargar las líneas genéticas de los galpones.", error);
        setRegistrosGalpones([]);
      }
    };

    cargarRegistrosGalpones();
    window.addEventListener("storage", cargarRegistrosGalpones);
    return () => window.removeEventListener("storage", cargarRegistrosGalpones);
  }, []);

  useEffect(() => {
    const cargarNombrePerfil = () => {
      const userId = localStorage.getItem("user_id") || "admin";
      const nombresPorUsuario = {
        admin: "Instructor Líder (Admin)",
        aprendiz: "Aprendiz Sena",
        investigador: "Instructor Investigador",
      };
      const nombrePorDefecto = nombresPorUsuario[userId] || nombresPorUsuario.admin;
      const perfilGuardado = localStorage.getItem(`user_profile_${userId}`);

      if (perfilGuardado) {
        try {
          const perfil = JSON.parse(perfilGuardado);
          if (typeof perfil?.name === "string" && perfil.name.trim()) {
            setNombrePerfil(perfil.name.trim());
            return;
          }
        } catch (error) {
          console.error("No se pudo cargar el nombre del perfil.", error);
        }
      }

      setNombrePerfil(nombrePorDefecto);
    };

    cargarNombrePerfil();
    window.addEventListener("storage", cargarNombrePerfil);
    return () => window.removeEventListener("storage", cargarNombrePerfil);
  }, []);

  useEffect(() => {
    if (isModalRecoleccionOpen && !produccionEnEdicion && nombrePerfil) {
      setNombreTrabajador(nombrePerfil);
    }
  }, [isModalRecoleccionOpen, produccionEnEdicion, nombrePerfil]);

  const obtenerLineasGeneticas = (galpon) => {
    const lineas = new Map();
    registrosGalpones.forEach(registro => {
      if (!registro || typeof registro !== "object") return;
      const linea = typeof registro.linea === "string" ? registro.linea.trim() : "";
      if (
        normalizarGalpon(registro.galpon || registro.lote) === normalizarGalpon(galpon)
        && linea
      ) {
        lineas.set(linea.toLocaleLowerCase(), linea);
      }
    });
    return Array.from(lineas.values());
  };
  const lineasGeneticasDisponibles = obtenerLineasGeneticas(galponOrigen);

  useEffect(() => {
    if (!isModalRecoleccionOpen) return;

    const lineaAnteriorDelGalpon = produccionEnEdicion
      && normalizarGalpon(produccionEnEdicion.galpon) === normalizarGalpon(galponOrigen)
      && lineaGenetica === produccionEnEdicion.lineaGenetica;
    if (lineaAnteriorDelGalpon || lineasGeneticasDisponibles.includes(lineaGenetica)) return;

    setLineaGenetica(lineasGeneticasDisponibles.length === 1 ? lineasGeneticasDisponibles[0] : "");
  }, [isModalRecoleccionOpen, galponOrigen, registrosGalpones, produccionEnEdicion, lineaGenetica]);

  /* ════════════════════════════════════════════
     CARGA INICIAL
  ════════════════════════════════════════════ */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const p = localStorage.getItem("produccionesPendientes");
      if (p) setProduccionesPendientes(JSON.parse(p));

      const h = localStorage.getItem("historial");
      if (h) setHistorial(JSON.parse(h));

      const params = localStorage.getItem("fcrParams");
      if (params) {
        const { n, g } = JSON.parse(params);
        if (n) setNroAves(n);
        if (g) setGAve(g);
      }

      const sa = localStorage.getItem(`alimentoMes_${mesActual}`);
      if (sa) setAlimentoMes(JSON.parse(sa));

      const sh = localStorage.getItem(`huevosMes_${mesActual}`);
      if (sh) setHuevosMes(JSON.parse(sh));
    } catch { }
  }, []);

  /* ─── PERSISTENCIA ─── */
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("produccionesPendientes", JSON.stringify(produccionesPendientes));
  }, [produccionesPendientes]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("historial", JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("fcrParams", JSON.stringify({ n: nroAves, g: gAve }));
  }, [nroAves, gAve]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(`alimentoMes_${mesActual}`, JSON.stringify(alimentoMes));
  }, [alimentoMes]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(`huevosMes_${mesActual}`, JSON.stringify(huevosMes));
  }, [huevosMes]);

  useEffect(() => {
    if (typeof window !== "undefined")
      document.body.style.overflow =
        isModalRecoleccionOpen || isModalIcaAlimentoOpen || isHistorialOpen
          ? "hidden" : "auto";
  }, [isModalRecoleccionOpen, isModalIcaAlimentoOpen, isHistorialOpen]);

  /* ════════════════════════════════════════════
     VALORES COMPUTADOS — KPI DIARIOS (DESDE HISTORIAL Y PENDIENTES)
  ════════════════════════════════════════════ */
  const recoleccionesHoy = historial.filter(h => h.fecha === hoy);
  const totalHuevosHoy = recoleccionesHoy.length > 0
    ? recoleccionesHoy.reduce((sum, h) => sum + Number(h.huevosBuenos || 0) + Number(h.huevosRotos || 0) + Number(h.descarte || 0), 0)
    : produccionesPendientes.reduce((sum, p) => sum + Number(p.huevosBuenos || 0) + Number(p.huevosRotos || 0) + Number(p.descarte || 0), 0);

  const totalRecoleccionesHoy = recoleccionesHoy.length > 0 ? recoleccionesHoy.length : produccionesPendientes.length;
  const cubetas = Math.floor(totalHuevosHoy / 30);
  const sueltos = totalHuevosHoy % 30;

  const nroAvesNum = Math.max(0, Number(nroAves) || 0);
  const gAveNum = Math.max(0, Number(gAve) || 0);
  const reqAlimentoKgDiario = (nroAvesNum * gAveNum) / 1000;
  const kTeoricoKgDia = reqAlimentoKgDiario;

  /* ─── AUTO-COMPLETAR ALIMENTO TEÓRICO AL ABRIR MODAL O CAMBIAR PARÁMETROS ─── */
  useEffect(() => {
    if (isModalIcaAlimentoOpen && !alimentoEnEdicion) {
      const teoricoStr = reqAlimentoKgDiario > 0 ? reqAlimentoKgDiario.toFixed(1) : "";
      setAlimentoInput(teoricoStr);
    }
  }, [isModalIcaAlimentoOpen, nroAves, gAve, alimentoEnEdicion]);

  /* ════════════════════════════════════════════════════════════════
     CÁLCULO FCR / CA MENSUAL — OPCIÓN B (ACUMULADA, RECOMENDADA)
     ──────────────────────────────────────────────────────────────
     Fórmula oficial avícola (postura):

       D  = Total huevos mes ÷ 12          (docenas producidas)
       K  = Alimento suministrado mes (kg) (registrado por usuario)
            Referencia teórica: (115 g × N° aves) ÷ 1000
       CA = K ÷ D                          (kg alimento / docena)

     Valores de referencia industria ponedoras:
       ≤ 1.3 → Óptimo
       ≤ 1.6 → Excelente
       ≤ 1.8 → Bueno
       ≤ 2.0 → Revisar consumo
       > 2.0 → Deficiente

     Nota: se valida Docenas > 0 antes de dividir (evita Infinity).
  ════════════════════════════════════════════════════════════════ */

  // K teórico diario: referencia visual para el usuario
  const bultosReferencia = kTeoricoKgDia / 50;
  const metaMensualKg = kTeoricoKgDia * 30;

  // Totales mensuales reales (incorporando historial para persisitir tras clasificaciones)
  const recoleccionesMes = historial.filter(h => h.fecha && h.fecha.slice(0, 7) === mesActual);
  const buenosMesCalc = recoleccionesMes.reduce((sum, h) => sum + Number(h.huevosBuenos || 0), 0);
  const rotosMesCalc = recoleccionesMes.reduce((sum, h) => sum + Number(h.huevosRotos || 0), 0);
  const descarteMesCalc = recoleccionesMes.reduce((sum, h) => sum + Number(h.descarte || 0), 0);

  const totalBuenosMes = Math.max(huevosMes.buenos, buenosMesCalc);
  const totalRotosMes = Math.max(huevosMes.rotos, rotosMesCalc);
  const totalDescarteMes = Math.max(huevosMes.descarte, descarteMesCalc);

  const totalAlimentoMes = alimentoMes.total;                            // K acumulado (kg)
  const totalHuevosMes = totalBuenosMes + totalRotosMes + totalDescarteMes;

  // D = Total huevos / 12
  const docenasMes = totalHuevosMes / 12;

  // CA = K / D  — validación: Docenas > 0
  const caCalculado = docenasMes > 0 && totalAlimentoMes > 0
    ? totalAlimentoMes / docenasMes
    : 0;

  // Display — toFixed(2) según spec técnica
  const caDisplay = caCalculado > 0 ? caCalculado.toFixed(2) : "—";

  // Porcentaje de meta de alimento cubierto
  const pctAlimentoCubierto = metaMensualKg > 0
    ? Math.min(100, (totalAlimentoMes / metaMensualKg) * 100) : 0;

  // ── BADGE DE EVALUACIÓN (recibe CA en kg/docena) ──────────────
  const getCaBadge = (ca) => {
    if (ca === 0) return { label: "Sin datos", color: "bg-slate-200 dark:bg-zinc-700 text-slate-500" };
    if (ca <= 1.3) return { label: "Óptimo", color: "bg-sky-500 text-white" };
    if (ca <= 1.6) return { label: "Excelente", color: "bg-[#2ea66d] text-white" };
    if (ca <= 1.8) return { label: "Bueno", color: "bg-emerald-500 text-white" };
    if (ca <= 2.0) return { label: "Revisar", color: "bg-amber-500 text-white" };
    return { label: "Deficiente", color: "bg-red-500 text-white" };
  };
  const caBadge = getCaBadge(caCalculado);

  /* ════════════════════════════════════════════
     HANDLERS
  ════════════════════════════════════════════ */
  const handleRecoleccionSubmit = (e) => {
    e.preventDefault();

    const nombreTrimmed = nombreTrabajador.trim();
    const edadTrimmed = edadSemanasRecoleccion.trim();

    if (!nombreTrimmed) { alert("El nombre del trabajador no puede estar vacío."); return; }
    if (!edadTrimmed) { alert("La edad en semanas es obligatoria."); return; }

    const produccion = {
      fecha: fechaRecoleccion,
      galpon: galponOrigen,
      hora: hora || horaActual,
      jornada,
      lineaGenetica,
      edadSemanas: edadTrimmed,
      trabajador: nombreTrimmed,
      huevosBuenos: Number(huevosBuenos || 0),
      huevosRotos: Number(huevosRotosInput || 0),
      descarte: Number(descarte || 0),
      notas: notas.trim(),
      clasificado: false,
    };

    if (produccionEnEdicion) {
      setHuevosMes(prev => ({
        ...prev,
        buenos: prev.buenos - produccionEnEdicion.huevosBuenos + produccion.huevosBuenos,
        rotos: prev.rotos - produccionEnEdicion.huevosRotos + produccion.huevosRotos,
        descarte: prev.descarte - produccionEnEdicion.descarte + produccion.descarte,
      }));
      setProduccionesPendientes(prev =>
        prev.map(item =>
          item.id === produccionEnEdicion.id ? { ...item, ...produccion } : item
        )
      );
      setHistorial(prev =>
        prev.map(h =>
          h.id === produccionEnEdicion.id
            ? {
              ...h,
              fecha: produccion.fecha,
              edad: `${produccion.edadSemanas} Semanas`,
              galpon: produccion.galpon,
              huevos: produccion.huevosBuenos + produccion.huevosRotos + produccion.descarte,
              trabajador: produccion.trabajador,
              huevosBuenos: produccion.huevosBuenos,
              huevosRotos: produccion.huevosRotos,
              descarte: produccion.descarte,
              hora: produccion.hora,
              jornada: produccion.jornada,
              lineaGenetica: produccion.lineaGenetica,
              notas: produccion.notas,
            }
            : h
        )
      );
      setProduccionEnEdicion(null);
    } else {
      const newId = Date.now();
      setHuevosMes(prev => ({
        ...prev,
        buenos: prev.buenos + produccion.huevosBuenos,
        rotos: prev.rotos + produccion.huevosRotos,
        descarte: prev.descarte + produccion.descarte,
      }));
      setProduccionesPendientes(prev => [{ id: newId, ...produccion }, ...prev]);
      setHistorial(prev => [{
        id: newId,
        fecha: produccion.fecha,
        edad: `${produccion.edadSemanas} Semanas`,
        galpon: produccion.galpon,
        huevos: produccion.huevosBuenos + produccion.huevosRotos + produccion.descarte,
        alimento: 0,
        trabajador: produccion.trabajador,
        huevosBuenos: produccion.huevosBuenos,
        huevosRotos: produccion.huevosRotos,
        descarte: produccion.descarte,
        hora: produccion.hora,
        jornada: produccion.jornada,
        lineaGenetica: produccion.lineaGenetica,
        notas: produccion.notas,
      }, ...prev]);
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
    setHora(produccion.hora || horaActual);
    setJornada(produccion.jornada || "Mañana");
    setHuevosBuenos(produccion.huevosBuenos.toString());
    setHuevosRotosInput(produccion.huevosRotos.toString());
    setDescarte(produccion.descarte.toString());
    setNotas(produccion.notas || "");
    setLineaGenetica(produccion.lineaGenetica || "");
    setIsModalRecoleccionOpen(true);
  };

  const handleLimpiarFormulario = () => {
    setFechaRecoleccion(hoy); setEdadSemanasRecoleccion("");
    setNombreTrabajador(nombrePerfil); setGalponOrigen("Galpón 1");
    setHora(horaActual); setJornada("Mañana");
    setHuevosBuenos(""); setHuevosRotosInput("");
    setDescarte(""); setNotas("");
    setLineaGenetica(""); setProduccionEnEdicion(null);
  };

  const clasificarProduccion = (produccion) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("produccionSeleccionada", JSON.stringify(produccion));
      window.location.href = "/registro_clasificacion";
    }
  };

  const handleAlimentoSubmit = (e) => {
    e.preventDefault();
    const kg = parseFloat(alimentoInput);
    if (!isNaN(kg) && kg > 0) {
      if (alimentoEnEdicion) {
        setAlimentoMes(prev => {
          const nuevosRegistros = prev.registros.map(r =>
            r.id === alimentoEnEdicion.id ? { ...r, kg } : r
          );
          const nuevoTotal = nuevosRegistros.reduce((sum, r) => sum + Number(r.kg || 0), 0);
          return {
            ...prev,
            registros: nuevosRegistros,
            total: +nuevoTotal.toFixed(2),
          };
        });
        setAlimentoEnEdicion(null);
      } else {
        setAlimentoMes(prev => {
          const nuevosRegistros = [...prev.registros, { id: Date.now(), fecha: hoy, kg }];
          const nuevoTotal = nuevosRegistros.reduce((sum, r) => sum + Number(r.kg || 0), 0);
          return {
            ...prev,
            registros: nuevosRegistros,
            total: +nuevoTotal.toFixed(2),
          };
        });
      }
    }
    const teoricoStr = reqAlimentoKgDiario > 0 ? reqAlimentoKgDiario.toFixed(1) : "";
    setAlimentoInput(teoricoStr);
  };

  const abrirEdicionAlimento = (registro) => {
    setAlimentoEnEdicion(registro);
    setAlimentoInput(registro.kg.toString());
  };

  const handleCancelarEdicionAlimento = () => {
    setAlimentoEnEdicion(null);
    const teoricoStr = reqAlimentoKgDiario > 0 ? reqAlimentoKgDiario.toFixed(1) : "";
    setAlimentoInput(teoricoStr);
  };

  const handleEliminarAlimento = (id) => {
    setAlimentoMes(prev => {
      const nuevosRegistros = prev.registros.filter(r => r.id !== id);
      const nuevoTotal = nuevosRegistros.reduce((sum, r) => sum + Number(r.kg || 0), 0);
      return {
        ...prev,
        registros: nuevosRegistros,
        total: +nuevoTotal.toFixed(2),
      };
    });
    if (alimentoEnEdicion && alimentoEnEdicion.id === id) {
      setAlimentoEnEdicion(null);
      const teoricoStr = reqAlimentoKgDiario > 0 ? reqAlimentoKgDiario.toFixed(1) : "";
      setAlimentoInput(teoricoStr);
    }
  };

  const handleResetAlimentoMes = () => {
    if (window.confirm("¿Resetear el alimento registrado este mes a 0 kg?"))
      setAlimentoMes(prev => ({ ...prev, total: 0, registros: [] }));
  };

  const handleResetHuevosMes = () => {
    if (window.confirm("¿Resetear el conteo de huevos del mes a 0?\nEsto afecta el FCR mensual."))
      setHuevosMes(prev => ({ ...prev, buenos: 0, rotos: 0, descarte: 0 }));
  };

  const handleExportHistorial = () => {
    if (!historial?.length) return;
    const headers = ["fecha", "hora", "jornada", "edad", "galpon", "lineaGenetica",
      "trabajador", "huevosBuenos", "huevosRotos", "descarte", "notas", "huevos", "alimento"];
    const rows = historial.map(h => [
      h.fecha, h.hora || "", h.jornada || "", h.edad, h.galpon, h.lineaGenetica || "",
      h.trabajador || "", h.huevosBuenos || 0, h.huevosRotos || 0,
      h.descarte || 0, h.notas || "", h.huevos, h.alimento || 0,
    ]);
    const csv = [headers.join(","),
    ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url; a.download = `historial_${hoy}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteItem = (i) => setHistorial(prev => prev.filter((_, idx) => idx !== i));
  const handleClearHistorial = () => {
    if (window.confirm("¿Borrar todo el historial? Esta acción no se puede deshacer."))
      setHistorial([]);
  };

  /* ─── Clase unificada para todos los inputs ─── */
  const inputCls = `mt-1.5 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200/50
    dark:border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:ring-1
    focus:ring-[#2ea66d] focus:border-[#2ea66d] font-semibold
    text-slate-800 dark:text-slate-200 outline-none`;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <main className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <section className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">

        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <section className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Registro de Producción de Huevos
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Lleva un control detallado de la producción diaria y monitorea la productividad de tus lotes.
            </p>
            <p className="text-slate-400 text-sm font-semibold flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-sm text-[#2ea66d]">calendar_month</span>
              {obtenerFechaFormateada()}
            </p>
          </section>
          <button
            onClick={() => setIsModalRecoleccionOpen(true)}
            className="bg-primary hover:bg-[#3dbd14] text-black px-5 py-2.5 rounded-xl font-bold
                       shadow-xl transition-all flex items-center gap-2 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Nueva Recolección
          </button>
        </header>

        {/* ── TARJETAS KPI ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 w-full">
          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Total Huevos Hoy</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                {totalHuevosHoy.toLocaleString()}
              </h3>
              {totalHuevosHoy > 0 && (
                <p className="text-xs text-slate-400 leading-none">
                  {cubetas} cubetas + {sueltos} sueltos
                  {" "}·{" "}
                  <span className="font-bold">{(totalHuevosHoy / 12).toFixed(1)} doc.</span>
                </p>
              )}
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">egg</span>
          </article>

          <article className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
            <section className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Total Recolecciones Hoy</p>
              <h3 className="text-3xl font-black text-[#2ea66d] leading-tight">{totalRecoleccionesHoy}</h3>
            </section>
            <span className="bg-[#2ea66d]/10 text-[#2ea66d] p-3 rounded-lg material-symbols-outlined font-bold">layers</span>
          </article>
        </section>

        {/* ══════════════════════════════════════════════════════
            BANNER FCR / CA MENSUAL
            Fórmula: CA = K (kg) ÷ D (docenas)
        ══════════════════════════════════════════════════════ */}
        <section className="w-full mb-8">
          <article className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-md
                              border border-slate-200 dark:border-zinc-800
                              flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#2ea66d] text-2xl p-2 bg-[#2ea66d]/10 rounded-xl">
                  insights
                </span>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                    Conversión Alimenticia (CA) — {obtenerNombreMes()}
                  </h3>
                  {/* Fórmula visible para el usuario */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    CA = K (kg alimento) ÷ D (docenas) &nbsp;·&nbsp; D = huevos ÷ 12 &nbsp;·&nbsp; K = {gAve}g × aves ÷ 1000
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">

                {/* K — Alimento del mes */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Alimento del Mes
                  </p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    {totalAlimentoMes.toFixed(1)}
                    <span className="text-xs font-normal text-slate-500 ml-1">kg</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ref. diaria: {kTeoricoKgDia.toFixed(1)} kg ({nroAves} aves × {gAve} g)
                  </p>
                </div>

                {/* D — Docenas del mes */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Docenas del Mes
                  </p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                    {docenasMes > 0 ? docenasMes.toFixed(1) : "—"}
                    <span className="text-xs font-normal text-slate-500 ml-1">doc.</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {totalHuevosMes.toLocaleString()} huevos ÷ 12
                    &nbsp;·&nbsp; B:{huevosMes.buenos} R:{huevosMes.rotos} D:{huevosMes.descarte}
                  </p>
                </div>

                {/* CA — Resultado FCR */}
                <div className="bg-[#e8f7f0] dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#278d5c] dark:text-emerald-400 uppercase tracking-wider">
                      CA — Mensual
                    </p>
                    <span className={`${caBadge.color} text-[9px] font-bold px-2 py-0.5 rounded-full`}>
                      {caBadge.label}
                    </span>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-[#0c2317] dark:text-emerald-300 mt-1 tabular-nums">
                    {caDisplay}
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
                      kg/docena
                    </span>
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Óptimo industria: 1.3 – 1.8 kg/doc.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalIcaAlimentoOpen(true)}
              className="bg-[#2ea66d] hover:bg-[#258758] text-white px-6 py-4 rounded-2xl font-bold
                         shadow-lg shadow-[#2ea66d]/20 transition-all flex items-center gap-2
                         cursor-pointer border-none whitespace-nowrap text-sm
                         self-stretch md:self-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              Gestionar Alimento
            </button>
          </article>
        </section>

        {/* ── TABLA PRODUCCIONES PENDIENTES ── */}
        <section className="w-full mb-8">
          <article className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm
                              border border-slate-100/80 dark:border-zinc-800/80 overflow-hidden">
            <header className="p-6 border-b border-slate-50 dark:border-zinc-800
                               flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-slate-800 dark:text-white font-bold text-lg">Producciones Pendientes</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Registros creados que aún no se han clasificado.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-xs font-bold bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {produccionesPendientes.length} pendientes
                </span>
                <button
                  onClick={() => setIsHistorialOpen(true)}
                  className="text-[#2ea66d] text-xs font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Ver Todo el Historial ({historial.length})
                </button>
              </div>
            </header>

            <section className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead className="bg-[#fcfdfd] dark:bg-zinc-900/80 text-slate-400 text-[10px]
                                  font-extrabold uppercase tracking-widest border-b border-slate-50 dark:border-zinc-800">
                  <tr>
                    {["Fecha", "Hora", "Jornada", "Galpón", "Línea", "Edad", "Buenos", "Rotos", "Descarte", "Trabajador", "Acciones"]
                      .map((h, i) => (
                        <th key={h} className={`px-4 py-4${i === 10 ? " text-right" : ""}`}>{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                  {produccionesPendientes.length > 0 ? (
                    produccionesPendientes.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.fecha}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.hora || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {item.jornada || "Mañana"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.galpon}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.lineaGenetica || "-"}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.edadSemanas} Sem.</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{item.huevosBuenos}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{item.huevosRotos}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.descarte}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.trabajador || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => clasificarProduccion(item)}
                              className="px-3 py-2 bg-[#3dbd14] hover:bg-[#2ea66d] text-black
                                         hover:text-white rounded-lg text-xs font-bold
                                         transition-all border-none cursor-pointer">
                              Clasificar
                            </button>
                            <button onClick={() => abrirEdicionProduccion(item)} title="Editar"
                              className="flex items-center justify-center h-8 w-8 rounded-lg
                                         text-slate-400 hover:text-[#2ea66d] hover:bg-slate-100
                                         dark:hover:bg-zinc-800 transition-all bg-transparent
                                         border border-[#2ea66d]/30 cursor-pointer">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="px-4 py-10 text-center text-sm text-slate-400">
                        No hay producciones pendientes de clasificar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </article>
        </section>

      </section>

      {/* ══════════════════════════════════
          MODALES
      ══════════════════════════════════ */}
      <ModalHistorial
        isOpen={isHistorialOpen}
        onClose={() => setIsHistorialOpen(false)}
        historial={historial}
        onExport={handleExportHistorial}
        onDeleteItem={handleDeleteItem}
        onClear={handleClearHistorial}
      />

      {/* ════════════════════════════════════════════════════════════
          MODAL FCR / CA — GESTIÓN DE ALIMENTO Y CÁLCULO MENSUAL
      ════════════════════════════════════════════════════════════ */}
      {isModalIcaAlimentoOpen && (
        <dialog open className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex
                                items-center justify-center min-h-screen p-4 m-0 w-full max-w-none">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalIcaAlimentoOpen(false)} />

          <article className="relative bg-white dark:bg-zinc-900 rounded-3xl text-left
                              overflow-y-auto shadow-2xl w-full max-w-4xl border
                              border-slate-100 dark:border-zinc-800 animate-slide-up z-10
                              p-6 sm:p-8 max-h-[90vh]">

            <header className="flex items-center justify-between mb-6 pb-3
                               border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                  <span className="material-symbols-outlined text-[#2ea66d] text-2xl">calculate</span>
                  Conversión Alimenticia — {obtenerNombreMes()}
                </h3>
                {/* Fórmula técnica completa */}
                <div className="mt-1.5 flex flex-col gap-0.5">
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    D = Total huevos ÷ 12 &nbsp;·&nbsp;
                    K = ({gAve} g × aves) ÷ 1000 &nbsp;·&nbsp;
                    <strong className="text-[#2ea66d]">CA = K ÷ D</strong>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Método Opción B (acumulada) — Total kg mes ÷ Total docenas mes
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalIcaAlimentoOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl
                           hover:bg-slate-100 dark:hover:bg-zinc-800 bg-transparent border-none cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="space-y-5">

              {/* ── GRID LADO A LADO ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* COLUMNA IZQUIERDA — REGISTRAR ALIMENTO (K) */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl
                                border border-slate-200/60 dark:border-zinc-800 space-y-4">

                  <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider
                                 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#2ea66d]">inventory_2</span>
                    Registrar   Alimento Suministrado
                  </h4>

                  {/* Referencia teórica con la fórmula */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl
                                  border border-amber-200/50 dark:border-amber-900/30
                                  text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <p className="font-bold">K teórico diario (estándar 115 g/ave):</p>
                    <p className="font-mono text-[11px]">
                      K = ({gAve} g × {nroAves} aves) ÷ 1000 =
                      <strong className="ml-1">{kTeoricoKgDia.toFixed(1)} kg/día</strong>
                    </p>
                    <p className="font-mono text-[11px]">
                      ≈ {bultosReferencia.toFixed(1)} bultos de 50 kg/día
                    </p>
                  </div>

                  {/* Parámetros editables */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col text-[10px] font-bold text-slate-500 uppercase">
                      Nº Gallinas
                      <input type="text" inputMode="numeric" value={nroAves}
                        onChange={e => setNroAves(e.target.value.replace(/[^\d]/g, ""))}
                        className="mt-1 bg-white dark:bg-zinc-900 border border-slate-200
                                   dark:border-zinc-800 rounded-lg text-xs py-2 px-2.5
                                   font-bold text-center text-slate-800 dark:text-slate-200
                                   focus:ring-1 focus:ring-[#2ea66d] outline-none" />
                    </label>
                    <label className="flex flex-col text-[10px] font-bold text-slate-500 uppercase">
                      g / Ave / Día
                      <input type="text" inputMode="numeric" value={gAve}
                        onChange={e => setGAve(e.target.value.replace(/[^\d]/g, ""))}
                        className="mt-1 bg-white dark:bg-zinc-900 border border-slate-200
                                   dark:border-zinc-800 rounded-lg text-xs py-2 px-2.5
                                   font-bold text-center text-slate-800 dark:text-slate-200
                                   focus:ring-1 focus:ring-[#2ea66d] outline-none" />
                    </label>
                  </div>

                  {/* Form: registrar kg reales */}
                  <form onSubmit={handleAlimentoSubmit} className="space-y-3">
                    {alimentoEnEdicion && (
                      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 font-bold">
                        <span>Editando entrada del {alimentoEnEdicion.fecha}</span>
                        <button type="button" onClick={handleCancelarEdicionAlimento} className="text-xs text-red-500 hover:underline cursor-pointer bg-transparent border-none">
                          Cancelar
                        </button>
                      </div>
                    )}
                    <label className="flex flex-col text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Cantidad suministrada (kg)
                      <input type="text" inputMode="decimal" placeholder="ej. 172.5"
                        value={alimentoInput}
                        onChange={e => setAlimentoInput(e.target.value.replace(/[^0-9.]/g, ""))}
                        className="mt-1 w-full bg-white dark:bg-zinc-900 border border-slate-200
                                   dark:border-zinc-800 rounded-xl py-2.5 px-3 text-base font-bold
                                   text-slate-800 dark:text-slate-200 focus:ring-2
                                   focus:ring-[#2ea66d]/50 outline-none" />
                    </label>
                    <div className="flex gap-2">
                      <button type="submit"
                        className="flex-1 bg-[#3dbd14] text-black font-bold py-3 rounded-xl
                                   hover:bg-[#2ea66d] hover:text-white transition-all
                                   cursor-pointer border-none text-xs">
                        {alimentoEnEdicion ? "Guardar Cambios" : "+ Agregar al Mes"}
                      </button>
                      <button type="button" onClick={handleResetAlimentoMes}
                        className="px-3 border border-red-200 dark:border-red-900/50 text-red-500
                                   font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20
                                   transition-all cursor-pointer bg-transparent text-xs">
                        Resetear
                      </button>
                    </div>
                  </form>

                  {/* Historial de registros */}
                  {alimentoMes.registros.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Entradas registradas ({alimentoMes.registros.length})
                      </p>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {[...alimentoMes.registros].reverse().map(r => (
                          <div key={r.id}
                            className="flex justify-between items-center text-xs bg-white dark:bg-zinc-900
                                       rounded-lg px-3 py-2 border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-500">{r.fecha}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{r.kg} kg</span>
                              <button type="button" onClick={() => abrirEdicionAlimento(r)}
                                title="Editar entrada"
                                className="text-[#2ea66d] hover:text-emerald-700 p-1 flex items-center bg-transparent border-none cursor-pointer">
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button type="button" onClick={() => handleEliminarAlimento(r.id)}
                                title="Eliminar entrada"
                                className="text-red-400 hover:text-red-600 p-1 flex items-center bg-transparent border-none cursor-pointer">
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA — ACUMULADO D y K del mes */}
                <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl
                                border border-slate-200/60 dark:border-zinc-800 space-y-4">

                  <h4 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider
                                 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#2ea66d]">analytics</span>
                    Acumulado — {obtenerNombreMes()}
                  </h4>

                  {/* K acumulado */}
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl
                                  border border-slate-200/80 dark:border-zinc-800 space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      K — Total Alimento Mes
                    </p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">
                      {totalAlimentoMes.toFixed(1)}
                      <span className="text-sm font-normal text-slate-500 ml-1">kg</span>
                    </p>
                    {metaMensualKg > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{pctAlimentoCubierto.toFixed(0)}% de la meta mensual</span>
                          <span>Meta: {metaMensualKg.toFixed(0)} kg</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${pctAlimentoCubierto}%`,
                              backgroundColor: pctAlimentoCubierto >= 100 ? "#2ea66d" : "#f59e0b",
                            }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* D acumulado */}
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl
                                  border border-slate-200/80 dark:border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Docenas del Mes
                        </p>
                        <p className="text-3xl font-black text-[#2ea66d] mt-1">
                          {docenasMes > 0 ? docenasMes.toFixed(1) : "0"}
                          <span className="text-sm font-normal text-slate-500 ml-1">doc.</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {totalHuevosMes} huevos ÷ 12
                        </p>
                      </div>
                      <button onClick={handleResetHuevosMes}
                        className="text-[10px] text-red-400 hover:text-red-600 font-bold
                                   bg-transparent border-none cursor-pointer mt-1">
                        Resetear
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg text-emerald-700 dark:text-emerald-300">
                        <p className="opacity-60 uppercase text-[9px]">Buenos</p>
                        <p className="text-lg font-black mt-0.5">{huevosMes.buenos.toLocaleString()}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg text-amber-700 dark:text-amber-300">
                        <p className="opacity-60 uppercase text-[9px]">Rotos</p>
                        <p className="text-lg font-black mt-0.5">{huevosMes.rotos.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg text-red-700 dark:text-red-300">
                        <p className="opacity-60 uppercase text-[9px]">Descarte</p>
                        <p className="text-lg font-black mt-0.5">{huevosMes.descarte.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ══ RESULTADO CA = K ÷ D ══ */}
              <div className="p-6 bg-[#e8f7f0] dark:bg-emerald-950/30 rounded-2xl
                              border border-emerald-100 dark:border-emerald-900/30">

                <div className="flex flex-col sm:flex-row items-start sm:items-center
                                justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#278d5c] dark:text-emerald-400 uppercase tracking-wider">
                      Resultado: Conversión Alimenticia (CA)
                    </span>
                    {/* Fórmula con valores reales */}
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      CA = {totalAlimentoMes.toFixed(1)} kg ÷ {docenasMes > 0 ? docenasMes.toFixed(1) : "0"} doc.
                      {caCalculado > 0 && ` = ${caDisplay} kg/docena`}
                    </p>
                  </div>
                  <span className={`${caBadge.color} px-4 py-1.5 rounded-full text-xs font-bold
                                   uppercase tracking-wider shrink-0`}>
                    {caBadge.label}
                  </span>
                </div>

                {/* Número grande */}
                <div className="flex flex-col sm:flex-row items-baseline gap-4 mb-6">
                  <div>
                    <p className="text-5xl font-black text-[#0c2317] dark:text-emerald-300
                                  tabular-nums leading-none">
                      {caDisplay}
                    </p>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                      kg de alimento por docena de huevos producida
                    </p>
                  </div>
                  {/* Ejemplo con datos actuales para verificar */}
                  {caCalculado > 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-xl px-4 py-3
                                    border border-emerald-200/50 dark:border-emerald-900/30 text-xs space-y-0.5">
                      <p className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">Verificación</p>
                      <p className="font-mono text-slate-600 dark:text-slate-300">
                        K = {totalAlimentoMes.toFixed(1)} kg
                      </p>
                      <p className="font-mono text-slate-600 dark:text-slate-300">
                        D = {totalHuevosMes} ÷ 12 = {docenasMes.toFixed(2)} doc.
                      </p>
                      <p className="font-mono font-bold text-[#2ea66d]">
                        CA = {caDisplay} kg/doc.
                      </p>
                    </div>
                  )}
                </div>

                {/* Escala de referencia con indicador activo */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Escala de referencia industria avícola (kg / docena)
                  </p>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {[
                      {
                        rango: "≤ 1.3", desc: "Óptimo", active: caCalculado > 0 && caCalculado <= 1.3,
                        cls: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                      },
                      {
                        rango: "1.3 – 1.6", desc: "Excelente", active: caCalculado > 1.3 && caCalculado <= 1.6,
                        cls: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      },
                      {
                        rango: "1.6 – 1.8", desc: "Bueno", active: caCalculado > 1.6 && caCalculado <= 1.8,
                        cls: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      },
                      {
                        rango: "1.8 – 2.0", desc: "Revisar", active: caCalculado > 1.8 && caCalculado <= 2.0,
                        cls: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      },
                      {
                        rango: "> 2.0", desc: "Deficiente", active: caCalculado > 2.0,
                        cls: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                      },
                    ].map(r => (
                      <div key={r.rango}
                        className={`rounded-xl border p-2.5 transition-all ${r.cls} ${r.active
                          ? "ring-2 ring-offset-1 ring-current scale-105 shadow-md"
                          : "opacity-35"
                          }`}>
                        <p className="text-[11px] font-black leading-none">{r.rango}</p>
                        <p className="text-[8px] font-bold uppercase tracking-wide mt-1">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </article>
        </dialog>
      )}

      {/* ── MODAL NUEVA / EDITAR RECOLECCIÓN ── */}
      {isModalRecoleccionOpen && (
        <dialog open className="fixed inset-0 z-50 overflow-y-auto bg-transparent flex
                                items-center justify-center min-h-screen p-4 m-0 w-full max-w-none">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { handleLimpiarFormulario(); setIsModalRecoleccionOpen(false); }} />

          <article className="relative bg-white dark:bg-zinc-900 rounded-3xl text-left
                              overflow-y-auto shadow-2xl w-full max-w-xl border
                              border-slate-100 dark:border-zinc-800 animate-slide-up z-10
                              p-6 sm:p-8 max-h-[95vh]">
            <header className="flex items-center justify-between mb-6 pb-2
                               border-b border-slate-50 dark:border-zinc-800">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#0c2317] dark:text-white">
                <span className="material-symbols-outlined text-[#2ea66d]">edit_note</span>
                {produccionEnEdicion ? "Editar Recolección" : "Nueva Recolección de Huevos"}
              </h3>
              <button
                onClick={() => { handleLimpiarFormulario(); setIsModalRecoleccionOpen(false); }}
                className="text-slate-400 hover:text-slate-700 p-1 bg-transparent border-none cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <form onSubmit={handleRecoleccionSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Fecha de Recolección *
                  <input type="date" value={fechaRecoleccion}
                    onChange={e => setFechaRecoleccion(e.target.value)}
                    required className={inputCls} />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Edad en Semanas *
                  <input type="text" inputMode="numeric" placeholder="ej. 22"
                    value={edadSemanasRecoleccion}
                    onChange={e => setEdadSemanasRecoleccion(e.target.value.replace(/[^\d]/g, ""))}
                    required className={inputCls} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Nombre del Trabajador *
                  <input type="text" placeholder="Ingresar nombre"
                    value={nombreTrabajador}
                    onChange={e => setNombreTrabajador(e.target.value)}
                    required className={inputCls} />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Galpón / Origen *
                  <select value={galponOrigen}
                    onChange={e => {
                      setGalponOrigen(e.target.value);
                      const lineas = obtenerLineasGeneticas(e.target.value);
                      setLineaGenetica(lineas.length === 1 ? lineas[0] : "");
                    }}
                    required className={inputCls}>
                    <option value="Galpón 1">Galpón 1</option>
                    <option value="Galpón 2">Galpón 2</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Hora de Recolección *
                  <input type="time" value={hora}
                    onChange={e => setHora(e.target.value)}
                    required className={inputCls} />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Jornada *
                  <select value={jornada}
                    onChange={e => setJornada(e.target.value)}
                    required className={inputCls}>
                    <option value="Mañana">Mañana</option>
                    <option value="Mediodía">Mediodía</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Línea Genética *
                  <select value={lineaGenetica}
                    onChange={e => setLineaGenetica(e.target.value)}
                    required className={inputCls}>
                    <option value="">
                      {lineasGeneticasDisponibles.length
                        ? "Seleccionar línea"
                        : "No hay líneas registradas para este galpón"}
                    </option>
                    {lineaGenetica && !lineasGeneticasDisponibles.includes(lineaGenetica) && (
                      <option value={lineaGenetica}>{lineaGenetica} (registro anterior)</option>
                    )}
                    {lineasGeneticasDisponibles.map(linea => (
                      <option key={linea} value={linea}>{linea}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Descarte *
                  <input type="text" inputMode="numeric"
                    placeholder="ej. 0"
                    value={descarte}
                    onChange={e => setDescarte(e.target.value.replace(/[^\d]/g, ""))}
                    required className={inputCls} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Buenos *
                  <input type="text" inputMode="numeric"
                    placeholder="ej. 450"
                    value={huevosBuenos}
                    onChange={e => setHuevosBuenos(e.target.value.replace(/[^\d]/g, ""))}
                    required className={inputCls} />
                </label>
                <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                  Huevos Rotos *
                  <input type="text" inputMode="numeric"
                    placeholder="ej. 2"
                    value={huevosRotosInput}
                    onChange={e => setHuevosRotosInput(e.target.value.replace(/[^\d]/g, ""))}
                    required className={inputCls} />
                </label>
              </div>

              <label className="flex flex-col text-xs font-bold text-slate-500 uppercase">
                Notas <span className="normal-case font-normal text-slate-400">(Opcional)</span>
                <input type="text" placeholder="ej., Huevos dañados encontrados"
                  value={notas} onChange={e => setNotas(e.target.value)}
                  className={inputCls} />
              </label>

              <div className="flex flex-col sm:flex-row gap-4 pt-4
                             border-t border-slate-50 dark:border-zinc-800">
                <button type="submit"
                  className="flex-1 bg-primary hover:bg-[#3dbd14] text-black font-bold py-3
                             rounded-xl transition-all cursor-pointer text-sm border-none">
                  {produccionEnEdicion ? "Actualizar Registro" : "Guardar Registro"}
                </button>
                <button type="button" onClick={handleLimpiarFormulario}
                  className="flex-1 border border-[#3dbd14] text-black dark:text-white font-bold
                             py-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20
                             transition-all cursor-pointer text-sm bg-transparent">
                  Limpiar
                </button>
              </div>
            </form>
          </article>
        </dialog>
      )}

    </main>
  );
};

export default DashboardProduccion;