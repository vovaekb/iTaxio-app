/* Validation class */
function ValidForm(rules, context) {
    this.context = context;
    this.rules = [];

    for( var i = 0; i < rules.length; i++ ) {
        var rule = rules[i];
        this.rules.push( rule );
    }
}

ValidForm.prototype = {
    validate: function() {	
        for(var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i];
            var isFieldInvalid = rule.isInvalid.apply(this.context);
            if(isFieldInvalid) {
                return rule.message;
            }
        }
        return "";
    }
};

function AtlasTaxi() {
    var that = this;

    /* Main configuration info */
    this.appName = "ITaxio";
    this.appVersion = "1.0";
    this.description = "Такси АТЛАС является принципиально новым для Новосибирска средством передвижения. При оформлении заявки на пользование услугами такси АТЛАС вы сразу узнаете стоимость поездки. Приложение предназначено для быстрого вызова такси Атлас. Теперь больше не требуется ждать ответа оператора.";
    this.developers = "Привалов В.";
    this.vendorName = "MugunPro, LLC";
    this.APP_ID = "191171984328912";
    this.defaultRegionId = 66;
    this.screenWidth = $(window).width();
    this.regionName = ko.observable("Екатеринбург", { persist: "regionName" });
    this.regionId = ko.observable(66, { persist: "regionId" });
    this.city = ko.observable("");
    this.baseUrl = ko.observable("http://itaxio.ru/v1.0/");
    this.clearMode = ko.observable(false);

    /* Settings */
    this.isCarouselDisplaying = ko.observable( false, { persist: "isCarouselDisplaying" } );
    this.addressesRubric = ko.observable( 'history-routes' );

    // Screens header titles
    this.pages = {
        "home": "Заказ такси",
        "address": "Заказ такси",
        "region": "Заказ такси",
        "parameters": "Заказ такси",
        "date": "Заказ такси",
        "routeMap": "Заказ такси",
        "driver": "Заказ такси",
        "driver-info": "Заказ такси",
        "balance": "Пополнить счет",
        "settings": "Настройки",
        "options": "Социальные сети",
        "about": "О программе",
        "profile": "Мой аккаунт",
        "intro": "Наши выгоды",
        "carouselMenu": "Главное меню",
        "menu": "Главное меню"
    };

    /* Main app objects */
    this.page = ko.observable("home");
    this.pageTitle = ko.computed(function() {
        return this.pages[ this.page() ];
    }, this);
    this.order = ko.observable();

    /* History arrays */
    this.addressHistory = ko.observableArray([], {persist: 'history'});
    this.commentsHistory = ko.observableArray([], {persist: 'commentsHistoryItems'});
    this.routesHistory = ko.observableArray([], {persist: 'routesHistory'});
    this.closestPlaces = ko.observableArray([]);
    this.stations = ko.observableArray([]);
    this.airports = ko.observableArray([]);

    /* Device parameters */
    this.platform = ko.observable( "Desktop" );
    this.minWidth = ko.observable( $(window).width() );
    this.orientation = ko.observable( "portrait" );
    this.switcherMiddlePos = ko.observable( 0 );
    this.mapHeights = {};

    /* Data collections */
    this.streets = ko.observableArray([]);
    this.houses = ko.observableArray([]);
    this.regions = ko.observableArray([]);
    this.drivers = ko.observableArray([]);

    /*
    * App sections
    * */
    // Map
    this.centerLat = ko.observable();
    this.centerLon = ko.observable();
    this.zoomLevel = ko.observable( 11 );
    this.leftLon = ko.observable();
    this.rightLon = ko.observable();
    this.topLat = ko.observable();
    this.bottomLat = ko.observable();

    // Intro
    this.introSteps = ko.observableArray([ {
        title: "Step 1",
        text: "Step 1 text"
    }, {
        title: "Step 2",
        text: "Step 2 text"
    }, {
        title: "Step 3",
        text: "Step 3 text"
    } ]);

    this.currentIntroStepIndex = ko.observable(0);

    // Address selection
    this.addressesListVisibleMode = ko.observable( true );

    this.streetNameBegin = ko.observable();
    this.selectedStreet = ko.observable(null);

    this.isStreetsListEmpty = ko.observable( false );
    this.streetsAutocompleteMessage = ko.observable("");
    this.housesAutocompleteMessage = ko.observable("");

    this.houseNumberBegin = ko.observable();
    this.selectedHouse = ko.observable(null);
    this.isStreetSelected = ko.observable(false);
    this.isHouseNumberSelected = ko.observable(false);
    this.isStreetEditing = ko.observable( true );
    this.isAddressSelection = ko.observable( false );

    // Driver updating
    this.isDriversListUpdated = ko.observable( false );

    // Route selection
    this.isRouteSelected = ko.observable( false );

    // Region selection
    this.regionNameBegin = ko.observable("");
    this.isRegionSelected = ko.observable(false);

    this.regionNameInput = ko.observable("Hello");
    this.isRegionsListEmpty = ko.observable(false);

    /* Tracks info */
    // End points
    this.edgePoints = ko.observableArray([]);
    this.edgePointsId = ko.observable();

    // Middle points
    this.routePoints = ko.observableArray([]);
    this.routePointsId = ko.observable();

    this.startPointName = ko.observable("");
    this.finishPointName = ko.observable("");

    this.middlePoint = ko.observable();

    /* Driver info */
    this.driversDisplayMode = ko.observable("list");
    this.currentDriverIndex = ko.observable(0);

    this.isCarouselDisplayingSelect = ko.computed({
        read: function() {
            return this.isCarouselDisplaying().toString();
        }, write: function(value) {
            this.isCarouselDisplaying( value === "true" );
        },
        owner: this
    });

    /* Social network auth */
    this.socialApi = null;
    this.currentSocialNetwork = ko.observable();

    this.isAuthorithed = ko.observable( false );
    this.confirmCode = ko.observable("");
    this.applicationUser = ko.observable( new AppUser() ); // Application user   //applicationUser
    this.currentUser = ko.observable(); // Social network profile
    this.userId = ko.observable();
    this.appSlogan = "Такси в Новосибирске: Доступно, качественно, быстро";
    this.postText = ko.observable("Прокатился на Атлас Такси: очень удобно, качественно и быстро!");

    /*
    * Actions states
    * */
    this.isProcess = ko.observable( false );
    this.isPointsLoading = ko.observable( false );
    this.isConfirmation = ko.observable( false );
    this.isExitMode = ko.observable( false );

    this.exitTimeout = null;

    /* UI controls */
    this.swipeViews = {};
    this.switcher = ko.observable();
    this.phoneInput = ko.observable();

    this.mapElement = ko.observable();
    this.swipedViewWrapper = ko.observable();

    this.houseNumberField = ko.observable();
    this.houseIdField = ko.observable();
    this.houseNumberList = ko.observable();
    this.houseNumberListContainer = ko.observable();

    this.regionInputField = ko.observable();

    this.commentInputField = ko.observable();

    this.streetsList = ko.observable();
    this.closestPlacesList = ko.observable();

    this.map = null;
    this.mapId = ko.observable('map');

    /* computed fields*/
    this.base64AuthData = ko.computed(function() {
        return this.applicationUser().login() != "" && this.applicationUser().password() != "" ? btoa( this.applicationUser().login() + ":" + this.applicationUser().password() ) : "";
    }, this);

    this.addressLabel = function(index) {
        return index() == 0 ? 'Куда подать машину' : 'Куда поедем';
    };

    this.streetsUrl = ko.computed(function() {
        return this.baseUrl() +'streets' + '/' + this.regionId() + '/' + this.streetNameBegin();
    }, this);

    this.regionsUrl = ko.computed(function() {
        return this.baseUrl() +'regions' + '/' + this.regionNameBegin();
    }, this);

    this.driversUrl = ko.computed(function() {
        return this.baseUrl() + 'selectdriver';
    }, this);

    this.costCountUrl = ko.computed(function() {

    }, this);

    this.getHouseIds = ko.computed(function() {

    });

    this.getCostCountUrl = function() {
        return this.baseUrl() + 'costcount/' + this.regionId() + '/' + this.order().houseIds().join('/');
    };

    this.getLoadEdgePointsUrl = function() {
        return this.baseUrl() + 'points/' + this.regionId() + '/' + this.order().houseIds().join('/');
    };

    this.sendGeocoordinatesUrl = function() {
        return this.baseUrl() +  ['closest', userLon, userLat].join('/');
    };

    this.getStationsUrl = function() {
        return this.baseUrl() + ['station', this.regionId()].join('/');
    };

    this.getAirportsUrl = function() {
        return this.baseUrl() + ['airport', this.regionId()].join('/');
    };

    this.displayAddressesHistoryItems = ko.computed(function() {
        return ko.utils.arrayFilter(this.addressHistory(), function(item) {
            return item.regionId == that.regionId();
        }).sort(function(a, b) {
            return ( a.date > b.date ) ? -1 : 1
        });
    }, this);

    // Route history items disaplayed in address selection screen
    this.displayRouteHistoryItems = ko.computed(function() {
        var filteredItems = ko.utils.arrayFilter(this.routesHistory(), function(item) {
            return item.regionId == that.regionId();
        });

        return ko.utils.arrayMap(filteredItems, function(item) {
            var addresses = [];
            for( var i = 0; i < item.points.length; i++ ) {
                var point = item.points[i];
                addresses.push( point.info );
            }

            item.path = addresses.join(" -> ");

            return item;
        }).sort(function(a, b) {
            return ( a.date > b.date ) ? -1 : 1
        });
    }, this);

    // Comments history items
    this.displayCommentHistoryItems = ko.computed(function() {
        return this.commentsHistory().sort(function(a, b) {
            return ( a.date > b.date ) ? -1 : 1;
        });
    }, this);

    // Streets filtering
    // TODO: optimize streets autocomplete loading
    // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    this.searchStreets = ko.computed(function() {
        // TODO make filtering by first simbols
        /*var filter = this.streetNameBegin();

         if(!filter) {
         return this.streets();
         } else {
         return ko.utils.arrayFilter(this.streets(), function(item) {
         return stringStartsWith(item.name, filter);
         });
         }*/
        return this.streets();
    }, this);

    // Houses filtering
    this.searchHouses = ko.computed(function() {
        // TODO make filtering by first simbols
        /*var filter = this.houseNumberSearch();

         if(!filter) {
         return this.houses();
         } else {
         return ko.utils.arrayFilter(this.houses(), function(item) {
         return stringStartsWith(item.number.toString(), filter);
         });
         }*/
        return this.houses();
    }, this);

    this.page.subscribe(function(newValue) {
        window.scrollTo(0, 0);

        if(newValue == "carouselMenu") {
           initMenu();

        } if(newValue == "address") {
            this.houseNumberBegin('');
            this.addressesRubric( 'history-routes' );
            //this.isHouseNumberSelected(true);
            this.clearAutocompleteData();

        } else if(newValue == "region") {
            this.isRegionSelected(false);
            this.regionNameBegin('');
            this.clearData();
            this.clearRoutePoints();

        } else if(newValue == 'routeMap') {

        } else if(newValue == "driver") {
            if( this.drivers().length == 0 ) {
                this.loadDriversList();
            }

            //setInterval($.proxy(this.updateDriversList, this), 15000);
        } else if( newValue == "driver-info" ) {
            if( this.drivers().length == 0 ) {
                this.loadDriversList($.proxy(this.initDriversSwipe, this));
            } else {
                setTimeout( $.proxy(this.initDriversSwipe, this), 50);
            }
        } else if(newValue == "parameters") {
            this.order().inputComment( this.order().comment() );
        } else if(newValue == "intro") {
            this.initIntroStepsSwipe();
        } else if(newValue == "profile") {
            this.applicationUser().clearAuthProcessData();
        }
    }, this);


    /* Subscribes */
    this.addressesRubric.subscribe(function(newValue) {
        // Get closest places
        if( newValue == 'closest-addresses' ) {
            getGeolocation();
        } else if( newValue == 'stations' ) {
            this.loadStations();
        } else if( newValue == 'airports' ) {
            this.loadAirports();
        }
    }, this);

    this.isStreetSelected.subscribe(function(newValue) {
        // Show house input field
        if(newValue == true) {
            this.streetNameBegin('');

            /*setTimeout(function() {
                if(!that.isHouseNumberSelected()) {*/
                    this.order().currentAddress().houseNumberInputValue('');
                /*}
            }, 80);*/
        }
    }, this);

    this.isRegionSelected.subscribe(function(newValue) {
        if(newValue == true) {
            this.regionNameBegin( this.regionName() );
        }
    }, this);

    // Hide house autocomplete
    this.isHouseNumberSelected.subscribe(function(newValue) {
        if(newValue == true) {
            this.houseNumberBegin('');
        } else {
            //this.selectedHouse( null );
        }
    }, this);

    // Load street autocomplete data
    this.streetNameBegin.subscribe(function(newValue) {
        if(newValue != '') {
            this.loadStreets();
        } else {
            this.streets([]);
        }
    }, this);

    // Load house autocomplete data
    this.houseNumberBegin.subscribe(function(newValue) {
        if( !this.isHouseNumberSelected() ) {
            var selectedHouseNumber = null;

            if( this.selectedHouse() != null ) {
                selectedHouseNumber = this.selectedHouse().house;
            }

            if(newValue != "" && newValue != selectedHouseNumber ) {

                if( this.selectedHouse() != null ) {
                    this.order().currentAddress().houseId("");
                    this.isHouseNumberSelected(false);
                }

                this.loadHouses(newValue);
            }

        }
    }, this);

    // Hide autocomplete
    this.selectedStreet.subscribe(function(newValue) {
        this.streetNameBegin('');
    }, this);

    // Load region autocomplete data
    this.regionNameBegin.subscribe(function(newValue) {
        if(newValue != '') {
            this.loadRegions();
        }
    }, this);

    /************** Methods **********************/
    this.proxy = function(func) {
        var self = this;
        return (function() {
            return func.apply(self, arguments);
        });
    };

    /* Main device events */
    // Hardware back button
    this.backButtonClick = function() {
        if(this.page() == "home" || this.page() == "carouselMenu") {
            // First click back
            if( !this.isExitMode() ) {
                console.log( 'First click occured' );
                // TODO show popup 'Чтобы выйти нажмите еще раз'
                alert( 'Чтобы выйти нажмите еще раз' );
                this.isExitMode( true );

                this.exitTimeout = setTimeout(this.proxy(function() {
                    this.isExitMode( false );
                }), 2000);

                console.log( 'exit timeout was setup' );
            } else {
                // Second click before timeout expired
                clearTimeout( this.exitTimeout );
                navigator.app.exitApp();
            }

        } else {
            history.back();
        }
    };

    /* Address selection */
    this.addressLineClick = function(address, event) {
        var cssClass = event.target.getAttribute("class");

        if( cssClass == "plus-icon" ) {
            that.order().addAddressLine();
        } else if( cssClass == "minus-icon" ) {
            that.order().removeAddressLine();
        } else {
            that.proxy( that.setAddressEditing( address ) );
        }

        return false;
    };

    this.displayAddressesRubric = function(rubric) {
        if( this.addressesRubric() == rubric ) {
            if( this.addressesListVisibleMode() ) {
                this.addressesListVisibleMode( false );
            } else {
                this.addressesListVisibleMode( true );
            }
        } else {
            this.addressesRubric( rubric );
            if( !this.addressesListVisibleMode() ) {
                this.addressesListVisibleMode( true );
            }
        }
    };

    this.setAddressEditing = function(address) {
        //address.clear();
        this.order().currentAddress(address);
        this.order().currentAddress().clear();
        this.order().currentAddress().streetNameInputValue("");
        this.order().currentAddress().houseNumberInputValue("");
        //that.page('address');
        controller.navigate("address", true);

        this.clearSelectionData();
    };

    this.addressSelectionOk = function() {
        if( that.order().addressValidationMessage() != "") {
            var matchedHouse = that.findHouseNumberInAutocmpleteList();

            if( matchedHouse == null ) {
                alert( that.order().addressValidationMessage() );

                $( that.houseNumberField()).focus();
            } else {
                that.streetNameBegin('');
                that.houseNumberBegin('');
                that.selectHouse( matchedHouse );
                that.clearAutocompleteData();
                that.order().currentAddress().houseNumberInputValue("");

                if( that.isRouteSelected() ) {
                    that.isRouteSelected( false );
                }

                controller.navigate("home", true);
            }

        } else {
            that.streetNameBegin('');

            that.houseNumberBegin('');
            that.clearAutocompleteData();
            that.order().currentAddress().houseNumberInputValue("");

            if( that.isRouteSelected() ) {
                that.isRouteSelected( false );
            }

            controller.navigate("home", true);
        }
    };

    /* Data loading */
    this.loadIntroSteps = function() {
        if(this.introSteps().length == 0) {
            this.introSteps.push({ title: "Step 1", text: "Step 1 text" });
            this.introSteps.push({ title: "Step 2", text: "Step 2 text" });
            this.introSteps.push({ title: "Step 3", text: "Step 3 text" });
            this.introSteps.push({ title: "Step 4", text: "Step 4 text" });
        }
    };

    // Load streets autocomplete list
    this.loadStreets = function() {
        if( this.streetNameBegin() != "" && !this.isStreetSelected() && !this.isAddressSelection() ) {
            console.log( "Запрос улиц начинающихся на: " + this.streetNameBegin() );

            console.log( "URL: " + this.streetsUrl() );

            var that = this;

            $.ajax({
                url: this.streetsUrl(),
                type: "GET",
                context: this,
                beforeSend: function(xhr) {
                    if( this.base64AuthData() != "" ) {
                        xhr.setRequestHeader("Authorization", "Basic " + this.base64AuthData() );
                    }
                },
                success: function(data) {

                    if( data != "" ) {

                        var responseData = JSON.parse( data );
                        //console.log( responseData );

                        var requestText = responseData.request;

                        if( requestText == this.order().currentAddress().streetNameInputValue() ) {
                            //var streets = responseData.streets;

                            if( responseData.streets.length > 0 ) {

                                if(!this.isStreetSelected()) {
                                    this.isStreetsListEmpty( false );
                                    //this.streets( streets );

                                    this.streets( responseData.streets );

                                    //alert( "Streets loaded" );
                                }
                                this.streetsAutocompleteMessage( "" );
                            } else {
                                    this.streetsAutocompleteMessage( "К сожалению не найдено улиц" );
                            }

                        }
                    } else {
                        this.streetsAutocompleteMessage( "Не удается загрузить список улиц" );
                    }

                }
            });

        }
    };

    // Load houses autocomplete list
    this.loadHouses = function(houseNumber) {
        var filter = houseNumber || "";
        console.log( "Filter for query: " + filter );

        this.houses([]);

        if( !this.isHouseNumberSelected() && !this.isAddressSelection() ) {
            //alert( "Получение домов на запрос номера: " + filter );

            $.ajax({
                url: this.baseUrl() + 'houses/' + this.regionId() + '/' + this.selectedStreet().id + '/' + filter,
                type: "GET",
                context: this,
                beforeSend: function(xhr) {
                    if( this.base64AuthData() != "" ) {
                        xhr.setRequestHeader("Authorization", "Basic " + this.base64AuthData() );
                    }
                },
                success: function(data) {
                    if(data != "") {

                        console.log( "Input house: " + this.order().currentAddress().houseNumberInputValue() );

                        var responseData = JSON.parse( data );
                        var requestText = responseData.request;

                        if( requestText == this.order().currentAddress().houseNumberInputValue() || filter == "" ) {

                            var houses = responseData.houses;
                            if(houses.length == 0) {
                                this.loadHouses();
                            } else {
                                console.log( "Houses count: " + houses.length );

                                this.houses( houses );
                                $(this.houseNumberListContainer()).css({ display: "block" });
                            }

                        }
                    } else {
                        this.housesAutocompleteMessage( "Не удается загрузить список номеров домов" );
                    }
                }
            });
        }
    };

    this.loadClosestPlaces = function(places) {
        console.log( this );

        var self = this;
        $.ajax({
            url: this.sendGeocoordinatesUrl(),
            type: "GET",
            beforeSend: this.proxy(function(xhr) {
                if( this.base64AuthData() != "" ) {
                    xhr.setRequestHeader("Authorization", "Basic " + this.base64AuthData() );
                }
            }),
            success: function(data) {
                var responseData = JSON.parse( data );
                var places = responseData.closest;
                console.log( "Closest places count: " + places.length );

                places = places.shuffle();

                    for( var i = 0; i < places.length; i++ ) {
                        var place = places[i];

                        var closestItem = new HistoryItem({
                            regionId: responseData.regionid,
                            regionName: responseData.regionname,
                            cityName: place.cityname,
                            streetName: place.streetname,
                            streetId: place.streetid,
                            houseNumber: place.housename,
                            houseId: place.houseid
                        });

                        self.closestPlaces.push( closestItem );

                    }

                self.isProcess( false );
            }
        });
    };

    this.loadStations = function() {
        this.stations([]);
        this.isProcess( true );
        $.ajax({
            url: this.getStationsUrl(),
            type: "GET",
            success: function(data) {
                console.log( data );

                var stations = JSON.parse( data );
                //stations = stations.shuffle();

                for( var i = 0; i < stations.length; i++ ) {
                    var place = stations[i];

                    var station = new HistoryItem({
                        title: place.station,
                        regionId: place.regionid,
                        cityName: place.cityname,
                        streetName: place.streetname,
                        streetId: place.streetid,
                        houseNumber: place.housename,
                        houseId: place.houseid
                    });

                    viewModel.stations.push( station );
                }

                viewModel.isProcess( false );
            }
        });
    };

    this.loadAirports = function() {
        this.airports([]);
        this.isProcess( true );
        $.ajax({
            url: this.getAirportsUrl(),
            type: "GET",
            success: function(data) {
                console.log( data );

                var airports = JSON.parse( data );
                //stations = stations.shuffle();

                for( var i = 0; i < airports.length; i++ ) {
                    var place = airports[i];

                    var airport = new HistoryItem({
                        title: place.airport,
                        regionId: place.regionid,
                        cityName: place.cityname,
                        streetName: place.streetname,
                        streetId: place.streetid,
                        houseNumber: place.housename,
                        houseId: place.houseid
                    });

                    viewModel.airports.push( airport );
                }

                viewModel.isProcess( false );
            }
        });
    };

    // Focus on street input field
    this.setStreetEditing = function() {
        that.clearSelectionData();

        that.isStreetEditing( true );
        that.clearAutocompleteData();

        that.order().currentAddress().streetId( '' );
        that.order().currentAddress().clearHouseData();
        $(that.streetsList()).css({ "display": "none" });
    };

    // Focus on house input field
    this.setHouseNumberEditing = function() {
        that.isHouseNumberSelected( false );
        that.order().currentAddress().clearHouseData();
    };

    /* Region selection */
    // Load regions autocomplete list
    this.loadRegions = function() {

        if( this.regionNameBegin() != "" && !this.isRegionSelected() ) {
            console.log( "Load regions on region name begin: " + this.regionNameBegin() );

            $.ajax({
                url: this.regionsUrl(),
                type: "GET",
                context: this,
                beforeSend: function(xhr) {
                    if( this.base64AuthData() != "" ) {
                        xhr.setRequestHeader("Authorization", "Basic " + this.base64AuthData() );
                    }
                },
                success: function(data) {
                    //console.log(data);
                    that.clearRegionsData();

                    var regions = JSON.parse(data);

                    if(regions.length > 0) {
                        that.regions( regions );
                        that.isRegionsListEmpty(false);
                    } else {
                        that.isRegionsListEmpty(true);
                    }
                }
            });

        }
    };

    // Focus on region input field
    this.setRegionNameEditing = function() {
        this.isRegionSelected(false);
    };

    this.regionSelectionOk = function() {
        if( !that.isRegionSelected() ) {
            var matchedRegion = that.findRegionNameInAutocompleteList();

            if( matchedRegion == null ) {
                alert( "Пожалуйста выберите регион из списка" );
                $( that.regionInputField()).focus();
            } else {
                that.regionNameBegin('');
                that.selectRegion( matchedRegion );
                controller.navigate("home", true);
            }

        } else {
            that.regionNameBegin('');
            controller.navigate("home", true);
        }
    };

    /* Social network auth */
    this.publishToWall = function() {
        that.socialApi.publishWall(that.postText());
    };

    /* Software back button handler */
    this.moveBack = function() {
        window.history.back();
    };

    /* Cost computation */
    this.costCount = function() {
        var isOrderInvalid = that.order().isOrderDetailsInvalid();
        if( isOrderInvalid == "" ) {

            that.order().savePhone();
            that.order().cost( null );

            that.saveHistory();
            that.clearRoutePoints();

            that.isProcess( true );

            window.scrollTo(0, 0);
            that.isPointsLoading( true );

            that.loadEdgePoints();
            that.loadRoute(drawRoute);
            that.order().clearRouteData();

        } else {

            alert( isOrderInvalid );
        }
    };

}

