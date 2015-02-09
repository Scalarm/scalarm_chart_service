var methods = require("./methods").methods;
var groups = require("./methods").groups;

for(var i in methods){
    var name = methods[i];
    var info = require("./visualisation_methods/" + name + "/plugin.js").info;
    var group_name = info.group;
    var group = groups[group_name];
    if(group){
        if(group.methods){
            group.methods.push(info);
        }
        else {
            group.methods = [info];
        }
    }
    else{
        throw Error("No such group: " + group_name + "(method: " + name + ")");
    }
}

module.exports = {groups: groups};

//module.exports =
//{
//    groups: [
//                {
//                    id: "<<id_of_group>>",
//                    name: "<<name_of_group>>",
//                    methods: [
//                                {
//                                    id: "<<id_of_method>>",
//                                    name: "<<name_of_method>>",
//                                    image: "<<link_to_image_through_LB>>", //e.g /chart/images/material_design/interaction_icon.png",
//                                    em_class: "{histogram-analysis,rtree-analysis,bivariate-analysis}", //optional!
//                                    description: "<<description>>" //show as tooltip on UI
//                                },
//                                {
//                                    //next method...
//                                }
//                             ]
//                },
//                {
//                    //next group...
//                }
//            ]
//};