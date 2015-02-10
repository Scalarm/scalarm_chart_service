var info = {
    name: "Interaction",
    id: "interactionModal",
    group: "params",
    image: "/chart/images/material_design/interaction_icon.png",
    description: "Shows interaction between 2 input parameters"
};

function handler(dao){
	return function(parameters, success, error){
	    if(parameters["id"] && parameters["chart_id"] && parameters["param1"] && parameters["param2"] && parameters["output"]){
	        getInteraction(dao, parameters["id"], parameters["param1"], parameters["param2"], parameters["output"], function(data) {
	            var object = {};
	            object.content = prepare_interaction_chart_content(parameters, data);
	            success(object);
	        }, error);
	    }
	    else
	        error("Request parameters missing");
	}
};

function prepare_interaction_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\ninteraction_main(i, \"" + parameters["param1"] + "\", \"" + parameters["param2"] + "\", data);";
    output += "\n})();</script>";

    return output;
}

function getInteraction(dao, id, param1, param2, outputParam, success, error){
  	dao.getData(id, function(array, args, mins, maxes){
	  	var low_low=array.filter(function(obj) {
	  		return dao.getValue(obj,param1) === mins[param1]
		}).filter(function(obj) { 
			return dao.getValue(obj,param2) === mins[param2]
		})[0]; //TODO maybe calculate average of data in arrays?

		var low_high=array.filter(function(obj) {
			return dao.getValue(obj,param1) === mins[param1]
		}).filter(function(obj) { 
			return dao.getValue(obj,param2) === maxes[param2]
		})[0];

		var high_low=array.filter(function(obj) {
			return dao.getValue(obj,param1) === maxes[param1]
		}).filter(function(obj) { 
			return dao.getValue(obj,param2) === mins[param2]
		})[0];

		var high_high=array.filter(function(obj) {
			return dao.getValue(obj,param1) === maxes[param1]
		}).filter(function(obj) { 
			return dao.getValue(obj,param2) === maxes[param2]
		})[0];

		//TODO refactor
		if(!(low_low && low_high && high_low && high_high)) {
			error("Not enough data in database!");
			return;
		}
		else {
		
			result = [];
			result.push(low_low.result[outputParam],
						low_high.result[outputParam], 
						high_low.result[outputParam], 
						high_high.result[outputParam])
			var data = {};
			data[param1] = {
				domain: [mins[param1], maxes[param1]]
			};
			data[param2] = {
				domain: [mins[param2], maxes[param2]]
			};
			data.effects = result;
			//console.log(data);
			success(data);
		}
	}, error);
};

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}