AtlasTaxi.prototype = {
    /* Route data loading */
    // Load key route points
    loadEdgePoints: function() {

        var edgePointsUrl = this.getLoadEdgePointsUrl();
        var that = this;

        $.ajax({
            url: edgePointsUrl,
            type: "GET",
            beforeSend: function(xhr) {
                if( that.base64AuthData() != "" ) {
                    xhr.setRequestHeader("Authorization", "Basic " + that.base64AuthData() );
                }
            },
            success: function(data) {
                if( data == "") {
                    that.isPointsLoading( false );
                    alert("Невозможно получить данные о маршруте");

                } else {
                    var pointsData = JSON.parse(data);
                    var pointsId = pointsData.pointsid;
                    that.order().edgePointsId( pointsId );
                    var points = pointsData.points;

                    var longitudes = [];
                    var latitudes = [];

                    // If route was selected
                    if( that.isRouteSelected() == true ) {

                        for(var i = 0; i < points.length; i++) {
                            var point = points[i];
                            that.edgePoints.push( point );

                            longitudes.push( point.lon );
                            latitudes.push( point.lat );
                        }

                    } else {
                        var routeInfo = {};
                        routeInfo.date = Math.floor(new Date()/1000);
                        routeInfo.id = pointsId;
                        routeInfo.regionId = points[0].regionid;
                        routeInfo.points = [];

                        var houseIds = [];
                        for(var i = 0; i < points.length; i++) {
                            var point = points[i];
                            that.edgePoints.push( point );
                            routeInfo.points.push( point );

                            longitudes.push( point.lon );
                            latitudes.push( point.lat );
                            houseIds.push( point.houseid );
                        }

                        routeInfo.regionId = points[0].regionid;

                        routeInfo.hashCode = houseIds.join("");

                        if( !that.isRouteHistoryItemExists( routeInfo ) ) { //if( that.getEqualsRouteHistoryItem( routeInfo ) == null ) {
                            that.routesHistory.push( routeInfo );
                        }

                    }

                    var midLon = ( longitudes.max() + longitudes.min() ) / 2;
                    var midLat = ( latitudes.max() + latitudes.min() ) / 2;
                    that.middlePoint({ lon: midLon, lat: midLat });

                    that.leftLon( longitudes.min() - 0.009 );
                    that.rightLon( longitudes.max() + 0.009 );
                    that.topLat( latitudes.max() + 0.009 );
                    that.bottomLat( latitudes.min() - 0.009 );

                    console.log( "Left lon: " + that.leftLon() + ", right lon: " + that.rightLon() );
                    console.log( "Top lat: " + that.topLat() + ", bottom lat: " + that.bottomLat() );

                    that.isPointsLoading( false );
                    controller.navigate("routeMap", true);

                    reloadMap();
                    drawEdgePoints();
                }
            }
        });
    },

    // Load total route points
    loadRoute: function(callback) {
        var that = this;

        var url = this.getCostCountUrl();
        $.ajax({
            url: url,
            type: "GET",
            beforeSend: function(xhr) {
                if( that.base64AuthData() != "" ) {
                    xhr.setRequestHeader("Authorization", "Basic " + that.base64AuthData() );
                }
            },
            success: function(data) {
                var responseData = JSON.parse( data );
                var route = responseData.routedata;
                if(data == "" || route.status == 207) {
                    that.isProcess( false );

                    that.order().routeDataError("Не удается построить маршрут. Попробуйте выбрать другие адреса.");
                } else {

                    var routeSummary = route.route_summary,
                        routeGeometry = route.route_geometry;

                    that.order().routePointsId( responseData.routeid );
                    that.order().distanceCount( routeSummary.total_distance );

                    that.order().cost( 230 );

                    var routeGeometryPointsCount = routeGeometry.length;
                    for(var i = 0; i < routeGeometryPointsCount; i++) {
                        var geometryPoint = routeGeometry[i];
                        that.routePoints.push({ lat: geometryPoint[0], lon: geometryPoint[1] });
                    }

                    /*var midLon = ( longitudes.max() + longitudes.min() ) / 2;
                    var midLat = ( latitudes.max() + latitudes.min() ) / 2;
                    that.middlePoint({ lon: midLon, lat: midLat });*/

                    that.startPointName( routeSummary.start_point );
                    that.finishPointName( routeSummary.end_point );

                    that.isProcess( false );

                    callback.call(that);
                }
            }
        });
    },

    /* Input operations */
    streetNameInput: function(street) {
        this.streetNameBegin(street());
    },
    houseNumberInput: function(number) {
        this.houseNumberBegin(number());

        if( this.selectedHouse() != null) {
            var selectedHouseNumber = this.selectedHouse().house;

            if( number() == '' ) {
                //$(this.houseNumberField()).attr("value", selectedHouseNumber );
                // For autoinsertion house number on selection from history
                //this.order().currentAddress().houseNumberInputValue( selectedHouseNumber );
            }

            // If edit house number after house selection complete
            if( stringStartsWith(this.selectedHouse().house, number()) && number().toString().length < selectedHouseNumber.toString()) { // stringStartsWith(this.selectedHouse().house, number())) {
                console.log( "House number editing after selection" );

            }
        }

    },
    regionInput: function() {
        //this.regionNameBegin( this.regionNameInput() );
    },

    /* Select item from autocomplete list */
    // Select street autocomplete item
    selectStreet: function(street, isAddressSelection) {

        console.log( street );

        this.isStreetSelected(true);

        this.order().currentAddress().streetNameInputValue(street.name);
        this.order().currentAddress().streetName(street.name);

        this.order().currentAddress().streetId(street.id);

        this.order().currentAddress().cityName(street.city);

        this.selectedStreet(street);

        this.houseNumberBegin('');


        if( isAddressSelection == undefined ) {
            this.isStreetEditing(false);
        }

        //window.scrollTo(0, 0);

        $('html, body').animate( { scrollTop: 0 }, 'medium');

        $(this.houseNumberField()).focus();
    },

    // Select house autocomplete item
    selectHouse: function(house) {
        this.isHouseNumberSelected(true);

        var houseNumber = house.house;

        this.order().currentAddress().houseNumberInputValue(houseNumber);
        this.order().currentAddress().houseNumber(houseNumber);

        console.log( this.order().currentAddress().houseNumberInputValue() );

        setTimeout(function() {
            hideKeyboard();
        }, 300);

        this.order().currentAddress().houseId(house.id);

        this.selectedHouse(house);
        this.houseNumberBegin('');

        $(this.houseNumberField()).blur();

        window.scrollTo(0, 0);
    },
    findHouseNumberInAutocmpleteList: function() {
        var inputHouseNumber = this.order().currentAddress().houseNumberInputValue();
        console.log( "Input house number: " + inputHouseNumber );
        var matchedHouse = null;
        for( var i = 0; i < this.houses().length; i++ ) {
            var house = this.houses()[i];
            console.log( "House: " + house.house );

            if( house.house == inputHouseNumber ) {
                matchedHouse = house;
            }
        }

        return matchedHouse;
    },
    findRegionNameInAutocompleteList: function() {
        var inputRegionName = this.regionNameBegin();

        var matchedRegion = null;
        for( var i = 0; i < this.regions().length; i++ ) {
            var region = this.regions()[i];

            if( region.name == inputRegionName ) {
                matchedRegion = region;
            }
        }

        return matchedRegion;
    },

    // Click on street autocomplete item
    selectAddress: function(address) {
        console.log( "Select address" );

        var addressRegionId = address.regionId,
            addressRegionName = address.regionName;

        console.log( "Address region id: " + addressRegionId );

        if( addressRegionId != this.regionId() ) {
            var isUserConfirmRegionChange = window.confirm( "Установленный в настройках регион не совпадает с вашим местоположением. Переключить регион на " + addressRegionName + " ?" );
            if( isUserConfirmRegionChange ) {
                this.selectRegion({ name: addressRegionName, id: addressRegionId });

                this.isAddressSelection( true );
                var street = {
                    name: address.streetName,
                    id: address.streetId
                };

                this.selectStreet(street, true);

                var house = {
                    house: address.houseNumber, //number
                    id: address.houseId
                };

                this.selectHouse(house);
                this.order().currentAddress().cityName( address.cityName );
                this.isStreetEditing( false );

                var that = this;
                that.isAddressSelection( false );

                window.scrollTo(0, 0);
            }
        } else {
            this.isAddressSelection( true );
            var street = {
                name: address.streetName,
                id: address.streetId
            };

            this.selectStreet(street, true);

            var house = {
                house: address.houseNumber, //number
                id: address.houseId
            };

            this.selectHouse(house);
            this.order().currentAddress().cityName( address.cityName );
            this.isStreetEditing( false );

            var that = this;
            that.isAddressSelection( false );

            window.scrollTo(0, 0);
        }


    },

    // Click on item in route history
    selectRoute: function(route) {
        var addresses = route.points;

        var currentAddressesCount = this.order().addresses().length;
        console.log( "Addresses count: " + currentAddressesCount );

        for( var i = 0; i < currentAddressesCount; i++ ) {
            var routeAddress = addresses[i];

            var address = this.order().addresses()[i];
            address.cityName( routeAddress.cityname );
            address.streetName( routeAddress.streetname );
            address.streetId( routeAddress.streetid );
            address.houseNumber( routeAddress.housename );
            address.houseId( routeAddress.houseid );

            console.log( "Address: " + routeAddress.info.split(",")[1] + " - " + routeAddress.info.split(",")[2] );
        }

        controller.navigate("home", true);
        this.isRouteSelected( true );

    },

    // Click on region autocomplete item
    selectRegion: function(region) {
        this.regionName( region.name );
        this.regionId( region.id );
        this.clearRegionsData();

        $(this.regionInputField()).blur();
        this.isRegionSelected(true);

        window.scrollTo( 0, 0 );
    },

    // Select item from comment history
    selectComment: function(comment) {
        var commentText = comment.text;
        this.order().inputComment( commentText );

        $(this.commentInputField()).blur();

        window.scrollTo(0, 0);
    },

    /* Data operations */
    // Clear order data
    clearData: function() {
        this.order().clear();
    },
    // Clear previous address selection data
    clearSelectionData: function() {
        this.isStreetSelected(false);
        this.isHouseNumberSelected( false );
        this.selectedHouse( null );
    },
    // Clear address autocomplete data
    clearAutocompleteData: function() {
        this.streetsAutocompleteMessage("");
        this.streets().splice(0, this.streets().length);
        this.houses().splice(0, this.houses().length);

        $(this.houseNumberListContainer()).css({ display: "none" });
        this.streetNameBegin("");
        this.houseNumberBegin( "" );
    },
    clearRegionsData: function() {
        this.regions().clear();
    },
    clearRoutePoints: function() {
        this.routePoints().splice(0, this.routePoints().length );
        this.edgePoints().splice(0, this.edgePoints().length);
    },


    /* History */
    getHistoryItemByHouseId: function(houseId) {
        var historyLength = this.addressHistory().length;
        for(var i = 0; i < historyLength; i++) {
            if(this.addressHistory()[i].houseId == houseId) {
                return this.addressHistory()[i];
            }
        }
    },
    getCommentHistoryItemByText: function(text) {

        for(var i = 0; i < this.commentsHistory().length; i++) {
            var comment = this.commentsHistory()[i];
            if( comment.text == text ) {
                return comment;
            }
        }
    },

    // Find if route item is exist
    isRouteHistoryItemExists: function(item) {
        var equalItem = null;
        for( var i = 0; i < this.routesHistory().length; i++ ) {
            var routeHistoryItem = this.routesHistory()[i];
            if( routeHistoryItem.hashCode == item.hashCode ) {
                equalItem = routeHistoryItem;
            }

        }

        return equalItem != null;
    },

    /*getEqualsRouteHistoryItem: function(item) {
        var equalItem = null;
        for( var i = 0; i < this.routesHistory().length; i++ ) {
            var routeHistoryItem = this.routesHistory()[i];
            if( routeHistoryItem.hashCode == item.hashCode ) {
                equalItem = routeHistoryItem;
            }

        }
        return equalItem;
    },*/


    saveHistory: function() {
        var that = this;

        var lsval = Math.floor(new Date()/1000);

        var addresses = [];

        var mappingScript = document.createElement('script');
        mappingScript.type = 'text/javascript';
        mappingScript.async = true;
        mappingScript.src = "libs/knockout/knockout.mapping-latest.js";
        mappingScript.onload = function() {

            addresses = ko.mapping.toJS(that.order().addressesTo);

            var addressFrom = ko.mapping.toJS( that.order().addressFrom() );

            addresses.push(addressFrom);

            //TODO add screen number
            var addressesCount = addresses.length;
            for(var i = 0; i < addressesCount; i++) {
                var address = addresses[i];

                if(address.streetName != "" && address.houseNumber != "") {
                    var historyItem = new HistoryItem({
                        date: lsval,
                        regionId: that.regionId(),
                        cityName: address.cityName,
                        streetName: address.streetName,
                        streetId: address.streetId,
                        houseNumber: address.houseNumber,
                        houseId: address.houseId
                    });

                    if(that.getHistoryItemByHouseId(address.houseId) == undefined) {
                        that.addressHistory.push(historyItem);
                    }
                }
            }

            // Save comment to history
            var commentText = ko.mapping.toJS( that.order().comment );

            if(commentText != "") {

                var currentTime = new Date();
                currentTime = currentTime.toString("dd.mm.yy h:MM");
                console.log( currentTime );

                var existingComment = that.getCommentHistoryItemByText( commentText );

                if( existingComment == undefined ) {
                    var newComment = {
                        date: lsval,
                        text: commentText
                    };

                    that.commentsHistory.push( newComment );
                } else {

                    for(var i = 0; i < that.commentsHistory().length; i++) {
                        var comment = that.commentsHistory()[i];
                        if( comment.text == commentText ) {
                            that.commentsHistory()[i].date = currentTime;
                        }
                    }

                    viewModel.commentsHistory( viewModel.commentsHistory() );

                }
            }

        };
        document.body.appendChild(mappingScript);

    },
    // Clear addresses from history
    clearHistory: function() {
        window.localStorage.clear();
        this.addressHistory.removeAll();
    },
    removeAddressHistoryItem: function(item) {
        this.addressHistory.remove(item);
    },
    removeRouteHistoryItem: function(item) {
        this.routesHistory.remove(item);
    },
    // Remove comments from history
    removeHistoryComment: function(item) {
        this.commentsHistory.remove(item);
    },
    loadDriversList: function(callback) {
        //alert( "LOad drivers" );

        var that = this;
        $.ajax({
            url: this.driversUrl(),
            method: "GET",
            beforeSend: function(xhr) {
                if( that.base64AuthData() != "" ) {
                    xhr.setRequestHeader("Authorization", "Basic " + that.base64AuthData() );
                }
            },
            success: function(data) {
                console.log( "Drivers count: " + that.drivers().length );
                //$("#driverSlideContainer").find("li").remove();

                $("#driverSlideContainer").html("");
                //that.drivers.clear();
                that.drivers([]);
                //that.drivers.splice(0, that.drivers().length);

                var driversList = JSON.parse( data );

                driversList = driversList.shuffle();
                var driversCount = driversList.length;
                for(var i = 0; i < driversCount; i++) {
                    that.drivers.push( new Driver( driversList[i] ) );
                }

                if( callback ) callback();

            }
        })
    },

    updateDriversList: function() {
        alert( "Update drivers list" );

        if( this.page() == "driver-info" ) {
            this.loadDriversList( $.proxy(this.initDriversSwipe, this) );
        } else {
            this.loadDriversList( );
        }

        this.isDriversListUpdated( true );
    },

    /* UI coperations */
    // INit drivers selection lider
    initDriversSwipe: function() {
        console.log( this );
        var elem = document.getElementById('driverSwipe');
        var that = this;

        if( !this.isDriversListUpdated() ) {
            if( this.swipeViews['driverSwipe'] == undefined ) {
                this.swipeViews['driverSwipe'] = Swipe(elem, { startSlide: this.currentDriverIndex(), callback: function(index, elem) {
                    that.currentDriverIndex( index );
                }
                });
            }
            this.swipeViews['driverSwipe'].setup();
        } else {
            this.swipeViews['driverSwipe'] = null;
            this.swipeViews['driverSwipe'] = Swipe(elem, { startSlide: this.currentDriverIndex(), callback: function(index, elem) {
                that.currentDriverIndex( index );
            }
            });

            setTimeout(this.swipeViews['driverSwipe'].setup, 500);
            this.isDriversListUpdated( false );
        }
    },

    // Initializing app advantages slider
    initIntroStepsSwipe: function() {
        var elem = document.getElementById('introStepsSwipe');
        var that = this;

        this.swipeViews['introStepsSwipe'] = Swipe(elem, { startSlide: this.currentIntroStepIndex(), callback: function(index, elem) {
            that.currentIntroStepIndex( index );
        }
        });

        setTimeout(this.swipeViews['introStepsSwipe'].setup, 400);
    },

    updateDriversSwipe: function() {
        this.swipeViews['driverSwipe'].setup();
    },

    /* Social actions */
    authFacebook: function() {
        this.socialApi = new SocialApi("Facebook", this);
        this.socialApi.authenticate();
    },
    authVkontakte: function() {
        this.socialApi = new SocialApi("Vkontakte", this);
        this.socialApi.authenticate();
    },
    authFoursquare: function() {
        this.socialApi = new SocialApi("Foursquare", this);
        this.socialApi.authenticate();
    },
    displayFacebookUser: function(user) {
        this.isProcess( false );
        this.isAuthorithed( true );

        var currentUser = new SocialNetworkUser({ firstName: user.first_name, lastName: user.last_name, photo: user.picture.data.url });

        this.currentUser( currentUser );
        console.log(user);
    },
    displayVkUser: function(data) {
        var users = data.response;

        var user = users[0];

        this.isProcess( false );
        this.isAuthorithed( true );

        var currentUser = new SocialNetworkUser({ firstName: user.first_name, lastName: user.last_name, photo: user.photo });
        this.currentUser( currentUser );
    },
    displayFsqUser: function(user) {
        this.isProcess( false );
        this.isAuthorithed( true );

        var currentUser = new SocialNetworkUser({ firstName: user.firstName, lastName: user.lastName, photo: user.photo });

        this.currentUser( currentUser );
        console.log(user);
    }

};

