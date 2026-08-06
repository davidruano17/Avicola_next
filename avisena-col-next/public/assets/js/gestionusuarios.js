document.addEventListener("DOMContentLoaded", () => {
  /* ===== capturar elmentos ===== */
  window.modalUsuario = document.getElementById("modalUsuario");

  window.nombre = document.getElementById("nombre");
  window.email = document.getElementById("email");
  window.telefono = document.getElementById("telefono");
  window.documento = document.getElementById("documento");
  window.residencia = document.getElementById("residencia");
  window.fecha = document.getElementById("fecha");
  window.rol = document.getElementById("rol");

  window.tablaUsuarios = document.querySelector("tbody");

  cargarUsuarios();
});

/* ===== modal ===== */
function abrirModal() {
  modalUsuario.classList.remove("hidden");
  modalUsuario.classList.add("flex");
}

function cerrarModal() {
  modalUsuario.classList.add("hidden");
  modalUsuario.classList.remove("flex");
}

/* ===== localstorage ===== */
function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(data) {
  localStorage.setItem("usuarios", JSON.stringify(data));
}

/* ===== guardar usuarios ===== */
function guardarUsuario() {
  let usuario = {
    id: Date.now(),
    nombre: nombre.value.trim(),
    email: email.value.trim(),
    telefono: telefono.value.trim(),
    documento: documento.value.trim(),
    residencia: residencia.value.trim(),
    fecha: fecha.value,
    rol: rol.value,
    estado: "ACTIVO"
  };

  if (!usuario.nombre || !usuario.email || !usuario.rol) {
    alert("Complete los campos obligatorios");
    return;
  }

  let usuarios = obtenerUsuarios();
  usuarios.push(usuario);
  guardarUsuarios(usuarios);

  cerrarModal();
  limpiarFormulario();
  cargarUsuarios();
}

/* ===== limpiar formulario ===== */
function limpiarFormulario() {
  nombre.value = "";
  email.value = "";
  telefono.value = "";
  documento.value = "";
  residencia.value = "";
  fecha.value = "";
  rol.value = "";
}

/* ===== cargar tabla ===== */
function cargarUsuarios(lista = null) {

  let usuarios = lista || obtenerUsuarios();

  tablaUsuarios.innerHTML = "";

  usuarios.forEach(u => {
    tablaUsuarios.innerHTML += `
      <tr class="${u.estado === 'INACTIVO' ? 'opacity-50' : ''} hover:bg-slate-50 dark:hover:bg-slate-800/30">

        <td class="px-6 py-5 font-semibold">${u.nombre}</td>
        <td class="px-6 py-5">${u.email}</td>
        <td class="px-6 py-5">${u.telefono}</td>
        <td class="px-6 py-5">${u.documento}</td>
        <td class="px-6 py-5 font-bold">${u.rol}</td>
        <td class="px-6 py-5">${u.residencia}</td>
        <td class="px-6 py-5">${u.fecha || ''}</td>

        <td class="px-6 py-5 text-right">
          <section class="flex justify-end gap-2">

            <button
              onclick="habilitarUsuario(${u.id})"
              class="p-2 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white"
              title="Habilitar">
              <span class="material-symbols-outlined text-lg">check_circle</span>
            </button>

            <button
              onclick="deshabilitarUsuario(${u.id})"
              class="p-2 rounded-lg bg-warning/10 text-warning hover:bg-warning hover:text-white"
              title="Inhabilitar">
              <span class="material-symbols-outlined text-lg">block</span>
            </button>

            <button
              onclick="eliminarUsuario(${u.id})"
              class="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white"
              title="Eliminar">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>

          </section>
        </td>
      </tr>
    `;
  });

  actualizarContadores();
}


/* ===== eliminar ===== */
function eliminarUsuario(id) {
  let usuarios = obtenerUsuarios().filter(u => u.id !== id);
  guardarUsuarios(usuarios);
  cargarUsuarios();
}

/* ===== habilitar/inhabilitar ===== */
function habilitarUsuario(id) {
  let usuarios = obtenerUsuarios().map(u =>
    u.id === id ? { ...u, estado: "ACTIVO" } : u
  );
  guardarUsuarios(usuarios);
  cargarUsuarios();
}

function deshabilitarUsuario(id) {
  let usuarios = obtenerUsuarios().map(u =>
    u.id === id ? { ...u, estado: "INACTIVO" } : u
  );
  guardarUsuarios(usuarios);
  cargarUsuarios();
}

/* ===== contadores ===== */
function actualizarContadores() {
  let usuarios = obtenerUsuarios();

  let total = usuarios.length;
  let activos = usuarios.filter(u => u.estado === "ACTIVO").length;
  let inactivos = usuarios.filter(u => u.estado === "INACTIVO").length;

  document.getElementById("totalUsuarios").textContent = total;
  document.getElementById("usuariosActivos").textContent = activos;
  document.getElementById("usuariosInactivos").textContent = inactivos;
}

    
function aplicarFiltros() {
  const rolSeleccionado = filtroRol.value;
  const documentoBuscado = filtroDocumento.value.trim();

  const usuarios = obtenerUsuarios();

  const filtrados = usuarios.filter(u => {
    const porRol = rolSeleccionado === "" || u.rol === rolSeleccionado;
    const porDoc =
      documentoBuscado === "" || u.documento.includes(documentoBuscado);

    return porRol && porDoc;
  });

  cargarUsuarios(filtrados);
}