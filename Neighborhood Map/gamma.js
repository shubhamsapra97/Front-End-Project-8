//markers array
var maps = [{
    title: "Chitkara University",
    locations: {
        lat: 30.516292,
        lng: 76.658802
    },
    show: true,
    selected: false,
    id: "4e41412f6284809c9f3cac19"
}, {
    title: "Gurukul Vidyapeeth",
    locations: {
        lat: 30.52653,
        lng: 76.67338
    },
    show: true,
    selected: false,
    id: "5114cd90e4b06bb0ed15a97f"
}, {
    title: "Jhansala",
    locations: {
        lat: 30.525855,
        lng: 76.666245
    },
    show: true,
    selected: false,
    id: "4b6fe660f964a5206dff2ce3"
}, {
    title: "Gian Sagar Hospital",
    locations: {
        lat: 30.527777,
        lng: 76.669593
    },
    show: true,
    selected: false,
    id: "4e9189eb8231d8feae694cc2"
}, {
    title: "SVIET",
    locations: {
        lat: 30.530587,
        lng: 76.672736
    },
    show: true,
    selected: false,
    id: "529cc5ce11d26f34c569097b"
}];

//map initialised
var map;

function initMap() {
    var mapOptions = {
        center: {
            lat: 30.525855,
            lng: 76.666245
        },
        zoom: 16
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    markerInfo = new google.maps.InfoWindow();
    ko.applyBindings(new viewModel());
}

function googleError() {
    document.getElementById('map').innerHTML = "Map didnt Worked!";
}

function viewModel() {

    var self = this;
    var bounds = new google.maps.LatLngBounds();
    self.errormsg = ko.observable();
    self.searchText = ko.observable();
    self.markers = [];
    //marker properties
    for (var i = 0; i < maps.length; i++) {
        var marker = new google.maps.Marker({
            position: maps[i].locations,
            map: map,
            name: maps[i].title,
            animation: google.maps.Animation.DROP,
            show: ko.observable(maps[i].show),
            selected: ko.observable(maps[i].selected),
            fsid: maps[i].id
        });
        self.markers.push(marker);
        bounds.extend(marker.position);
        self.markers[self.markers.length - 1].setVisible(self.markers[self.markers.length - 1].show());
    }
    //ajax applied
    self.markers_info = function(marker) {
        $.ajax({
            url: "https://api.foursquare.com/v2/venues/" + marker.fsid + "?client_id=3MF4TXX5NLMFDYA0OPXCA3UOJTDD2ZB1FWPSORO0OXY5VFYH&client_secret=ZRU4MIGSDURP5P0DU50P2YCNTRCKNI2LGZHGGNSLYJLBG0Y4&v=20161016",
            dataType: "json",
            success: function(data) {
                result = data.response.venue;
                if (result.hasOwnProperty('likes')) {
                    marker.likes = result.likes.summary;
                }
            },
            error: function(e) {
                self.errormsg("Sorry!! No info available");
            }
        });
    };
    //select marker addListener
    for (var j = 0; j < self.markers.length; j++) {
        (function(marker) {
            self.markers_info(marker);
            marker.addListener('click', function() {
                self.setSelected(marker);
            });
        })(self.markers[j]);
    }
    //search function
    self.search = function() {
        markerInfo.close();
        var text = self.searchText();
        if (text.length === 0) {
            self.showAll(true);
        } else {
            for (var i = 0; i < self.markers.length; i++) {
                if (self.markers[i].name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
                    self.markers[i].setVisible(true);
                    self.markers[i].show(true);
                } else {
                    self.markers[i].setVisible(false);
                    self.markers[i].show(false);
                }
            }
        }
        markerInfo.close();
    };
    //show all markers
    self.showAll = function(show) {
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].setVisible(show);
            self.markers[i].show(show);
        }
    };
    // function to make all the markers unselected.
    self.unselectAll = function() {
        for (var i = 0; i < self.markers.length; i++) {
            self.markers[i].selected(false);
        }
    };

    self.setSelected = function(marker) {
        console.log(location);
        self.unselectAll();
        marker.selected(true);

        self.currentMarker = marker;
        //info window details
        formatLikes = function() {
            if (self.currentMarker.likes === "" || self.currentMarker.likes === undefined) {
                return "No likes";
            } else {
                return self.currentMarker.likes;
            }
        };

        var formatMarkerInfo = "<h5>" + self.currentMarker.name + "</h5>" + "<div>" + formatLikes() + "</div>";

        markerInfo.setContent(formatMarkerInfo);

        markerInfo.open(map, marker);
        //marker animated
        self.animateMarker = function(marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 900);
        };

        self.animateMarker(marker);

        self.hideNav = function(){
          $('.button-collapse').sideNav('hide');
        }
    };
    //to fit map to the bounds
    map.fitBounds(bounds);

}

// SIDE NAV FUNCTIONALITY ADDED
(function(){

    $(".button-collapse").sideNav();

    $('.button-collapse').sideNav({
     menuWidth: 300, // Default is 300
     edge: 'left', // Choose the horizontal origin
     closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
     draggable: true // Choose whether you can drag to open on touch screens
   }
 );

})();
