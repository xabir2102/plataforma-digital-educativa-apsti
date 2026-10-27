// ======================================================
// ACTIVIDADES - ESTUDIANTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const listaActividadesEstudiante =
    document.getElementById(
        "listaActividadesEstudiante"
    );

const buscarActividadEstudiante =
    document.getElementById(
        "buscarActividadEstudiante"
    );

const filtroSemestreActividad =
    document.getElementById(
        "filtroSemestreActividad"
    );

const filtroTipoActividad =
    document.getElementById(
        "filtroTipoActividad"
    );

const cantidadActividades =
    document.getElementById(
        "cantidadActividades"
    );


// ======================================================
// DATOS TEMPORALES
// ======================================================

/*
    IMPORTANTE:

    Por ahora este arreglo está vacío porque todavía
    no tenemos conexión con la base de datos.

    Más adelante las actividades serán obtenidas
    automáticamente desde MySQL.

    Solamente deberán mostrarse actividades cuyo
    estado sea "Publicado".
*/

let actividadesEstudiante = [];


// ======================================================
// MOSTRAR ACTIVIDADES
// ======================================================

function mostrarActividadesEstudiante(lista) {


    listaActividadesEstudiante.innerHTML = "";


    cantidadActividades.textContent =
        lista.length;


    // SI NO HAY ACTIVIDADES

    if (lista.length === 0) {


        listaActividadesEstudiante.innerHTML = `

            <div class="sin-resultados">

                <span>
                    📝
                </span>

                <h3>
                    No hay actividades disponibles
                </h3>

                <p>
                    Actualmente no existen actividades
                    publicadas que coincidan con la búsqueda.
                </p>

            </div>

        `;


        return;

    }


    // MOSTRAR TARJETAS

    lista.forEach(function (actividad) {


        const tarjeta =
            document.createElement("article");


        tarjeta.classList.add(
            "tarjeta-consulta"
        );


        // RECURSO

        let botonRecurso = "";


        if (
            actividad.enlace &&
            actividad.enlace.trim() !== ""
        ) {

            botonRecurso = `

                <a
                    href="${actividad.enlace}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-recurso-estudiante"
                >
                    🔗 Ver recurso
                </a>

            `;

        }


        tarjeta.innerHTML = `

            <div class="consulta-superior">

                <div class="consulta-icono">
                    📝
                </div>


                <div class="consulta-etiquetas">

                    <span class="etiqueta-semestre">
                        ${actividad.semestre} Semestre
                    </span>

                    <span class="etiqueta-tipo">
                        ${actividad.tipo}
                    </span>

                </div>

            </div>


            <div class="consulta-contenido">

                <h3>
                    ${actividad.titulo}
                </h3>


                <p class="consulta-curso">

                    📚

                    ${actividad.curso}

                </p>


                <p class="consulta-descripcion">

                    ${actividad.descripcion}

                </p>

            </div>


            <div class="consulta-footer">

                <span class="consulta-fecha">

                    📅

                    ${formatearFechaActividad(
                        actividad.fecha
                    )}

                </span>


                ${botonRecurso}

            </div>

        `;


        listaActividadesEstudiante.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaActividad(fecha) {


    if (!fecha) {

        return "Sin fecha";

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
// FILTRAR ACTIVIDADES
// ======================================================

function filtrarActividadesEstudiante() {


    const texto =
        buscarActividadEstudiante.value
            .toLowerCase()
            .trim();


    const semestre =
        filtroSemestreActividad.value;


    const tipo =
        filtroTipoActividad.value;


    const resultados =
        actividadesEstudiante.filter(
            function (actividad) {


                // SOLO PUBLICADAS

                const estaPublicada =

                    actividad.estado ===
                    "Publicado";


                // BÚSQUEDA

                const coincideTexto =

                    actividad.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    actividad.curso
                        .toLowerCase()
                        .includes(texto)

                    ||

                    actividad.descripcion
                        .toLowerCase()
                        .includes(texto);


                // SEMESTRE

                const coincideSemestre =

                    semestre === "Todos"

                    ||

                    actividad.semestre ===
                    semestre;


                // TIPO

                const coincideTipo =

                    tipo === "Todos"

                    ||

                    actividad.tipo === tipo;


                return (

                    estaPublicada
                    &&
                    coincideTexto
                    &&
                    coincideSemestre
                    &&
                    coincideTipo

                );

            }
        );


    mostrarActividadesEstudiante(
        resultados
    );

}


// ======================================================
// EVENTOS
// ======================================================

buscarActividadEstudiante.addEventListener(
    "input",
    filtrarActividadesEstudiante
);


filtroSemestreActividad.addEventListener(
    "change",
    filtrarActividadesEstudiante
);


filtroTipoActividad.addEventListener(
    "change",
    filtrarActividadesEstudiante
);


// ======================================================
// INICIAR
// ======================================================

filtrarActividadesEstudiante();