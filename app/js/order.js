function Order(viewModel) {
    var that = this;

    this.maxCommentLength = 140;
    this.viewModel = viewModel;

    this.validation = new ValidForm([{
        field: "addresses",
        isInvalid: function() {
            var isInvalid = true;
            var addresses = this.addresses();

            var validAddressesCount = 0;
            for(var i = 0; i < addresses.length; i++) {
                if(addresses[i].streetId() != '' && addresses[i].houseId() != '') {
                    validAddressesCount++;
                }
            }
            return validAddressesCount != addresses.length;
        },
        message: "Пожалуйста, заполните все адреса"
    }, {
        field: "phone",
        isInvalid: function() {
            //console.log( this.phone() );
            //console.log( "Phone length: " + this.phone().length );
            //console.log( "Is correct: " + ( /^9\d{9}$/.test(this.phone()) ) );
            //console.log( "Is 10-digit: " + ( this.phone().length == 10 ) );
            return !(/^9\d{9}$/.test(this.phone())) || this.phone().length != 10;
        },
        message: "Пожалуйста, введите корректный 10-значный номер телефона"
    }], this);

    this.addressIcons = [ "b.png", "c.png", "d.png", "e.png", "f.png" ];

    this.id = ko.observable();
    this.date = ko.observable(new OrderDate());
    this.comment = ko.observable("");

    this.inputComment = ko.observable("");

    this.addressFrom = ko.observable(new Address("a.png"));

    var isActive = true;
    var newAddress = new Address(this.addressIcons[0], isActive);
    this.addressesTo = ko.observableArray([ newAddress ]);

    this.newAddressTo = ko.observable(newAddress);
    this.currentAddress = ko.observable(newAddress);

    this.currentAddress.subscribe(function(newValue) {
        newValue.clear();
    }, this);

    this.house = ko.observable("");
    this.houseId = ko.observable();
    this.cost = ko.observable(null);

    this.edgePointsId = ko.observable();
    this.routePointsId = ko.observable();

    this.routeDataError = ko.observable("");

    this.distanceCount = ko.observable(null);
    this.status = ko.observable();
    this.confirmCode = ko.observable("");

    this.phone = ko.observable("", { persist: "myPhone" });
    this.inputPhone = ko.observable();

    this.costDigits = ko.computed(function() {
        return this.cost() != null ? this.cost().toString().split('') : '';
    }, this);

    this.remainingCommentSimbols = ko.computed(function() {
        return this.maxCommentLength - this.inputComment().length;
    }, this);

    this.orderType = ko.observable(1, { persist: "orderType" });

    // 'automatic' - 1, 'manual' - 2
    this.driverSelection = ko.computed({
        read: function() {
            // true - 'automatic'
            // false - 'manual'
            return this.orderType() == 1 ? true : false;
        }, write: function(value) {
            this.orderType( value == true ? 1 : 2 );
        },
        owner: this
    });


    this.isCostComputation = ko.observable(false);
    this.isConfirmation = ko.observable( false );
    this.isComplete = ko.observable( false );

    this.addresses = ko.computed({
        read: function() {
            return [ this.addressFrom() ].concat(this.addressesTo());
        }, write: function(newValue) {
            // Clearing addresses
            if(newValue.length == 0) {
                this.addressFrom().clear();
                this.addressesTo([ this.addressesTo()[0] ]);
                this.addressesTo()[0].clear();
            }
        }
    }, this);

    /* Validation */
    this.isOrderDetailsInvalid = ko.computed(function() {
        var validationMessage = this.validation.validate();
        //console.log( this.addresses() );
        return validationMessage != "" ? "Форма заказа заполнена некорректно: " + validationMessage : "";
    }, this);

    this.addressValidationMessage = ko.computed(function() {
        return this.currentAddress().validate();
    }, this);

    this.fieldEmptyMessage = ko.computed(function() {
        if( this.addresses()[0].streetId() == undefined && this.addresses()[1].streetId() == undefined ) {
            return "Вы не указали ни одного адреса";
        } else if( this.addresses()[0].streetId() == undefined || this.addresses()[1].streetId() == undefined ) {
            return "Пожалуйста, заполните все адреса";
        } else if( this.phone() == undefined ) {
            return "Пожалуйста, введите номер телефона";
        }
    }, this);

    this.houseIds = ko.computed(function() {
        var houseIds = ko.utils.arrayMap(this.addresses(), function(address) {
            return address.houseId();
        });
        return houseIds;
    }, this);

    this.costDigitType = function(index) {
        if( index == 0 ) {
            return "l";
        } else if( index == this.costDigits().length - 1 ) {
            return "r";
        } else {
            return "c";
        }
    };

    this.addAddressLine = function() {
        var addressesCount = that.addressesTo().length;
        var icon = that.addressIcons[addressesCount];

        var newAddress = new Address(icon, true);
        that.addressesTo.push( newAddress );
        that.newAddressTo( newAddress );
    };

    this.removeAddressLine = function() {
        that.addressesTo.pop();
    };

    this.checkCommentLength = function(data, event) {
        if(that.inputComment().length == that.maxCommentLength) {
            console.log( "Key code: " + event.keyCode );
            if(event.keyCode != 8 ) {
                return false;
            } else {
                return true;
            }
        }
        return true;
    };

    this.commentOK = function() {
        console.log( "commentOK fired" );

        var comment = that.inputComment().replace(new RegExp(">","g"),"_");
        comment = comment.replace(new RegExp("<","g"),"_"); //  /</g
        comment = comment.replace(/\\/g,"|");
        comment = comment.replace(new RegExp("/","g"),"|"); //  /\//g

        that.comment( comment );
        controller.navigate('home', true);
    };

    this.commentCancel = function() {
        /*that.inputComment( "" );*/
        controller.navigate('home', true);
    };

    this.inputComment.subscribe(function(newValue) {
        console.log("Input comment was changed");
    }, this);
}

