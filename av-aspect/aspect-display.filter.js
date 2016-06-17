angular.module('avAspect')
  .filter('aspectDisplay', function() {
    function radiansToDegreesFromNorth(radians) {
      var degrees = Math.round(radians * 180 / Math.PI + 90);
      if (degrees >= 360) {
        degrees -= 360;
      }
      return degrees;
    }
    return function(aspect) {
      if (aspect) {
        // The aspect model is radians from the x-axis (which is East).
        // We translate to degrees from North.
        var startDegrees = radiansToDegreesFromNorth(aspect.startAngle);
        var endDegrees = radiansToDegreesFromNorth(aspect.endAngle);
        return startDegrees + '° - ' + endDegrees + '°';
      }
      return '';
    };
  });