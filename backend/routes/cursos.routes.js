const express = require("express");
const conexion = require("../config/database");

const router = express.Router();


// ======================================================
// 1. LISTAR CURSOS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            c.id_curso,
            c.id_docente,
            c.codigo,
            c.nombre,
            c.semestre,
            c.descripcion,
            c.estado,

            d.nombres AS docente_nombres,
            d.apellidos AS docente_apellidos,

            CONCAT(
                d.nombres,
                ' ',
                d.apellidos
            ) AS docente

        FROM cursos c

        INNER JOIN docentes d
            ON c.id_docente = d.id_docente

        ORDER BY
            FIELD(
                c.semestre,
                'I',
                'II',
                'III',
                'IV',
                'V',
                'VI'
            ),
            c.nombre ASC
    `;


    conexion.query(
        sql,
        (error, resultados) => {

            if (error) {

                console.error(
                    "Error al listar cursos:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al obtener los cursos."
                });

            }


            res.json(resultados);

        }
    );

});


// ======================================================
// 2. REGISTRAR CURSO
// ======================================================

router.post("/", (req, res) => {

    const {
        id_docente,
        codigo,
        nombre,
        semestre,
        descripcion,
        estado
    } = req.body;


    // --------------------------------------------------
// VALIDAR CAMPOS
    // --------------------------------------------------

    if (
        !id_docente ||
        !codigo ||
        !nombre ||
        !semestre ||
        !descripcion ||
        !estado
    ) {

        return res.status(400).json({
            mensaje:
                "Todos los campos son obligatorios."
        });

    }


    // --------------------------------------------------
    // VALIDAR SEMESTRE
    // --------------------------------------------------

    const semestresValidos = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI"
    ];


    if (
        !semestresValidos.includes(
            semestre
        )
    ) {

        return res.status(400).json({
            mensaje:
                "El semestre seleccionado no es válido."
        });

    }


    // --------------------------------------------------
    // COMPROBAR DOCENTE
    // --------------------------------------------------

    const sqlDocente = `
        SELECT id_docente
        FROM docentes
        WHERE
            id_docente = ?
            AND estado = 'Activo'
    `;


    conexion.query(
        sqlDocente,
        [id_docente],
        (errorDocente, resultadosDocente) => {

            if (errorDocente) {

                console.error(
                    errorDocente
                );

                return res.status(500).json({
                    mensaje:
                        "Error al verificar el docente."
                });

            }


            if (
                resultadosDocente.length === 0
            ) {

                return res.status(400).json({
                    mensaje:
                        "El docente seleccionado no existe o se encuentra inactivo."
                });

            }


            // --------------------------------------------------
            // INSERTAR CURSO
            // --------------------------------------------------

            const sqlCurso = `
                INSERT INTO cursos
                (
                    id_docente,
                    codigo,
                    nombre,
                    semestre,
                    descripcion,
                    estado
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;


            conexion.query(
                sqlCurso,
                [
                    id_docente,
                    codigo.toUpperCase(),
                    nombre,
                    semestre,
                    descripcion,
                    estado
                ],
                (errorCurso, resultado) => {

                    if (errorCurso) {

                        console.error(
                            "Error al registrar curso:",
                            errorCurso
                        );


                        if (
                            errorCurso.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({
                                mensaje:
                                    "Ya existe un curso con ese código."
                            });

                        }


                        return res.status(500).json({
                            mensaje:
                                "Error al registrar el curso."
                        });

                    }


                    res.status(201).json({

                        mensaje:
                            "Curso registrado correctamente.",

                        id_curso:
                            resultado.insertId

                    });

                }
            );

        }
    );

});


// ======================================================
// 3. ACTUALIZAR CURSO
// ======================================================

router.put("/:id", (req, res) => {

    const idCurso =
        req.params.id;


    const {
        id_docente,
        codigo,
        nombre,
        semestre,
        descripcion,
        estado
    } = req.body;


    if (
        !id_docente ||
        !codigo ||
        !nombre ||
        !semestre ||
        !descripcion ||
        !estado
    ) {

        return res.status(400).json({
            mensaje:
                "Todos los campos son obligatorios."
        });

    }


    // --------------------------------------------------
    // COMPROBAR DOCENTE
    // --------------------------------------------------

    const sqlDocente = `
        SELECT id_docente
        FROM docentes
        WHERE
            id_docente = ?
            AND estado = 'Activo'
    `;


    conexion.query(
        sqlDocente,
        [id_docente],
        (errorDocente, resultadosDocente) => {

            if (errorDocente) {

                console.error(
                    errorDocente
                );

                return res.status(500).json({
                    mensaje:
                        "Error al verificar el docente."
                });

            }


            if (
                resultadosDocente.length === 0
            ) {

                return res.status(400).json({
                    mensaje:
                        "El docente seleccionado no existe o se encuentra inactivo."
                });

            }


            // --------------------------------------------------
            // ACTUALIZAR
            // --------------------------------------------------

            const sql = `
                UPDATE cursos

                SET
                    id_docente = ?,
                    codigo = ?,
                    nombre = ?,
                    semestre = ?,
                    descripcion = ?,
                    estado = ?

                WHERE id_curso = ?
            `;


            conexion.query(
                sql,
                [
                    id_docente,
                    codigo.toUpperCase(),
                    nombre,
                    semestre,
                    descripcion,
                    estado,
                    idCurso
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            "Error al actualizar curso:",
                            error
                        );


                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {

                            return res.status(409).json({
                                mensaje:
                                    "Otro curso ya utiliza ese código."
                            });

                        }


                        return res.status(500).json({
                            mensaje:
                                "Error al actualizar el curso."
                        });

                    }


                    if (
                        resultado.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            mensaje:
                                "Curso no encontrado."
                        });

                    }


                    res.json({
                        mensaje:
                            "Curso actualizado correctamente."
                    });

                }
            );

        }
    );

});


// ======================================================
// 4. ELIMINAR CURSO
// ======================================================

router.delete("/:id", (req, res) => {

    const idCurso =
        req.params.id;


    const sql = `
        DELETE FROM cursos
        WHERE id_curso = ?
    `;


    conexion.query(
        sql,
        [idCurso],
        (error, resultado) => {

            if (error) {

                console.error(
                    "Error al eliminar curso:",
                    error
                );


                if (
                    error.code ===
                    "ER_ROW_IS_REFERENCED_2"
                ) {

                    return res.status(409).json({
                        mensaje:
                            "No se puede eliminar este curso porque tiene actividades, materiales, proyectos u otra información relacionada. Puede cambiar su estado a Inactivo."
                    });

                }


                return res.status(500).json({
                    mensaje:
                        "Error al eliminar el curso."
                });

            }


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Curso no encontrado."
                });

            }


            res.json({
                mensaje:
                    "Curso eliminado correctamente."
            });

        }
    );

});


module.exports = router;