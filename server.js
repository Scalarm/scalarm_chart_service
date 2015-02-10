var http = require("http");
var url = require("url");
var jsdom = require("jsdom").jsdom();
var fs = require("fs");
var querystring = require("querystring");
var exec = require("child_process").exec;
var parseCookies = require("cookie").parse;
var util = require("util");

var decoder_configuration = require("./decoder_configuration.js");
	// options.secret_key_base = process.env.USER;	//we can set here secret_key_base
var cookieDecoder = require("cookieDecoder")(decoder_configuration);
var DataRetriever = require("./data_retriever.js");
var RegistrationModule = require("./registration_module.js");

var config = require("./config.js");
var panel_locals = require("./panel_locals.js");

var jade = require("jade");
var METHODS_DIR = "./visualisation_methods";
var METHODS = require("./methods").methods;

var log4js = require("log4js");
log4js.configure({
  appenders: [
    { type: 'file', filename: config.log_filename, category: ['console', 'server.js'] }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger("server.js");

// var PORT = config.server_port,
	// EXTERNAL_IP = config.server_ip,// + ":3001",			//TODO - retrieve external IP
	// ADDRESS = EXTERNAL_IP + config.server_prefix;		//address suffix set in /etc/nginx/conf.d/default.conf
var PORT = config.server_port;
var PREFIX = config.server_prefix;

//prepare panel.jade
var panel = fs.readFileSync("panel.jade.template", 'utf8');
var includes = "";
for(var i in METHODS){
	includes = includes + "include " + chart_to_modal_template(METHODS[i]) + "\n";
}
panel = panel.replace(/###INCLUDES###/, includes);
fs.writeFileSync("panel.jade", panel, 'utf8');


var requests_map = prepare_map_with_requests();
var ChartsMap = create_charts_map();
var app = http.createServer(server_handler);

RegistrationModule.retrieveDBAddress(function(address) {
    DataRetriever.connect(address, function(){
        app.listen(PORT, function(){
            logger.trace("Listening on port " + PORT);
        });
    }, function(){
        logger.error("Connection to database failed");
        throw new Error("Connection to database failed");
    })
});


var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
	httpServer: app
})

wsServer.on('request', ws_handler);

//--------------------------------
function server_handler(req, res) {
	var body = '';
	if(req.method=='POST') {
		req.on("data", function(data) {
			body += data;
		})
		req.on("end", function() {
			console.log(body);
		})
	}
	var parsedUrl = url.parse(req.url);
	var pathname = parsedUrl.pathname;
	var parameters = querystring.parse(parsedUrl.query);
	logger.info(pathname + " : " +JSON.stringify(parameters));

	var path = pathname.split("/")[1];
	if(path === "status") {
        res.write(JSON.stringify({status: "ok", message: ""}));
        res.end();
    }
	else if(requests_map[path]) {
        authenticate(req.headers, function (userID) {
            requests_map[path](req, res, pathname, parameters, userID);
        }, function (err) {
            logger.error("Authentication failed: " + err);
            res.writeHead(401);
            res.write(err.toString());
            res.end();
        });
    }
	else {
		res.writeHead(404);
		res.write(pathname + " : incorrect request!");
		res.end();
	}
}

function ws_handler(request) {
	logger.info(" Connection from origin " + request.origin);
	var experimentID = request.httpRequest.url.split("/")[2];
	authenticate(request.httpRequest.headers, function(userID) {
		logger.info("OK! Successfully authorized.");
        DataRetriever.checkIfExperimentVisibleToUser(userID, experimentID, function(){
            var connection = request.accept(null, request.origin);
            DataRetriever.createStreamFor(connection, experimentID, function(stream){
            	connection.on('close', function(connection){
            		console.log("Connection closed");
            		stream.destroy();
            	});
            });
        }, function(){
            console.log("Error checking experiment's affiliation");
            request.reject();
        });
	}, function(err) {
		console.log("Authentication failed! \n" + err);
		request.reject();
	});
}

function authenticate(headers, success, error){
    var cookies = headers.cookie;
    if(cookies) {
    	var cookie = parseCookies(cookies)["_scalarm_session"];
        var output = cookieDecoder(cookie);

        //maybe try without exec...?
        exec("ruby serialized_object_to_json.rb " + new Buffer(output).toString("base64"), function(err, stdout, stderr) {
            if (err !== null) {
            	console.log("Error calling ruby deserialization")
                console.log('\tstderr: ' + stderr);
                console.log('\texec error: ' + err);
                error(err);
                return;
            }
            var userID = JSON.parse(stdout)["user"];
            success(userID);
        });
    }
    else {
        var header=headers['authorization']||'';            // get the header
        if(!header){
            console.log("No authentication credentials")
            error("No authentication credentials");
        }
        var token=header.split(/\s+/).pop()||'',            // and the encoded auth token
            auth=new Buffer(token, 'base64').toString(),    // convert from base64
            parts=auth.split(":"),                          // split on colon
            username=parts[0],
            password=parts[1];

        DataRetriever.checkUserAndPassword(username, password, success, error);
    	
    }
}

function prepare_script_tag(typeOfChart) {
	if(ChartsMap[typeOfChart]) {
	    var tag = jsdom.createElement("script");
	    tag.setAttribute("type", "text/javascript");
	    tag.setAttribute("src",[PREFIX, "main", typeOfChart].join("/"));
	    return tag;
	}
	else {
	    throw Error("Type of chart: '" + typeOfChart + "' not supported");
	}
}

function prepare_map_with_requests() {
	var map = {};
	map["panel"] = panel_handler;
	map["images"] = images_handler;
	map["main"] = main_handler;
	map["scripts"] = scripts_handler;
	map["get"] = chart_handler;
	return map;
}

function panel_handler(req, res, _, parameters){
	DataRetriever.getParameters(parameters["id"], function(data) {
		panel_locals.parameters = data.parameters;
		panel_locals.output = data.result;
        panel_locals.parameters_and_output = data.parameters.concat(data.result);
		// panel_locals.address = ADDRESS;
		panel_locals.prefix = PREFIX;
		panel_locals.experimentID = parameters["id"];
		res.writeHead(200);
		var panel = jade.renderFile("panel.jade", panel_locals);
		res.write(panel);
		res.end();
	},
	function(err) {
		res.writeHead(404);
		res.write("Error getting parameters\n");
		res.write(err+"\n");
		res.end();
	})
};

function images_handler(req, res, pathname) {
	var filename = unescape(pathname);
	fs.readFile('.'+filename, function(error, data) {
		if(error) {
			res.writeHead(404);
			res.write("File " + filename + " : not found!\n");
			res.write(error.toString());
			res.end();
		}
		else {
			res.write(data);
			res.end();
		}
	});
};

function main_handler(req, res, pathname){
	var type = pathname.split("/")[2];
	var resource = pathname.split("/")[1];
	if(!type) {
		res.write("Type of chart not specified!\n");
		res.end();
		return;
	}
	if(!ChartsMap[type]) {
		res.write("Type of chart: '" + type + "' not supported!\n");
		res.end();
		return;
	}
	var file_path = [METHODS_DIR, type, type+"_chart_"+resource].join("/");
	file_path += resource==="style" ? ".css" : ".js";

	fs.readFile(file_path, function(error, data) {
		if(error) {
			res.writeHead(404);
			res.write("File " + file_path + " : not found!\n");
			res.write(error.toString());
			res.end();
		}
		else {
			res.write(data);
			res.end();
		}
	});
};

function scripts_handler(req, res, pathname){
	var chart_type = pathname.split("/")[2];
	try {
		var tag = prepare_script_tag(chart_type);
		res.write(tag.outerHTML);
                res.end();
	}
	catch(error) {
		res.write(error.message);
		res.end();
	}
};

function chart_handler(req, res, pathname, parameters, userID){
	var type = pathname.split("/")[2];
	if(METHODS.indexOf(type) >= 0){
		authenticate(req.headers, function(userID) {
            DataRetriever.checkIfExperimentVisibleToUser(userID, parameters["id"], function() {
            	ChartsMap[type](parameters, function(object) {
                    logger.info("OK! Successfully authorized.");
                    var output = jade.renderFile(chart_to_view_template(type), parameters);
					output += object.content;
                    res.write(output);
                    res.end();
                }, function(err){
                	logger.error("userID: " + userID + " experimentID: " +  parameters["id"] + " --> " + err);
                	res.write(auto_removing_tag(parameters["id"], err, 3000));
                    res.end();
                })
			}, function(err) {
				console.log("FAILED! Sending info about error to Scalarm... \n" + err);
				res.write("Unable to authenticate");
				res.end();
			});
		}, function(err) {
			res.write(err);
			res.end();
		});
	}
	else {
		res.writeHead(404);
		res.write(type + " chart not supported!");
		res.end();
	}
}

function create_charts_map(){
	var map = {};
	for(var i in METHODS){
	    var name = METHODS[i];
	    map[name] = create_handler(name);
	}
	return map;
}

function create_handler(name){
    return function(parameters, success, error){
        if(validate_params(parameters)){
            require("./visualisation_methods/" + name + "/plugin").get_handler(DataRetriever)(parameters, success, error);
        } else {
            error("Request parameters invalid");
        }
    }
}

var pattern = /^\w+$/
function validate_params(parameters) {
    for (var key in parameters) {
        if(!pattern.test(parameters[key]))
            return false;
    }
    return true;
}

function chart_to_view_template(type) {
	return [METHODS_DIR, type, type+"Chart.jade"].join("/");
}

function chart_to_modal_template(type) {
	return [METHODS_DIR, type, type+"Modal.jade"].join("/");
}

function auto_removing_tag(id, message, timeout) {
	return util.format(" \
		<span id=\"%s\"> %s \
			<script> \
				setTimeout(function() { \
					$(\"#%s\").remove(); \
				}, %d); \
			</script> \
		</span>", id, message, id, timeout);
}