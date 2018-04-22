var Transmission = require('transmission');

var transmission = new Transmission({
	host: "192.168.1.25",
	port: 9091,
	username: "",
	password: ""
});

exports.isActiveTorrents = function() {
  transmission.active(function(err, result) {
    if (err) {
      console.log("ERROR: " + err);
      process.exit(1);
    } else {
      console.log("Length:  " + result.torrents.length);
      if (result.torrents.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    }
  });
}
