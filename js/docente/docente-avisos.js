// ======================================================
// GESTIÓN DE AVISOS - DOCENTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const formAviso =
    document.getElementById("formAviso");

const tituloAviso =
    document.getElementById("tituloAviso");

const semestreAviso =
    document.getElementById("semestreAviso");

const tipoAviso =
    document.getElementById("tipoAviso");

const fechaAviso =
    document.getElementById("fechaAviso");

const prioridadAviso =
    document.getElementById("prioridadAviso");

const estadoAviso =
    document.getElementById("estadoAviso");

const contenidoAviso =
    document.getElementById("contenidoAviso");

const tablaAvisos =
    document.getElementById("tablaAvisos");

const buscarAviso =
    document.getElementById("buscarAviso");

const filtroSemestreAviso =
    document.getElementById("filtroSemestreAviso");

const btnGuardarAviso =
    document.querySelector(".btn-guardar");


// ======================================================
// DATOS TEMPORALES
// ======================================================

let avisos = [];

let indiceAvisoEditando = null;


// ======================================================
// REGISTRAR / ACTUALIZAR
// ======================================================

formAviso.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const nuevoAviso = {

            titulo:
                tituloAviso.value.trim(),

            semestre:
                semestreAviso.value,

            tipo:
                tipoAviso.value,

            fecha:
                fechaAviso.value,

            prioridad:
                prioridadAviso.value,

            estado:
                estadoAviso.value,

            contenido:
                contenidoAviso.value.trim()

        };


        // ==========================================
        // REGISTRAR
        // ==========================================

        if (indiceAvisoEditando === null) {


            avisos.push(nuevoAviso);


            alert(
                "Aviso registrado correctamente."
            );

        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        else {


            avisos[indiceAvisoEditando] =
                nuevoAviso;


            indiceAvisoEditando = null;


            alert(
                "Aviso actualizado correctamente."
            );

        }


        limpiarFormularioAviso();

        aplicarFiltrosAviso();

    }
);


// ======================================================
// MOSTRAR AVISOS
// ======================================================

function mostrarAvisos(lista) {


    tablaAvisos.innerHTML = "";


    if (lista.length === 0) {


        tablaAvisos.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >
                    No hay avisos que mostrar.
                </td>

            </tr>

        `;


        return;

    }


    lista.forEach(function (aviso) {


        const indiceReal =
            avisos.indexOf(aviso);


        // ESTADO

        let claseEstado =
            "estado-borrador";


        if (aviso.estado === "Publicado") {

            claseEstado =
                "estado-publicado";

        }


        // PRIORIDAD

        let clasePrioridad =
            "prioridad-normal";


        if (aviso.prioridad === "Importante") {

            clasePrioridad =
                "prioridad-importante";

        }


        if (aviso.prioridad === "Urgente") {

            clasePrioridad =
                "prioridad-urgente";

        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>

                <strong>
                    ${aviso.titulo}
                </strong>

            </td>


            <td>

                ${
                    aviso.semestre === "Todos"
                    ? "Todos"
                    : aviso.semestre + " Semestre"
                }

            </td>


            <td>
                ${aviso.tipo}
            </td>


            <td>
                ${formatearFechaAviso(aviso.fecha)}
            </td>


            <td>

                <span class="${clasePrioridad}">
                    ${aviso.prioridad}
                </span>

            </td>


            <td>

                <span class="${claseEstado}">
                    ${aviso.estado}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarAviso(${indiceReal})"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarAviso(${indiceReal})"
                >
                    🗑️ Eliminar
                </button>

            </td>

        `;


        tablaAvisos.appendChild(fila);

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaAviso(fecha) {


    if (!fecha) {

        return "-";

    }


    const partes =
        fecha.split("-");


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// ======================================================
// EDITAR AVISO
// ======================================================

function editarAviso(indice) {


    const aviso =
        avisos[indice];


    tituloAviso.value =
        aviso.titulo;

    semestreAviso.value =
        aviso.semestre;

    tipoAviso.value =
        aviso.tipo;

    fechaAviso.value =
        aviso.fecha;

    prioridadAviso.value =
        aviso.prioridad;

    estadoAviso.value =
        aviso.estado;

    contenidoAviso.value =
        aviso.contenido;


    indiceAvisoEditando =
        indice;


    btnGuardarAviso.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// ELIMINAR AVISO
// ======================================================

function eliminarAviso(indice) {


    const aviso =
        avisos[indice];


    const confirmar =
        confirm(

            "¿Está seguro de eliminar el aviso " +

            aviso.titulo +

            "?"

        );


    if (!confirmar) {

        return;

    }


    avisos.splice(
        indice,
        1
    );


    limpiarFormularioAviso();

    aplicarFiltrosAviso();


    alert(
        "Aviso eliminado correctamente."
    );

}


// ======================================================
// BUSCAR Y FILTRAR
// ======================================================

function aplicarFiltrosAviso() {


    const texto =
        buscarAviso.value
            .toLowerCase()
            .trim();


    const semestreSeleccionado =
        filtroSemestreAviso.value;


    const resultados =
        avisos.filter(function (aviso) {


            const coincideTexto =

                aviso.titulo
                    .toLowerCase()
                    .includes(texto)

                ||

                aviso.tipo
                    .toLowerCase()
                    .includes(texto)

                ||

                aviso.prioridad
                    .toLowerCase()
                    .includes(texto)

                ||

                aviso.contenido
                    .toLowerCase()
                    .includes(texto);


            /*
                Cuando seleccionamos "Todos",
                mostramos todos los avisos.

                Cuando seleccionamos un semestre,
                mostramos:
                - avisos de ese semestre
                - avisos dirigidos a todos
            */

            const coincideSemestre =

                semestreSeleccionado === "Todos"

                ||

                aviso.semestre ===
                semestreSeleccionado

                ||

                aviso.semestre === "Todos";


            return (
                coincideTexto
                &&
                coincideSemestre
            );

        });


    mostrarAvisos(resultados);

}


// ======================================================
// EVENTOS DE FILTRO
// ======================================================

buscarAviso.addEventListener(
    "input",
    aplicarFiltrosAviso
);


filtroSemestreAviso.addEventListener(
    "change",
    aplicarFiltrosAviso
);


// ======================================================
// LIMPIAR FORMULARIO
// ======================================================

function limpiarFormularioAviso() {


    formAviso.reset();


    indiceAvisoEditando = null;


    btnGuardarAviso.innerHTML =
        "📢 Publicar aviso";

}


// ======================================================
// BOTÓN LIMPIAR
// ======================================================

formAviso.addEventListener(
    "reset",
    function () {


        setTimeout(function () {

            indiceAvisoEditando = null;


            btnGuardarAviso.innerHTML =
                "📢 Publicar aviso";

        }, 0);

    }
);


// ======================================================
// INICIAR
// ======================================================

aplicarFiltrosAviso();