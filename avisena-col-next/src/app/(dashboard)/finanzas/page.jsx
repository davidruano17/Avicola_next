'use client';

import React, { useState, useEffect } from "react";

// Precios estándar por panal según clasificación
const PRECIOS_POR_DEFECTO = {
  "C": 10500,
  "B": 12000,
  "A": 13500,
  "AA": 15000,
  "AAA": 16500,
  "Jumbo": 18000
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const partes = fechaStr.split("-");
  if (partes.length !== 3) return fechaStr;
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const anio = partes[0];
  const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
  const dia = partes[2];
  return `${dia} ${mes} ${anio}`;
};

const limpiarNumero = (valor) => {
  if (!valor) return "";
  return valor.toString().replace(/\D/g, "");
};

const formatConPuntos = (valor) => {
  const numeroLimpio = limpiarNumero(valor);
  if (!numeroLimpio) return "";
  return new Intl.NumberFormat("de-DE").format(parseInt(numeroLimpio, 10));
};

const obtenerFechaHoyStr = () => new Date().toISOString().split('T')[0];

const estadoInicialFormulario = {
  fecha: obtenerFechaHoyStr(),
  concepto: "",
  tipo: "Gasto",
  categoria: "Alimentos",
  galpon: "Galpón 1",
  monto: "",
  estado: "Completado",
  tipoHuevos: "C",
  panalesVendidos: "",
  precioPorPanal: "10500",
  cantidadInsumo: "",
  precioUnitarioInsumo: "",
  detalleVeterinario: "",
  asociarGastoInmediato: false,
  conceptoGastoAsociado: "",
  montoGastoAsociado: "",
  esMultiClasificada: false,
  desgloseInventario: []
};

