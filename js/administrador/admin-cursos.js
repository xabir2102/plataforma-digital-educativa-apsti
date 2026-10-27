// ======================================================
// GESTIÓN DE CURSOS - APSTI
// NODE.JS + EXPRESS + MYSQL
// ======================================================


// ======================================================
// 1. API
// ======================================================

const API_CURSOS =
    "http://localhost:3000/api/cursos";

const API_DOCENTES =
    "http://localhost:3000/api/docentes";


// ======================================================
// 2. ELEMENTOS
// ======================================================

const formCurso =
    document.getElementById("formCurso");

const codigoCurso =
    document.getElementById("codigoCurso");

const nombreCurso =
    document.getElementById("nombreCurso");

const semestreCurso =
    document.getElementById("semestreCurso");

const docenteCurso =
    document.getElementById("docenteCurso");

const estadoCurso =
    document.getElementById("estadoCurso");

const descripcionCurso =
    document.getElementById("descripcionCurso");

const tablaCursos =
    document.getElementById("tablaCursos");

const buscarCurso =
    document.getElementById("buscarCurso");

const filtroSemestre =
    document.getElementById("filtroSemestre");

const btnGuardarCurso =
    document.querySelector(".btn-guardar");


// ======================================================
// 3. DATOS
// ======================================================

let cursos = [];

let docentes = [];

let idCursoEditando = null;


// ======================================================
// 4. CARGAR DOCENTES
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


        const todosLosDocentes =
            await respuesta.json();


        docentes =
            todosLosDocentes.filter(
                function (docente) {

                    return (
                        docente.estado ===
                        "Activo"
                    );

                }
            );


        mostrarDocentesSelect();

    } catch (error) {

        console.error(error);


        docenteCurso.innerHTML = `

            <option value="">
                No se pudieron cargar los docentes
            </option>

        `;

    }

}


// ======================================================
// 5. MOSTRAR DOCENTES EN SELECT
// ======================================================

function mostrarDocentesSelect() {

    docenteCurso.innerHTML = `

        <option value="">
            Seleccione un docente
        </option>

    `;


    docentes.forEach(
        function (docente) {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                docente.id_docente;


            opcion.textContent =

                docente.nombres +
                " " +
                docente.apellidos +
                " - " +
                docente.especialidad;


            docenteCurso.appendChild(
                opcion
            );

        }
    );

}


// ======================================================
// 6. CARGAR CURSOS
// ======================================================

