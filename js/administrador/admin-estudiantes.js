// ======================================================
// GESTIÓN DE ESTUDIANTES - APSTI
// CONECTADO CON NODE.JS + MYSQL
// ======================================================


// ======================================================
// 1. CONFIGURACIÓN DE LA API
// ======================================================

const API_ESTUDIANTES =
    "http://localhost:3000/api/estudiantes";


// ======================================================
// 2. ELEMENTOS DEL FORMULARIO
// ======================================================

const formulario =
    document.getElementById("formEstudiante");

const codigo =
    document.getElementById("codigo");

const dni =
    document.getElementById("dni");

const nombres =
    document.getElementById("nombres");

const apellidos =
    document.getElementById("apellidos");

const correo =
    document.getElementById("correo");

const telefono =
    document.getElementById("telefono");

const semestre =
    document.getElementById("semestre");

const estado =
    document.getElementById("estado");


// CREDENCIALES

const usuario =
    document.getElementById("usuario");

const contrasena =
    document.getElementById("contrasena");

const rol =
    document.getElementById("rol");


// TABLA

const tablaEstudiantes =
    document.getElementById("tablaEstudiantes");


// BUSCADOR

const buscarEstudiante =
    document.getElementById("buscarEstudiante");


// BOTÓN GUARDAR

const btnGuardar =
    document.querySelector(".btn-guardar");


// ======================================================
// 3. DATOS CARGADOS DESDE MYSQL
// ======================================================

let estudiantes = [];


// Ahora guardamos el ID real de MySQL,
// no la posición del arreglo.

let idEditando = null;


// ======================================================
// 4. VALIDACIONES DE ENTRADA
// ======================================================

// SOLO NÚMEROS EN DNI

dni.addEventListener("input", function () {

    this.value =
        this.value.replace(/[^0-9]/g, "");

});


// SOLO NÚMEROS EN TELÉFONO

telefono.addEventListener("input", function () {

    this.value =
        this.value.replace(/[^0-9]/g, "");

});


// SOLO LETRAS EN NOMBRES

nombres.addEventListener("input", function () {

    this.value =
        this.value.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
            ""
        );

});


// SOLO LETRAS EN APELLIDOS

apellidos.addEventListener("input", function () {

    this.value =
        this.value.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
            ""
        );

});


// ======================================================
// 5. FUNCIÓN PARA QUITAR TILDES
// ======================================================

function limpiarTexto(texto) {

    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/Ñ/g, "N")
        .toLowerCase();

}


// ======================================================
// 6. OBTENER PRIMER NOMBRE
// ======================================================

function obtenerPrimerNombre() {

    const partes =
        nombres.value
            .trim()
            .split(/\s+/);

    return limpiarTexto(
        partes[0] || ""
    );

}


// ======================================================
// 7. OBTENER PRIMER APELLIDO
// ======================================================

function obtenerPrimerApellido() {

    const partes =
        apellidos.value
            .trim()
            .split(/\s+/);

    return limpiarTexto(
        partes[0] || ""
    );

}


// ======================================================
// 8. GENERAR CORREO INSTITUCIONAL
// ======================================================

function generarCorreo() {

    const primerNombre =
        obtenerPrimerNombre();

    const primerApellido =
        obtenerPrimerApellido();


    if (!primerNombre || !primerApellido) {
        return "";
    }


    let correoGenerado =
        primerNombre +
        "." +
        primerApellido +
        "@apsti.edu.pe";


    let contador = 2;


    while (

        estudiantes.some(function (estudiante) {

            return (
                estudiante.correo === correoGenerado
                &&
                estudiante.id_estudiante !== idEditando
            );

        })

    ) {

        correoGenerado =
            primerNombre +
            "." +
            primerApellido +
            contador +
            "@apsti.edu.pe";

        contador++;

    }


    return correoGenerado;

}


// ======================================================
// 9. GENERAR CONTRASEÑA TEMPORAL
// ======================================================

function generarContrasena() {

    const mayusculas =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";

    const minusculas =
        "abcdefghijkmnopqrstuvwxyz";

    const numeros =
        "23456789";

    const simbolos =
        "#@$";


    let password = "Apsti";


    password +=
        simbolos[
            Math.floor(
                Math.random() *
                simbolos.length
            )
        ];


    for (let i = 0; i < 4; i++) {

        password +=
            numeros[
                Math.floor(
                    Math.random() *
                    numeros.length
                )
            ];

    }


    password +=
        mayusculas[
            Math.floor(
                Math.random() *
                mayusculas.length
            )
        ];


    password +=
        minusculas[
            Math.floor(
                Math.random() *
                minusculas.length
            )
        ];


    return password;

}


// ======================================================
// 10. ACTUALIZAR CREDENCIALES
// ======================================================

function actualizarCredenciales() {

    if (
        nombres.value.trim() !== ""
        &&
        apellidos.value.trim() !== ""
    ) {

        const correoGenerado =
            generarCorreo();

        correo.value =
            correoGenerado;

        usuario.value =
            correoGenerado;

    } else {

        correo.value = "";
        usuario.value = "";

    }

}


