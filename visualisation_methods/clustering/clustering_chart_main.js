function clustering_main(i, data, experimentID) {
    function openViewer() {
        return function(){
            var extension_dialog = $('#extension-dialog');
            extension_dialog.html(window.loaderHTML);
            var links = "";
            for (var j in this.simulation_ids) {
                    links+='<a data-simid="' + this.simulation_ids[j] + '"> Simulation ' + this.simulation_ids[j] +'</a></br>';
            };
            extension_dialog.html("<div class='small-4 columns' id='cluster_links'>" + links + "</div><div class='small-8 columns' id='cluster_viewer'></div>");
            $("#cluster_links a").on('click', function() {
                $("#cluster_viewer").load('/experiments/' + experimentID + '/simulations/' + $(this).data("simid"));
            })
            window.reopeningModals = {
              id: "clusteringModal",
              isActive: true
            }
            extension_dialog.foundation('reveal', 'open');
        }
    }

    var clusters = [];
    var subclusters = [];
    var subcluster_size;
    var brightness;
    var colors = Highcharts.getOptions().colors
    for(var j in data) {
        var color = colors[ j%colors.length ];
        clusters.push({
            y: data[j]["simulation_ids"].length,
            //name: obj,?
            visible: true,
            simulation_ids: data[j]["simulation_ids"],
            color: color
        });
        if(data[j]["subclusters"].length == 0){
            subclusters.push(clusters[j]);
        } else {
            for(var k in data[j]["subclusters"]){
                subcluster_size = data[j]["subclusters"][k]["simulation_ids"].length
                brightness = 0.2 - (k / subcluster_size) / 5;
                subclusters.push({
                    y: subcluster_size,
                    visible: true,
                    simulation_ids: data[j]["subclusters"][k]["simulation_ids"],
                    color: Highcharts.Color(color).brighten(brightness).get()
                });
            }
        }
    }
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: $('#clustering_chart_'+ i + " .chart")[0],
            type: 'pie'
        },
        title: {
            text: 'Browser market share, April, 2011'
        },
        yAxis: {
            title: {
                text: 'Total percent market share'
            }
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },
        series: [{
            //name: 'Cluster size',
            data: clusters,
            size: '60%',
            dataLabels: {
                formatter: function () {
                    return null; //this.y > 5 ? this.point.name : null;
                }//,
                //color: 'white',
                //distance: -30
            },
            point: {
                events: {
                    click: openViewer(this)
                }
            }
        }, {
            data: subclusters,
            size: '80%',
            innerSize: '60%',
            dataLabels: {
                formatter: function () {
                    return null; //this.y > 5 ? this.point.name : null;
                }//,
                //color: 'white',
                //distance: -30
            },
            point: {
                events: {
                    click: openViewer(this)
                }
            }
        }]
    });
}