// Configuración de Tailwind (vía script tag en HTML)
document.addEventListener('DOMContentLoaded', () => {
    // Manejo del formulario
    const treatmentForm = document.getElementById('treatment-form');
    const toast = document.getElementById('toast-success');

    if (treatmentForm) {
        treatmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulación de guardado
            showNotification();
        });
    }

    function showNotification() {
        if (toast) {
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }

    // Lógica para filtros de tabla
    const searchInput = document.querySelector('input[placeholder="Filtrar..."]');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const value = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.table-row');
            
            rows.forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(value) ? '' : 'none';
            });
        });
    }
});
