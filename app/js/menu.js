/*
 *
 * Circular menu for mobile clients */
// http://addyosmani.com/blog/jquery-roundrr/
/*
 * 1. Строим меню певроначально и сохраняем позиции жлментов в Массив places - сохраняется в localStorage
 * 2, Сохраняем первоначальные координаты точек в массив curStates
 * 3. Сохраняем в plots данные о элементе
 * 4. При перетасивании элемента получаем элемент из curStates
 * 5. Находим позицию попадения в places
 * 6. Находим соответствующий элемент в curStates
 * 7.
 *
 *
 * ... Выбираем ближайший путь между смещаемыми точками и по нему сдвигаем элементы
 * */

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

var itemsPositions = [];

var CircleMenu = {
    /* Collections */
    plots: [],
    places: [],
    curStates: [],

    /* Constants */
    elemWidth: 80,
    elemHeight: 70,
    plotsCount: 0,
    centerX: 0,
    centerY: 0,

    /* Dependent constants */
    matchRadius: null,
    sectorAngle: 0,
    shiftDirection: "",

    /* Drag params */
    item: null,
    draggedItem: null,
    replaceablePlace: {},// To which we drag plot
    draggedItemCenterX: 0,
    draggedItemCenterX: 0,
    draggedItemAngle: 0,
    downX: 0,
    downY: 0,
    shiftX: 0,
    shiftY: 0,

    /* Action flags */
    isMoveComplete: true,
    isDragging: false,

    eventFlag: 0, // 0 - click, 1 - mousemove

    build: function(stage, links) {
        this.plotsCount = links.length;
        var increase = Math.PI * 2 / this.plotsCount,
            angle = 0,
            x = 0,
            y = 0;

        // For 4 items matchRad = containerHalfWidth / 2;
        var containerHalfWidth = parseInt( $(stage).css('height') ) / 2,
            containerHalfHeight = parseInt( $(stage).css('width') ) / 2;

        var centerWidth = parseInt( $(stage).find("#center").css("width") );

        var centerHeight = parseInt( $(stage).find("#center").css("height") );

        var centerLeft = containerHalfWidth - ( centerWidth / 2 ),
            centerTop = containerHalfHeight - ( centerHeight / 2 );

        this.centerX = containerHalfWidth;
        this.centerY = containerHalfHeight;

        $(stage).find(".plot").remove();
        $(stage).find("#center").css({ left: centerLeft + "px", top: centerTop + "px" });

        this.matchRadius = ( ( 4 / this.plotsCount ) * containerHalfWidth ) / 2;

        this.sectorAngle = 360 / this.plotsCount;

        var radius = containerHalfWidth * 0.75;

        this.plots.clear();
        this.curStates.clear();

        if( localStorage.getItem("currentItemStates") == undefined || localStorage.getItem("itemsPlaces") == "" ) {
            this.places.clear();

            itemsPositions.clear();

            for( var i = 0; i < this.plotsCount; i++ ) {
                var link = links[i];

                var p = new Plot( stage, i );
                p.setDimensions( this.elemWidth, this.elemHeight );
                x = radius * Math.cos( angle ) + containerHalfWidth;
                y = radius * Math.sin( angle ) + containerHalfHeight;
                p.position( x,y );
                p.content( '<a href="' + link.linkHref + '" class="menu-link"><img src="img/' + link.imgSrc + '"><span>' + link.text + '</span></a>' );
                angle += increase;

                this.curStates.push({ elem: p.elm, plotId: i, placeId: i }); // coordinates
                itemsPositions.push({ itemId: i, placeId: i });
                this.plots.push({ id: i, data: "" });

                var minAngle = this.sectorAngle * i - this.sectorAngle / 2;
                maxAngle = this.sectorAngle * i + this.sectorAngle / 2;

                this.places.push({ id: i, x: p.elm.style.left, y: p.elm.style.top, minAngle: minAngle, maxAngle: maxAngle });
            }

            localStorage.setItem("itemsPlaces", JSON.stringify(this.places));

        } else {
            var savedCurrentStates = localStorage.getItem("currentItemStates");

            itemsPositions.clear();
            itemsPositions = JSON.parse( savedCurrentStates );

            //console.log( "Items positions length: " + itemsPositions.length );

            var savedPlaces = JSON.parse( localStorage.getItem("itemsPlaces") );
            //console.log( "Places count: " + savedPlaces.length );

            this.places = savedPlaces;

            for( var i = 0; i < this.plotsCount; i++ ) {
                var place = this.places[i];
                //console.log( "Place: " + place.id );

                var itemId = null;

                for( var j = 0; j < itemsPositions.length; j++ ) {
                    var position = itemsPositions[j];
                    //console.log( "Position place id: " + position.placeId );

                    if( position.placeId.toString().indexOf( place.id.toString() ) == 0 ) {
                        itemId = position.itemId;
                    }
                }

                if( itemId != null ) {
                    var link = links[itemId];
                    var itemContent = '<a href="' + link.linkHref + '" class="menu-link"><img src="img/' + link.imgSrc + '"><span>' + link.text + '</span></a>'; // '<a href="#" class="menu-link"><img src="img/' + icons[itemId] + '"></a>';

                    var p = new Plot( stage, itemId );
                    p.setDimensions( this.elemWidth, this.elemHeight );

                    x = radius * Math.cos( angle ) + containerHalfWidth;
                    y = radius * Math.sin( angle ) + containerHalfHeight;
                    p.position( x,y );
                    angle += increase;

                    place.x = p.elm.style.left;
                    place.y = p.elm.style.top;

                    /*this.curStates.push({ elem: p.elm, plotId: itemId, placeId: i }); // coordinates
                     this.plots.push({ id: i, data: "" });*/

                    p.content( itemContent );

                    this.curStates.push({ elem: p.elm, plotId: itemId, placeId: i }); // coordinates
                    this.plots.push({ id: itemId, data: itemContent });

                }
            }


        }
    },
    clearDragData: function() {
        this.item = null;
        this.draggedItem = null;
        this.isDragging = false;
        this.isMoveComplete = true;
    },
    move_item: function(elem) {
        CircleMenu.item = elem;

        console.log( CircleMenu.item );

        CircleMenu.isMoveComplete = false;

        navigator.notification.vibrate(100);
    },
    move: function(e) {
        var eventObj = isTouchSupported() ? e.touches[0] : e;
        mouse_x = eventObj.pageX;
        mouse_y = eventObj.pageY;

        if(this.item != null && this.isMoveComplete == false) {

            if( !this.isDragging ) {
                this.shiftX = this.downX - parseInt( this.item.style.left );
                this.shiftY = this.downY - parseInt( this.item.style.top );
                this.isDragging = true;
            }

            var itemLeft = mouse_x - this.shiftX,
                itemTop = mouse_y - this.shiftY;

            this.item.style.left = itemLeft + 'px';
            this.item.style.top = itemTop + 'px';
            this.eventFlag = 1;
            //console.log( "X: " + item.style.left );
        }

        e.stopPropagation();
        e.preventDefault();
    },
    stop: function(e) {
        //console.log( "Mouse up event occured" );

        if( this.eventFlag == 1 ) {
            if(this.item != null && this.isMoveComplete == false) {
                var eventObj = isTouchSupported() ? e.changedTouches[0] : e;

                mouse_x = eventObj.pageX;
                mouse_y = eventObj.pageY;

                this.draggedItemCenterX = mouse_x - this.shiftX + parseInt( this.item.style.width ) / 2;
                this.draggedItemCenterY = mouse_y - this.shiftY + parseInt( this.item.style.height ) / 2; //- 45;

                console.log( "DRagged item center: x " + this.draggedItemCenterX + ", y " + this.draggedItemCenterY );

                console.log( "Center x " + this.centerX + ", y " + this.centerY );

                this.draggedItemAngle = 180 + Math.atan2( ( this.centerY - this.draggedItemCenterY ), ( this.centerX - this.draggedItemCenterX ) ) * (180 / Math.PI);
                /* 180 +  */
                //alert( "Angle: " + this.draggedItemAngle );

                this.getReplaceablePlace();

                if( this.replaceablePlace.id != undefined ) {
                    this.changeItemsPositions();

                    this.saveCurrentItemsStates();

                } else {
                    //console.log( "Place was not selected" );
                    this.setOriginItemPosition();
                }

                //$(CircleMenu.item).find("img").removeClass("moved-item");

                this.item = null;
                this.isMoveComplete = true;

                e.stopPropagation();
                e.preventDefault();
            }
        }
    },
    getReplaceablePlace: function() {
        console.log( "getReplaceablePlace" );

        var draggedItemPlace = null, // From which we drag plot
            replaceablePlot = null;

        this.replaceablePlace = {};
        for( var i = 0; i < this.plotsCount; i++ ) {

            if( i != this.draggedItem.placeId ) {

                var place = this.places[i];
                //console.log( "Place: " + place.id );

                var itemAngle = this.draggedItemAngle;
                //console.log( "itemAngle: " + itemAngle );
                //console.log( "Place : " + place.minAngle + " - " + place.maxAngle );


                if( place.minAngle < 0 ) {
                    itemAngle = itemAngle > ( 360 + place.minAngle ) ? -( 360 - itemAngle ) : itemAngle;
                }

                //console.log( "Item angle: " + itemAngle );

                if( itemAngle >= place.minAngle && itemAngle < place.maxAngle ) {
                    this.replaceablePlace = place;
                }

            }
        }

        console.log( this.replaceablePlace );

        //alert( this.replaceablePlace.id );
    },
    changeItemsPositions: function() {
        this.item.style.left = this.replaceablePlace.x;
        this.item.style.top = this.replaceablePlace.y;
        //$(this.item).animate({ left: this.replaceablePlace.x, top: this.replaceablePlace.y }, 10000);

        for( var i = 0; i < this.plotsCount; i++ ) {
            var plot = this.curStates[i];
            if( plot.placeId == this.replaceablePlace.id ) {
                replaceablePlot = plot;
            }

        }

        this.getShiftDirection();
        this.cyclicShift();
        this.draggedItem.placeId = this.replaceablePlace.id;

    },
    setOriginItemPosition: function() {
        var originalPlace = null;
        for( var i = 0; i < this.plotsCount; i++ ) {
            var place = this.places[i];
            if( this.draggedItem.placeId == place.id ) {
                originalPlace = place;

                console.log( "Original place: " + originalPlace.id );
            }
        }

        if( originalPlace != null ) {
            this.item.style.left = originalPlace.x;
            this.item.style.top = originalPlace.y;
        }
    },
    getShiftDirection: function() {
        var i = this.draggedItem.placeId,
            j = this.replaceablePlace.id,
            l = this.plotsCount;

        var path1, path2;
        if( j > i ) {
            console.log( "i=" + i + " > j=" + j );

            path1 = j - i;
            path2 = l - j + i;

            if(path1 <= path2 ) {
                this.shiftDirection = "anticlockwise"; // против час стрелки
            } else {
                this.shiftDirection = "clockwise"; // по час стрелке
            }
        } else {
            console.log( "i=" + i + "  j=" + j );
            path1 = i - j;
            path2 = l - i + j;

            if(path1 <= path2) {
                this.shiftDirection = "clockwise"; // по час стрелке
            } else {
                this.shiftDirection = "anticlockwise"; // против час стрелки
            }
        }

        console.log( "Shift direction: " + this.shiftDirection );
    },
    cyclicShift: function() {
        console.log( "cyclicShift" );
        var i = this.draggedItem.placeId,
            j = this.replaceablePlace.id,
            l = this.plotsCount;

        console.log( "From place " + j +" to " + i );

        if( this.shiftDirection == "clockwise" ) { //Clockwise

            if( j > i ) {

                var k = ( i == 0 ) ? l-1 : i-1;
                while( k != j-1 ) {
                    console.log( "k: " + k );

                    var place = this.places[k];

                    for( var m = 0; m < l; m++ ) {
                        var curState = this.curStates[m];
                        if( curState.placeId == place.id ) {
                            var prevPlace = (k == l-1) ? this.places[0] : this.places[k+1];
                            /*
                             curState.elem.style.left = prevPlace.x;
                             curState.elem.style.top = prevPlace.y;*/
                            $(curState.elem).animate({ left: prevPlace.x, top: prevPlace.y }, 1000);
                            curState.placeId = prevPlace.id;
                        }
                    }

                    if( k == 0 ) {
                        k = l-1;
                    } else {
                        k--;
                    }
                }

            } else if( j < i ) {
                for( var k = i-1; k >= j; k-- ) {
                    var place = this.places[k];
                    console.log( "k=" + k );

                    for( var m = 0; m < l; m++ ) {
                        var curState = this.curStates[m];
                        if( curState.placeId == place.id ) {
                            var prevPlace = this.places[k+1];
                            console.log( "Plot " + curState.plotId );
                            /*curState.elem.style.left = prevPlace.x;
                             curState.elem.style.top = prevPlace.y;*/

                            $(curState.elem).animate({ left: prevPlace.x, top: prevPlace.y }, 1000);

                            curState.placeId = prevPlace.id;
                        }
                    }
                }

            }

        } else { //Anticlockwise

            //TODO complete case
            if( j > i ) {

                for( var k = i+1; k <= j; k++ ) {
                    var place = this.places[k];

                    for( var m = 0; m < l; m++ ) {
                        var curState = this.curStates[m];
                        if( curState.placeId == place.id ) {
                            var prevPlace = this.places[k-1];
                            /*curState.elem.style.left = prevPlace.x;
                             curState.elem.style.top = prevPlace.y;*/

                            $(curState.elem).animate({ left: prevPlace.x, top: prevPlace.y }, 1000);

                            curState.placeId = prevPlace.id;
                        }
                    }
                }
            } else {

                var k = ( i == l-1 ) ? 0 : i+1;
                while( k != j+1 ) {
                    console.log( "k: " + k );

                    var place = this.places[k];

                    for( var m = 0; m < l; m++ ) {
                        var curState = this.curStates[m];
                        if( curState.placeId == place.id ) {
                            var prevPlace = ( k== 0 ) ? this.places[l-1] : this.places[k-1];
                            /*curState.elem.style.left = prevPlace.x;
                             curState.elem.style.top = prevPlace.y;*/

                            $(curState.elem).animate({ left: prevPlace.x, top: prevPlace.y }, 1000);

                            curState.placeId = prevPlace.id;
                        }
                    }

                    if( k == l-1 ) {
                        k = 0;
                    } else {
                        k++;
                    }
                }
            }
        }
    },
    saveCurrentItemsStates: function() {

        for( var i = 0; i < this.plotsCount; i++) {
            var currentState = this.curStates[i];

            for( var j = 0; j < itemsPositions.length; j++ ) {
                var itemPosition = itemsPositions[j];
                if( itemPosition.itemId == currentState.plotId ) {
                    itemPosition.placeId = currentState.placeId;
                }
            }

        }

        localStorage.setItem("currentItemStates", JSON.stringify(itemsPositions) ); //this.curStates, censor( itemsPositions ) ) );
        //localStorage.setItem("currentItemStates", JSON.stringify(currentStates));
    }
}

