/* My custom swipe view */

var swipeViews = {};
function SwipeView(swipeViewId, swipedViewStepIndex) {
    var that = this;
    this.swipeViewId = swipeViewId;
    this.slideContainer = null, //<ul> element object that holds the image this.slides
    this.wrapper = null, //meant for masking/clipping
    this.slides = null, //array of all this.slides i.e <li> elements
    this.distanceX = 0, //distance moved in X this.direction i.e left or right
    this.startX = 0, //registers the initial touch co-ordinate
    this.preferredWidth = 0, //dynamic variable to set width
    this.preferredHeight = 0, //dynamic variable to set height
    this.direction = "", //direction of movement
    this.hasSwipeStarted = false, //boolen to chk whether touch has started
    this.maxDistance = 0, //maximum distance in X direction that slide container can move
    this.currentDistance = 0, //current distance moved by slide container through translate
    this.isSwipe = true,
    this.swipedViewStepIndex = swipedViewStepIndex;
    this.isTouchSupported = 'ontouchstart' in window.document;

    this.init = function() {
        console.log( "SWiped view init" );

        if(this.isTouchSupported)
        {
            window.setTimeout(function() { window.scrollTo(0, 1); }, 100);
        }

        var swipedViewItems = $("#driverSlideContainer").find("li");
        console.log( "Views count: " + swipedViewItems.length );

        this.startEvent = this.isTouchSupported ? 'touchstart' : 'mousedown';
        this.moveEvent = this.isTouchSupported ? 'touchmove' : 'mousemove';
        this.endEvent = this.isTouchSupported ? 'touchend' : 'mouseup';

        this.slideContainer = document.getElementById( this.swipeViewId );

        this.slides = this.slideContainer.getElementsByTagName("li");
        console.log( "Slides count: " + this.slides.length );

        this.wrapper = this.slideContainer.parentNode;

        this.preferredWidth = $(window).width() - 20; // 320;
        this.preferredHeight = 416;

        console.log( "Preferred width: " + this.preferredWidth );

        this.wrapper.style.width = this.preferredWidth + "px";
        //this.wrapper.style.height = this.preferredHeight + "px";

        this.slideContainer.style.width = this.slides.length * this.preferredWidth + "px";
        //this.slideContainer.style.height = this.preferredHeight + "px";
        this.slideContainer.style.display = "block";

        this.currentDistance = -this.preferredWidth * this.swipedViewStepIndex();

        this.slideContainer.style.webkitTransitionDuration = "1ms";
        this.slideContainer.style.transitionDuration = "1ms";
        this.slideContainer.style.mozTransitionDuration = "1ms";
        this.slideContainer.style.webkitTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.mozTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.transform = "translateX(" + this.currentDistance + "px)";

        for(var i = 0; i < this.slides.length; i++) {
            this.slides[i].style.width = this.preferredWidth + "px";
            //this.slides[i].style.height = this.preferredHeight + "px";
        }

        this.maxDistance = this.slides.length * this.preferredWidth;
        this.initEvents();
    };

    this.initEvents = function() {
        this.wrapper.addEventListener(this.startEvent, this.startHandler, false);
        this.wrapper.addEventListener(this.moveEvent, this.moveHandler, false);
        this.wrapper.addEventListener(this.endEvent, this.endHandler, false);

        if(!this.isTouchSupported) //for computer browsers
        {
            this.wrapper.addEventListener('mouseout', this.mouseOutHandler, false);
        }

        // For Chrome and Safari
        this.slideContainer.addEventListener("webkitTransitionEnd", this.handleTransitionEnd,false);

        // For Mozilla and IE
        this.slideContainer.addEventListener("transitionend", this.handleTransitionEnd,false);

        // For Opera
        //this.slideContainer.addEventListener("otransitionend", this.handleTransitionEnd,false);
        //this.slideContainer.addEventListener("oTransitionEnd", this.handleTransitionEnd,false);
        this.wrapper.addEventListener('mouseout', this.mouseOutHandler, false);
    };

    /* My custom swipe view handlers */
    this.startHandler = function(event) {
        //create appropriate event object to read the touch/mouse co-ordinates
        var eventObj = that.isTouchSupported ? event.touches[0] : event;
        //stores the starting X co-ordinate when finger touches the device screen
        that.startX = eventObj.pageX;
        that.hasSwipeStarted = true;
        event.preventDefault(); //prevents the window from scrolling.
    };
    this.moveHandler = function(event) {
        if (that.hasSwipeStarted) {

            //create appropriate event object to read the touch/mouse co-ordinates
            var eventObj = that.isTouchSupported ? event.touches[0] : event;
            that.distanceX = eventObj.pageX - that.startX;
            //move the slide container along with the movement of the finger
            that.slideContainer.style.webkitTransform = "translateX(" + (that.distanceX + that.currentDistance) + "px)";
            that.slideContainer.style.mozTransform = "translateX(" + (that.distanceX + that.currentDistance) + "px)";
            that.slideContainer.style.transform = "translateX(" + (that.distanceX + that.currentDistance) + "px)";
        }
    };

    this.endHandler = function(event) {
        if(that.hasSwipeStarted)
        {
            console.log("endHandler fired");
            console.log( "Slides count: " + that.slides.length );
            console.log( "Max distance: " + that.maxDistance );

            that.isSwipe = true;
            if(that.distanceX == 0) //if the intention is to tap on the image then open a link
            {
                var link_url = event.target.getAttribute("link"); //read the link from <img /> element
            }
            else
            {
                if((that.distanceX > 0 && that.currentDistance == 0) || (that.distanceX < 0 && that.currentDistance == -(that.maxDistance - that.preferredWidth)))
                {

                }
                else
                {
                    if(that.distanceX > 0)
                    {
                        that.moveRight();
                    }
                    else if(that.distanceX < 0)
                    {
                        that.moveLeft();
                    }
                    else{}
                }
            }
            that.hasSwipeStarted = false; //reset the boolean var
            that.distanceX = 0; //reset the distance moved for next iteration
        }
    };

    this.mouseOutHandler= function (){  //fire a custom endEvent whenever mouse goes out of the swiping region
        if(that.hasSwipeStarted)
        {
            //dispatch an end event
            if(document.createEvent)
            {
                var evt = document.createEvent('Event');
                evt.initEvent(that.endEvent, false, false);
                that.wrapper.dispatchEvent(evt);
            }
        }
    };

    this.handleTransitionEnd = function (){
        if(that.isSwipe) {

            // In case of last slide
            if(that.currentDistance == -(that.maxDistance - that.preferredWidth))
            {
                console.log("END OF LIST");
                that.slideContainer.appendChild(that.slides[0]);

                that.slideContainer.style.webkitTransitionDuration = "0";
                that.slideContainer.style.transitionDuration = "0";
                that.slideContainer.style.oTransitionDuration = "0";
                that.slideContainer.style.mozTransitionDuration = "0";

                that.slideContainer.style.webkitTransform = "translateX(-" + (that.maxDistance - 2*that.preferredWidth) + "px)";
                that.slideContainer.style.transform = "translateX(-" + (that.maxDistance - 2*that.preferredWidth) + "px)";
                that.slideContainer.style.mozTransform = "translateX(-" + (that.maxDistance - 2*that.preferredWidth) + "px)";
                that.currentDistance = -(that.maxDistance - 2*that.preferredWidth);
                //swipey.this.swipedViewStepIndex( swipey.this.slides.length - 1 );
            }


            // In case of first slide
            if(that.currentDistance == 0)
            {
                //Begin of list
                console.log("BEGINNNING OF LIST");
                that.slideContainer.insertBefore(that.slides[that.slides.length - 1],that.slides[0]);

                that.slideContainer.style.webkitTransitionDuration = "0";
                that.slideContainer.style.transitionDuration = "0";
                that.slideContainer.style.oTransitionDuration = "0";
                that.slideContainer.style.mozTransitionDuration = "0";

                that.slideContainer.style.webkitTransform = "translateX(-" + that.preferredWidth + "px)";
                that.slideContainer.style.mozTransform = "translateX(-" + that.preferredWidth + "px)";
                that.slideContainer.style.transform = "translateX(-" + that.preferredWidth + "px)";
                that.currentDistance = -that.preferredWidth;

                //swipey.this.swipedViewStepIndex( 0 );
            }
        }
    };

    this.moveLeft = function () {
        console.log('left');
        this.currentDistance += -this.preferredWidth;

        console.log( "Current distance: " + this.currentDistance );

        this.slideContainer.style.webkitTransitionDuration = 150 + "ms";
        that.slideContainer.style.transitionDuration = 150 + "ms";
        that.slideContainer.style.mozTransitionDuration = 150 + "ms";
        that.slideContainer.style.oTransitionDuration = 150 + "ms";

        this.slideContainer.style.webkitTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.mozTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.transform = "translateX(" + this.currentDistance + "px)";

        if(this.swipedViewStepIndex() == this.slides.length - 1) {
            this.swipedViewStepIndex( 0 );
        } else {
            this.swipedViewStepIndex(this.swipedViewStepIndex() + 1);
        }
    };

    this.moveRight = function () {
        console.log('right');
        this.currentDistance += this.preferredWidth;

        this.slideContainer.style.webkitTransitionDuration = 150 + "ms";
        that.slideContainer.style.transitionDuration = 150 + "ms";
        that.slideContainer.style.mozTransitionDuration = 150 + "ms";
        that.slideContainer.style.oTransitionDuration = 150 + "ms";

        this.slideContainer.style.webkitTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.mozTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.transform = "translateX(" + this.currentDistance + "px)";

        if(this.swipedViewStepIndex() == 0) {
            this.swipedViewStepIndex( this.slides.length - 1 );
        } else this.swipedViewStepIndex(this.swipedViewStepIndex() - 1);
    };

    this.moveToIndex = function(index) {
        console.log( "Move to index: " + index );
        //alert( index );
        this.swipedViewStepIndex( index );

        this.currentDistance = -this.preferredWidth * ( this.swipedViewStepIndex() + 1);

        console.log( "Distance: " + this.currentDistance );

        this.slideContainer.style.webkitTransitionDuration = "150ms";
        this.slideContainer.style.webkitTransform = "translateX(" + this.currentDistance + "px)";
        this.slideContainer.style.transform = "translateX(" + this.currentDistance + "px)";
    };

    this.swipedViewStepIndex.subscribe(function(newValue) {
        //alert( "Swiped view index: " + newValue );
    });

}


