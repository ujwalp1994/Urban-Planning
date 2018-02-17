/**
 * Satellizer Node.js Example
 * (c) 2015 Sahat Yalkabov
 * License: MIT
 */

var path = require('path');
var qs = require('querystring');
var mongoose = require('mongoose');
var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');
//var ladp=require('ldapjs');
//var colors = require('colors');
var dateform = require('dateformat');
var express = require('express');
var logger = require('morgan');
//var jwt = require('jwt-simple');
//var moment = require('moment');
var mongoose = require('mongoose');
//var request = require('request');
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var socketio = require('socket.io'); // required for sending notification
var server = require('http').Server(app); // required for sending notification
var io = require('socket.io')(server); // required for sending notification
var mono = require('mongodb');
var config = require('./config');
//var ldapauth = require('node-ldapauth');
//mongoose.connect('mongodb://172.17.13.25:27020/log');
//mongoose.connection.on('error', function(err) {
  //console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
//});

var app = express();

app.set('port', process.env.PORT || 3002);
var port='443';
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'https://tgimcdcprodser.tcs.com/');
    //
    //         // Request methods you wish to allow
                 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //
    //                 // Request headers you wish to allow
                         res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //
    //                         // Set to true if you need the website to include cookies in the requests sent
    //                             // to the API (e.g. in case you use sessions)
                                     res.setHeader('Access-Control-Allow-Credentials', true);
    //
    //                                     // Pass to next layer of middleware
                                             next();
                                             });
*/
// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}
//app.use(express.static(path.join(__dirname, '../../client')));
app.use(express.static(path.join(__dirname, 'client')));
console.log("DDD",path.join(__dirname, 'client'));


var mongoclient = new mono.Server("localhost", 27017,  {safe:false}, {native_parser: true},{auto_reconnect: true});
var db = new mono.Db('hydlogs',mongoclient);
db.open(function(){});

/*
 |--------------------------------------------------------------------------
 | Socket IO
 |--------------------------------------------------------------------------
 */
/*io.set('origins', 'https://tgimcdcprodser.tcs.com');
io.on('connection', function(socket){
    console.log("Connected...");
    socket.on("client",function  (data) {
        console.log(data);    
    })

  socket.on("join_room",function  (data) {
       console.log("Rq for Joinning Room...", data);      
        socket.join(data);
    })

    socket.on("upload_done",function  (data) {
        console.log("Notifying clients of Uplaod..");      
       socket.join(data);
    })


     io.to('some room').emit('some event')
    socket.on('message', function(msg){
        console.log("message", msg.id);
        socket.broadcast.to(msg.id).emit('info',msg);
    });
});
*/
// my routes ==================================================
require('./app/reportroutes')(app); // configure our routes

// login routes ==================================================
require('./app/loginroutes')(app, mongoose); // configure our routes
/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
//
//
//var options = {
//    key: fs.readFileSync('pilottgimreport.tcs.com.key'), 
  //  cert: fs.readFileSync('pilottgimreport.tcs.com.cer')
//};
// https.createServer(options, app).listen(port);