Plot = function ( stage, id ) {
    this.id = id;

    this.isMoving = false;

    this.setDimensions = function( x, y ) {
        this.elm.setAttribute("class", "plot");
        this.elm.style.width = x + 'px';
        this.elm.style.height = y + 'px';
        this.width = x;
        this.height = y;
    };
    this.position = function( x, y ) {
        var xoffset = arguments[2] ? 0 : this.width / 2;
        var yoffset = arguments[2] ? 0 : this.height / 2;
        this.elm.style.left = (x - xoffset) + 'px';
        this.elm.style.top = (y - yoffset) + 'px';
        this.left = (x - xoffset) + 'px';
        this.top = (y - yoffset) + 'px';

        this.prevLeft = (x - xoffset) + 'px';
        this.prevTop = (y - yoffset) + 'px';
        this.x = x;
        this.y = y;

    };

    this.setBackground = function( col ) {
        this.elm.style.background = col;
    };
    this.kill = function() {
        stage.removeChild( this.elm );
    };
    this.rotate = function( str ) {
        this.elm.style.webkitTransform = this.elm.style.MozTransform =
            this.elm.style.OTransform = this.elm.style.transform =
                'rotate(' + str + ')';
    };
    this.content = function( content ) {
        this.elm.innerHTML = content;
    };
    this.round = function( round ) {
        this.elm.style.borderRadius = round ? '50%/50%' : '';
    };
    this.elm = document.createElement( 'div' );
    this.elm.style.position = 'absolute';

    var self = this;

    (function( plot ) {
        plot.elm.addEventListener(isTouchSupported() ? "touchstart" : "mousedown", function(e) {
            var eventObj = isTouchSupported() ? e.touches[0] : e;

            //alert( "Is complete: " + CircleMenu.isMoveComplete );

            if( CircleMenu.isMoveComplete ) {
                for( var i = 0; i < CircleMenu.curStates.length; i++ ) {
                    if(CircleMenu.curStates[i].plotId == plot.id) {
                        CircleMenu.draggedItem = CircleMenu.curStates[i];
                    }
                }

                console.log( "Set dragged item id: " + CircleMenu.draggedItem.plotId );

                CircleMenu.downX = eventObj.pageX;
                CircleMenu.downY = eventObj.pageY;
                CircleMenu.move_item(plot.elm);
                CircleMenu.eventFlag = 0;
            }

            e.stopPropagation();
        });

    } (this, CircleMenu));

    stage.appendChild( this.elm );
};

