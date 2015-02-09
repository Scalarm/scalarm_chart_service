//var DBURL = require("./config.js").db_url;
var COLLECTION_NAME = "experiment_instances_";
var CAPPED_COLLECTION_NAME = "experiment_progress_notifications";
var mongo = require('mongodb');
var client = mongo.MongoClient;
var crypto = require('crypto');

var connect = function(address, success, error){
	client.connect(address, function(err, db){
		if (err){
			error();
			return;
		}
		success();

		var getData = function(id, convertData, error){
			var filter = {is_done: true, is_error: {'$exists': false}};
			var fields = {fields: {arguments: 1, values: 1, result: 1}};

			db.collection(COLLECTION_NAME+id).find(filter, fields).toArray(function(err, array){
				if(err){
					error(err.toString());
					return;
				}
				if(array.length==0){
					error("No such experiment or no runs done");
					return;
				}

				var args_fullnamed = array[0].arguments.split(',');
				var args = args_fullnamed.map(function(arg){ 
					return arg.split('___').slice(-1)[0];
				});

				array = array.map(function(data){
					var values = data.values.split(',');

					var new_args = {};
					for(var i = 0; i<args.length; i++){
						new_args[args[i]] = parseInt(values[i]);
						// args.push({
						// 	name: arguments[i],
						// 	value: values[i]
						// });
					}

					data.arguments = new_args;
					delete data.values;

					return data;
				})

				var mins = [], maxes = [];
				for (i in args) {
					mins[args[i]] = min(array, args[i]);
					maxes[args[i]] = max(array, args[i]);
				}
				
				convertData(array,args,mins,maxes);
			});
		};

		var checkIfExperimentVisibleToUser = function(userID, experimentID, success, error) {
	    if(!mongo.BSONPure.ObjectID.isValid(experimentID)) {
		error("'" + experimentID + "' is not valid ObjectID");
		return;
	    }
            console.log("\tuserID: ", userID);
            console.log("\texperimentID: ", experimentID);
			db.collection("experiments").find({$or : [
				{"_id": mongo.ObjectID(experimentID), "user_id": mongo.ObjectID(userID)}, 
				{"_id": mongo.ObjectID(experimentID), "shared_with" : {$in:[mongo.ObjectID(userID)]}}
			]}).toArray(function(err, array) {
				if(array.length>0) {
					success("OK!");
				}
				else {
					error("Access denied.");
				}
			});
		};

        var checkUserAndPassword = function(username, password, success, error){
            db.collection('scalarm_users', function(err, collection){
                if(err){
                    error(err.toString());
                    return;
                }
                else{
                    collection.findOne({login: username}, function(err, item){
                        if(err){
                            error(err.toString());
                            return;
                        }
                        else if(item) {
                            var salt = item.password_salt;
                            var hash = crypto.createHash('sha256').update(password+salt).digest('hex');
                            if(hash===item.password_hash){
                                success(item._id.toString());
                            }
                            else{
                                error("Wrong password\n");
                            }
                        }
                        else{
                            error("No such user\n");
                        }
                    })
                }
            })
        }

		var getParameters = function(experimentID, success, error) {
			if(!mongo.BSONPure.ObjectID.isValid(experimentID)) {
	                	error("'" + experimentID + "' is not valid ObjectID");
	                	return;
   	                }

			var data = {};

			var filter = {is_done: true, is_error: {'$exists': false}};
			var fields = {fields: {result: 1}};

			db.collection(COLLECTION_NAME+experimentID, function(err, collection) {
				if(err){
					error(err.toString());
                    return;
				}
	        	collection.findOne(filter, function(err, item) {
	        		data["result"] = [];
	        		if(item){
	        			for(var k in item.result){
	        				if(typeof item["result"][k] == "number") {
                                data["result"].push({
                                    label: (k[0].toUpperCase() + k.slice(1)).split("_").join(" "),
                                    id: k
                                });
                            }
	        			}
	        		}
		            db.collection("experiments").find({"experiment_id": mongo.ObjectID(experimentID)}).toArray(function(err, array){
						if (err) error(err.toString());
						if(array[0]){
							//TODO - get parameters from all gruops
							var parameters = array[0]["experiment_input"][0]["entities"][0]["parameters"];
							data["parameters"] = parameters.map(function(param){
								return {
											label: param["label"],
											id:    param["id"]
									   };
							})
							success(data);
						}
						else{
							error("No such experiment")
						}
					})
		        });
			   
		    });

			
		};

		var createStreamFor = function(connection, experimentID, callback){
			var stream = db.collection(CAPPED_COLLECTION_NAME).find({date: {"$gte": new Date()/1000}, experiment_id: experimentID},
																 {tailable: true, awaitdata: true, numberOfRetries: -1}).stream();

			stream.on('data', function(item) {
				console.log(item);
				connection.send(JSON.stringify(item.bar_info));
			});
			stream.on('error', function(error) {
				console.log("Error retrieving data from capped collection: " + error);
			})
			stream.on('close', function() {
				console.log("Stream closed (capped collection)");
			})
			callback(stream);
		};

		
		module.exports.checkIfExperimentVisibleToUser = checkIfExperimentVisibleToUser;
		module.exports.getParameters = getParameters;
		module.exports.createStreamFor = createStreamFor;
        module.exports.checkUserAndPassword = checkUserAndPassword;

        module.exports.getData = getData;
	});
}

var getValue = function(data, name){
	// console.log(data.arguments[name]);
	return data.arguments[name];
};

var min = function(array, name) {
    return array.reduce(function(a, b) { return a <= getValue(b,name) ? a : getValue(b,name);}, Infinity);
};

var max = function(array, name) {
    return array.reduce(function(a, b) { return a >= getValue(b,name) ? a : getValue(b,name);}, -Infinity);
};

function calculateAverage(data, parameter_name, parameter_value, outputParam) {
	var array_of_params=data.filter(function(obj) {
		return getValue(obj, parameter_name) == parameter_value
	});
	var average = array_of_params.reduce(function(previous, current) {
		return previous + current.result[outputParam];
	}, 0) / array_of_params.length;
	return average;
};

module.exports.connect = connect;

module.exports.getValue = getValue;
module.exports.calculateAverage = calculateAverage;

