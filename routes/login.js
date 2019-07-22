let express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let SEED = require('../config/config').SEED;
let app = express();

let Usuario = require('../models/usuario');

// google
let GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
let GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

let mdAuth = require('../middlewares/autenticacion');
app.get('/renuevatoken', mdAuth.verificaToken, (req, res) => {

	let token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });

	res.status(200).json({
		ok: true,
		token: token
	});

});

//================================
// autenticación google
//================================
async function verify(token) {
	let ticket = await client.verifyIdToken({
		idToken: token,
		audience: GOOGLE_CLIENT_ID
	});

	let payload = ticket.getPayload();

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	};
}
app.post('/google', async (req, res) => {
	let token = req.body.token;

	try {
		let googleUser = await verify(token);
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
				let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

				res.status(200).json({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB.id,
					menu: obtenerMenu(usuarioDB.role)
				});
			}
		} else {
			// el usuario no existe... crearlo
			let usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ':)';

			usuario.save((err, usuarioDB) => {
				let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas

				res.status(200).json({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB.id,
					menu: obtenerMenu(usuarioDB.role)
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
	let body = req.body;

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
		let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB.id,
			menu: obtenerMenu(usuarioDB.role)
		});
	});
});

function obtenerMenu(ROLE) {
	let menu = [
		{
			titulo: 'Principal',
			icono: 'mdi mdi-gauge',
			submenu: [
				{ titulo: 'Dashboard', url: '/dashboard' },
				{ titulo: 'ProgressBar', url: '/progress' },
				{ titulo: 'Promesas', url: '/promesas' },
				{ titulo: 'Gráficas', url: '/graficas1' },
				{ titulo: 'rxjs', url: '/rxjs' }
			]
		},
		{
			titulo: 'Mantenimientos',
			icono: 'mdi mdi-folder-lock-open',
			submenu: [
				// { titulo: 'Usuarios', url: '/usuarios' },
				{ titulo: 'Hospitales', url: '/hospitales' },
				{ titulo: 'Medicos', url: '/medicos' }
			]
		}
	];

	if(ROLE === 'ADMIN_ROLE') {
		menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' })
	}
	return menu;
}

module.exports = app;
