document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#notification-table tbody');
    const rows = document.querySelectorAll('.notification-row');
    const filterButtons = document.querySelectorAll('.tab-btn');
    const markAllBtn = document.getElementById('mark-all-read');

    // 1. Lógica de Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            rows.forEach(row => {
                const isUnread = row.classList.contains('unread');
                const type = row.getAttribute('data-type');

                if (filter === 'all') {
                    row.style.display = 'table-row';
                } else if (filter === 'unread') {
                    row.style.display = isUnread ? 'table-row' : 'none';
                } else if (filter === 'critical') {
                    row.style.display = (type === 'critical') ? 'table-row' : 'none';
                }
            });
        });
    });

    // 2. Marcar una individual como leída
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-action')) {
            const row = e.target.closest('tr');
            markAsRead(row);
        }
    });

    function markAsRead(row) {
        row.classList.remove('unread');
        row.classList.add('read');
        const button = row.querySelector('.btn-action');
        if (button) {
            button.textContent = 'Detalles';
            button.className = 'btn-text';
        }
    }

    // 3. Marcar todas como leídas
    markAllBtn.addEventListener('click', () => {
        rows.forEach(row => markAsRead(row));
    });

    // 4. Botón de refrescar
    document.getElementById('refresh-btn').addEventListener('click', () => {
        location.reload();
    });
});