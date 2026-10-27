// ======================================================
// PROYECTOS - ESTUDIANTE APSTI
// ======================================================


// ======================================================
// PESTAÑAS
// ======================================================

const btnProyectosAPSTI =
    document.getElementById("btnProyectosAPSTI");

const btnReferenciasDocente =
    document.getElementById("btnReferenciasDocente");

const seccionProyectosAPSTI =
    document.getElementById("seccionProyectosAPSTI");

const seccionReferenciasDocente =
    document.getElementById("seccionReferenciasDocente");


// ======================================================
// ELEMENTOS - PROYECTOS ADMINISTRADOR
// ======================================================

const listaProyectosAdmin =
    document.getElementById("listaProyectosAdmin");

const buscarProyectoAdmin =
    document.getElementById("buscarProyectoAdmin");

const filtroSemestreProyectoAdmin =
    document.getElementById("filtroSemestreProyectoAdmin");

const filtroEstadoProyectoAdmin =
    document.getElementById("filtroEstadoProyectoAdmin");

const cantidadProyectosAdmin =
    document.getElementById("cantidadProyectosAdmin");


// ======================================================
// ELEMENTOS - REFERENCIAS DOCENTE
// ======================================================

const listaReferenciasDocente =
    document.getElementById("listaReferenciasDocente");

const buscarReferenciaDocente =
    document.getElementById("buscarReferenciaDocente");

const filtroSemestreReferencia =
    document.getElementById("filtroSemestreReferencia");

const filtroTipoReferencia =
    document.getElementById("filtroTipoReferencia");

const cantidadReferenciasDocente =
    document.getElementById("cantidadReferenciasDocente");


// ======================================================
// DATOS TEMPORALES
// ======================================================

/*
    PROYECTOS ADMINISTRADOR

    Estos registros vendrán posteriormente de la tabla
    de proyectos administrada por el Administrador.
*/

let proyectosAdministrador = [];


/*
    REFERENCIAS DOCENTE

    Estos registros vendrán posteriormente de los
    proyectos/referencias publicados por los docentes.
*/

let referenciasDocente = [];


// ======================================================
// CAMBIAR PESTAÑAS
// ======================================================

function mostrarProyectosAPSTI() {

    seccionProyectosAPSTI.classList.remove("oculto");

    seccionReferenciasDocente.classList.add("oculto");


    btnProyectosAPSTI.classList.add("activa");

    btnReferenciasDocente.classList.remove("activa");

}


function mostrarReferenciasDocente() {

    seccionProyectosAPSTI.classList.add("oculto");

    seccionReferenciasDocente.classList.remove("oculto");


    btnProyectosAPSTI.classList.remove("activa");

    btnReferenciasDocente.classList.add("activa");

}


// ======================================================
// MOSTRAR PROYECTOS DEL ADMINISTRADOR
// ======================================================

