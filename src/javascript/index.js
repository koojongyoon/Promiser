var validateButton = function() {
	var departureInput = document.querySelectorAll(".line-size input")[0];
	if(departureInput.value !== "") {
		document.querySelector("#search-button").removeAttribute("disabled");
	} else {
		document.querySelector("#search-button").setAttribute("disabled","disabled");
	}
};

var documentReady = function() {
	var departureInput = document.querySelectorAll(".line-size input")[0];

	document.getElementById('search-button').addEventListener('click', function(){
		var departureLatitude = departureInput.getAttribute("lat");
		var departureLongitude =departureInput.getAttribute("lng");

		location.replace("/html/route_select.html?"+ "departure="+ departureInput.value+ "&depLat=" + departureLatitude + "&depLng=" + departureLongitude);
	});
}

function initAutocomplete() {
	var departureInput = document.querySelectorAll(".line-size input")[0];

	var searchDepartureBox = new google.maps.places.SearchBox(departureInput);

	searchDepartureBox.addListener('places_changed', function() {
		var departureInput = document.querySelectorAll(".line-size input")[0];
		var places = searchDepartureBox.getPlaces();
		departureInput.setAttribute("lat", places[0].geometry.location.lat());
		departureInput.setAttribute("lng", places[0].geometry.location.lng());
	});
}
