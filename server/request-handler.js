/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var jsonStorage = './server/storage.json';
var jsonContent = fs.readFileSync('./server/storage.json', 'utf8');
var results = JSON.parse(jsonContent); //{results: [ ]};
console.log(results);
var idNum = results.results[results.results.length-1].objectId + 1;

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  //console.log(request);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  if (request.method === 'GET' && request.url.indexOf('/classes/messages') === -1) {
  // default case where we load the page
    var filepath = '.' + request.url;
    if (filepath === './' || request.url.indexOf('/?username') !== -1 ){
      filepath = './client/index.html';
    } else {
      filepath = './client' + request.url;      
    }
    console.log('request.url:', filepath);
    fs.readFile(filepath, function(error, data) {
      if (error) {
        console.log(error);
        throw error;
      } 
      console.log(data);
      console.log(path.basename(filepath));
      headers['Content-Type'] = mime.lookup(path.basename(filepath));
      console.log(headers);
      response.writeHead(statusCode, headers);
      response.end(data);
    });
  // } else if (request.url.indexOf('/classes/messages') === -1 && request.url.indexOf('/log') === -1) {
  //  statusCode = 404;
  } else if (request.method === 'POST') {
    statusCode = 201;

    request.setEncoding('utf8');
    var message = '';

    request.on('data', function(chunk) {
      return message += chunk;
    });

    request.on('end', function() {
      try {
        console.log(message);
        var mesObject = JSON.parse(message);
        mesObject.objectId = idNum;
        idNum += 1;
        results.results.push(mesObject);
        headers['Content-Type'] = 'application/json';
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(results));   
        console.log(results);
        //fs.writeFileSync('./storage.js', JSON.stringify(results));
        fs.writeFile(jsonStorage, JSON.stringify(results, null, 2), function(error) {
          if (error) {
            console.log(error);
          }
        });
      } catch (error) {
        console.log('Error in parsing POST request!', jsonStorage);
      }
    });
  } else {
    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = 'application/json';

    if (request.methods === 'OPTIONS') {
      headers['Allow'] = 'GET, POST, PUT, DELETE, OPTIONS';
    }

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    console.log(JSON.stringify(results));
    response.end(JSON.stringify(results));  
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

//var results = {results: [ ]};


exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;