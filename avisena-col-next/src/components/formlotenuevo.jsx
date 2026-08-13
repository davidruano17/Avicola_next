import { useState, useEffect } from 'react';
import { X, PlusCircle, Save, UploadCloud } from 'lucide-react';

export default function FormLoteNuevo({ onSubmit, onClose, initialData = null }) {
  const [formData, setFormData] = useState(() => ({
    fecha: initialData?.fecha || '',
    hora: initialData?.hora || '',
    numerodeaves: initialData?.numeroAves || '',
    linea: initialData?.linea || '',
    pesopromedio: initialData?.pesoPromedio || '',
    semanadevida: initialData?.semanadevida || '',
    responsable: initialData?.responsable || '',
    galpon: initialData?.galpon || '',
    certificados: initialData?.certificados || {
      name: '',
      type: '',
      data: '',
    },
    observaciones: initialData?.observaciones || '',
  }));
  const [loteOption, setLoteOption] = useState(() => {
    if (!initialData?.galpon) return '';
    return ['1', '2'].includes(initialData.galpon) ? initialData.galpon : 'otro';
  });
  const [otroGalpon, setOtroGalpon] = useState(() => {
    if (!initialData?.galpon) return '';
    return ['1', '2'].includes(initialData.galpon) ? '' : initialData.galpon;
  });

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      fecha: initialData.fecha || '',
      hora: initialData.hora || '',
      numerodeaves: initialData.numeroAves || '',
      linea: initialData.linea || '',
      pesopromedio: initialData.pesoPromedio || '',
      semanadevida: initialData.semanadevida || '',
      responsable: initialData.responsable || '',
      galpon: initialData.galpon || '',
      certificados: initialData.certificados || {
        name: '',
        type: '',
        data: '',
      },
      observaciones: initialData.observaciones || '',
    });

    if (['1', '2'].includes(initialData.galpon)) {
      setLoteOption(initialData.galpon);
      setOtroGalpon('');
    } else if (initialData.galpon) {
      setLoteOption('otro');
      setOtroGalpon(initialData.galpon);
    } else {
      setLoteOption('');
      setOtroGalpon('');
    }
  }, [initialData]);

  const handleLoteChange = (e) => {
    const value = e.target.value;
    setLoteOption(value);

    if (value === 'otro') {
      setOtroGalpon('');
      setFormData({ ...formData, galpon: '' });
      return;
    }

    setFormData({ ...formData, galpon: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({
        ...formData,
        certificados: {
          name: file.name,
          type: file.type,
          data: event.target.result,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center backdrop-blur-sm p-4 overflow-y-auto">
      <aside className="w-full max-w-2xl max-h-[90vh] m-auto overflow-y-auto">
        <section className="bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/10 rounded-3xl p-6 shadow-2xl relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold">Nuevo Galpón</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Registra aquí la información del lote y sus certificados.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500  mb-2">Fecha de ingreso</label>
                <input
                  id="f-fecha"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white h-11 px-3 text-sm"
                  required
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Hora de ingreso</label>
                <input
                  id="f-hora"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white h-11 px-3 text-sm"
                  required
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Galpón</label>
                <select
                  id="galpon"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  required
                  value={loteOption}
                  onChange={handleLoteChange}
                >
                  <option value="">Seleccionar galpón...</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>

              </div>
            </div>



            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Peso promedio</label>
                <input
                  id="pesopromedio"
                  type="text"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  placeholder="Peso promedio"
                  required
                  value={formData.pesopromedio}
                  onChange={(e) => setFormData({ ...formData, pesopromedio: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Número de aves</label>
                <input
                  id="numeroAves"
                  type="number"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  placeholder="Cantidad de aves"
                  required
                  value={formData.numerodeaves}
                  onChange={(e) => setFormData({ ...formData, numerodeaves: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Semana de vida</label>
                <input
                  id="semanadevida"
                  type="number"
                  min="1"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  placeholder="Semana de vida"
                  required
                  value={formData.semanadevida}
                  onChange={(e) => setFormData({ ...formData, semanadevida: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Línea de aves</label>
                <select
                  id="linea"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  required
                  value={formData.linea}
                  onChange={(e) => setFormData({ ...formData, linea: e.target.value })}
                >
                  <option value="">Seleccionar línea...</option>
                  <option value="Hy-line brown">Hy-line brown</option>
                  <option value="isa brown">isa brown</option>
                  <option value="Lohmann brown">Lohmann brown</option>
                  <option value="Babcock">Babcock</option>
                  <option value="Dekalb">Dekalb</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Responsable</label>
                <input
                  id="responsable"
                  type="text"
                  className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm h-11 px-3"
                  placeholder="Nombre del responsable"
                  required
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Certificados</label>
                <label
                  htmlFor="archivo"
                  className="flex items-center justify-between gap-2 w-full rounded-2xl border border-slate-200 dark:border-primary/20 bg-slate-50 dark:bg-background-dark px-4 py-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer transition-colors hover:border-primary"
                >
                  <span className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    {formData.certificados?.name || 'Seleccionar archivo'}
                  </span>
                  <span className="text-xs text-slate-400"></span>
                </label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  accept=".pdf,.jpg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>






            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Observaciones</label>
              <textarea
                id="observaciones"
                rows="4"
                className="w-full bg-white dark:bg-background-dark border border-slate-200 dark:border-primary/20 rounded-2xl focus:ring-primary focus:border-primary dark:text-white text-sm px-3 py-3"
                placeholder="Escribe aquí cualquier observación o nota del lote"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </div>

            <button
              className="w-full bg-primary hover:bg-[#3dbd14] text-black font-black py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] border-none cursor-pointer text-base min-h-[56px]"
              type="submit"
            >
              <Save className="h-4 w-4" />
              Guardar Registro
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