Order.prototype = {
    clear: function() {
        console.log("Clear order data");
        this.id(null);
        this.cost(null);

        // Clear addresses
        this.addresses([]);

        console.log("Addresses count: " + this.addresses().length);
        //this.costCount(null);
        this.distanceCount(null);
        this.comment("");
    },
    clearRouteData: function() {
        this.routeDataError('');
        this.distanceCount(null);
        this.isConfirmation( false );
        this.isComplete( false );
        this.confirmCode('');
    },
    isAddressLast: function(index) {
        return index() == this.addresses().length - 1;
    },
    isAddressBeforeLast: function(index) {
        return this.addresses().length > 2 ? index() == this.addresses().length - 2 : false;
    },
    removeAddressLine: function() {

    },
    addAddress: function() {

    },
    addressFromOk: function() {

    },
    removeAddress: function() {

    },
    resetDate: function() {
        this.date().reset();
    },

    savePhone: function() {
        var phoneField = "myPhone";
        if(window.localStorage) {
            localStorage.setItem(phoneField, this.phone());

            var phone = localStorage.getItem(phoneField);
        }
    },
    makeOrder: function() {
        var that = this;

        var now = new Date(),
            date = new Date(that.date().year(), that.date().month()-1, that.date().day(), that.date().hour(), that.date().minute());

        console.log( now );
        console.log( date );
        var diff = date - now;
        console.log( "Time difference: " + diff );

        if( diff < 0 ) {
            that.date().minute( now.getMinutes() + 3 );

            console.log( "New minutes: " + that.date().minute() );
        }

        var confirmText = "Подтвердите заказ такси на время " +
            this.date().formatDate() + ', ' + this.date().formatTime() +
            " по маршруту [";

        var edgePointsLength = this.viewModel.edgePoints().length;
        for(var i = 0; i < edgePointsLength; i++) {
            var point = this.viewModel.edgePoints()[i];
            confirmText += point.info;
            if( i < edgePointsLength - 1 ) {
                confirmText += " -> ";
            }
        }

        confirmText += "]";

        confirmText += " с комментарием '" + this.comment() + "' ";
        confirmText += " на номер телефона " + this.phone() + " с ";

        if(this.orderType() == 1) {
            confirmText += "автоматическим";
        } else {
            confirmText += "самостоятельным";
        }
        confirmText += " выбором водителя";

        var isUserConfirmed = window.confirm( confirmText );
        if( isUserConfirmed ) {

            var url = "http://itaxio.ru/v1.0/order/" + this.viewModel.regionId();
            console.log( url );

            $.post(url, {
                pointsId: that.edgePointsId(),
                routeId: that.routePointsId(),
                phone: that.phone(),
                comment: that.comment(),
                orderDay: that.date().day(),
                orderMonth: that.date().month(),
                orderYear: that.date().year(),
                orderHour: that.date().hour(),
                orderMinute: that.date().minute(),
                orderType: that.orderType()
            }, function(data) {
                console.log( data );

                var orderInfo = JSON.parse( data );
                that.id( orderInfo.orderid );

                that.isConfirmation( true );

                alert( "Вам на телефон выслан код подтверждения" );
            });

        }
    },
    sendConfirmRequest: function() {
        var that = this;
        var confirmUrl = "http://itaxio.ru/v1.0/confirm/" + this.id();

        $.post(confirmUrl, {
            code: this.confirmCode()
        }, function(data) {
            console.log( data );

            var response = JSON.parse( data );
            if( response.status == "error" ) {
                alert( "Неправильно введен код подтверждения" );
            } else {
                that.isConfirmation( false );
                that.isComplete( true );

                window.scrollTo(0, 0);

                if( that.orderType() == 2 ) {
                    viewModel.loadDriversList();
                    controller.navigate('driver', true);
                } else {
                    alert( "Автоматический выбор водителя" );
                }
            }
        });

    },
    showOrder: function() {

    },
    costCount: function() {
        alert("CostCount");
    },
    showCostCount: function() {

    }
};

