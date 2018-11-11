/**
 * RESTful API
 * primary file
 */

//dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// instantiate http server
const httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
}); // end server

//start the server, listen to port defined by environment and listen to 
httpServer.listen(config.httpPort,function(){
    console.log('server listening on port',config.httpPort);
});

// https server options
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem') 
};
// instantiate https server
const httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
});

httpsServer.listen(config.httpsPort,function(){
    console.log('server listening on port',config.httpsPort);
});

// unified server logic, to handle http and https
const unifiedServer = function(req,res){
    // get url and parse
    var urlParsed = url.parse(req.url,true);

    // get the path from url
    var path = urlParsed.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get the query string as obj
    var queryStringObject = urlParsed.query;

    // get the http method
    var method = req.method.toLocaleLowerCase();

    // get headers as obj
    var headers = req.headers;

    // get the payload if there any
    var decoder = new StringDecoder('utf8');
    var buffer = '';
    
    req.on('data',function(data){
        buffer += decoder.write(data);
    });

    req.on('end',function(){
        buffer += decoder.end();

        // chose the request handle in other words route if it doesnt exist, return a notFound
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the hanlder
        var data = {
            'trimmedPath': trimmedPath, 
            'method': method, 
            'queryStringObject:': queryStringObject,
            'requestHeaders:': headers,
            'payload:': buffer
        };

        // route the request to the handler
        chosenHandler(data,function(statusCode,payload){
            // use the status code callbak by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload calledback by the handler or default to empty response
            payload = typeof(payload) == 'object' ? payload : {} ;
            
            //convert payload to string
            var payloadString = JSON.stringify(payload);

            // send response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('return this response:',statusCode,payloadString);
        });
    });
};

// define handlers
const handlers = {};
// sample handler
handlers.ping = function(data,callback){
    // callback http status and a payload (obj-json)
    callback(200,{'status':'system responding ok'});
};

// not found / 404 handler
handlers.notFound = function(data,callback){
    callback(404);
}; 

// define request router
var router = {
    'ping' : handlers.ping
};