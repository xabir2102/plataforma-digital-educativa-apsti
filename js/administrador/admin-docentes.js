// ======================================================
// GESTIÓN DE DOCENTES - APSTI
// CONECTADO CON NODE.JS + MYSQL
// ======================================================


// ======================================================
// 1. CONFIGURACIÓN DE LA API
// ======================================================

const API_DOCENTES =
    "http://localhost:3000/api/docentes";


// ======================================================
// 2. ELEMENTOS DEL HTML
// ======================================================

const formulario =
    document.getElementById("formDocente");

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

const especialidad =
    document.getElementById("especialidad");

const estado =
    document.getElementById("estado");


// CREDENCIALES

const usuario =
    document.getElementById("usuario");

const contrasena =
    document.getElementById("contrasena");

const rol =
    document.getElementById("rol");


// TABLA Y BUSCADOR

const tablaDocentes =
    document.getElementById("tablaDocentes");

const buscarDocente =
    document.getElementById("buscarDocente");

const btnGuardar =
    document.querySelector(".btn-guardar");


// ======================================================
// 3. DATOS CARGADOS DESDE MYSQL
// ======================================================

let docentes = [];

let idEditando = null;


// ======================================================
// 4. VALIDACIONES
// ======================================================

// DNI SOLO NÚMEROS

dni.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /[^0-9]/g,
                ""
            );

    }
);


// TELÉFONO SOLO NÚMEROS

telefono.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /[^0-9]/g,
                ""
            );

    }
);


// NOMBRES SOLO LETRAS

nombres.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
                ""
            );

    }
);


// APELLIDOS SOLO LETRAS

apellidos.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
                ""
            );

    }
);


// ESPECIALIDAD

especialidad.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g,
                ""
            );

    }
);


// ======================================================
// 5. LIMPIAR TEXTO PARA EL CORREO
// ======================================================

function limpiarTexto(texto) {

    return texto
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(/ñ/g, "n")
        .replace(/Ñ/g, "N")
        .toLowerCase();

}


// ======================================================
// 6. PRIMER NOMBRE
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
// 7. PRIMER APELLIDO
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
// 8. GENERAR CORREO
// ======================================================