/* Address class */

function Address(icon, isActive) {
    var that = this;
    this.icon = 'img/' + icon;

    this.number = ko.computed(function() {
        return "Hello";
    }, this);

    this.alphabet = ko.computed(function() {
        return this.icon.slice(4, this.icon.length).split(".")[0].toUpperCase();
    }, this);

    this.streetName = ko.observable("");
    this.streetNameInputValue = ko.observable("");
    this.streetId = ko.observable("");

    this.houseNumber = ko.observable("");
    this.houseNumberInputValue = ko.observable("");
    this.houseId = ko.observable("");

    this.filterInputTimeout = null;

    this.cityName = ko.observable("");

    if(isActive != undefined) {
        this.isActive = isActive;
    }

    this.validation = new ValidForm([{
        field: "streetId",
        isInvalid: function() {
            return this.streetId() == '';
        },
        message: "Пожалуйста, выберите улицу из списка предложенных вариантов"
    }, {
        field: "houseId",
        isInvalid: function() {
            return this.houseId() == '';
        },
        message: "Пожалуйста, выберите номер дома из списка предложенных вариантов"
    }], this);

    this.formatString = ko.computed(function() {
        return this.cityName() + ', ' + this.streetName() + ", " + this.houseNumber();
    }, this);

    this.debugInfo = ko.computed(function() {
        return this.streetName() + ": " + this.streetId() + ", " + this.houseNumber() + ": " + this.houseId();
    }, this);

    this.validationMessage = ko.computed(function() {
        return this.validation.validate();
    }, this);

    that.streetName.subscribe = function(newValue) {
        //alert("Street name update");
    };

    that.streetInput = function() {
        console.log();
    };

    this.streetNameInputValue.subscribe(function(newValue) {
        clearTimeout(this.filterInputTimeout);
        this.filterInputTimeout = setTimeout(this.setStreet, 1500);
    }, this);

    /*this.houseNumberInputValue.subscribe(function(newValue) {
     this.setHouse();
     }, this);*/

    this.houseNumberInputValue.subscribe(function(newValue) {
    });

    this.setStreet = function() {
        that.streetName(that.streetNameInputValue());
    };

    this.setHouse = function() {
        that.houseNumber(that.houseNumberInputValue());
    }
}

