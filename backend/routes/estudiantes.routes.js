const express = require("express");
const bcrypt = require("bcryptjs");
const conexion = require("../config/database");

const router = express.Router();


// ======================================================
// 1. LISTAR ESTUDIANTES
// ======================================================

router.get("/", (req, res) => {

    const sql = `
        SELECT
            e.id_estudiante,
            e.codigo,
            e.dni,
            e.nombres,
            e.apellidos,
            e.correo_institucional AS correo,
            e.telefono,
            e.semestre,
            e.estado,
            u.usuario,
            u.rol

        FROM estudiantes e

        INNER JOIN usuarios u
            ON e.id_usuario = u.id_usuario

        ORDER BY e.id_estudiante DESC
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error("Error al listar estudiantes:", error);

            return res.status(500).json({
                mensaje: "Error al obtener los estudiantes."
            });
        }

        res.json(resultados);
    });
});


// ======================================================
// 2. REGISTRAR ESTUDIANTE
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
        semestre,
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
        !semestre ||
        !estado
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos obligatorios deben completarse."
        });
    }


    if (!/^\d{8}$/.test(dni)) {
        return res.status(400).json({
            mensaje: "El DNI debe contener exactamente 8 dígitos."
        });
    }


    if (!/^\d{9}$/.test(telefono)) {
        return res.status(400).json({
            mensaje: "El teléfono debe contener exactamente 9 dígitos."
        });
    }


    try {

        // --------------------------------------------------
        // PROTEGER CONTRASEÑA
        // --------------------------------------------------

        const contrasenaHash =
            await bcrypt.hash(contrasena, 10);


        // --------------------------------------------------
        // INICIAR TRANSACCIÓN
        // --------------------------------------------------

        conexion.beginTransaction((error) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    mensaje: "No se pudo iniciar el registro."
                });
            }


            // --------------------------------------------------
            // INSERTAR USUARIO
            // --------------------------------------------------

            const sqlUsuario = `
                INSERT INTO usuarios
                (
                    usuario,
                    contrasena,
                    rol,
                    estado
                )
                VALUES (?, ?, 'Estudiante', ?)
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

                            if (errorUsuario.code === "ER_DUP_ENTRY") {
                                return res.status(409).json({
                                    mensaje:
                                        "El usuario o correo institucional ya se encuentra registrado."
                                });
                            }

                            res.status(500).json({
                                mensaje:
                                    "Error al crear la cuenta del estudiante."
                            });
                        });
                    }


                    const idUsuario =
                        resultadoUsuario.insertId;


                    // --------------------------------------------------
                    // INSERTAR ESTUDIANTE
                    // --------------------------------------------------

                    const sqlEstudiante = `
                        INSERT INTO estudiantes
                        (
                            id_usuario,
                            codigo,
                            dni,
                            nombres,
                            apellidos,
                            correo_institucional,
                            telefono,
                            semestre,
                            estado
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    conexion.query(
                        sqlEstudiante,
                        [
                            idUsuario,
                            codigo,
                            dni,
                            nombres,
                            apellidos,
                            correo,
                            telefono,
                            semestre,
                            estado
                        ],
                        (errorEstudiante, resultadoEstudiante) => {

                            if (errorEstudiante) {

                                return conexion.rollback(() => {

                                    console.error(
                                        "Error al registrar estudiante:",
                                        errorEstudiante
                                    );

                                    if (
                                        errorEstudiante.code ===
                                        "ER_DUP_ENTRY"
                                    ) {
                                        return res.status(409).json({
                                            mensaje:
                                                "El código, DNI o correo ya se encuentra registrado."
                                        });
                                    }

                                    res.status(500).json({
                                        mensaje:
                                            "Error al registrar los datos del estudiante."
                                    });
                                });
                            }


                            // --------------------------------------------------
                            // CONFIRMAR TRANSACCIÓN
                            // --------------------------------------------------

                            conexion.commit((errorCommit) => {

                                if (errorCommit) {

                                    return conexion.rollback(() => {

                                        console.error(errorCommit);

                                        res.status(500).json({
                                            mensaje:
                                                "No se pudo completar el registro."
                                        });
                                    });
                                }


                                res.status(201).json({

                                    mensaje:
                                        "Estudiante registrado correctamente.",

                                    id_estudiante:
                                        resultadoEstudiante.insertId,

                                    usuario,

                                    contrasenaTemporal:
                                        contrasena
                                });
                            });
                        }
                    );
                }
            );
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error interno del servidor."
        });
    }
});


// ======================================================
// 3. ACTUALIZAR ESTUDIANTE
// ======================================================

router.put("/:id", (req, res) => {

    const idEstudiante = req.params.id;

    const {
        codigo,
        dni,
        nombres,
        apellidos,
        correo,
        usuario,
        telefono,
        semestre,
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
        !semestre ||
        !estado
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos obligatorios deben completarse."
        });
    }


    // --------------------------------------------------
    // BUSCAR id_usuario
    // --------------------------------------------------

    const buscar = `
        SELECT id_usuario
        FROM estudiantes
        WHERE id_estudiante = ?
    `;

    conexion.query(
        buscar,
        [idEstudiante],
        (errorBuscar, resultados) => {

            if (errorBuscar) {

                console.error(errorBuscar);

                return res.status(500).json({
                    mensaje: "Error al buscar el estudiante."
                });
            }


            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje: "Estudiante no encontrado."
                });
            }


            const idUsuario =
                resultados[0].id_usuario;


            conexion.beginTransaction((error) => {

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

                            return conexion.rollback(() => {

                                console.error(errorUsuario);

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
                            });
                        }


                        // --------------------------------------------------
                        // ACTUALIZAR ESTUDIANTE
                        // --------------------------------------------------

                        const sqlEstudiante = `
                            UPDATE estudiantes

                            SET
                                codigo = ?,
                                dni = ?,
                                nombres = ?,
                                apellidos = ?,
                                correo_institucional = ?,
                                telefono = ?,
                                semestre = ?,
                                estado = ?

                            WHERE id_estudiante = ?
                        `;

                        conexion.query(
                            sqlEstudiante,
                            [
                                codigo,
                                dni,
                                nombres,
                                apellidos,
                                correo,
                                telefono,
                                semestre,
                                estado,
                                idEstudiante
                            ],
                            (errorEstudiante) => {

                                if (errorEstudiante) {

                                    return conexion.rollback(() => {

                                        console.error(
                                            errorEstudiante
                                        );

                                        if (
                                            errorEstudiante.code ===
                                            "ER_DUP_ENTRY"
                                        ) {
                                            return res.status(409).json({
                                                mensaje:
                                                    "El código, DNI o correo ya pertenece a otro estudiante."
                                            });
                                        }

                                        res.status(500).json({
                                            mensaje:
                                                "Error al actualizar el estudiante."
                                        });
                                    });
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
                                                "Estudiante actualizado correctamente."
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    );
});


// ======================================================
// 4. RESTABLECER CONTRASEÑA
// ======================================================

router.put(
    "/:id/contrasena",
    async (req, res) => {

        const idEstudiante =
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

                INNER JOIN estudiantes e
                    ON u.id_usuario = e.id_usuario

                SET u.contrasena = ?

                WHERE e.id_estudiante = ?
            `;


            conexion.query(
                sql,
                [
                    hash,
                    idEstudiante
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(error);

                        return res.status(500).json({
                            mensaje:
                                "Error al restablecer la contraseña."
                        });
                    }


                    if (resultado.affectedRows === 0) {

                        return res.status(404).json({
                            mensaje:
                                "Estudiante no encontrado."
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
// 5. ELIMINAR ESTUDIANTE
// ======================================================

router.delete("/:id", (req, res) => {

    const idEstudiante =
        req.params.id;


    // --------------------------------------------------
    // OBTENER USUARIO RELACIONADO
    // --------------------------------------------------

    const buscar = `
        SELECT id_usuario
        FROM estudiantes
        WHERE id_estudiante = ?
    `;


    conexion.query(
        buscar,
        [idEstudiante],
        (errorBuscar, resultados) => {

            if (errorBuscar) {

                console.error(errorBuscar);

                return res.status(500).json({
                    mensaje:
                        "Error al buscar el estudiante."
                });
            }


            if (resultados.length === 0) {

                return res.status(404).json({
                    mensaje:
                        "Estudiante no encontrado."
                });
            }


            const idUsuario =
                resultados[0].id_usuario;


            /*
             * Como estudiantes.id_usuario tiene
             * ON DELETE CASCADE, al eliminar el usuario
             * también se eliminará el estudiante.
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

                        console.error(errorEliminar);

                        return res.status(500).json({
                            mensaje:
                                "No se pudo eliminar el estudiante. Puede tener información relacionada."
                        });
                    }


                    res.json({
                        mensaje:
                            "Estudiante eliminado correctamente."
                    });
                }
            );
        }
    );
});


module.exports = router;