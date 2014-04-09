    var http_IP = '127.0.0.1';
    var http_port = 8898;
    var http = require('http');
    var server = http.createServer(function (request, response) {

    var url = require('url');
    var fs = require('fs');
    path = require("path");
    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);

    var qs = require('querystring');
    var processRequest = function(req, callback) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            callback(qs.parse(body));
        });
    }

    processRequest(request, function(data) {

      //check to' see if the cookie was set, if it's there show the requested page
      if (request.headers.cookie == 'mycookie=mysessiontoken'){
            if (request.url == '/'){
              filename="index.html"
            };
            fs.readFile(filename, function(err, file) { 
                if(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.end(err + "n");
                    return;
                }
                response.writeHead(200);
                response.end(file);
            });

      } else {
            //the cookie didn't exist 
            var url_parts = url.parse(request.url, true);
            var query = url_parts.query;

            //if (query.login == 'admin' && query.password == 'pass'){
            if (data.login == 'admin' && data.password == 'pass'){   
                //the user logged in with the right credentials so set a cookie and take them to the first 
                //page behind the login
                console.log('correct credentials!');
                fs.readFile('main.html', function(err, contents) {
                  response.writeHead(200, {
                    'Set-Cookie': 'mycookie=mysessiontoken',
                    Location: 'http://localhost:8898/main.html'
                  });
                  response.write(contents);
                  response.end();
                  return;
                });
            } 

           else {
                //the user didn't enter the correct credentials and/or no session cookie exists
                console.log('INCORRECT credentials and/or Not Logged In!');
                request.requrl = url.parse(request.url, true);
                var pathvar = request.requrl.pathname;
                if (pathvar === '' || pathvar === '/' || pathvar === '/index.html') {
                      fs.readFile('index.html', function(err, contents) {
                        response.write(contents);
                        response.end();
                        return;
                      });
                } else {
                      response.writeHead(301,
                      {Location: 'http://localhost:8898/'}
                      );
                      response.end();
                }




            }



      }


    }); //process request




    });// end server()
    server.listen(http_port,http_IP);
    console.log('listening to http://' + http_IP + ':' + http_port);