nombres.addEventListener(
    "input",
    actualizarCredenciales
);


apellidos.addEventListener(
    "input",
    actualizarCredenciales
);


// ======================================================
// 11. CARGAR ESTUDIANTES DESDE MYSQL
// ======================================================

async function cargarEstudiantes() {

    try {

        const respuesta =
            await fetch(API_ESTUDIANTES);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los estudiantes."
            );

        }


        estudiantes =
            await respuesta.json();


        mostrarEstudiantes();

    } catch (error) {

        console.error(error);


        tablaEstudiantes.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >

                    No se pudo conectar con el servidor.

                </td>

            </tr>

        `;

    }

}


// ======================================================
// 12. REGISTRAR / ACTUALIZAR
// ======================================================

formulario.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        // ----------------------------------------------
        // VALIDAR DNI
        // ----------------------------------------------

        if (dni.value.length !== 8) {

            alert(
                "El DNI debe contener exactamente 8 dígitos."
            );

            dni.focus();

            return;

        }


        // ----------------------------------------------
        // VALIDAR TELÉFONO
        // ----------------------------------------------

        if (telefono.value.length !== 9) {

            alert(
                "El teléfono debe contener exactamente 9 dígitos."
            );

            telefono.focus();

            return;

        }


        // ==================================================
        // REGISTRAR
        // ==================================================

        if (idEditando === null) {

            const contrasenaGenerada =
                generarContrasena();


            contrasena.value =
                contrasenaGenerada;


            const nuevoEstudiante = {

                codigo:
                    codigo.value.trim(),

                dni:
                    dni.value.trim(),

                nombres:
                    nombres.value.trim(),

                apellidos:
                    apellidos.value.trim(),

                correo:
                    correo.value.trim(),

                usuario:
                    usuario.value.trim(),

                contrasena:
                    contrasenaGenerada,

                telefono:
                    telefono.value.trim(),

                semestre:
                    semestre.value,

                estado:
                    estado.value

            };


            try {

                btnGuardar.disabled = true;

                btnGuardar.innerHTML =
                    "⏳ Registrando...";


                const respuesta =
                    await fetch(
                        API_ESTUDIANTES,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    nuevoEstudiante
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo registrar."
                    );

                }


                alert(

                    "ESTUDIANTE REGISTRADO CORRECTAMENTE\n\n" +

                    "Correo / Usuario:\n" +
                    nuevoEstudiante.usuario +

                    "\n\nContraseña temporal:\n" +
                    contrasenaGenerada +

                    "\n\nRol: Estudiante"

                );


                limpiarFormulario();

                await cargarEstudiantes();

            } catch (error) {

                console.error(error);

                alert(error.message);

            } finally {

                btnGuardar.disabled = false;

                btnGuardar.innerHTML =
                    "💾 Registrar estudiante";

            }

        }


        // ==================================================
        // ACTUALIZAR
        // ==================================================

        else {

            const estudianteActualizado = {

                codigo:
                    codigo.value.trim(),

                dni:
                    dni.value.trim(),

                nombres:
                    nombres.value.trim(),

                apellidos:
                    apellidos.value.trim(),

                correo:
                    correo.value.trim(),

                usuario:
                    usuario.value.trim(),

                telefono:
                    telefono.value.trim(),

                semestre:
                    semestre.value,

                estado:
                    estado.value

            };


            try {

                btnGuardar.disabled = true;

                btnGuardar.innerHTML =
                    "⏳ Guardando...";


                const respuesta =
                    await fetch(
                        `${API_ESTUDIANTES}/${idEditando}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    estudianteActualizado
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo actualizar."
                    );

                }


                alert(
                    "Información del estudiante actualizada correctamente."
                );


                limpiarFormulario();

                await cargarEstudiantes();

            } catch (error) {

                console.error(error);

                alert(error.message);

            } finally {

                btnGuardar.disabled = false;

                btnGuardar.innerHTML =
                    idEditando === null
                        ? "💾 Registrar estudiante"
                        : "💾 Guardar cambios";

            }

        }

    }
);


// ======================================================
// 13. MOSTRAR ESTUDIANTES
// ======================================================

function mostrarEstudiantes(
    lista = estudiantes
) {

    tablaEstudiantes.innerHTML = "";


    if (lista.length === 0) {

        tablaEstudiantes.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >

                    No hay estudiantes registrados actualmente.

                </td>

            </tr>

        `;

        return;

    }


    lista.forEach(function (estudiante) {

        let claseEstado =
            "estado-inactivo";


        if (estudiante.estado === "Activo") {

            claseEstado =
                "estado-activo";

        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${estudiante.codigo}
            </td>

            <td>
                ${estudiante.nombres}
                ${estudiante.apellidos}
            </td>

            <td>
                ${estudiante.dni}
            </td>

            <td>
                ${estudiante.usuario}
            </td>

            <td>
                ${estudiante.semestre}
            </td>

            <td>

                <span class="${claseEstado}">
                    ${estudiante.estado}
                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarEstudiante(${estudiante.id_estudiante})"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="btn-restablecer"
                    onclick="restablecerContrasena(${estudiante.id_estudiante})"
                >
                    🔑 Restablecer
                </button>


                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarEstudiante(${estudiante.id_estudiante})"
                >
                    🗑️ Eliminar
                </button>

            </td>

        `;


        tablaEstudiantes.appendChild(
            fila
        );

    });

}


