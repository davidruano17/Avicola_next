document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorBox = document.getElementById("errorBox");

    // 1. Definición de usuarios y sus dashboards
    const usuarios = [
        { correo: "admin", clave: "12345", url: "menucolapsable.html" },
        { correo: "aprendiz", clave: "1234", url: "aprendiz.html" },
        { correo: "investigador", clave: "1234", url: "investigador.html" }
    ];

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Limpieza de espacios para evitar errores de escritura
            const inputUser = email.value.trim();
            const inputPass = password.value.trim();

            const usuarioEncontrado = usuarios.find(u => u.correo === inputUser && u.clave === inputPass);

            if (usuarioEncontrado) {
                if (errorBox) errorBox.classList.add("hidden");
                
                // Guardamos en localStorage para usarlo en los Dashboards
                localStorage.setItem('userRole', usuarioEncontrado.correo);
                
                // Redirección
                window.location.href = usuarioEncontrado.url;
            } else {
                if (errorBox) errorBox.classList.remove("hidden");
                // Opcional: limpiar el campo de contraseña si falla
                password.value = "";
            }
        });
    }
});

// --- Función para mostrar/ocultar contraseña ---
function togglePassword() {
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
    }
}

// --- Lógica de Google (Asegúrate de tener la librería cargada en el HTML) ---
const btnGoogle = document.getElementById('btnGoogle');
if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
        // Validación preventiva: solo funcionará si pones un Client ID real
        if (typeof google !== 'undefined') {
            const client = google.accounts.oauth2.initCodeClient({
                client_id: 'TU_CLIENT_ID_REAL.apps.googleusercontent.com',
                scope: 'email profile',
                ux_mode: 'popup',
                callback: (response) => {
                    // Por defecto, mandamos al aprendiz o un visor genérico
                    window.location.href = "aprendiz.html"; 
                },
            });
            client.requestCode();
        } else {
            console.error("Librería de Google no cargada");
        }
    });
}