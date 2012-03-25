var should = require("should")

describe("all", function(){
  var redis = require("redis")
  var client = redis.createClient()
  var game = require("../game")(client)

  before(function(done){
    done()
  })

  it("should start with no one in the system", function(done) {
    game.info(function(err, data){
      data.should.have.property("players") 
      data.players.should.be.an.instanceof(Array)
      data.players.should.be.empty
      data.should.have.property("queue") 
      data.queue.should.be.an.instanceof(Array)
      data.queue.should.be.empty
      done()
    })
  })

  it("should add player to the game on first message", function(done) {
    game.inbound({ body: "hello world", phone: "1" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      done()
    })
  })

  it("should have info", function(done) {
    game.info(function(err, data){
      data.should.have.property("players") 
      data.players.should.be.an.instanceof(Array)
      data.players.should.have.length(1)
      data.should.have.property("queue") 
      data.queue.should.be.an.instanceof(Array)
      data.queue.should.have.length(1)
      done()
    })
  })

  it("should pair second person with first", function(done) {
    game.inbound({ body: "hello world", phone: "2" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      game.info(function(err, data){
        data.players.should.have.length(2) 
        data.queue.should.have.length(0) 
        done()
      })
    })
  })

  it("should send message from player1 to player2", function(done) {
    game.inbound({ body: "hello brazil", phone: "1" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      outbound[0].should.eql({ body: "hello brazil", phone: "2" })
      console.log(outbound)
      done()
    })
  })

  it("should add third to queue", function(done) {
    game.inbound({ body: "hello", phone: "3" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      game.info(function(err, data){
        data.players.should.have.length(3) 
        data.queue.should.have.length(1) 
        done()
      })
    })
  })

  it("should pair 1 and 3 if 1 leaves. 2 ends up in the queue", function(done) {
    game.inbound({ body: "next", phone: "1" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      game.info(function(err, data){
        data.players.should.have.length(3) 
        data.queue.should.have.length(1) 
        done()
      })
    })
  })

  it("should a new person should partner with 4", function(done) {
    game.inbound({ body: "hello", phone: "4" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      game.info(function(err, data){
        data.players.should.have.length(4) 
        data.queue.should.have.length(0) 
        console.log(data)
        done()
      })
    })
  })

  it("should put 2 and 4 in queue if none in queue during next", function(done) {
    game.inbound({ body: "next", phone: "4" }, function(err, outbound){
      outbound.should.be.an.instanceof(Array)
      console.log(outbound)
      game.info(function(err, data){
        data.players.should.have.length(4) 
        data.queue.should.have.length(2) 
        done()
      })
    })
  })

  after(function(){
    client.flushall()
    client.quit()
  })

})