function mostrarProyectosAdministrador(lista) {


    listaProyectosAdmin.innerHTML = "";


    cantidadProyectosAdmin.textContent =
        lista.length;


    if (lista.length === 0) {


        listaProyectosAdmin.innerHTML = `

            <div class="sin-resultados">

                <span>
                    💻
                </span>

                <h3>
                    No hay proyectos disponibles
                </h3>

                <p>
                    Actualmente no existen proyectos
                    que coincidan con la búsqueda.
                </p>

            </div>

        `;


        return;

    }


    lista.forEach(function (proyecto) {


        const tarjeta =
            document.createElement("article");


        tarjeta.classList.add(
            "tarjeta-proyecto-oficial"
        );


        // ==========================================
        // ESTADO
        // ==========================================

        let claseEstado =
            "proyecto-desarrollo";


        if (proyecto.estado === "Finalizado") {

            claseEstado =
                "proyecto-finalizado";

        }


        // ==========================================
        // ENLACE
        // ==========================================

        let recurso = `

            <span class="proyecto-sin-enlace">
                Sin enlace
            </span>

        `;


        if (
            proyecto.enlace &&
            proyecto.enlace.trim() !== ""
        ) {

            recurso = `

                <a
                    href="${proyecto.enlace}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-recurso-estudiante"
                >
                    🔗 Ver proyecto
                </a>

            `;

        }


        tarjeta.innerHTML = `

            <div class="proyecto-oficial-superior">


                <div class="proyecto-codigo">

                    ${proyecto.codigo}

                </div>


                <span
                    class="estado-proyecto ${claseEstado}"
                >

                    ${proyecto.estado}

                </span>


            </div>



            <div class="proyecto-oficial-contenido">


                <div class="proyecto-icono-grande">
                    💻
                </div>


                <h3>

                    ${proyecto.titulo}

                </h3>


                <p class="proyecto-curso">

                    📚 ${proyecto.curso}

                </p>


                <p class="proyecto-descripcion">

                    ${proyecto.descripcion}

                </p>



                <div class="datos-proyecto">


                    <div>

                        <span>
                            Semestre
                        </span>

                        <strong>
                            ${proyecto.semestre}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Docente asesor
                        </span>

                        <strong>
                            ${proyecto.docente}
                        </strong>

                    </div>


                </div>



                <div class="integrantes-proyecto">

                    <span>
                        👥 Integrantes
                    </span>

                    <p>
                        ${proyecto.integrantes}
                    </p>

                </div>


            </div>



            <div class="proyecto-oficial-footer">

                ${recurso}

            </div>

        `;


        listaProyectosAdmin.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// FILTRAR PROYECTOS ADMINISTRADOR
// ======================================================

function filtrarProyectosAdministrador() {


    const texto =
        buscarProyectoAdmin.value
            .toLowerCase()
            .trim();


    const semestre =
        filtroSemestreProyectoAdmin.value;


    const estado =
        filtroEstadoProyectoAdmin.value;


    const resultados =
        proyectosAdministrador.filter(
            function (proyecto) {


                /*
                    Los proyectos con estado Inactivo
                    no deben mostrarse al estudiante.
                */

                const estaVisible =

                    proyecto.estado !== "Inactivo";


                const coincideTexto =

                    proyecto.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.codigo
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

                    proyecto.integrantes
                        .toLowerCase()
                        .includes(texto)

                    ||

                    proyecto.descripcion
                        .toLowerCase()
                        .includes(texto);


                const coincideSemestre =

                    semestre === "Todos"

                    ||

                    proyecto.semestre === semestre;


                const coincideEstado =

                    estado === "Todos"

                    ||

                    proyecto.estado === estado;


                return (

                    estaVisible
                    &&
                    coincideTexto
                    &&
                    coincideSemestre
                    &&
                    coincideEstado

                );

            }
        );


    mostrarProyectosAdministrador(
        resultados
    );

}


// ======================================================
// MOSTRAR REFERENCIAS DOCENTE
// ======================================================

function mostrarReferenciasDocenteLista(lista) {


    listaReferenciasDocente.innerHTML = "";


    cantidadReferenciasDocente.textContent =
        lista.length;


    if (lista.length === 0) {


        listaReferenciasDocente.innerHTML = `

            <div class="sin-resultados">

                <span>
                    💡
                </span>

                <h3>
                    No hay referencias disponibles
                </h3>

                <p>
                    Actualmente no existen referencias
                    educativas que coincidan con la búsqueda.
                </p>

            </div>

        `;


        return;

    }


    lista.forEach(function (proyecto) {


        const tarjeta =
            document.createElement("article");


        tarjeta.classList.add(
            "tarjeta-consulta"
        );


        let recurso = "";


        if (
            proyecto.enlace &&
            proyecto.enlace.trim() !== ""
        ) {

            recurso = `

                <a
                    href="${proyecto.enlace}"
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
                    💡
                </div>


                <div class="consulta-etiquetas">


                    <span class="etiqueta-semestre">

                        ${proyecto.semestre} Semestre

                    </span>


                    <span class="etiqueta-proyecto-docente">

                        ${proyecto.tipo}

                    </span>


                </div>


            </div>



            <div class="consulta-contenido">


                <h3>

                    ${proyecto.titulo}

                </h3>


                <p class="consulta-curso">

                    📚 ${proyecto.curso}

                </p>


                <p class="consulta-descripcion">

                    ${proyecto.descripcion}

                </p>


            </div>



            <div class="consulta-footer">


                <span class="consulta-fecha">

                    📅

                    ${formatearFechaProyecto(
                        proyecto.fecha
                    )}

                </span>


                ${recurso}


            </div>

        `;


        listaReferenciasDocente.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// FILTRAR REFERENCIAS DOCENTE
// ======================================================

function filtrarReferenciasDocente() {


    const texto =
        buscarReferenciaDocente.value
            .toLowerCase()
            .trim();


    const semestre =
        filtroSemestreReferencia.value;


    const tipo =
        filtroTipoReferencia.value;


    const resultados =
        referenciasDocente.filter(
            function (proyecto) {


                // SOLO PUBLICADOS

                const estaPublicado =

                    proyecto.estado ===
                    "Publicado";


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

                    semestre === "Todos"

                    ||

                    proyecto.semestre ===
                    semestre;


                const coincideTipo =

                    tipo === "Todos"

                    ||

                    proyecto.tipo === tipo;


                return (

                    estaPublicado
                    &&
                    coincideTexto
                    &&
                    coincideSemestre
                    &&
                    coincideTipo

                );

            }
        );


    mostrarReferenciasDocenteLista(
        resultados
    );

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaProyecto(fecha) {


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
// EVENTOS - PESTAÑAS
// ======================================================

btnProyectosAPSTI.addEventListener(
    "click",
    mostrarProyectosAPSTI
);


btnReferenciasDocente.addEventListener(
    "click",
    mostrarReferenciasDocente
);


// ======================================================
// EVENTOS - ADMINISTRADOR
// ======================================================

buscarProyectoAdmin.addEventListener(
    "input",
    filtrarProyectosAdministrador
);


filtroSemestreProyectoAdmin.addEventListener(
    "change",
    filtrarProyectosAdministrador
);


filtroEstadoProyectoAdmin.addEventListener(
    "change",
    filtrarProyectosAdministrador
);


// ======================================================
// EVENTOS - DOCENTE
// ======================================================

buscarReferenciaDocente.addEventListener(
    "input",
    filtrarReferenciasDocente
);


filtroSemestreReferencia.addEventListener(
    "change",
    filtrarReferenciasDocente
);


filtroTipoReferencia.addEventListener(
    "change",
    filtrarReferenciasDocente
);


// ======================================================
// INICIAR
// ======================================================

filtrarProyectosAdministrador();

filtrarReferenciasDocente();