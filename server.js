var express = require("express");
var SessionStore = require('connect-redis')(express);
var port = process.env.PORT || 4000;

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

app.get('/', function(req, res){
  res.render('index.ejs', { layout: 'layout' });
});

app.post('/twilio', function(req, res){
  res.send('\n', 204);
});

app.listen(port);
console.log("Server Running on Port",  port);
