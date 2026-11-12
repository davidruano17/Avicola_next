'use client';

import { useState, useEffect } from 'react';
import FormMortalidad from '@/components/FormMortalidad'
import EstadisticasMortalidad from '@/components/EstadisticasMortalidad';
import ModalEditarMortalidad from '@/components/ModalEditarMortalidad';
import ModalEliminarMortalidad from '@/components/ModalEliminarMortalidad';
import TablaMortalidad from '@/components/TablaMortalidad';
import api from '@/services/api';

const GALPONES_DEFAULT = [
  {
    id: 1,
    galpon: "01",
    lote: "01",
    numeroAves: 1500,
    numeroAvesInicial: 1500,
    linea: "Ross 308",
    responsable: "Carlos Gómez",
    fecha: new Date().toISOString().split("T")[0],
    hora: "08:00",
    pesoPromedio: "42g",
    semanadevida: "1",
    observaciones: "Lote de inicio",
  },
  {
    id: 2,
    galpon: "02",
    lote: "02",
    numeroAves: 1200,
    numeroAvesInicial: 1200,
    linea: "Cobb 500",
    responsable: "María Rodríguez",
    fecha: new Date().toISOString().split("T")[0],
    hora: "09:30",
    pesoPromedio: "43g",
    semanadevida: "1",
    observaciones: "Lote de inicio",
  },
];

function coincideGalpon(item, identificador, galponId) {
  if (galponId && item.id && String(item.id) === String(galponId)) {
    return true;
  }
  if (!identificador) return false;
  const idStr = String(identificador).trim().toLowerCase();
  const galpStr = String(item.galpon || "").trim().toLowerCase();
  const loteStr = String(item.lote || "").trim().toLowerCase();
  if (galpStr === idStr || loteStr === idStr) return true;
  const idNorm = idStr.replace(/^0+/, "");
  const galpNorm = galpStr.replace(/^0+/, "");
  if (idNorm && galpNorm && idNorm === galpNorm) return true;
  return false;
}

