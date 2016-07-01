// Neighborhood Map Project (American Natural Wonders) - Aldi Zhupani
// http://www.discovery.com/tv-shows/north-america/top-10/natural-wonders/
var locations = [
  ['Arches National Park', 36.1060853, -112.1160642, 1,
   'All orthodox red rock-ists make a pilgrimage to the Holey Land in their lifetime, but many find their devotion leads them back to Arches every equinox.'
  ],
  ["Utah's Red Rock Country", 37.0421641, -112.5289671, 2,
     'The five national parks across Southern Utah feature some of the most unique and beautiful landscapes in North America with much of it sculpted from the distinctive red sandstone that covers this part of the continent.'
  ],
  ['Acadia National Park', 44.3385597, -68.2755233, 3,
   'People have been drawn to the rugged coast of Maine throughout history. Awed by its beauty and diversity, early 20th-century visionaries donated the coastal islands that became the first national park east of the Mississippi River.'
  ],
  ['Death Valley', 36.587058, -117.3311192, 4,
   'This spectacular below-sea-level basin combines the hottest, driest, and lowest points in North America. Steady drought and record summer heat make Death Valley a land of extremes, but each extreme has a striking contrast.'
  ],
  ['Everglades', 25.6656, -81.3646915, 5,
   "Everglades National Park is the United States' largest subtropical wilderness that protects an unparalleled landscape filled with flora and fauna that blend life from the Caribbean tropics with more familiar species from temperate North America."
  ],
  ['Mammoth Cave', 37.1870021, -86.1027167, 6,
   "This underground National Park preserves what one early visitor described as a grand, gloomy and peculiar place that's a part of the Green River valley and hilly country of south central Kentucky."
  ],
  ['Redwood Forest', 41.2131828, -124.0068163, 7,
   "Most people know California's redwood forest as home to the tallest trees on Earth. But the national and state parks also protect vast prairies, oak woodlands, wild rivers, and nearly 40 miles of pristine Pacific Ocean coastline, all supporting a rich mosaic of wildlife diversity and cultural traditions."
  ],
  ['Yosemite Valley', 37.7381341, -119.5968362, 8,
   "Glaciers reaching back over 30 million years carved what American naturalist John Muir hailed as one of God's first temples."
  ],
  ['Denali', 63.0692013, -151.0770234, 9,
   'Denali is six million acres of wild land in the heart of central Alaska, bisected by one ribbon of road that takes visitors into the Denali National Park and Preserve.'
  ],
  ['Yellow Stone', 44.4279828, -110.597209, 10,
   "Millions of years ago, a giant supervolcano arose deep below what is now the northwestern corner of Wyoming and still simmers today, producing Old Faithful and the majority of the world's geysers that are found within Yellowstone National Park."
  ],
  ['Grand Canyon', 36.1069695,-112.1151859, 11,
   "One of the world's most powerful and inspiring landscapes, the Grand Canyon overwhelms our senses through its immense size."
  ]
];

// Store the search value for the filter query.
var searchValue = (" ");

function init() {
  var mapDiv = document.getElementById('map');
  vm.map = new google.maps.Map(mapDiv, {
    center: {
      lat: 37.42516,
      lng: -115.82499
   },
   zoom: 3
  });

  // To hold information about a location
  vm.infowindow = new google.maps.InfoWindow({
    maxWidth: 240
  });
    
  vm.wonderList().forEach(function(wonder) {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(wonder.lat(), wonder.lng()),
      animation: google.maps.Animation.DROP,
      map: vm.map
    });
    wonder.marker = marker;
    google.maps.event.addListener(marker, 'click', function() {
      vm.select(wonder); // Show info window when user click on marker
    });
  });
  ko.applyBindings(vm);
}

// Animation for markers
var toggleBounce = function(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  }
  else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1000);
  }
};

// Set up knockout observable object with given data
var Wonder = function(data) {
  this.name = ko.observable(data[0]),
  this.description = ko.observable(data[4]),
  this.lat = ko.observable(data[1]),
  this.lng = ko.observable(data[2]),
  this.LatLng = ko.computed(function() {
    return this.lat() + "," + this.lng();
  }, this);
};

var getErrorMessage = function(jqXHR, exception) {
  if (jqXHR.status === 0) {
    alert('Page not reachable.');
  } else if (jqXHR.status == 404) {
    alert('Requested page not found. [404]');
  } else if (jqXHR.status == 500) {
    alert('Internal Server Error [500].');
  } else if (exception === 'parsererror') {
    alert('Requested JSON parse failed.');
  } else if (exception === 'timeout') {
    alert('Time out error.');
  } else if (exception === 'abort') {
    alert('Ajax request aborted.');
  } else {
    alert('Uncaught Error.\n' + jqXHR.responseText);
  }
}

var ViewModel = function() {
  var self = this;
  var wonders = ko.utils.arrayMap(locations, function(location) {
   return new Wonder(location);
  });

  self.wonderList = ko.observableArray(wonders);
  self.filter = ko.observable("");

  // Function to bind to list for marker action.
  self.select = function(loc) {
    toggleBounce(loc.marker);
    var locName = loc.name();
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + locName + '&format=json&callback=wikiCallback';
    
    $.ajax({
      url: wikiUrl,
      dataType: "jsonp",
      cache: "false",
      success: function (response) {
        var wikiList = response[1];
        var windowContent = '<h6>Wikipedia</h6>' + '<h6><a href=http://en.wikipedia.org/wiki/"' + wikiList[0] + ' target="_blank"">' +  locName + '</a></h6>';
        vm.infowindow.setContent(windowContent + loc.description());
        vm.infowindow.open(vm.map, loc.marker);
      },
      error: function(jqXHR, exception) {
        getErrorMessage(jqXHR, exception);
      }
    });
  };

  //List and marker filter function using the search bar with userinput.
  self.filteredItems = ko.computed(function() {
    var listFilter = self.filter().toLowerCase();
    return ko.utils.arrayFilter(self.wonderList(), function(item) {
        if (item.name().toLowerCase().indexOf(listFilter) > -1) {
         if (item.marker) item.marker.setVisible(true);
         return true;
        } else {
            item.marker.setVisible(false);
            return false;
        }
     });
  }, self);
};

var vm = new ViewModel();

/* Use strict mode to detect syntax, scope errors */
(function() {
  'use strict'; // turn on Strict Mode
}());