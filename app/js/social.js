function SocialApi(socialNetwork, viewModel) {
    this.viewModel = viewModel;
    this.socialNetwork = socialNetwork;
    this.authentUrl = "";

    this.user = null;
    this.userId = null;
    this.oauthToken = null;

    this.appKeys = {
        "Facebook": "191171984328912",
        "Vkontakte": "3662710",
        "Foursquare": "O01SRTW5SV02XQA2WJUCPETBZY2XKKHHXDR4FIMIHUVUVANY"
    };

    this.appClientSecrets = {
        "Facebook": "40d38848c29bed0463a423a37e661c29",
        "Foursquare": "H3NR53QXY0HCRG4IRS3KXEWDYEZRYBPC4H1HHIWXY1XCHIXR"
    };

    this.appRedirectUrls = {
        //"Facebook": "http://www.facebook.com/connect/login_success.html",
        "Facebook": "http://mir-mmm2011.ru/fb/index.html",
        "Vkontakte": "https://oauth.vk.com/blank.html",
        "Foursquare": "http://itaxio.com/"
    };

    this.appAccessTokenUrls = {
        "Foursquare": "https://foursquare.com/oauth2/access_token?",
        "Vkontakte": "https://api.vk.com/method/users.get?"
    };

    this.userInfoUrls = {
        "Facebook": "https://graph.facebook.com/me?",
        "Vkontakte": "https://api.vk.com/method/users.get?",
        "Foursquare": "https://api.foursquare.com/v2/users/self?"
    };

    this.publishNoteUrls = {
        "Foursquare": "http://api.foursquare.com/v2/checkins/add"
    };

    this.appKey = this.appKeys[this.socialNetwork];
    this.appRedirectUrl = this.appRedirectUrls[this.socialNetwork];
    this.appClientSecret = this.appClientSecrets[this.socialNetwork];
    this.publishNoteUrl = this.publishNoteUrls[this.socialNetwork];
    this.appAccessTokenUrl = this.appAccessTokenUrls[this.socialNetwork];
    this.userInfoUrl = this.userInfoUrls[this.socialNetwork];

    this.authenticate = function() {

        var that = this;
        if(this.socialNetwork == "Facebook") {
            this.authentUrl = "https://www.facebook.com/dialog/oauth?";
        } else if(this.socialNetwork == "Vkontakte") {
            this.authentUrl = "https://oauth.vk.com/authorize?";
        } else {
            //Foursquare
            this.authentUrl = "https://foursquare.com/oauth2/authenticate?";
        }

        var scope = "scope=email,read_stream,user_groups,";
        if(this.socialNetwork == "Facebook") {
            scope += "publish_stream";
        } else if(this.socialNetwork == "Vkontakte") {
            scope += "wall";
        }

        var queryParams = [];
        queryParams.push( 'client_id=' + this.appKey );
        queryParams.push( 'redirect_uri=' + this.appRedirectUrl );

        if(this.socialNetwork == "Facebook" || this.socialNetwork == "Vkontakte" ) {
            queryParams.push( 'display=touch' );
        }
        if(this.socialNetwork == "Facebook" || this.socialNetwork == "Vkontakte" ) {
            queryParams.push( scope );
        } else if(this.socialNetwork == "Foursquare") {
            // Foursquare
            queryParams.push( 'response_type=code' );
        }

        if(this.socialNetwork == "Vkontakte" || this.socialNetwork == "Facebook") {
            queryParams.push( 'response_type=token' );
        }

        query = queryParams.join("&");
        this.authentUrl = this.authentUrl + query;

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "libs/child-browser.js";
        script.onload = Proxy(function() {

            window.plugins.childBrowser.showWebPage(this.authentUrl, { showLocationBar: false });

            window.plugins.childBrowser.onLocationChange = function(url){

                url = decodeURIComponent(url);

                var accessToken,
                    queryParams,
                    query,
                    script;

                if(url.indexOf(that.appRedirectUrl) == 0 ) {

                    window.plugins.childBrowser.close();

                    if(that.socialNetwork == "Facebook" || that.socialNetwork == "Vkontakte") {

                        var userInfoUrl;
                        var accessToken = url.substring(that.appRedirectUrl.length + 1);

                        accessToken = accessToken.split("=")[1];
                        accessToken = accessToken.substr(0, accessToken.indexOf("&"));

                        that.oauthToken = accessToken;

                        if(that.socialNetwork == "Vkontakte") {

                            var userId = url.substring( url.indexOf("user_id") + "user_id=".length );
                            that.userId = userId;
                        }

                        //User permissions
                        var permissions = [];

                        if( that.socialNetwork == "Facebook" ) {
                            permissions = [ 'id', 'name', 'picture', 'first_name', 'last_name', 'locale', 'link', 'username', 'birthday', 'email' ];
                        } else {
                            permissions = [ 'uid', 'first_name', 'last_name', 'photo' ];
                        }

                        var access = "fields=" + permissions.join(',');

                        var callback = "";

                        if( that.socialNetwork == "Facebook" ) {
                            callback = "viewModel.displayFacebookUser";
                        } else {
                            callback = "viewModel.displayVkUser";
                        }
                        queryParams = [
                            that.socialNetwork == "Vkontakte" ? 'uid=' + that.userId : "",
                            "access_token=" + that.oauthToken,
                            'callback=' + callback,
                            access
                        ];

                        query = queryParams.join('&');

                        userInfoUrl = that.userInfoUrl + query;

                        script = document.createElement('script');
                        script.src = userInfoUrl;
                        document.body.appendChild(script);

                    } else {
                        var accessTokenUrl = that.appAccessTokenUrl;
                        if(that.socialNetwork == "Foursquare") {
                            var code = url.substr( that.appRedirectUrl.length + "?code=".length );

                            var queryParams = [
                                'client_id=' + that.appKey,
                                'client_secret=' + that.appClientSecret,
                                'grant_type=authorization_code',
                                'redirect_uri=' + that.appRedirectUrl,
                                'code=' + code
                            ];

                            var query = queryParams.join("&");
                            accessTokenUrl = accessTokenUrl + query;

                            $.ajax({
                                url: accessTokenUrl,
                                method: "POST",
                                success: function(data) {

                                    var accessToken = data.access_token;
                                    that.oauthToken = data.access_token;

                                    var userInfoUrl = that.userInfoUrls[that.socialNetwork];
                                    userInfoUrl += "oauth_token=" + that.oauthToken;

                                    $.ajax({
                                        url: userInfoUrl,
                                        method: "GET",
                                        success: function( userData ) {
                                            that.viewModel.displayFsqUser( userData.response.user );
                                        }
                                    });
                                }
                            });
                        }
                    }

                }
            };


        }, this);
        document.body.appendChild(script);

    };

    this.publishWall = function(postText) {
        var that = this;

        if(this.socialNetwork == "Facebook") {

            var appIdStr = "app_id=" + this.appKey,
                message = "message=" + viewModel.postText(),
                link = "link=http://www.atlas-taxi.com/",
                picture = "picture=https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkIg6SSWatKeBeeIHPMgbNCzbbP_bCnunQmtnC2qNl2Dvl2yvc:w124h124",
                caption = "caption=http://www.atlas-taxi.com/",
                feedText = "description=" + viewModel.appSlogan,
                accessToken = "access_token=" + this.oauthToken,
                feedTitle = "name=" + viewModel.appName;

            var params = [ appIdStr, message, link, picture, feedTitle, caption, feedText, accessToken, "redirect_uri=" + this.appRedirectUrl ];

            var feedDialogUrl = 'https://graph.facebook.com/me/feed?' + params.join("&");

            var req = new XMLHttpRequest();
            req.open("POST", feedDialogUrl, true);

            req.send(null);
            req.onload = function(data) {
                // Post data
                //var response = this.responseText;
                //var postId = response.id;

                alert( "Публикация была добавлена на стену в " + that.socialNetwork );
            };
        } else if(this.socialNetwork == "Vkontakte") {
            var group = "from_group=0",
                ownerId = "owner_id=" + this.userId,
                message = "message=" + viewModel.postText(),
                link = "attachments=http://www.atlas-taxi.com/",
                accessToken = "access_token=" + this.oauthToken;

            var params = [ group, ownerId, link, message, accessToken ];
            feedDialogUrl = "https://api.vk.com/method/wall.post?" + params.join("&");

            $.ajax({
                url: feedDialogUrl,
                method: "GET",
                success: function(data) {
                    // Post data
                    // data.response.post_id

                    alert( "Публикация была добавлена на стену в " + that.socialNetwork );
                }
            });

        } else if(this.socialNetwork == "Foursquare") {
            var checkinUrl = this.publishNoteUrl;

            var dataString = "venueId=4e144a2cc65bedaeefbb824a&oauth_token=" + this.oauthToken; // &shout=Here is amazing place

            $.ajax({
                url: checkinUrl,
                method: "POST",
                data: dataString,
                success: function(data) {
                    alert( "Response received" );
                    alert( typeof data );
                    for(var i in data) {
                        console.log( i + ": " + data[i] );
                    }

                },
                error: function(data) {
                    alert("Something went wrong: " + data);

                    for(var i in data) {
                        alert( i + ": " + data[i] );
                    }
                }
            });
        }
    };
}

SocialApi.prototype = {
};