// Для 2 панелей не работает !!!
ko.bindingHandlers.swipedView = {
    init: function(element, valueAccessor) {
        console.log( "Swiped view init" );

        setTimeout(function() {
            var swipedViewId = $(element).attr("id");

            var swipedViewStepIndex = valueAccessor();

            swipeViews[swipedViewId] = swipeViews[swipedViewId] || new SwipeView( swipedViewId, swipedViewStepIndex );
            swipeViews[swipedViewId].init();

            window.onresize = function() {
                //swipeViews[swipedViewId] = new SwipeView( swipedViewId, swipedViewStepIndex );
                swipeViews[swipedViewId].init();
            };

            window.onorientationchange = function() {
                //swipeViews[swipedViewId] = new SwipeView( swipedViewId, swipedViewStepIndex );
                swipeViews[swipedViewId].init();
            }

        }, 100);
    },
    update: function(element, valueAccessor) {
        console.log( "Swiped view update" );

        setTimeout(function() {
            var swipedViewId = $(element).attr("id");

            var swipedViewStepIndex = valueAccessor();

            swipeViews[swipedViewId] = swipeViews[swipedViewId] || new SwipeView( swipedViewId, swipedViewStepIndex );
            swipeViews[swipedViewId].init();

            /*window.onresize = function() {
                swipeViews[swipedViewId] = new SwipeView( swipedViewId, swipedViewStepIndex );
                swipeViews[swipedViewId].init();
            };

            window.onorientationchange = function() {
                swipeViews[swipedViewId] = new SwipeView( swipedViewId, swipedViewStepIndex );
                swipeViews[swipedViewId].init();
            }*/
        }, 100);
    }
};