var info = {
    name: "3D chart",
    id: "threeDModal",
    group: "group",
    image: "/chart/images/material_design/3dchart_icon.png",
    description: "3D charts - scatter plot"
}

function handler(dao) {
	console.log("3d");
	return function(parameters, success, error){
		if(parameters["id"] && parameters["chart_id"] && parameters["param1"] && parameters["param2"] && parameters["param3"]) {
	        get3d(dao, parameters["id"], parameters["param1"], parameters["param2"], parameters["param3"], function (data) {
	            var object = {};
	            object.content = prepare_3d_chart_content(parameters, data);
	            success(object);
	        }, error);
	    }
		else
	        error("Request parameters missing");
	}
}

function prepare_3d_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\nthreeD_main(i, \"" + parameters["param1"] + "\", \"" + parameters["param2"] + "\", \"" + parameters["param3"] + "\", data);";
    output += "\n})();</script>";

    return output;
}

var get3d = function(dao, id, param1, param2, param3, success, error){
    dao.getData(id, function(array, args, mins, maxes){
        var data = Array.apply(null, new Array(array.length)).map(Number.prototype.valueOf,0)
        if (args.indexOf(param1) != -1) {
            for (var i in data) {
                data[i] = [array[i].arguments[param1]];
            }
        }
        else{
            for (var i in data) {
                data[i] = [array[i].result[param1]];
                // console.log(array[i].result[param1])
            }
        }
        if (args.indexOf(param2) != -1) {
            for (var i in data) {
                data[i].push(array[i].arguments[param2]);
            }
        }
        else{
            for (var i in data) {
                data[i].push(array[i].result[param2]);
            }
        }
        if (args.indexOf(param3) != -1) {
            for (var i in data) {
                data[i].push(array[i].arguments[param3]);
            }
        }
        else{
            for (var i in data) {
                data[i].push(array[i].result[param3]);
            }
        }
        // console.log(param1, param2, param3)
        success(data);
    }, error);
}

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}