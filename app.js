var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var routes = require('./routes/index');
var users = require('./routes/users');
var route_socket = require('./routes/socket');
var picBiz = require('./interface/picBiz');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

io.sockets.on('connection',function(socket) {
    socket.on('new_user', function (data) {
        socket.name = data.user;
        if (!users[data.user]) {
            users[data.user] = data.id;
        }
    });

    socket.on('savepic', function (data) {
        picBiz.savePic(data);
    });

    socket.on('done', function (data) {
        var user = data.user;
        picBiz.getPic(user,function(err,result) {
            socket.emit('respic',data);
        });
    });

    socket.on('disconnect', function() {
        if (users[socket.name]) {
            delete users[socket.name];
        }
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
