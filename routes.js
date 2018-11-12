/**
 * definition of routes and route handlers
 * 
 */

const handlers = {};

// ping handler to check service status response
handlers.ping = function(data,callback){
    callback(200, {'status': 'system responding ok'} );
};

// hello handler , returns a simple message
handlers.hello = function(data,callback){
    callback(200, {'message': 'hello anonymous user! please identify to get more out of this API'} );
};

// not found / 404 handler
handlers.notFound = function(data,callback){
    callback(404, {'message': 'woops, we couldn\'t find what you are looking for'} );
};

// define request router
const router = {
    'ping': handlers.ping ,
    'hello': handlers.hello ,
    'notFound': handlers.notFound ,
};

module.exports = router;