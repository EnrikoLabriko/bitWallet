/// <reference path="engine.js"/>
/// <reference path="drag.js"/>

function _scroll(obj, process) {
    /// <summary>
    /// Горизонтальный скролл
    /// </summary>
    this.obj = obj;
    this.scroll = null;
    this.totop = false;
    //this.init = function () {
    this.contentHeight = function () {
        
        var h = $(this.obj).contentHeight();

        h += $(this.obj).pxcss("padding-top");
        h += $(this.obj).pxcss("padding-bottom");
        return h;
    }.bind(this);
    this.scroll = $(this.obj)
        .prepend("<div></div>")
        .find(":first")
        .addClass("scroll-bar")
        .addClass("__sys")
        .get(0);
    this.drag = $(this.scroll)
        .append("<div></div>")
        .find(":last")
        .addClass("drag")
        .css("margin-top", "0px")
        .css("margin-left", "0px")
        .get(0);

    this.fix = function () {
        /// <summary>Выравнивает размеры панели и ползунка прокрутки (например, при масштабировании родительской панели)</summary>
        //РАЗМЕР
        var delta = this.scroll.offsetHeight - $(this.scroll).pxcss("height");
        $(this.scroll).css("height", (this.obj.offsetHeight - delta) + "px");
        var w = this.contentHeight();

        var k = this.obj.offsetHeight > w ? 1 : w / this.obj.offsetHeight;
        $(this.drag).css("height", Math.floor($(this.scroll).pxcss("height") / k) + "px");

        //Положение
        var mt = -($(this.obj).pxcss("padding-top") + $(this.obj).pxcss("border-top-width"));
        if ($(this.obj).css("position") == "absolute") {
            mt += $(this.obj).scrollTop();
        }
        $(this.scroll)
            .css("margin-left", (this.obj.offsetWidth - 14 - this.scroll.offsetWidth - $(this.obj).pxcss("padding-left")) + "px")
            .css("margin-top", (mt) + "px");
        //console.log(this, this.contentHeight());
        if (k == 1)
            $(this.scroll).css("visibility", "hidden");
        else {
            //Выравнивание драг-панели скрола, при переходе к видимому состоянию
            if ($(this.scroll).css("visibility") == "hidden")
                $(this.drag).css("margin-top", "0px");
            $(this.scroll).css("visibility", "visible");
        }
    }.bind(this);
    this.fix();
    this.fixPos = function (sc) {
        /// <summary>Выравнивание положения ползунка прокрутки</summary>
        var sc = sc == null ? $(this.obj).scrollTop() : sc; //Здесь сравнение с null, так как значение 0 является корректным и значимым
        var h = this.contentHeight();
        var k = this.obj.offsetHeight > h ? 1 : h / this.obj.offsetHeight;
        var max = this.scroll.offsetHeight - this.drag.offsetHeight;
        var d = Math.floor(sc / k);
        if (d > max)
            d = max;
        $(this.drag).css("margin-top", d + "px");
        this.fixBack();
    }.bind(this);
    this.fixBack = function () {
        var mt = -($(this.obj).pxcss("padding-top") + $(this.obj).pxcss("border-top-width"));
        if ($(this.obj).css("position") == "absolute") {
            mt += $(this.obj).scrollTop();
            $(this.scroll).css("margin-top", mt + "px");
        }
    }.bind(this);
    this.fixPos();
    this.process = process || function (delta, deltax, deltay) {
        /// <summary>Непосредственный процессинг скролирования блока (в частности, при прокрутке колесом)</summary>
        
        var sc = $(this.obj).scrollTop();
        var h = this.contentHeight();
        
        var dispSc = sc + (-deltay * 10);
        if (dispSc > h - this.obj.offsetHeight) {
            dispSc = h - this.obj.offsetHeight;
        }
        else if (dispSc < 0) {
            dispSc = 0;
        }
        //Перемещение
        this.fixPos(dispSc);
        $(this.obj).scrollTop(dispSc);
        this.fixBack();

        //Вызываем функцию, запускающую, в частности событие "scroll" у панели
        if (this.postProcess)
            this.postProcess();

    }.bind(this);
    //Удаление
    this.remove = function () {
        $drag.remove(this.drag);
        $(this.drag).remove();
        $(this.scroll).remove();
    }.bind(this);
    $drag.add($scroll.drag(this));
}

