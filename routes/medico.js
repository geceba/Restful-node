var express = require('express');
var mdAuth = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//obtener medicos
app.get('/', (req, res) => {
	

	Medico.find({})
	.populate('usuario', 'nombre email')
	.populate('hospital')
	.exec((err, medicos) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo cargar medicos',
				errros: err
			});
		}

		res.status(200).json({
			ok: true,
			medicos: medicos
		});
	});
});

// actualizar medico

app.put('/:id', mdAuth.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo buscar el medico',
				erros: err
			});
		}

		if (!medico) {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: el medico con el id: ' + id + ' no existe',
					erros: { message: 'no existe medico con ese id' }
				});
			}
		}

		medico.nombre = body.nombre;
		medico.usuario = req.usuario._id;
		medico.hospital = body.hospital;
	

		medico.save((err, medicoGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: no se pudo actualizar el medico',
					erros: err
				});
			}

			res.status(200).json({
				ok: true,
				medico: medicoGuardado
			});
		});
	});
});

//crear medico

app.post('/', mdAuth.verificaToken, (req, res) => {
	var body = req.body;

    console.log("body", body)
	var medico = new Medico({
		nombre: body.nombre,
        usuario: req.usuario._id, // obtener el usuario por medio del request
        hospital: body.hospital
	});

	medico.save((err, medicoGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no se pudo crear el medico',
				erros: err
			});
		}

		res.status(201).json({
			medico: medicoGuardado
		});
	});
});

// eliminar medico
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
	console.log('request', req);

	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo borrar el medico',
				errros: err
			});
		}

		if (!medicoBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no existe medico con ese id',
				errros: { message: 'no existe medico con ese id' }
			});
		}

		res.status(200).json({
			ok: true,
			medico: medicoBorrado
		});
	});
});

module.exports = app;
