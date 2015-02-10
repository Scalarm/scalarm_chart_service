var config = require("./config.js");
var dgram = require("dgram");
var client = dgram.createSocket("udp4");
var fs = require("fs");
var https = require("https");
var http = require("http");
var LBaddress;

module.exports.retrieveDBAddress = function(callback) {
  if(config.multicast_address && config.multicast_port) {
    retrieveLBAddress(function() {
      console.log("LBaddress retrieved: " + LBaddress);
      registerChartServiceInLoadBalancer(function() {
        console.log("ChartService registered in LB");
      });
    });
  }

  var options = {
    host: config.information_service_address,
    port: config.information_service_port,
    path: '/db_routers',
  };
  http.get(options, function(res) {
    var data = "";

    res.on("data", function(chunk) {
      data+=chunk;
    });

    res.on("end", function() {
      var addresses = JSON.parse(data);
      var addressDB;
      if(addresses.length>0) {
        var chosenAddress = addresses[Math.floor(Math.random()*addresses.length)];
        addressDB = "mongodb://" + chosenAddress + "/scalarm_db";
      }
      else {
        addressDB = "mongodb://localhost:27017/scalarm_db";
      }
      console.log("Retrieved database address: ", addressDB);
      callback(addressDB);
    })
  });
};

function retrieveLBAddress(callback) {
  client.bind(config.multicast_port);

  client.on("listening", function() {
      client.addMembership(config.multicast_address);
  });

  client.on("message", function(message, remote) {
    console.log("LB multicasted address: ", message.toString());
    if (LBaddress===undefined) {
      LBaddress = message.toString();
      client.close();
      callback();
    }
  })
}

function registerChartServiceInLoadBalancer(callback){
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

    post_req.end();
    callback();
};