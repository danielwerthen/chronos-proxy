var dgram = require('dgram')
	, http = require('http')

var server = dgram.createSocket('udp4');

server.on('message', function (msg, rinfo) {
	console.log('server got: ' + msg + ' from ' + rinfo.address + ':' + rinfo.port);
});

server.on('listening', function () {
	var address = server.address();
	console.log('server listening ' + address.address + ':' + address.port);
});

server.bind(5000);

var pingOptions = function () {
	return {
		//host: 'chronos.azurewebsites.net'
		host: 'localhost'
		, port: 3000
		, path: '/ping?time=' + (new Date).getTime()
		, method: 'GET'
	};
}

var latency = 0
	, timeDiff = 0
	, currentTime = function () { return (new Date).getTime() - timeDiff; }
function ping() {
	var pingReq = http.request(pingOptions(), function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			var obj = JSON.parse(chunk)
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

