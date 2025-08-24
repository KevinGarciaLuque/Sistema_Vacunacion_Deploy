// routes/vacunas_aplicadas.js

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const moment = require('moment');

// ✅ Obtener todas las vacunas aplicadas con filtros y paginación
router.get('/', async (req, res) => {
    try {
        const { desde, hasta, usuario_id, page = 1, limit = 100 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT va.id, u.nombre_completo, va.vacuna, va.fecha_aplicacion, va.dosis, va.lote,
                   va.responsable, va.observaciones, va.via_administracion, va.sitio_aplicacion
            FROM vacunas_aplicadas va
            LEFT JOIN usuarios u ON va.usuario_id = u.id
            WHERE 1 = 1
        `;
        const params = [];

        if (desde && hasta) {
            const hastaFinDia = moment(hasta).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            query += ' AND va.fecha_aplicacion BETWEEN ? AND ?';
            params.push(desde, hastaFinDia);
        }
        if (usuario_id) {
            query += ' AND va.usuario_id = ?';
            params.push(usuario_id);
        }

        query += ' ORDER BY va.fecha_aplicacion DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error en GET /api/vacunas_aplicadas:', error.message);
        res.status(500).json({ error: 'Error al obtener vacunas aplicadas' });
    }
});

// ✅ Registrar una vacuna aplicada en la tabla real
router.post('/',
    [
        body('usuario_id').isInt().withMessage('usuario_id debe ser un número entero'),
        body('vacuna').notEmpty().withMessage('La vacuna es requerida'),
        body('fecha_aplicacion').isDate().withMessage('La fecha de aplicación debe ser una fecha válida'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const {
                usuario_id,
                vacuna,
                fecha_aplicacion,
                dosis,
                lote,
                responsable,
                observaciones,
                via_administracion,
                sitio_aplicacion
            } = req.body;

            const [result] = await db.query(`
                INSERT INTO vacunas_aplicadas 
                (usuario_id, vacuna, fecha_aplicacion, dosis, lote, responsable, observaciones, via_administracion, sitio_aplicacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [usuario_id, vacuna, fecha_aplicacion, dosis, lote, responsable, observaciones, via_administracion, sitio_aplicacion]);

            // ✅ Registrar en bitácora
            await db.query(`
                INSERT INTO bitacora (usuario_id, accion, realizado_por) 
                VALUES (?, ?, ?)
            `, [usuario_id, `Aplicación de vacuna ${vacuna}`, responsable || 'Sistema']);

            res.json({ id: result.insertId, message: '✅ Vacuna aplicada registrada correctamente' });
        } catch (error) {
            console.error('❌ Error en POST /api/vacunas_aplicadas:', error.message);
            res.status(500).json({ error: 'Error al registrar la vacuna aplicada' });
        }
    }
);

// ✅ Editar vacuna aplicada
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vacuna,
            fecha_aplicacion,
            dosis,
            lote,
            responsable,
            observaciones,
            via_administracion,
            sitio_aplicacion
        } = req.body;

        const [result] = await db.query(`
            UPDATE vacunas_aplicadas
            SET vacuna = ?, fecha_aplicacion = ?, dosis = ?, lote = ?, responsable = ?, observaciones = ?, via_administracion = ?, sitio_aplicacion = ?
            WHERE id = ?
        `, [vacuna, fecha_aplicacion, dosis, lote, responsable, observaciones, via_administracion, sitio_aplicacion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vacuna aplicada no encontrada' });
        }

        res.json({ message: '✅ Vacuna aplicada actualizada correctamente' });
    } catch (error) {
        console.error('❌ Error en PUT /api/vacunas_aplicadas:', error.message);
        res.status(500).json({ error: 'Error al actualizar la vacuna aplicada' });
    }
});

// ✅ Eliminar vacuna aplicada
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM vacunas_aplicadas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vacuna aplicada no encontrada' });
        }

        res.json({ message: '✅ Vacuna aplicada eliminada correctamente' });
    } catch (error) {
        console.error('❌ Error en DELETE /api/vacunas_aplicadas:', error.message);
        res.status(500).json({ error: 'Error al eliminar la vacuna aplicada' });
    }
});

module.exports = router;