/* Custom bindings */

ko.bindingHandlers.page = {
    'update': function(element, valueAccessor, allBindingsAccessor, viewModel, context) {
        if( viewModel.page() == valueAccessor() ) element.style.display = 'block';
        else element.style.display = 'none';
    }
};

ko.bindingHandlers.linkTo = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.registerEventHandler(element, "click", function(event) {

            controller.navigate(valueAccessor(), true);
            return true;
        });
    }
};

ko.bindingHandlers.menuButton = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.utils.registerEventHandler(element, "click", function(event) {
            //viewModel.page(valueAccessor());
            if(viewModel.isCarouselDisplaying()) {
                controller.navigate('carouselMenu', true);
            } else {
                controller.navigate('menu', true);
            }

            controller.navigate(valueAccessor(), true);
            return true;
        });
    }
};

ko.bindingHandlers.enterKey = {
    init: function(element, valueAccessor, allBindings, vm) {
        ko.utils.registerEventHandler(element, "keyup", function(event) {
            ko.utils.triggerEvent(element, "change");
            return true;
        });
    }
};

ko.bindingHandlers.keyPress = {
    init: function(element, valueAccessor, allBindings, vm) {
        ko.utils.registerEventHandler(element, "keydown", function(event) {
            var keyCode = event.keyCode;
            console.log( "Key: " + event.keyCode );

            valueAccessor().call( keyCode );
        });
    }
};

