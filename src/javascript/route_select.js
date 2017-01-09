var priorityType;
var boundList = [];
var dbKey, marker;
var taxiCallingModal, taxiCalledModal;
var currentPosition;

var directionsService = new olleh.maps.DirectionsService('frKMcOKXS*l9iO5g');

const goThisWayButton = document.querySelector(".go-this-way-button");
const shareButton = document.querySelector(".share-button");
const currentPositionButton = document.querySelector(".current-location-button");

var modalDialog = $("#modalDialog");
var modalCallingDialog = $("#modalCallingDialog");
var modalCalledDialog = $("#modalCalledDialog");
var departure = {name: getParameterByName('departure'), longitude: getParameterByName('depLng'), latitude: getParameterByName('depLat')};
var destination = {name: getParameterByName('destination'), longitude: getParameterByName('desLng'), latitude: getParameterByName('desLat')};

document.querySelector('#departure').innerHTML = (departure.name.indexOf("대한민국") != -1 ? departure.name.substring(4) : departure.name);
document.querySelector('#destination').innerHTML = (destination.name.indexOf("대한민국") != -1 ? destination.name.substring(4) : destination.name);

var control = olleh.maps.control.Control;
var map = new olleh.maps.Map('map_div', {
	center : new olleh.maps.LatLng(departure.latitude, departure.longitude),
	zoom : 7,
	zoomControl: true,
	copyrightControl: false,
	mapTypeControl: false,
	measureControl: false,
	scaleControl: false,
	panControl: false,
	disablePinchZoom: false,
	disableMultiTabZoom: false,
	zoomControlOptions: {
		position: control.TOP_RIGHT,
		direction: control.VERTICAL,
		top: 130,
		right: 20,
		style: olleh.maps.control.ZoomControl.SMALL
	}
});

if(getParameterByName("key") != null) {
	dbKey = getParameterByName("key");
	goThisWayButton.click();
}else {
	dbKey = generateDatabaseKey();
}

recommendedRoute();
modalDialog.modal();
modalCallingDialog.modal();
modalCalledDialog.modal();

function loadSearchPage() {
	location.replace("/");
}

function goThisWay() {
	blinkTaxiMockModal();
	receiveCoordinatesByKey(dbKey, function(coordinates) {
        if(marker != undefined){
            marker.erase();
        }
        var position = new olleh.maps.LatLng(coordinates.latitude, coordinates.longitude);
        marker = new olleh.maps.overlay.Marker({
            position: position,
            map: map,
            icon: {
                url: '../lib/images/my_location.png'
            }
        });
        marker.setFlat(true);
    });
}

function setGeolocation() {
	var options = {
		enableHighAccuracy: false,
		timeout: 3000,
		maximumAge: 0
	};

	navigator.geolocation.watchPosition(function(position) {

		currentPosition = new olleh.maps.LatLng(position.coords.latitude, position.coords.longitude);
		var boundCheckFlag = false;
		boundList.forEach(function(bound) {
			if(bound.almostEquals(new olleh.maps.Bounds(olleh.maps.UTMK.valueOf(currentPosition), olleh.maps.UTMK.valueOf(currentPosition)), 500)) {
				boundCheckFlag = true;
			}
		});

		updateCoordinatesByKey(position.coords.latitude, position.coords.longitude, dbKey);

		if(!boundCheckFlag) {
			modalDialog.modal('open');
			fincCurrentLocation();
			window.navigator.vibrate(1000);
		}else{
			fincCurrentLocation();
			console.log("잘가고 있구만!");
		}
	}, null, options);
}

function blinkTaxiMockModal() {
	modalCallingDialog.modal('open');
	goThisWayButton.innerHTML = "호출 취소";
	setTimeout(function(){
		modalCallingDialog.modal('close');
		modalCalledDialog.modal('open');
	}, 	2000);
	setTimeout(function(){
		modalCalledDialog.modal('close');
		document.querySelectorAll(".go-away").forEach(function(component) {
			hideComponent(component);
		});
		showComponent(shareButton);
		showComponent(currentPositionButton);
		setGeolocation();
	}, 	4000);
	setTimeout(function(){
		setGeolocation();
	}, 	7000);


};

function hideComponent(component) {
	component.className += " disappear";
}

function showComponent(component) {
	component.className = component.className.replace(" disappear", "");
}

function fincCurrentLocation() {
	if(currentPosition != null) {
		map.setCenter(new olleh.maps.LatLng(currentPosition.y, currentPosition.x));
	}
}

function activateKakao(){
	Kakao.init('3b1c9bd1870f46083d79ba8115f7f304');
	Kakao.Link.createTalkLinkButton({
		container: '#kakao-link-btn',
		label: '지인의 위치를 확인해주세요!',
		image: {
			src: 'https://wayknower.firebaseapp.com/lib/images/share_link.jpeg',
			width: '300',
			height: '200'
		},
		webButton: {
			text: '확인하러가기',
			//url: window.location.href + '&key=' + dbKey
			url: 'www.naver.com'
		}
	});
};

function recommendedRoute() {
	clearMap();
	directionsService.route({
		origin : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(departure.latitude, departure.longitude)),
		destination : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(destination.latitude, destination.longitude)),
		projection : olleh.maps.DirectionsProjection.UTM_K, 
		travelMode : olleh.maps.DirectionsTravelMode.DRIVING,
		priority : olleh.maps.DirectionsDrivePriority.PRIORITY_3
	}, 
	getCallbackString(olleh.maps.DirectionsDrivePriority.PRIORITY_3)
	); 
}	

function shortestRoute() {
	clearMap();
	directionsService.route({
		origin : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(departure.latitude, departure.longitude)),
		destination : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(destination.latitude, destination.longitude)),
		projection : olleh.maps.DirectionsProjection.UTM_K, 
		travelMode : olleh.maps.DirectionsTravelMode.DRIVING,
		priority : olleh.maps.DirectionsDrivePriority.PRIORITY_0
	}, 
	getCallbackString(olleh.maps.DirectionsDrivePriority.PRIORITY_0)
	); 
}

function freeRoute() {
	clearMap();
	directionsService.route({
		origin : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(departure.latitude, departure.longitude)),
		destination : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(destination.latitude, destination.longitude)),
		projection : olleh.maps.DirectionsProjection.UTM_K, 
		travelMode : olleh.maps.DirectionsTravelMode.DRIVING,
		priority : olleh.maps.DirectionsDrivePriority.PRIORITY_2
	}, 
	getCallbackString(olleh.maps.DirectionsDrivePriority.PRIORITY_2)
	);
}

function clearMap() {
	var polylines = document.querySelectorAll('#layer_container svg polyline');
	if(polylines.length > 0){
		polylines.forEach(function(polyline) {
			polyline.remove();
		});
	}
	map.getLayer("Vector")._vectors = [];
	map.setCenter(new olleh.maps.LatLng(departure.latitude, departure.longitude));
}

function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
