document.addEventListener("DOMContentLoaded", () => {

            const links = document.querySelectorAll("aside nav a");

            links.forEach(link => {
                link.addEventListener("click", () => {
                    links.forEach(l => l.classList.remove("active-nav"));
                    link.classList.add("active-nav");
                });
            });

            const btnCerrar = document.getElementById("btnCerrar");

            if (btnCerrar) {
                btnCerrar.addEventListener("click", () => {
                    const confirmacion = confirm("¿Seguro que deseas cerrar sesión?");
                    if (confirmacion) {
                        alert("Sesión cerrada correctamente.");
                        window.location.href = "login.html";
                    }
                });
            }

            const btnNotificaciones = document.getElementById("btnNotificaciones");
            const btnAyuda = document.getElementById("btnAyuda");

            if (btnNotificaciones) {
                btnNotificaciones.addEventListener("click", () => {
                    alert("No tienes nuevas notificaciones.");
                });
            }

            if (btnAyuda) {
                btnAyuda.addEventListener("click", () => {
                    alert("Soporte: soporte@granjadigital.com");
                });
            }

            const buscador = document.getElementById("buscador");

            if (buscador) {
                buscador.addEventListener("keyup", (e) => {
                    if (e.key === "Enter") {
                        if (buscador.value.trim() === "") {
                            alert("Escribe algo para buscar.");
                        } else {
                            alert("Buscando: " + buscador.value);
                        }
                    }
                });
            }

        });