'use client';

import React, { useState, useEffect } from 'react';

const formatDots = (num) => {
  if (!num) return "";
  let val = num.toString().replace(/\D/g, "");
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const cleanNum = (str) => {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/\./g, '').replace('$', '').trim()) || 0;
};

const formatCurrency = (val) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(val);

const formatExactPanales = (unidades) => {
  if (!unidades || unidades === 0) return "0 panales";
  const panales = Math.floor(unidades / 30);
  const residuo = unidades % 30;
  if (panales === 0) return `${residuo} uds`;
  if (residuo === 0) return `${panales} ${panales === 1 ? 'panal' : 'panales'}`;
  return `${panales} ${panales === 1 ? 'panal' : 'panales'} y ${residuo} uds`;
};

const getUnidades = (reg) => {
  return reg.unidades !== undefined ? reg.unidades : (reg.panales || 0);
};

const CLASIFICACIONES = ['C', 'B', 'A', 'AA', 'AAA', 'Jumbo'];

const initialTableData = {
  C: { hoy: "", ayer: 0, precio: "" },
  B: { hoy: "", ayer: 0, precio: "" },
  A: { hoy: "", ayer: 0, precio: "" },
  AA: { hoy: "", ayer: 0, precio: "" },
  AAA: { hoy: "", ayer: 0, precio: "" },
  Jumbo: { hoy: "", ayer: 0, precio: "" }
};