export default function Page() {
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [registroEliminar, setRegistroEliminar] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const [cargado, setCargado] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [galpones, setGalpones] = useState([]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        await api.sincronizarPendientes().catch(() => { });
        const [mortRes, galpRes] = await Promise.all([
          api.get('/sanidad/mortalidad/').catch(() => null),
          api.get('/galpones/').catch(() => null)
        ]);

        const mortList = Array.isArray(mortRes) ? mortRes : (mortRes?.results || []);
        const guardados = JSON.parse(localStorage.getItem("registrosMortalidad")) || [];
        const pendientesLocales = guardados.filter(g =>
          !mortList.some(m => String(m.id) === String(g.id)) &&
          ((typeof g.id === 'string' && g.id.startsWith('temp_')) || Number(g.id) > 100000000000)
        );

        const migrados = [];
        for (const loc of pendientesLocales) {
          try {
            const creado = await api.post('/sanidad/mortalidad/', loc);
            if (creado && creado.id && Number(creado.id) < 100000000000) {
              migrados.push(creado);
            } else {
              migrados.push(loc);
            }
          } catch {
            migrados.push(loc);
          }
        }

        const combinados = [...migrados, ...mortList];
        setRegistros(combinados);
        localStorage.setItem("registrosMortalidad", JSON.stringify(combinados));

        const galpList = Array.isArray(galpRes) ? galpRes : (galpRes?.results || []);
        if (galpList.length > 0) {
          const normalizados = galpList.map(g => ({
            ...g,
            numeroAvesInicial: g.numeroAvesInicial ?? Number(g.numeroAves ?? g.numerodeaves ?? 0),
            numeroAves: Number(g.numeroAves ?? g.numerodeaves ?? 0)
          }));
          setGalpones(normalizados);
          localStorage.setItem("historialgalpones", JSON.stringify(normalizados));
        } else {
          const storedGalpones =
            JSON.parse(localStorage.getItem("historialgalpones")) ||
            JSON.parse(localStorage.getItem("historialLotes"));
          let galponesFinales =
            storedGalpones && storedGalpones.length > 0
              ? storedGalpones
              : GALPONES_DEFAULT;
          setGalpones(galponesFinales);
        }
      } catch {
        setRegistros(JSON.parse(localStorage.getItem("registrosMortalidad")) || []);
        setGalpones(GALPONES_DEFAULT);
      } finally {
        setCargado(true);
      }
    }
    cargarDatos();
  }, []);

  // Poblaciones calculadas en tiempo real
  const poblacionActiva = galpones.reduce(
    (acc, g) => acc + Number(g.numeroAves ?? g.numerodeaves ?? 0),
    0
  );
  const poblacionInicialTotal = galpones.reduce(
    (acc, g) =>
      acc + Number(g.numeroAvesInicial ?? g.numeroAves ?? g.numerodeaves ?? 0),
    0
  );

  function abrirEditar(registro) {
    setRegistroEditar(registro);
    setModalEditarAbierto(true);
  }

  function abrirEliminar(registro) {
    setRegistroEliminar(registro);
    setModalEliminarAbierto(true);
  }

  async function agregarRegistro(nuevoRegistro) {
    const cantidad = Number(nuevoRegistro.cantidad || 0);
    const galponTarget = nuevoRegistro.galpon;
    const galponId = nuevoRegistro.galponId;

    let registroFinal = nuevoRegistro;
    try {
      const res = await api.post('/sanidad/mortalidad/', nuevoRegistro);
      if (res && res.id) registroFinal = res;
    } catch (err) {
      console.warn("Fallo al guardar mortalidad en API, usando respaldo local:", err);
    }

    // 1. Guardar nuevo registro de mortalidad
    setRegistros((prev) => {
      const actualizados = [registroFinal, ...prev];
      localStorage.setItem("registrosMortalidad", JSON.stringify(actualizados));
      return actualizados;
    });

    // 2. Descontar las aves del galpón correspondiente
    let nombreGalpon = galponTarget;
    let avesRestantes = 0;

    setGalpones((prevGalpones) => {
      let descontado = false;
      const actualizados = prevGalpones.map((g) => {
        if (!descontado && coincideGalpon(g, galponTarget, galponId)) {
          descontado = true;
          nombreGalpon = g.galpon || galponTarget;
          const avesActuales = Number(g.numeroAves ?? g.numerodeaves ?? 0);
          const nuevasAves = Math.max(0, avesActuales - cantidad);
          avesRestantes = nuevasAves;
          return {
            ...g,
            numeroAves: nuevasAves,
            numerodeaves: nuevasAves,
            numeroAvesInicial: g.numeroAvesInicial ?? avesActuales,
          };
        }
        return g;
      });

      // Persistir en localStorage
      localStorage.setItem("historialgalpones", JSON.stringify(actualizados));
      return actualizados;
    });

    mostrarMensaje(
      `Registro guardado. Se restaron ${cantidad} aves del Galpón ${nombreGalpon} (quedan ${avesRestantes.toLocaleString()} aves).`
    );
  }

  async function editarRegistro(registroActualizado, registroAnterior) {
    if (!registroAnterior) return;

    let registroFinal = registroActualizado;
    const idReal = Number(registroActualizado.mortalidad_id ?? registroActualizado.id);

    try {
      if (idReal && !isNaN(idReal) && idReal < 100000000000) {
        const res = await api.put(`/sanidad/mortalidad/${idReal}/`, registroActualizado);
        if (res && res.id) registroFinal = res;
      } else {
        const res = await api.post('/sanidad/mortalidad/', registroActualizado);
        if (res && res.id) registroFinal = res;
      }
    } catch (err) {
      console.warn("Fallo al actualizar mortalidad en API, usando respaldo local:", err);
    }

    const anteriorCantidad = Number(registroAnterior.cantidad || 0);
    const nuevaCantidad = Number(registroFinal.cantidad || 0);
    const anteriorGalpon = registroAnterior.galpon;
    const nuevoGalpon = registroFinal.galpon;
    const anteriorGalponId = registroAnterior.galponId;
    const nuevoGalponId = registroFinal.galponId;

    // 1. Actualizar registro en lista
    setRegistros((prev) => {
      const actualizados = prev.map((r) =>
        r.id === registroAnterior.id || r.id === registroActualizado.id ? registroFinal : r
      );
      localStorage.setItem("registrosMortalidad", JSON.stringify(actualizados));
      return actualizados;
    });

    // 2. Ajustar cantidad en galpones
    setGalpones((prevGalpones) => {
      const actualizados = prevGalpones.map((g) => {
        const esAnterior = coincideGalpon(g, anteriorGalpon, anteriorGalponId);
        const esNuevo = coincideGalpon(g, nuevoGalpon, nuevoGalponId);
        const avesActuales = Number(g.numeroAves ?? g.numerodeaves ?? 0);

        // Mismo galpón: aplicar la diferencia
        if (esAnterior && esNuevo) {
          const diferencia = nuevaCantidad - anteriorCantidad;
          const nuevasAves = Math.max(0, avesActuales - diferencia);
          return {
            ...g,
            numeroAves: nuevasAves,
            numerodeaves: nuevasAves,
          };
        }

        // Se cambió de galpón: devolver aves al galpón anterior
        if (esAnterior && !esNuevo) {
          const nuevasAves = avesActuales + anteriorCantidad;
          return {
            ...g,
            numeroAves: nuevasAves,
            numerodeaves: nuevasAves,
          };
        }

        // Se cambió de galpón: restar aves al nuevo galpón
        if (!esAnterior && esNuevo) {
          const nuevasAves = Math.max(0, avesActuales - nuevaCantidad);
          return {
            ...g,
            numeroAves: nuevasAves,
            numerodeaves: nuevasAves,
          };
        }

        return g;
      });

      localStorage.setItem("historialgalpones", JSON.stringify(actualizados));
      return actualizados;
    });

    mostrarMensaje("Registro actualizado y conteo de aves del galpón ajustado.");
  }

  async function eliminarRegistro(registroAEliminar) {
    if (!registroAEliminar) return;

    try {
      if (registroAEliminar.id && typeof registroAEliminar.id === 'number' && registroAEliminar.id < 100000000000) {
        await api.delete(`/sanidad/mortalidad/${registroAEliminar.id}/`);
      }
    } catch (err) {
      console.warn("Fallo al eliminar mortalidad en API, aplicando respaldo local:", err);
    }

    const cantidadReintegrar = Number(registroAEliminar.cantidad || 0);
    const galponTarget = registroAEliminar.galpon;
    const galponId = registroAEliminar.galponId;

    // 1. Eliminar de lista de registros
    setRegistros((prev) => {
      const actualizados = prev.filter((r) => r.id !== registroAEliminar.id);
      localStorage.setItem("registrosMortalidad", JSON.stringify(actualizados));
      return actualizados;
    });

    // 2. Reincorporar aves al galpón
    let nombreGalpon = galponTarget;
    let avesTotales = 0;

    setGalpones((prevGalpones) => {
      let reintegrado = false;
      const actualizados = prevGalpones.map((g) => {
        if (!reintegrado && coincideGalpon(g, galponTarget, galponId)) {
          reintegrado = true;
          nombreGalpon = g.galpon || galponTarget;
          const avesActuales = Number(g.numeroAves ?? g.numerodeaves ?? 0);
          const nuevasAves = avesActuales + cantidadReintegrar;
          avesTotales = nuevasAves;
          return {
            ...g,
            numeroAves: nuevasAves,
            numerodeaves: nuevasAves,
          };
        }
        return g;
      });

      localStorage.setItem("historialgalpones", JSON.stringify(actualizados));
      return actualizados;
    });

    mostrarMensaje(
      `Registro eliminado. Se reincorporaron ${cantidadReintegrar} aves al Galpón ${nombreGalpon} (total: ${avesTotales.toLocaleString()} aves).`
    );
  }

  function mostrarMensaje(texto) {
    setMensaje(texto);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  }

  useEffect(() => {
    if (cargado) {
      localStorage.setItem("registrosMortalidad", JSON.stringify(registros));
    }
  }, [registros, cargado]);
  return (
    <>
      <div className="text-slate-900 dark:text-slate-100 min-h-screen font-sans">
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
            <section className="flex flex-col gap-1 max-w-3xl">
              <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                Mortalidad de las aves
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-normal">
                Registra y gestiona organizadamente los datos relacionados con
                la mortalidad de las aves dentro de tu unidad avícola.
              </p>
            </section>
            <section className="w-full md:w-auto shrink-0">
              <FormMortalidad
                galpones={galpones}
                agregarRegistro={agregarRegistro}
                mostrarMensaje={mostrarMensaje}
              />
            </section>
          </header>

          <TablaMortalidad
            registros={registros}
            abrirEditar={abrirEditar}
            abrirEliminar={abrirEliminar}
          />

          <EstadisticasMortalidad
            registros={registros}
            poblacionTotal={poblacionInicialTotal}
            poblacionActiva={poblacionActiva}
          />

          <ModalEditarMortalidad
            abierto={modalEditarAbierto}
            cerrar={() => {
              setModalEditarAbierto(false);
              setRegistroEditar(null);
            }}
            registro={registroEditar}
            galpones={galpones}
            editarRegistro={editarRegistro}
            mostrarMensaje={mostrarMensaje}
          />

          <ModalEliminarMortalidad
            abierto={modalEliminarAbierto}
            cerrar={() => {
              setModalEliminarAbierto(false);
              setRegistroEliminar(null);
            }}
            registro={registroEliminar}
            eliminarRegistro={eliminarRegistro}
            mostrarMensaje={mostrarMensaje}
          />
        </main>
      </div>

      {mensaje && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 max-w-[90vw] bg-green-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 text-sm font-medium transition-all"
        >
          <span className="material-symbols-outlined shrink-0 text-base">check_circle</span>
          <span className="truncate">{mensaje}</span>
        </aside>
      )}
    </>
  );
}