/** description 

*/

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	if(request.action == "xhttp") {
		var xhttp = new XMLHttpRequest();
		var method = request.method ? request.method.toUpperCase() : 'GET';
		var professorName = request.professorName;
		var url = request.url;

		var data = {
			responseXML : "",
			professorName: professorName,
			url : url
		};

		xhttp.onload = function() {
			data.responseXML = this.responseText;
			callback(data);
		};
		xhttp.onerror = function() {
			// Do something on error. Don't forget to invoke
			// callback to clean up the communication port
			callback();
		};
		xhttp.open(method, request.url, true);
		if (method == 'POST') {
			xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
		xhttp.send();
		return true; // prevents the callback from being called too early on return
	}
});