export default function Page() {
  const [modals, setModals] = useState({
    registro: false,
    exito: false,
    borrado: false,
    detalle: false
  });

  const [step, setStep] = useState(1);
  const [tableData, setTableData] = useState(initialTableData);
  const [generalInfo, setGeneralInfo] = useState({
    fecha: new Date().toISOString().split('T')[0],
    galpon: "",
    lote: "",
    responsable: "",
    observaciones: ""
  });

  const [historial, setHistorial] = useState([]);
  const [filtroGalpon, setFiltroGalpon] = useState("");
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(null);

  const [produccionOrigen, setProduccionOrigen] = useState(null);
  const [produccionesPendientes, setProduccionesPendientes] = useState([]);

  useEffect(() => {
    // Cargar la producción seleccionada desde localStorage
    const selectedStr = localStorage.getItem("produccionSeleccionada");
    if (selectedStr) {
      try {
        const selected = JSON.parse(selectedStr);
        setProduccionOrigen(selected);
        setGeneralInfo({
          fecha: selected.fecha || new Date().toISOString().split('T')[0],
          galpon: selected.galpon || "",
          lote: selected.lote || "",
          responsable: selected.trabajador || "",
          observaciones: selected.notes || selected.notas || ""
        });
        setModals(prev => ({ ...prev, registro: true }));
      } catch (e) {
        console.error("Error al cargar produccionSeleccionada:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Cargar la lista de producciones pendientes para el dropdown
    const pendingSaved = localStorage.getItem("produccionesPendientes");
    if (pendingSaved) {
      try {
        setProduccionesPendientes(JSON.parse(pendingSaved));
      } catch (e) {
        console.error("Error al cargar produccionesPendientes:", e);
      }
    }
  }, [modals.registro]);

  const handleDesvincularRecoleccion = () => {
    localStorage.removeItem("produccionSeleccionada");
    setProduccionOrigen(null);
    setGeneralInfo({
      fecha: new Date().toISOString().split('T')[0],
      galpon: "",
      lote: "",
      responsable: "",
      observaciones: ""
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem('avisena_storage');
    if (saved) setHistorial(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (historial.length > 0) {
      localStorage.setItem('avisena_storage', JSON.stringify(historial));
    }
  }, [historial]);

  useEffect(() => {
    if (generalInfo.galpon && historial.length > 0) {
      const registrosGalpon = historial
        .filter(r => r.galpon.toString() === generalInfo.galpon.toString())
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (registrosGalpon.length > 0 && registrosGalpon[0].sobrantesParaManana) {
        const ultimosSobrantes = registrosGalpon[0].sobrantesParaManana;
        setTableData(prev => {
          const actualizado = { ...prev };
          CLASIFICACIONES.forEach(tipo => {
            actualizado[tipo] = {
              ...actualizado[tipo],
              ayer: ultimosSobrantes[tipo] || 0
            };
          });
          return actualizado;
        });
      } else {
        setTableData(prev => {
          const limpiado = { ...prev };
          CLASIFICACIONES.forEach(tipo => {
            limpiado[tipo] = { ...limpiado[tipo], ayer: 0 };
          });
          return limpiado;
        });
      }
    }
  }, [generalInfo.galpon, historial]);

  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => {
    setModals(prev => ({ ...prev, [name]: false }));
    if (name === 'registro') {
      setStep(1);
      localStorage.removeItem("produccionSeleccionada");
      setProduccionOrigen(null);
    }
  };

  const obtenerSiguienteId = () => {
    if (historial.length === 0) return 1;
    const ultimoId = historial[historial.length - 1].id;
    const num = parseInt(ultimoId.split('-')[1]);
    return isNaN(num) ? historial.length + 1 : num + 1;
  };

  const handleLimpiarFormulario = () => {
    setTableData(initialTableData);
    setGeneralInfo({
      fecha: new Date().toISOString().split('T')[0],
      galpon: "",
      lote: "",
      responsable: "",
      observaciones: ""
    });
    closeModal('registro');
    openModal('borrado');
  };

  const handleTableChange = (tipo, field, value) => {
    setTableData(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [field]: field === 'precio'
          ? formatDots(value)
          : (value === "" ? "" : parseInt(value) || 0)
      }
    }));
  };

  const totales = CLASIFICACIONES.reduce((acc, key) => {
    const row = tableData[key];
    if (!row) return acc;

    const hoy = parseInt(row.hoy) || 0;
    const precio = cleanNum(row.precio);
    const panalesHoy = hoy / 30;
    const sub = panalesHoy * precio;

    acc.unidades += hoy;
    acc.panales += panalesHoy;
    acc.dinero += sub;
    return acc;
  }, { unidades: 0, panales: 0, dinero: 0 });

  const sobrantesPorTipo = CLASIFICACIONES.reduce((acc, tipo) => {
    const row = tableData[tipo];
    if (row) {
      const hoy = parseInt(row.hoy) || 0;
      const ayer = parseInt(row.ayer) || 0;
      const totalAcumulado = hoy + ayer;
      acc[tipo] = totalAcumulado % 30;
    } else {
      acc[tipo] = 0;
    }
    return acc;
  }, {});

  const totalSobrantesUnidades = Object.values(sobrantesPorTipo).reduce((a, b) => a + b, 0);

  const obtenerTextoDesglose = (data) => {
    if (!data) return "Ninguno";
    return CLASIFICACIONES
      .map(tipo => {
        const row = data[tipo];
        if (!row) return null;
        const cant = parseInt(row.hoy) || 0;
        return cant > 0 ? `${cant} ${tipo}` : null;
      })
      .filter(Boolean)
      .join(', ') || "Ninguno";
  };

  const obtenerTextoSobrantes = (dataSobrantes) => {
    if (!dataSobrantes) return "Ninguno";
    return CLASIFICACIONES
      .map(tipo => {
        const cant = dataSobrantes[tipo] || 0;
        return cant > 0 ? `${cant} ${tipo}` : null;
      })
      .filter(Boolean)
      .join(', ') || "Ninguno";
  };

  const handleContinuarPaso2 = () => {
    if (totales.unidades <= 0) {
      alert('Por favor, ingrese cantidades en la recolección antes de continuar.');
      return;
    }
    if (produccionOrigen && totales.unidades !== Number(produccionOrigen.huevosBuenos)) {
      alert(`La cantidad total de huevos clasificados (${totales.unidades}) debe ser exactamente igual a los huevos buenos recolectados (${produccionOrigen.huevosBuenos}).`);
      return;
    }
    setStep(2);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (produccionOrigen && totales.unidades !== Number(produccionOrigen.huevosBuenos)) {
      alert(`Error: La cantidad total de huevos clasificados (${totales.unidades}) no coincide con los huevos buenos recolectados (${produccionOrigen.huevosBuenos}).`);
      return;
    }

    const detallesNormalizados = {};
    CLASIFICACIONES.forEach(tipo => {
      detallesNormalizados[tipo] = {
        hoy: parseInt(tableData[tipo].hoy) || 0,
        ayer: parseInt(tableData[tipo].ayer) || 0,
        precio: tableData[tipo].precio || ""
      };
    });

    const registro = {
      id: `REC-${String(obtenerSiguienteId()).padStart(3, '0')}`,
      fecha: generalInfo.fecha,
      galpon: generalInfo.galpon,
      lote: generalInfo.lote || "N/A",
      responsable: generalInfo.responsable,
      total: formatCurrency(totales.dinero),
      unidades: totales.unidades,
      panales: totales.panales,
      obs: generalInfo.observaciones || "Sin observaciones",
      detalles: detallesNormalizados,
      sobrantesParaManana: { ...sobrantesPorTipo },
      totalSobrantes: totalSobrantesUnidades
    };

    const nuevoHistorial = [...historial, registro];
    setHistorial(nuevoHistorial);
    localStorage.setItem('avisena_storage', JSON.stringify(nuevoHistorial));

    // Si había una recolección vinculada, eliminarla de pendientes
    if (produccionOrigen) {
      const pendingSaved = localStorage.getItem("produccionesPendientes");
      if (pendingSaved) {
        try {
          let pending = JSON.parse(pendingSaved);
          pending = pending.filter(item => item.id !== produccionOrigen.id);
          localStorage.setItem("produccionesPendientes", JSON.stringify(pending));
          setProduccionesPendientes(pending);
        } catch (err) {
          console.error("Error al actualizar pendientes:", err);
        }
      }
      localStorage.removeItem("produccionSeleccionada");
      setProduccionOrigen(null);
    }

    closeModal('registro');
    openModal('exito');

    setTableData(initialTableData);
    setGeneralInfo({
      fecha: new Date().toISOString().split('T')[0],
      galpon: "",
      lote: "",
      responsable: "",
      observaciones: ""
    });
    setStep(1);
  };

  const verDetalle = (index) => {
    setSelectedRecordIndex(index);
    openModal('detalle');
  };

  const eliminarRegistro = (index) => {
    if (window.confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
      setHistorial(prev => {
        const copy = [...prev];
        copy.splice(index, 1);
        localStorage.setItem('avisena_storage', JSON.stringify(copy));
        return copy;
      });
      if (selectedRecordIndex === index) closeModal('detalle');
    }
  };

  const handleMandarAFinanzas = (reg) => {
    localStorage.setItem('avisena_transfer_data', JSON.stringify(reg));
    window.location.href = '/finanzas?action=importar_clasificacion';
  };

  const handleExportarExcel = () => {
    if (historial.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const encabezados = ["ID", "Fecha", "Galpon", "Lote", "Responsable", "Unidades", "Panales", "Total", "Sobrantes Mañana", "Observaciones"];
    const filas = historial.map(reg => [
      reg.id, reg.fecha, reg.galpon, reg.lote || "N/A", reg.responsable,
      getUnidades(reg), formatExactPanales(getUnidades(reg)),
      reg.total.replace(/[$. ]/g, ''), reg.totalSobrantes || 0, reg.obs.replace(/,/g, " ")
    ].join(","));

    const contenidoCsv = "\ufeff" + [encabezados.join(","), ...filas].join("\n");
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Avisena_Produccion_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const historialFiltrado = historial.filter(reg =>
    reg.galpon && reg.galpon.toString().includes(filtroGalpon)
  );

  return (
    <span className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans block">
    

      <main className="max-w-6xl mx-auto mt-12 px-6 pb-16 space-y-12">
        <section className="flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 gap-6">
          <header>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registro de Clasificación de Huevos</h1>
            <p className="text-gray-500 text-sm mt-1">Control y seguimiento de recolección diaria — Unidad Avícola SENA</p>
          </header>
          <button
            type="button"
            className=" bg-primary hover:bg-[#3dbd14] text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 tracking-wide text-sm"
            onClick={() => openModal('registro')}
          >
            <span className="text-lg font-black">+</span> Agregar Nueva Clasificación
          </button>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <header className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Historial de Clasificación</h2>
            <aside className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Filtrar por galpón..."
                value={filtroGalpon}
                onChange={(e) => setFiltroGalpon(e.target.value)}
                className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 w-48 transition-all"
              />
              <button
                type="button"
                title="Exportar a Excel"
                className="bg-primary hover:bg-[#3dbd14] text-slate-950 p-2.5 rounded-xl transition-colors shadow-sm"
                onClick={handleExportarExcel}
              >
                📥
              </button>
            </aside>
          </header>

          <section className="overflow-x-auto block">
            <table className="w-full text-left border-collapse text-xs uppercase tracking-wider font-semibold">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr className="text-gray-400">
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">ID / Fecha</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Galpón / Lote</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Producción Hoy</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Sobrantes Mañana</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Total Dinero</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Responsable</th>
                  <th className="p-4 text-center font-bold text-xs uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 normal-case font-normal text-sm text-gray-700">
                {historialFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-gray-400 font-medium bg-slate-50/20">
                      <span className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl">🥚</span>
                        <strong className="text-sm font-semibold text-slate-500">No se encontraron registros de clasificación</strong>
                        <span className="text-xs text-gray-450">Agrega una nueva clasificación para comenzar el historial.</span>
                      </span>
                    </td>
                  </tr>
                ) : historialFiltrado.map((reg, index) => (
                  <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block font-mono tracking-tight">{reg.id}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">{reg.fecha}</span>
                    </td>
                    <td className="p-4">
                      <span className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 w-max">
                          Galpón {reg.galpon}
                        </span>
                        <span className="text-xs text-gray-500 font-medium pl-1">Lote: {reg.lote || "N/A"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex flex-col">
                        <span className="font-extrabold text-slate-950">
                          {getUnidades(reg)} <span className="text-[10px] text-gray-400 font-semibold">UDS</span>
                          <span className="text-xs font-normal text-gray-500 block normal-case">
                            ({obtenerTextoDesglose(reg.detalles || {})})
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-green-600 mt-0.5">{formatExactPanales(getUnidades(reg))}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex flex-col">
                        <span className="font-bold text-amber-700">
                          {reg.totalSobrantes || 0} <span className="text-[10px] text-amber-500 font-semibold">UDS</span>
                        </span>
                        <span className="text-xs font-normal text-gray-400 block normal-case">
                          ({obtenerTextoSobrantes(reg.sobrantesParaManana)})
                        </span>
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-green-600 text-base">{reg.total}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold uppercase border border-slate-200">
                          {reg.responsable ? reg.responsable.charAt(0) : 'U'}
                        </span>
                        <span className="text-gray-700 font-medium">{reg.responsable || "N/A"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex justify-center gap-1.5">
                        <button
                          type="button"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm"
                          title="Mandar a Finanzas como Ingreso"
                          onClick={() => handleMandarAFinanzas(reg)}
                        >
                          📊
                        </button>
                        <button
                          type="button"
                          className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm"
                          title="Ver Detalle"
                          onClick={() => verDetalle(index)}
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          className="bg-red-50 hover:bg-red-100 text-red-600 w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm"
                          title="Eliminar"
                          onClick={() => eliminarRegistro(index)}
                        >
                          🗑️
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </section>

        {/* MODAL DE REGISTRO */}
        {modals.registro && (
          <span className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 block">
            <article className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {step === 1 ? "1. Clasificación de Huevos" : "2. Información General y Cierre"}
                </h2>
                <button className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1" type="button" onClick={() => closeModal('registro')}>&times;</button>
              </header>

              <form onSubmit={step === 2 ? handleSave : (e) => e.preventDefault()} className="p-6 overflow-y-auto flex-1 space-y-5">
                {step === 1 && (
                  <section className="space-y-5">
                    {/* Vinculación de recolección */}
                    {produccionOrigen ? (
                      <div className="bg-green-50/85 border border-green-200 text-green-900 p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm flex items-center gap-1.5 text-green-800">
                            🥚 Recolección Vinculada
                          </span>
                          <button
                            type="button"
                            onClick={handleDesvincularRecoleccion}
                            className="text-xs text-red-600 hover:text-red-800 font-bold underline bg-transparent border-none cursor-pointer"
                          >
                            Desvincular
                          </button>
                        </div>
                        <div className="text-xs text-slate-650 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 bg-white/60 p-2.5 rounded-xl border border-green-100 font-medium">
                          <span><strong>Fecha:</strong> {produccionOrigen.fecha}</span>
                          <span><strong>Galpón:</strong> {produccionOrigen.galpon}</span>
                          <span><strong>Lote:</strong> {produccionOrigen.lote || 'N/A'}</span>
                          <span><strong>Huevos Buenos:</strong> <strong className="text-green-700 font-extrabold">{produccionOrigen.huevosBuenos}</strong></span>
                        </div>
                      </div>
                    ) : (
                      produccionesPendientes.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
                          <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wide">
                            Vincular con Recolección Pendiente:
                          </label>
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const found = produccionesPendientes.find(p => p.id.toString() === val);
                                if (found) {
                                  setProduccionOrigen(found);
                                  setGeneralInfo({
                                    fecha: found.fecha,
                                    galpon: found.galpon,
                                    lote: found.lote || "",
                                    responsable: found.trabajador || "",
                                    observaciones: found.notas || ""
                                  });
                                }
                              }
                            }}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm font-semibold transition-all"
                            value={produccionOrigen ? produccionOrigen.id : ""}
                          >
                            <option value="">-- Seleccionar Recolección Pendiente --</option>
                            {produccionesPendientes.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.fecha} - {p.galpon} ({p.huevosBuenos} huevos buenos)
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    )}
                    <section className="overflow-x-auto border border-gray-150 rounded-2xl shadow-sm block">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-gray-455 uppercase border-b border-gray-200">
                            <th className="px-4 py-3 text-left">Tipo</th>
                            <th className="px-4 py-3 text-center">Hoy (Uds)</th>
                            <th className="px-4 py-3 text-center">Panales (Conv.)</th>
                            <th className="px-4 py-3 text-center">Ayer (Uds)</th>
                            <th className="px-4 py-3 text-center">Acum. (Uds)</th>
                            <th className="px-4 py-3 text-center">Precio (Panal)</th>
                            <th className="px-4 py-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {CLASIFICACIONES.map(tipo => {
                            const row = tableData[tipo] || { hoy: "", ayer: 0, precio: "" };
                            const hoy = parseInt(row.hoy) || 0;
                            const ayer = parseInt(row.ayer) || 0;
                            const panalesHoy = hoy / 30;
                            const acum = hoy + ayer;
                            const sub = panalesHoy * cleanNum(row.precio);

                            return (
                              <tr key={tipo} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-left font-bold text-gray-800">{tipo}</td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="number"
                                    className="w-20 p-1.5 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-150"
                                    value={row.hoy}
                                    min="0"
                                    placeholder="0"
                                    onChange={(e) => handleTableChange(tipo, 'hoy', e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {hoy > 0 ? (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                      {formatExactPanales(hoy)}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-400 border border-slate-100">
                                      0 panales
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input type="number" className="w-16 p-1.5 bg-slate-50 border border-transparent rounded-lg text-center text-slate-500 font-semibold" value={ayer} readOnly />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input type="number" className="w-16 p-1.5 bg-slate-50 border border-transparent rounded-lg text-center text-slate-500 font-semibold" value={acum} readOnly />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="text"
                                    className="w-24 p-1.5 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-all duration-150"
                                    value={row.precio}
                                    onChange={(e) => handleTableChange(tipo, 'precio', e.target.value)}
                                    placeholder="$ 0"
                                  />
                                </td>
                                <td className="px-4 py-3 text-right font-extrabold text-slate-900">{formatCurrency(sub)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </section>

                    <section className="grid grid-cols-3 gap-4 bg-slate-50/60 rounded-2xl p-4 border border-gray-150 shadow-sm">
                      <span className="text-center border-r border-gray-200 block">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unidades Totales</span>
                        <strong className="text-base font-black text-slate-800 mt-1 block">{totales.unidades} uds</strong>
                        <span className="text-[11px] text-gray-500 font-medium">({obtenerTextoDesglose(tableData)})</span>
                      </span>
                      <span className="text-center border-r border-gray-200 px-1 block">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Panales Totales</span>
                        <strong className="text-xs font-bold text-green-700 mt-1.5 block leading-tight">{formatExactPanales(totales.unidades)}</strong>
                      </span>
                      <span className="text-center block">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor Total</span>
                        <strong className="text-lg font-black text-green-600 mt-0.5 block">{formatCurrency(totales.dinero)}</strong>
                      </span>
                    </section>

                    {produccionOrigen && (
                      <div className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-300 ${
                        totales.unidades === Number(produccionOrigen.huevosBuenos)
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50/80 border-red-200 text-red-800 animate-pulse'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Validación de Cantidad</span>
                        <strong className="text-lg font-black">
                          {totales.unidades} / {produccionOrigen.huevosBuenos} Huevos Clasificados
                        </strong>
                        <span className="text-xs font-semibold">
                          {totales.unidades === Number(produccionOrigen.huevosBuenos) ? (
                            <span className="text-green-700">✓ La cantidad coincide perfectamente. ¡Listo para continuar!</span>
                          ) : (
                            <span>
                              {totales.unidades < Number(produccionOrigen.huevosBuenos) 
                                ? `⚠ Faltan clasificar ${Number(produccionOrigen.huevosBuenos) - totales.unidades} huevos.` 
                                : `⚠ Sobran ${totales.unidades - Number(produccionOrigen.huevosBuenos)} huevos clasificados.`
                              }
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    <button type="button" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md" onClick={handleContinuarPaso2}>
                      CONTINUAR &rarr;
                    </button>
                  </section>
                )}

                {step === 2 && (
                  <section className="space-y-5">
                    <fieldset className="grid grid-cols-2 gap-4 border-none p-0">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Consecutivo</span>
                        <input type="text" value={`REC-${String(obtenerSiguienteId()).padStart(3, '0')}`} readOnly className="p-2.5 bg-gray-100 border rounded-xl font-bold text-green-600 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Fecha</span>
                        <input type="date" value={generalInfo.fecha} onChange={e => setGeneralInfo({ ...generalInfo, fecha: e.target.value })} required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Galpón</span>
                        <input type="text" value={generalInfo.galpon} onChange={e => setGeneralInfo({ ...generalInfo, galpon: e.target.value })} placeholder="Ej: Galpón 1" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-600 uppercase">Lote</span>
                        <input type="text" value={generalInfo.lote} onChange={e => setGeneralInfo({ ...generalInfo, lote: e.target.value })} placeholder="Ej: LOTE-A2" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                      </label>
                      <label className="flex flex-col gap-1 col-span-2">
                        <span className="text-xs font-bold text-gray-600 uppercase">Responsable</span>
                        <input type="text" value={generalInfo.responsable} onChange={e => setGeneralInfo({ ...generalInfo, responsable: e.target.value })} placeholder="Nombre Completo" required className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                      </label>

                      <span className="col-span-2 bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2 block text-xs">
                        <span className="block text-gray-600">
                          <strong className="font-bold text-slate-800 uppercase block mb-0.5">Producción Actual:</strong>
                          Se ingresaron <strong className="text-slate-900">{totales.unidades} uds</strong> ({obtenerTextoDesglose(tableData)}).
                        </span>
                        <hr className="border-gray-200" />
                        <span className="block bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-amber-900">
                          <strong className="font-bold uppercase block mb-1">📦 Inventario de Unidades Sobrantes:</strong>
                          Quedan <strong className="font-black text-amber-800">{totalSobrantesUnidades} unidades sueltas</strong> que no completaron panal de 30 y **se acumularán automáticamente para el día de mañana**.
                          <span className="block font-medium text-amber-700/90 mt-0.5">Desglose: ({obtenerTextoSobrantes(sobrantesPorTipo)})</span>
                        </span>
                      </span>

                      <label className="flex flex-col gap-1 col-span-2">
                        <span className="text-xs font-bold text-gray-600 uppercase">Observaciones</span>
                        <textarea rows="2" value={generalInfo.observaciones} onChange={e => setGeneralInfo({ ...generalInfo, observaciones: e.target.value })} className="p-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"></textarea>
                      </label>
                    </fieldset>
                    <footer className="flex justify-between items-center border-t pt-4">
                      <button type="button" className="text-gray-500 hover:text-gray-700 font-bold text-sm" onClick={() => setStep(1)}>&larr; Volver</button>
                      <span className="flex gap-3">
                        <button type="button" className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm" onClick={handleLimpiarFormulario}>
                          BORRAR TODO
                        </button>
                        <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md">
                          FINALIZAR Y GUARDAR
                        </button>
                      </span>
                    </footer>
                  </section>
                )}
              </form>
            </article>
          </span>
        )}

        {/* MODALES STATUS */}
        {modals.exito && (
          <span className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 block">
            <article className="text-center text-white max-w-sm flex flex-col items-center">
              <span className="text-4xl text-green-500 border-4 border-green-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4">✓</span>
              <h1 className="text-2xl font-black tracking-wide mb-2">¡REGISTRO EXITOSO!</h1>
              <button type="button" className="w-full bg-green-500 text-slate-950 font-black py-3 px-8 rounded-xl mt-6 hover:bg-green-400 transition-colors" onClick={() => closeModal('exito')}>CONTINUAR</button>
            </article>
          </span>
        )}

        {modals.borrado && (
          <span className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 block">
            <article className="text-center text-white max-w-sm flex flex-col items-center">
              <span className="text-4xl text-red-500 border-4 border-red-500 w-20 h-20 flex items-center justify-center rounded-full font-bold mb-4">✕</span>
              <h1 className="text-2xl font-black tracking-wide mb-2">¡FORMULARIO LIMPIADO!</h1>
              <button type="button" className="w-full bg-red-600 text-white font-black py-3 px-8 rounded-xl mt-6 hover:bg-red-500 transition-colors" onClick={() => closeModal('borrado')}>CONTINUAR</button>
            </article>
          </span>
        )}

        {/* MODAL DETALLE */}
        {modals.detalle && selectedRecordIndex !== null && (
          <span className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 block">
            <article className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
              <header className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Detalle de Producción</h2>
                <button className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1" type="button" onClick={() => closeModal('detalle')}>&times;</button>
              </header>
              {(() => {
                const r = historial[selectedRecordIndex];
                if (!r) return null;
                return (
                  <section className="p-6 overflow-y-auto flex-1 space-y-5">
                    <span className="grid grid-cols-2 gap-4 text-sm border-b pb-4 block">
                      <span className="text-gray-500 font-medium block">ID: <span className="font-bold text-gray-900 block text-base">{r.id}</span></span>
                      <span className="text-gray-500 font-medium block">FECHA: <span className="font-bold text-gray-900 block text-base">{r.fecha}</span></span>
                      <span className="text-gray-500 font-medium block">GALPÓN: <span className="font-bold text-gray-800 block">{r.galpon}</span></span>
                      <span className="text-gray-500 font-medium block">LOTE: <span className="font-bold text-gray-800 block">{r.lote || "N/A"}</span></span>
                      <span className="text-gray-500 font-medium col-span-2 block">RESPONSABLE: <span className="font-bold text-gray-800 block">{r.responsable || "N/A"}</span></span>
                    </span>

                    <section>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Producción por Tipo</h3>
                      <span className="bg-slate-50 border border-gray-100 rounded-2xl p-4 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center block">
                        {CLASIFICACIONES.map((tipo) => {
                          const det = r.detalles?.[tipo];
                          const hoy = det?.hoy || 0;
                          return (
                            <span key={tipo} className="bg-white border border-gray-200/60 rounded-xl p-2 shadow-sm flex flex-col justify-between block">
                              <span className="block text-xs font-black text-slate-400 uppercase">{tipo}</span>
                              <span className="block text-base font-extrabold text-slate-800 mt-1">{hoy} <span className="text-[10px] text-gray-400 font-normal">uds</span></span>
                              <span className="block text-xs font-bold text-green-600 mt-1">{formatExactPanales(hoy)}</span>
                            </span>
                          );
                        })}
                      </span>
                    </section>

                    <span className="grid grid-cols-3 gap-2 bg-green-50/50 border border-green-100 rounded-2xl p-4 block">
                      <span className="block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">Unidades Totales</span>
                        <span className="text-xl font-black text-green-900">{getUnidades(r)} <span className="text-xs font-normal text-green-700">uds</span></span>
                        <span className="block text-[11px] font-medium text-gray-600 mt-0.5 leading-tight">
                          ({obtenerTextoDesglose(r.detalles || {})})
                        </span>
                      </span>
                      <span className="block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">Panales Totales</span>
                        <span className="text-xl font-black text-green-900">{formatExactPanales(getUnidades(r))}</span>
                      </span>
                      <span className="text-right block">
                        <span className="block text-xs font-bold text-green-800 uppercase tracking-wide">Valor Total</span>
                        <span className="text-xl font-black text-green-700">{r.total}</span>
                      </span>
                    </span>

                    <blockquote className="bg-amber-50/60 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-950">
                      <strong className="block text-amber-900 font-bold mb-1 uppercase tracking-wider">Sobrantes Transferidos al Día Siguiente:</strong>
                      Se guardaron {r.totalSobrantes || 0} unidades totales: ({obtenerTextoSobrantes(r.sobrantesParaManana)}).
                    </blockquote>

                    <blockquote className="bg-gray-50 border-l-4 border-slate-400 p-3 rounded-r-xl text-xs italic text-gray-600">
                      <strong className="block text-gray-700 not-italic font-bold mb-1 uppercase tracking-wider">Observaciones:</strong>
                      "{r.obs}"
                    </blockquote>
                  </section>
                );
              })()}
            </article>
          </span>
        )}
      </main>
    </span>
  );
};