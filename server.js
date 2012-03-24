var express = require("express");
var RedisStore = require('connect-redis')(express);

var API_ENDPOINT = "https://api.twilio.com/2010-04-01";
var port = process.env.port || 4000;


var app = express.createServer(
  // express.logger(),
  express.bodyParser(),
  express.cookieParser(),
  express.session({ store: new RedisStore, secret: 'keyboard cat' })  
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