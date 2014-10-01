

var options = {

    chart: {
              type: 'column',
              style: {
                fontFamily: 'Open Sans',
                color:'#000'
              },
              spacingTop: 30,
              spacingLeft:30,
              backgroundColor:'#F9F9F9',
    },

    plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
    },

    title: {
        text: ''
    },

    xAxis: {
            categories: [
                'House, Detached ',
                'House, Semi-detached',
                'House, Terraced ',
                'Flat, block of flats',
                'Flat, converted or shared house',
                'Flat, commercial building'
            ]
    },

    yAxis: {
        min: 0,
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
            }
        },
        title: {
          text: '',
          style: {
            color: '#000',
            fontWeight:300
          },
          align: 'high',
          rotation: 0,
          y: -15,
        }
    },

    colors: [
            'rgb(0, 132, 209)',           // blue
            'rgb(255, 149, 14)',          // orange
            'rgb(255, 66, 14)',           // red
            'rgb(168, 189, 58)',          // green
            'rgb(144, 176, 201)',         // lt blue
            'rgb(255, 211, 32)',          // yellow
            'rgb(65, 64, 66)',            // dk grey
            'rgb(0, 61, 89)',             // dk grey
            'rgb(49, 64, 4)',             // dk grey
            'rgb(204, 204, 204)',         // lt grey
            'rgb(128, 128 , 128)'         // mid grey
    ],

    legend: {
            borderColor:null,
            borderRadius: 0,
            borderWidth: 1
    },

    credits:{
            enabled:false
    }

  };



  function initCharts(){

    Highcharts.setOptions(options);

    options.chart.type = 'column';
    options.title.text = "";
    //options.yAxis.reversed = true;
    options.yAxis.title = {
                              align: 'high',
                              offset: 50,
                              text: ''
                          };
    options.xAxis = {
                     labels: {
                         enabled: false
                     }
                  };
    options.chart.events= {
/*
                load: function () {
                  var chart = this,
                  yAxis = chart.yAxis[0]
                  titleWidth=0;

                  if(yAxis.axisTitle){
                    titleWidth = yAxis.axisTitle.getBBox().width;
                    yAxis.update({
                      title: {
                        offset: -80,
                        align:"low"
                      }
                    });
                  }

                }

*/
   };

   // options.legend.enabled = false;

    options.series = [{
            name: 'Detached',
            data: [0]

        }, {
            name: 'Semi-detached',
            data: [0]

        }, {
            name: 'Terraced',
            data: [0]

        }, {
            name: 'Flat, block of flats',
            data: [0]

        }, {
            name: 'Flat, shared house',
            data:[0]

        }, {
            name: 'Flat, commercial building',
            data: [0]

        }];

    options.tooltip = {
      formatter: function() {
          return '<b>'+ this.series.name + '</b><br/>'+
                    'Total properties: '+ Highcharts.numberFormat( this.point.y ,0);
      }
    }



    // house tenure


    options.chart.renderTo = 'ownedChart';
    //options.plotOptions.column.stacking = null;
    ownedChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'mortgageChart';
    mortageChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'councilChart';
    councilChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'socialChart';
    socialChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'landlordChart';
    landlordChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'otherChart';
    otherChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'typeChart';
    options.chart.type = 'bar';
    options.series.reverse();
    options.plotOptions.series = {stacking : 'percent'};
    options.legend.reversed = true;
    typeChart = new Highcharts.Chart(options);

    //House type
    options.series = [{
            name: 'Owned',
            data: [0]

        }, {
            name: 'Mortgaged',
            data: [0]

        }, {
            name: 'Rented from Council',
            data: [0]

        }, {
            name: 'Other social rental',
            data: [0]

        }, {
            name: 'Private landlord',
            data:[0]

        }, {
            name: 'Other',
            data: [0]

        }];

    options.chart.type = 'column';
    options.plotOptions.series = {};
    options.chart.renderTo = 'detachedChart';
    detachedChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'semiChart';
    semiChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'terracedChart';
    terracedChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'flatChart';
    flatChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'sharedChart';
    sharedChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'commercialChart';
    commercialChart = new Highcharts.Chart(options);

    options.chart.renderTo = 'tenureChart';
    options.chart.type = 'bar';
    options.series.reverse();
    options.plotOptions.series = {stacking : 'percent'};
    options.legend.reversed = true;
    tenureChart = new Highcharts.Chart(options);


  }