function _scrollH(obj, process) {
    /// <summary>
    /// Горизонтальный скролл
    /// </summary>
    this.obj = obj;
    this.scroll = null;
    this.totop = false;
    //this.init = function () {
    this.contentWidth = function () {
        //Вычисляем по длине первого встретившегося элемента, т.к. не знаю как еще посчитать ширину :(
        var h = $(this.obj).children("div").not(".__sys").get(0);

        if (h) { h = h.offsetWidth; }
        else { h = 0; }

        h += $(this.obj).pxcss("padding-left");
        h += $(this.obj).pxcss("padding-right");
        return h;
    }.bind(this);
    this.scroll = $(this.obj)
        .prepend("<div></div>")
        .find(":first")
        .addClass("scroll-bar-h")
        .addClass("__sys")
        .get(0);
    this.drag = $(this.scroll)
        .append("<div></div>")
        .find(":last")
        .addClass("drag")
        .css("margin-left", "0px")
        .get(0);

    this.fix = function () {
        /// <summary>Выравнивает размеры панели и ползунка прокрутки (например, при масштабировании родительской панели)</summary>
        //РАЗМЕР
        var delta = this.scroll.offsetWidth - $(this.scroll).pxcss("width");
        $(this.scroll).css("width", (this.obj.offsetWidth - delta) + "px");
        var w = this.contentWidth();

        var k = this.obj.offsetWidth > w ? 1 : w / this.obj.offsetWidth;
        $(this.drag).css("width", Math.floor($(this.scroll).pxcss("width") / k) + "px");

        //Положение
        var mt = -($(this.obj).pxcss("padding-left") + $(this.obj).pxcss("border-left-width"));
        if ($(this.obj).css("position") == "absolute") {
            mt += $(this.obj).scrollLeft();
        }
        $(this.scroll)
            .css("margin-top", (this.obj.offsetHeight - this.scroll.offsetHeight) + "px")
            .css("margin-left", (mt) + "px");

        if (k == 1)
            $(this.scroll).css("visibility", "hidden");
        else {
            //Выравнивание драг-панели скрола, при переходе к видимому состоянию
            if ($(this.scroll).css("visibility") == "hidden")
                $(this.drag).css("margin-left", "0px");
            $(this.scroll).css("visibility", "visible");
        }
    }.bind(this);
    this.fix();
    this.fixPos = function (sc) {
        /// <summary>Выравнивание положения ползунка прокрутки</summary>
        var sc = sc == null ? $(this.obj).scrollLeft() : sc; //Здесь сравнение с null, так как значение 0 является корректным и значимым
        var h = this.contentWidth();
        var k = this.obj.offsetWidth > h ? 1 : h / this.obj.offsetWidth;
        var max = this.scroll.offsetWidth - this.drag.offsetWidth;
        var d = Math.floor(sc / k);
        if (d > max)
            d = max;
        $(this.drag).css("margin-left", d + "px");
        this.fixBack();
        //var mt = -($(this.obj).pxcss("padding-left") + $(this.obj).pxcss("border-left-width"));
        //if ($(this.obj).css("position") == "absolute") {
        //    mt += $(this.obj).scrollLeft();
        //    $(this.scroll).css("margin-left", mt + "px");
        //}
    }.bind(this);
    this.fixBack = function () {
        var mt = -($(this.obj).pxcss("padding-left") + $(this.obj).pxcss("border-left-width"));
        if ($(this.obj).css("position") == "absolute") {
            mt += $(this.obj).scrollLeft();
            $(this.scroll).css("margin-left", mt + "px");
        }
    }.bind(this);
    this.fixPos();
    this.process = process || function (delta, deltax, deltay) {
        /// <summary>Непосредственный процессинг скролирования блока (в частности, при прокрутке колесом)</summary>
        var sc = $(this.obj).scrollLeft();
        var h = this.contentWidth();
        var dispSc = sc + (deltax * 10);
        if (dispSc > h - this.obj.offsetWidth) {
            dispSc = h - this.obj.offsetWidth;
        }
        else if (dispSc < 0) {
            dispSc = 0;
        }
        //Перемещение
        this.fixPos(dispSc);
        $(this.obj).scrollLeft(dispSc);
        this.fixBack();

        //Вызываем функцию, запускающую, в частности событие "scroll" у панели
        if (this.postProcess)
            this.postProcess();

    }.bind(this);
    //Удаление
    this.remove = function () {
        $drag.remove(this.drag);
        $(this.drag).remove();
        $(this.scroll).remove();
    }.bind(this);
    $drag.add($scroll.dragH(this));
}

