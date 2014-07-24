///<reference path="controls.js" />
///<reference path="global.js" />
///<reference path="effects.js" />
/// <reference path="addomloadevent.js" />


var $drag = {
    _current: [],
    _dispatcher: [],
    init: function () {

        //$drag.oldbodymousemove = document.body.onmousemove;
        $(document.body).on("mousemove", function (event) {
            if ($drag._current.length > 0) {
                var delta = { x: 0, y: 0 };
                
                delta.x = event.pageX - $drag.startMousePos.x;
                delta.y = event.pageY - $drag.startMousePos.y;
                for (var i = 0; i < $drag._current.length; i++) {
                    $drag._current[i].move(event, delta);
                }
            }
        });

        //$drag.oldbodymouseup = document.body.onmouseup;
        $(document.body).on("mouseup", function (e) {
            if ($drag._current.length > 0) {
                var delta = { x: 0, y: 0 };
                delta.x = e.pageX - $drag.startMousePos.x;
                delta.y = e.pageY - $drag.startMousePos.y;

                for (var i = 0; i < $drag._current.length; i++) {
                    $drag._current[i].stop(e, delta);
                    $drag._current[i].startPos = { x: 0, y: 0 };
                }
                $drag.startMousePos = { x: 0, y: 0 };
                $drag._current = [];

            }
        });

        //$drag.oldbodymousedown = document.body.onmousedown;
        $(document.body).on("mousedown", function (e) {
            if (e.which == 1) {
                var t = e.target
                if (t) {
                    var _d = $drag.get(t);
                    if (_d) {
                        if (!$drag._current.contains(_d)) {
                            $drag._current.push(_d);
                            _d.startPos = { x: $(_d.obj).offset().left, y: $(_d.obj).offset().top };
                            $drag.startMousePos = { x: e.pageX, y: e.pageY };
                        }
                        _d.start(e);
                    }
                }
            }
        });

    },
    remove: function (obj) {
        for (var i = 0; i < $drag._dispatcher.length; i++) {
            if ($drag._dispatcher[i].obj == obj) {
                $drag._dispatcher = $drag._dispatcher.without($drag._dispatcher[i]);
                return;
            }
        }
    },
    get: function (obj) {
        for (var i = 0; i < $drag._dispatcher.length; i++) {
            var d = $drag._dispatcher[i];
            if (d.obj == obj || $(d.obj).has(obj).length > 0) {
                return $drag._dispatcher[i];
            }
        }
        return null;
    },
    add: function (d) {
        if (d && d.obj) {
            if (!$drag.get(d.obj)) {
                $drag._dispatcher.push(d);
            }
        }
    },
    /*
        Ниже приведен стандартный метод получения экземпляра объекта, 
        реализующего обработку событий перетаскивния.
        Результирующий объект должен иметь следущую структуру:
        { 
            obj: HTMLDomElement
            start: function(e){}, 
            stop: function(e, delta){}, 
            move: function(e, delta){} 
        }
        Где, delta - изменения координать курсора с последнего старта:
        delta = {
            x: Number,
            y: Number
        }
    */
    standart: function (obj) {
        var res = {
            obj: obj
        };
        res.start = function (e) {
            $(document.body).disableSelection();
            this.obj.style.left = this.startPos.x + "px";
            this.obj.style.top = this.startPos.y + "px";
        } .bind(res);
        res.stop = function (e, delta) {
            $(document.body).enableSelection();
        } .bind(res);
        res.move = function (e, delta) {
            this.obj.style.left = (this.startPos.x + delta.x) + "px";
            this.obj.style.top = (this.startPos.y + delta.y) + "px";
        } .bind(res);
        return res;
    }
}

$(document).ready($drag.init);