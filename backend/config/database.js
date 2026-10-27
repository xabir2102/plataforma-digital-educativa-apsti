const mysql = require("mysql2");

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "apsti_db"
});

conexion.connect((error) => {

    if (error) {
        console.error("❌ Error al conectar con MySQL:");
        console.error(error.message);
        return;
    }

    console.log("✅ Conexión exitosa con MySQL");
    console.log("📚 Base de datos: apsti_db");

});

module.exports = conexion;