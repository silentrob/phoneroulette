var fs = require('fs');
var qs = require('querystring');

var express = require("express");
var sessionStore = require('connect-redis')(express);
var request = require('request');
var port = process.env.PORT || 4000;
var log = fs.createWriteStream(__dirname + '/log/development.log', {'flags': 'a'});

var redis = require("redis")
var c = redis.createClient()
var game = require("./lib/game")(c)

var config = fs.readFileSync(__dirname + '/config/development.json', 'utf8');
config = JSON.parse(config);

var app = express.createServer(
  // express.logger(),
  express.bodyParser(),
  express.cookieParser(),
  express.session({ store: new sessionStore, secret: 'keyboard cat' })  
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

// Twilio Send Message Call
var sendMessage = function(options, callback) {

  var options = {
    method:'POST',
    url : 'https://'+ config.sid + ':' + config.atoken +'@api.twilio.com/2010-04-01/Accounts/' + config.sid + '/SMS/Messages.json',
    headers : {'content-type':'application/x-www-form-urlencoded'},
    body : qs.stringify({
      'Body': options.body,
      'From': config.fromNumber,
      'To': options.phone
    })
  }
  
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 201) {
      if (callback) {
        logger("Message Sent " + body);
        callback(201, body)
      }
    } 
    if (error) {
      logger("[ERROR] " + error);
      if (callback) {
        callback(response.statusCode, error)
      }
    }
  })
}

app.get('/', function(req, res){
  res.render('index.ejs', { layout: 'layout' });
});

app.post('/twilio', function(req, res){
  var params = req.body;
  var body = params.Body;
  var phone = params.From;
  
  game.inbound({phone:phone, body:body}, function(err , messages){
    logger("IN INBOUND " + err + " " + messages)
    
    messages.forEach(function(msg){
      sendMessage({phone: msg.phone, body: msg.body});
    })
  });
  
  res.send('\n', 204);
});

app.listen(port);
console.log("Server Running on Port",  port);
