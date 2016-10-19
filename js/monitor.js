
(function(window){
	var _XMLHttpRequest = window.XMLHttpRequest;
	window.XMLHttpRequest = function(flags) {
	    var req;
	    req = new _XMLHttpRequest(flags);
	    monitorXHR(req);
	    return req;
	};
	var _kb  = function (bytes) {
		return (bytes / 1024).toFixed(2);//四舍五入2位小数
	}
	var getNow =  function() {
		return window.performance.now()
	}

	var monitorXHR = function(req) {
		req.ajax = {};
		//var _change = req.onreadystatechange;
		req.addEventListener('readystatechange', function() {
			if(this.readyState == 4) {
				req.ajax.end = getNow();//埋点

				if ((req.status >= 200 && req.status < 300) || req.status == 304 ) {//请求成功
						if(req instanceof XMLHttpRequest && (key === 'responseText' || key === 'responseXML')){
							req.ajax.endBytes = _kb(req.responseText.length * 2);//KB
						}
				}else {
					req.ajax.endBytes = 0;
				}
				req.ajax.interval = req.ajax.end - req.ajax.start;
				console.error(JSON.stringify(req.ajax))
			}
		}, false);

		var _open = req.open;
		req.open = function(type, url, async) {
			req.ajax.type = type;
			req.ajax.url = url;
	    	return _open.apply(req, arguments);
		};

		var _send = req.send;
		req.send = function(data) {
			req.ajax.start = getNow()
			var bytes = 0;
			if(data) {
				req.ajax.startBytes = _kb(JSON.stringify(data).length * 2 );
			}
	    	return _send.apply(req, arguments);
		};
	};

})(window)
