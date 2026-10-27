const express = require("express");
const conexion = require("../config/database");

const router = express.Router();


// ======================================================
// LISTAR PROYECTOS
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            p.id_proyecto,
            p.id_curso,
            p.id_docente,
            p.codigo,
            p.titulo,
            p.descripcion,
            p.enlace,
            p.estado,

            c.nombre AS curso,
            c.semestre,

            CONCAT(
                d.nombres,
                ' ',
                d.apellidos
            ) AS docente,

            GROUP_CONCAT(
                DISTINCT CONCAT(
                    e.nombres,
                    ' ',
                    e.apellidos
                )
                ORDER BY e.apellidos, e.nombres
                SEPARATOR ', '
            ) AS integrantes,

            GROUP_CONCAT(
                DISTINCT e.id_estudiante
                ORDER BY e.id_estudiante
                SEPARATOR ','
            ) AS ids_integrantes

        FROM proyectos p

        INNER JOIN cursos c
            ON p.id_curso = c.id_curso

        INNER JOIN docentes d
            ON p.id_docente = d.id_docente

        LEFT JOIN proyecto_integrantes pi
            ON p.id_proyecto = pi.id_proyecto

        LEFT JOIN estudiantes e
            ON pi.id_estudiante = e.id_estudiante

        GROUP BY
            p.id_proyecto,
            p.id_curso,
            p.id_docente,
            p.codigo,
            p.titulo,
            p.descripcion,
            p.enlace,
            p.estado,
            c.nombre,
            c.semestre,
            d.nombres,
            d.apellidos

        ORDER BY p.id_proyecto DESC
    `;


    conexion.query(
        sql,
        (error, resultados) => {

            if (error) {

                console.error(
                    "Error al listar proyectos:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al obtener los proyectos."
                });
            }


            const proyectos =
                resultados.map(
                    proyecto => ({

                        ...proyecto,

                        ids_integrantes:
                            proyecto.ids_integrantes
                                ? proyecto.ids_integrantes
                                    .split(",")
                                    .map(Number)
                                : []

                    })
                );


            res.json(proyectos);

        }
    );

});


// ======================================================
// REGISTRAR PROYECTO
// ======================================================

router.post("/", (req, res) => {

    const {
        id_curso,
        codigo,
        titulo,
        descripcion,
        enlace,
        estado,
        integrantes
    } = req.body;


    if (
        !id_curso ||
        !codigo ||
        !titulo ||
        !descripcion ||
        !estado ||
        !Array.isArray(integrantes) ||
        integrantes.length === 0
    ) {

        return res.status(400).json({
            mensaje:
                "Complete todos los campos obligatorios y seleccione al menos un integrante."
        });
    }


    // Obtener docente y semestre directamente del curso.

    const sqlCurso = `
        SELECT
            id_curso,
            id_docente,
            semestre
        FROM cursos
        WHERE
            id_curso = ?
            AND estado = 'Activo'
    `;


    conexion.query(
        sqlCurso,
        [id_curso],
        (errorCurso, cursos) => {

            if (errorCurso) {

                console.error(errorCurso);

                return res.status(500).json({
                    mensaje:
                        "Error al verificar el curso."
                });
            }


            if (cursos.length === 0) {

                return res.status(400).json({
                    mensaje:
                        "El curso seleccionado no existe o se encuentra inactivo."
                });
            }


            const curso =
                cursos[0];


            // Verificar estudiantes activos y del mismo semestre.

            const placeholders =
                integrantes
                    .map(() => "?")
                    .join(",");


            const sqlEstudiantes = `
                SELECT id_estudiante
                FROM estudiantes
                WHERE
                    id_estudiante IN (${placeholders})
                    AND estado = 'Activo'
                    AND semestre = ?
            `;


            conexion.query(
                sqlEstudiantes,
                [
                    ...integrantes,
                    curso.semestre
                ],
                (errorEstudiantes, estudiantes) => {

                    if (errorEstudiantes) {

                        console.error(
                            errorEstudiantes
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al verificar los integrantes."
                        });
                    }


                    if (
                        estudiantes.length !==
                        integrantes.length
                    ) {

                        return res.status(400).json({
                            mensaje:
                                "Todos los integrantes deben ser estudiantes activos del mismo semestre del curso."
                        });
                    }


                    conexion.beginTransaction(
                        errorTransaccion => {

                            if (errorTransaccion) {

                                return res.status(500).json({
                                    mensaje:
                                        "No se pudo iniciar el registro."
                                });
                            }


                            const sqlProyecto = `
                                INSERT INTO proyectos
                                (
                                    id_curso,
                                    id_docente,
                                    codigo,
                                    titulo,
                                    descripcion,
                                    enlace,
                                    estado
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `;


                            conexion.query(
                                sqlProyecto,
                                [
                                    curso.id_curso,
                                    curso.id_docente,
                                    codigo.toUpperCase(),
                                    titulo,
                                    descripcion,
                                    enlace || null,
                                    estado
                                ],
                                (
                                    errorProyecto,
                                    resultadoProyecto
                                ) => {

                                    if (errorProyecto) {

                                        return conexion.rollback(
                                            () => {

                                                console.error(
                                                    errorProyecto
                                                );


                                                if (
                                                    errorProyecto.code ===
                                                    "ER_DUP_ENTRY"
                                                ) {

                                                    return res.status(409).json({
                                                        mensaje:
                                                            "Ya existe un proyecto con ese código."
                                                    });
                                                }


                                                res.status(500).json({
                                                    mensaje:
                                                        "Error al registrar el proyecto."
                                                });
                                            }
                                        );
                                    }


                                    const idProyecto =
                                        resultadoProyecto.insertId;


                                    const valores =
                                        integrantes.map(
                                            idEstudiante => [
                                                idProyecto,
                                                idEstudiante
                                            ]
                                        );


                                    const sqlIntegrantes = `
                                        INSERT INTO proyecto_integrantes
                                        (
                                            id_proyecto,
                                            id_estudiante
                                        )
                                        VALUES ?
                                    `;


                                    conexion.query(
                                        sqlIntegrantes,
                                        [valores],
                                        errorIntegrantes => {

                                            if (errorIntegrantes) {

                                                return conexion.rollback(
                                                    () => {

                                                        console.error(
                                                            errorIntegrantes
                                                        );

                                                        res.status(500).json({
                                                            mensaje:
                                                                "Error al asignar los integrantes."
                                                        });
                                                    }
                                                );
                                            }


                                            conexion.commit(
                                                errorCommit => {

                                                    if (errorCommit) {

                                                        return conexion.rollback(
                                                            () => {

                                                                console.error(
                                                                    errorCommit
                                                                );

                                                                res.status(500).json({
                                                                    mensaje:
                                                                        "No se pudo completar el registro."
                                                                });
                                                            }
                                                        );
                                                    }


                                                    res.status(201).json({
                                                        mensaje:
                                                            "Proyecto registrado correctamente.",
                                                        id_proyecto:
                                                            idProyecto
                                                    });

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// ======================================================
// ACTUALIZAR PROYECTO
// ======================================================

router.put("/:id", (req, res) => {

    const idProyecto =
        req.params.id;


    const {
        id_curso,
        codigo,
        titulo,
        descripcion,
        enlace,
        estado,
        integrantes
    } = req.body;


    if (
        !id_curso ||
        !codigo ||
        !titulo ||
        !descripcion ||
        !estado ||
        !Array.isArray(integrantes) ||
        integrantes.length === 0
    ) {

        return res.status(400).json({
            mensaje:
                "Complete todos los campos obligatorios y seleccione al menos un integrante."
        });
    }


    const sqlCurso = `
        SELECT
            id_curso,
            id_docente,
            semestre
        FROM cursos
        WHERE
            id_curso = ?
            AND estado = 'Activo'
    `;


    conexion.query(
        sqlCurso,
        [id_curso],
        (errorCurso, cursos) => {

            if (errorCurso) {

                return res.status(500).json({
                    mensaje:
                        "Error al verificar el curso."
                });
            }


            if (cursos.length === 0) {

                return res.status(400).json({
                    mensaje:
                        "El curso seleccionado no existe o está inactivo."
                });
            }


            const curso =
                cursos[0];


            const placeholders =
                integrantes
                    .map(() => "?")
                    .join(",");


            const sqlEstudiantes = `
                SELECT id_estudiante
                FROM estudiantes
                WHERE
                    id_estudiante IN (${placeholders})
                    AND estado = 'Activo'
                    AND semestre = ?
            `;


            conexion.query(
                sqlEstudiantes,
                [
                    ...integrantes,
                    curso.semestre
                ],
                (
                    errorEstudiantes,
                    estudiantes
                ) => {

                    if (errorEstudiantes) {

                        return res.status(500).json({
                            mensaje:
                                "Error al verificar los integrantes."
                        });
                    }


                    if (
                        estudiantes.length !==
                        integrantes.length
                    ) {

                        return res.status(400).json({
                            mensaje:
                                "Todos los integrantes deben pertenecer al semestre del curso."
                        });
                    }


                    conexion.beginTransaction(
                        error => {

                            if (error) {

                                return res.status(500).json({
                                    mensaje:
                                        "No se pudo iniciar la actualización."
                                });
                            }


                            const sqlProyecto = `
                                UPDATE proyectos

                                SET
                                    id_curso = ?,
                                    id_docente = ?,
                                    codigo = ?,
                                    titulo = ?,
                                    descripcion = ?,
                                    enlace = ?,
                                    estado = ?

                                WHERE id_proyecto = ?
                            `;


                            conexion.query(
                                sqlProyecto,
                                [
                                    curso.id_curso,
                                    curso.id_docente,
                                    codigo.toUpperCase(),
                                    titulo,
                                    descripcion,
                                    enlace || null,
                                    estado,
                                    idProyecto
                                ],
                                (
                                    errorProyecto,
                                    resultadoProyecto
                                ) => {

                                    if (errorProyecto) {

                                        return conexion.rollback(
                                            () => {

                                                if (
                                                    errorProyecto.code ===
                                                    "ER_DUP_ENTRY"
                                                ) {

                                                    return res.status(409).json({
                                                        mensaje:
                                                            "Otro proyecto ya utiliza ese código."
                                                    });
                                                }


                                                console.error(
                                                    errorProyecto
                                                );

                                                res.status(500).json({
                                                    mensaje:
                                                        "Error al actualizar el proyecto."
                                                });
                                            }
                                        );
                                    }


                                    if (
                                        resultadoProyecto.affectedRows === 0
                                    ) {

                                        return conexion.rollback(
                                            () => {

                                                res.status(404).json({
                                                    mensaje:
                                                        "Proyecto no encontrado."
                                                });

                                            }
                                        );
                                    }


                                    const borrar = `
                                        DELETE FROM proyecto_integrantes
                                        WHERE id_proyecto = ?
                                    `;


                                    conexion.query(
                                        borrar,
                                        [idProyecto],
                                        errorBorrar => {

                                            if (errorBorrar) {

                                                return conexion.rollback(
                                                    () => {

                                                        console.error(
                                                            errorBorrar
                                                        );

                                                        res.status(500).json({
                                                            mensaje:
                                                                "Error al actualizar los integrantes."
                                                        });
                                                    }
                                                );
                                            }


                                            const valores =
                                                integrantes.map(
                                                    idEstudiante => [
                                                        idProyecto,
                                                        idEstudiante
                                                    ]
                                                );


                                            const insertar = `
                                                INSERT INTO proyecto_integrantes
                                                (
                                                    id_proyecto,
                                                    id_estudiante
                                                )
                                                VALUES ?
                                            `;


                                            conexion.query(
                                                insertar,
                                                [valores],
                                                errorInsertar => {

                                                    if (errorInsertar) {

                                                        return conexion.rollback(
                                                            () => {

                                                                console.error(
                                                                    errorInsertar
                                                                );

                                                                res.status(500).json({
                                                                    mensaje:
                                                                        "Error al guardar los integrantes."
                                                                });
                                                            }
                                                        );
                                                    }


                                                    conexion.commit(
                                                        errorCommit => {

                                                            if (errorCommit) {

                                                                return conexion.rollback(
                                                                    () => {

                                                                        res.status(500).json({
                                                                            mensaje:
                                                                                "No se pudo completar la actualización."
                                                                        });

                                                                    }
                                                                );
                                                            }


                                                            res.json({
                                                                mensaje:
                                                                    "Proyecto actualizado correctamente."
                                                            });

                                                        }
                                                    );

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// ======================================================
// ELIMINAR PROYECTO
// ======================================================

router.delete("/:id", (req, res) => {

    const idProyecto =
        req.params.id;


    /*
        proyecto_integrantes tiene ON DELETE CASCADE,
        por lo que al borrar el proyecto también se
        eliminan automáticamente sus relaciones.
    */

    const sql = `
        DELETE FROM proyectos
        WHERE id_proyecto = ?
    `;


    conexion.query(
        sql,
        [idProyecto],
        (error, resultado) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje:
                        "Error al eliminar el proyecto."
                });
            }


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    mensaje:
                        "Proyecto no encontrado."
                });
            }


            res.json({
                mensaje:
                    "Proyecto eliminado correctamente."
            });

        }
    );

});


module.exports = router;