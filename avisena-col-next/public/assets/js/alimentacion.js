// --- CONFIGURACIÓN INICIAL DE DATOS ---
let silos = {
    Starter: { porcentaje: 85, lote: "Lote A-12" },
    Grower: { porcentaje: 42, lote: "Lote B-05" },
    Layer: { porcentaje: 12, lote: "Lote C-02" }
};

let registros = [
    { fecha: "2024-05-20", lote: "Lote A-12", cantidad: 60, operador: "Carlos I." },
    { fecha: "2024-05-19", lote: "Lote B-05", cantidad: 45, operador: "Admin" }
];

// --- ELEMENTOS DEL DOM ---
const modal = document.getElementById('modalSection');
const btnOpen = document.getElementById('btnOpen');
const btnClose = document.getElementById('btnClose');
const formRegistro = document.getElementById('formRegistro');
const tablaBody = document.getElementById('tablaBody');

// --- FUNCIONES DE INTERFAZ ---

// 1. Renderizar la tabla de registros
const renderizarTabla = () => {
    tablaBody.innerHTML = '';
    registros.forEach(reg => {
        const fila = `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-600">${reg.fecha}</td>
                <td class="px-6 py-4 font-bold text-slate-900">${reg.lote}</td>
                <td class="px-6 py-4 text-right font-black text-slate-900">${reg.cantidad} kg</td>
                <td class="px-6 py-4 text-slate-500">${reg.operador}</td>
            </tr>
        `;
        tablaBody.insertAdjacentHTML('beforeend', fila);
    });
};

// 2. Actualizar visualmente las barras de los silos
const actualizarSilosUI = () => {
    // Esta función busca los elementos basándose en el orden o IDs si los tuvieras.
    // Como en tu HTML no tienen IDs únicos para el texto, usaremos lógica de selección:
    const articles = document.querySelectorAll('article');
    
    // Actualizar Starter (Índice 0 de los articles de silos)
    const starterArt = articles[0];
    starterArt.querySelector('b.text-green-500').innerText = `${silos.Starter.porcentaje}%`;
    starterArt.querySelector('p').innerText = `${silos.Starter.porcentaje}%`;
    starterArt.querySelector('progress').value = silos.Starter.porcentaje;

    // Actualizar Grower (Índice 1)
    const growerArt = articles[1];
    growerArt.querySelector('b.text-orange-500').innerText = `${silos.Grower.porcentaje}%`;
    growerArt.querySelector('p').innerText = `${silos.Grower.porcentaje}%`;
    growerArt.querySelector('progress').value = silos.Grower.porcentaje;

    // Actualizar Layer (Índice 2)
    const layerArt = articles[2];
    layerArt.querySelector('b.text-red-500').innerText = `${silos.Layer.porcentaje}%`;
    layerArt.querySelector('p').innerText = `${silos.Layer.porcentaje}%`;
    layerArt.querySelector('progress').value = silos.Layer.porcentaje;
};

// 3. Abrir/Cerrar Modal
const toggleModal = () => {
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
};

// --- EVENTOS ---

btnOpen.addEventListener('click', toggleModal);
btnClose.addEventListener('click', toggleModal);

// Cerrar al hacer clic fuera del modal
window.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal();
});

// Manejar el envío del formulario
formRegistro.addEventListener('submit', (e) => {
    e.preventDefault();

    const tipoSilo = document.getElementById('siloSelect').value;
    const cantKg = parseFloat(document.getElementById('cantidad').value);

    if (isNaN(cantKg) || cantKg <= 0) {
        alert("⚠️ Por favor ingresa una cantidad válida en kg.");
        return;
    }

    // Lógica: Restar al silo (simulación: 100kg = 1%)
    const reduccionPorcentaje = Math.ceil(cantKg / 10); 
    silos[tipoSilo].porcentaje = Math.max(0, silos[tipoSilo].porcentaje - reduccionPorcentaje);

    // Agregar registro al array
    const nuevoRegistro = {
        fecha: new Date().toISOString().split('T')[0],
        lote: silos[tipoSilo].lote,
        cantidad: cantKg,
        operador: "Admin"
    };

    registros.unshift(nuevoRegistro);

    // Actualizar UI
    actualizarSilosUI();
    renderizarTabla();
    
    // Limpiar y cerrar
    formRegistro.reset();
    toggleModal();
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderizarTabla();
    actualizarSilosUI();
});