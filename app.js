// requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// body parser 


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRooutes = require('./routes/login');


// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if(err) throw err;

    console.log('base de datos\x1b[32m%s\x1b[0m',' online')
});

// rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRooutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('express server corriendo en el puerto 3000:\x1b[32m%s\x1b[0m',' online');
});