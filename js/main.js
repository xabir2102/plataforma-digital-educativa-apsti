/* =========================================
   PLATAFORMA DIGITAL EDUCATIVA APSTI
========================================= */


/* MENÚ PARA CELULAR */

function mostrarMenu() {

    const menu = document.getElementById("menu");

    if (menu) {
        menu.classList.toggle("mostrar");
    }

}


/* AÑO AUTOMÁTICO DEL FOOTER */

const anio = document.getElementById("anio");

if (anio) {

    anio.textContent = new Date().getFullYear();

}


/* FORMULARIO DE CONTACTO */

const formulario = document.getElementById("formularioContacto");

if (formulario) {

    formulario.addEventListener("submit", function(event) {

        event.preventDefault();

        alert(
            "¡Mensaje enviado correctamente! Gracias por comunicarte con la Plataforma APSTI."
        );

        formulario.reset();

    });

}

app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});