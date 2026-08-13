"use client";

import { useState } from 'react';

export default function FormTratamiento({ onSubmit, onClose, defaultData }) {
  const [formData, setFormData] = useState({
    fechaInicio: defaultData?.fechaInicio || '',
    galpon: defaultData?.galpon || '1',
    medicamento: defaultData?.medicamento || '',
    tipo: defaultData?.tipo || 'Antimicrobiano',
    dosis: defaultData?.dosis || '',
    viaAdministracion: defaultData?.viaAdministracion || 'Agua',
    duracion: defaultData?.duracion || '3',
    observaciones: defaultData?.observaciones || '',
    responsable: defaultData?.responsable || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center backdrop-blur-sm p-4 overflow-y-auto">
      <aside className="w-full max-w-2xl max-h-[90vh] m-auto overflow-y-auto">
        <section className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-xl p-6 shadow-xl relative text-left">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-icons">close</span>
          </button>

          <section className="flex items-center gap-2 mb-6">
            <span className="material-icons text-primary">add_circle_outline</span>
            <h3 className="text-lg font-semibold">Nuevo Tratamiento</h3>
          </section>

          <form onSubmit={handleSubmit} className="space-y-4">
           
            {/* Galpón y Lote */}
            <section className="grid grid-cols-3 gap-4">
               {/* Fecha Inicio */}
                <section>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fecha de Tratamiento</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                  />
                </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Galpón</label>
                <select
                  value={formData.galpon}
                  onChange={(e) => setFormData({ ...formData, galpon: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                >
                  <option value="1">Galpón 1</option>
                  <option value="2">Galpón 2</option>
                </select>
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Medicamento</label>
                <input
                  type="text"
                  value={formData.medicamento}
                  onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                  required
                  placeholder="Ej: Enrofloxacina"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                />
              </section>
            </section>

            {/* Medicamento y Tipo */}
            <section className="grid grid-cols-3 gap-4">
              
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                >
                  <option value="Antimicrobiano">Antimicrobiano</option>
                  <option value="Antiparasitario">Antiparasitario</option>
                  <option value="Vitaminas">Vitaminas</option>
                  <option value="Antiinflamatorio">Antiinflamatorio</option>
                  <option value="Vacuna">Vacuna</option>
                </select>
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Dosis / Cantidad</label>
                <input
                  type="text"
                  value={formData.dosis}
                  onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                  required
                  placeholder="Ej: 10 ml"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                />
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Vía Administración</label>
                <select
                  value={formData.viaAdministracion}
                  onChange={(e) => setFormData({ ...formData, viaAdministracion: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                >
                  <option value="Agua">En el agua</option>
                  <option value="Alimento">En el alimento</option>
                  <option value="Inyección">Inyección</option>
                  <option value="Tópico">Tópico</option>
                </select>
              </section>
            </section>

            {/* Dosis y Vía de Administración */}
            <section className="grid grid-cols-2 gap-4">
              
            </section>

            {/* Duración y Personal Responsable */}
            <section className="grid grid-cols-2 gap-4">
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Duración (días)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.duracion}
                  onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                />
              </section>
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Responsable</label>
                <input
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  required
                  placeholder="Nombre del técnico"
                  className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary dark:text-white transition-all h-10 border"
                />
              </section>
            </section>

            {/* Observaciones */}
            <section>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas o reacciones observadas..."
                rows="4"
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm resize-none p-3 border transition-all min-h-[120px]"
              />
            </section>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#3dbd14] text-black py-4 px-6 text-base font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all border-none cursor-pointer min-h-[56px]"
            >
              <span className="material-icons w-4 h-4">save</span>
              Registrar Tratamiento
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
