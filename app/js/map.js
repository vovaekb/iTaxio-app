function reloadMap() {
    if(viewModel.map != null) {
        clearMap();
    }

    DG.load(function() {
        console.log( "Load map started" );

        viewModel.map = new DG.Map('map');

        var lat = viewModel.middlePoint() != undefined ? viewModel.middlePoint().lat : 56.83124,
            lon = viewModel.middlePoint() != undefined ? viewModel.middlePoint().lon : 60.606182;

        console.log( "Center coords defined" );

        var leftBottom = new DG.GeoPoint( viewModel.leftLon(), viewModel.bottomLat() );
        var rightTop = new DG.GeoPoint( viewModel.rightLon(), viewModel.topLat() );
        var mapBounds = new DG.Bounds( leftBottom, rightTop );
        viewModel.map.setBounds( mapBounds );

        /*viewModel.map.setCenter(new DG.GeoPoint(lon, lat));
        viewModel.map.zoomTo( viewModel.zoomLevel() ); //15);*/

        viewModel.map.controls.add(new DG.Controls.Zoom());
        viewModel.map.geoclicker.disable();
    });
}

function drawEdgePoints() {
    for(var i = 0; i < viewModel.edgePoints().length; i++) {
        (function(i) {
            setTimeout(function(){
                var point = viewModel.edgePoints()[i];
                var geoPoint = new DG.GeoPoint(point.lon, point.lat);

                var marker = new DG.Markers.MarkerWithBalloon({
                    geoPoint: geoPoint,
                    icon: new DG.Icon('http://maps.api.2gis.ru/demo/img/yellow_marker.png', new DG.Size(32, 32)),
                    hoverIcon: new DG.Icon('http://maps.api.2gis.ru/demo/img/highlighted_marker.png', new DG.Size(32, 32)),
                    balloonOptions: ({ contentHtml: point.info })
                });

                viewModel.map.markers.add(marker);
                //viewModel.map.setCenter(geoPoint);
                viewModel.map.redraw();
            }, 1000 * i);

        })(i);
    }

}

function drawRoute() {
    console.log( this );

    console.log( "Middle lat: " + this.middlePoint().lat + ", middle lon: " + this.middlePoint().lon );
    var centerLat = this.middlePoint().lat,
        centerLon = this.middlePoint().lon;

    //viewModel.map.setCenter(new DG.GeoPoint(centerLon, centerLat));

    // GeoPoint: lon, lat
    var point = null;
    var pointSet = [];

    var style = new DG.Style.Geometry();
    style.strokeColor = "red";
    style.strokeOpacity = 1;
    style.strokeWidth = 4;

    for(var i = 0; i < this.routePoints().length; i++) {
        var routePoint = this.routePoints()[i];

        var geoPoint = new DG.GeoPoint(routePoint.lon, routePoint.lat);
        pointSet.push(geoPoint);
    }

    var polyline = new DG.Geometries.Polyline(pointSet, style);

    setTimeout(this.proxy(function() {
        this.map.geometries.add(polyline);
        this.map.redraw();
    }), 10);
}

function clearMap() {
    viewModel.map.destroy();
}