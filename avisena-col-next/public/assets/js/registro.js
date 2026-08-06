document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const passField = document.getElementById('pass-field');
    const reqList = document.querySelectorAll('#req-list li');

    // 1. EL OJO (Mostrar/Ocultar)
    const eye = document.createElement('button');
    eye.type = 'button';
    eye.innerHTML = '👁';
    // Posicionamiento preciso sobre el input azul
    eye.className = 'absolute right-4 top-[48px] -translate-y-1/2 text-gray-400 text-xl hover:text-green-600 transition-all';
    passField.appendChild(eye);

    eye.addEventListener('click', () => {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        eye.style.color = isPass ? '#22c55e' : '#9ca3af';
    });

    // 2. VALIDACIÓN VISUAL (Cambia a verde como en tu imagen)
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;

        const rules = [
            val.length >= 10,
            /[A-Z]/.test(val),
            (val.match(/\d/g) || []).length >= 5,
            /[!@#$%^&*(),.?":{}|<>]/.test(val)
        ];

        rules.forEach((isValid, index) => {
            if (isValid) {
                reqList[index].classList.remove('text-gray-400');
                reqList[index].classList.add('text-[#16a34a]'); // Verde de la imagen
            } else {
                reqList[index].classList.remove('text-[#16a34a]');
                reqList[index].classList.add('text-gray-400');
            }
        });
    });
}); document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', (e) => {
        // Evita que la página se recargue
        e.preventDefault();

        // Captura el nombre para personalizar el mensaje
        const nombre = document.getElementById('nombre').value;

        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Registro Exitoso!',
            text: `Bienvenido(a) ${nombre}, tu cuenta ha sido creada correctamente.`,
            icon: 'success',
            confirmButtonText: 'Acceder', // <--- Aquí cambiamos el texto
            confirmButtonColor: '#22c55e', // Color verde de tu diseño
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirigir a la página de inicio de sesión
                window.location.href = "inicio de secion.html";
            }
        });
    });
}); document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', (e) => {
        // Detenemos el envío automático para mostrar la alerta
        e.preventDefault();

        // Obtenemos el nombre para personalizar el saludo
        const nombreUsuario = document.getElementById('nombre').value;

        // Lanzamos la alerta de éxito
        Swal.fire({
            title: '¡Registro Exitoso!',
            text: `¡Bienvenido(a) ${nombreUsuario}! Tu cuenta en AVISENA COL ha sido creada.`,
            icon: 'success',
            confirmButtonText: 'Acceder', // El texto que pediste
            confirmButtonColor: '#22c55e', // El verde de tu tema
            allowOutsideClick: false, // Obliga a dar clic en el botón
            backdrop: `rgba(11, 93, 59, 0.2)` // Fondo verde sutil
        }).then((result) => {
            if (result.isConfirmed) {
                // REDIRECCIÓN AL HOME
                // Si tu archivo principal tiene otro nombre, cámbialo aquí (ej. "home.html")
                window.location.href = "";
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', (e) => {
        // Detenemos el envío automático para mostrar la alerta
        e.preventDefault();

        // Obtenemos el nombre para personalizar el saludo
        const nombreUsuario = document.getElementById('nombre').value;

        // Lanzamos la alerta de éxito
        Swal.fire({
            title: '¡Registro Exitoso!',
            text: `¡Bienvenido(a) ${nombreUsuario}! Tu cuenta en AVISENA COL ha sido creada.`,
            icon: 'success',
            confirmButtonText: 'Acceder', // El texto que pediste
            confirmButtonColor: '#22c55e', // El verde de tu tema
            allowOutsideClick: false, // Obliga a dar clic en el botón
            backdrop: `rgba(11, 93, 59, 0.2)` // Fondo verde sutil
        }).then((result) => {
            if (result.isConfirmed) {
                // REDIRECCIÓN AL HOME
                // Si tu archivo principal tiene otro nombre, cámbialo aquí (ej. "home.html")
                window.location.href = "index.html"; 
            }
        });
    });
});