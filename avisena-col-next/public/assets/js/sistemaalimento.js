document.addEventListener('DOMContentLoaded', () => {
    // --- SELECCIÓN DE ELEMENTOS ---
    const modal = document.getElementById('modal');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const dietForm = document.getElementById('dietForm');
    const historyBody = document.getElementById('historyBody');

    // --- 1. GESTIÓN DEL MODAL (<dialog>) ---
    
    // Abrir el modal
    openBtn.addEventListener('click', () => {
        modal.showModal(); // Método nativo para elementos <dialog>
    });

    // Cerrar el modal (botón X)
    closeBtn.addEventListener('click', () => {
        modal.close();
    });

    // Cerrar el modal al hacer clic fuera del contenido (en el backdrop)
    modal.addEventListener('click', (event) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        );
        if (!isInDialog) {
            modal.close();
        }
    });

    // --- 2. REGISTRO DE ALIMENTACIÓN ---

    dietForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Capturar valores de los campos
        const loteRaw = document.getElementById('lote').value;
        const loteId = loteRaw.includes(' ') ? loteRaw.split(' ')[1] : loteRaw;
        const cantidad = document.getElementById('cantidad').value;
        const hora = document.getElementById('hora').value;

        // Validación básica
        if (!cantidad || !hora) {
            alert("Por favor, completa la cantidad y la hora.");
            return;
        }

        // Crear la nueva fila de la tabla
        const nuevaFila = document.createElement('tr');
        nuevaFila.className = "text-sm hover:bg-primary/5 transition-colors bg-green-50/80 animate-pulse";
        
        // Estructura interna de la fila (siguiendo el diseño de la tabla)
        nuevaFila.innerHTML = `
            <td class="px-6 py-4 font-medium italic">Hoy, ${formatearHora(hora)}</td>
            <td class="px-6 py-4">
                <mark class="bg-primary/10 text-primary font-black px-2 py-0.5 rounded">${loteId}</mark>
            </td>
            <td class="px-6 py-4 text-right font-black">${cantidad} kg</td>
            <td class="px-6 py-4 flex items-center gap-2">
                <span class="size-5 bg-primary text-[#111b0e] flex items-center justify-center rounded-full text-[8px] font-bold">AD</span>
                Admin
            </td>
        `;

        // Insertar al principio del historial
        historyBody.prepend(nuevaFila);

        // --- 3. FEEDBACK Y LIMPIEZA ---

        // Cerrar modal y limpiar formulario
        modal.close();
        dietForm.reset();

        // Quitar la animación de resaltado después de 3 segundos
        setTimeout(() => {
            nuevaFila.classList.remove('bg-green-50/80', 'animate-pulse');
        }, 3000);
    });

    // --- FUNCIONES DE APOYO ---

    // Convierte formato 24h a 12h (Ej: 14:00 -> 02:00 PM) para que coincida con tu diseño
    function formatearHora(hora24) {
        const [horas, minutos] = hora24.split(':');
        let h = parseInt(horas);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${minutos} ${ampm}`;
    }
});