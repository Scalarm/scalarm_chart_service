var jsdom = require("jsdom").jsdom();
//maybe try to normalize variable/file name?
var db_retriever = require("./data_retriever.js");

var config = require("./config.js");
var log4js = require("log4js");
log4js.configure({
  appenders: [
    { type: 'file', filename: config.log_filename, category: ['console', 'service.js'] }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger("service.js");

module.exports = function() {
    var map = {};
    map["interaction"] = function(parameters, success, error){
        if(parameters["id"] && parameters["chart_id"] && parameters["param1"] && parameters["param2"] && parameters["output"]
                    && validate_params(parameters)){
            db_retriever.getInteraction(parameters["id"], 
                                        parameters["param1"], 
                                        parameters["param2"],
                                        parameters["output"], function(data) {
                var object = {};
                object.content = prepare_interaction_chart_content(parameters, data);
                success(object);
            }, error);
        }
        else
            error("Request parameters missing or invalid");
    }
    map["pareto"] = function(parameters, success, error){
        if(parameters["id"] && parameters["chart_id"] && validate_params(parameters)){
            db_retriever.getPareto(parameters["id"], parameters["output"], function(data) {
                var object = {};
                object.content = prepare_pareto_chart_content(parameters, data);
                success(object);
            }, error);
        }
        else
            error("Request parameters missing or invalid");
    }
	map["3d"] = function(parameters, success, error){
		if(parameters["id"] && parameters["chart_id"] && parameters["param1"] && parameters["param2"] && parameters["param3"]
                        && validate_params(parameters)) {
            db_retriever.get3d(parameters["id"], parameters["param1"], parameters["param2"], parameters["param3"], function (data) {
                var object = {};
                object.content = prepare_3d_chart_content(parameters, data);
                success(object);
            }, error);
        }
		else
            error("Request parameters missing or invalid");
	}
    return map;
}

function prepare_interaction_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\ninteraction_main(i, \"" + parameters["param1"] + "\", \"" + parameters["param2"] + "\", data);";
    output += "\n})();</script>";

    return output;
}

function prepare_pareto_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\npareto_main(i, data);";
    output += "\n})();</script>";

    return output;
}

function prepare_3d_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\nthreeD_main(i, \"" + parameters["param1"] + "\", \"" + parameters["param2"] + "\", \"" + parameters["param3"] + "\", data);";
    output += "\n})();</script>";

    return output;
}


var pattern = /^\w+$/
function validate_params(parameters) {
    for (var key in parameters) {
        if(!pattern.test(parameters[key]))
            return false;
    }
    return true;
}
