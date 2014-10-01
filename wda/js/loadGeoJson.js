    var map;
    var marker;
    var lastSelected;



      function initializeMap() {

        // Create a simple map.
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: {lat: 51.5, lng: -2.9},
          scrollwheel:false,
        });

        // Load a GeoJSON from the same server as our demo.
        map.data.loadGeoJson('data/district.json');


        map.data.setStyle({
          fillColor: 'green'
        });

        map.data.addListener('mouseover', function(evt) {
          //$("#region").text( evt.feature.getProperty("CTYUA13NM") );
          $("#regionName").text( evt.feature.getProperty("LAD11NM") );
          map.data.revertStyle();
          map.data.overrideStyle(evt.feature, {
              fillColor:'#aaa',
              fillOpacity: 0.2,
              strokeOpacity: 0.4,
              strokeColor: '#999',
              strokeWeight:2
            });
        });

        map.data.addListener('mouseout', function(evt) {
          map.data.revertStyle();
          $("#regionName").text( 'Click map to select an area' );
        });


        map.data.setStyle(function(feature) {
          var stroke = '#ccc';
          var color = '#f2f2f2';
          var op = 0.1
          if (feature.getProperty('isSelected')) {
            color = '#999';
            op=0.3
          }
          return /** @type {google.maps.Data.StyleOptions} */({
            fillColor: color,
            fillOpacity: op,
            strokeOpacity: 0,
            strokeColor: stroke,
            strokeWeight: 1
          });
        });

        map.data.addListener('click', function(evt) {
          if( lastSelected ){
            lastSelected.setProperty('isSelected', false);
          }

          if( evt.feature.getProperty('isSelected') ){
            evt.feature.setProperty('isSelected', false);
           // removeArea( evt.feature.getProperty("CTYUA13CD") );
            removeArea( evt.feature.getProperty("LAD11CD") );
          }else{
            evt.feature.setProperty('isSelected', true);
            lastSelected  =  evt.feature;
            var coords = evt.feature.getGeometry();
            var centroid = getCentroid(coords);
            map.panTo(centroid);
            //setArea( evt.feature.getProperty("CTYUA13CD") );
            //showSummary(evt.feature.getProperty("CTYUA13CD"));
            //setArea( evt.feature.getProperty("LAD11CD") );
            //showSummary(evt.feature.getProperty("LAD11CD"));

            //call to NESS
            censusAPI.getData(evt.feature.getProperty("LAD11CD"));
            censusAPI.setTitle( evt.feature.getProperty("LAD11NM") );
          }



        });

      }

    function showPoint(lat,lng){
      var myLatlng = new google.maps.LatLng(lat,lng);
      map.panTo(myLatlng);

      if(marker){
        marker.setMap(null);
      }

      marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: ''
      });

    }


    function displayArea(id){

      map.data.forEach( function (feature){
        if(feature.getProperty("LAD11CD")===id){
          feature.setProperty('isSelected', true);
        }else{
          feature.setProperty('isSelected', false);
        }

      })

    }


    function getCentroid(coords) {

          var minLat = 360.0;
    var maxLat = -360.0;
    var minLng = 360.0;
    var maxLng = -360.0;

      var len = coords.getLength();

      var temp = coords.getArray();

      for (var j = 0; j < len; j++) {
        var ring = coords.getAt(j);
        var ringLen = ring.getLength();


       for (var i = 0; i < ringLen; i++) {
                           var pt = ring.getAt(i);
                           var lat  = pt.lat();
                           var lng  = pt.lng();

                           if (lng < minLng) {
                               minLng = lng;
                           }
                           if (lng > maxLng) {
                               maxLng = lng;
                           }
                           if (lat < minLat) {
                               minLat = lat;
                           }
                           if (lat > maxLat) {
                               maxLat = lat;
                           }

                       }

     }

      var avLng = (minLng + maxLng) / 2;
      var avLat = (minLat + maxLat) / 2;
      //return new LatLon(avLat, avLng);
     return new google.maps.LatLng(avLat, avLng);
    }

    //google.maps.event.addDomListener(window, 'load', initialize);
