// ======================================================
// PROYECTOS EDUCATIVOS - DOCENTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const formProyectoDocente =
    document.getElementById("formProyectoDocente");

const tituloProyecto =
    document.getElementById("tituloProyecto");

const semestreProyecto =
    document.getElementById("semestreProyecto");

const cursoProyecto =
    document.getElementById("cursoProyecto");

const tipoProyecto =
    document.getElementById("tipoProyecto");

const fechaProyecto =
    document.getElementById("fechaProyecto");

const enlaceProyecto =
    document.getElementById("enlaceProyecto");

const estadoProyecto =
    document.getElementById("estadoProyecto");

const descripcionProyecto =
    document.getElementById("descripcionProyecto");

const tablaProyectosDocente =
    document.getElementById("tablaProyectosDocente");

const buscarProyecto =
    document.getElementById("buscarProyecto");

const filtroSemestreProyecto =
    document.getElementById("filtroSemestreProyecto");

const btnGuardarProyecto =
    document.querySelector(".btn-guardar");


// ======================================================
// DATOS TEMPORALES
// ======================================================

let proyectosDocente = [];

let indiceProyectoEditando = null;


// ======================================================
// REGISTRAR / ACTUALIZAR PROYECTO
// ======================================================

formProyectoDocente.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const nuevoProyecto = {

            titulo:
                tituloProyecto.value.trim(),

            semestre:
                semestreProyecto.value,

            curso:
                cursoProyecto.value.trim(),

            tipo:
                tipoProyecto.value,

            fecha:
                fechaProyecto.value,

            enlace:
                enlaceProyecto.value.trim(),

            estado:
                estadoProyecto.value,

            descripcion:
                descripcionProyecto.value.trim()

        };


        // ==========================================
        // REGISTRAR
        // ==========================================

        if (indiceProyectoEditando === null) {


            proyectosDocente.push(
                nuevoProyecto
            );


            alert(
                "Proyecto publicado correctamente."
            );

        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        else {


            proyectosDocente[indiceProyectoEditando] =
                nuevoProyecto;


            indiceProyectoEditando = null;


            alert(
                "Proyecto actualizado correctamente."
            );

        }


        limpiarFormularioProyecto();

        aplicarFiltrosProyecto();

    }
);


// ======================================================
// MOSTRAR PROYECTOS
// ======================================================

function mostrarProyectos(lista) {


    tablaProyectosDocente.innerHTML = "";


    if (lista.length === 0) {


        tablaProyectosDocente.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="sin-registros"
                >
                    No hay proyectos que mostrar.
                </td>

            </tr>

        `;


        return;

    }


    lista.forEach(function (proyecto) {


        const indiceReal =
            proyectosDocente.indexOf(proyecto);


        let claseEstado =
            "estado-borrador";


        if (proyecto.estado === "Publicado") {

            claseEstado =
                "estado-publicado";

        }


        const fila =
            document.createElement("tr");


        // Si no existe enlace, mostramos "Sin enlace"

        let recurso = `
            <span class="sin-enlace">
                Sin enlace
            </span>
        `;


        if (proyecto.enlace !== "") {

            recurso = `

                <a
                    href="${proyecto.enlace}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-recurso"
                >
                    🔗 Abrir
                </a>

            `;

        }


        fila.innerHTML = `

            <td>

                <strong>
                    ${proyecto.titulo}
                </strong>

            </td>


            <td>
                ${proyecto.curso}
            </td>


            <td>
                ${proyecto.semestre}
            </td>


            <td>
                ${proyecto.tipo}
            </td>


            <td>
                ${formatearFechaProyecto(proyecto.fecha)}
            </td>


            <td>

                <span class="${claseEstado}">
                    ${proyecto.estado}
                </span>

            </td>


            <td>
                ${recurso}
            </td>


            <td>

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarProyectoDocente(${indiceReal})"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarProyectoDocente(${indiceReal})"
                >
                    🗑️ Eliminar
                </button>

            </td>

        `;


        tablaProyectosDocente.appendChild(
            fila
        );

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaProyecto(fecha) {


    if (!fecha) {

        return "-";

    }


    const partes =
        fecha.split("-");


    return (
        partes[2]
        + "/"
        + partes[1]
        + "/"
        + partes[0]
    );

}


// ======================================================
// EDITAR PROYECTO
// ======================================================

function editarProyectoDocente(indice) {


    const proyecto =
        proyectosDocente[indice];


    tituloProyecto.value =
        proyecto.titulo;

    semestreProyecto.value =
        proyecto.semestre;

    cursoProyecto.value =
        proyecto.curso;

    tipoProyecto.value =
        proyecto.tipo;

    fechaProyecto.value =
        proyecto.fecha;

    enlaceProyecto.value =
        proyecto.enlace;

    estadoProyecto.value =
        proyecto.estado;

    descripcionProyecto.value =
        proyecto.descripcion;


    indiceProyectoEditando =
        indice;


    btnGuardarProyecto.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// ELIMINAR PROYECTO
// ======================================================

function eliminarProyectoDocente(indice) {


    const proyecto =
        proyectosDocente[indice];


    const confirmar =
        confirm(

            "¿Está seguro de eliminar el proyecto "

            + proyecto.titulo

            + "?"

        );


    if (!confirmar) {

        return;

    }


    proyectosDocente.splice(
        indice,
        1
    );


    limpiarFormularioProyecto();

    aplicarFiltrosProyecto();


    alert(
        "Proyecto eliminado correctamente."
    );

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


    const resultados =
        proyectosDocente.filter(
            function (proyecto) {


                const coincideTexto =

                    proyecto.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.curso
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.tipo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.descripcion
                        .toLowerCase()
                        .includes(texto);


                const coincideSemestre =

                    semestreSeleccionado === "Todos"

                    ||

                    proyecto.semestre ===
                    semestreSeleccionado;


                return (
                    coincideTexto
                    &&
                    coincideSemestre
                );

            }
        );


    // ORDEN POR SEMESTRE

    const ordenSemestres = {

        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4,
        "V": 5,
        "VI": 6

    };


    resultados.sort(function (a, b) {

        return (

            ordenSemestres[a.semestre]

            -

            ordenSemestres[b.semestre]

        );

    });


    mostrarProyectos(
        resultados
    );

}


// ======================================================
// EVENTOS DE BÚSQUEDA
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


    formProyectoDocente.reset();


    indiceProyectoEditando = null;


    btnGuardarProyecto.innerHTML =
        "💾 Publicar proyecto";

}


// ======================================================
// BOTÓN LIMPIAR
// ======================================================

formProyectoDocente.addEventListener(
    "reset",
    function () {


        setTimeout(function () {

            indiceProyectoEditando = null;


            btnGuardarProyecto.innerHTML =
                "💾 Publicar proyecto";

        }, 0);

    }
);


// ======================================================
// INICIAR
// ======================================================

aplicarFiltrosProyecto();