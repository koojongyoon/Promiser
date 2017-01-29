const SELECTED_ROUTE_COLOR = "#01afaf";
const DEFAULT_TAXI_FEE = 3000;
var shortest_direction_result, recommended_direction_result, freeway_direction_result;
var routeDirectionListBox = document.querySelector("#routeDirectionList");
var routeDirectionDetails = document.querySelector("#routeDirectionDetails")

function recommended_path_service_callback(data) {
	recommended_direction_result = directionsService.parseRoute(data);
	var directionsRendererOptions = {
		directions : recommended_direction_result, // 길찾기 결과. DirectionsService 의 parseRoute 결과
		map : map,						// 길찾기 결과를 렌더링할 지도
		offMarkers : true,				// 마커 표시 억제 여부. true 이면 마커를 표시하지 않음. 디폴트 false
		polylineOptions : {				// 경로 폴리라인 스타일 옵션
			strokeColor : SELECTED_ROUTE_COLOR,// 경로 폴리라인 칼라. 디폴트 #ff3131
			strokeWeight : 3			// 경로 폴리라인 두께. 디폴트 5
		},
	};
	var directionsRenderer = new olleh.maps.DirectionsRenderer(directionsRendererOptions);
	//setRouteDirectionDetails(recommended_direction_result);
	directionsRenderer.setMap(map);

	boundList = getBoundsArray(recommended_direction_result);

	departureToDestinationMarker();
}

function getCallbackString(priorityType) {
	switch(priorityType) {
		case "3" :
			return "recommended_path_service_callback"
		default :
			return "traffic_path_service_callback"
	}
}

function setRouteDirectionDetails(directionsResult) {
	var displayArray = getDestinationRouteArray(directionsResult);
	var duration = getDuration(directionsResult);
	var distance = getDistance(directionsResult);
	var fee = getFee(directionsResult);

	//routeDirectionListBox.textContent = displayArray;
	//routeDirectionDetails.querySelector("#duration").textContent = duration;
	//routeDirectionDetails.querySelector("#distance").textContent = distance;
	//routeDirectionDetails.querySelector("#fee").textContent = fee;
}

function getDestinationRouteArray(durationResult) {
	var destinationArray = [];
	console.log(durationResult);
	if(durationResult.result.routes.length > 0) {
		durationResult.result.routes.forEach(function(route) {
			if(route.node_name != "" && route.node_name != undefined) {
				destinationArray.push(route.node_name);
			}
		});
	}

	var uniqueArray = destinationArray.filter(function(item, pos, self) {
		return self.indexOf(item) == pos;
	});

	var displayArray = [];
	if(uniqueArray.length > 5) {
		var mok = uniqueArray.length/5;
		for(var cnt = 0; cnt < 5; cnt++) {
			displayArray.push(uniqueArray[Math.floor(mok*cnt)]);
		}
	} else {
		displayArray = uniqueArray;
	}

	return displayArray.toString().replace(/,/gi,"\u00a0\u00a0\u00a0\u00a0>\u00a0\u00a0\u00a0\u00a0");
}

function getDuration(directionsResult) {
	var durationMinutes = directionsResult.result.total_duration.value;
	var elapsedHours = Math.floor(durationMinutes / 60);
	var elapsedMinutes = Math.floor((durationMinutes / 60 - elapsedHours) * 60);
	return "약 " + (elapsedHours > 0 ? elapsedHours + "시간" : "") + (elapsedMinutes > 0 ? elapsedMinutes + "분" : "");
}

function getDistance(directionsResult) {
	var distanceInKm = directionsResult.result.total_distance.value/1000;
	return "약 " + parseFloat(distanceInKm).toFixed(1) + "km";
}

function getFee(directionsResult) {
	var distanceInKm = directionsResult.result.total_distance.value/1000;
	return "택시비 약 " + (Math.floor(distanceInKm) * 1000 <= DEFAULT_TAXI_FEE ? DEFAULT_TAXI_FEE : Math.floor(distanceInKm) * 1000) + "원";
}

function getBoundsArray(routeList) {
	var routesArray = routeList.result.routes;
	var boundsArray = [];

	for(var cnt=0; cnt < routesArray.length-1; cnt++) {
		var fitstPointX = routesArray[cnt].point.x;
		var fitstPointY = routesArray[cnt].point.y;
		var secondPointX = routesArray[cnt+1].point.x;
		var secondPointY = routesArray[cnt+1].point.y;
		var lessX, moreX, lessY, moreY;

		if(fitstPointX <= secondPointX) {
			lessX = fitstPointX;
			moreX = secondPointX;
		} else {
			lessX = secondPointX;
			moreX = fitstPointX;
		}

		if(fitstPointY <= secondPointY) {
			lessY = fitstPointY;
			moreY = secondPointY;
		} else {
			lessY = secondPointY;
			moreY = fitstPointY;
		}
		var leftBottom = new olleh.maps.UTMK(lessX, lessY);
		var rightTop = new olleh.maps.UTMK(moreX, moreY);
		boundsArray.push(new olleh.maps.Bounds(leftBottom, rightTop));
	}
	return boundsArray;
}

function departureToDestinationMarker() {
	var departureIcon = {
			url: '../lib/images/start.png',
			size: new olleh.maps.Size(50, 50),
			anchor: new olleh.maps.Point(27, 22)
		};

	var departureUTMK_x = recommended_direction_result.result.links[0].x;
	var departureUTMK_y = recommended_direction_result.result.links[0].y;
	var departureMarker = new olleh.maps.overlay.Marker({
			position: new olleh.maps.UTMK(departureUTMK_x, departureUTMK_y),
			map: map,
			icon: {
				url: '../lib/images/start.png'
			}
		});
	departureMarker.setFlat(true);
    departureMarker.setIcon(departureIcon);

	var destinationIcon = {
			url: '../lib/images/pin.png',
			size: new olleh.maps.Size(50, 50),
			anchor: new olleh.maps.Point(27, 22)
		};

	var lastIndexOfArray = recommended_direction_result.result.links.length-1;
	var destinationUTMK_x = recommended_direction_result.result.links[lastIndexOfArray].x;
	var destinationUTMK_y = recommended_direction_result.result.links[lastIndexOfArray].y;
	var destinationMarker = new olleh.maps.overlay.Marker({
			position: new olleh.maps.UTMK(destinationUTMK_x, destinationUTMK_y),
			map: map,
			icon: {
				url: '../lib/images/pin.png'
			}
		});
	destinationMarker.setFlat(true);
	destinationMarker.setIcon(destinationIcon);
}