async function cargarCursos() {

    try {

        const respuesta =
            await fetch(
                API_CURSOS
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los cursos."
            );

        }


        cursos =
            await respuesta.json();


        aplicarFiltros();

    } catch (error) {

        console.error(error);


        tablaCursos.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="sin-registros"
                >

                    No se pudo conectar con el servidor.

                </td>

            </tr>

        `;

    }

}


// ======================================================
// 7. REGISTRAR / ACTUALIZAR
// ======================================================

formCurso.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const datosCurso = {

            id_docente:
                Number(
                    docenteCurso.value
                ),

            codigo:
                codigoCurso.value
                    .trim()
                    .toUpperCase(),

            nombre:
                nombreCurso.value.trim(),

            semestre:
                semestreCurso.value,

            estado:
                estadoCurso.value,

            descripcion:
                descripcionCurso.value.trim()

        };


        if (
            !datosCurso.id_docente
        ) {

            alert(
                "Debe seleccionar un docente responsable."
            );

            docenteCurso.focus();

            return;

        }


        // ==================================================
        // REGISTRAR
        // ==================================================

        if (
            idCursoEditando === null
        ) {

            try {

                btnGuardarCurso.disabled =
                    true;

                btnGuardarCurso.innerHTML =
                    "⏳ Registrando...";


                const respuesta =
                    await fetch(

                        API_CURSOS,

                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    datosCurso
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo registrar el curso."
                    );

                }


                alert(
                    "Curso registrado correctamente."
                );


                limpiarFormularioCurso();

                await cargarCursos();

            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );

            } finally {

                btnGuardarCurso.disabled =
                    false;

                btnGuardarCurso.innerHTML =
                    "💾 Registrar curso";

            }

        }


        // ==================================================
        // ACTUALIZAR
        // ==================================================

        else {

            try {

                btnGuardarCurso.disabled =
                    true;

                btnGuardarCurso.innerHTML =
                    "⏳ Guardando...";


                const respuesta =
                    await fetch(

                        `${API_CURSOS}/${idCursoEditando}`,

                        {
                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    datosCurso
                                )
                        }
                    );


                const datos =
                    await respuesta.json();


                if (!respuesta.ok) {

                    throw new Error(
                        datos.mensaje ||
                        "No se pudo actualizar el curso."
                    );

                }


                alert(
                    "Curso actualizado correctamente."
                );


                limpiarFormularioCurso();

                await cargarCursos();

            } catch (error) {

                console.error(error);

                alert(
                    error.message
                );

            } finally {

                btnGuardarCurso.disabled =
                    false;


                btnGuardarCurso.innerHTML =
                    idCursoEditando === null
                        ? "💾 Registrar curso"
                        : "💾 Guardar cambios";

            }

        }

    }
);


// ======================================================
// 8. MOSTRAR CURSOS
// ======================================================

function mostrarCursos(lista) {

    tablaCursos.innerHTML =
        "";


    if (
        lista.length === 0
    ) {

        tablaCursos.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="sin-registros"
                >

                    No hay cursos que mostrar.

                </td>

            </tr>

        `;


        return;

    }


    lista.forEach(
        function (curso) {

            let claseEstado =
                "estado-inactivo";


            if (
                curso.estado ===
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
                    ${curso.codigo}
                </td>

                <td>
                    <strong>
                        ${curso.nombre}
                    </strong>
                </td>

                <td>
                    ${curso.semestre}
                </td>

                <td>
                    ${curso.docente}
                </td>

                <td>

                    <span class="${claseEstado}">
                        ${curso.estado}
                    </span>

                </td>

                <td>

                    <button
                        type="button"
                        class="btn-editar"
                        onclick="editarCurso(${curso.id_curso})"
                    >
                        ✏️ Editar
                    </button>


                    <button
                        type="button"
                        class="btn-eliminar"
                        onclick="eliminarCurso(${curso.id_curso})"
                    >
                        🗑️ Eliminar
                    </button>

                </td>

            `;


            tablaCursos.appendChild(
                fila
            );

        }
    );

}


// ======================================================
// 9. EDITAR
// ======================================================

function editarCurso(id) {

    const curso =
        cursos.find(
            function (curso) {

                return (
                    curso.id_curso === id
                );

            }
        );


    if (!curso) {

        return;

    }


    idCursoEditando =
        curso.id_curso;


    codigoCurso.value =
        curso.codigo;

    nombreCurso.value =
        curso.nombre;

    semestreCurso.value =
        curso.semestre;

    docenteCurso.value =
        curso.id_docente;

    estadoCurso.value =
        curso.estado;

    descripcionCurso.value =
        curso.descripcion || "";


    btnGuardarCurso.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


// ======================================================
// 10. ELIMINAR
// ======================================================

async function eliminarCurso(id) {

    const curso =
        cursos.find(
            function (curso) {

                return (
                    curso.id_curso === id
                );

            }
        );


    if (!curso) {

        return;

    }


    const confirmar =
        confirm(

            "¿Está seguro de eliminar el curso " +

            curso.nombre +

            "?"

        );


    if (!confirmar) {

        return;

    }


    try {

        const respuesta =
            await fetch(

                `${API_CURSOS}/${id}`,

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
                "No se pudo eliminar el curso."
            );

        }


        alert(
            "Curso eliminado correctamente."
        );


        limpiarFormularioCurso();

        await cargarCursos();

    } catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// ======================================================
// 11. FILTRAR Y BUSCAR
// ======================================================

function aplicarFiltros() {

    const texto =
        buscarCurso.value
            .toLowerCase()
            .trim();


    const semestreSeleccionado =
        filtroSemestre.value;


    let resultados =
        cursos.filter(
            function (curso) {

                const coincideTexto =

                    curso.codigo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    curso.nombre
                        .toLowerCase()
                        .includes(texto)

                    ||

                    curso.docente
                        .toLowerCase()
                        .includes(texto);


                const coincideSemestre =

                    semestreSeleccionado ===
                    "Todos"

                    ||

                    curso.semestre ===
                    semestreSeleccionado;


                return (
                    coincideTexto
                    &&
                    coincideSemestre
                );

            }
        );


    // --------------------------------------------------
    // ORDENAR POR SEMESTRE
    // --------------------------------------------------

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


    mostrarCursos(
        resultados
    );

}


// ======================================================
// 12. EVENTOS DE FILTRO
// ======================================================

buscarCurso.addEventListener(
    "input",
    aplicarFiltros
);


filtroSemestre.addEventListener(
    "change",
    aplicarFiltros
);


// ======================================================
// 13. LIMPIAR
// ======================================================

function limpiarFormularioCurso() {

    formCurso.reset();


    idCursoEditando =
        null;


    btnGuardarCurso.innerHTML =
        "💾 Registrar curso";

}


// ======================================================
// 14. BOTÓN LIMPIAR
// ======================================================

formCurso.addEventListener(
    "reset",
    function () {

        setTimeout(
            function () {

                idCursoEditando =
                    null;


                btnGuardarCurso.innerHTML =
                    "💾 Registrar curso";

            },
            0
        );

    }
);


// ======================================================
// 15. INICIAR
// ======================================================

async function iniciarCursos() {

    await cargarDocentes();

    await cargarCursos();

}


iniciarCursos();