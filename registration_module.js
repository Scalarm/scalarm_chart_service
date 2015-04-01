var config = require("./config.js");
var dgram = require("dgram");
var client = dgram.createSocket("udp4");
var fs = require("fs");
var http = require("http");
var https = require("https");

var log4js = require("log4js");
log4js.configure({
  appenders: [
    { type: 'file', filename: config.log_filename, category: ['console', 'registration_module.js'] }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger("registration_module.js");

var DB_NAME = "/scalarm_db";

module.exports.retrieveDBAddress = function(callback) {
  var address = "http://"+config.information_service_address+"/db_routers"
  http.get(address, function(res) {
    var data = "";

    res.on("data", function(chunk) {
      data+=chunk;
    });

    res.on("end", function() {
      try {
        var addresses = JSON.parse(data);
      }
      catch (error) {
        logger.error("Could not parse json: " + error);
        throw error;
      }
      var addressDB;
      if(addresses.length>0) {
        var chosenAddress = addresses[Math.floor(Math.random()*addresses.length)];
        addressDB = "mongodb://" + chosenAddress + DB_NAME;
      }
      else {
        addressDB = "mongodb://localhost:27017" + DB_NAME;
      }
      console.log("Retrieved database address: ", addressDB);
      callback(addressDB);
    })
  });
};

module.exports.retrieveLBAddress = function(callback) {
  //jesli jest zamkniety port to zrobic petle na np. 10 prob co 5 sekund
  client.bind(config.multicast_port);

  client.on("listening", function() {
      client.addMembership(config.multicast_address);
  });

  client.on("message", function(message, remote) {
    console.log("LB multicasted address: ", message.toString());
    if (LBaddress===undefined) {
      var LBaddress = message.toString();
      client.close(); //sprawdzic czy client.close jest blokujace!
      callback(LBaddress);
    }
  })
}

module.exports.registerChartServiceInLoadBalancer = function(LBaddress){
//    var data = querystring.stringify({
//        name: "ChartService",
//        address: config.server_ip + ":" + config.server_port
//    });
    var data = new Buffer("name=ChartService&address="+config.server_ip+":"+config.server_port);

    var options = {
        host: LBaddress,
        port: 443,
        path: "/register?"+data,
        method: "POST",
        rejectUnauthorized: false
    };

    var post_req = https.request(options, function(response){
        response.on('data', function(chunk) {
            console.log(chunk.toString());
        })
    });

    //ewentualnie rzucac wyjatkiem jak sie nie udalo zarejestrowac
    post_req.end();
};
