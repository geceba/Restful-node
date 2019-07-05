var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var app = express();

var Usuario = require('../models/usuario');

// google
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

//================================
// autenticación google
//================================
async function verify(token) {
	var ticket = await client.verifyIdToken({
		idToken: token,
		audience: GOOGLE_CLIENT_ID
	});

	var payload = ticket.getPayload();

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	};
}
app.post('/google', async (req, res) => {
	var token = req.body.token;

	try {
		var googleUser = await verify(token);
	} catch (error) {
		res.status(403).json({
			ok: false,
			mensaje: 'Token de google inválido',
			errors: { message: 'Token de google inválido' }
		});
		return;
	}

	Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario'
			});
		}

		if (usuarioDB) {
			if (usuarioDB.google === false) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Debe de usar su autenticación normal'
				});
			} else {
				var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

				res.status(200).json({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB.id
				});
			}
		} else {
            // el usuario no existe... crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

           
            usuario.save((err, usuarioDB) => {
                
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
                
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });

            });


        }
	});

	// return res.status(200).json({
	// 	ok: true,
	// 	mensaje: 'OK',
	// 	googleUser: googleUser
	// });
});

//================================
// autenticación normal
//================================
app.post('/', (req, res) => {
	var body = req.body;

	Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario',
				errors: err
			});
		}

		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - email',
				errors: err
			});
		}

		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - password',
				errors: err
			});
		}

		// crear token
		usuarioDB.password = ':)';
		var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB.id
		});
	});
});

module.exports = app;
