function SocialNetworkUser(initObj) {
    this.firstName = ko.observable();
    this.lastName = ko.observable();
    this.photo = ko.observable();

    this.fullName = ko.computed(function() {
        return this.firstName() + " " + this.lastName();
    }, this);

    for(var key in initObj) {
        if( typeof this[key] !== undefined ) {
            this[key]( initObj[key] );
        }
    };

    return this;
}

SocialNetworkUser.prototype = {
    clear: function() {
        alert( "Clear user" );
        for(var key in this) {
            if(key != "fullName" && key != "clear") {
            //if( typeof this[key] !== "function") {
                this[key]("");
            //}
            }
        }
    }
};

/* Main application user profile */
function AppUser() {
    this.login = ko.observable("", { persist: "myPhone" });
    this.password = ko.observable("", { persist: "code" });
    this.inputPassword = ko.observable(); /*ko.computed(function() {
        return this.password();
    }, this);*/


    this.id = ko.observable("");
    this.regionId = ko.observable(66, { persist: "regionId" });

    this.isCodeRequested = ko.observable(false);
    this.isRegistered = ko.observable(false);
    this.isAuthorized = ko.observable(false);
    this.isAuthSuccess = ko.observable(false);

    this.signUpUrl = "http://itaxio.ru/v1.0/signup/";
    this.signInUrl = "http://itaxio.ru/v1.0/signin";
    this.registerMessage = ko.observable("");

    this.passwordInputField = ko.observable();
}

// Test HTTP auth
function authorizeUser() {
    var login = this.order().phone(),
        password = "123456";

    console.log( "Login: " + login );

    var base64AuthData = btoa( login + ":" + password );

    $.ajax({
        url: 'http://driver.itaxio.ru/v1.0/signin',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64AuthData );
        },
        success: function(data, status, xhr) {
            console.log( "Status: " + xhr.status );

            if( xhr.status == 401 ) {
                // Incorrect data sent
            }
        }
    });

}

AppUser.prototype = {
    clearAuthProcessData: function() {
        console.log( "Clear process data" );
        this.isAuthSuccess( false );
        this.inputPassword( this.password() );
    },
    checkStatus: function() {
        this.inputPassword( this.password() );

        if( this.password() != "" ) {
            this.signIn("auto");
        }
    },
    //User registrartion
    requireCode: function() {
        var that = this;

        this.inputPassword("");
        console.log( this.password() );

        this.password( "" );
        this.isCodeRequested( true );
        $(this.passwordInputField()).focus();

        alert( "Вам был выслан код подтверждения" );

        $.ajax({
            url: this.signUpUrl + this.login(),
            method: "GET",
            success: function(data) {
                console.log( data );

                var userData = JSON.parse( data );
                that.id( userData.userid );
                that.regionId( userData.regionid );

            }
        });
    },
    signUp: function() {
        console.log( "sign up" );

        var that = this;

        if( this.inputPassword().length == 6 && this.inputPassword().match(/^[0-9]+$/g) ) {
            $.ajax({
                url: this.signUpUrl,
                method: "POST",
                data: {
                    phone: this.login(),
                    tmppwd: this.inputPassword()
                },
                success: function(data) {
                    console.log( data );
                    var registerData = JSON.parse(data);
                    if( registerData.status == "error" ) {
                        that.registerMessage( "Вы неправильно ввели код подтверждения" );
                    } else {
                        that.registerMessage( "" );
                        that.password( that.inputPassword() );

                        that.signIn();
                    }
                }
            });


        } else {
            this.registerMessage( "Код подтверждения должен содержать 6 цифр" );
        }

    },
    // User authorization
    signIn: function(authMode) {
        var that = this;
        var login = this.login(),
            password = this.password();

        //alert( this.signInUrl );

        var base64AuthData = btoa( login + ":" + password );
        //alert( base64AuthData );

        $.ajax({
            url: this.signInUrl,
            type: "GET",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + base64AuthData );
            },
            success: function(data, status, xhr) {
                console.log( data );

                if( xhr.status == 401 ) {
                    alert( "Auth error" );
                    that.isAuthorized( false );
                    // Incorrect data sent
                } else {
                    that.isAuthorized( true );
                    that.isCodeRequested( false );
                    if( authMode != "auto" ) {
                        alert( "Вы успешно авторизовались" );
                    }
                }
            }
        });
    },

    // User logout
    signOut: function() {
        //alert( "Sign out" );
        console.log( this );
        this.password("");
        this.inputPassword("");
        this.isAuthorized(false);
    }
};