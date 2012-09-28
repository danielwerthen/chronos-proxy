var osc = require('node-osc');
var client = new osc.Client('127.0.0.1', 5000);
function red() {
	client.send('/scene', 1);
	client.send('/color/0', 2.5);
	setTimeout(blue, 5000);
}
red();
function blue() {
	client.send('/scene', 2);
	client.send('/color/2', 2.5);
	setTimeout(red, 5000);
}
/*client.send('/color/1', 100);
client.send('/color/2', 100);
client.send('/color/2', 100);
client.send('/scene', 1);
client.send('/scene', 2);
client.send('/scene', 3);

client.send('/bar', 0);
var c = 1;
setInterval(function () {
	client.send('/bar', c++);
}, 600 * 4);*/
