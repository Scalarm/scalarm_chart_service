var info = {
    name: "Pareto",
    id: "paretoModal",
    group: "params",
    image: "/chart/images/material_design/pareto_icon.png",
    description: "Shows significance of parameters (or interaction)"
}

function handler(dao){
	return function(parameters, success, error){
	    if(parameters["id"] && parameters["chart_id"] && parameters["output"]){
	        getPareto(dao, parameters["id"], parameters["output"], function(data) {
	            var object = {};
	            object.content = prepare_pareto_chart_content(parameters, data);
	            success(object);
	        }, error);
	    }
	    else
	        error("Request parameters missing");
	}
}

function prepare_pareto_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\npareto_main(i, data);";
    output += "\n})();</script>";

    return output;
}

function getPareto(dao, id, outputParam, success, error){
	dao.getData(id, function(array, args, mins, maxes){
		effects = [];
		for(i in args) {
			effects.push(Math.abs(dao.calculateAverage(array, args[i], maxes[args[i]], outputParam)-dao.calculateAverage(array, args[i], mins[args[i]], outputParam)));
	 	}
		var data = [];
		for(i in args) {
			data.push({
	 			name:  args[i],
	 			value: effects[i]
	 		});
	 	}
	 	data.sort(function(a,b){ return b.value-a.value });
	 	success(data);
	}, error);
};

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}