const forms = {
    lotes: `
        <article class="form-card">
            <h2 class="text-2xl font-bold mb-6 text-emerald-800"> Registro de Nuevo Lote</h2>
            <form class="grid-form">
                <label class="input-label"><span>Código de Lote</span><input type="text" placeholder="Ej: L-2024-001" class="input-box"></label>
                <label class="input-label"><span>Galpón Destino</span><select class="input-box"><option>Galpón A</option><option>Galpón B</option></select></label>
                <label class="input-label"><span>Cantidad Inicial</span><input type="number" class="input-box"></label>
                <label class="input-label"><span>Fecha de Ingreso</span><input type="date" class="input-box"></label>
                <button type="button" class="btn-save full-width">Confirmar Ingreso de Lote</button>
            </form>
        </article>`,

    mortalidad: `
        <article class="form-card">
            <h2 class="text-2xl font-bold mb-6 text-red-700"> Reporte Diario de Mortalidad</h2>
            <form class="grid-form">
                <label class="input-label"><span>Lote</span><select class="input-box"><option>Seleccionar...</option></select></label>
                <label class="input-label"><span>Número de Bajas</span><input type="number" class="input-box" placeholder="0"></label>
                <label class="input-label full-width"><span>Observaciones Técnicas</span><textarea class="input-box" rows="3" placeholder="Detalle hallazgos necropsia..."></textarea></label>
                <button type="button" class="btn-save full-width" style="background: #991b1b;">Registrar Bajas</button>
            </form>
        </article>`,

    morbilidad: `
        <article class="form-card">
            <h2 class="text-2xl font-bold mb-6 text-amber-700"> Registro de Morbilidad</h2>
            <form class="grid-form">
                <label class="input-label"><span>Lote Afectado</span><input type="text" class="input-box"></label>
                <label class="input-label"><span>Aves con Síntomas</span><input type="number" class="input-box"></label>
                <label class="input-label full-width"><span>Síntomas Principales</span><input type="text" placeholder="Ej: Respiratorios, digestivos..." class="input-box"></label>
                <label class="input-label full-width"><span>Tratamiento / Vacuna aplicada</span><input type="text" class="input-box"></label>
                <button type="button" class="btn-save full-width" style="background: #b45309;">Guardar Registro Médico</button>
            </form>
        </article>`,

    huevos: `
        <article class="form-card">
            <h2 class="text-2xl font-bold mb-6 text-blue-800">Clasificación de Producción</h2>
            <form class="grid-form">
                <label class="input-label"><span>Huevos Jumbo (G)</span><input type="number" class="input-box"></label>
                <label class="input-label"><span>Huevos Tipo A</span><input type="number" class="input-box"></label>
                <label class="input-label"><span>Huevos Tipo B</span><input type="number" class="input-box"></label>
                <label class="input-label"><span>Rotos / Sucios</span><input type="number" class="input-box"></label>
                <button type="button" class="btn-save full-width" style="background: #1e40af;">Cargar Clasificación</button>
            </form>
        </article>`,

    produccion: `
        <article class="form-card">
            <h2 class="text-2xl font-bold mb-6 text-emerald-800"> Producción Diaria de Alimento y Agua</h2>
            <form class="grid-form">
                <label class="input-label"><span>Consumo Alimento (Kg)</span><input type="number" step="0.01" class="input-box"></label>
                <label class="input-label"><span>Consumo Agua (Lts)</span><input type="number" step="0.01" class="input-box"></label>
                <label class="input-label"><span>Peso Promedio Ave (g)</span><input type="number" class="input-box"></label>
                <label class="input-label"><span>Humedad Relativa (%)</span><input type="number" class="input-box"></label>
                <button type="button" class="btn-save full-width">Guardar Indicadores del Día</button>
            </form>
        </article>`
};

function renderForm(type) {
    const display = document.getElementById('form-display');
    const buttons = document.querySelectorAll('.menu-btn');

    // Actualizar estado visual de los botones
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Inyectar el HTML correspondiente
    display.innerHTML = forms[type];
}

// Inicializar con el primer formulario
window.onload = () => {
    document.querySelector('.menu-btn').click();
};