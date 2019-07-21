var express = require('express');
var mdAuth = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//obtener hospitales
app.get('/', (req, res) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({}).skip(desde).limit(5).populate('usuario', 'nombre email').exec((err, hospitales) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo cargar hospitales',
				errros: err
			});
		}

		Hospital.count({}, (err, count) => {
			res.status(200).json({
				ok: true,
				hospitales: hospitales,
				total: count
			});
		});
	});
});

// obtener hospitales por id
app.get('/:id', (req, res) => {
	var id = req.params.id;
	Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}

		if (!hospital) {
			return res.status(400).json({
				ok: false,
				mensaje: `'El hospital con el id ${id} no existe`,
				errors: {
					message: ' No existe hospital con ese id'
				}
			});
		}

		res.status(200).json({
			ok: true,
			hospital: hospital
		});
	});
});

// actualizar hospital

app.put('/:id', mdAuth.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Hospital.findById(id, (err, hospital) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo buscar el hospital',
				errros: err
			});
		}

		if (!hospital) {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: el hospital con el id: ' + id + ' no existe',
					errros: { message: 'no existe hospital con ese id' }
				});
			}
		}

		hospital.nombre = body.nombre;
		hospital;

		hospital.save((err, hospitalGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: no se pudo actualizar el hospital',
					errros: err
				});
			}

			res.status(200).json({
				ok: true,
				usuario: hospitalGuardado
			});
		});
	});
});

//crear hospital

app.post('/', mdAuth.verificaToken, (req, res) => {
	var body = req.body;

	var hospital = new Hospital({
		nombre: body.nombre,
		img: body.img,
		usuario: req.usuario._id // obtener el usuario por medio del request
	});

	hospital.save((err, hospitalGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no se pudo crear el hospital',
				errros: err
			});
		}

		res.status(201).json({
			hospital: hospitalGuardado
		});
	});
});

// eliminar hospital
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
	console.log('request', req);

	var id = req.params.id;

	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo borrar el hospital',
				errros: err
			});
		}

		if (!hospitalBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no existe hospital con ese id',
				errros: { message: 'no existe hospital con ese id' }
			});
		}

		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado
		});
	});
});

module.exports = app;
