/**
 * SENA Avícola - Gestión de Producción
 * Lógica funcional para panel de control
 */

const AvicolaApp = {
    data: JSON.parse(localStorage.getItem('avicola_db')) || [],

    init() {
        this.cacheElements();
        this.bindEvents();
        this.calculateFeed();
        this.updateDashboard();
        this.setCurrentDate();
        console.log('Sistema Avícola inicializado...');
    },

    cacheElements() {
        this.form = document.querySelector('form');
        this.btnSave = this.form?.querySelector('button[type="button"]');
        this.btnSync = document.querySelector('button.bg-primary');
        this.btnVerTodo = document.querySelector('button.text-primary.text-sm.font-bold');

        this.inputs = {
            fecha: this.form?.querySelector('input[type="date"]'),
            hora: this.form?.querySelector('input[type="time"]'),
            worker: this.form?.querySelector('input[placeholder="Ingresar nombre"]'),
            galpon: this.form?.querySelector('select'),
            buenos: document.getElementById('input-huevos-buenos'),
            rotos: document.getElementById('input-huevos-rotos'),
            descarte: document.getElementById('input-descarte'),
            notas: this.form?.querySelector('input[placeholder*="dañados"]')
        };

        this.calcAves = document.getElementById('calc-nro-aves');
        this.calcGramos = document.getElementById('calc-g-ave');
        this.calcOutput = document.querySelector('output p.text-xl');
        this.calcBultos = document.querySelector('p.bg-slate-50 span.font-bold');

        this.tableBody = document.querySelector('tbody');
        this.fcrInputAlimento = document.getElementById('fcr-alimento-consumido');
        this.fcrInputHuevos = document.getElementById('fcr-huevos-total');
        this.fcrValueEl = document.getElementById('fcr-score');

        this.metricTotal = document.getElementById('metric-total-huevos');
        this.metricLastTime = document.getElementById('metric-last-time');
        this.metricTotalRecolecciones = document.getElementById('metric-total-recolecciones');
        this.metricWorker = document.getElementById('metric-worker');
    },

    bindEvents() {
        if (this.btnSave) {
            this.btnSave.addEventListener('click', () => this.saveRegistration());
        }

        if (this.calcAves) {
            this.calcAves.addEventListener('input', () => this.calculateFeed());
        }

        if (this.calcGramos) {
            this.calcGramos.addEventListener('input', () => this.calculateFeed());
        }

        if (this.form) {
            this.form.addEventListener('reset', () => setTimeout(() => this.calculateFeed(), 10));
        }

        if (this.btnSync) {
            this.btnSync.addEventListener('click', () => this.syncDataAnimation());
        }

        if (this.btnVerTodo) {
            this.btnVerTodo.addEventListener('click', () => this.toggleModal(true));
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.toggleModal(false);
        });
    },

    toggleModal(show) {
        const modal = document.getElementById('modal-historial');
        if (!modal) return;

        if (show) {
            modal.classList.remove('hidden');
            this.renderFullHistory();
        } else {
            modal.classList.add('hidden');
        }
    },

    renderFullHistory() {
        const modalBody = document.getElementById('modal-table-body');
        if (!modalBody) return;

        modalBody.innerHTML = '';

        if (this.data.length === 0) {
            modalBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400">No hay registros históricos.</td></tr>`;
            return;
        }

        this.data.forEach(item => {
            modalBody.innerHTML += `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                    <td class="px-4 py-4 text-sm font-medium">${item.fecha} <br> <span class="text-xs text-slate-400">${item.hora}</span></td>
                    <td class="px-4 py-4 text-sm">${item.worker}</td>
                    <td class="px-4 py-4 text-sm">${item.galpon}</td>
                    <td class="px-4 py-4 text-center text-sm font-bold text-primary">${item.buenos}</td>
                    <td class="px-4 py-4 text-center text-sm text-red-400">${item.rotos}</td>
                    <td class="px-4 py-4 text-center text-sm">${item.alimento.toFixed(1)} kg</td>
                    <td class="px-4 py-4 text-right">
                        <button onclick="AvicolaApp.deleteItem(${item.id})" class="text-slate-300 hover:text-red-500 p-1">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        });
    },

    calculateFeed() {
        const aves = parseFloat(this.calcAves?.value) || 0;
        const gramos = parseFloat(this.calcGramos?.value) || 0;
        const totalKg = (aves * gramos) / 1000;
        const bultos = totalKg / 50;

        if (this.calcOutput) {
            this.calcOutput.innerHTML = `${totalKg.toFixed(1)} <span class="text-xs font-normal text-slate-500">kg</span>`;
        }

        if (this.calcBultos) {
            this.calcBultos.innerText = bultos.toFixed(1);
        }

        if (this.fcrInputAlimento) {
            this.fcrInputAlimento.value = totalKg.toFixed(1);
        }

        return totalKg;
    },

    saveRegistration() {
        const entry = {
            id: Date.now(),
            fecha: this.formatDate(this.inputs.fecha?.value),
            hora: this.inputs.hora?.value || '--:--',
            worker: this.inputs.worker?.value || 'Anónimo',
            galpon: this.inputs.galpon?.value || 'No definido',
            buenos: parseInt(this.inputs.buenos?.value) || 0,
            rotos: parseInt(this.inputs.rotos?.value) || 0,
            descarte: parseInt(this.inputs.descarte?.value) || 0,
            alimento: this.calculateFeed()
        };

        if (entry.buenos === 0) {
            alert('Por favor, ingrese al menos la cantidad de huevos buenos.');
            return;
        }

        this.data.unshift(entry);
        this.syncStorage();
        this.updateDashboard();
        this.form?.reset();
        alert('Registro guardado exitosamente.');
    },

    formatDate(value) {
        if (!value) {
            return new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    updateDashboard() {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = '';
        let totalHuevosHoy = 0;

        if (this.data.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">No hay registros aún.</td></tr>`;
        }

        this.data.forEach(item => {
            totalHuevosHoy += item.buenos;
            this.tableBody.innerHTML += `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-bold text-sm m-0">${item.fecha}</p>
                        <p class="text-xs text-slate-400 m-0">${item.hora}</p>
                    </td>
                    <td class="px-6 py-4 text-sm">${item.worker}</td>
                    <td class="px-6 py-4 text-sm font-medium">${item.galpon}</td>
                    <td class="px-6 py-4 text-center text-sm font-bold">${item.buenos}</td>
                    <td class="px-6 py-4 text-center text-sm">${item.alimento.toFixed(1)}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="AvicolaApp.deleteItem(${item.id})" class="text-slate-400 hover:text-red-500 p-1">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </td>
                </tr>
            `;
        });

        const cubetas = Math.floor(totalHuevosHoy / 30);
        const sueltos = totalHuevosHoy % 30;
        const widgets = document.querySelectorAll('aside article section p span.text-xl');
        if (widgets.length >= 3) {
            widgets[0].innerText = totalHuevosHoy.toLocaleString();
            widgets[1].innerText = cubetas;
            widgets[2].innerText = sueltos;
        }

        if (this.fcrInputHuevos) this.fcrInputHuevos.value = totalHuevosHoy;
        this.updateHeaderMetrics();
        this.updateFCRScore(totalHuevosHoy);
    },

    updateHeaderMetrics() {
        if (this.metricTotal) {
            this.metricTotal.innerText = this.data.reduce((sum, item) => sum + item.buenos, 0).toLocaleString();
        }

        if (this.metricLastTime && this.data.length > 0) {
            this.metricLastTime.innerText = this.data[0].hora;
        }

        if (this.metricTotalRecolecciones) {
            this.metricTotalRecolecciones.innerText = String(this.data.length);
        }

        if (this.metricWorker && this.data.length > 0) {
            this.metricWorker.innerText = this.data[0].worker;
        }
    },

    updateFCRScore(totalHuevos) {
        const kgAlimento = parseFloat(this.fcrInputAlimento?.value) || 0;
        const score = totalHuevos > 0 ? (kgAlimento / (totalHuevos * 0.06)).toFixed(2) : '0.0';

        if (this.fcrValueEl) {
            this.fcrValueEl.innerText = score;
        }
    },

    deleteItem(id) {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            this.data = this.data.filter(item => item.id !== id);
            this.syncStorage();
            this.updateDashboard();
        }
    },

    syncDataAnimation() {
        if (!this.btnSync) return;

        const originalText = this.btnSync.innerHTML;
        this.btnSync.disabled = true;
        this.btnSync.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Sincronizando...`;

        setTimeout(() => {
            this.btnSync.disabled = false;
            this.btnSync.innerHTML = originalText;
            this.updateHeaderMetrics();
            alert('Datos sincronizados con éxito con el sistema del Centro Agropecuario.');
        }, 1500);
    },

    syncStorage() {
        localStorage.setItem('avicola_db', JSON.stringify(this.data));
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => AvicolaApp.init());
}