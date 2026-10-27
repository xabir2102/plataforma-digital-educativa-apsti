// ======================================================
// PANEL PRINCIPAL DEL ESTUDIANTE - APSTI
// ======================================================


// ======================================================
// CONTADORES
// ======================================================

const contadorActividades =
    document.getElementById("contadorActividades");

const contadorMateriales =
    document.getElementById("contadorMateriales");

const contadorAvisos =
    document.getElementById("contadorAvisos");

const contadorProyectos =
    document.getElementById("contadorProyectos");


// ======================================================
// CONTADORES TEMPORALES
// ======================================================

/*
    Por ahora los valores permanecen en cero.

    Cuando conectemos Node.js + Express + MySQL,
    estos datos se obtendrán automáticamente
    desde la base de datos.
*/

contadorActividades.textContent = "0";

contadorMateriales.textContent = "0";

contadorAvisos.textContent = "0";

contadorProyectos.textContent = "0";


// ======================================================
// FUTURA CONEXIÓN CON LA BASE DE DATOS
// ======================================================

/*

    El panel del estudiante recibirá:

    DOCENTE
    --------------------------------------
    - Actividades publicadas
    - Material educativo publicado
    - Avisos publicados
    - Referencias de proyectos publicadas


    ADMINISTRADOR
    --------------------------------------
    - Proyectos registrados


    ESTUDIANTE
    --------------------------------------
    Solo podrá consultar la información.

*/