ko.bindingHandlers.element = {
    init: function(element, valueAccessor, allBindings, vm) {
        var value = valueAccessor();
        if( typeof value === "function" ) {
            value(element);
        }
    }
};

ko.bindingHandlers.listview = {
    init: function(element, valueAccessor) {
        $(element).listview();
    },
    update: function(element, valueAccessor, allBindings, vm) {
        $(element).listview("refresh");
    }
};

ko.bindingHandlers.map = {
    init: function(element, valueAccessor) {
        var height = $(window).height() - 205;
        //alert( height );
        $(element).attr({ style: "width: 100%; height: " + height + "px;" });
    },
    update: function(element, valueAccessor, allBindings, vm) {
        var height = $(window).height() - 205;
        //alert( height );
        $(element).attr({ style: "width: 100%; height: " + height + "px;" });
    }
};

// http://jsfiddle.net/snaptopixel/NRwXY/
ko.bindingHandlers.responsiveMap = {
    init: function(element, valueAccessor) {

        var orientation = viewModel.orientation();
        var height = $(window).height() - 175;

        $(element).attr({ style: "width: 100%; height: " + height + "px;" });

        // Map height recalculation on window resize
        $(window).resize(function() {
            var height = $(window).height() - 175;

            $(element).attr({ style: "width: 100%; height: " + height + "px;" });
        });
    }
};

