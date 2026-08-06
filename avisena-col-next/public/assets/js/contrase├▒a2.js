const form = document.getElementById("recoverForm");
    const code = document.getElementById("code");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const value = code.value.trim();
      const regex = /^[0-9]{6}$/;

      // Validación de error con SweetAlert2
      if (!regex.test(value)) {
        Swal.fire({
          title: "¡Código Inválido!",
          text: "Debes ingresar exactamente 6 números.",
          icon: "error",
          confirmButtonColor: "#ef4444", // Rojo para error
          backdrop: "rgba(11, 93, 59, 0.4)"
        });
        return;
      }

      // Alerta de Éxito
      Swal.fire({
        title: "¡Éxito!",
        text: "Código verificado correctamente",
        icon: "success",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "Continuar",
        backdrop: "rgba(11, 93, 59, 0.4)"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "olvidastecontraseña3.html";
        }
      });
    });  