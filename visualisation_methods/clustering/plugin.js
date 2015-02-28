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
	            object.content = prepare_clustering_chart_content(parameters, data, parameters["id"]);
	            success(object);
	        }, error);
	    }
		else
	        error("Request parameters missing");
	}
}

function prepare_clustering_chart_content(parameters, data, experimentID) {
    var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
    output += "\nvar data = " + JSON.stringify(data) + ";";
    output += "\nclustering_main(i, data,'" + experimentID + "');";
    output += "\n})();</script>";

    return output;
}

var getClustering = function(dao, id, output, success, error){
    dao.getData(id, function(array, args, mins, maxes){
        var data = [
                        {
                            //name?
                            //moes?
                            "simulation_ids" : [ 25,764,57,2,68 ],
                            "subclusters" : [
                                {
                                    "simulation_ids" : [ 25,764,57 ]
                                }, {
                                    "simulation_ids" : [ 2,68 ]
                                }
                            ]
                        }, {
                            "simulation_ids" : [ 326,86,7,9 ],
                            "subclusters" : [
                                {
                                    "simulation_ids" : [ 326,86,7 ]
                                }, {
                                    "simulation_ids" : [ 9 ]
                                }
                            ]
                        }, {
                            "simulation_ids" : [ 47,56,456,497 ],
                            "subclusters" : []
                        }
                    ];
        success(data);
    }, error);
}

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}