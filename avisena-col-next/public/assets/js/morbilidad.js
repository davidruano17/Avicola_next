document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('morbilidad-form');
    const tbody = document.getElementById('tabla-morbilidad');

    // Cargar registros almacenados en el navegador
    cargarHistorial();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const responsable = document.getElementById('f-responsable').value;
        const fecha = document.getElementById('f-fecha').value;
        const galpon = document.getElementById('galpon').value;
        const loteSelect = document.getElementById('lote').value;
        const lote = `Galpón ${galpon} - Lote ${loteSelect}`;

        const sintomasSelect = document.getElementById('f-sintomas');
        const sintomas = Array.from(sintomasSelect.selectedOptions).map(opt => opt.value).join(', ');

        const afectacion = document.getElementById('f-afectacion').value;
        const accion = document.getElementById('f-accion').value;

        const nuevoRegistro = {
            responsable,
            fecha,
            lote,
            sintomas,
            afectacion,
            accion
        };

        // Guardar en LocalStorage y actualizar tabla
        guardarRegistro(nuevoRegistro);
        cargarHistorial();

        showNotification('¡Registro Exitoso!', 'La incidencia de morbilidad ha sido documentada.');
        form.reset();
        toggleModal('modal-morbilidad');
    });

    function guardarRegistro(registro) {
        let historial = JSON.parse(localStorage.getItem('historialMorbilidad')) || [];
        historial.unshift(registro);
        localStorage.setItem('historialMorbilidad', JSON.stringify(historial));
    }

    function cargarHistorial() {
        const historial = JSON.parse(localStorage.getItem('historialMorbilidad')) || [];
        tbody.innerHTML = ''; // Limpiar la tabla

        historial.forEach(registro => {
            // Determinar color badge afectacion
            let badgeColor = '';
            if (registro.afectacion === 'Crítico') badgeColor = 'bg-red-500/20 text-red-500';
            else if (registro.afectacion === 'Moderado') badgeColor = 'bg-amber-500/20 text-amber-500';
            else badgeColor = 'bg-emerald-500/20 text-emerald-500';

            // Formatear fecha
            const partesFecha = registro.fecha.split('-');
            const fechaFormateada = partesFecha.length === 3 ? `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}` : registro.fecha;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-primary/5 transition-colors';

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium">${fechaFormateada}</td>
                <td class="px-6 py-4">${registro.lote}</td>
                <td class="px-6 py-4 text-xs">${registro.sintomas}</td>
                <td class="px-6 py-4"><span class="${badgeColor} px-2 py-1 rounded text-[10px] font-bold uppercase">${registro.afectacion}</span></td>
                <td class="px-6 py-4 text-xs">${registro.accion}</td>
                <td class="px-6 py-4 text-xs">${registro.responsable}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="window.location.href='tratamiento.html'" class="bg-primary/10 hover:bg-primary text-primary hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center justify-center gap-1 mx-auto">
                        <span class="material-icons text-[14px]">medical_services</span>
                        Agregar
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }
});

// Función para abrir/cerrar modal
window.toggleModal = function (modalID) {
    document.getElementById(modalID).classList.toggle("hidden");
    document.getElementById(modalID).classList.toggle("flex");
}

function showNotification(title, message) {
    console.log(`${title}: ${message}`);

    const toast = document.createElement('div');
    toast.className = "fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex gap-3 animate-bounce z-50";
    toast.innerHTML = `
        <span class="material-icons text-emerald-400">check_circle</span>
        <div>
            <p class="font-bold text-sm">${title}</p>
            <p class="text-xs text-slate-400">${message}</p>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}