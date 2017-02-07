var priorityType;
var boundList = [];
var groupKey, marker;
var taxiCallingModal, taxiCalledModal;
var currentPosition;

var directionsService = new olleh.maps.DirectionsService('frKMcOKXS*l9iO5g');

var goThisWayButton = document.querySelector(".go-this-way-button");
var shareButton = document.querySelector(".share-button");
var currentPositionButton = document.querySelector(".current-location-button");

var modalDialog = $("#modalDialog");
var modalCallingDialog = $("#modalCallingDialog");
var modalCalledDialog = $("#modalCalledDialog");
var departure = {name: getParameterByName('departure'), longitude: getParameterByName('depLng'), latitude: getParameterByName('depLat')};

document.querySelector('#departure').innerHTML = (departure.name.indexOf("대한민국") != -1 ? departure.name.substring(4) : departure.name);

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

setGeolocation();
/*
setTimeout(function(){
	recommendedRoute();
}, 	3000);
*/
if(getParameterByName("key") !== null) {
	groupKey = getParameterByName("key");
	goThisWayButton.click();
}else {
	groupKey = generateDatabaseKey();
}

modalDialog.modal();
modalCallingDialog.modal();
modalCalledDialog.modal();

function loadSearchPage() {
	location.replace("/");
}

function goThisWay() {
	activateKakao();
	//blinkTaxiMockModal();

	/*
	receiveCoordinatesByKey(groupKey, function(coordinates) {
        if(marker !== undefined){
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
		*/
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

		updateCoordinatesByKey(position.coords.latitude, position.coords.longitude, groupKey);

		if(boundCheckFlag) {
			findCurrentLocation();
		}
	}, null, options);
}

function blinkTaxiMockModal() {
	modalCallingDialog.modal('open');
	goThisWayButton.innerHTML = "위치 확인 취소";
	setTimeout(function(){
		modalCallingDialog.modal('close');
		modalCalledDialog.modal('open');
	}, 	2000);
	setTimeout(function(){
		modalCalledDialog.modal('close');
		document.querySelectorAll(".go-away").forEach(function(component) {
			hideComponent(component);
		});
		//showComponent(shareButton);
		showComponent(currentPositionButton);
	}, 	4000);
}

function hideComponent(component) {
	component.className += " disappear";
}

function showComponent(component) {
	component.className = component.className.replace(" disappear", "");
}

function findCurrentLocation() {
	if(currentPosition !== null) {
		map.setCenter(new olleh.maps.LatLng(currentPosition.y, currentPosition.x));
	}
}

function activateKakao(){
	var groupKey = getGuid();
	Kakao.init('54a4eb964f13441087fefcf7a780a66e');
	console.log("guid : " + groupKey)
	console.log("latitude : " + departure.latitude + '&longitude=' + departure.longitude);
	// http://localhost:8080/html/route_select.html?departure=%EB%8C%80%ED%95%9C%E…epLat=35.864678&depLng=128.593341&key=a53bb6e1-4aa7-b20b-e687-022afef9af27
	console.log('url : ' + window.location.href);
	Kakao.Link.createTalkLinkButton({
		container: '#kakao-link-btn',
		label: '지인의 위치를 확인해주세요!',
		image: {
			src: 'https://promiser-9e088.firebaseapp.com/lib/images/tdkd.png',
			width: '300',
			height: '200'
		},
		webButton: {
			text: '내 위치 입력하기',
			url: window.location.href,
			execParams : { android : {
				name: departure.name,
				groupKey: groupKey,
				longitude: Number(departure.longitude),
				latitude: Number(departure.latitude),
			}}
		}
	});
	/*
	Kakao.Navi.start({
			name: departure.name,
			x: Number(departure.longitude),
			y: Number(departure.latitude),
			coordType: 'wgs84'
	});
	*/
}
//group key를 생성한 후 link에 접속함 -> 카카오에선 redirect dynamic url을 허용하지 않음
//link에 접속할때 자신 고유의 아이디를 생성하고(카카오 ID가 있는지 확인 필요), 자신의 카카오톡 별명을 가져옴
//그룹id+카카도id+카카오 별명 + 위도 + 경도를 DB에 넣음
//생성된 맵에 접근하면서 -> (새로 맵 정보를 만들어야 하는지...?) -> 위의 정보를 맵 상에서 조회함(db에서 그룹키로 셀렉트 한뒤 맵 상 조회)
//마커에 카카오 별명도 같이 뿌려야 함 (어떻게 할까...?)
function recommendedRoute() {
	clearMap();
	directionsService.route({
		origin : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(currentPosition.y, currentPosition.x)),
		destination : new olleh.maps.UTMK.valueOf(new olleh.maps.LatLng(departure.latitude, departure.longitude)),
		projection : olleh.maps.DirectionsProjection.UTM_K,
		travelMode : olleh.maps.DirectionsTravelMode.DRIVING,
		priority : olleh.maps.DirectionsDrivePriority.PRIORITY_3
	},
	getCallbackString(olleh.maps.DirectionsDrivePriority.PRIORITY_3)
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

function getGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
