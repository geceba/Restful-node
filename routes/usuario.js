var express = require('express');
const bcrypt = require('bcrypt');
var app = express();

var Usuario = require('../models/usuario');

// obtener todos los usuarios

app.get('/', (req, res, next) => {
	Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando usuario',
				errros: err
			});
		}

		res.status(200).json({
			ok: true,
			usuarios: usuarios
		});
	});
});

// crear un nuevo usuario

app.post('/', (req, res) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role
	});

	usuario.save((err, usuarioGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no se pudo crear el usuario',
				errros: err
			});
		}

		res.status(201).json({
			ok: true,
			usuario: usuarioGuardado
		});
	});
});

module.exports = app;