export default function FinanzasAvicolas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [transacciones, setTransacciones] = useState([]);
  const [nuevaTransaccion, setNuevaTransaccion] = useState(estadoInicialFormulario);
  const [cargado, setCargado] = useState(false);

  // 1. CARGAR REGISTROS PREVIOS DE LOCALSTORAGE
  useEffect(() => {
    if (typeof window === "undefined") return;
    const datosGuardados = localStorage.getItem("avisena_transacciones");
    if (datosGuardados) {
      try {
        setTransacciones(JSON.parse(datosGuardados));
      } catch (e) {
        console.error("Error al leer transacciones de localStorage", e);
      }
    }
    setCargado(true);
  }, []);

  // 2. GUARDAR REGISTROS EN LOCALSTORAGE
  useEffect(() => {
    if (typeof window === "undefined" || !cargado) return;
    localStorage.setItem("avisena_transacciones", JSON.stringify(transacciones));
  }, [transacciones, cargado]);

  // 3. CAPTURAR E IMPORTAR DATOS DE CLASIFICACIÓN CON PRECIOS
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'importar_clasificacion') {
      const dataRaw = localStorage.getItem('avisena_transfer_data');
      if (dataRaw) {
        const registroClasif = JSON.parse(dataRaw);

        let montoTotalAcumulado = 0;
        let totalPanalesAcumulados = 0;
        const desgloseDetalles = [];
        const desgloseInventarioLote = [];
        const tipos = ['C', 'B', 'A', 'AA', 'AAA', 'Jumbo'];
        let primerTipoConDatos = "C";
        let primerPrecioConDatos = "10500";
        let asignoPrimero = false;

        tipos.forEach(t => {
          const det = registroClasif.detalles?.[t];
          if (det) {
            const tieneIngreso = det.hoy !== "" && det.hoy !== null && !isNaN(parseInt(det.hoy));
            const hoy = parseInt(det.hoy) || 0;
            const anterior = parseInt(det.anterior) || 0;
            const acumulado = tieneIngreso ? (hoy + anterior) : 0;
            const panalesCalculados = Math.floor(acumulado / 30);

            if (panalesCalculados > 0) {
              const precioEstablecido = det.precio ? parseInt(det.precio.toString().replace(/\D/g, "")) : (PRECIOS_POR_DEFECTO[t] || 12000);

              const subtotal = panalesCalculados * precioEstablecido;

              montoTotalAcumulado += subtotal;
              totalPanalesAcumulados += panalesCalculados;

              desgloseInventarioLote.push({
                clasificacion: t,
                unidades: acumulado,
                panales: panalesCalculados,
                precioPanal: precioEstablecido,
                subtotal: subtotal
              });

              desgloseDetalles.push(`${panalesCalculados} pnl [${t}]`);
              if (!asignoPrimero) {
                primerTipoConDatos = t;
                primerPrecioConDatos = precioEstablecido.toString();
                asignoPrimero = true;
              }
            }
          }
        });

        if (montoTotalAcumulado === 0 && registroClasif.total) {
          montoTotalAcumulado = parseInt(registroClasif.total.toString().replace(/[$. ]/g, '')) || 0;
          totalPanalesAcumulados = registroClasif.panales || 0;
          desgloseDetalles.push(`${totalPanalesAcumulados} pnl totales`);
        }

        setNuevaTransaccion({
          ...estadoInicialFormulario,
          fecha: obtenerFechaHoyStr(),
          concepto: `Venta Multi-Clasificada - Lote: ${registroClasif.lote || 'N/A'}`,
          tipo: "Ingreso",
          categoria: "Venta de Huevos",
          galpon: registroClasif.galpon ? `Galpón ${registroClasif.galpon}` : "Galpón 1",
          tipoHuevos: primerTipoConDatos,
          panalesVendidos: totalPanalesAcumulados.toString(),
          precioPorPanal: primerPrecioConDatos,
          monto: montoTotalAcumulado,
          detalleVeterinario: `Lote: ${registroClasif.lote || 'N/A'} | ${desgloseDetalles.join(" | ") || "Venta Multi-Clasificada"}`,
          esMultiClasificada: true,
          desgloseInventario: desgloseInventarioLote
        });

        setIsModalOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        localStorage.removeItem('avisena_transfer_data');
      }
    }
  }, []);

  const transaccionesFiltradasPorFecha = transacciones.filter(t => {
    if (fechaInicio && t.fecha < fechaInicio) return false;
    if (fechaFin && t.fecha > fechaFin) return false;
    return true;
  });

  const ingresosTotales = transaccionesFiltradasPorFecha
    .filter(t => t.tipo === "Ingreso")
    .reduce((acc, curr) => acc + curr.monto, 0);

  const gastosTotales = transaccionesFiltradasPorFecha
    .filter(t => t.tipo === "Gasto")
    .reduce((acc, curr) => acc + curr.monto, 0);

  const utilidadNeta = ingresosTotales - gastosTotales;

  const gastoAlimentos = transaccionesFiltradasPorFecha.filter(t => t.categoria === "Alimentos").reduce((acc, c) => acc + c.monto, 0);
  const gastoSalud = transaccionesFiltradasPorFecha.filter(t => t.categoria === "Salud/Vet").reduce((acc, c) => acc + c.monto, 0);
  const gastoInfraestructura = transaccionesFiltradasPorFecha.filter(t => t.categoria === "Infraestructura").reduce((acc, c) => acc + c.monto, 0);
  const ingresoHuevos = transaccionesFiltradasPorFecha.filter(t => t.categoria === "Venta de Huevos").reduce((acc, c) => acc + c.monto, 0);

  const pctAlimentos = gastosTotales > 0 ? Math.round((gastoAlimentos / gastosTotales) * 100) : 0;
  const pctSalud = gastosTotales > 0 ? Math.round((gastoSalud / gastosTotales) * 100) : 0;
  const pctInfraestructura = gastosTotales > 0 ? Math.round((gastoInfraestructura / gastosTotales) * 100) : 0;
  const pctIngresoHuevos = ingresosTotales > 0 ? Math.round((ingresoHuevos / ingresosTotales) * 100) : 0;

  const obtenerDatosGraficaFija = () => {
    const mesesEstructura = [
      { clave: "01", nombre: "ENE", ingresos: 0, gastos: 0 },
      { clave: "02", nombre: "FEB", ingresos: 0, gastos: 0 },
      { clave: "03", nombre: "MAR", ingresos: 0, gastos: 0 },
      { clave: "04", nombre: "ABR", ingresos: 0, gastos: 0 },
      { clave: "05", nombre: "MAY", ingresos: 0, gastos: 0 },
      { clave: "06", nombre: "JUN", ingresos: 0, gastos: 0 },
      { clave: "07", nombre: "JUL", ingresos: 0, gastos: 0 },
      { clave: "08", nombre: "AGO", ingresos: 0, gastos: 0 },
      { clave: "09", nombre: "SEP", ingresos: 0, gastos: 0 },
      { clave: "10", nombre: "OCT", ingresos: 0, gastos: 0 },
      { clave: "11", nombre: "NOV", ingresos: 0, gastos: 0 },
      { clave: "12", nombre: "DIC", ingresos: 0, gastos: 0 }
    ];

    transaccionesFiltradasPorFecha.forEach(t => {
      if (!t.fecha) return;
      const mesRegistro = t.fecha.split("-")[1];
      const mesEncontrado = mesesEstructura.find(m => m.clave === mesRegistro);

      if (mesEncontrado) {
        if (t.tipo === "Ingreso") mesEncontrado.ingresos += t.monto;
        else mesEncontrado.gastos += t.monto;
      }
    });

    const montosMaximos = mesesEstructura.map(m => Math.max(m.ingresos, m.gastos));
    const maximoAbsoluto = Math.max(...montosMaximos, 1);

    return mesesEstructura.map(m => ({
      mes: m.nombre,
      alturaIngresos: m.ingresos > 0 ? `${Math.min((m.ingresos / maximoAbsoluto) * 90, 95)}%` : "4%",
      alturaGastos: m.gastos > 0 ? `${Math.min((m.gastos / maximoAbsoluto) * 90, 95)}%` : "4%"
    }));
  };

  const datosGraficaFormateados = obtenerDatosGraficaFija();

  const transaccionesFiltradas = transaccionesFiltradasPorFecha.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      (t.concepto && t.concepto.toLowerCase().includes(query)) ||
      (t.categoria && t.categoria.toLowerCase().includes(query)) ||
      (t.galpon && t.galpon.toLowerCase().includes(query)) ||
      (t.detalle && t.detalle.toLowerCase().includes(query))
    );
  });

  const totalPaginas = Math.ceil(transaccionesFiltradas.length / registrosPorPagina) || 1;
  const registrosPaginados = transaccionesFiltradas.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina);

  const manejarCambioVenta = (campo, valor) => {
    const valorLimpio = limpiarNumero(valor);
    setNuevaTransaccion(prev => {
      const actualizacion = { ...prev, [campo]: valorLimpio };
      const vendidos = parseFloat(campo === "panalesVendidos" ? valorLimpio : prev.panalesVendidos) || 0;
      const precio = parseFloat(campo === "precioPorPanal" ? valorLimpio : prev.precioPorPanal) || 0;

      actualizacion.monto = Math.round(vendidos * precio);
      return actualizacion;
    });
  };

  const manejarCambioGasto = (campo, valor) => {
    const valorLimpio = limpiarNumero(valor);
    setNuevaTransaccion(prev => {
      const actualizacion = { ...prev, [campo]: valorLimpio };
      const cantidad = parseFloat(campo === "cantidadInsumo" ? valorLimpio : prev.cantidadInsumo) || 0;
      const precio = parseFloat(campo === "precioUnitarioInsumo" ? valorLimpio : prev.precioUnitarioInsumo) || 0;

      actualizacion.monto = Math.round(cantidad * precio);
      return actualizacion;
    });
  };

  const manejarToggleGastoAsociado = (checked) => {
    setNuevaTransaccion(prev => {
      const actualizacion = { ...prev, asociarGastoInmediato: checked };
      if (checked) {
        const ventaMonto = parseFloat(prev.monto) || 0;
        actualizacion.conceptoGastoAsociado = `Comisiones/Empaque - ${prev.concepto || "Venta de Huevos"}`;
        actualizacion.montoGastoAsociado = Math.round(ventaMonto * 0.10);
      } else {
        actualizacion.conceptoGastoAsociado = "";
        actualizacion.montoGastoAsociado = "";
      }
      return actualizacion;
    });
  };

  const manejarGuardarRegistro = (e) => {
    e.preventDefault();
    if (!nuevaTransaccion.concepto || !nuevaTransaccion.monto) return;

    const coloresCategorias = {
      "Alimentos": "bg-emerald-100 text-emerald-800",
      "Venta de Huevos": "bg-blue-100 text-blue-800",
      "Salud/Vet": "bg-rose-100 text-rose-800",
      "Infraestructura": "bg-amber-100 text-amber-800"
    };

    const coloresEstados = {
      "Completado": "bg-green-100 text-green-800",
      "Pendiente": "bg-yellow-100 text-yellow-800",
      "Atrasado": "bg-red-100 text-red-800"
    };

    const nuevosRegistros = [];

    const principalItem = {
      id: Date.now(),
      fecha: nuevaTransaccion.fecha || obtenerFechaHoyStr(),
      galpon: nuevaTransaccion.galpon,
      concepto: nuevaTransaccion.concepto,
      categoria: nuevaTransaccion.categoria,
      tipo: nuevaTransaccion.tipo,
      monto: parseFloat(nuevaTransaccion.monto),
      estado: nuevaTransaccion.estado,
      detalle: nuevaTransaccion.detalleVeterinario || "Operación registrada",
      tipoHuevos: nuevaTransaccion.tipo === "Ingreso" ? nuevaTransaccion.tipoHuevos : undefined,
      panalesVendidos: nuevaTransaccion.tipo === "Ingreso" ? (parseFloat(nuevaTransaccion.panalesVendidos) || 0) : undefined,
      precioPorPanal: nuevaTransaccion.tipo === "Ingreso" ? (parseFloat(nuevaTransaccion.precioPorPanal) || PRECIOS_POR_DEFECTO[nuevaTransaccion.tipoHuevos] || 12000) : undefined,
      catStyle: coloresCategorias[nuevaTransaccion.categoria] || "bg-slate-100 text-slate-800",
      estStyle: coloresEstados[nuevaTransaccion.estado],
      desgloseInventario: nuevaTransaccion.esMultiClasificada ? nuevaTransaccion.desgloseInventario : null
    };

    nuevosRegistros.push(principalItem);

    if (nuevaTransaccion.tipo === "Ingreso" && nuevaTransaccion.asociarGastoInmediato) {
      const montoGasto = parseFloat(nuevaTransaccion.montoGastoAsociado) || 0;
      if (montoGasto > 0) {
        const itemGasto = {
          id: Date.now() + 1,
          fecha: nuevaTransaccion.fecha || obtenerFechaHoyStr(),
          galpon: nuevaTransaccion.galpon,
          concepto: nuevaTransaccion.conceptoGastoAsociado || `Comisiones/Empaque - ${nuevaTransaccion.concepto}`,
          categoria: "Alimentos",
          tipo: "Gasto",
          monto: montoGasto,
          estado: "Completado",
          detalle: `Gasto operativo asociado a venta de huevos (10% costo estimado)`,
          catStyle: coloresCategorias["Alimentos"],
          estStyle: coloresEstados["Completado"]
        };
        nuevosRegistros.push(itemGasto);
      }
    }

    setTransacciones(prev => [...nuevosRegistros, ...prev]);
    setIsModalOpen(false);
    setPaginaActual(1);
    setNuevaTransaccion(estadoInicialFormulario);
  };

  const calcularMetricasPorClasificacion = (tipo) => {
    let vendidos = 0;
    let ingresos = 0;
    let conteoPrecios = 0;
    let sumaPrecios = 0;

    transaccionesFiltradasPorFecha.forEach(t => {
      if (t.categoria === "Venta de Huevos" && t.tipo === "Ingreso") {
        if (t.desgloseInventario) {
          const itemDesglose = t.desgloseInventario.find(d => d.clasificacion === tipo);
          if (itemDesglose) {
            vendidos += itemDesglose.panales;
            ingresos += itemDesglose.subtotal || (itemDesglose.panales * itemDesglose.precioPanal);
            if (itemDesglose.precioPanal > 0) {
              sumaPrecios += itemDesglose.precioPanal;
              conteoPrecios++;
            }
          }
        } else if (t.tipoHuevos === tipo) {
          vendidos += (t.panalesVendidos || 0);
          ingresos += t.monto;
          if (t.precioPorPanal > 0) {
            sumaPrecios += t.precioPorPanal;
            conteoPrecios++;
          }
        }
      }
    });

    const precioPromedio = conteoPrecios > 0 ? sumaPrecios / conteoPrecios : (PRECIOS_POR_DEFECTO[tipo] || 12000);
    return { vendidos, ingresos, precioPromedio };
  };

  return (
    <span className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased block">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <header>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#0f172a]">Control de Finanzas Avícolas</h2>
            <p className="text-sm text-slate-500">Monitorea ingresos de ventas y costos de producción por lotes de aves.</p>
          </header>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-[#3dbd14] text-black font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            + Registrar Operación
          </button>
        </section>

        {/* KPI METRICS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <article className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ingresos de Ventas</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${ingresosTotales.toLocaleString("de-DE")}</h4>
          </article>
          <article className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gastos Operativos</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${gastosTotales.toLocaleString("de-DE")}</h4>
          </article>
          <article className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Utilidad Neta</span>
            <h4 className="text-2xl font-bold text-slate-900 mt-2">${utilidadNeta.toLocaleString("de-DE")}</h4>
          </article>
        </section>

        {/* FILTERS */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por fecha:</span>
          <span className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 font-bold">Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => { setFechaInicio(e.target.value); setPaginaActual(1); }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20"
            />
          </span>
          <span className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 font-bold">Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => { setFechaFin(e.target.value); setPaginaActual(1); }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20"
            />
          </span>
          {(fechaInicio || fechaFin) && (
            <button
              onClick={() => { setFechaInicio(""); setFechaFin(""); setPaginaActual(1); }}
              className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </section>

        {/* CHARTS GRAPHICS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <article className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-4">Flujo de Efectivo Mensual</h3>
            <span className="h-48 flex items-end justify-around px-1 pb-2 bg-slate-50/60 rounded-xl border border-slate-100/80 block overflow-x-auto">
              {datosGraficaFormateados.map((item, idx) => (
                <span key={idx} className="flex flex-col items-center gap-2 h-full justify-end min-w-[45px] sm:w-12 block">
                  <span className="flex gap-1 items-end h-full justify-center w-full block">
                    <span className="w-2.5 sm:w-3.5 bg-[#39A900] rounded-t-sm transition-all duration-300 block" style={{ height: item.alturaIngresos }}></span>
                    <span className="w-2.5 sm:w-3.5 bg-cyan-400 rounded-t-sm transition-all duration-300 block" style={{ height: item.alturaGastos }}></span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-tight mt-1">{item.mes}</span>
                </span>
              ))}
            </span>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-6">
            <header>
              <h3 className="text-base font-bold text-slate-900">Distribución de Gastos</h3>
              <p className="text-xs text-slate-400">Calculado dinámicamente desde tus registros</p>
            </header>

            <span className="grid grid-cols-2 gap-4 my-auto block">
              <span className="flex flex-col items-center block">
                <span className="relative w-20 h-20 flex items-center justify-center block">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle className="text-slate-100" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[#39A900]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6" strokeDasharray="213" strokeDashoffset={213 - (213 * pctAlimentos) / 100} strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-900">{pctAlimentos}%</span>
                </span>
                <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-wider">Alimentos</span>
              </span>

              <span className="flex flex-col items-center block">
                <span className="relative w-20 h-20 flex items-center justify-center block">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle className="text-slate-100" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[#f43f5e]" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6" strokeDasharray="213" strokeDashoffset={213 - (213 * pctSalud) / 100} strokeLinecap="round"></circle>
                  </svg>
                  <span className="absolute text-sm font-bold text-slate-900">{pctSalud}%</span>
                </span>
                <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-wider">Salud/Vet</span>
              </span>
            </span>

            <blockquote className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
              <span className="font-bold text-[#39A900] block">Viabilidad Financiera:</span>
              <span className="font-medium mt-0.5 text-slate-600 block">
                {transaccionesFiltradasPorFecha.length === 0 ? "Sin movimientos registrados" : utilidadNeta >= 0 ? "Flujo de caja Saludable" : "Alerta de Déficit Operativo"}
              </span>
            </blockquote>
          </article>
        </section>

        {/* DETAILED BAR FLOWS */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <header>
            <h3 className="text-base font-bold text-slate-900">Distribución de Flujos Detallados</h3>
            <p className="text-xs text-slate-400">Análisis porcentual del capital invertido y devengado en los galpones.</p>
          </header>
          <span className="grid grid-cols-1 md:grid-cols-4 gap-6 block">
            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="flex justify-between items-center text-xs block">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Venta de Huevos</span>
                <span className="font-extrabold text-blue-600">{pctIngresoHuevos}%</span>
              </span>
              <span className="w-full h-2 bg-slate-200 rounded-full overflow-hidden block">
                <span className="h-full bg-blue-500 transition-all duration-500 block" style={{ width: `${pctIngresoHuevos}%` }}></span>
              </span>
              <p className="text-right text-xs font-bold text-slate-700">${ingresoHuevos.toLocaleString("de-DE")}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="flex justify-between items-center text-xs block">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Alimentos</span>
                <span className="font-extrabold text-[#39A900]">{pctAlimentos}%</span>
              </span>
              <span className="w-full h-2 bg-slate-200 rounded-full overflow-hidden block">
                <span className="h-full bg-[#39A900] transition-all duration-500 block" style={{ width: `${pctAlimentos}%` }}></span>
              </span>
              <p className="text-right text-xs font-bold text-slate-700">${gastoAlimentos.toLocaleString("de-DE")}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="flex justify-between items-center text-xs block">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Salud y Vacunas</span>
                <span className="font-extrabold text-rose-600">{pctSalud}%</span>
              </span>
              <span className="w-full h-2 bg-slate-200 rounded-full overflow-hidden block">
                <span className="h-full bg-rose-500 transition-all duration-500 block" style={{ width: `${pctSalud}%` }}></span>
              </span>
              <p className="text-right text-xs font-bold text-slate-700">${gastoSalud.toLocaleString("de-DE")}</p>
            </article>

            <article className="space-y-2 p-4 bg-slate-50/60 rounded-xl border border-slate-100">
              <span className="flex justify-between items-center text-xs block">
                <span className="font-bold text-slate-600 uppercase tracking-wider">Infraestructura</span>
                <span className="font-extrabold text-amber-600">{pctInfraestructura}%</span>
              </span>
              <span className="w-full h-2 bg-slate-200 rounded-full overflow-hidden block">
                <span className="h-full bg-amber-500 transition-all duration-500 block" style={{ width: `${pctInfraestructura}%` }}></span>
              </span>
              <p className="text-right text-xs font-bold text-slate-700">${gastoInfraestructura.toLocaleString("de-DE")}</p>
            </article>
          </span>
        </section>

        {/* MAIN CLASSIFICATION TABLE */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <header>
            <h3 className="text-base font-bold text-slate-900">Ingresos de Ventas por Clasificación de Huevos</h3>
            <p className="text-xs text-slate-400">Detalle exacto de panales vendidos y total de ingresos calculados desde los registros financieros reales.</p>
          </header>
          <span className="overflow-x-auto block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Clasificación (Tipo)</th>
                  <th className="px-6 py-3 text-center">Panales Vendidos</th>
                  <th className="px-6 py-3 text-right">Precio Panal</th>
                  <th className="px-6 py-3 text-right">Total Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {["C", "B", "A", "AA", "AAA", "Jumbo"].map((tipo) => {
                  const { vendidos, ingresos, precioPromedio } = calcularMetricasPorClasificacion(tipo);

                  return (
                    <tr key={tipo} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <span translate="no" className="px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-blue-100 text-blue-600">
                          Tipo {tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">
                        {vendidos.toLocaleString("de-DE")} pnl
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-600">
                        ${precioPromedio.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-[#39A900]">
                        ${ingresos.toLocaleString("de-DE")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </span>
        </section>

        {/* FINANCIAL RECORDS LOG */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <span className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 block">
            <h3 className="text-base font-bold text-slate-900">Historial Financiero</h3>
            <input
              type="text"
              className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all"
              placeholder="Buscar por concepto, galpón o lote..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPaginaActual(1); }}
            />
          </span>

          <span className="overflow-x-auto block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-[11px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Fecha / Galpón</th>
                  <th className="px-6 py-4">Concepto / Especificación</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {registrosPaginados.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-semibold block">{formatearFecha(t.fecha)}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{t.galpon}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-bold text-slate-900 block">{t.concepto}</span>
                      <span className="text-xs text-slate-400 font-medium block">{t.detalle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md ${t.catStyle}`}>{t.categoria}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-extrabold ${t.tipo === 'Ingreso' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.tipo === 'Ingreso' ? '+' : '-'}${t.monto.toLocaleString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${t.estStyle}`}>{t.estado}</span>
                    </td>
                  </tr>
                ))}
                {transaccionesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium bg-slate-50/20">
                      No hay registros financieros que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </span>

          <span className="p-4 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-semibold block">
            <span>Página {paginaActual} de {totalPaginas}</span>
            <span className="flex gap-1 block">
              <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 transition-colors cursor-pointer">Anterior</button>
              <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 font-bold hover:bg-slate-50 transition-colors cursor-pointer">Siguiente</button>
            </span>
          </span>
        </section>
      </main>

      {/* UNIFIED OPERATION MODAL */}
      {isModalOpen && (
        <dialog open className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 w-full h-full border-none">
          <article className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <span className="p-5 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc] block">
              <h3 className="text-base font-bold text-slate-900">Registrar Operación</h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setNuevaTransaccion(estadoInicialFormulario);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </span>

            <form onSubmit={manejarGuardarRegistro} className="p-6 space-y-4 overflow-y-auto flex-1">
              <span className="block">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha de la Operación</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all text-slate-700 font-medium"
                  value={nuevaTransaccion.fecha}
                  onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, fecha: e.target.value })}
                />
              </span>

              <span className="block">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Concepto de la Operación</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white transition-all text-slate-700 font-medium"
                  placeholder={nuevaTransaccion.tipo === "Ingreso" ? "Ej. Venta Multi-Clasificada" : "Ej. Compra Purina Inicial"}
                  value={nuevaTransaccion.concepto}
                  onChange={e => {
                    const val = e.target.value;
                    setNuevaTransaccion(prev => {
                      const upd = { ...prev, concepto: val };
                      if (upd.asociarGastoInmediato) {
                        upd.conceptoGastoAsociado = `Comisiones/Empaque - ${val}`;
                      }
                      return upd;
                    });
                  }}
                />
              </span>

              <span className="grid grid-cols-2 gap-4 block">
                <span className="block">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.tipo}
                    onChange={e => {
                      const tipo = e.target.value;
                      setNuevaTransaccion(prev => ({
                        ...prev,
                        tipo,
                        categoria: tipo === "Ingreso" ? "Venta de Huevos" : "Alimentos",
                        monto: "",
                        panalesVendidos: "",
                        precioPorPanal: "10500",
                        cantidadInsumo: "",
                        precioUnitarioInsumo: "",
                        esMultiClasificada: false,
                        desgloseInventario: [],
                        asociarGastoInmediato: false
                      }));
                    }}
                  >
                    <option value="Gasto">Gasto (Egreso)</option>
                    <option value="Ingreso">Ingreso (Venta)</option>
                  </select>
                </span>
                <span className="block">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Galpón Relacionado</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.galpon}
                    onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, galpon: e.target.value })}
                  >
                    <option value="Galpón 1">Galpón 1</option>
                    <option value="Galpón 2">Galpón 2</option>
                    <option value="Galpón 3">Galpón 3</option>
                    <option value="Galpón 4">Galpón 4</option>
                  </select>
                </span>
              </span>

              {nuevaTransaccion.tipo === "Gasto" && (
                <span className="block">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Categoría de Gasto</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 focus:bg-white"
                    value={nuevaTransaccion.categoria}
                    onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, categoria: e.target.value, detalleVeterinario: "" })}
                  >
                    <option value="Alimentos">Alimentos</option>
                    <option value="Salud/Vet">Salud</option>
                    <option value="Infraestructura">Infraestructura</option>
                  </select>
                </span>
              )}

              {nuevaTransaccion.tipo === "Ingreso" && (
                <fieldset className="border border-blue-100 bg-blue-50/30 p-4 rounded-2xl space-y-3">
                  <legend className="text-xs font-bold text-blue-600 px-2 uppercase tracking-wider">Detalles de Venta (Ingresos)</legend>

                  {nuevaTransaccion.esMultiClasificada ? (
                    <span className="space-y-3 block">
                      <span className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm block">
                        <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="px-3 py-2.5">Clasificación</th>
                              <th className="px-3 py-2.5">Panales</th>
                              <th className="px-3 py-2.5">Precio Panal</th>
                              <th className="px-3 py-2.5 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                            {nuevaTransaccion.desgloseInventario.map((item) => (
                              <tr key={item.clasificacion} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2.5 font-bold text-slate-700">Tipo {item.clasificacion}</td>
                                <td className="px-3 py-2.5 font-bold text-slate-800">{item.panales} pnl</td>
                                <td className="px-3 py-2.5 font-semibold text-slate-500">
                                  ${item.precioPanal.toLocaleString('de-DE')}
                                </td>
                                <td className="px-3 py-2.5 text-right font-bold text-slate-700">
                                  ${item.subtotal.toLocaleString('de-DE')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </span>
                    </span>
                  ) : (
                    <span className="grid grid-cols-1 sm:grid-cols-3 gap-4 block">
                      <span className="flex flex-col gap-1 block">
                        <label className="text-xs font-bold text-slate-500 uppercase">Clasificación</label>
                        <select
                          className="p-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm"
                          value={nuevaTransaccion.tipoHuevos}
                          onChange={e => {
                            const tipoSel = e.target.value;
                            const nuevoPrecio = PRECIOS_POR_DEFECTO[tipoSel] || 12000;
                            setNuevaTransaccion(prev => ({
                              ...prev,
                              tipoHuevos: tipoSel,
                              precioPorPanal: nuevoPrecio.toString(),
                              monto: Math.round((parseFloat(prev.panalesVendidos) || 0) * nuevoPrecio)
                            }));
                          }}
                        >
                          <option value="C">C ($10.500)</option>
                          <option value="B">B ($12.000)</option>
                          <option value="A">A ($13.500)</option>
                          <option value="AA">AA ($15.000)</option>
                          <option value="AAA">AAA ($16.500)</option>
                          <option value="Jumbo">Jumbo ($18.000)</option>
                        </select>
                      </span>
                      <span className="flex flex-col gap-1 block">
                        <label className="text-xs font-bold text-slate-500 uppercase">Precio por Panal ($)</label>
                        <input
                          type="text"
                          disabled
                          className="p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-sm font-semibold cursor-not-allowed text-slate-500"
                          value={formatConPuntos(nuevaTransaccion.precioPorPanal)}
                        />
                      </span>
                      <span className="flex flex-col gap-1 block">
                        <label className="text-xs font-bold text-slate-500 uppercase">Panales Vendidos</label>
                        <input
                          type="text"
                          className="p-2.5 border border-slate-200 rounded-xl bg-white text-sm"
                          placeholder="0"
                          value={formatConPuntos(nuevaTransaccion.panalesVendidos)}
                          onChange={e => manejarCambioVenta("panalesVendidos", e.target.value)}
                        />
                      </span>
                    </span>
                  )}

                  <span className="pt-2 flex flex-col gap-2 block">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={nuevaTransaccion.asociarGastoInmediato}
                        onChange={e => manejarToggleGastoAsociado(e.target.checked)}
                        className="rounded border-slate-300 text-[#39A900] focus:ring-[#39A900]/20"
                      />
                      <span className="text-xs font-medium text-slate-600">¿Registrar Gasto de Venta Asociado (10% aprox.)?</span>
                    </label>

                    {nuevaTransaccion.asociarGastoInmediato && (
                      <span className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 block">
                        <span className="block">
                          <label className="block text-[9px] font-bold text-amber-600 uppercase">Concepto de Gasto Asociado</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
                            value={nuevaTransaccion.conceptoGastoAsociado}
                            onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, conceptoGastoAsociado: e.target.value })}
                          />
                        </span>
                        <span className="block">
                          <label className="block text-[9px] font-bold text-amber-600 uppercase">Monto Gasto ($)</label>
                          <input
                            type="text"
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-700"
                            value={formatConPuntos(nuevaTransaccion.montoGastoAsociado)}
                            onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, montoGastoAsociado: limpiarNumero(e.target.value) })}
                          />
                        </span>
                      </span>
                    )}
                  </span>
                </fieldset>
              )}

              {nuevaTransaccion.tipo === "Gasto" && (
                <fieldset className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-3">
                  <legend className="text-xs font-bold text-emerald-600 px-2 uppercase tracking-wider">Detalles del Gasto e Insumos</legend>
                  <span className="grid grid-cols-2 gap-3 block">
                    <span className="block">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cantidad</label>
                      <input
                        type="text"
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                        value={formatConPuntos(nuevaTransaccion.cantidadInsumo)}
                        onChange={e => manejarCambioGasto("cantidadInsumo", e.target.value)}
                      />
                    </span>
                    <span className="block">
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Precio Unitario ($)</label>
                      <input
                        type="text"
                        placeholder="0"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700"
                        value={formatConPuntos(nuevaTransaccion.precioUnitarioInsumo)}
                        onChange={e => manejarCambioGasto("precioUnitarioInsumo", e.target.value)}
                      />
                    </span>
                  </span>
                </fieldset>
              )}

              <span className="grid grid-cols-2 gap-4 block">
                <span className="block">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monto Total ($)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-extrabold cursor-not-allowed text-slate-800"
                    placeholder="0"
                    value={formatConPuntos(nuevaTransaccion.monto)}
                  />
                </span>

                <span className="block">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estado de la Op.</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/20 text-slate-700"
                    value={nuevaTransaccion.estado}
                    onChange={e => setNuevaTransaccion({ ...nuevaTransaccion, estado: e.target.value })}
                  >
                    <option value="Completado">Completado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </span>
              </span>

              <footer className="pt-4 flex gap-2 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNuevaTransaccion(estadoInicialFormulario);
                  }}
                  className="px-5 py-2.5 border border-slate-200 font-bold text-sm text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#39A900] text-white font-bold text-sm rounded-xl hover:bg-[#329300] hover:shadow-md transition-all cursor-pointer"
                >
                  Guardar Registro
                </button>
              </footer>
            </form>
          </article>
        </dialog>
      )}
    </span>
  );
}