ko.bindingHandlers.addressLine = {
    init: function(element, valueAccessor, allBindings, vm) {

        var address = vm;
        var width = $(window).width() - 120; // 170;

        var index = valueAccessor();

        // For addresses lines B - E with plus / minus icons
        if( viewModel.order().isAddressBeforeLast( index ) || viewModel.order().isAddressLast( index ) ) {
            $(element).find("span").attr({ style: "max-width: " + width + "px" });
            $(element).find("span").attr({ style: "width: " + width + "px" });
        }

        var icon = address.icon;
        $(element).css({ backgroundImage: 'url('+icon+')' });

        $(window).resize(function(e) {
            if( viewModel.order().isAddressBeforeLast( index ) || viewModel.order().isAddressLast( index ) ) {
                var width = $(window).width() - 120;
                $(element).find("span").attr({ style: "max-width: " + width + "px" });
                $(element).find("span").attr({ style: "width: " + width + "px" });
            }
        });
    },
    update: function(element, valueAccessor, allBindings, vm) {
        var address = vm;

        function changeAddressLineWidth () {

            var width = $(window).width() - 170; /*130;*/
            //alert( width );
            var index = valueAccessor();

            if( viewModel.order().isAddressBeforeLast( index ) || viewModel.order().isAddressLast( index ) ) {
                $(element).find("span").attr({ style: "max-width: " + width + "px" });
                $(element).find("span").attr({ style: "width: " + width + "px" });
            }

        }

        viewModel.orientation.subscribe(changeAddressLineWidth);

        var icon = address.icon;
        $(element).css({ backgroundImage: 'url('+icon+')' });
    }
}

