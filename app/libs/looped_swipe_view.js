//(function() {
    var swipey = {
        slideContainer: null, //<ul> element object that holds the image slides
        wrapper: null, //meant for masking/clipping
        slides: null, //array of all slides i.e <li> elements
        distanceX: 0, //distance moved in X direction i.e left or right
        startX: 0, //registers the initial touch co-ordinate
        preferredWidth: 0, //dynamic variable to set width
        preferredHeight: 0, //dynamic variable to set height
        direction: "", //direction of movement
        timer: null, //timer that set starts when touch starts
        timerCounter: 0, //counter variable for timer
        hasSwipeStarted: false, //boolen to chk whether touch has started
        maxDistance: 0, //maximum distance in X direction that slide container can move
        currentDistance: 0, //current distance moved by slide container through translate
        isSwipe: true,
        swipedViewStepIndex: null,

        //detect touch and then automatically assign events
        isTouchSupported: 'ontouchstart' in window.document,

        initSwipey: function(swipedViewId, swipedViewStepIndex) { //

            console.log( swipedViewId );
            //scroll the window up to hide the address bar of the browser.
            if(swipey.isTouchSupported)
            {
                window.setTimeout(function() { window.scrollTo(0, 1); }, 100);
            }

            swipey.swipedViewStepIndex = swipedViewStepIndex;
            /*mapping touch events to mouse events. Automatic registration of event
             based on the device. If touch enabled then touch event is registered.
             and if desktop browser then mouse event is registered.*/
            swipey.startEvent = swipey.isTouchSupported ? 'touchstart' : 'mousedown',
                swipey.moveEvent = swipey.isTouchSupported ? 'touchmove' : 'mousemove',
                swipey.endEvent = swipey.isTouchSupported ? 'touchend' : 'mouseup',

                //get all the instances of the HTML elements
                //console.log( "SwipeViewId: " + swipesViewId );
            swipey.slideContainer = document.getElementById(swipedViewId);
            //console.log( slideContainer );
            swipey.slides = swipey.slideContainer.getElementsByTagName("li");
            swipey.wrapper = swipey.slideContainer.parentNode;
            console.log(  swipey.wrapper );

            //for iPhone, the width and height
            swipey.preferredWidth = 320;
            swipey.preferredHeight = 416; //510 for android
            //setting the width and height to our wrapper with overflow = hidden
            swipey.wrapper.style.width = swipey.preferredWidth + "px";
            swipey.wrapper.style.height = swipey.preferredHeight + "px";
            //setting the width to our <ul> element which holds all the <li> elements
            swipey.slideContainer.style.width = swipey.slides.length * swipey.preferredWidth + "px";
            swipey.slideContainer.style.height = swipey.preferredHeight + "px";
            //display the <ul> container now
            swipey.slideContainer.style.display = "block";
            //setting width and height for <li> elements - the slides
            for(var i=0;i<swipey.slides.length;i++)
            {
                swipey.slides[i].style.width = swipey.preferredWidth + "px";
                swipey.slides[i].style.height = swipey.preferredHeight + "px";
            }
            //calculating the max distance of travel for Slide Container i.e <ul> element
            swipey.maxDistance = swipey.slides.length * swipey.preferredWidth;
            //initial configuration- very imp - the last image is inserted in the first position
            /*console.log( swipey.slideContainer );
            //swipey.slideContainer.insertBefore(swipey.slides[swipey.slides.length - 1],swipey.slides[0]);
            swipey.slideContainer.style.webkitTransitionDuration = "0";
            swipey.slideContainer.style.webkitTransform = "translateX(-" + swipey.preferredWidth + "px)";
            swipey.currentDistance = -swipey.preferredWidth;*/
            //initialize and assign the touch events
            swipey.initEvents();
        },
        initEvents: function() {
            //registering touch events to the wrapper
            swipey.wrapper.addEventListener(swipey.startEvent, swipey.startHandler, false);
            swipey.wrapper.addEventListener(swipey.moveEvent, swipey.moveHandler, false);
            swipey.wrapper.addEventListener(swipey.endEvent, swipey.endHandler, false);

            if(!swipey.isTouchSupported) //for computer browsers
            {
                swipey.wrapper.addEventListener('mouseout', swipey.mouseOutHandler, false);
            }

            swipey.slideContainer.addEventListener("webkitTransitionEnd",swipey.handleTransitionEnd,false);
            swipey.wrapper.addEventListener('mouseout', swipey.mouseOutHandler, false); //to track mouse out of the gallery boundary
        },
        //funciton called when touch start event is fired i.e finger is pressed on the screen
        startHandler: function(event) {
            //create appropriate event object to read the touch/mouse co-ordinates
            var eventObj = swipey.isTouchSupported ? event.touches[0] : event;
            //stores the starting X co-ordinate when finger touches the device screen
            swipey.startX = eventObj.pageX;
            swipey.hasSwipeStarted = true;
            event.preventDefault(); //prevents the window from scrolling.
        },
        //funciton called when touch move event is fired i.e finger is dragged over the screen
        moveHandler: function(event) {
            if (swipey.hasSwipeStarted) {
                //create appropriate event object to read the touch/mouse co-ordinates
                var eventObj = swipey.isTouchSupported ? event.touches[0] : event;
                swipey.distanceX = eventObj.pageX - swipey.startX;
                //move the slide container along with the movement of the finger
                swipey.slideContainer.style.webkitTransform = "translateX(" + (swipey.distanceX + swipey.currentDistance) + "px)";
            }
        },
        //funciton called when touch end event is fired i.e finger is released from screen
        endHandler: function(event) {
            if(swipey.hasSwipeStarted)
            {
                swipey.isSwipe = true;
                if(swipey.distanceX == 0) //if the intention is to tap on the image then open a link
                {
                    var link_url = event.target.getAttribute("link"); //read the link from <img /> element
                    //window.open(link_url,"_blank");
                }
                else
                {
                    if((swipey.distanceX > 0 && swipey.currentDistance == 0) || (swipey.distanceX < 0 && swipey.currentDistance == -(swipey.maxDistance - swipey.preferredWidth)))
                    {

                    }
                    else
                    {
                        if(swipey.distanceX > 0)
                        {
                            swipey.moveRight();
                        }
                        else if(swipey.distanceX < 0)
                        {
                            swipey.moveLeft();
                        }
                        else{}
                    }
                }
                swipey.hasSwipeStarted = false; //reset the boolean var
                swipey.distanceX = 0; //reset the distance moved for next iteration
            }
        },
        mouseOutHandler:function(){  //fire a custom endEvent whenever mouse goes out of the swiping region
            if(swipey.hasSwipeStarted)
            {
                //dispatch an end event
                if(document.createEvent)
                {
                    var evt = document.createEvent('Event');
                    evt.initEvent(swipey.endEvent, false, false);
                    swipey.wrapper.dispatchEvent(evt);
                }
            }
        },
        handleTransitionEnd:function(){
            console.log( swipey.isSwipe );

            if(swipey.isSwipe) {
                if(swipey.currentDistance == -(swipey.maxDistance - swipey.preferredWidth))
                {
                    console.log("END OF LIST");
                    swipey.slideContainer.appendChild(swipey.slides[0]);
                    swipey.slideContainer.style.webkitTransitionDuration = "0";
                    swipey.slideContainer.style.webkitTransform = "translateX(-" + (swipey.maxDistance - 2*swipey.preferredWidth) + "px)";
                    swipey.currentDistance = -(swipey.maxDistance - 2*swipey.preferredWidth);
                    //swipey.swipedViewStepIndex( swipey.slides.length - 1 );
                }
                if(swipey.currentDistance == 0)
                {
                    //Begin of list
                    console.log("BEGINNNING OF LIST");
                    swipey.slideContainer.insertBefore(swipey.slides[swipey.slides.length - 1],swipey.slides[0]);
                    swipey.slideContainer.style.webkitTransitionDuration = "0";
                    swipey.slideContainer.style.webkitTransform = "translateX(-" + swipey.preferredWidth + "px)";
                    swipey.currentDistance = -swipey.preferredWidth;

                    //swipey.swipedViewStepIndex( 0 );
                }
            }
        },
        moveLeft: function() {
            console.log('left');
            swipey.currentDistance += -swipey.preferredWidth;
            console.log( "current distance: " + this.currentDistance );


            swipey.slideContainer.style.webkitTransitionDuration = 150 + "ms";
            swipey.slideContainer.style.webkitTransform = "translateX(" + swipey.currentDistance + "px)";
            if(swipey.swipedViewStepIndex() == swipey.slides.length - 1) {
                swipey.swipedViewStepIndex( 0 );
            } else swipey.swipedViewStepIndex(swipey.swipedViewStepIndex() + 1);
        },
        moveRight: function() {
            console.log('right');
            swipey.currentDistance += swipey.preferredWidth;
            console.log( "current distance: " + this.currentDistance );

            swipey.slideContainer.style.webkitTransitionDuration = 150 + "ms";
            swipey.slideContainer.style.webkitTransform = "translateX(" + swipey.currentDistance + "px)";
            if(swipey.swipedViewStepIndex() == 0) {
                swipey.swipedViewStepIndex( swipey.slides.length - 1 );
            } else swipey.swipedViewStepIndex(swipey.swipedViewStepIndex() - 1);
        }
    }; //end of swipey object
    window.swipeyObj = swipey; //expose to global window object
//})();

//window.onload = function() { swipeyObj.initSwipey(); }  //invoke the init method to get started