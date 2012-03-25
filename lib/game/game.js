module.exports = function(client){

  var findOrCreate = function(inbound, cb){
    client.sadd("players", inbound.phone, function(e, reply){
      if(reply == 1){
        cb(inbound, [{ phone: inbound.phone, body: "welcome to the game" }])
      }else{
        cb(inbound, [])
      }
    })
  } 

  var message = function(inb, cb){
    client.get(inb.phone + ":partner", function(err, partner){
      if(partner){
        // DONE: send message to partner
        cb(null, [{ phone: partner, body: inb.body }])
      }else{
        queue(inb, cb) 
      } //else
      
    })// client.get()
    
  };// message


  var queue = function(inb, cb){
    // no partner
    client.lrange("queue", 0, -1, function(err, waiting){
      if(waiting && waiting.indexOf(inb.phone) == -1){
        // new player!
        client.sadd("players", inb.phone, function(e, reply){
          if(waiting.length > 0){
            // join players together do not add to queue
            client.lpop("queue", function(err, partner){
              // patch up players
              // send message
              client.multi()
              .set(inb.phone + ":partner", partner)
              .set(partner + ":partner", inb.phone)
              .exec(function(err, replies){
                // DONE: pairing has been done
                cb(null, [
                  { phone: inb.phone, body: "you now have a partner" },
                  { phone: partner, body: "you now have a partner" },
                ])
              })
            })
          }else{
            client.rpush("queue", inb.phone, function(e, reply){
              // DONE: added to queue
              cb(inb, [{ phone: inb.phone, body: "welcome to the game. you are waiting for a partner" }])
            })
          }
        })
      }else{
        // DONE: you are still in the queue
        cb(inb, [{ phone: inb.phone, body: "you are still in the queue" }])
      }

    })
  }

  var next = function(inb, cb){
    client.get(inb.phone + ":partner", function(err, orig_partner){
      if(orig_partner){
        // DONE: send message to partner
        // cb(null, [{ phone: partner, body: inb.body }])
        client.multi()
        .del(orig_partner + ":partner")
        .del(inb.phone + ":partner")
        .exec(function(err, replies){
          client.lrange("queue", 0, -1, function(err, waiting){
            if(waiting.length > 0){
              // join players together do not add to queue
              client.lpop("queue", function(err, partner){
                // patch up players
                // send message
                client.multi()
                .set(inb.phone + ":partner", partner)
                .set(partner + ":partner", inb.phone)
                .exec(function(err, replies){
                  var out = []
                  out.push([
                    { phone: inb.phone, body: "you now have a new partner" },
                    { phone: partner, body: "you now have a partner" },
                  ])
              
                  if(waiting.length > 1){
                    client.lpop("queue", function(err, partner){
                      // patch up players
                      // send message
                      client.multi()
                      .set(orig_partner + ":partner", partner)
                      .set(partner + ":partner", orig_partner)
                      .exec(function(err, replies){
                        // DONE: pairing has been done
                        out.push([
                          { phone: orig_partner, body: "you now have a new partner" },
                          { phone: partner, body: "you now have a partner" },
                        ])
                        cb(null, out) 

                      })
                    })
                  }else{
                    client.rpush("queue", orig_partner, function(e, reply){
                      // DONE: added to queue
                      out.push({ phone: orig_partner, body: "you are waiting for a partner" })
                      cb(null, out)
                    })
                  }
                  
                })
              })
            }else{
              client.rpush("queue", inb.phone, orig_partner, function(e, reply){
                // DONE: added to queue
                cb(inb, [
                  { phone: inb.phone, body: "you are waiting for a partner" },
                  { phone: orig_partner, body: "your partner has left you. sorry." }
                ])
              })
            }
          })

          //queue(inb, cb)
          // add to queue 
        }) 
      }else{
        cb(null, [{ phone: inb.phone, body: "you are still in the queue. sorry for the wait" }])
      }
    })
  }

  return {

    inbound: function(inb, cb){
      if(inb.body == "next"){
        next(inb, cb)
      }else{
        message(inb, cb)
      }
    },

    info: function(cb){
      client.smembers("players", function(e, players){
        client.lrange("queue", 0, -1, function(e, queue){
          cb(null, { 
            "queue": queue || [],
            "players": players || []
          })
        })
      })
    }

  }
}

