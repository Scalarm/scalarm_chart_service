function lindev_main(i, param1, param2, data) {
    var chart = new Highcharts.Chart({
        chart: {
            zoomType: 'xy',
            renderTo: $('#lindev_chart_'+ i + " .chart")[0]
        },
        credits: {
            enabled: false
        },
        title: {
            text: "Line chart with std. dev."
        },
        xAxis: {
            title: {
                text: param1
            }
        },
        yAxis: {
            title: {
                text: param2
            }
        },
        tooltip: {
            shared: true
        },
        series: [{
            name: 'series',
            data: data[0],
            tooltip: {
                pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}</span>: <b>{point.y:.1f}</b> '
            }
        }, {
            name: 'series stddev',
            type: 'errorbar',
            data: data[1],
            tooltip: {
                pointFormat: '(std dev range: {point.low:.3f}-{point.high:.3f})<br/>'
            }
        }]
    });
}