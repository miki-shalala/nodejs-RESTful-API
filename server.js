/**
import { http } from 'modules';
 * here lies the server logic
 */

// dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const router = require('./routes');

// exposable object
const server = {};

// https server options
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};

// instantiate http server
const httpServer = http.createServer( (req,res) => unifiedServer(req,res) );

// instantiate https server
const httpsServer = https.createServer(httpsServerOptions,(req,res) => unifiedServer(req,res) );

// starts both servers
server.start = function(){
    console.log('attempt to start servers');

    //start the server listening on both https and http ports
    httpServer.listen( config.httpPort, () => console.log('server listening on port',config.httpPort) );
    httpsServer.listen( config.httpsPort, () => console.log('server listening on port',config.httpsPort) );
}

// stops both servers
server.stop = function(){
    console.log('attempt to stop servers');

    // check if listening before attempting
    if(httpsServer.listening){
        httpsServer.close( () => console.log('https server is closed') );
    }

    if(httpServer.listening){
        httpServer.close( () => console.log('http server is closed') );
    }
}

// unified server logic, to handle requests from both servers
const unifiedServer = function(req, res){
    // get url and parse
    let urlParsed = url.parse(req.url,true);

    // get the path from url
    let path = urlParsed.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // get the query string as obj
    let queryStringObject = urlParsed.query;

    // get the http method
    let method = req.method.toLocaleLowerCase();

    // get headers as obj
    let headers = req.headers;

    // create a string decoder for the payload
    let decoder = new StringDecoder('utf8');
    let buffer = '';
    
    req.on('data', (data) => buffer += decoder.write(data) );

    req.on('end', () => {
        buffer += decoder.end();

        // check if handler/route exists, if it doesnt, return a notFound
        let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router['notFound'];

        // Construct the data object to send to the hanlder
        let data = {
            'trimmedPath': trimmedPath, 
            'method': method, 
            'queryStringObject:': queryStringObject,
            'requestHeaders:': headers,
            'payload:': buffer
        };

        // route the request to the handler
        chosenHandler(data, (statusCode, payload) => {
            // use the status code from the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // this is the data we are sending back to the client, default to empty obj if theres no data to send back
            payload = typeof(payload) == 'object' ? payload : {} ;

            //convert payload to string
            let payloadString = JSON.stringify(payload);

            // define headers, write status code, send response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log('return this response:', statusCode);
        });
    });
};

module.exports = server;