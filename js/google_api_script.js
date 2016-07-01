var script = document.createElement("script");
$(script).attr("type", "text/javascript");
script.onerror = function(event){ 
	setTimeout(function() {
		if(!window.google || !window.google.maps) {
			alert('Unfortunately, Google Maps is currently unavailable.');
		}
	}, 2000);
};
script.onload = function(event){
  console.log("Maps API loaded successfully.");
};
script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAD6HGzDWzuXW9bRlTLEtgWp5FNO0sUYxY&callback=init";
document.body.appendChild(script);