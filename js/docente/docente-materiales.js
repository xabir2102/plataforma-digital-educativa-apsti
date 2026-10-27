// ======================================================
// MATERIAL EDUCATIVO - DOCENTE APSTI
// ======================================================


// ======================================================
// ELEMENTOS DEL HTML
// ======================================================

const formMaterial =
    document.getElementById("formMaterial");

const tituloMaterial =
    document.getElementById("tituloMaterial");

const semestreMaterial =
    document.getElementById("semestreMaterial");

const cursoMaterial =
    document.getElementById("cursoMaterial");

const tipoMaterial =
    document.getElementById("tipoMaterial");

const enlaceMaterial =
    document.getElementById("enlaceMaterial");

const fechaMaterial =
    document.getElementById("fechaMaterial");

const estadoMaterial =
    document.getElementById("estadoMaterial");

const descripcionMaterial =
    document.getElementById("descripcionMaterial");

const tablaMateriales =
    document.getElementById("tablaMateriales");

const buscarMaterial =
    document.getElementById("buscarMaterial");

const filtroSemestreMaterial =
    document.getElementById("filtroSemestreMaterial");

const btnGuardarMaterial =
    document.querySelector(".btn-guardar");


// ======================================================
// DATOS TEMPORALES
// ======================================================

let materiales = [];

let indiceMaterialEditando = null;


// ======================================================
// REGISTRAR / ACTUALIZAR
// ======================================================

formMaterial.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        const nuevoMaterial = {

            titulo:
                tituloMaterial.value.trim(),

            semestre:
                semestreMaterial.value,

            curso:
                cursoMaterial.value.trim(),

            tipo:
                tipoMaterial.value,

            enlace:
                enlaceMaterial.value.trim(),

            fecha:
                fechaMaterial.value,

            estado:
                estadoMaterial.value,

            descripcion:
                descripcionMaterial.value.trim()

        };


        // ==========================================
        // REGISTRAR
        // ==========================================

        if (indiceMaterialEditando === null) {

            materiales.push(nuevoMaterial);


            alert(
                "Material educativo publicado correctamente."
            );

        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        else {

            materiales[indiceMaterialEditando] =
                nuevoMaterial;


            indiceMaterialEditando = null;


            alert(
                "Material educativo actualizado correctamente."
            );

        }


        limpiarFormularioMaterial();

        aplicarFiltrosMaterial();

    }
);


// ======================================================
// MOSTRAR MATERIALES
// ======================================================

function mostrarMateriales(lista) {


    tablaMateriales.innerHTML = "";


    if (lista.length === 0) {

        tablaMateriales.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="sin-registros"
                >
                    No hay materiales que mostrar.
                </td>

            </tr>

        `;

        return;

    }


    lista.forEach(function (material) {


        const indiceReal =
            materiales.indexOf(material);


        let claseEstado =
            "estado-borrador";


        if (material.estado === "Publicado") {

            claseEstado =
                "estado-publicado";

        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>

                <strong>
                    ${material.titulo}
                </strong>

            </td>


            <td>
                ${material.curso}
            </td>


            <td>
                ${material.semestre}
            </td>


            <td>
                ${material.tipo}
            </td>


            <td>
                ${formatearFechaMaterial(material.fecha)}
            </td>


            <td>

                <span class="${claseEstado}">
                    ${material.estado}
                </span>

            </td>


            <td>

                <a
                    href="${material.enlace}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-recurso"
                >
                    🔗 Abrir
                </a>

            </td>


            <td>

                <button
                    type="button"
                    class="btn-editar"
                    onclick="editarMaterial(${indiceReal})"
                >
                    ✏️ Editar
                </button>


                <button
                    type="button"
                    class="btn-eliminar"
                    onclick="eliminarMaterial(${indiceReal})"
                >
                    🗑️ Eliminar
                </button>

            </td>

        `;


        tablaMateriales.appendChild(fila);

    });

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFechaMaterial(fecha) {


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
// EDITAR MATERIAL
// ======================================================

function editarMaterial(indice) {


    const material =
        materiales[indice];


    tituloMaterial.value =
        material.titulo;

    semestreMaterial.value =
        material.semestre;

    cursoMaterial.value =
        material.curso;

    tipoMaterial.value =
        material.tipo;

    enlaceMaterial.value =
        material.enlace;

    fechaMaterial.value =
        material.fecha;

    estadoMaterial.value =
        material.estado;

    descripcionMaterial.value =
        material.descripcion;


    indiceMaterialEditando =
        indice;


    btnGuardarMaterial.innerHTML =
        "💾 Guardar cambios";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// ELIMINAR MATERIAL
// ======================================================

function eliminarMaterial(indice) {


    const material =
        materiales[indice];


    const confirmar =
        confirm(

            "¿Está seguro de eliminar el material " +

            material.titulo +

            "?"

        );


    if (!confirmar) {

        return;

    }


    materiales.splice(
        indice,
        1
    );


    limpiarFormularioMaterial();

    aplicarFiltrosMaterial();


    alert(
        "Material educativo eliminado correctamente."
    );

}


// ======================================================
// BUSCAR Y FILTRAR
// ======================================================

function aplicarFiltrosMaterial() {


    const texto =
        buscarMaterial.value
            .toLowerCase()
            .trim();


    const semestreSeleccionado =
        filtroSemestreMaterial.value;


    const resultados =
        materiales.filter(function (material) {


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


            const coincideSemestre =

                semestreSeleccionado === "Todos"

                ||

                material.semestre ===
                semestreSeleccionado;


            return (
                coincideTexto
                &&
                coincideSemestre
            );

        });


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


    mostrarMateriales(resultados);

}


// ======================================================
// EVENTOS DE FILTRO
// ======================================================

buscarMaterial.addEventListener(
    "input",
    aplicarFiltrosMaterial
);


filtroSemestreMaterial.addEventListener(
    "change",
    aplicarFiltrosMaterial
);


// ======================================================
// LIMPIAR FORMULARIO
// ======================================================

function limpiarFormularioMaterial() {


    formMaterial.reset();


    indiceMaterialEditando = null;


    btnGuardarMaterial.innerHTML =
        "💾 Publicar material";

}


// ======================================================
// BOTÓN LIMPIAR
// ======================================================

formMaterial.addEventListener(
    "reset",
    function () {


        setTimeout(function () {

            indiceMaterialEditando = null;


            btnGuardarMaterial.innerHTML =
                "💾 Publicar material";

        }, 0);

    }
);


// ======================================================
// INICIAR
// ======================================================

aplicarFiltrosMaterial();
