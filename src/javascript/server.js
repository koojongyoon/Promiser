var connectDatabase = function() {
	const config = {
		apiKey: "AIzaSyAYMtWtaqKQwWFc9ySkfSGxkFVmxE_98w0",
		authDomain: "wayknower.firebaseapp.com",
		databaseURL: "https://wayknower.firebaseio.com/"
	}
	if(firebase.apps.length == 0) {
	    firebase.initializeApp(config);
	}
	return firebase.database();
}

var generateDatabaseKey = function() {
	var firebaseRef = connectDatabase().ref();
	return firebaseRef.push().key;
}

var updateCoordinatesByKey = function(latitude, longitude, key) {
	var firebaseRef = connectDatabase().ref();
	var coordinates = {
		latitude: latitude,
		longitude: longitude
	}

	var updates = {};
	updates[key] = coordinates;
	firebaseRef.update(updates);
}

function receiveCoordinatesByKey(key, callback){
	var firebaseRef = connectDatabase().ref(key);

	firebaseRef.on('value', function(snapshot) {
		if(snapshot.val() == null){
			return;
		}
        callback(snapshot.val());
	});
}
