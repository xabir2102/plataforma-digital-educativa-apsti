const express = require("express");
const bcrypt = require("bcryptjs");
const conexion = require("../config/database");

const router = express.Router();


// ======================================================
// 1. LISTAR DOCENTES
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            d.id_docente,
            d.codigo,
            d.dni,
            d.nombres,
            d.apellidos,
            d.correo_institucional AS correo,
            d.telefono,
            d.especialidad,
            d.estado,
            u.usuario,
            u.rol

        FROM docentes d

        INNER JOIN usuarios u
            ON d.id_usuario = u.id_usuario

        ORDER BY d.id_docente DESC
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {

            console.error(
                "Error al listar docentes:",
                error
            );

            return res.status(500).json({
                mensaje:
                    "Error al obtener los docentes."
            });
        }

        res.json(resultados);
    });
});


// ======================================================
// 2. REGISTRAR DOCENTE
// ======================================================

router.post("/", async (req, res) => {

    const {
        codigo,
        dni,
        nombres,
        apellidos,
        correo,
        usuario,
        contrasena,
        telefono,
        especialidad,
        estado
    } = req.body;


    // --------------------------------------------------
    // VALIDAR CAMPOS
    // --------------------------------------------------

    if (
        !codigo ||
        !dni ||
        !nombres ||
        !apellidos ||
        !correo ||
        !usuario ||
        !contrasena ||
        !telefono ||
        !especialidad ||
        !estado
    ) {

        return res.status(400).json({
            mensaje:
                "Todos los campos obligatorios deben completarse."
        });
    }


    if (!/^\d{8}$/.test(dni)) {

        return res.status(400).json({
            mensaje:
                "El DNI debe contener exactamente 8 dígitos."
        });
    }


    if (!/^\d{9}$/.test(telefono)) {

        return res.status(400).json({
            mensaje:
                "El teléfono debe contener exactamente 9 dígitos."
        });
    }


    try {

        const contrasenaHash =
            await bcrypt.hash(
                contrasena,
                10
            );


        // --------------------------------------------------
        // INICIAR TRANSACCIÓN
        // --------------------------------------------------

        conexion.beginTransaction((error) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje:
                        "No se pudo iniciar el registro."
                });
            }


            // --------------------------------------------------
            // REGISTRAR CUENTA
            // --------------------------------------------------

            const sqlUsuario = `
                INSERT INTO usuarios
                (
                    usuario,
                    contrasena,
                    rol,
                    estado
                )
                VALUES (?, ?, 'Docente', ?)
            `;


            conexion.query(
                sqlUsuario,
                [
                    usuario,
                    contrasenaHash,
                    estado
                ],
                (errorUsuario, resultadoUsuario) => {

                    if (errorUsuario) {

                        return conexion.rollback(() => {

                            console.error(
                                "Error al registrar usuario:",
                                errorUsuario
                            );


                            if (
                                errorUsuario.code ===
                                "ER_DUP_ENTRY"
                            ) {

                                return res.status(409).json({
                                    mensaje:
                                        "El usuario o correo institucional ya se encuentra registrado."
                                });
                            }


                            res.status(500).json({
                                mensaje:
                                    "Error al crear la cuenta del docente."
                            });
                        });
                    }


                    const idUsuario =
                        resultadoUsuario.insertId;


                    // --------------------------------------------------
                    // REGISTRAR DOCENTE
                    // --------------------------------------------------

                    const sqlDocente = `
                        INSERT INTO docentes
                        (
                            id_usuario,
                            codigo,
                            dni,
                            nombres,
                            apellidos,
                            correo_institucional,
                            telefono,
                            especialidad,
                            estado
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;


                    conexion.query(
                        sqlDocente,
                        [
                            idUsuario,
                            codigo,
                            dni,
                            nombres,
                            apellidos,
                            correo,
                            telefono,
                            especialidad,
                            estado
                        ],
                        (
                            errorDocente,
                            resultadoDocente
                        ) => {

                            if (errorDocente) {

                                return conexion.rollback(() => {

                                    console.error(
                                        "Error al registrar docente:",
                                        errorDocente
                                    );


                                    if (
                                        errorDocente.code ===
                                        "ER_DUP_ENTRY"
                                    ) {

                                        return res.status(409).json({
                                            mensaje:
                                                "El código, DNI o correo ya se encuentra registrado."
                                        });
                                    }


                                    res.status(500).json({
                                        mensaje:
                                            "Error al registrar los datos del docente."
                                    });
                                });
                            }


                            // --------------------------------------------------
                            // CONFIRMAR TRANSACCIÓN
                            // --------------------------------------------------

                            conexion.commit(
                                (errorCommit) => {

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
                                            "Docente registrado correctamente.",

                                        id_docente:
                                            resultadoDocente.insertId,

                                        usuario,

                                        contrasenaTemporal:
                                            contrasena

                                    });
                                }
                            );
                        }
                    );
                }
            );
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje:
                "Error interno del servidor."
        });
    }
});


// ======================================================
// 3. ACTUALIZAR DOCENTE
// ======================================================

router.put("/:id", (req, res) => {

    const idDocente =
        req.params.id;


    const {
        codigo,
        dni,
        nombres,
        apellidos,
        correo,
        usuario,
        telefono,
        especialidad,
        estado
    } = req.body;


    if (
        !codigo ||
        !dni ||
        !nombres ||
        !apellidos ||
        !correo ||
        !usuario ||
        !telefono ||
        !especialidad ||
        !estado
    ) {

        return res.status(400).json({
            mensaje:
                "Todos los campos obligatorios deben completarse."
        });
    }


    // --------------------------------------------------
    // BUSCAR USUARIO RELACIONADO
    // --------------------------------------------------

    const buscar = `
        SELECT id_usuario
        FROM docentes
        WHERE id_docente = ?
    `;


    conexion.query(
        buscar,
        [idDocente],
        (errorBuscar, resultados) => {

            if (errorBuscar) {

                console.error(errorBuscar);

                return res.status(500).json({
                    mensaje:
                        "Error al buscar el docente."
                });
            }


            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje:
                        "Docente no encontrado."
                });
            }


            const idUsuario =
                resultados[0].id_usuario;


            conexion.beginTransaction(
                (error) => {

                    if (error) {

                        return res.status(500).json({
                            mensaje:
                                "No se pudo iniciar la actualización."
                        });
                    }


                    // --------------------------------------------------
                    // ACTUALIZAR USUARIO
                    // --------------------------------------------------

                    const sqlUsuario = `
                        UPDATE usuarios
                        SET
                            usuario = ?,
                            estado = ?
                        WHERE id_usuario = ?
                    `;


                    conexion.query(
                        sqlUsuario,
                        [
                            usuario,
                            estado,
                            idUsuario
                        ],
                        (errorUsuario) => {

                            if (errorUsuario) {

                                return conexion.rollback(
                                    () => {

                                        console.error(
                                            errorUsuario
                                        );


                                        if (
                                            errorUsuario.code ===
                                            "ER_DUP_ENTRY"
                                        ) {

                                            return res.status(409).json({
                                                mensaje:
                                                    "El usuario ya se encuentra registrado."
                                            });
                                        }


                                        res.status(500).json({
                                            mensaje:
                                                "Error al actualizar el usuario."
                                        });
                                    }
                                );
                            }


                            // --------------------------------------------------
                            // ACTUALIZAR DOCENTE
                            // --------------------------------------------------

                            const sqlDocente = `
                                UPDATE docentes

                                SET
                                    codigo = ?,
                                    dni = ?,
                                    nombres = ?,
                                    apellidos = ?,
                                    correo_institucional = ?,
                                    telefono = ?,
                                    especialidad = ?,
                                    estado = ?

                                WHERE id_docente = ?
                            `;


                            conexion.query(
                                sqlDocente,
                                [
                                    codigo,
                                    dni,
                                    nombres,
                                    apellidos,
                                    correo,
                                    telefono,
                                    especialidad,
                                    estado,
                                    idDocente
                                ],
                                (errorDocente) => {

                                    if (errorDocente) {

                                        return conexion.rollback(
                                            () => {

                                                console.error(
                                                    errorDocente
                                                );


                                                if (
                                                    errorDocente.code ===
                                                    "ER_DUP_ENTRY"
                                                ) {

                                                    return res.status(409).json({
                                                        mensaje:
                                                            "El código, DNI o correo ya pertenece a otro docente."
                                                    });
                                                }


                                                res.status(500).json({
                                                    mensaje:
                                                        "Error al actualizar el docente."
                                                });
                                            }
                                        );
                                    }


                                    conexion.commit(
                                        (errorCommit) => {

                                            if (errorCommit) {

                                                return conexion.rollback(
                                                    () => {

                                                        console.error(
                                                            errorCommit
                                                        );

                                                        res.status(500).json({
                                                            mensaje:
                                                                "No se pudo completar la actualización."
                                                        });
                                                    }
                                                );
                                            }


                                            res.json({
                                                mensaje:
                                                    "Docente actualizado correctamente."
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
});


// ======================================================
// 4. RESTABLECER CONTRASEÑA
// ======================================================

router.put(
    "/:id/contrasena",
    async (req, res) => {

        const idDocente =
            req.params.id;


        const {
            nuevaContrasena
        } = req.body;


        if (!nuevaContrasena) {

            return res.status(400).json({
                mensaje:
                    "Debe proporcionar la nueva contraseña."
            });
        }


        try {

            const hash =
                await bcrypt.hash(
                    nuevaContrasena,
                    10
                );


            const sql = `
                UPDATE usuarios u

                INNER JOIN docentes d
                    ON u.id_usuario = d.id_usuario

                SET u.contrasena = ?

                WHERE d.id_docente = ?
            `;


            conexion.query(
                sql,
                [
                    hash,
                    idDocente
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(error);

                        return res.status(500).json({
                            mensaje:
                                "Error al restablecer la contraseña."
                        });
                    }


                    if (
                        resultado.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            mensaje:
                                "Docente no encontrado."
                        });
                    }


                    res.json({
                        mensaje:
                            "Contraseña restablecida correctamente."
                    });
                }
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje:
                    "Error interno del servidor."
            });
        }
    }
);


// ======================================================
// 5. ELIMINAR DOCENTE
// ======================================================

router.delete("/:id", (req, res) => {

    const idDocente =
        req.params.id;


    const buscar = `
        SELECT id_usuario
        FROM docentes
        WHERE id_docente = ?
    `;


    conexion.query(
        buscar,
        [idDocente],
        (errorBuscar, resultados) => {

            if (errorBuscar) {

                console.error(errorBuscar);

                return res.status(500).json({
                    mensaje:
                        "Error al buscar el docente."
                });
            }


            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje:
                        "Docente no encontrado."
                });
            }


            const idUsuario =
                resultados[0].id_usuario;


            /*
             * docentes.id_usuario tiene
             * ON DELETE CASCADE.
             *
             * Si el docente ya está relacionado
             * con cursos, proyectos u otros registros,
             * MySQL puede impedir su eliminación.
             */


            const sql = `
                DELETE FROM usuarios
                WHERE id_usuario = ?
            `;


            conexion.query(
                sql,
                [idUsuario],
                (errorEliminar) => {

                    if (errorEliminar) {

                        console.error(
                            errorEliminar
                        );


                        if (
                            errorEliminar.code ===
                            "ER_ROW_IS_REFERENCED_2"
                        ) {

                            return res.status(409).json({
                                mensaje:
                                    "No se puede eliminar este docente porque tiene cursos, proyectos u otra información relacionada. Puede cambiar su estado a Inactivo."
                            });
                        }


                        return res.status(500).json({
                            mensaje:
                                "No se pudo eliminar el docente."
                        });
                    }


                    res.json({
                        mensaje:
                            "Docente eliminado correctamente."
                    });
                }
            );
        }
    );
});


module.exports = router;

