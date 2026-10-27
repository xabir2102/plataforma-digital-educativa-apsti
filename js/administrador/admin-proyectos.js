// ======================================================
// GESTIÓN DE PROYECTOS - APSTI
// NODE.JS + EXPRESS + MYSQL
// ======================================================


// ======================================================
// API
// ======================================================

const API_PROYECTOS =
    "http://localhost:3000/api/proyectos";

const API_CURSOS =
    "http://localhost:3000/api/cursos";

const API_DOCENTES =
    "http://localhost:3000/api/docentes";

const API_ESTUDIANTES =
    "http://localhost:3000/api/estudiantes";


// ======================================================
// ELEMENTOS
// ======================================================

const formProyecto =
    document.getElementById("formProyecto");

const codigoProyecto =
    document.getElementById("codigoProyecto");

const tituloProyecto =
    document.getElementById("tituloProyecto");

const semestreProyecto =
    document.getElementById("semestreProyecto");

const cursoProyecto =
    document.getElementById("cursoProyecto");

const docenteProyecto =
    document.getElementById("docenteProyecto");

const integrantesProyecto =
    document.getElementById("integrantesProyecto");

const enlaceProyecto =
    document.getElementById("enlaceProyecto");

const estadoProyecto =
    document.getElementById("estadoProyecto");

const descripcionProyecto =
    document.getElementById("descripcionProyecto");

const tablaProyectos =
    document.getElementById("tablaProyectos");

const buscarProyecto =
    document.getElementById("buscarProyecto");

const filtroSemestreProyecto =
    document.getElementById(
        "filtroSemestreProyecto"
    );

const btnGuardarProyecto =
    document.querySelector(".btn-guardar");


// ======================================================
// DATOS
// ======================================================

let proyectos = [];

let cursos = [];

let docentes = [];

let estudiantes = [];

let idProyectoEditando = null;


// ======================================================
// CARGAR DATOS AUXILIARES
// ======================================================

async function cargarDatosAuxiliares() {

    try {

        const [
            respuestaCursos,
            respuestaDocentes,
            respuestaEstudiantes
        ] = await Promise.all([

            fetch(API_CURSOS),

            fetch(API_DOCENTES),

            fetch(API_ESTUDIANTES)

        ]);


        if (
            !respuestaCursos.ok ||
            !respuestaDocentes.ok ||
            !respuestaEstudiantes.ok
        ) {

            throw new Error(
                "No se pudieron cargar los datos necesarios."
            );
        }


        cursos =
            await respuestaCursos.json();

        docentes =
            await respuestaDocentes.json();

        estudiantes =
            await respuestaEstudiantes.json();


        cursos =
            cursos.filter(
                curso =>
                    curso.estado === "Activo"
            );


        docentes =
            docentes.filter(
                docente =>
                    docente.estado === "Activo"
            );


        estudiantes =
            estudiantes.filter(
                estudiante =>
                    estudiante.estado === "Activo"
            );


        cargarCursosSelect();

        limpiarDatosCurso();

    } catch (error) {

        console.error(error);

        alert(
            "No se pudieron cargar cursos, docentes o estudiantes."
        );

    }

}


// ======================================================
// CARGAR CURSOS EN SELECT
// ======================================================

function cargarCursosSelect() {

    cursoProyecto.innerHTML = `

        <option value="">
            Seleccione un curso
        </option>

    `;


    cursos.forEach(
        function (curso) {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                curso.id_curso;


            opcion.textContent =

                curso.codigo +
                " - " +
                curso.nombre +
                " (" +
                curso.semestre +
                " Semestre)";


            cursoProyecto.appendChild(
                opcion
            );

        }
    );

}


// ======================================================
// CURSO SELECCIONADO
// ======================================================

cursoProyecto.addEventListener(
    "change",
    function () {

        actualizarDatosCurso();

    }
);


// ======================================================
// ACTUALIZAR SEMESTRE, DOCENTE E INTEGRANTES
// ======================================================

function actualizarDatosCurso(
    integrantesSeleccionados = []
) {

    const idCurso =
        Number(
            cursoProyecto.value
        );


    const curso =
        cursos.find(
            curso =>
                curso.id_curso === idCurso
        );


    if (!curso) {

        limpiarDatosCurso();

        return;

    }


    // --------------------------------------------------
    // SEMESTRE
    // --------------------------------------------------

    semestreProyecto.value =
        curso.semestre;


    // --------------------------------------------------
    // DOCENTE
    // --------------------------------------------------

    docenteProyecto.innerHTML =
        "";


    const docente =
        docentes.find(
            docente =>
                docente.id_docente ===
                curso.id_docente
        );


    const opcionDocente =
        document.createElement(
            "option"
        );


    opcionDocente.value =
        curso.id_docente;


    opcionDocente.textContent =
        docente
            ? docente.nombres +
              " " +
              docente.apellidos
            : curso.docente;


    opcionDocente.selected =
        true;


    docenteProyecto.appendChild(
        opcionDocente
    );


    // --------------------------------------------------
    // ESTUDIANTES DEL SEMESTRE
    // --------------------------------------------------

    cargarIntegrantes(
        curso.semestre,
        integrantesSeleccionados
    );

}


