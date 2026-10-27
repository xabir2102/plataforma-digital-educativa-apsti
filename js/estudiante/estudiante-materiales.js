// ======================================================
// MATERIAL EDUCATIVO - ESTUDIANTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const listaMaterialesEstudiante =
    document.getElementById(
        "listaMaterialesEstudiante"
    );

const buscarMaterialEstudiante =
    document.getElementById(
        "buscarMaterialEstudiante"
    );

const filtroSemestreMaterial =
    document.getElementById(
        "filtroSemestreMaterial"
    );

const filtroTipoMaterial =
    document.getElementById(
        "filtroTipoMaterial"
    );

const cantidadMateriales =
    document.getElementById(
        "cantidadMateriales"
    );


// ======================================================
// DATOS TEMPORALES
// ======================================================

/*
    Este arreglo permanecerá vacío mientras
    todavía no tengamos la conexión con MySQL.

    Más adelante los materiales publicados
    por los docentes llegarán desde el backend.

    El estudiante solamente podrá visualizar
    materiales cuyo estado sea "Publicado".
*/

let materialesEstudiante = [];


// ======================================================
// MOSTRAR MATERIALES
// ======================================================

function mostrarMaterialesEstudiante(lista) {


    listaMaterialesEstudiante.innerHTML = "";


    cantidadMateriales.textContent =
        lista.length;


    // ==========================================
    // SIN RESULTADOS
    // ==========================================

    if (lista.length === 0) {


        listaMaterialesEstudiante.innerHTML = `

            <div class="sin-resultados">

                <span>
                    📚
                </span>

                <h3>
                    No hay materiales disponibles
                </h3>

                <p>
                    Actualmente no existen recursos educativos
                    publicados que coincidan con la búsqueda.
                </p>

            </div>

        `;


        return;

    }


    // ==========================================
    // CREAR TARJETAS
    // ==========================================

    lista.forEach(function (material) {


        const tarjeta =
            document.createElement("article");


        tarjeta.classList.add(
            "tarjeta-consulta"
        );


        // ==========================================
        // ICONO SEGÚN EL TIPO
        // ==========================================

        const icono =
            obtenerIconoMaterial(
                material.tipo
            );


        tarjeta.innerHTML = `

            <div class="consulta-superior">


                <div class="consulta-icono">

                    ${icono}

                </div>


                <div class="consulta-etiquetas">


                    <span class="etiqueta-semestre">

                        ${material.semestre} Semestre

                    </span>


                    <span class="etiqueta-material">

                        ${material.tipo}

                    </span>


                </div>


            </div>



            <div class="consulta-contenido">


                <h3>

                    ${material.titulo}

                </h3>


                <p class="consulta-curso">

                    📚 ${material.curso}

                </p>


                <p class="consulta-descripcion">

                    ${material.descripcion}

                </p>


            </div>



            <div class="consulta-footer">


                <span class="consulta-fecha">

                    📅

                    ${formatearFechaMaterial(
                        material.fecha
                    )}

                </span>


                <a
                    href="${material.enlace}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-recurso-estudiante"
                >
                    🔗 Abrir recurso
                </a>


            </div>

        `;


        listaMaterialesEstudiante.appendChild(
            tarjeta
        );

    });

}


// ======================================================
// OBTENER ICONO SEGÚN EL MATERIAL
// ======================================================

function obtenerIconoMaterial(tipo) {


    switch (tipo) {


        case "Documento":

            return "📄";


        case "Guía":

            return "📘";


        case "Video":

            return "🎥";


        case "Tutorial":

            return "💡";


        case "Presentación":

            return "📊";


        case "Sitio web":

            return "🌐";


        default:

            return "📚";

    }

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaMaterial(fecha) {


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
// FILTRAR MATERIALES
// ======================================================

function filtrarMaterialesEstudiante() {


    const texto =
        buscarMaterialEstudiante.value
            .toLowerCase()
            .trim();


    const semestre =
        filtroSemestreMaterial.value;


    const tipo =
        filtroTipoMaterial.value;


    const resultados =
        materialesEstudiante.filter(
            function (material) {


                // ==================================
                // SOLO MATERIAL PUBLICADO
                // ==================================

                const estaPublicado =

                    material.estado ===
                    "Publicado";


                // ==================================
                // BUSCADOR
                // ==================================

                const coincideTexto =

                    material.titulo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    material.curso
                        .toLowerCase()
                        .includes(texto)

                    ||

                    material.tipo
                        .toLowerCase()
                        .includes(texto)

                    ||

                    material.descripcion
                        .toLowerCase()
                        .includes(texto);


                // ==================================
                // SEMESTRE
                // ==================================

                const coincideSemestre =

                    semestre === "Todos"

                    ||

                    material.semestre ===
                    semestre;


                // ==================================
                // TIPO
                // ==================================

                const coincideTipo =

                    tipo === "Todos"

                    ||

                    material.tipo === tipo;


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


    // ==========================================
    // ORDENAR POR SEMESTRE
    // ==========================================

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


    mostrarMaterialesEstudiante(
        resultados
    );

}


// ======================================================
// EVENTOS
// ======================================================

buscarMaterialEstudiante.addEventListener(
    "input",
    filtrarMaterialesEstudiante
);


filtroSemestreMaterial.addEventListener(
    "change",
    filtrarMaterialesEstudiante
);


filtroTipoMaterial.addEventListener(
    "change",
    filtrarMaterialesEstudiante
);


// ======================================================
// INICIAR
// ======================================================

filtrarMaterialesEstudiante();