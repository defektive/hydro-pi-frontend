

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	request = require('request'),
	exphbs  = require('express3-handlebars'),
	path = require('path'),
	baseContext = {
		title: "Hydro-&#x03C0;",
		subtitle: ""

	},

	Scheduler = require("hydro-pi-scheduler");



app.use("/api", Scheduler);

server.listen(8080, "0.0.0.0");

var userSocket = io.on('connection', function (socket) {
	//setInterval(sendTest.bind(socket), 6000);
	io.sockets.emit("hey", {data: "Stuff"});
});

app.use("/js", express.static(path.join(__dirname, '/public/js/')));
app.use("/css", express.static(path.join(__dirname, '/public/css/')));
app.use("/img", express.static(path.join(__dirname, '/public/img/')));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res, next) {
	res.render('home');
});