// ======================================================
// MOSTRAR INTEGRANTES
// ======================================================

function cargarIntegrantes(
    semestre,
    seleccionados = []
) {

    integrantesProyecto.innerHTML =
        "";


    const estudiantesSemestre =
        estudiantes.filter(
            estudiante =>
                estudiante.semestre ===
                semestre
        );


    if (
        estudiantesSemestre.length === 0
    ) {

        const opcion =
            document.createElement(
                "option"
            );


        opcion.disabled =
            true;


        opcion.textContent =
            "No hay estudiantes activos en este semestre";


        integrantesProyecto.appendChild(
            opcion
        );


        return;

    }


    estudiantesSemestre.forEach(
        function (estudiante) {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                estudiante.id_estudiante;


            opcion.textContent =

                estudiante.codigo +
                " - " +
                estudiante.nombres +
                " " +
                estudiante.apellidos;


            opcion.selected =
                seleccionados.includes(
                    estudiante.id_estudiante
                );


            integrantesProyecto.appendChild(
                opcion
            );

        }
    );

}


// ======================================================
// LIMPIAR DATOS DEL CURSO
// ======================================================

function limpiarDatosCurso() {

    semestreProyecto.value =
        "";


    docenteProyecto.innerHTML = `

        <option value="">
            Se asignará según el curso
        </option>

    `;


    integrantesProyecto.innerHTML =
        "";

}


// ======================================================
// CARGAR PROYECTOS
// ======================================================

