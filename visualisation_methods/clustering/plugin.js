var info = {
    name: "Clustering chart",
    id: "clusteringModal",
    group: "basic",
    image: "/chart/images/material_design/clustering.png",
    description: "Clustering charts - k-means clustering"
}

var DIR = "visualisation_methods/clustering/";

var jade = require('jade');
var rstats = require("rstats"); 
var R  = new rstats.session();
var fs = require('fs');

R.parseEvalQ("require('e1071', quietly=TRUE)");
R.parseEvalQ("require('RJSONIO', quietly=TRUE)");
var clusteringFunction = fs.readFileSync(DIR + 'clustering_function.R').toString();
R.parseEvalQ(clusteringFunction);
var clusteringTemplate = fs.readFileSync(DIR + 'clustering_template.R').toString();

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

String.prototype.toEscapedString = function() {
   return '"' + this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '"';
} 

function handler(dao) {
	return function(parameters, success, error){
		if(parameters["id"] && parameters["chart_id"] && parameters["output_params"]) {
      //temporary
      var moes = ['fitness_calls', 'iemas_fitness', 'time_elapsed'];  //passed as parameter in request ("output_params")
      var firstLevel = 8;                                             //should be passed as parameter
      var secondLevel = 8;                                            //should be passed as parameter
      //---------
      getClustering(dao, parameters["id"], parameters["output_params"], moes, firstLevel, secondLevel, function (data, viewer) {
          var object = {};
          object.content = prepare_clustering_chart_content(parameters, data, viewer, moes, firstLevel, secondLevel, parameters["id"]);
          success(object);
      }, error);
    }
		else
	        error("Request parameters missing");
	}
}

function prepare_clustering_chart_content(parameters, data, viewer, moes, firstLevel, secondLevel, experimentID) {
  var output = "<script>(function() { \nvar i=" + parameters["chart_id"] + ";";
  output += "\nvar data = " + JSON.stringify(data) + ";";
  output += "\nvar viewer = " + viewer.toEscapedString() + ";";
  output += "\nvar moes = " + JSON.stringify(moes) + ";";
  output += "\nclustering_main(i, data, viewer, moes, " + firstLevel + ", " + secondLevel + ", '" + experimentID + "');";
  output += "\n})();</script>";

  return output;
}

var getClustering = function(dao, id, output, moes, firstLevel, secondLevel, success, error){
  //temporary
  var csvData = fs.readFileSync(DIR + "data.csv").toString();     //should be retrieved from db - temporary solution: pass as parameter in request or get from EM
  //---------
  R.parseEvalQ(clusteringTemplate.format(csvData.toEscapedString(),  JSON.stringify(moes).toEscapedString(), firstLevel, secondLevel));
  data = R.get("result");

  function storeIndexes(i) {
    return data[i]['indexes'];
  }

  for(var j in data) {
    if(data[j]["subclusters"].length == 0){
      var ind = parseInt(j)+1;
      data[j]["subclusters"][0] = {
        cluster: ind + 's1',
        ranges: data[j]['ranges'],
        means: data[j]['means'],
        indexes: storeIndexes(j)
      }
    }
  }
  var viewer = jade.renderFile(DIR + 'details.jade', {clusters: data, experimentID: id});
  success(data, viewer);
}

module.exports = {
	info: info,
	get_handler: function(dao) { return handler(dao); }
}