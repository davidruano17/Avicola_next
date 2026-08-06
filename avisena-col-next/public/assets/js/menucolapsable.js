// Configuración de Tailwind (vía Script)
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: { primary: "#5be830", "background-light": "#f6f8f6" },
            fontFamily: { display: ["Inter", "sans-serif"] }
        }
    }
}

/**
 * Maneja la navegación y carga de archivos HTML
 */
async function navigateTo(fileUrl) {
    const container = document.getElementById('main-view');
    const titleElement = document.getElementById('page-title');

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("No se pudo encontrar el archivo " + fileUrl);

        const html = await response.text();
        container.innerHTML = html;

        // Ejecutar scripts internos del HTML cargado
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });

        // Actualizar título de la página
        const cleanTitle = fileUrl.replace('.html', '').replace('_', ' ').toUpperCase();
        titleElement.innerText = cleanTitle;

        // Re-inicializar iconos de Lucide
        lucide.createIcons();

        if (typeof updateUserInfo === 'function') updateUserInfo();

    } catch (error) {
        console.error("Error al navegar:", error);
    }
}

// --- Lógica del Sidebar ---
const sidebar = document.getElementById('sidebar');
const toggleIcon = document.getElementById('toggleIcon');
const toggleBtn = document.getElementById('toggleSidebar');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('is-collapsed');
        toggleIcon.setAttribute('data-lucide', isCollapsed ? 'lock-keyhole-open' : 'lock');
        lucide.createIcons();
    });
}

/**
 * Maneja la apertura de submenús
 */
function toggleDropdown(menuId, iconId) {
    const menu = document.getElementById(menuId);
    const icon = document.getElementById(iconId);

    if (menu) menu.classList.toggle('active');
    if (icon) icon.classList.toggle('rotate-180');
}

// --- Carga Inicial ---
window.onload = () => {
    navigateTo('prodfunfinal.html');
    lucide.createIcons();
    updateUserInfo();
};

function updateUserInfo() {
    const userData = {
        "admin": { nombre: "Instructor Líder", rol: "Administrador de Granja", email: "admin@avisena.edu.co" },
        "aprendiz": { nombre: "Aprendiz", rol: "Estudiante", email: "aprendiz@avisena.edu.co" },
        "investigador": { nombre: "Investigador", rol: "Especialista", email: "investigador@avisena.edu.co" }
    };

    const currentUser = localStorage.getItem('userRole') || 'admin';
    const info = userData[currentUser] || userData['admin'];

    document.querySelectorAll('.user-name-display').forEach(el => {
        if (el.tagName === 'INPUT') el.value = info.nombre;
        else el.textContent = info.nombre;
    });
    document.querySelectorAll('.user-role-display').forEach(el => {
        if (el.tagName === 'INPUT') el.value = info.rol;
        else el.textContent = info.rol;
    });
    document.querySelectorAll('.user-email-display').forEach(el => {
        if (el.tagName === 'INPUT') el.value = info.email;
        else el.textContent = info.email;
    });

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(info.nombre)}&background=5be830&color=fff`;
    document.querySelectorAll('.user-avatar-img').forEach(el => {
        if (el.tagName === 'IMG') el.src = avatarUrl;
        else el.style.backgroundImage = `url("${avatarUrl}")`;
    });
}

// --- Cerrar dropdown al hacer click afuera ---
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    const btn = document.getElementById('avatar-btn');
    if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});