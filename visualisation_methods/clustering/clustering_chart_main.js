function clustering_main(i, data, experimentID) {
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
            name: 'Cluster size',
            data: data,
            size: '80%',
            dataLabels: {
                // formatter: function () {
                //     return this.y > 5 ? this.point.name : null;
                // },
                color: 'white',
                distance: -30
            },
            point: {
                events: {
                    click: function () {
                        var extension_dialog = $('#extension-dialog');
                        extension_dialog.html(window.loaderHTML);
                        var links = "";
                        for (var i in this.simulation_ids) {
                                links+='<a data-simid="' + this.simulation_ids[i] + '"> Simulation ' + this.simulation_ids[i] +'</a></br>';
                        };
                        extension_dialog.html("<div class='small-6 columns' id='cluster_links'>" + links + "</div><div class='small-6 columns' id='cluster_viewer'></div>");
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
            }
        }]
    });
}