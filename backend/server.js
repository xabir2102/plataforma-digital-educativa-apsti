const express = require("express");
const cors = require("cors");

const conexion = require("./config/database");


// ======================================================
// RUTAS
// ======================================================

const estudiantesRoutes =
    require("./routes/estudiantes.routes");

const docentesRoutes =
    require("./routes/docentes.routes");

const cursosRoutes =
    require("./routes/cursos.routes");

const proyectosRoutes =
    require("./routes/proyectos.routes");


// ======================================================
// CREAR APLICACIÓN
// ======================================================

const app = express();


// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// RUTA PRINCIPAL
// ======================================================

app.get("/", (req, res) => {

    res.json({
        mensaje:
            "API de Plataforma Educativa APSTI funcionando"
    });

});


// ======================================================
// PRUEBA DE BASE DE DATOS
// ======================================================

app.get("/api/prueba-db", (req, res) => {

    const sql =
        "SELECT DATABASE() AS base_datos";


    conexion.query(
        sql,
        (error, resultados) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje:
                        "Error al consultar la base de datos"
                });
            }


            res.json({

                mensaje:
                    "Conexión con MySQL correcta",

                base_datos:
                    resultados[0].base_datos

            });

        }
    );

});


// ======================================================
// API ESTUDIANTES
// ======================================================

app.use(
    "/api/estudiantes",
    estudiantesRoutes
);


// ======================================================
// API DOCENTES
// ======================================================

app.use(
    "/api/docentes",
    docentesRoutes
);

// ======================================================
// API CURSOS
// ======================================================

app.use(
    "/api/cursos",
    cursosRoutes
);


// ======================================================
// API PROYECTOS
// ======================================================

app.use(
    "/api/proyectos",
    proyectosRoutes
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

const PUERTO = 3000;


app.listen(PUERTO, () => {

    console.log("------------------------------------");
    console.log("🚀 Servidor APSTI iniciado");
    console.log(`📡 Puerto: ${PUERTO}`);
    console.log("------------------------------------");

});