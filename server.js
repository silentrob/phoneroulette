var express = require("express");
var SessionStore = require('connect-redis')(express);
var port = process.env.PORT || 4000;

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

app.get('/', function(req, res){
  res.render('index.ejs', { layout: 'layout' });
});

console.log("Server Running on Port",  port)
app.listen(port);
