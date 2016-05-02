var c1 = document.getElementById("c1");
var parent = document.getElementById("p1");
// c1.width = parent.offsetWidth - 40;
// c1.height = parent.offsetHeight - 40;
// c1.width =  400;
// c1.height = 400;

var data1 = {
  labels: ["M", "T", "W", "T", "F", "S", "S"],
  datasets: [{
    fillColor: "rgba(255,255,255,.1)",
    strokeColor: "rgba(255,255,255,1)",
    pointColor: "#123",
    pointStrokeColor: "rgba(255,255,255,1)",
    data: [150, 200, 235, 390, 290, 250, 250]
  }]
}

var options1 = {
  scaleFontColor: "rgba(255,255,255,1)",
  scaleLineColor: "rgba(255,255,255,1)",
  scaleGridLineColor: "transparent",
  bezierCurve: false,
  scaleOverride: true,
  scaleSteps: 5,
  scaleStepWidth: 100,
  scaleStartValue: 0
}

new Chart(c1.getContext("2d")).Line(data1, options1)
