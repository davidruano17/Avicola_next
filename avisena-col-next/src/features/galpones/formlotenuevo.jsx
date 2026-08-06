'use client';

import { useState } from 'react';
export default function FormLoteNuevo({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    lote: '',
    numerodeaves: '',
    linea: '',
    responsable: '',
    galpon: '',
  });
  const [loteOption, setLoteOption] = useState('');
  const [otroLote, setOtroLote] = useState('');

  const handleLoteChange = (e) => {
    const value = e.target.value;
    setLoteOption(value);

    if (value === 'otro') {
      setOtroLote('');
      setFormData({ ...formData, lote: '' });
      return;
    }

    setFormData({ ...formData, lote: value });
  };

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
      <aside className="w-full max-w-4xl max-h-[90vh] m-auto overflow-y-auto">
        <section className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-xl p-6 shadow-xl relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            <span className="material-icons">close</span>
          </button>

          <section className="flex items-center gap-2 mb-6">
            <span className="material-icons text-primary">assignment_add</span>
            <h3 className="text-lg font-semibold">Nuevo Lote</h3>
          </section>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fecha y Hora */}
            <section className="grid grid-cols-2 gap-4">
              <section>
                <label className="block text-xs font-bold uppercase text-primary mb-2">Fecha de ingreso</label>
                <input
                  id="f-fecha"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white h-10 px-3 text-sm"
                  placeholder="Fecha de ingreso"
                  required
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </section>

              <section>
                <label className="block text-xs font-bold uppercase text-primary mb-2">Hora de ingreso</label>
                <input
                  id="f-hora"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white h-10 px-3 text-sm"
                  required
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </section>
            </section>

            {/* Lote y Número de aves */}
            <section className="grid grid-cols-2 gap-4">
              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Lote</label>
                <select
                  id="lote"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3"
                  required
                  value={loteOption}
                  onChange={handleLoteChange}
                >
                  <option value="">Seleccionar lote...</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="otro">Otro</option>
                </select>
                {loteOption === 'otro' && (
                  <section className="mt-3">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3"
                      placeholder="Ingrese nombre del lote"
                      value={otroLote}
                      required
                      onChange={(e) => {
                        setOtroLote(e.target.value);
                        setFormData({ ...formData, lote: e.target.value });
                      }}
                    />
                  </section>
                )}
              </section>

              <section>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Número de aves</label>
                <input
                  id="numeroAves"
                  type="number"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3"
                  placeholder="Cantidad de aves"
                  required
                  value={formData.numerodeaves}
                  onChange={(e) => setFormData({ ...formData, numerodeaves: e.target.value })}
                />
              </section>
            </section>
            

            <section>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Líneas de aves</label>
              <select
                id="linea"
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white text-sm h-10 px-3 border"
                required
                value={formData.linea}
                onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
              >
                <option value="">Líneas de aves</option>
                <option value="1">Hy-line brown</option>
                <option value="2">isa brown</option>
                <option value="3">Lohmann brown</option>
                <option value="4">Babcock</option>
                <option value="5">Dekalb</option>
              </select>
            </section>

            {/* Responsable */}
            <section>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Responsable</label>
              <input
                id="responsable"
                type="text"
                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-lg focus:ring-primary focus:border-primary dark:text-white transition-all text-sm h-10 px-3 border"
                placeholder="Nombre del responsable"
                required
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              />
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
