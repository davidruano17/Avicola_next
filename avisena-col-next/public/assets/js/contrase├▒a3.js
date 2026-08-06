const form = document.getElementById("resetForm");
    const newPass = document.getElementById("newPass");
    const confirmPass = document.getElementById("confirmPass");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validación: Si están vacías o no coinciden
      if (newPass.value === "" || confirmPass.value === "") {
        Swal.fire({
          title: "Campos incompletos",
          text: "Por favor, completa ambos campos de contraseña",
          icon: "warning",
          confirmButtonColor: "#f59e0b",
          backdrop: "rgba(11, 93, 59, 0.4)"
        });
        return;
      }

      if (newPass.value !== confirmPass.value) {
        // Alerta de ERROR si no coinciden
        Swal.fire({
          title: "¡Error!",
          text: "Las contraseñas no coinciden. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonColor: "#ef4444", // Rojo para el error
          backdrop: "rgba(11, 93, 59, 0.4)"
        });
        return;
      }

      // Alerta de ÉXITO si todo está bien
      Swal.fire({
        title: "¡Actualizado!",
        text: "Tu contraseña ha sido cambiada con éxito",
        icon: "success",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "Ir al Home",
        backdrop: "rgba(11, 93, 59, 0.4)"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    });