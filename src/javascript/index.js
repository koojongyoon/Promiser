var validateButton = function() {
	var departureInput = document.querySelectorAll(".line-size input")[0];
	var destinationInput = document.querySelectorAll(".line-size input")[1];
	if(departureInput.value != "" && destinationInput.value != "") {
		document.querySelector("#search-button").removeAttribute("disabled");
	} else {
		document.querySelector("#search-button").setAttribute("disabled","disabled");
	}
}

var documentReady = function() {
	var departureInput = document.querySelectorAll(".line-size input")[0];
	var destinationInput = document.querySelectorAll(".line-size input")[1];

	document.getElementById('search-button').addEventListener('click', function(){
		var departureLatitude = departureInput.getAttribute("lat");
		var departureLongitude =departureInput.getAttribute("lng");
		var destinationLatitude = destinationInput.getAttribute("lat");
		var destinationLongitude = destinationInput.getAttribute("lng");

		location.replace("/html/route_select.html?"
		+ "departure="+ departureInput.value + "&destination=" + destinationInput.value
		+ "&depLat=" + departureLatitude + "&depLng=" + departureLongitude
		+ "&desLat=" + destinationLatitude + "&desLng=" + destinationLongitude);
	});
}


function initAutocomplete() {
	var departureInput = document.querySelectorAll(".line-size input")[0];
	var destinationInput = document.querySelectorAll(".line-size input")[1];

	var searchDepartureBox = new google.maps.places.SearchBox(departureInput);
	var searchDestinationBox = new google.maps.places.SearchBox(destinationInput);

	searchDepartureBox.addListener('places_changed', function() {
		var departureInput = document.querySelectorAll(".line-size input")[0];
		var places = searchDepartureBox.getPlaces();
		departureInput.setAttribute("lat", places[0].geometry.location.lat());
		departureInput.setAttribute("lng", places[0].geometry.location.lng());
	});

	searchDestinationBox.addListener('places_changed', function() {
		var destinationInput = document.querySelectorAll(".line-size input")[1];
		var places = searchDestinationBox.getPlaces();
		destinationInput.setAttribute("lat", places[0].geometry.location.lat());
		destinationInput.setAttribute("lng", places[0].geometry.location.lng());
	});
}