function generarCorreo() {

    const primerNombre =
        obtenerPrimerNombre();

    const primerApellido =
        obtenerPrimerApellido();


    if (
        !primerNombre ||
        !primerApellido
    ) {

        return "";

    }


    let correoGenerado =

        primerNombre +
        "." +
        primerApellido +
        "@apsti.edu.pe";


    let contador = 2;


    while (

        docentes.some(
            function (docente) {

                return (

                    docente.correo ===
                    correoGenerado

                    &&

                    docente.id_docente !==
                    idEditando

                );

            }
        )

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


    let password =
        "Apsti";


    password +=
        simbolos[
            Math.floor(
                Math.random() *
                simbolos.length
            )
        ];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

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
// 10. MOSTRAR USUARIO AUTOMÁTICAMENTE
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
// 11. CARGAR DOCENTES DESDE MYSQL
// ======================================================

async function cargarDocentes() {

    try {

        const respuesta =
            await fetch(
                API_DOCENTES
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los docentes."
            );

        }


        docentes =
            await respuesta.json();


        mostrarDocentes();

    } catch (error) {

        console.error(error);


        tablaDocentes.innerHTML = `

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
// 12. REGISTRAR / ACTUALIZAR DOCENTE
// ======================================================

formulario.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        // ----------------------------------------------
        // VALIDAR DNI
        // ----------------------------------------------

        if (
            dni.value.length !== 8
        ) {

            alert(
                "El DNI debe contener exactamente 8 dígitos."
            );

            dni.focus();

            return;

        }


        // ----------------------------------------------
        // VALIDAR TELÉFONO
        // ----------------------------------------------

        if (
            telefono.value.length !== 9
        ) {

            alert(
                "El teléfono debe contener exactamente 9 dígitos."
            );

            telefono.focus();

            return;

        }


        // ==================================================
        // REGISTRAR
        // ==================================================

        if (
            idEditando === null
        ) {

            const contrasenaGenerada =
                generarContrasena();


            contrasena.value =
                contrasenaGenerada;


            const nuevoDocente = {

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

                especialidad:
                    especialidad.value.trim(),

                estado:
                    estado.value

            };


            try {

                btnGuardar.disabled =
                    true;

                btnGuardar.innerHTML =
                    "⏳ Registrando...";


                const respuesta =
                    await fetch(
                        API_DOCENTES,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    nuevoDocente
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo registrar el docente."
                    );

                }


                alert(

                    "DOCENTE REGISTRADO CORRECTAMENTE\n\n" +

                    "Correo / Usuario:\n" +
                    nuevoDocente.usuario +

                    "\n\nContraseña temporal:\n" +
                    contrasenaGenerada +

                    "\n\nRol: Docente"

                );


                limpiarFormulario();

                await cargarDocentes();

            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );

            } finally {

                btnGuardar.disabled =
                    false;

                btnGuardar.innerHTML =
                    "💾 Registrar docente";

            }

        }


        // ==================================================
        // ACTUALIZAR
        // ==================================================

        else {

            const docenteActualizado = {

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

                especialidad:
                    especialidad.value.trim(),

                estado:
                    estado.value

            };


            try {

                btnGuardar.disabled =
                    true;

                btnGuardar.innerHTML =
                    "⏳ Guardando...";


                const respuesta =
                    await fetch(

                        `${API_DOCENTES}/${idEditando}`,

                        {
                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    docenteActualizado
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo actualizar el docente."
                    );

                }


                alert(
                    "Información del docente actualizada correctamente."
                );


                limpiarFormulario();

                await cargarDocentes();

            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );

            } finally {

                btnGuardar.disabled =
                    false;


                btnGuardar.innerHTML =
                    idEditando === null
                        ? "💾 Registrar docente"
                        : "💾 Guardar cambios";

            }

        }

    }
);


// ======================================================
// 13. MOSTRAR DOCENTES
// ======================================================

function mostrarDocentes(
    lista = docentes
) {

    tablaDocentes.innerHTML =
        "";


    if (
        lista.length === 0
    ) {

        tablaDocentes.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >

                    No hay docentes registrados actualmente.

                </td>

            </tr>

        `;


        return;

    }


    lista.forEach(
        function (docente) {

            let claseEstado =
                "estado-inactivo";


            if (
                docente.estado ===
                "Activo"
            ) {

                claseEstado =
                    "estado-activo";

            }


            const fila =
                document.createElement(
                    "tr"
                );


            fila.innerHTML = `

                <td>
                    ${docente.codigo}
                </td>

                <td>
                    ${docente.nombres}
                    ${docente.apellidos}
                </td>

                <td>
                    ${docente.dni}
                </td>

                <td>
                    ${docente.usuario}
                </td>

                <td>
                    ${docente.especialidad}
                </td>

                <td>

                    <span class="${claseEstado}">
                        ${docente.estado}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn-editar"
                        onclick="editarDocente(${docente.id_docente})"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        type="button"
                        class="btn-restablecer"
                        onclick="restablecerContrasena(${docente.id_docente})"
                    >
                        🔑 Restablecer
                    </button>


                    <button
                        type="button"
                        class="btn-eliminar"
                        onclick="eliminarDocente(${docente.id_docente})"
                    >
                        🗑️ Eliminar
                    </button>

                </td>

            `;


            tablaDocentes.appendChild(
                fila
            );

        }
    );

}


// ======================================================
// 14. EDITAR DOCENTE
// ======================================================

function editarDocente(id) {

    const docente =
        docentes.find(
            docente =>
                docente.id_docente === id
        );


    if (!docente) {

        return;

    }


    idEditando =
        docente.id_docente;


    codigo.value =
        docente.codigo;

    dni.value =
        docente.dni;

    nombres.value =
        docente.nombres;

    apellidos.value =
        docente.apellidos;

    correo.value =
        docente.correo;

    telefono.value =
        docente.telefono || "";

    especialidad.value =
        docente.especialidad;

    estado.value =
        docente.estado;

    usuario.value =
        docente.usuario;

    contrasena.value =
        "********";

    rol.value =
        docente.rol || "Docente";


    btnGuardar.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


// ======================================================
// 15. RESTABLECER CONTRASEÑA
// ======================================================

async function restablecerContrasena(id) {

    const docente =
        docentes.find(
            docente =>
                docente.id_docente === id
        );


    if (!docente) {

        return;

    }


    const confirmar =
        confirm(

            "¿Desea restablecer la contraseña de " +

            docente.nombres +
            " " +
            docente.apellidos +

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

                `${API_DOCENTES}/${id}/contrasena`,

                {
                    method:
                        "PUT",

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

            "Docente:\n" +
            docente.nombres +
            " " +
            docente.apellidos +

            "\n\nUsuario:\n" +
            docente.usuario +

            "\n\nNueva contraseña temporal:\n" +
            nuevaContrasena

        );

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// ======================================================
// 16. ELIMINAR DOCENTE
// ======================================================

async function eliminarDocente(id) {

    const docente =
        docentes.find(
            docente =>
                docente.id_docente === id
        );


    if (!docente) {

        return;

    }


    const confirmar =
        confirm(

            "¿Está seguro de eliminar al docente " +

            docente.nombres +
            " " +
            docente.apellidos +

            "?"

        );


    if (!confirmar) {

        return;

    }


    try {

        const respuesta =
            await fetch(

                `${API_DOCENTES}/${id}`,

                {
                    method:
                        "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar el docente."
            );

        }


        alert(
            "Docente eliminado correctamente."
        );


        limpiarFormulario();

        await cargarDocentes();

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// ======================================================
// 17. BUSCAR DOCENTE
// ======================================================

buscarDocente.addEventListener(
    "input",
    function () {

        const texto =
            this.value
                .toLowerCase()
                .trim();


        const resultados =
            docentes.filter(
                function (docente) {

                    const nombreCompleto =

                        docente.nombres
                            .toLowerCase()

                        +

                        " "

                        +

                        docente.apellidos
                            .toLowerCase();


                    return (

                        docente.codigo
                            .toLowerCase()
                            .includes(texto)

                        ||

                        docente.dni
                            .includes(texto)

                        ||

                        nombreCompleto
                            .includes(texto)

                        ||

                        docente.usuario
                            .toLowerCase()
                            .includes(texto)

                        ||

                        docente.especialidad
                            .toLowerCase()
                            .includes(texto)

                        ||

                        docente.estado
                            .toLowerCase()
                            .includes(texto)

                    );

                }
            );


        mostrarDocentes(
            resultados
        );

    }
);


// ======================================================
// 18. LIMPIAR FORMULARIO
// ======================================================

function limpiarFormulario() {

    formulario.reset();

    correo.value =
        "";

    usuario.value =
        "";

    contrasena.value =
        "";

    rol.value =
        "Docente";

    idEditando =
        null;

    btnGuardar.innerHTML =
        "💾 Registrar docente";

}


// ======================================================
// 19. BOTÓN LIMPIAR
// ======================================================

formulario.addEventListener(
    "reset",
    function () {

        setTimeout(
            function () {

                correo.value =
                    "";

                usuario.value =
                    "";

                contrasena.value =
                    "";

                rol.value =
                    "Docente";

                idEditando =
                    null;

                btnGuardar.innerHTML =
                    "💾 Registrar docente";

            },
            0
        );

    }
);


// ======================================================
// 20. INICIAR
// ======================================================

cargarDocentes();