ko.bindingHandlers.historyAddressLine = {
    init: function(element, valueAccessor) {
        var width = $(window).width() - 100;

        $(element).attr({ style: "max-width: " + width + "px" });
    },
    update: function(element, valueAccessor) {
        function changeHistoryAddressLineWidth() {

            var width = $(window).width() - 90;
            $(element).attr({ style: "max-width: " + width + "px" });
        }

        viewModel.orientation.subscribe(changeHistoryAddressLineWidth);
    }
};

ko.bindingHandlers.fixedButtons = {
    init: function(element, valueAccessor) {
        var width = Math.floor( viewModel.screenWidth / 2) - 52;
        var top = $(window).height() - 110;
        //alert( $(window).height() );
        $(element).attr({ style: "width: " + width + "px" });
        //$(element).parent().attr({ style: "top: " + top + "px" });
    }
};

ko.bindingHandlers.switcher = {
    init: function(element, valueAccessor, allBindings, vm) {
        console.log("SWitcher init");

        // Total container width
        var totalWidth = $(window).width() - 40;
        //alert( "Total: " + totalWidth );

        var elementOffsets = element.getBoundingClientRect();
        var left = elementOffsets.left;

        $(element).css({ width: totalWidth + "px" });

        // Half of width for distinction clicks on states
        var middlePosition = $(element).width() / 2;

        viewModel.switcherMiddlePos( middlePosition );

        var value = valueAccessor();
        if(value() == true) {
            $(element).find(".slide-button").css({ left: "0" });
            $(element).find("div").eq(0).addClass("active");
        } else {
            $(element).find(".slide-button").css({ left: "50%" });
            $(element).find("div").eq(1).addClass("active");
        }

        ko.utils.registerEventHandler(element, "click", function(evt) {

            console.log("Click");
            var clickX = evt.clientX - left;

            console.log( viewModel.switcherMiddlePos() );

            // Click on right side of switcher
            if( clickX > viewModel.switcherMiddlePos() && parseInt( $(element).find(".slide-button").css("left") ) == 0 ) {
                $(element).find(".slide-button").animate({ left: "50%" }, 500);
                $(element).find(".switcher-option").eq(1).removeClass("inactive").addClass("active");
                $(element).find(".switcher-option").eq(0).addClass("inactive");

                value( false );

                // Click on left side of switcher
            }  else if( clickX < viewModel.switcherMiddlePos() && parseInt( $(element).find(".slide-button").css("left") ) > 0 ) {
                $(element).find(".slide-button").animate({ left: "0" }, 500);
                $(element).find(".switcher-option").eq(0).removeClass("inactive").addClass("active");
                $(element).find(".switcher-option").eq(1).addClass("inactive");
                value( true );
            }
        });
    },
    update: function(element, valueAccessor, allBindings, vm) {
        console.log( "Update switcher" );
    }
};

