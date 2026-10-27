const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname, "..")));

// Ruta principal para servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// API de estado
app.get("/api/estado", (req, res) => {
  res.json({
    estado: "Servidor funcionando correctamente"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});