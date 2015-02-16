var info = {
    name: "Clustering chart",
    id: "clusteringModal",
    group: "basic",
    image: "/chart/images/material_design/clustering.png",
    description: "Clustering charts - k-means clustering"
}

function handler(dao) {
	return function(parameters, success, error){
		if(parameters["id"] && parameters["chart_id"] && parameters["output"]) {
	        getClustering(dao, parameters["id"], parameters["output"], function (data) {
	            var object = {};
	            object.content = prepare_clustering_chart_content(parameters, data);
	            success(object);
	        }, error);
	    }
		else
	        error("Request parameters missing");
	}
}

function prepare_clustering_chart_content(parameters, data) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\nclustering_main(i, data);";
    output += "\n})();</script>";

    return output;
}

var getClustering = function(dao, id, output, success, error){
    dao.getData(id, function(array, args, mins, maxes){
        //TODO
        success(undefined);
    }, error);
}

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}