ko.bindingHandlers.banner = {
    init: function(element, valueAccessor) {
        var width = $(window).width() - 40;
        $(element).attr({ style: "width: " + width + "px" });
    }
};

ko.bindingHandlers.swipedView = {
    init: function(element, valueAccessor) {
        //setTimeout(function() {
            var swipedViewId = $(element).attr("id");
            var elem = document.getElementById(swipedViewId);

            var swipedViewStepIndex = valueAccessor();

            //var totalWidth = $(window).width() - 40;
            /*var maxSideWidth = Math.max( $(window).width(), $(window).height());
            var width = maxSideWidth + 45;
            alert( "Max side width: " + width );

            $(element).css({ maxWidth: width + 'px' });*/

            /*var totalWidth = $(window).width() - 40;
            $(element).css({ maxWidth: totalWidth + 'px' });*/

            window.onresize = function() {
                /*var totalWidth = $(window).width() - 40;
                $(element).css({ maxWidth: totalWidth + 'px' });*/
            };

            window.onorientationchange = function() {
                /*var totalWidth = $(window).width() - 40;
                $(element).css({ maxWidth: totalWidth + 'px' });*/
            }

        //}, 300);
    },
    update: function(element, valueAccessor) {
    }
};

ko.bindingHandlers.pagination = {
    init: function(element, valueAccessor) {

        setTimeout(function() {
            var collection = valueAccessor();
            console.log( valueAccessor() );
            var slidesCount = collection.length;
            var paginationWidth = slidesCount * 13 + ( (slidesCount - 1) * 15 ) + 5;
            console.log( "Slides count: " + slidesCount );

            $(element).css({ width: paginationWidth + "px" });

        }, 300);
    },
    update: function(element, valueAccessor) {

        setTimeout(function() {
            var collection = valueAccessor();
            console.log( valueAccessor() );
            var slidesCount = collection.length;
            var paginationWidth = slidesCount * 13 + ( (slidesCount - 1) * 15 ) + 5;
            console.log( "Slides count: " + slidesCount );

            $(element).css({ width: paginationWidth + "px" });

        }, 300);
    }
};

ko.bindingHandlers.shader = {
    init: function(element, valueAccessor) {
        var height = $(window).height();
        $(element).css({ height: height });

    },
    update: function(element, valueAccessor) {
        //TODO set on scrolltop
        var windowTop =  window.pageYOffset;
        var top = $(element).offset().top + $(window).scrollTop();

        var height = $(window).height();
        $(element).css({ height: height });
    }
};

ko.bindingHandlers.myClick = {
    init: function(element, valueAccessor, allBindings, vm) {
        console.log("myClick init");
        ko.utils.registerEventHandler(element, "click", function(event) {
            valueAccessor()( vm, event );
        });
    }
};