var $scroll = {
    _scrolls: [],
    init: function () {
        $(document.body).mousewheel(function (event, delta, deltax, deltay) {
            var inarr = []; //Массив всех скролов, в которые попадает прокручиваемый элемент
            //Формируем такой массив. Массив имеет структуру [{scroll:obj, depth:num}, ... ], 
            //где depth - уровень вложенности прокручиваемого элемента относительно элемента скролла

            for (var i = 0; i < $scroll._scrolls.length; i++) {
                var o = $scroll._scrolls[i].obj;
                //console.log(o, event.target);
                if (o == event.target) {
                    inarr.push({ scroll: $scroll._scrolls[i], depth: 0 });
                }
                else if ($(o).has(event.target).length > 0) {
                    var depth = 1;
                    var a = event.target;
                    while (a.parentNode != o) {
                        depth++;
                        a = a.parentNode;
                    }
                    inarr.push({ scroll: $scroll._scrolls[i], depth: depth });
                }
            }
            //Получившийся массив сортируем по уровню вложенности и выполняем process для scroll первого элемента
            if (inarr.length > 0) {
                inarr.sort(function (a, b) { return a.depth > b.depth ? 1 : -1; });
                var _o = inarr[0].obj;
                for (var i = 0; i < inarr.length; i++) {
                    if (_o == inarr[i].obj) {
                        //Проверить ВЕЗДЕ скорость прокрутки (пока домножил на 3)
                        inarr[i].scroll.process(delta, deltax * 3, deltay * 3);
                        break;
                    }
                }
                //.scroll.process(delta, deltax, deltay);
                return false;
            }
        });
    },
    drag: function (scroll) {
        var res = {
            obj: scroll.drag,
            scroll: scroll,
            ct: 0,
            sc: 0
        };

        res.start = function (e) {
            $(document.body).disableSelection();
            //Проверяем. походу есть проблема
            this.ct = $(this.obj).pxcss("margin-top");
            this.sc = $(this.scroll.obj).scrollTop();

            $scroll._dragStarted = true; //Глобальный флаг о том, что происходит перетаскивание
        }.bind(res);
        res.stop = function (e, delta) {
            $(document.body).enableSelection();
            this.ct = $(this.obj).pxcss("margin-top");
            this.sc = $(this.scroll.obj).scrollTop();

            $scroll._dragStarted = false;
        }.bind(res);
        res.move = function (e, delta) {

            var h = this.scroll.contentHeight();
            var k = this.scroll.obj.offsetHeight > h ? 1 : h / this.scroll.obj.offsetHeight;
            //Скролл контента
            var sc = this.sc;
            //Границы скролинга
            var dispSc = sc + delta.y * k;
            if (dispSc > h - this.scroll.obj.offsetHeight) {
                dispSc = h - this.scroll.obj.offsetHeight;
            }
            else if (dispSc < 0) {
                dispSc = 0;
            }
            //Перемещение драг-бара
            this.scroll.fixPos(dispSc);
            $(this.scroll.obj).scrollTop(dispSc);
            //Показываем или скрываем кнопку "Перейти наверх"
            //this.scroll.fixTopBtn();

            //Вызываем функцию, запускающую пост-процессинг. В частности, событие "scroll" у панели
            if (this.scroll.postProcess)
                this.scroll.postProcess();

        }.bind(res);
        return res;
    },
    dragH: function (scroll) {
        var res = {
            obj: scroll.drag,
            scroll: scroll,
            ct: 0,
            sc: 0
        };

        res.start = function (e) {
            $(document.body).disableSelection();
            //Проверяем. походу есть проблема
            this.ct = $(this.obj).pxcss("margin-left");
            this.sc = $(this.scroll.obj).scrollLeft();

            $scroll._dragStarted = true; //Глобальный флаг о том, что происходит перетаскивание
        }.bind(res);
        res.stop = function (e, delta) {
            $(document.body).enableSelection();
            this.ct = $(this.obj).pxcss("margin-left");
            this.sc = $(this.scroll.obj).scrollLeft();

            $scroll._dragStarted = false;
        }.bind(res);
        res.move = function (e, delta) {

            var h = this.scroll.contentWidth();
            var k = this.scroll.obj.offsetWidth > h ? 1 : h / this.scroll.obj.offsetWidth;
            //Скролл контента
            var sc = this.sc
            //Границы скролинга
            var dispSc = sc + delta.x * k;
            if (dispSc > h - this.scroll.obj.offsetWidth) {
                dispSc = h - this.scroll.obj.offsetWidth;
            }
            else if (dispSc < 0) {
                dispSc = 0;
            }
            //Перемещение драг-бара
            this.scroll.fixPos(dispSc);
            $(this.scroll.obj).scrollLeft(dispSc);

            //Вызываем функцию, запускающую пост-процессинг. В частности, событие "scroll" у панели
            if (this.scroll.postProcess)
                this.scroll.postProcess();

        }.bind(res);
        return res;
    },
    add: function (obj, totop, h) {
        var a = $scroll.get(obj);
        if (a.length && a.length == 2) {
            return null;
        }
        if (a.length && a.length == 1 &&
            ((_scroll.prototype.isPrototypeOf(a) && !h) ||
                (_scrollH.prototype.isPrototypeOf(a) && h))) {
            return null;
        }
        a = h ? new _scrollH(obj, null) : new _scroll(obj, null, totop);
        $scroll._scrolls.push(a);
        return a;
    },
    get: function (obj) {
        var a = [];
        for (var i = 0; i < $scroll._scrolls.length; i++) {
            if ($scroll._scrolls[i].obj == obj) {
                var s = $scroll._scrolls[i];
                a.push(s);
            }
        }
        return a;
    },
    remove: function (obj) {
        //console.log(obj);
        var s = $scroll.get(obj);
        if (s) {
            //console.log($scroll._scrolls);
            $scroll._scrolls = $scroll._scrolls.without(s);
            //console.log($scroll._scrolls);
            for (var i = 0; i < s.length; i++) {
                s[i].remove();
            }
        }
    }
}
$(document.body).ready($scroll.init);