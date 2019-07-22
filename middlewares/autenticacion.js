const jwt = require('jsonwebtoken');

let SEED = require('../config/config').SEED;
// verificar el token
exports.verificaToken = function(req, res, next) {
	let token = req.query.token;

	jwt.verify(token, SEED, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				ok: false,
				mensaje: 'Token incorrecto',
				errros: err
			});
		}
        req.usuario = decoded.usuario;
        next();
        
	});
};

// verificar el admin
exports.verificaAdminRole = function(req, res, next) {

	let usuario = req.usuario;

	if(usuario.role === 'ADMIN_ROLE') {
		next();
		return;
	} else {
		return res.status(401).json({
			ok: false,
			mensaje: 'Token incorrecto, permiso no permitido',
			erros: {
				message: 'No es administrador'
			}
		});
	}

};

// verificar el admin o mismo usuario
exports.verificarAdminOrUser = function(req, res, next) {

	let usuario = req.usuario;
	let id = req.params.id

	if(usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
		next();
		return;
	} else {
		return res.status(401).json({
			ok: false,
			mensaje: 'Token incorrecto, permiso no permitido',
			erros: {
				message: 'No es administrador'
			}
		});
	}

};
