// var request = require('./request-handler.js');

/* Import node's http module: */
//var http = require('http');

var express = require('express');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var server = express();
var jsonContent = JSON.parse(fs.readFileSync('./server/storage.json', 'utf8'));
var idNum = 0;
if (jsonContent.results.length > 0) {
  idNum = jsonContent.results[jsonContent.results.length - 1].objectId + 1;
}
// console.log(__dirname + '/../client');
// console.log('/Users/student/Desktop/2016-04-chatterbox-server/client')
console.log(path.dirname(__dirname)+ '/client');
server.use(express.static(path.dirname(__dirname)+ '/client'));
var jsonParser = bodyParser.json();
// Every server needs to listen on a port with a unique number. The
// standard port for HTTP servers is port 80, but that port is
// normally already claimed by another server and/or not accessible
// so we'll use a standard testing port like 3000, other common development
// ports are 8080 and 1337.
var port = process.env.PORT || 5000;

// For now, since you're running this server on your local machine,
// we'll have it listen on the IP address 127.0.0.1, which is a
// special address that always refers to localhost.
var ip = '127.0.0.1';

server.use(function(req, res, next) {
  //res.header('Access-Control-Allow-Origin', '*');
  //res.header('Access-Control-Allow-Headers', 'content-type, accept');
  //res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  //res.header('Access-Control-Max-Age', 10); // Seconds.
  next();
});

server.get('/classes/messages', function(req, res) {
  //console.log('GET for /classes/messages');
  //jsonContent.results.push()
  res.status(200).json(jsonContent);
});

server.post('/classes/messages', jsonParser, function(req, res) {
  //console.log('POST activated', req.body);
  var message = req.body;
  message.objectId = idNum;
  idNum += 1;
  jsonContent.results.push(message);
  fs.writeFile('./server/storage.json', JSON.stringify(jsonContent, null, 2), function(error) {
    if (error) {
      console.log(error);
    }
  });
  res.status(201).json(req.body);
});
// We use node's http module to create a server.
//
// The function we pass to http.createServer will be used to handle all
// incoming requests.
//
// After creating the server, we will tell it to listen on the given port and IP. */


// var server = http.createServer(request.requestHandler);
// console.log('Listening on http://' + ip + ':' + port);
//server.listen(port, ip);

server.listen(port, function() {
  console.log('Listening on http://' + ip + ':' + port);
});


// To start this server, run:
//
//   node basic-server.js
//
// on the command line.
//
// To connect to the server, load http://127.0.0.1:3000 in your web
// browser.
//
// server.listen() will continue running as long as there is the
// possibility of serving more requests. To stop your server, hit
// Ctrl-C on the command line.

