const form = document.getElementById("recoverForm");
  const email = document.getElementById("email");
  const errorMsg = document.getElementById("errorMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    errorMsg.classList.add("hidden");

    const value = email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "" || !emailRegex.test(value)) {
      errorMsg.classList.remove("hidden");
      return;
    }

    Swal.fire({
      title: "Código correctamente enviado",
      text: "Revisa tu correo electrónico para continuar.",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#22c55e",
      allowOutsideClick: false,
      backdrop: "rgba(11, 93, 59, 0.2)"
    }).then(() => {
      email.value = "";
      window.location.href = "olvidastecontraseña2.html";
    });
  });