async function cargarProyectos() {

    try {

        const respuesta =
            await fetch(
                API_PROYECTOS
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los proyectos."
            );

        }


        proyectos =
            await respuesta.json();


        aplicarFiltrosProyecto();

    } catch (error) {

        console.error(error);


        tablaProyectos.innerHTML = `

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
// OBTENER INTEGRANTES SELECCIONADOS
// ======================================================

function obtenerIntegrantesSeleccionados() {

    return Array.from(
        integrantesProyecto
            .selectedOptions
    )
    .map(
        opcion =>
            Number(opcion.value)
    )
    .filter(
        id =>
            Number.isInteger(id) &&
            id > 0
    );

}


// ======================================================
// REGISTRAR / ACTUALIZAR
// ======================================================

formProyecto.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const integrantes =
            obtenerIntegrantesSeleccionados();


        if (
            !cursoProyecto.value
        ) {

            alert(
                "Debe seleccionar un curso."
            );

            return;

        }


        if (
            integrantes.length === 0
        ) {

            alert(
                "Debe seleccionar al menos un integrante."
            );

            integrantesProyecto.focus();

            return;

        }


        const datosProyecto = {

            id_curso:
                Number(
                    cursoProyecto.value
                ),

            codigo:
                codigoProyecto.value
                    .trim()
                    .toUpperCase(),

            titulo:
                tituloProyecto.value.trim(),

            integrantes,

            enlace:
                enlaceProyecto.value.trim(),

            estado:
                estadoProyecto.value,

            descripcion:
                descripcionProyecto.value.trim()

        };


        try {

            btnGuardarProyecto.disabled =
                true;


            btnGuardarProyecto.innerHTML =
                idProyectoEditando === null
                    ? "⏳ Registrando..."
                    : "⏳ Guardando...";


            const esNuevo =
                idProyectoEditando === null;


            const url =
                esNuevo
                    ? API_PROYECTOS
                    : `${API_PROYECTOS}/${idProyectoEditando}`;


            const metodo =
                esNuevo
                    ? "POST"
                    : "PUT";


            const respuesta =
                await fetch(
                    url,
                    {
                        method:
                            metodo,

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                datosProyecto
                            )
                    }
                );


            const datos =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.mensaje ||
                    "No se pudo guardar el proyecto."
                );

            }


            alert(
                esNuevo
                    ? "Proyecto registrado correctamente."
                    : "Proyecto actualizado correctamente."
            );


            limpiarFormularioProyecto();

            await cargarProyectos();

        } catch (error) {

            console.error(error);

            alert(
                error.message
            );

        } finally {

            btnGuardarProyecto.disabled =
                false;


            btnGuardarProyecto.innerHTML =
                idProyectoEditando === null
                    ? "💾 Registrar proyecto"
                    : "💾 Guardar cambios";

        }

    }
);


// ======================================================
// MOSTRAR PROYECTOS
// ======================================================

function mostrarProyectos(lista) {

    tablaProyectos.innerHTML =
        "";


    if (
        lista.length === 0
    ) {

        tablaProyectos.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >
                    No hay proyectos que mostrar.
                </td>

            </tr>

        `;


        return;

    }


    lista.forEach(
        function (proyecto) {

            let claseEstado =
                "estado-inactivo";


            if (
                proyecto.estado ===
                "Finalizado"
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
                    ${proyecto.codigo}
                </td>

                <td>

                    <strong>
                        ${proyecto.titulo}
                    </strong>

                    <br>

                    <small>
                        Integrantes:
                        ${proyecto.integrantes || "Sin integrantes"}
                    </small>

                </td>

                <td>
                    ${proyecto.semestre}
                </td>

                <td>
                    ${proyecto.curso}
                </td>

                <td>
                    ${proyecto.docente}
                </td>

                <td>

                    <span class="${claseEstado}">
                        ${proyecto.estado}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn-editar"
                        onclick="editarProyecto(${proyecto.id_proyecto})"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        type="button"
                        class="btn-eliminar"
                        onclick="eliminarProyecto(${proyecto.id_proyecto})"
                    >
                        🗑️ Eliminar
                    </button>

                </td>

            `;


            tablaProyectos.appendChild(
                fila
            );

        }
    );

}


// ======================================================
// EDITAR
// ======================================================

function editarProyecto(id) {

    const proyecto =
        proyectos.find(
            proyecto =>
                proyecto.id_proyecto === id
        );


    if (!proyecto) {

        return;

    }


    idProyectoEditando =
        proyecto.id_proyecto;


    codigoProyecto.value =
        proyecto.codigo;

    tituloProyecto.value =
        proyecto.titulo;

    cursoProyecto.value =
        proyecto.id_curso;


    actualizarDatosCurso(
        proyecto.ids_integrantes || []
    );


    enlaceProyecto.value =
        proyecto.enlace || "";

    estadoProyecto.value =
        proyecto.estado;

    descripcionProyecto.value =
        proyecto.descripcion || "";


    btnGuardarProyecto.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


// ======================================================
// ELIMINAR
// ======================================================

async function eliminarProyecto(id) {

    const proyecto =
        proyectos.find(
            proyecto =>
                proyecto.id_proyecto === id
        );


    if (!proyecto) {

        return;

    }


    const confirmar =
        confirm(

            "¿Está seguro de eliminar el proyecto " +

            proyecto.titulo +

            "?"

        );


    if (!confirmar) {

        return;

    }


    try {

        const respuesta =
            await fetch(

                `${API_PROYECTOS}/${id}`,

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
                "No se pudo eliminar el proyecto."
            );

        }


        alert(
            "Proyecto eliminado correctamente."
        );


        limpiarFormularioProyecto();

        await cargarProyectos();

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// ======================================================
// BUSCAR Y FILTRAR
// ======================================================

function aplicarFiltrosProyecto() {

    const texto =
        buscarProyecto.value
            .toLowerCase()
            .trim();


    const semestreSeleccionado =
        filtroSemestreProyecto.value;


    let resultados =
        proyectos.filter(
            function (proyecto) {

                const integrantes =
                    proyecto.integrantes || "";


                const coincideTexto =

                    proyecto.codigo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.curso
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.docente
                        .toLowerCase()
                        .includes(texto)

                    ||

                    integrantes
                        .toLowerCase()
                        .includes(texto);


                const coincideSemestre =

                    semestreSeleccionado ===
                    "Todos"

                    ||

                    proyecto.semestre ===
                    semestreSeleccionado;


                return (
                    coincideTexto &&
                    coincideSemestre
                );

            }
        );


    const ordenSemestres = {

        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4,
        "V": 5,
        "VI": 6

    };


    resultados.sort(
        function (a, b) {

            return (

                ordenSemestres[
                    a.semestre
                ]

                -

                ordenSemestres[
                    b.semestre
                ]

            );

        }
    );


    mostrarProyectos(
        resultados
    );

}


// ======================================================
// FILTROS
// ======================================================

buscarProyecto.addEventListener(
    "input",
    aplicarFiltrosProyecto
);


filtroSemestreProyecto.addEventListener(
    "change",
    aplicarFiltrosProyecto
);


// ======================================================
// LIMPIAR FORMULARIO
// ======================================================

function limpiarFormularioProyecto() {

    formProyecto.reset();


    idProyectoEditando =
        null;


    limpiarDatosCurso();


    btnGuardarProyecto.innerHTML =
        "💾 Registrar proyecto";

}


// ======================================================
// BOTÓN LIMPIAR
// ======================================================

formProyecto.addEventListener(
    "reset",
    function () {

        setTimeout(
            function () {

                idProyectoEditando =
                    null;


                limpiarDatosCurso();


                btnGuardarProyecto.innerHTML =
                    "💾 Registrar proyecto";

            },
            0
        );

    }
);


// ======================================================
// INICIAR
// ======================================================

async function iniciarProyectos() {

    await cargarDatosAuxiliares();

    await cargarProyectos();

}


iniciarProyectos();