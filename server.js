var dgram = require('dgram')
	, http = require('http')
	, osc = require('omgosc')
	, delay = 5000

	var server = new osc.UdpReceiver(5000);
	server.on('', function (msg) {
		var col = msg.path.match(/\/color\/([0-9]+)/);
		if (col && col.length > 1) {
			console.log('New color: ' + col[1] + ' Fade: ' + msg.params[0]);
			send('/color/' + col[1] + '/' + (currentTime() + delay) + '/' + msg.params[0],
				'POST',
				function (chunk) {
					console.log(chunk);
				},
				function (err) {
					console.log('Color set failed: ' + err.message);
				});
		}
	});
	server.on('/bar', function (msg) {
		var barT = 600 * 4
			, bar = msg.params[0]
			, start = currentTime() - (bar * barT)
		console.log('Current bar: ' + bar);
		send('/time/' + start,
			'POST',
			function (chunk) {
				console.log(chunk);
			},
			function (err) {
				console.log('Color set failed: ' + err.message);
			});
	});

	server.on('/scene', function (msg) {
		console.log('Current scene: ' + msg.params[0]);
		send('/scene/' + msg.params[0] + '/' + (currentTime() + delay),
			'POST',
			function (chunk) {
				console.log(chunk);
			},
			function (err) {
				console.log('Color set failed: ' + err.message);
			});
	});

/*var server = dgram.createSocket('udp4');

server.on('message', function (msg, rinfo) {
	console.dir(msg.toString('utf-8'));
	console.log('server got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);
});

server.on('listening', function () {
	var address = server.address();
	console.log('server listening ' + address.address + ':' + address.port);
});

server.bind(5000);*/

function send(path, method, success, error) {
	var opt = {
		host: 'chronos.azurewebsites.net',
		/*host: 'localhost',
		port: 3000,*/
		path: path,
		method: method
	};
	var req = http.request(opt, function (res) {
		res.setEncoding('utf8');
		res.on('data', success);
	})
	.on('error', error)
	.end();
}


var pingOptions = function () {
	return {
		host: 'chronos.azurewebsites.net',
		/*host: 'localhost',
		port: 3000,*/
		path: '/ping?time=' + (new Date).getTime(),
		method: 'GET'
	};
}

var latency = 0
	, timeDiff = 0
	, currentTime = function () { return (new Date).getTime() - timeDiff; }
function ping() {
	var pingReq = http.request(pingOptions(), function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			try {
				var obj = JSON.parse(chunk)
			}
			catch (e) {
				return;
			}
			latency = ((new Date).getTime() - obj.time) / 2;
			timeDiff = (new Date).getTime() - (obj.myTime + latency);
		});
		setTimeout(ping, 2000);
	});
	pingReq.on('error', function (e) {
		console.log('problem with ping: ' + e.message);
		setTimeout(ping, 5000);
	});
	pingReq.end();
}
ping();

