var viewModel = new AtlasTaxi();
var userLat,
    userLon;

/* Common javascript functions */
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
}

var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};

var Proxy = function(func, context) {
    return function() {
        return func.apply(context, arguments);
    };
};


/* Basic platform info */
function isTouchSupported() {
    return 'ontouchstart' in window.document;
};

// Mobile device ready event
function onDeviceReady() {

    viewModel.platform( device.platform );
    document.addEventListener("offline", onOffline, false);
    document.addEventListener("backbutton", viewModel.proxy( viewModel.backButtonClick ), false);

    // Hardware menu button
    document.addEventListener("menubutton", menuButtonClick, false);
}

// Network unawailable
function onOffline() {
    alert( "Для корректной работы пожалуйста подключитесь к сети" );
}

function geoOK(position) {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;

    //alert( "User lat: " + userLat + ", lon: " + userLon );
    viewModel.loadClosestPlaces();
}

function geoError() {
    alert( "Не удалось определить ваши координаты" );
    viewModel.isProcess( false );
}

function getGeolocation() {
    viewModel.closestPlaces([]);
    $(viewModel.closestPlacesList()).html("");
    viewModel.isProcess( true );

    if( viewModel.platform() == 'Android' ) {
        var geo = cordova.require('cordova/plugin/geolocation');
        geo.getCurrentPosition(geoOK, geoError);
    } else {
        navigator.geolocation.getCurrentPosition(geoOK, geoError);
    }

    /*userLat = 56.83124;
    userLon = 60.606182;*/
    //viewModel.loadClosestPlaces();
    //setTimeout(viewModel.proxy(viewModel.loadClosestPlaces), 5000);
}

function orientationChange() {
    var height = $(window).height() - 165;

    $(viewModel.mapElement()).attr({ style: "height: " + height + "px; width: 100%" });

    recalculateSwitcherPosition();
    recalculateAddressLineWidth();
    swipeViews[swipedViewId].init();

    if(window.orientation == 0 || window.orientation == 180) {
        viewModel.orientation( "portrait" );
    } else {
        viewModel.orientation( "landscape" );
    }

}

// Recalculate switcher width and middle position
function recalculateSwitcherPosition() {
    var totalWidth = $(window).width() - 40;
    $(viewModel.switcher()).css({ width: totalWidth + "px" });

    var newSwitcherMiddlePos = totalWidth / 2;
    viewModel.switcherMiddlePos( newSwitcherMiddlePos );
}

function updateSwipedView() {
    /*var containerWidth = $(window).width() - 40;
    $(viewModel.swipedViewWrapper()).css({ width: containerWidth });
    var swipedViewId = $(viewModel.swipedViewWrapper()).find(".swiped-view").attr("id");*/
}

// Title text width calculation for long city names
function updateHeaderWidth() {
    var textWidth = $(window).width() - 70;
    $(".main-title").css({ width: textWidth + "px" });
}

function recalculateAddressLineWidth() {
    var totalWidth = $(window).width() - 40;
}

function hideKeyboard() {
    cordova.plugins.SoftKeyBoard.hide(function () {
    },function () {
        alert("Error");
    });
}

function menuButtonClick() {
    controller.navigate(viewModel.isCarouselDisplaying() ? "carouselMenu" : "menu", true);
}

// Application navigation
var MobileRouter = Backbone.Router.extend({
    routes: {
        "": viewModel.isCarouselDisplaying() ? "carouselMenu" : "home", // "driver", //
        "home": "home",
        "menu": "menu",
        "profile": "profile",
        "balance": "balance",
        "intro": "intro",
        "about": "about",
        "address": "address",
        "region": "region",
        "options": "options",
        "settings": "settings",
        "carouselMenu": "carouselMenu",
        "date": "date",
        "parameters": "parameters",
        "routeMap": "routeMap",
        "driver": "driver",
        "driver-info": "driverInfo"
    },
    home: function() {
        viewModel.page("home");
    },
    menu: function() {
        viewModel.page("menu");
    },
    profile: function() {
        viewModel.page("profile");
    },
    balance: function() {
        viewModel.page("balance");
    },
    intro: function() {
        viewModel.page("intro");
    },
    about: function() {
        viewModel.page("about");
    },
    address: function() {
        viewModel.page("address");
    },
    region: function() {
        viewModel.page("region");
    },
    options: function() {
        viewModel.page("options");
    },
    settings: function() {
        viewModel.page("settings");
    },
    carouselMenu: function() {
        viewModel.page("carouselMenu");
    },
    date: function() {
        viewModel.page("date");
    },
    routeMap: function() {
        viewModel.page("routeMap");
    },
    parameters: function() {
        viewModel.page("parameters");
    },
    driver: function() {
        viewModel.page("driver");
    },
    driverInfo: function() {
        viewModel.page("driver-info");
    }
});

// DOM loaded event
function onLoaded() {
    //localStorage.removeItem('routesHistory');

    ko.applyBindings(viewModel);

    $(".splashscreen").hide();

    viewModel.order( new Order(viewModel) );
    //localStorage.removeItem('code');
    viewModel.applicationUser().checkStatus();

    $(viewModel.phoneInput()).trigger("change");

    controller = new MobileRouter();
    Backbone.history.start();

    if( viewModel.isCarouselDisplaying() ) {
        initMenu();
    }

    viewModel.loadIntroSteps();

    window.onorientationchange = function() {
        setTimeout(orientationChange, 200);
    };

    window.onresize = function(e) {
        recalculateSwitcherPosition();
        updateSwipedView();
        updateHeaderWidth();
    };

    updateHeaderWidth();
}

document.addEventListener("deviceready", onDeviceReady, false);

window.addEventListener("load", onLoaded);