// ======================================================
// 14. EDITAR ESTUDIANTE
// ======================================================

function editarEstudiante(id) {

    const estudiante =
        estudiantes.find(
            estudiante =>
                estudiante.id_estudiante === id
        );


    if (!estudiante) {
        return;
    }


    idEditando =
        estudiante.id_estudiante;


    codigo.value =
        estudiante.codigo;

    dni.value =
        estudiante.dni;

    nombres.value =
        estudiante.nombres;

    apellidos.value =
        estudiante.apellidos;

    correo.value =
        estudiante.correo;

    usuario.value =
        estudiante.usuario;

    contrasena.value =
        "********";

    telefono.value =
        estudiante.telefono || "";

    semestre.value =
        estudiante.semestre;

    estado.value =
        estudiante.estado;

    rol.value =
        estudiante.rol;


    btnGuardar.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// 15. RESTABLECER CONTRASEÑA
// ======================================================

async function restablecerContrasena(id) {

    const estudiante =
        estudiantes.find(
            estudiante =>
                estudiante.id_estudiante === id
        );


    if (!estudiante) {
        return;
    }


    const confirmar =
        confirm(

            "¿Desea restablecer la contraseña de " +

            estudiante.nombres +
            " " +
            estudiante.apellidos +

            "?"

        );


    if (!confirmar) {
        return;
    }


    const nuevaContrasena =
        generarContrasena();


    try {

        const respuesta =
            await fetch(
                `${API_ESTUDIANTES}/${id}/contrasena`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            nuevaContrasena
                        })
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo restablecer la contraseña."
            );

        }


        alert(

            "CONTRASEÑA RESTABLECIDA\n\n" +

            "Estudiante:\n" +
            estudiante.nombres +
            " " +
            estudiante.apellidos +

            "\n\nUsuario:\n" +
            estudiante.usuario +

            "\n\nNueva contraseña temporal:\n" +
            nuevaContrasena

        );

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// ======================================================
// 16. ELIMINAR ESTUDIANTE
// ======================================================

async function eliminarEstudiante(id) {

    const estudiante =
        estudiantes.find(
            estudiante =>
                estudiante.id_estudiante === id
        );


    if (!estudiante) {
        return;
    }


    const confirmar =
        confirm(

            "¿Está seguro de eliminar al estudiante " +

            estudiante.nombres +
            " " +
            estudiante.apellidos +

            "?"

        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_ESTUDIANTES}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar el estudiante."
            );

        }


        alert(
            "Estudiante eliminado correctamente."
        );


        limpiarFormulario();

        await cargarEstudiantes();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}


// ======================================================
// 17. BUSCAR ESTUDIANTE
// ======================================================

buscarEstudiante.addEventListener(
    "input",
    function () {

        const texto =
            this.value
                .toLowerCase()
                .trim();


        const resultados =
            estudiantes.filter(
                function (estudiante) {

                    const nombreCompleto =

                        estudiante.nombres
                            .toLowerCase()

                        +

                        " "

                        +

                        estudiante.apellidos
                            .toLowerCase();


                    return (

                        estudiante.codigo
                            .toLowerCase()
                            .includes(texto)

                        ||

                        estudiante.dni
                            .includes(texto)

                        ||

                        nombreCompleto
                            .includes(texto)

                        ||

                        estudiante.usuario
                            .toLowerCase()
                            .includes(texto)

                    );

                }
            );


        mostrarEstudiantes(
            resultados
        );

    }
);


// ======================================================
// 18. LIMPIAR FORMULARIO
// ======================================================

function limpiarFormulario() {

    formulario.reset();

    correo.value = "";

    usuario.value = "";

    contrasena.value = "";

    rol.value =
        "Estudiante";

    idEditando = null;

    btnGuardar.innerHTML =
        "💾 Registrar estudiante";

}


// ======================================================
// 19. BOTÓN LIMPIAR
// ======================================================

formulario.addEventListener(
    "reset",
    function () {

        setTimeout(
            function () {

                correo.value = "";

                usuario.value = "";

                contrasena.value = "";

                rol.value =
                    "Estudiante";

                idEditando = null;

                btnGuardar.innerHTML =
                    "💾 Registrar estudiante";

            },
            0
        );

    }
);


// ======================================================
// 20. INICIAR
// ======================================================

cargarEstudiantes();