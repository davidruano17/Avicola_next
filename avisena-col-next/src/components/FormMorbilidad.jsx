"use client";

import { useState } from 'react';
export default function FormMorbilidad({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    responsable: '',
    fecha: '',
    galpon: '',
    lote: '',
    sintomas: [],
    afectacion: 'Leve',
    cantidad: '',
    accion: '',
    observaciones: ''
  });

  const handleSintomasChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData({ ...formData, sintomas: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center backdrop-blur-sm p-4 overflow-y-auto">
      <aside className="w-full max-w-2xl max-h-[85vh] m-auto overflow-y-auto">
        <section className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-xl p-4 shadow-xl relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-icons">close</span>
          </button>

          <section className="flex items-center gap-2 mb-4">
            <span className="material-icons text-primary">assignment_add</span>
            <h3 className="text-lg font-semibold">Nuevo Registro de Morbilidad</h3>
          </section>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Responsable y Fecha de Reporte */}
            <section className="grid grid-cols-3 gap-4">
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Responsable</label>
                <input
                  id="f-responsable"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white h-10 px-3 text-sm"
                  placeholder="Nombre del técnico"
                  required
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </section>

              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Fecha de Reporte</label>
                <input
                  id="f-fecha"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white h-10 px-3 text-sm"
                  required
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Galpón</label>
                <select
                  id="galpon"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3"
                  required
                  value={formData.galpon}
                  onChange={(e) => setFormData({ ...formData, galpon: e.target.value })}
                >
                  <option value="">Seleccionar galpón...</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </section>
            </section>

            {/* Galpón y Lote */}
            <section className="grid grid-cols-3 gap-4">
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Grado de Afectación</label>
                <select
                  id="f-afectacion"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3 border"
                  required
                  value={formData.afectacion}
                  onChange={(e) => setFormData({ ...formData, afectacion: e.target.value })}
                >
                  <option value="Leve">🟢 Leve</option>
                  <option value="Moderado">🟡 Moderado</option>
                  <option value="Crítico">🔴 Crítico</option>
                </select>
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Aves Afectadas</label>
                <input
                  id="f-cantidad"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3 border"
                  placeholder="Cantidad"
                  type="number"
                  required
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                />
              </section>
              <section>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Acción Inmediata</label>
              <select
                id="f-accion"
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3 border"
                required
                value={formData.accion}
                onChange={(e) => setFormData({ ...formData, accion: e.target.value })}
              >
                <option value="">Seleccione acción...</option>
                <option value="Aislamiento">Aislamiento</option>
                <option value="Inicio de tratamiento">Inicio de tratamiento</option>
                <option value="Cuarentena de Galpón">Cuarentena de Galpón</option>
                <option value="Revisión Veterinaria">Revisión Veterinaria</option>
              </select>
            </section>
            </section>

            
            {/* Grado de Afectación y Aves Afectadas */}
            <section className="grid grid-cols-2 gap-4">
              {/* Síntomas / Causas Probables */}
                
                <section>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Síntomas / Causas Probables</label>
                  <textarea
                    id="f-sintomas"
                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm resize-none p-3 border"
                    placeholder="Detalles adicionales observados..."
                    rows="4"
                    value={formData.Sintomas}
                    onChange={(e) => setFormData({ ...formData, Sintomas: e.target.value })}
                  ></textarea>
                </section>
                <section>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observaciones Técnicas</label>
                  <textarea
                    id="f-observaciones"
                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm resize-none p-3 border"
                    placeholder="Detalles adicionales observados..."
                    rows="4"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  ></textarea>
                </section>
                
            </section>        

            <button
              className="w-full bg-primary hover:bg-[#3dbd14] text-black font-black py-4 px-6 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] border-none cursor-pointer text-base min-h-[56px]"
              type="submit"
            >
              <span className="material-icons text-sm">save</span>
              Guardar Registro
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
