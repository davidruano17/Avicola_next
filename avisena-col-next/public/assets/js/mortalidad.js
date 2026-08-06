const form = document.getElementById("mortalityForm");
    const tabla = document.getElementById("tablaHistorial");
    const buscar = document.getElementById("buscar");
    const success = document.getElementById("success");

    let registros = JSON.parse(localStorage.getItem("registrosMortalidad")) || [];

    function guardarLocalStorage() {
        localStorage.setItem("registrosMortalidad", JSON.stringify(registros));
    }

    function mostrarMensaje() {
        success.style.display = "block";
        setTimeout(() => {
            success.style.display = "none";
      }, 2500);
    }

    function renderTabla(lista = registros) {
      tabla.innerHTML = "";

      lista.forEach((registro, index) => {
        const fila = `
          <tr>
            <td>${registro.fecha}</td>
            <td>${registro.cantidad}</td>
            <td>${registro.causa}</td>
            <td>
                <button class="pdf-btn" onclick="generarPDF(${index})">PDF</button>
            </td>
          </tr>
        `;

        tabla.innerHTML += fila;
        });

        actualizarEstadisticas();
    }

    function actualizarEstadisticas() {
        const total = registros.reduce((acc, item) => acc + Number(item.cantidad), 0);

        document.getElementById("totalMortalidad").textContent = total;
        document.getElementById("actasGeneradas").textContent = registros.length;

        const contador = {};
        registros.forEach(r => {
            contador[r.causa] = (contador[r.causa] || 0) + 1;
        });

        let principal = "-";
        let mayor = 0;

        for (let causa in contador) {
            if (contador[causa] > mayor) {
                mayor = contador[causa];
                principal = causa;
            }
        }

        document.getElementById("causaPrincipal").textContent = principal;

        const totalAvesBase = 1000;
        const tasa = ((total / totalAvesBase) * 100).toFixed(1);
        document.getElementById("tasaMortalidad").textContent = `${tasa}%`;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nuevoRegistro = {
            fecha: new Date().toLocaleString(),
            cantidad: document.getElementById("cantidad").value,
            causa: document.getElementById("causa").value,
            necropsia: document.getElementById("necropsia").value
        };

        registros.unshift(nuevoRegistro);
        guardarLocalStorage();
        renderTabla();
        mostrarMensaje();
        form.reset();
    });

    function generarPDF(index) {
        const registro = registros[index];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Reporte de Mortalidad Avícola", 20, 20);

        doc.setFontSize(12);
        doc.text(`Fecha: ${registro.fecha}`, 20, 40);
        doc.text(`Cantidad: ${registro.cantidad}`, 20, 50);
        doc.text(`Causa: ${registro.causa}`, 20, 60);
        doc.text(`Necropsia: ${registro.necropsia}`, 20, 70);

        doc.save(`reporte_${index + 1}.pdf`);
    }

    buscar.addEventListener("input", function () {
        const texto = buscar.value.toLowerCase();

        const filtrados = registros.filter(r =>
            r.causa.toLowerCase().includes(texto) ||
            r.fecha.toLowerCase().includes(texto)
        );

        renderTabla(filtrados);
    });

    renderTabla();