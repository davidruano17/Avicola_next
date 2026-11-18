"use client";

import { useState, useEffect } from "react";
import FiltrosReportes from "@/components/FiltrosReportes";
import TablaReportes from "@/components/TablaReportes";
import ResumenReportes from "@/components/ResumenReportes";
import GraficosReportes from "@/components/GraficosReportes";
import api from "@/services/api";

export const normalizarGalpon = (galpon) => {
  if (!galpon) return "";
  return String(galpon)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^galp[oó]n\s*/i, "")
    .replace(/^0+/, "")
    .trim();
};

export const obtenerNombreGalpon = (galpon) => {
  if (!galpon) return "Todos";
  const norm = normalizarGalpon(galpon);
  if (norm) return `Galpón ${norm.padStart(2, "0")}`;
  return String(galpon);
};

export default function ReportesView() {
  const [filtros, setFiltros] = useState({
    tipoReporte: "",
    fechaInicio: "",
    fechaFin: "",
    galpon: "",
  });

  const [listaGalpones, setListaGalpones] = useState(["01", "02"]);
  const [datos, setDatos] = useState([]);
  const [reporteGenerado, setReporteGenerado] = useState(false);

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
    tasaMerma: 0,

    // Clasificación de huevos
    totalPanales: 0,
    totalDinero: 0,
    totalSobrantes: 0,

    // Indicadores generales
    causaPrincipal: "Sin datos",
    afectacionPrincipal: "Sin datos",
    categoriaPrincipal: "Sin datos",
    galponPrincipal: "Sin datos",
  });

  // Cargar galpones registrados dinámicamente desde API y localStorage
  useEffect(() => {
    async function cargarGalpones() {
      try {
        const res = await api.get('/galpones/').catch(() => null);
        const listaApi = Array.isArray(res) ? res : (res?.results || []);
        const stored =
          localStorage.getItem("historialgalpones") ||
          localStorage.getItem("historialLotes");
        const parsedStored = stored ? JSON.parse(stored) : [];
        const combinados = [...listaApi, ...(Array.isArray(parsedStored) ? parsedStored : [])];

        const base = new Set(["01", "02"]);
        combinados.forEach((g) => {
          const raw = g.galpon || g.lote;
          if (raw) {
            const limpio = String(raw).replace(/^galp[oó]n\s*/i, "").trim();
            const pad = limpio.padStart(2, "0");
            base.add(pad);
          }
        });

        const galpsOrdenados = Array.from(base).sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return String(a).localeCompare(String(b));
        });
        setListaGalpones(galpsOrdenados);
      } catch {
        setListaGalpones(["01", "02"]);
      }
    }
    cargarGalpones();
  }, []);

  const extraerFechaStr = (f) => {
    if (!f) return "";
    if (typeof f === "string") return f.split("T")[0];
    try {
      return new Date(f).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  function obtenerDatosReporte(tipo) {
    if (typeof window === "undefined") return [];

    switch (tipo) {
      case "Mortalidad de aves": {
        const datosMortalidad =
          JSON.parse(localStorage.getItem("registrosMortalidad")) || [];

        return datosMortalidad.map((item, idx) => ({
          ...item,
          id: item.id || `mort-${idx}`,
          cantidad: Number(item.cantidad || item.numeroAves || 0),
          fecha: extraerFechaStr(item.fecha),
        }));
      }

      case "Producción de huevos": {
        const historial =
          JSON.parse(localStorage.getItem("historial")) || [];
        const pendientes =
          JSON.parse(localStorage.getItem("produccionesPendientes")) || [];

        // Combinar historial con pendientes sin duplicar
        const mapPorId = new Map();
        [...historial, ...pendientes].forEach((item, idx) => {
          const id = item.id || `${item.fecha}-${item.galpon}-${idx}`;
          if (!mapPorId.has(id)) {
            mapPorId.set(id, item);
          }
        });

        const producciones = Array.from(mapPorId.values());

        return producciones.map((item, idx) => {
          const buenos = Number(item.huevosBuenos ?? item.buenos ?? 0);
          const rotos = Number(item.huevosRotos ?? item.rotos ?? 0);
          const descarte = Number(item.descarte ?? 0);
          const totalCalculado = buenos + rotos + descarte;
          const totalHuevos = Number(item.huevos ?? (totalCalculado > 0 ? totalCalculado : item.cantidad ?? 0));

          return {
            ...item,
            id: item.id || `prod-${idx}`,
            fecha: extraerFechaStr(item.fecha),
            cantidad: totalHuevos,
            huevosBuenos: buenos,
            huevosRotos: rotos,
            descarte: descarte,
            totalHuevos: totalHuevos,
          };
        });
      }

      case "Clasificación de huevos": {
        const clasificaciones =
          JSON.parse(localStorage.getItem("avisena_storage")) || [];

        return clasificaciones.map((item, idx) => {
          let unidades = Number(item.unidades ?? 0);
          let panales = Number(item.panales ?? 0);
          let totalSobrantes = Number(item.totalSobrantes ?? 0);
          let valorDinero = 0;

          // 1. Extraer y validar prioritariamente desde detalles por calibre
          if (item.detalles && typeof item.detalles === "object") {
            let detUnidades = 0;
            let detPanales = 0;
            let detSobrantes = 0;
            let detDinero = 0;

            Object.entries(item.detalles).forEach(([tipo, val]) => {
              const hoy = Number(val?.hoy || 0);
              const anterior = Number(val?.anterior || 0);
              const acumulado = hoy + anterior;
              const panalesCat = Math.floor(acumulado / 30);
              const sobranteCat = acumulado % 30;

              detUnidades += hoy;
              detPanales += panalesCat;
              detSobrantes += sobranteCat;

              let precioUnitario = 0;
              if (val?.precio) {
                if (typeof val.precio === "number") {
                  precioUnitario = val.precio;
                } else {
                  precioUnitario =
                    Number(String(val.precio).replace(/[^\d]/g, "")) || 0;
                }
              }
              detDinero += panalesCat * precioUnitario;
            });

            if (detUnidades > 0) unidades = detUnidades;
            if (detPanales > 0) panales = detPanales;
            if (detSobrantes >= 0) totalSobrantes = detSobrantes;
            if (detDinero > 0) valorDinero = detDinero;
          }

          // 2. Si no hay unidades desde detalles, buscar de item.cantidad o item.unidades
          if (!unidades || unidades <= 0) {
            if (item.cantidad && Number(item.cantidad) > 0) {
              unidades = Number(item.cantidad);
            } else if (item.unidades && Number(item.unidades) > 0) {
              unidades = Number(item.unidades);
            } else if (panales > 30) {
              // Si panales es muy grande, en versiones antiguas guardaba unidades de huevos
              unidades = panales;
              panales = Math.floor(unidades / 30);
            }
          }

          // 3. Validación estricta de panales: NUNCA decimales, NUNCA unidades en vez de panales
          if (unidades > 0 && panales >= unidades) {
            // El campo panales guardaba erróneamente las unidades
            panales = Math.floor(unidades / 30);
          } else if (!panales || panales <= 0) {
            panales = Math.floor(unidades / 30);
          } else {
            // Garantizar que sea un número entero exacto (sin flotantes .067)
            panales = Math.floor(panales);
          }

          // 4. Validación de sobrantes
          if (totalSobrantes === 0 && unidades > 0) {
            if (item.sobrantesSiguiente && typeof item.sobrantesSiguiente === "object") {
              totalSobrantes = Object.values(item.sobrantesSiguiente).reduce(
                (acc, val) => acc + Number(val || 0),
                0
              );
            } else {
              totalSobrantes = unidades % 30;
            }
          }
          totalSobrantes = Math.floor(totalSobrantes);

          // 5. Limpieza y parseo correcto de valor total en pesos colombianos (evitar que $25.500 sea 25.5)
          if (!valorDinero || valorDinero <= 0) {
            if (typeof item.total === "number") {
              valorDinero = item.total;
            } else if (typeof item.total === "string") {
              const limpio = item.total.replace(/[$\s]/g, "");
              if (limpio.includes(".") && limpio.includes(",")) {
                valorDinero =
                  Number(limpio.replace(/\./g, "").replace(",", ".")) || 0;
              } else if (limpio.includes(".") && !limpio.includes(",")) {
                valorDinero = Number(limpio.replace(/\./g, "")) || 0;
              } else if (limpio.includes(",")) {
                valorDinero = Number(limpio.replace(",", ".")) || 0;
              } else {
                valorDinero = Number(limpio.replace(/[^\d.-]/g, "")) || 0;
              }
            }
          }
          valorDinero = Math.round(valorDinero);

          return {
            ...item,
            id: item.id || `clas-${idx}`,
            fecha: extraerFechaStr(item.fecha),
            cantidad: unidades,
            unidades: unidades,
            panales: panales,
            totalSobrantes: totalSobrantes,
            valorDinero: valorDinero,
          };
        });
      }

      case "Morbilidad de aves": {
        const morbilidad =
          JSON.parse(localStorage.getItem("historialMorbilidad")) || [];

        return morbilidad.map((item, idx) => ({
          ...item,
          id: item.id || `morb-${idx}`,
          fecha: extraerFechaStr(item.fecha),
          cantidad: Number(item.cantidad || 1),
        }));
      }

      default:
        return [];
    }
  }

  const normalizarListaReporte = (tipo, listaCruda) => {
    if (!Array.isArray(listaCruda)) return [];

    if (tipo === "Mortalidad de aves") {
      return listaCruda.map((item, idx) => ({
        ...item,
        id: item.id || `mort-${idx}`,
        cantidad: Number(item.cantidad || item.numeroAves || 0),
        fecha: extraerFechaStr(item.fecha),
      }));
    }

    if (tipo === "Producción de huevos") {
      return listaCruda.map((item, idx) => {
        const buenos = Number(item.huevosBuenos ?? item.buenos ?? 0);
        const rotos = Number(item.huevosRotos ?? item.rotos ?? 0);
        const descarte = Number(item.descarte ?? 0);
        const totalCalculado = buenos + rotos + descarte;
        const totalHuevos = Number(item.huevos ?? item.totalHuevos ?? (totalCalculado > 0 ? totalCalculado : item.cantidad ?? 0));
        return {
          ...item,
          id: item.id || `prod-${idx}`,
          fecha: extraerFechaStr(item.fecha),
          cantidad: totalHuevos,
          huevosBuenos: buenos,
          huevosRotos: rotos,
          descarte: descarte,
          totalHuevos: totalHuevos,
        };
      });
    }

    if (tipo === "Clasificación de huevos") {
      return listaCruda.map((item, idx) => {
        let unidades = Number(item.unidades ?? 0);
        let panales = Number(item.panales ?? 0);
        let totalSobrantes = Number(item.totalSobrantes ?? 0);
        let valorDinero = Number(item.valorDinero ?? 0);

        if (item.detalles && typeof item.detalles === "object") {
          let detUnidades = 0;
          let detPanales = 0;
          let detSobrantes = 0;
          let detDinero = 0;

          Object.entries(item.detalles).forEach(([, val]) => {
            const hoy = Number(val?.hoy || 0);
            const anterior = Number(val?.anterior || 0);
            const acumulado = hoy + anterior;
            const panalesCat = Math.floor(acumulado / 30);
            const sobranteCat = acumulado % 30;

            detUnidades += hoy;
            detPanales += panalesCat;
            detSobrantes += sobranteCat;

            let precioUnitario = 0;
            if (val?.precio) {
              precioUnitario = typeof val.precio === "number"
                ? val.precio
                : Number(String(val.precio).replace(/[^\d]/g, "")) || 0;
            }
            detDinero += panalesCat * precioUnitario;
          });

          if (detUnidades > 0) unidades = detUnidades;
          if (detPanales > 0) panales = detPanales;
          if (detSobrantes >= 0) totalSobrantes = detSobrantes;
          if (detDinero > 0) valorDinero = detDinero;
        }

        if (!unidades || unidades <= 0) {
          if (item.cantidad && Number(item.cantidad) > 0) {
            unidades = Number(item.cantidad);
          } else if (panales > 30) {
            unidades = panales;
            panales = Math.floor(unidades / 30);
          }
        }

        if (unidades > 0 && panales >= unidades) {
          panales = Math.floor(unidades / 30);
        } else if (!panales || panales <= 0) {
          panales = Math.floor(unidades / 30);
        } else {
          panales = Math.floor(panales);
        }

        if (totalSobrantes === 0 && unidades > 0) {
          if (item.sobrantesSiguiente && typeof item.sobrantesSiguiente === "object") {
            totalSobrantes = Object.values(item.sobrantesSiguiente).reduce(
              (acc, val) => acc + Number(val || 0),
              0
            );
          } else {
            totalSobrantes = unidades % 30;
          }
        }
        totalSobrantes = Math.floor(totalSobrantes);

        if (!valorDinero || valorDinero <= 0) {
          if (typeof item.total === "number") {
            valorDinero = item.total;
          } else if (typeof item.total === "string") {
            const limpio = item.total.replace(/[$\s]/g, "");
            if (limpio.includes(".") && limpio.includes(",")) {
              valorDinero = Number(limpio.replace(/\./g, "").replace(",", ".")) || 0;
            } else if (limpio.includes(".") && !limpio.includes(",")) {
              valorDinero = Number(limpio.replace(/\./g, "")) || 0;
            } else if (limpio.includes(",")) {
              valorDinero = Number(limpio.replace(",", ".")) || 0;
            } else {
              valorDinero = Number(limpio.replace(/[^\d.-]/g, "")) || 0;
            }
          }
        }
        valorDinero = Math.round(valorDinero);

        return {
          ...item,
          id: item.codigo || item.id || `clas-${idx}`,
          fecha: extraerFechaStr(item.fecha),
          cantidad: unidades,
          unidades,
          panales,
          totalSobrantes,
          valorDinero,
        };
      });
    }

    if (tipo === "Morbilidad de aves") {
      return listaCruda.map((item, idx) => ({
        ...item,
        id: item.id || `morb-${idx}`,
        fecha: extraerFechaStr(item.fecha),
        cantidad: Number(item.cantidad || 1),
      }));
    }

    return [];
  };

  const generarReporte = async () => {
    if (!filtros.tipoReporte) return;

    let reportes = [];
    try {
      const params = new URLSearchParams({
        tipoReporte: filtros.tipoReporte,
        galpon: filtros.galpon || "",
        fechaInicio: filtros.fechaInicio || "",
        fechaFin: filtros.fechaFin || "",
      });
      const res = await api.get(`/reportes/filtrar/?${params.toString()}`).catch(() => null);
      if (res && Array.isArray(res.datos)) {
        reportes = normalizarListaReporte(filtros.tipoReporte, res.datos);
      } else {
        reportes = obtenerDatosReporte(filtros.tipoReporte);
      }
    } catch {
      reportes = obtenerDatosReporte(filtros.tipoReporte);
    }

    const filtrados = reportes.filter((item) => {
      const fechaItem = extraerFechaStr(item.fecha);

      const cumpleGalpon =
        !filtros.galpon ||
        normalizarGalpon(item.galpon) === normalizarGalpon(filtros.galpon);

      const cumpleFechaInicio =
        !filtros.fechaInicio || fechaItem >= filtros.fechaInicio;

      const cumpleFechaFin =
        !filtros.fechaFin || fechaItem <= filtros.fechaFin;

      return cumpleGalpon && cumpleFechaInicio && cumpleFechaFin;
    });

    const cantidades = filtrados.map((item) => Number(item.cantidad || 0));

    let totalHuevosBuenos = 0;
    let totalHuevosRotos = 0;
    let totalHuevosDescarte = 0;
    let tasaMerma = 0;

    if (filtros.tipoReporte === "Producción de huevos") {
      totalHuevosBuenos = filtrados.reduce(
        (total, item) => total + Number(item.huevosBuenos || 0),
        0
      );

      totalHuevosRotos = filtrados.reduce(
        (total, item) => total + Number(item.huevosRotos || 0),
        0
      );

      totalHuevosDescarte = filtrados.reduce(
        (total, item) => total + Number(item.descarte || 0),
        0
      );

      const sumaHuevos = totalHuevosBuenos + totalHuevosRotos + totalHuevosDescarte;
      tasaMerma =
        sumaHuevos > 0
          ? Number((((totalHuevosRotos + totalHuevosDescarte) / sumaHuevos) * 100).toFixed(1))
          : 0;
    }

    let totalPanales = 0;
    let totalDinero = 0;
    let totalSobrantes = 0;

    if (filtros.tipoReporte === "Clasificación de huevos") {
      totalPanales = filtrados.reduce(
        (total, item) => total + Math.floor(Number(item.panales || 0)),
        0
      );
      totalDinero = filtrados.reduce(
        (total, item) => total + Math.round(Number(item.valorDinero || 0)),
        0
      );
      totalSobrantes = filtrados.reduce(
        (total, item) => total + Math.floor(Number(item.totalSobrantes || 0)),
        0
      );
    }

    const totalCantidad = cantidades.reduce(
      (acc, cantidad) => acc + cantidad,
      0
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
          a[1] > b[1] ? a : b
        )[0];
      }
    }

    let afectacionPrincipal = "Sin datos";

    if (filtros.tipoReporte === "Morbilidad de aves") {
      const contadorSintomas = {};
      const contadorAfectacion = {};

      filtrados.forEach((item) => {
        if (item.afectacion) {
          contadorAfectacion[item.afectacion] =
            (contadorAfectacion[item.afectacion] || 0) + 1;
        }

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
          a[1] > b[1] ? a : b
        )[0];
      }

      if (Object.keys(contadorAfectacion).length > 0) {
        afectacionPrincipal = Object.entries(contadorAfectacion).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
      }
    }

    let categoriaPrincipal = "Sin datos";

    if (filtros.tipoReporte === "Clasificación de huevos") {
      const contadorCategorias = {};

      filtrados.forEach((item) => {
        if (!item.detalles) return;

        Object.entries(item.detalles).forEach(([categoria, datosCategoria]) => {
          const cantidad = Number(datosCategoria?.hoy || datosCategoria?.unidades || 0);

          if (cantidad > 0) {
            contadorCategorias[categoria] =
              (contadorCategorias[categoria] || 0) + cantidad;
          }
        });
      });

      if (Object.keys(contadorCategorias).length > 0) {
        categoriaPrincipal = Object.entries(contadorCategorias).reduce(
          (a, b) => (a[1] > b[1] ? a : b)
        )[0];
      }
    }

    const contadorGalpones = {};

    filtrados.forEach((item) => {
      if (!item.galpon) return;

      const gNombre = obtenerNombreGalpon(item.galpon);
      contadorGalpones[gNombre] =
        (contadorGalpones[gNombre] || 0) + Number(item.cantidad || 0);
    });

    const galponPrincipal =
      Object.keys(contadorGalpones).length > 0
        ? Object.entries(contadorGalpones).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0]
        : "Sin datos";

    setResumen({
      totalRegistros: filtrados.length,
      totalCantidad,
      promedio: Number(promedio.toFixed(1)),
      maximo,
      minimo,

      totalHuevosBuenos,
      totalHuevosRotos,
      totalHuevosDescarte,
      tasaMerma,

      totalPanales: Math.floor(totalPanales),
      totalDinero: Math.round(totalDinero),
      totalSobrantes: Math.floor(totalSobrantes),

      causaPrincipal,
      afectacionPrincipal,
      categoriaPrincipal,
      galponPrincipal,
    });

    setDatos(filtrados);
    setReporteGenerado(true);
  };

  const cambiarTipoReporte = (e) => {
    const nuevoTipo = e.target.value;

    setFiltros({
      ...filtros,
      tipoReporte: nuevoTipo,
    });

    setDatos([]);
    setReporteGenerado(false);

    setResumen({
      totalRegistros: 0,
      totalCantidad: 0,
      promedio: 0,
      maximo: 0,
      minimo: 0,

      totalHuevosBuenos: 0,
      totalHuevosRotos: 0,
      totalHuevosDescarte: 0,
      tasaMerma: 0,

      totalPanales: 0,
      totalDinero: 0,
      totalSobrantes: 0,

      causaPrincipal: "Sin datos",
      afectacionPrincipal: "Sin datos",
      categoriaPrincipal: "Sin datos",
      galponPrincipal: "Sin datos",
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoReporte: "",
      fechaInicio: "",
      fechaFin: "",
      galpon: "",
    });
    setDatos([]);
    setReporteGenerado(false);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
          Generación de Reportes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-7xl">
          Analiza y exporta métricas consolidadas sobre producción de huevos,
          clasificación comercial, mortalidad y sanidad de tu unidad avícola.
        </p>
      </header>

      <FiltrosReportes
        filtros={filtros}
        setFiltros={setFiltros}
        listaGalpones={listaGalpones}
        generarReporte={generarReporte}
        cambiarTipoReporte={cambiarTipoReporte}
        limpiarFiltros={limpiarFiltros}
      />

      {reporteGenerado && (
        <>
          <ResumenReportes
            resumen={resumen}
            tipoReporte={filtros.tipoReporte}
          />

          <GraficosReportes datos={datos} tipoReporte={filtros.tipoReporte} />

          <TablaReportes datos={datos} filtros={filtros} resumen={resumen} />
        </>
      )}

      {!reporteGenerado && (
        <section className="bg-white dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">
              assessment
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Ningún reporte generado aún
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Selecciona un tipo de reporte y los criterios de fecha o galpón en el
            panel superior para visualizar los indicadores, gráficos y tablas de detalle.
          </p>
        </section>
      )}
    </div>
  );
}