function isTouchSupported() {
    return 'ontouchstart' in window.document;
}

function clearMenuData() {
    //alert( "Clear menu data was successful" );
    localStorage.setItem("itemsPlaces", "");
}


function initMenu() {
    CircleMenu.clearDragData();

    var menuContainer = document.getElementById("menu-container")

    menuContainer.addEventListener(isTouchSupported() ? "touchmove" : "mousemove", $.proxy(CircleMenu.move, CircleMenu));
    menuContainer.addEventListener(isTouchSupported() ? "touchend" : "mouseup", $.proxy(CircleMenu.stop, CircleMenu));
    viewModel.isDocumentDragEstablished = true;

    var stage = document.querySelector('.stage');

    var menuLinks = [{
        imgSrc: "icons/planets/earth.png", linkHref: "#home", text: "Заказ такси"
    },{
        imgSrc: "icons/planets/jupiter.png", linkHref: "#profile", text: "Мой аккаунт"
    },{
        imgSrc: "icons/planets/mars.png", linkHref: "#balance", text: "Пополнить счет"
    },{
        imgSrc: "icons/planets/mercury.png", linkHref: "#options", text: "Социальные сети"
    },{
        imgSrc: "icons/planets/neptun.png", linkHref: "#intro", text: "Наши выгоды"
    },{
        imgSrc: "icons/planets/uran.png", linkHref: "#settings", text: "Настройки"
    },{
        imgSrc: "icons/planets/venus.png", linkHref: "#about", text: "О программе"
    }];

    window.onresize = function() {
        var width = $(window).width(),
            height = $(window).height();

        var size = Math.min( width, height );
        $(stage).css({ width: size, height: size });

        //clearMenuData();

        CircleMenu.build(stage, menuLinks);
    };

    var width = $(window).width(),
        height = $(window).height();

    var size = Math.min( width, height );
    $(stage).css({ width: size, height: size });

    //clearMenuData();

    CircleMenu.build(stage, menuLinks);
}

$(function() {
    $("img").mousedown(function(e)
    {
        e.preventDefault();
    });
});