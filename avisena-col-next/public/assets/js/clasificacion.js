document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERENCIAS
    const form = document.getElementById('form-registro');
    const tablaBody = document.getElementById('tabla-body');
    const modalHistorial = document.getElementById('modal-historial');
    const btnAbrirHistorial = document.getElementById('btn-historial-abrir');
    const listaHistorial = document.getElementById('lista-historial');
    const btnBorrar = document.getElementById('btn-borrar');
    const inputCons = document.getElementById('input-cons');
    const areaObservaciones = document.getElementById('observaciones');

    const modalExito = document.getElementById('modal-exito');
    const btnExitoContinuar = document.getElementById('btn-exito-continuar');
    const modalConfirmar = document.getElementById('modal-confirmar-borrar');
    const btnSiBorrar = document.getElementById('btn-si-borrar');
    const btnCancelar = document.getElementById('btn-cancelar');

    const btnPdf = document.getElementById('btn-pdf');
    const btnExcel = document.getElementById('btn-excel');

    // --- LÓGICA DE CONSECUTIVO Y AUTOCOMPLETADO ---
    const actualizarVistaConsecutivo = () => {
        let actual = localStorage.getItem('consecutivo_avisena') || 1;
        if (inputCons) {
            inputCons.removeAttribute('readonly'); 
            inputCons.value = actual.toString().padStart(3, '0');
        }
    };
    actualizarVistaConsecutivo();

    // BUSCADOR AUTOMÁTICO
    if (inputCons) {
        inputCons.addEventListener('input', (e) => {
            const numBuscar = e.target.value.padStart(3, '0');
            const historial = JSON.parse(localStorage.getItem('avisena_db')) || [];
            const encontrado = historial.find(reg => reg.cons === numBuscar);

            if (encontrado) {
                // Llenar Cabecera
                if (document.getElementById('input-mes')) document.getElementById('input-mes').value = encontrado.mes || "";
                if (document.getElementById('input-galpon')) document.getElementById('input-galpon').value = encontrado.galpon || "";
                if (document.getElementById('linea-genetica')) document.getElementById('linea-genetica').value = encontrado.linea || "";
                if (document.getElementById('input-responsable')) document.getElementById('input-responsable').value = encontrado.responsable || "";
                
                // Llenar Observaciones (Tu segunda captura)
                if (areaObservaciones) areaObservaciones.value = encontrado.observaciones || "";

                // Llenar Tabla (Tu primera captura)
                if (encontrado.detallesTabla && tablaBody) {
                    const filas = tablaBody.rows;
                    encontrado.detallesTabla.forEach((datos, i) => {
                        if (filas[i]) {
                            filas[i].cells[1].querySelector('input').value = datos.actual || 0;
                            filas[i].cells[2].querySelector('input').value = datos.anterior || 0;
                            if (filas[i].cells[4]) {
                                filas[i].cells[4].querySelector('input').value = datos.precio || "";
                            }
                        }
                    });
                    // Disparar cálculos para que los totales negros se actualicen
                    tablaBody.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
    }

    // --- FORMATO MONEDA Y CÁLCULOS ---
    const formatearInputMoneda = (input) => {
        let valor = input.value.replace(/\D/g, ""); 
        input.value = valor ? new Intl.NumberFormat('es-CO').format(valor) : "";
    };

    if (tablaBody) {
        tablaBody.addEventListener('input', (e) => {
            if (e.target.classList.contains('table-input') && e.target.closest('td').cellIndex === 4) { 
                formatearInputMoneda(e.target);
            }

            let tActual = 0, tAnterior = 0, tAcumulado = 0, granTotal = 0;

            Array.from(tablaBody.rows).forEach(fila => {
                const actual = parseFloat(fila.cells[1].querySelector('input').value) || 0;
                const anterior = parseFloat(fila.cells[2].querySelector('input').value) || 0;
                const precio = parseFloat(fila.cells[4]?.querySelector('input').value.replace(/\./g, "")) || 0;

                const acumulado = actual + anterior;
                const subtotal = actual * precio;

                fila.cells[3].textContent = acumulado;
                if (fila.cells[5]) fila.cells[5].textContent = `$ ${subtotal.toLocaleString('es-CO')}`;

                tActual += actual; 
                tAnterior += anterior;
                tAcumulado += acumulado; 
                granTotal += subtotal;
            });

            const fots = document.querySelectorAll('.footer-val');
            if (fots.length >= 3) {
                fots[0].textContent = tActual.toLocaleString('es-CO');
                fots[1].textContent = tAnterior.toLocaleString('es-CO');
                fots[2].textContent = tAcumulado.toLocaleString('es-CO');
            }
            const totalFinal = document.querySelector('.grand-total-cell');
            if (totalFinal) totalFinal.textContent = `$ ${granTotal.toLocaleString('es-CO')}`;
        });
    }

    // --- EXPORTACIÓN ---
    if (btnPdf) btnPdf.addEventListener('click', () => { window.print(); });

    if (btnExcel) {
        btnExcel.addEventListener('click', () => {
            let csv = "Tipo de Huevo,Actual,Anterior,Acumulado,Precio,Subtotal\n";
            Array.from(tablaBody.rows).forEach(fila => {
                const tipo = fila.cells[0].textContent;
                const actual = fila.cells[1].querySelector('input').value;
                const anterior = fila.cells[2].querySelector('input').value;
                const acumulado = fila.cells[3].textContent;
                const precio = fila.cells[4]?.querySelector('input').value.replace(/\./g, "") || "0";
                const subtotal = fila.cells[5]?.textContent.replace(/[$. ]/g, "") || "0";
                csv += `${tipo},${actual},${anterior},${acumulado},${precio},${subtotal}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Avisena_Reporte.csv";
            link.click();
        });
    }

    // --- GUARDAR (CAPTURA TODO) ---
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const totalPanales = document.querySelectorAll('.footer-val')[2]?.textContent || "0";

            const registro = {
                cons: inputCons.value.padStart(3, '0'),
                fecha: new Date().toLocaleDateString(),
                mes: document.getElementById('input-mes')?.value || "",
                galpon: document.getElementById('input-galpon')?.value || "",
                linea: document.getElementById('linea-genetica')?.value || "",
                responsable: document.getElementById('input-responsable')?.value || "",
                observaciones: areaObservaciones ? areaObservaciones.value : "",
                totalPanales: totalPanales,
                detallesTabla: Array.from(tablaBody.rows).map(fila => ({
                    actual: fila.cells[1].querySelector('input').value,
                    anterior: fila.cells[2].querySelector('input').value,
                    precio: fila.cells[4]?.querySelector('input').value || ""
                }))
            };

            let historial = JSON.parse(localStorage.getItem('avisena_db')) || [];
            const idx = historial.findIndex(r => r.cons === registro.cons);
            
            if (idx !== -1) {
                historial[idx] = registro;
            } else {
                historial.unshift(registro);
                localStorage.setItem('consecutivo_avisena', parseInt(localStorage.getItem('consecutivo_avisena') || 1) + 1);
            }

            localStorage.setItem('avisena_db', JSON.stringify(historial));
            if (modalExito) modalExito.showModal();
        });
    }

    if (btnExitoContinuar) btnExitoContinuar.onclick = () => location.reload();

    // --- HISTORIAL DISEÑO TARJETAS ---
    if (btnAbrirHistorial) {
        btnAbrirHistorial.addEventListener('click', () => {
            const datos = JSON.parse(localStorage.getItem('avisena_db')) || [];
            listaHistorial.innerHTML = datos.length ? '' : '<p style="text-align:center;">No hay registros.</p>';
            
            datos.forEach((reg, index) => {
                const tarjeta = document.createElement('article');
                tarjeta.style.cssText = `border: 1.8px solid #f0f0f0; border-radius: 35px; padding: 25px; background: #fff; display: flex; flex-direction: column; gap: 12px; margin-bottom:15px;`;
                tarjeta.innerHTML = `
                    <header style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-weight: 900; font-size: 1.3rem; color: #000;">#B-${reg.cons}</strong>
                        <time style="color: #333; font-size: 1.1rem; font-weight: 500;">${reg.fecha}</time>
                    </header>
                    <footer style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                        <mark style="font-weight: 900; font-size: 1.8rem; color: #39FF14; background: none; letter-spacing: -1px;">${reg.totalPanales} Panales</mark>
                        <button onclick="eliminarRegistro(${index})" style="background: none; border: none; cursor: pointer;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </footer>`;
                listaHistorial.appendChild(tarjeta);
            });
            modalHistorial.showModal();
        });
    }

    if (btnBorrar) btnBorrar.addEventListener('click', () => modalConfirmar.showModal());
    if (btnSiBorrar) btnSiBorrar.onclick = () => { form.reset(); location.reload(); };
    if (btnCancelar) btnCancelar.onclick = () => modalConfirmar.close();

    window.eliminarRegistro = (index) => {
        let db = JSON.parse(localStorage.getItem('avisena_db')) || [];
        db.splice(index, 1);
        localStorage.setItem('avisena_db', JSON.stringify(db));
        btnAbrirHistorial.click();
    };
}); js