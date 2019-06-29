var express = require('express');
const bcrypt = require('bcrypt');

var mdAuth = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// obtener todos los usuarios

app.get('/', (req, res, next) => {

	var desde = req.query.desde || 0;
	desde = Number(desde);

	Usuario.find({}, 'nombre email img role')
	.skip(desde)
	.limit(5)
	.exec((err, usuarios) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error cargando usuario',
				errros: err
			});
		}

		Usuario.count({}, (err, count) => {
			res.status(200).json({
				ok: true,
				usuarios: usuarios,
				total: count
			});
		});

	});
});


// crear un nuevo usuario

app.post('/', mdAuth.verificaToken, (req, res) => {
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
			usuario: usuarioGuardado,
			usuariotoken: req.usuario 
		});
	});
});

// actualizar usuario

app.put('/:id', mdAuth.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Usuario.findById(id, (err, usuario) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo buscar el usuario',
				errros: err
			});
		}

		if (!usuario) {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: el usuario con el id: ' + id + ' no existe',
					errros: { message: 'no existe usuario con ese id' }
				});
			}
		}

		usuario.nombre = body.nombre;
		usuario.email = body.email;
		usuario.role = body.role;

		usuario.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error: no se pudo actualizar el usuario',
					errros: err
				});
			}

			res.status(200).json({
				ok: true,
				usuario: usuarioGuardado
			});
		});
	});
});

// delete 
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
	var id = req.params.id;

	Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error: no se pudo borrar el usuario',
				errros: err
			});
		}

		if (!usuarioBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error: no existe usuario con ese id',
				errros: { message: 'no existe usuario con ese id' }
			});
		}

		res.status(200).json({
			ok: true,
			usuario: usuarioBorrado
		});
	});

})

module.exports = app;
