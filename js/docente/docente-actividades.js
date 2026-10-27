// ======================================================
// GESTIÓN DE ACTIVIDADES - DOCENTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const formActividad =
    document.getElementById("formActividad");

const tituloActividad =
    document.getElementById("tituloActividad");

const semestreActividad =
    document.getElementById("semestreActividad");

const cursoActividad =
    document.getElementById("cursoActividad");

const tipoActividad =
    document.getElementById("tipoActividad");

const fechaActividad =
    document.getElementById("fechaActividad");

const estadoActividad =
    document.getElementById("estadoActividad");

const enlaceActividad =
    document.getElementById("enlaceActividad");

const descripcionActividad =
    document.getElementById("descripcionActividad");

const tablaActividades =
    document.getElementById("tablaActividades");

const buscarActividad =
    document.getElementById("buscarActividad");

const filtroSemestreActividad =
    document.getElementById("filtroSemestreActividad");

const btnGuardarActividad =
    document.querySelector(".btn-guardar");


// ======================================================
// DATOS TEMPORALES
// ======================================================

let actividades = [];

let indiceActividadEditando = null;


// ======================================================
// REGISTRAR / ACTUALIZAR
// ======================================================

formActividad.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const nuevaActividad = {

            titulo:
                tituloActividad.value.trim(),

            semestre:
                semestreActividad.value,

            curso:
                cursoActividad.value.trim(),

            tipo:
                tipoActividad.value,

            fecha:
                fechaActividad.value,

            estado:
                estadoActividad.value,

            enlace:
                enlaceActividad.value.trim(),

            descripcion:
                descripcionActividad.value.trim()

        };


        // ==========================================
        // REGISTRAR
        // ==========================================

        if (indiceActividadEditando === null) {

            actividades.push(nuevaActividad);

            alert(
                "Actividad publicada correctamente."
            );

        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        else {

            actividades[indiceActividadEditando] =
                nuevaActividad;


            indiceActividadEditando = null;


            alert(
                "Actividad actualizada correctamente."
            );

        }


        limpiarFormularioActividad();

        aplicarFiltrosActividad();

    }
);


// ======================================================
// MOSTRAR ACTIVIDADES
// ======================================================

function mostrarActividades(lista) {


    tablaActividades.innerHTML = "";


    if (lista.length === 0) {

        tablaActividades.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="sin-registros"
                >
                    No hay actividades que mostrar.
                </td>

            </tr>

        `;

        return;

    }


    lista.forEach(function (actividad) {


        const indiceReal =
            actividades.indexOf(actividad);


        let claseEstado =
            "estado-borrador";


        if (actividad.estado === "Publicado") {

            claseEstado =
                "estado-publicado";

        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                <strong>
                    ${actividad.titulo}
                </strong>
            </td>

            <td>
                ${actividad.curso}
            </td>

            <td>
                ${actividad.semestre}
            </td>

            <td>
                ${actividad.tipo}
            </td>

            <td>
                ${formatearFecha(actividad.fecha)}
            </td>

            <td>

                <span class="${claseEstado}">
                    ${actividad.estado}
                </span>

            </td>

            <td>

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarActividad(${indiceReal})"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarActividad(${indiceReal})"
                >
                    🗑️ Eliminar
                </button>

            </td>

        `;


        tablaActividades.appendChild(fila);

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(fecha) {

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
// EDITAR ACTIVIDAD
// ======================================================

function editarActividad(indice) {


    const actividad =
        actividades[indice];


    tituloActividad.value =
        actividad.titulo;

    semestreActividad.value =
        actividad.semestre;

    cursoActividad.value =
        actividad.curso;

    tipoActividad.value =
        actividad.tipo;

    fechaActividad.value =
        actividad.fecha;

    estadoActividad.value =
        actividad.estado;

    enlaceActividad.value =
        actividad.enlace;

    descripcionActividad.value =
        actividad.descripcion;


    indiceActividadEditando =
        indice;


    btnGuardarActividad.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// ELIMINAR ACTIVIDAD
// ======================================================

function eliminarActividad(indice) {


    const actividad =
        actividades[indice];


    const confirmar =
        confirm(

            "¿Está seguro de eliminar la actividad " +

            actividad.titulo +

            "?"

        );


    if (!confirmar) {

        return;

    }


    actividades.splice(
        indice,
        1
    );


    limpiarFormularioActividad();

    aplicarFiltrosActividad();


    alert(
        "Actividad eliminada correctamente."
    );

}


// ======================================================
// BUSCAR Y FILTRAR
// ======================================================

function aplicarFiltrosActividad() {


    const texto =
        buscarActividad.value
            .toLowerCase()
            .trim();


    const semestreSeleccionado =
        filtroSemestreActividad.value;


    const resultados =
        actividades.filter(function (actividad) {


            const coincideTexto =

                actividad.titulo
                    .toLowerCase()
                    .includes(texto)

                ||

                actividad.curso
                    .toLowerCase()
                    .includes(texto)

                ||

                actividad.tipo
                    .toLowerCase()
                    .includes(texto)

                ||

                actividad.descripcion
                    .toLowerCase()
                    .includes(texto);


            const coincideSemestre =

                semestreSeleccionado === "Todos"

                ||

                actividad.semestre ===
                semestreSeleccionado;


            return (
                coincideTexto
                &&
                coincideSemestre
            );

        });


    mostrarActividades(resultados);

}


// ======================================================
// EVENTOS DE FILTRO
// ======================================================

buscarActividad.addEventListener(
    "input",
    aplicarFiltrosActividad
);


filtroSemestreActividad.addEventListener(
    "change",
    aplicarFiltrosActividad
);


// ======================================================
// LIMPIAR FORMULARIO
// ======================================================

function limpiarFormularioActividad() {


    formActividad.reset();


    indiceActividadEditando = null;


    btnGuardarActividad.innerHTML =
        "💾 Publicar actividad";

}


// ======================================================
// BOTÓN LIMPIAR
// ======================================================

formActividad.addEventListener(
    "reset",
    function () {


        setTimeout(function () {

            indiceActividadEditando = null;


            btnGuardarActividad.innerHTML =
                "💾 Publicar actividad";

        }, 0);

    }
);


// ======================================================
// INICIAR
// ======================================================

aplicarFiltrosActividad();