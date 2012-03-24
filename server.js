var express = require("express");

var app = express.createServer(
  express.logger(),
  express.bodyParser(),
  express.cookieParser(),
  express.session({ secret: 'somesecret'})
);

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.set("view options", { layout: "layouts/layout" });


var port = process.env.port || 4000;

app.get('/', function(req, res){
  res.render('index.ejs', { layout: 'layout' });
  // res.send('hello world');
});

console.log("Server Running on Port",  port)
app.listen(port);