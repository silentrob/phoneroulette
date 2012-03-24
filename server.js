var fs = require('fs');

var express = require("express");
var SessionStore = require('connect-redis')(express);
var port = process.env.PORT || 4000;
var log = fs.createWriteStream(__dirname + '/log/development.log', {'flags': 'a'});

var API_ENDPOINT = "https://api.twilio.com/2010-04-01";

var app = express.createServer(
  // express.logger(),
  express.bodyParser(),
  express.cookieParser(),
  express.session({ store: new SessionStore, secret: 'keyboard cat' })  
);

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.set("view options", { layout: "layouts/layout" });


var logger = function(message) {
  log.write(message + "\n");    
}



app.get('/', function(req, res){
  res.render('index.ejs', { layout: 'layout' });
});

app.post('/twilio', function(req, res){
  logger(JSON.stringify(req.body));
  res.send('\n', 204);
});

app.listen(port);
console.log("Server Running on Port",  port);
