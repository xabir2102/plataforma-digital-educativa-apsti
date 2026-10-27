document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const rol = document.getElementById("rol").value;

        const usuario =
            document.getElementById("usuario").value.trim();

        const password =
            document.getElementById("password").value;

        const mensaje =
            document.getElementById("mensaje");


        // LOGIN DEL ADMINISTRADOR

        if (
            rol === "administrador" &&
            usuario === "admin" &&
            password === "12345"
        ) {

            window.location.href =
                "pages/administrador/administrador.html";

            return;
        }


        // LOGIN DEL DOCENTE

        if (
            rol === "docente" &&
            usuario === "docente" &&
            password === "12345"
        ) {

            window.location.href =
                "pages/docente/docente.html";

            return;
        }


        // LOGIN DEL ESTUDIANTE

        if (
            rol === "estudiante" &&
            usuario === "estudiante" &&
            password === "12345"
        ) {

            window.location.href =
                "pages/estudiante/estudiante.html";

            return;
        }


        // DATOS INCORRECTOS

        mensaje.textContent =
            "Usuario, contraseña o rol incorrecto.";

    });