/*global define*/
define(['dojo/dom',
        'dojo/on',
        'DojoWidgets/CesiumWidget',
        'Core/DefaultProxy',
        'Core/JulianDate',
        'Core/Clock',
        'Core/ClockStep',
        'Core/ClockRange',
        'DynamicScene/DynamicBillboard',
        'DynamicScene/DynamicLabel',
        'DynamicScene/DynamicObject',
        'DynamicScene/DynamicPoint',
        'DynamicScene/DynamicPolygon',
        'DynamicScene/DynamicPolyline',
        'DynamicScene/CzmlObjectCollection',
        'DynamicScene/DynamicBillboardVisualizer',
        'DynamicScene/DynamicLabelVisualizer',
        'DynamicScene/DynamicPointVisualizer',
        'DynamicScene/DynamicPolygonVisualizer',
        'DynamicScene/DynamicPolylineVisualizer',
        'DynamicScene/VisualizerCollection',
        'CesiumViewer/loadCzmlFromUrl'],
function(dom,
         on,
         CesiumWidget,
         DefaultProxy,
         JulianDate,
         Clock,
         ClockStep,
         ClockRange,
         DynamicBillboard,
         DynamicLabel,
         DynamicObject,
         DynamicPoint,
         DynamicPolygon,
         DynamicPolyline,
         CzmlObjectCollection,
         DynamicBillboardVisualizer,
         DynamicLabelVisualizer,
         DynamicPointVisualizer,
         DynamicPolygonVisualizer,
         DynamicPolylineVisualizer,
         VisualizerCollection,
         loadCzmlFromUrl) {
    "use strict";
    /*global console*/

    var visualizers;
    var clock = new Clock(JulianDate.fromIso8601("2012-03-15T10:00:00Z"), JulianDate.fromIso8601("2012-03-15T20:00:00Z"), JulianDate.fromIso8601("2012-03-15T10:00:00Z"), ClockStep.SYSTEM_CLOCK,
            ClockRange.LOOP, 300);

    var _buffer = new CzmlObjectCollection("root", "root", {
        billboard : DynamicBillboard.createOrUpdate,
        label : DynamicLabel.createOrUpdate,
        orientation : DynamicObject.createOrUpdateOrientation,
        point : DynamicPoint.createOrUpdate,
        polygon : DynamicPolygon.createOrUpdate,
        polyline : DynamicPolyline.createOrUpdate,
        position : DynamicObject.createOrUpdatePosition,
        vertexPositions : DynamicObject.createOrUpdateVertexPositions
    });

    loadCzmlFromUrl(_buffer, 'Gallery/simple.czm');

    var cesium = new CesiumWidget({
        clock : clock,

        preRender : function(widget) {
            clock.tick();
            visualizers.update(clock.currentTime, _buffer);
        },

        postSetup : function(widget) {
            var scene = widget.scene;
            visualizers = new VisualizerCollection([new DynamicBillboardVisualizer(scene),
                                                    new DynamicLabelVisualizer(scene),
                                                    new DynamicPointVisualizer(scene),
                                                    new DynamicPolygonVisualizer(scene),
                                                    new DynamicPolylineVisualizer(scene)]);
        },

        onSetupError : function(widget, error) {
            console.log(error);
        }
    });

    cesium.placeAt(dom.byId("cesiumContainer"));

    on(window, 'resize', function() {
        cesium.resize();
    });
});