// http://www.knockmeout.net/2013/01/simple-editor-pattern-knockout-js.html

Address.prototype = {
    clearStreetData: function() {
        this.streetName("");
        //this.streetNameInputValue("");
        this.streetId("");
    },
    clearHouseData: function() {
        this.houseNumber("");
        //this.houseNumberInputValue("");
        this.houseId("");
    },
    clear: function() {
        this.clearStreetData();
        this.clearHouseData();
    },
    validate: function() {
        return this.validation.validate();
    }
};

/* Date class */

function OrderDate() {
    var that = this;
    var now = new Date();

    this.curDay = ko.observable(0);

    this.dayName = ko.observable("Сегодня");
    this.day = ko.observable(now.getDate());
    this.newDay = ko.observable(now.getDate());

    this.month = ko.observable(now.getMonth() + 1);
    this.year = ko.observable(now.getFullYear());
    this.hour = ko.observable(now.getHours());

    var minute = now.getMinutes();

    this.minute = ko.observable(minute);
    this.newMinute = ko.observable(minute);

    this.formatMonth = ko.computed(function() {
        return ( this.month() < 10 ? "0" : "" ) + this.month();
    }, this);

    this.formatDay = ko.computed(function() {
        return (this.day() < 10 ? "0" : "" ) + this.day();
    }, this);

    this.formatHour = ko.computed(function() {
        return (this.hour() < 10 ? "0" : "" ) + this.hour();
    }, this);

    this.formatMinute = ko.computed(function() {
        return (this.minute() < 10 ? "0" : "" ) + this.minute();
    }, this);

    this.formatDate = ko.computed(function() {
        var today = new Date();
        today.setDate(now.getDate() + this.curDay());

        this.day( today.getDate() );

        if(this.curDay() == 0) {
            return "Сегодня";
        } else if(this.curDay() == 1) {
            return "Завтра";
        }

        return [this.formatDay(), this.formatMonth(), this.year()].join(".");
    }, this);

    this.formatTime = ko.computed(function() {
        return [this.formatHour(), this.formatMinute()].join(":");
    }, this);

    this.formatFullDate = ko.computed(function() {
        return [this.formatDate(), this.formatTime()].join(", ");
    }, this);
}

OrderDate.prototype = {
    dayPlus: function() {
        this.curDay( (this.curDay() + 1) % 7 );
    },
    dayMinus: function() {
        this.curDay( ( this.curDay() == 0 ? 7 : this.curDay()) - 1 );
    },
    hourPlus: function() {
        this.hour( (this.hour() + 1) % 24 );
    },
    hourMinus: function() {
        this.hour( ( this.hour() == 0 ? 24 : this.hour() ) - 1 );
    },
    minutePlus: function() {
        this.minute( ( this.minute() + 1) % 60 );
    },
    minuteMinus: function() {
        this.minute( ( this.minute() == 0 ? 60 : this.minute() ) - 1 );
    },
    reset: function() {
        var now = new Date();

        this.dayName("Сегодня");
        this.day(now.getDate());

        this.curDay(0);
        this.month(now.getMonth() + 1);
        this.year(now.getFullYear());
        this.hour(now.getHours());
        this.minute(now.getMinutes());
    },
    changeMin: function() { },
    changeHour: function() { },
    changeDay: function() { },
    changeMonth: function() { },
    changeYear: function() { }
}