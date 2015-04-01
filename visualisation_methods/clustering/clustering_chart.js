function clustering_main(i, data, viewer, moes, firstLevel, secondLevel, experimentID) {
    $('body').append(viewer);
    var dialog = $('#clusters_details');
    dialog.on("closed", function() {
        $('#clusteringModal').foundation('reveal', 'open');
    })

    function openViewer() {
        return function(){
            var clusterID = this.id;
            var viewer = $("#viewer_"+clusterID);
            var spec = $("#spec_"+clusterID);

            $("a.sim_link").on('click', function() {
                spec.hide();
                viewer.html(window.loaderHTML);
                viewer.show();
                viewer.load('/experiments/' + experimentID + '/simulations/' + $(this).data("sim-id"));
            });
            $("a.spec_link").on('click', function() {
                viewer.hide();
                spec.show();
            });
            
            dialog.show();
            $('#clusters_details row.cluster_row').hide();
            $('#' + clusterID).show();
            dialog.foundation('reveal', 'open');
        }
    }

    var clusters = [];
    var subclusters = [];
    var subcluster_size;
    var brightness;
    var colors = Highcharts.getOptions().colors;
    for(var j in data) {
        var color = colors[ j%colors.length ];
        clusters.push({
            y: data[j]["indexes"].length,
            id: 'cluster_' + data[j]["cluster"],
            visible: true,
            indexes: data[j]["indexes"],
            means: data[j]["means"],
            ranges: data[j]["ranges"],
            color: color
        });
        var cluster_size = data[j]["subclusters"].length;
        for(var k in data[j]["subclusters"]){
            subcluster_size = data[j]["subclusters"][k]["indexes"].length;
            brightness = 0.2 - (1.0*k / cluster_size) / 5;
            subclusters.push({
                y: subcluster_size,
                id: 'cluster_' + data[j]["subclusters"][k]['cluster'],
                visible: true,
                indexes: data[j]["subclusters"][k]["indexes"],
                means: data[j]["subclusters"][k]["means"],
                ranges: data[j]["subclusters"][k]["ranges"],
                color: Highcharts.Color(color).brighten(brightness).get()
            });
        }

    }
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: $('#clustering_chart_'+ i + " .chart")[0],
            type: 'pie'
        },
        title: {
            text: JSON.stringify(moes) + ", " + firstLevel + ", " + secondLevel
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
            size: '70%',
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
            size: '100%',
            innerSize: '70%',
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
        }],
        tooltip: {
            formatter: function() {
                // console.log(this);
                return "Cluster size: " + this.point.indexes.length + "<br/><b>Click for details</b>";
            }
        }
    });
}