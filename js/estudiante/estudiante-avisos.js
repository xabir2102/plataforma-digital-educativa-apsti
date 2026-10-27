// ======================================================
// AVISOS - ESTUDIANTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const listaAvisosEstudiante =
    document.getElementById(
        "listaAvisosEstudiante"
    );

const buscarAvisoEstudiante =
    document.getElementById(
        "buscarAvisoEstudiante"
    );

const filtroSemestreAvisoEstudiante =
    document.getElementById(
        "filtroSemestreAvisoEstudiante"
    );

const filtroPrioridadAviso =
    document.getElementById(
        "filtroPrioridadAviso"
    );

const cantidadAvisos =
    document.getElementById(
        "cantidadAvisos"
    );


// ======================================================
// DATOS TEMPORALES
// ======================================================

/*
    Más adelante estos datos llegarán desde MySQL.

    El estudiante solamente deberá visualizar
    avisos cuyo estado sea "Publicado".

    Además podrá visualizar:

    - Avisos dirigidos a "Todos".
    - Avisos correspondientes a su semestre.
*/

let avisosEstudiante = [];


// ======================================================
// MOSTRAR AVISOS
// ======================================================

function mostrarAvisosEstudiante(lista) {


    listaAvisosEstudiante.innerHTML = "";


    cantidadAvisos.textContent =
        lista.length;


    // ==========================================
    // SIN RESULTADOS
    // ==========================================

    if (lista.length === 0) {


        listaAvisosEstudiante.innerHTML = `

            <div class="sin-resultados">

                <span>
                    📭
                </span>

                <h3>
                    No hay avisos disponibles
                </h3>

                <p>
                    Actualmente no existen avisos publicados
                    que coincidan con los filtros seleccionados.
                </p>

            </div>

        `;


        return;

    }


    // ==========================================
    // MOSTRAR AVISOS
    // ==========================================

    lista.forEach(function (aviso) {


        const tarjeta =
            document.createElement("article");


        tarjeta.classList.add(
            "tarjeta-aviso-estudiante"
        );


        // ==========================================
        // PRIORIDAD
        // ==========================================

        let clasePrioridad =
            "aviso-normal";


        let iconoPrioridad =
            "🔵";


        if (aviso.prioridad === "Importante") {

            clasePrioridad =
                "aviso-importante";

            iconoPrioridad =
                "🟡";

        }


        if (aviso.prioridad === "Urgente") {

            clasePrioridad =
                "aviso-urgente";

            iconoPrioridad =
                "🔴";

        }


        // ==========================================
        // DESTINATARIO
        // ==========================================

        let destinatario =
            aviso.semestre + " Semestre";


        if (aviso.semestre === "Todos") {

            destinatario =
                "Todos los estudiantes";

        }


        tarjeta.innerHTML = `

            <div class="aviso-indicador ${clasePrioridad}">
            </div>


            <div class="aviso-contenido">


                <div class="aviso-superior">


                    <div class="aviso-titulo">


                        <span class="aviso-icono">
                            📢
                        </span>


                        <div>

                            <h3>
                                ${aviso.titulo}
                            </h3>

                            <span class="aviso-tipo">
                                ${aviso.tipo}
                            </span>

                        </div>


                    </div>


                    <span
                        class="prioridad-aviso ${clasePrioridad}"
                    >

                        ${iconoPrioridad}

                        ${aviso.prioridad}

                    </span>


                </div>



                <p class="aviso-mensaje">

                    ${aviso.contenido}

                </p>



                <div class="aviso-footer">


                    <span>

                        👥

                        ${destinatario}

                    </span>


                    <span>

                        📅

                        ${formatearFechaAviso(
                            aviso.fecha
                        )}

                    </span>


                </div>


            </div>

        `;


        listaAvisosEstudiante.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaAviso(fecha) {


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
// FILTRAR AVISOS
// ======================================================

function filtrarAvisosEstudiante() {


    const texto =
        buscarAvisoEstudiante.value
            .toLowerCase()
            .trim();


    const semestre =
        filtroSemestreAvisoEstudiante.value;


    const prioridad =
        filtroPrioridadAviso.value;


    const resultados =
        avisosEstudiante.filter(
            function (aviso) {


                // ==================================
                // SOLO AVISOS PUBLICADOS
                // ==================================

                const estaPublicado =

                    aviso.estado ===
                    "Publicado";


                // ==================================
                // BUSCADOR
                // ==================================

                const coincideTexto =

                    aviso.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    aviso.tipo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    aviso.contenido
                        .toLowerCase()
                        .includes(texto);


                // ==================================
                // SEMESTRE
                // ==================================

                /*
                    Si el filtro está en "Todos",
                    se muestran todos los avisos.

                    Si seleccionamos un semestre,
                    mostramos:

                    - avisos de ese semestre
                    - avisos dirigidos a "Todos"
                */

                const coincideSemestre =

                    semestre === "Todos"

                    ||

                    aviso.semestre === semestre

                    ||

                    aviso.semestre === "Todos";


                // ==================================
                // PRIORIDAD
                // ==================================

                const coincidePrioridad =

                    prioridad === "Todas"

                    ||

                    aviso.prioridad ===
                    prioridad;


                return (

                    estaPublicado
                    &&
                    coincideTexto
                    &&
                    coincideSemestre
                    &&
                    coincidePrioridad

                );

            }
        );


    // ==========================================
    // ORDENAR POR FECHA
    // MÁS RECIENTE PRIMERO
    // ==========================================

    resultados.sort(function (a, b) {

        return new Date(b.fecha)
            - new Date(a.fecha);

    });


    mostrarAvisosEstudiante(
        resultados
    );

}


// ======================================================
// EVENTOS
// ======================================================

buscarAvisoEstudiante.addEventListener(
    "input",
    filtrarAvisosEstudiante
);


filtroSemestreAvisoEstudiante.addEventListener(
    "change",
    filtrarAvisosEstudiante
);


filtroPrioridadAviso.addEventListener(
    "change",
    filtrarAvisosEstudiante
);


// ======================================================
// INICIAR
// ======================================================

filtrarAvisosEstudiante();