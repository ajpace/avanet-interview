angular.module('avAspect').directive('avAspect', function() {
  var imageSize = 200;
  return {
    restrict: 'E',
    require: 'ngModel',
    // Normally this template would be in separate file, but that doesn't work too well while developing on a chromebook.
    template: '<div class="aspect-widget"><canvas width="' + imageSize + '" height="' + imageSize + '"></canvas><img src="CompassRose2.png" width="' + imageSize + '" /></div>',
    link: function(scope, element, attrs, ngModelCtrl) {
      var center = imageSize / 2;
      var circleRadius = imageSize / 2 - 5;
      var lastAngle = null;
      var HALF_PI = Math.PI / 2;
      var TWO_PI = Math.PI * 2;
      
      // It isn't ideal to grab the bounding box every time we want to calculate the angle, so we cache it.
      // In the case where the bounding rect changes, we'll update it.
      var boundingRect = element[0].getBoundingClientRect();
      scope.$watch(function() {
        var rect = element[0].getBoundingClientRect();
        return {top: rect.top, left: rect.left};
      }, function(newRect) {
        boundingRect = newRect;
      }, true);
      
      // Calculate the angle of the current mouse position to the center of the compass.
      function getEventAngle(evt) {
        var x, y;
        if (evt.touches) {
          x = evt.touches[0].pageX - boundingRect.left;
          y = evt.touches[0].pageY - boundingRect.top;
        } else {
          x = evt.offsetX;
          y = evt.offsetY;
        }
        var angle = Math.atan2(y-center, x-center);
        if (angle < 0) {
          angle += TWO_PI;
        }
        return angle;
      }
      
      function redraw() {
        ctx.clearRect(0, 0, imageSize, imageSize);

        if (!ngModelCtrl.$modelValue) {
          return;
        }
        
        var startAngle = ngModelCtrl.$modelValue.startAngle;
        var endAngle = ngModelCtrl.$modelValue.endAngle;
        
        // Make sure the two are at most half a circle away from each other.
        // This means that if the user attempts to draw a semi-circle larger than half, we'll
        // flip the circle so that the user is now selecting the other half of the aspect range.
        if (endAngle - startAngle > Math.PI) {
          endAngle -= TWO_PI;
        } else if (startAngle - endAngle > Math.PI) {
          startAngle -= TWO_PI;
        }
        var counterClockwise = startAngle > endAngle;
          
        ctx.beginPath();
        ctx.arc(center, center, circleRadius, startAngle, endAngle, counterClockwise);
        ctx.lineTo(center, center);
        ctx.fill();
        ctx.stroke();
      }
      
      var canvas = element.find('canvas');
      var ctx = canvas[0].getContext('2d');
      ctx.strokeStyle = 'rgb(100,255,100)';
      ctx.fillStyle = 'rgba(100,255,100,0.2)';
      
      scope.$watch(
        function() { return ngModelCtrl.$modelValue; },
        redraw,
        true);
      
      var isDragging = false;
      var dragStart = null;
      element.on('mousedown touchstart', function(evt) {
        isDragging = true;
        dragStart = getEventAngle(evt);
        evt.preventDefault();
        evt.stopImmediatePropagation();
      });
      element.on('mouseup touchend', function(evt) {
        isDragging = false;
        evt.preventDefault();
        evt.stopImmediatePropagation();
      });
      element.on('mousemove touchmove', function(evt) {
        if (isDragging) {
          var endAngle = getEventAngle(evt);
          ngModelCtrl.$setViewValue({startAngle: dragStart, endAngle: endAngle});
        }
      });
    }
  };
});