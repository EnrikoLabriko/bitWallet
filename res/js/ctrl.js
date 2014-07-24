///<reference path="engine.js" />

function _compoundOptions(cmpd) {
    /// <summary>
    /// Объект расширение над массивом для коллекции контролов в compound
    /// </summary>
    this.cmpd = cmpd || null;
    this._events = [];
    this._push = this.push;
    this.push = function (a) {
        /// <summary>
        /// Добавляет контрол в коллекцию и навешивает на него все события коллекции
        /// </summary>
        /// <param name="a">Должен быть типа ctrl</param>
        /// <returns type="">Длинну коллекции</returns>

        if (ctrl.prototype.isPrototypeOf(a)) {
            for (var i = 0; i < this._events; i++) {
                a.addEvent(this._events[i].type, this._events[i].func, this._events[i].name);
            }
            this._push(a);
        }
        return this.length;
    }.bind(this);
    this.addEvent = function (type, func, name) {
        for (var i = 0; i < this.length; i++) {
            this[i].addEvent(type, func, name);
        }
        this._events = this._events.without(this._events.select({ name: name, type: type }));
        this._events.push({ name: name, func: func, type: type });
        return this.cmpd;
    }.bind(this);
    this.removeEvent = function (type, name) {
        for (var i = 0; i < this.length; i++) {
            this[i].removeEvent(type, name);
        }
        this._events = this._events.without(this._events.select({ name: name, type: type }));
        return this.cmpd;
    }.bind(this);
    this.fireEvent = function (type, p) {
        for (var i = 0; i < this.length; i++) {
            this[i].fireEvent(type, p);
        }
        return this.cmpd;
    }.bind(this);
}
_compoundOptions.prototype = new Array();

function ctrl(obj) {
    this.obj = obj; // DOM элемент - основа контрола
    this.$ = function (o) {
        /// <summary>
        /// Возвращает jQuery от this.obj или this[o] если задан "o".
        /// "o" - строка
        /// </summary>
        if (o && this[o]) return $(this[o]);
        else return $(this.obj);
    }.bind(this);
    this.name = $(this.obj).attr("name");
    this.add = $(this.obj).attr("add");
    this.compound = $(this.obj).attr("compound");
    this.pgroup = $(this.obj).attr("pgroup");
    this.pgroup = this.pgroup ? this.pgroup.split(",") : [];
    this.changed = false;
    //Секция enable-disable
    this.disabledClass = "ctrl-disabled";
    this.enabled = $(this.obj).attr("enabled"); //Активен ли класс
    this.enable = function () {
        this.fireEvent("before-enable");
        $(this.obj).removeClass(this.disabledClass);
        this.fireEvent("after-enable");
        return this;
    }.bind(this);
    this.disable = function () {
        this.fireEvent("before-disable");
        $(this.obj).replaceClass(this.disabledClass, this.disabledClass);
        this.fireEvent("after-disable");
        return this;
    }.bind(this);
    if (this.enabled == "false") {
        this.disable();
    }
    this.disabled = function () {
        return $(this.obj).hasClass(this.disabledClass);
    }
    this.events = {}; // Объект - диспетчер обработчиков событий
    this.addEvent = function (type, func, name) {
        /// <summary>
        /// Добавляет обработчик события. type - строка, func - функция, name - уникальный строковый идентификатор
        /// </summary>
        var arr = this.events[type] || [];
        var listener = { func: func, name: (name || null) };
        var push = true;
        if (name) {
            for (var i = 0; i < arr.length; i++) {
                if (name == arr[i].name) {
                    arr[i] = listener;
                    push = false;
                }
            }
        }
        if (push)
            arr.push(listener);
        this.events[type] = arr;
        return this;
    }.bind(this);
    this.fireEvent = function (type, p) {
        /// <summary>
        /// Вызов обработчиков события type
        /// </summary>
        if (this.events[type]) {
            for (var i = 0; i < this.events[type].length; i++) {
                var c = this.events[type];
                this.events[type][i].func(p);
            }
        }
        return this;
    }.bind(this)
    this.removeEvent = function (type, name) {
        /// <summary>Удаляет обработчик события заданного типа по идентификатору</summary>
        var arr = this.events[type] || [];
        var res = [];
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].name || arr[i].name != name) {
                res.push(arr[i]);
            }
        }
        this.events[type] = res;
        return this;
    }.bind(this);
    this.change = function () {
        if (!this.disabled()) {
            var val = this.getValue();
            if (!$CS.compoundTypes.contains(this.cType)) {
                if (!val || (val == 'undefined' && !(this.empty && val == this.empty))) {
                    this.changed = false;
                } else {
                    this.changed = true;
                }
            } else this.changed = true;
            this.fireEvent("on-change");
        }
        return this;
    }.bind(this);
    this.setChanges = function (c) {
        this.changed = !!c;
        return this;
    }.bind(this);
    this.init = function () {
        if (this.compound) {
            if (!$CS.compoundTypes.contains(this.cType)) {
                var cmpds = this.compound.split(".");
                var group = null;
                var c = null;
                for (var i = 0; i < cmpds.length; i++) {
                    group = $CS.ctrls.compound(cmpds[i], group);
                    if (this.pgroup) {
                        group.pgroup = this.pgroup;
                    }
                    if (i == cmpds.length - 1) {
                        //this.onChange = function () {
                        //    this.change();
                        //}.bind(group);
                        //TODO: Разобраться, что это за такая штука странная (3 строки выше)
                        group.options.push(this);
                    }
                }
            }
            this.nopush = true;
        }
        if (!$CS.dispatcher.contains(this)) {
            for (var i in $CS.ctrls) {
                if ($(this.obj).hasClass(i) && jQuery.isFunction($CS.ctrls[i])) {
                    this.cType = i;
                    $CS.ctrls[i](this);
                }
            }
            if (!this.nopush) {
                $CS.clearByName(this);
                $CS.dispatcher.push(this);
            }
        }
    }.bind(this);
    this.setValue = function (val) {
        if (this.value) {
            this.value = val;
        } else if (this.obj.value != null) {
            this.obj.value = val;
        }
        return this;
    }.bind(this);
    this.getValue = function () {
        var val = (this.value == null ? this.obj.value : this.value);
        val = val == "undefined" ? "" : val;
        return val + (this.add ? " " + this.add : "");
    }.bind(this);
    this.dispose = function () {
        this.fireEvent("before-dispose");
        $(this.obj).remove();
        this.obj = null;
        if (this.compound) {
            $CS.get(this.compound).options = $CS.get(this.compound).options.without(this);
        } else {
            $CS.dispatcher = $CS.dispatcher.without(this);
        }
        this.fireEvent("after-dispose");
        return this;
    }.bind(this);
}
var $CS = {
    compoundTypes: ["compound"],
    slides: [],
    //Массив-диспетчер выпадающих дивов
    Init: function () {
        $(document.body).on("mouseup", function (event) {
            if (window["$scroll"] && !$scroll._dragStarted) {
                var t = event.target;
                $CS.HideSelector(t);
            }
        });
    },
    HideSelector: function (t) {
        for (var i = 0; i < $CS.slides.length; i++) {
            var slide = $CS.slides[i];
            if (slide && slide != t) {
                if (!slide.hidden) {

                    if (t && $(slide).has(t).length > 0) {
                        if ($(t).hasClass("drag")) continue;
                        if (slide.onSelect) {
                            slide.onSelect(t);
                        }
                        if (slide.noInnerClose) {
                            continue;
                        }
                    }
                    slide.oldWidth = $(slide).css("width");
                    $(slide).animate({
                        height: $(slide.parentNode).css("height"),
                        opacity: "0.0"
                    }, 250, function () {
                        $(this).css("height", "").css("display", "none").css("opacity", "0");
                        //Сбрасываем сдвиг от скролла в дефолтное значение
                        this.style.marginTop = "";
                    }.bind(slide));

                    if (slide.onClose) slide.onClose();
                    slide.hidden = true;
                }
            }
        }
    },
    SlideSelector: function (obj, onSelect, a, arr, disp, onClose, onOpen, sync) {
        if (obj) {
            $(obj).css("display", "block");
            obj.onSelect = onSelect;
            if (arr) {
                obj.innerHTML = "";
                var arr = jQuery.isFunction(arr) ? arr() : jQuery.isArray(arr) ? arr : [arr];
                for (var i = 0; i < arr.length; i++) {
                    var val = typeof (arr[i]) == "string" ? {
                        name: arr[i],
                        id: -1
                    } : arr[i];
                    $(obj).append("<a></a>").find(":last").attr("href", "javascript://" + (val.name || val.title) + ";").attr("value", val.id).html(val.name || val.title);
                }
            }
            if (a) {
                $(a).removeClass("expand").addClass("expand");
                $(obj).css("left", a.offsetLeft + "px");

                obj.onClose = function () {
                    $(this).removeClass("expand");
                }.bind(a);
            }
            if (!$CS.slides.contains(obj)) {
                $CS.slides.push(obj);
            }
            if ($(obj).css("opacity") == "0") {
                $(obj).css("opacity", "0");

                var disp = disp ? jQuery.isFunction(disp) ? disp() : disp : 235;

                if (onClose) obj.onClose = onClose;
                obj.hidden = false;

                //Обрабатываем скроллинг родительских элементов
                var mt = $(obj).pxcss("margin-top");//  - $(obj).parentScroll(); //вдруг почему-то перестало быть нужно 0_o
                obj.style.marginTop = mt + "px";

                var p = {
                    opacity: "1"
                };
                //if (obj.offsetWidth > obj.parentNode.offsetWidth) {
                //    var w = obj.offsetWidth;
                //    obj.style.width = (obj.parentNode.offsetWidth /*- 2*/) + "px";
                //    p.width = (w /*- 2*/) + "px";
                //}
                $(obj).animate(p, {
                    duration: 300,
                    complete: onOpen
                });
                if (sync) {
                    //var m = $(sync).pxcss("padding-top") + $(sync).pxcss("padding-bottom");
                    //p.height = "+" + (disp - m) + "px";
                    $(sync).animate(p, {
                        duration: 300
                    });
                }
            }
        }
    },
    dispatcher: [],
    emptyString: function (str) {
        return (str == "" || str == "undefined");
    },
    clearByName: function (c) {
        var arr = $CS.dispatcher;
        for (var i = 0; i < arr.length; i++) {
            if (c.name && arr[i].name == c.name) {
                arr[i].dispose();
            }
        }
    },
    getGroup: function (group) {
        var res = [];
        for (var i = 0; i < $CS.dispatcher.length; i++) {
            if ($CS.dispatcher[i].pgroup.contains(group)) {
                res.push($CS.dispatcher[i]);
            }
        }
        return res;
    },
    init: function (obj, except) {
        var except = except || [];
        if ($(obj).hasClass("ctrl")) {
            if (!except.contains($(obj).attr("name").toString().toLocaleLowerCase())) {
                (new ctrl(obj)).init();
            }
        }
        var cs = $(obj).find(".ctrl");
        //console.log(cs);
        cs.each(function (i, el) {
            if (!except.contains($(el).attr("name").toString().toLocaleLowerCase())) {
                (new ctrl(el)).init();
            }
        });
    },
    get: function (name) {
        var name = name.split(".");
        var _c = null;
        for (var n = 0; n < name.length; n++) {
            if (_c == null) {
                for (var i = 0; i < $CS.dispatcher.length; i++) {
                    var c = $CS.dispatcher[i];
                    if (c && c.name == name[n]) {
                        _c = c;
                    }
                }
            } else {
                if (!$CS.compoundTypes.contains(_c.cType)) {
                    return null;
                }
                var opts = _c.options;
                var __c = _c;
                for (var i = 0; i < opts.length; i++) {
                    var c = opts[i];
                    if (c && c.name == name[n]) {
                        _c = c;
                        break;
                    }
                }
                if (_c && _c == __c) {
                    return null;
                }
            }
        }
        return _c;
    },
    byName: function (arr, name) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].name == name) return arr[i];
        }
        return null;
    },
    ctrls: {
        input: function (c) {
            var empty = $(c.obj).attr("empty");
            c.autodecades = false; //Разделять числа на декады
            c.empty = empty;
            c.mask = $(c.obj).attr("mask") || "";
            c.reg = $(c.obj).attr("validate") || "";
            c.validate = function () {
                if (this.reg && this.obj.value) {
                    return (new RegExp(this.reg)).test(this.obj.value) ? {
                        res: true
                    } : {
                        res: false,
                        text: "Поле %label% заполнено не верно"
                    };
                }
                return {
                    res: true
                };
            }.bind(c);
            if (c.mask) {
                //Обработка маски
                var mask = c.mask.split("##");
                c.mask = [];
                for (var i = 0; i < mask.length; i++) {
                    if (mask[i] == "digits") {
                        c.autodecades = true;
                        c.mask = c.mask.concat([45, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
                    } else {
                        for (var j = 0; j < mask[i].length; j++) {
                            c.mask.push(mask[i].charCodeAt(j));
                        }
                    }
                }
                //Проверка на кейпресс и отмена евента если не попадаем в заданный диапазон
                $(c.obj).keypress(function (event) {
                    if (!this.mask.contains(event.which)) {
                        return event.preventDefault();
                    }
                }.bind(c));
            }
            if (c.empty) {
                $(c.obj).on("focus", function (event) {
                    var val = this.obj.value;
                    $(this.obj).removeClass("empty");
                    if (val == this.empty) {
                        this.obj.value = "";
                    }
                }.bind(c));
            }
            $(c.obj).on("blur", function (event) {
                var val = this.obj.value;
                if (this.empty) {
                    if (val == this.empty || !val) {
                        this.obj.value = this.empty;
                        $(this.obj).removeClass("empty").addClass("empty");
                    }
                }
                //Специальная проверка на то, изменилось ли значение инпута после фокуса.
                if (val != this._oldValue) {
                    this.change();
                }
            }.bind(c));
            c.$().on("focus", function (event) {
                c._oldValue = this.getValue();
            }.bind(c));
            //обработчик ввода для автоматическиго форматирования числа
            //c.$().on("keyup", function (event) {
            //    if (this.autodecades) {
            //        var v = this.getValue().replace(/[^0-9]/gi, "");
            //        var add = "";
            //        if (v.lastIndexOf(",") == v.length-1 || v.lastIndexOf(".") == v.length-1)
            //            add = ",";
            //        v = (+v || +v.replace(/[\.\,]+/gi, "."));
            //        console.log(v);
            //        v = v.roundToString(20, ",", " ");
            //        this.obj.value = v + add;
            //    }
            //}.bind(c));
            if (c.empty) {
                if (c.obj.value == c.empty || !c.obj.value) {
                    c.obj.value = c.empty;
                    $(c.obj).removeClass("empty").addClass("empty");
                }
            }
            c.getValue = function () {
                if (this.empty && this.obj.value == this.empty) return "" + (this.add ? " " + this.add : "");
                else return this.obj.value + (this.add ? " " + this.add : "");
            }.bind(c);
            c.set = function (val) {
                if (this.empty && (val == this.empty || $CS.emptyString(val))) this.obj.value = this.empty;
                else this.obj.value = val;
            }.bind(c);
        },
        check: function (c, sel, desel) {
            var css = ($(c.obj).attr("css") || "").split(",");
            var sel = sel;
            var desel = desel;
            var disabled = "check-disabled";
            if (!sel && !desel && css.length >= 2) {
                sel = css[0];
                desel = css[1];
                if (css[2]) disabled = css[2];
            }
            c.disabledClass = disabled;
            c.value = $(c.obj).attr("value") || "";
            c.sel = sel || $RM.ctrls.check.selected;
            c.desel = desel || $RM.ctrls.check.deselected;
            c.check = function () {
                $(this.obj).removeClass(this.sel).removeClass(this.desel).addClass(this.sel);
            }.bind(c);
            c.unCheck = function () {
                $(this.obj).removeClass(this.sel).removeClass(this.desel).addClass(this.desel);
            }.bind(c);
            c.toggle = function () {
                if ($(this.obj).hasClass(this.sel)) this.unCheck();
                else this.check();
                this.change();
            }.bind(c);
            $(c.obj).on("click", function () {
                if (!this.disabled()) {
                    this.toggle();
                }
            }.bind(c));
            c.checked = function () {
                return $(this.obj).hasClass(this.sel);
            }.bind(c);
            if (c.obj.checked == true) {
                c.check();
            }
            c.getValue = function () {
                return this.checked();
            }.bind(c);
            c.set = function (val) {
                if (val) {
                    this.check();
                } else {
                    this.unCheck();
                }
            }.bind(c);
        },
        inheritCompound: function (group) {
            group.options = new _compoundOptions(group);
            group.get = function (name) {
                //for (var i = 0; i < this.options.length; i++) {
                //    if (this.options[i].name == name)
                //        return this.options[i];
                //}
                var name = name.split(".");
                var _c = null;
                if (!name)
                    return null;
                for (var n = 0; n < name.length; n++) {
                    if (_c == null) {
                        for (var i = 0; i < this.options.length; i++) {
                            var c = this.options[i];
                            if (c && c.name == name[n]) {
                                _c = c;
                            }
                        }
                    } else {
                        if (!$CS.compoundTypes.contains(_c.cType)) {
                            return null;
                        }
                        var opts = _c.options;
                        var __c = _c;
                        for (var i = 0; i < opts.length; i++) {
                            var c = opts[i];
                            if (c && c.name == name[n]) {
                                _c = c;
                                break;
                            }
                        }
                        if (_c && _c == __c) {
                            return null;
                        }
                    }
                }
                return _c;
            }.bind(group);
            group.dispose = function () {
                var opts = this.options;
                for (var i = 0; i < opts.length; i++) {
                    opts[i].dispose();
                }
                if (!this.compound) {
                    $CS.dispatcher = $CS.dispatcher.without(this);
                } else {
                    var g = $CS.get(this.compound);
                    if (g) {
                        g.options = g.options.without(this);
                    }
                }
            }.bind(group);
            group.setChanged = function (c) {
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].setChanged) this.options[i].setChanged(c);
                }
                this.changed = !!c;
            }.bind(group);
            group.getValue = function () {
                var res = {};
                for (var i = 0; i < this.options.length; i++) {
                    res[this.options[i].name] = this.options[i].getValue() || "";
                }
                return res;
            }.bind(group);
            group.setEmpty = function () {
                for (var i = 0; i < this.options.length; i++) {
                    if (this.options[i].setEmpty) {
                        this.options[i].setEmpty();
                    } else this.options[i].set("");
                }
            }.bind(group);
            group.set = function (val) {
                for (var i = 0; i < this.options.length; i++) {
                    if (val[this.options[i].name]) this.options[i].set(val[this.options[i].name]);
                }
            }.bind(group);
            group.disable = function () {
                /// <summary>
                /// Делает все суб-контролы не активными
                /// </summary>
                for (var i = 0; i < this.options.length; i++) {
                    this.options[i].disable();
                }
            }.bind(group);

            group.enable = function () {
                /// <summary>
                /// Делает все суб-контролы активными
                /// </summary>
                for (var i = 0; i < this.options.length; i++) {
                    this.options[i].enable();
                }
            }.bind(group);

            group.disabled = function () {
                /// <summary>
                /// Истино, если все суб-контролы не активны
                /// </summary>
                res = true;
                for (var i = 0; i < this.options.length; i++) {
                    res = i == 0 ? this.options[i].disabled() : res && this.options[i].disabled();
                }
                return res;
            }.bind(group);

            group.enabled = function () {
                /// <summary>
                /// Истино, если все суб-контролы активны
                /// </summary>
                res = true;
                for (var i = 0; i < this.options.length; i++) {
                    res = i == 0 ? !this.options[i].disabled() : res && !this.options[i].disabled();
                }
                return res;
            }.bind(group);
            return group;
        },
        compound: function (name, g) {
            var group = null;
            group = g ? g.get(name) : $CS.get(name);
            if (!group) {
                group = new ctrl();
                group.cType = "compound";
                group.name = name;
                if (g) {
                    group.compound = (g.compound ? g.compound + "." : "") + g.name;
                    g.options.push(group);
                }
                group.init();
                group = $CS.ctrls.inheritCompound(group);
            }
            return group;
        },
        radio: function (c) {
            var group = $CS.ctrls.radioGroup($(c.obj).attr("rgroup"), c.compound);
            group.pgroup = group.pgroup.merge(c.pgroup);
            var css = ($(c.obj).attr("css") || "").split(",");
            if (css.length == 2) {
                c.sel = css[0];
                c.desel = css[1];
            } else {
                c.sel = $RM.ctrls.radio.selected;
                c.desel = $RM.ctrls.radio.deselected;
            }
            $CS.ctrls.check(c, c.sel, c.desel);
            group.options.push(c);
            c.getValue = function () {
                return this.value;
            }.bind(c);
            c.group = group;
            c.toggle = function () {
                if (!this.checked()) this.check(true);
            }.bind(c);
            c.check = function (evnt) {
                this.group.deselect();
                $(this.obj).removeClass(this.sel).removeClass(this.desel).addClass(this.sel);

                if (evnt) this.group.change();
            }.bind(c);
        },
        radioGroup: function (name, compound) {
            var group = null;
            group = $CS.get((compound ? compound + "." : "") + name);
            if (!group) {
                group = new ctrl();
                group.name = name;
                group.compound = compound;
                group.options = [];
                group.getValue = function () {
                    for (var i = 0; i < this.options.length; i++) {

                        if ($(this.options[i].obj).hasClass(this.options[i].sel)) {
                            return this.options[i].getValue();
                        }
                    }
                }.bind(group);
                group.deselect = function () {
                    for (var i = 0; i < this.options.length; i++) {
                        this.options[i].unCheck();
                    }
                }.bind(group);
                group.set = function (val) {
                    for (var i = 0; i < this.options.length; i++) {
                        if (val == this.options[i].getValue()) {
                            this.options[i].check();
                            break;
                        }
                    }
                }.bind(group);
                group.init();
            }
            return group;
        },
        label: function (c) {
            c.add = c.obj.add || c.$().attr("add") || "";
            c.setValue = function (val) {
                this.obj.innerHTML = val + (this.add ? " " + this.add : "");
            }.bind(c);
            c.getValue = function () {
                var val = this.obj.innerHTML.toString();
                if (this.add) val = val.replace(new RegExp(" " + val, "gi"), "");
                return val;
            }.bind(c);
        },
        select: function (c) {
            var _o = ($(c.obj).attr("options") || "").split(";");
            c.tiles = +($(c.obj).attr("tiles") || "6");
            c.tileSize = +($(c.obj).attr("tilesize") || "25");
            c.noadd = c.$().attr("noadd") == "true";

            if (c.noadd) {
                c.$().addClass("noadd");
            }

            c.emptyString = ($(c.obj).attr("emptystring") || "...");
            c.disabledClass = "select-disabled";

            var options = [];
            for (var i = 0; i < _o.length; i++) {
                var _s = _o[i].split(":");
                options.push({
                    text: _s[0],
                    caption: (_s.length > 2 ? _s[1] : null),
                    value: (_s.length > 2 ? _s[2] : _s.length > 1 ? _s[1] : null)
                });
            }
            var css = $(c.obj).attr("css");
            c.autofilter = $(c.obj).attr("autofilter") == "true";
            c.options = options;
            c.multy = $(c.obj).attr("multy") == "true";
            c.prefix = $(c.obj).attr("prefix");
            c.actionSelect = function () {
                return this.$().hasClass("action-select");
            }.bind(c);
            c.addOther = function () {
                this.removeOther();
                this.other = $(this.obj).after("input").next().addClass("input mt10").get(0);
            }.bind(c);
            c.removeOther = function () {
                if (this.other) {
                    this.other.parentNode.removeChild(this.other);
                    this.other = null;
                }
            }.bind(c);
            var v = c.obj.innerHTML.toString().trim();
            var _v = v.split(":");
            if (_v.length > 1) {
                c.value = _v[1];
            } else {
                c.value = -1;
            }
            c.obj.innerHTML = "";
            c.btn = $(c.obj).append("<span></span>").find(":last").addClass("btn db fr").get(0);
            if (!c.noadd)
                c.addObj = c.$().append("<div class='add-val'></div>").find(":last").get(0);
            c.val = c.autofilter ? $(c.obj).append("<input />").find(":last").attr("type", "text").get(0) //.attr("value", _v[0]).get(0)
            :
            $(c.obj).append("<span></span>").find(":last").addClass("title db").get(0); //.html(_v[0]).get(0);
            if (c.autofilter) {

                $(c.obj).replaceClass("autofilter", "autofilter");

                c.val.emptyText = "...";
                $(c.val).keyup(function (event) {
                    if (!this.opened) this.slide();
                    var obj = this.filterList(this.val.value);

                    if (event.KeyCode == 13) {
                        this.val.blur();
                        $CS.HideSelector(document.body);
                    }
                }.bind(c));
                $(c.val).on("focus", function () {
                    if (!this.value || this.value == "undefined" || this.value.toString() == "-1") {
                        this.val.emptyText = c.val.value;
                        this.val.value = "";
                        this.focused = true;
                    }
                }.bind(c));
                $(c.val).on("blur", function () {
                    this.focused = false;
                    var has = this.hasText(this.val.value);
                    if (this.val.emptyText && (this.val.emptyText == this.val.value || this.val.value == "" || !has)) {
                        this.setEmpty();
                        this.change();
                    }
                    if (has) {
                        this.set(has.oldHTML || has.innerHTML, has.value);
                        this.change();
                    }
                }.bind(c));
            }
            c.hasText = function () {
                var opts = $(this.down).find("a").toArray();
                for (var i = 0; i < opts.length; i++) {
                    if ((opts[i].oldHTML || opts[i].innerHTML.toString()).toLowerCase().trim() == this.val.value.toLowerCase().trim()) {
                        return opts[i];
                    }
                }
                return null;
            }.bind(c);
            c.down = $(".btn", c.obj).before("<div></div>").prev().addClass("select-down").get(0);
            c.middle = $(c.down).append("<div class='select-middle'></div>").find(":first").get(0);

            if (css) $(c.down).addClass(css);
            $(c.down).css("display", "none").css("opacity", "0");
            if (c.multy) c.down.noInnerClose = true;
            c.addEvent("before-disable", function () {
                this.val.disabled = true;
            }.bind(c));
            c.addEvent("before-enable", function () {
                this.val.disabled = false;
            }.bind(c));
            c.formList = function (options) {
                var m = this.tiles * this.tileSize;
                this.disp = options.length * this.tileSize > m ? m : options.length * this.tileSize;
                this.disp += this.$("middle").pxcss("padding-top") + this.$("middle").pxcss("padding-bottom");
                this.middle.innerHTML = "";
                for (var i = 0; i < options.length; i++) {
                    var val = (options[i].value != null && options[i].value.toString() != "") ? options[i].value : (options[i].value == "" ? "undefined" : (options[i].text || options[i].title));
                    var a = $(this.middle).append("<a></a>").find(":last").attr("href", "javascript://;").html(options[i].text || options[i].title).get(0);
                    a.value = val;
                    a.option = options[i];
                    //Если это меню (акшен-селект) добавлвяем к класс-значение
                    if (this.actionSelect()) $(a).addClass(val);
                    //Если дополнительно значение, выводим
                    if (options[i].caption) {
                        $(a).prepend("<span class='add'></span>").find(".add").html(options[i].caption);
                    }
                    //Вычисляем максимальную ширину выезжающей области ддл в случае по кол-ву символов в самом длинном его пункте
                    //var w = Math.round(options[i].text.length * 6.5) + 17 + (this.actionSelect() ? 21 : 0);
                    //this.down.style.display = "";
                    //this.down.style.visibility = "hidden";
                    //if (this.down.offsetWidth < w) {
                    //    this.down.style.width = w + "px";
                    //}
                    if (this.multy && !$CS.emptyString(a.value)) {
                        $(a).addClass("des");
                    }
                    this.down.style.display = "none";
                    this.down.style.visibility = "visible";
                }
                return c;
            }.bind(c);
            c.filterList = function (text) {
                var opts = $(this.down).find("a").toArray();
                this.clearListSelections();
                var first = null;
                if (text.length > 0) {
                    for (var i = 0; i < opts.length; i++) {
                        var val = opts[i].innerHTML.toString();
                        var reg = new RegExp("(" + text + ")", "gi");
                        if (reg.test(val)) {
                            opts[i].oldHTML = val;
                            opts[i].innerHTML = val.replace(reg, "<span class='selected'>$1</span>");
                            if (!first) first = opts[i];
                        } else {
                            opts[i].style.display = "none";
                        }
                    }
                }
                return first;
            }.bind(c);
            c.clearListSelections = function () {
                var opts = $(this.down).find("a").toArray();
                for (var i = 0; i < opts.length; i++) {
                    if (opts[i].oldHTML) {
                        opts[i].innerHTML = opts[i].oldHTML;
                        opts[i].oldHTML = "";
                    }
                    opts[i].style.display = "";
                }
            }.bind(c);
            c.formList(options);
            c.removeOption = function (value) {
                var opts = $(this.down).find("a").toArray();
                for (var i = 0; i < opts.length; i++) {
                    if (opts[i].value == value) {
                        opts[i].parentNode.removeChild(opts[i]);
                    }
                }
            }.bind(c);
            c.onBeforeSlide = function () { };
            c.slide = function () {
                if (this.onBeforeSlide) this.onBeforeSlide();
                this.down.style.display = "block";

                //var opts = $G.Get.ByTag(this.down, "a");
                //var w = (this.obj.offsetWidth || 2);
                //if (this.down.offsetWidth > w) {
                //    w = this.down.offsetWidth;
                //}
                //this.down.style.width = (w /* - 2 */) + "px";
                var _a = this.optionByValue(this.getValue());
                $("a", this.down).each(function (i, el) {
                    //el.style.width = (this.w - 16 - (this.t.actionSelect() ? 21 : 0)) + "px";
                    if (this.a && this.a == el) {
                        $(el).replaceClass("selected", "selected");
                    } else {
                        $(el).removeClass("selected");
                    }
                }.bind({
                    //w: w,
                    a: _a,
                    t: this
                }));
                //Раскомментировать эту строку, если ддл выпадает вниз а не поверх
                //this.down.style.marginTop = (this.obj.offsetHeight - ($.browser.msie ? 4 : 5)) + "px";
                //... и закомментировать эту
                //?????????????????????
                //--
                this.opened = true;
                $CS.SlideSelector(this.down, function (what) {
                    if (this.multy) {
                        if ($CS.emptyString(what.value)) {
                            this.clearmulty();
                        } else {
                            if ($(what).hasClass("sel")) $(what).replaceClass("des sel", "des");
                            else $(what).replaceClass("des sel", "sel");
                        }
                        this.updmulty();
                    } else {
                        if (this.actionSelect()) {
                            //Если селек - акшен-селект, вызываем событие "actions-selected" и 
                            //передаем туда в качестве параметра value выбранного итема
                            this.fireEvent("action-selected", what.value);
                            return;
                        }
                        var a = what;
                        if ($(what).hasClass("add")) {
                            a = $(what).parent().get(0);
                        }
                        var add = $(a).find(".add").get(0);
                        if (add)
                            add = add.innerHTML;
                        var htm = a.innerHTML;
                        htm = htm.replace(/\<span.+?\<\/span\>/gi, "").trim();
                        this.set(htm, what.value, add);
                    }
                    this.change();
                }.bind(this), null, null, this.disp, function () {
                    if (this.onClose) {
                        this.onClose();
                    };
                    this.opened = false;
                    //... и закомментировать эту
                    $(this.obj).removeClass("select-opened");
                    $scroll.remove(this.middle);
                }.bind(this), function () {
                    $(this.obj).replaceClass("select-opened", "select-opened");
                    $scroll.add(this.middle);
                    //Гадко-хром >:{
                }.bind(this), this.middle);
            }.bind(c);
            $(c.obj).on("click", function (event) {
                //console.log(this.disabledClass);
                if (!this.disabled()) {
                    //console.log("in");
                    this.clearListSelections();
                    var t = event.target;
                    if (t) {
                        if ($(this.down).has(t).length == 0) {
                            if (this.autofilter && !this.focused) {
                                this.val.focus();
                                $(this.val).selectText(0, this.val.value.length);
                            }
                            if (!this.autofilter) this.slide();
                        }
                    }
                }
            }.bind(c));
            c.isEmpty = $CS.emptyString;
            c.emptyValue = -1;
            c.setEmpty = function () {
                var opt = $(this.down).find("a").toArray();
                for (var i = 0; i < opt.length; i++) {
                    if (this.isEmpty(opt[i].value)) {
                        this.set(opt[i].innerHTML, opt[i].value);
                        return;
                    }
                }
                this.set(this.emptyString || "...", this.emptyValue, "");
                return this;
            }.bind(c);
            c.clearmulty = function () {
                var opt = $(this.down).find("a").toArray();
                for (var i = 0; i < opt.length; i++) {
                    $(opt[i]).replaceClass("sel des", "des");
                }
            }.bind(c);
            c.checkmulty = function (val) {
                if (!$CS.emptyString(val)) {
                    var val = typeof (val) == "string" ? val.split(",") : val;
                    var opt = $(this.down).find("a").toArray();
                    for (var i = 0; i < val.length; i++) {
                        for (var o = 0; o < opt.length; o++) {
                            if (opt[o].value.toString() == val[i]) {
                                $(opt[o]).replaceClass("sel des", "sel");
                                break;
                            }
                        }
                    }
                    this.updmulty();
                }
            }.bind(c);
            c.getTitle = function () {
                return this.val.title || this.val.innerHTML.toString().trim();
            }.bind(c);
            c.updmulty = function () {
                var opt = $(this.down).find("a").toArray();
                var val = [];
                var titles = [];
                for (var i = 0; i < opt.length; i++) {
                    if ($(opt[i]).hasClass("sel")) {
                        val.push(opt[i].value);
                        titles.push(opt[i].innerHTML.toString());
                    }
                }
                if (val.length == 0) {
                    this.setEmpty();
                } else if (val.length == 1) {
                    this.set(titles[0], val[0]);
                } else {
                    this.value = val.join(",");
                    if (this.autofilter) {

                    } else {
                        this.val.innerHTML = "Выбрано <b>" + val.length + "</b> " + $g.number.format(val.length, "элемент", "", "а", "ов");
                    }
                }
            }.bind(c);
            c.set = function (title, value, add) {
                /// <summary>Установка текста и значения селекта. Если текст длиннее чем селект, обрезаем текст</summary>
                if (!value && $CS.emptyString(title)) {
                    this.setEmpty();
                } else {
                    if (this.autofilter) {
                        this.val.value = title;
                    } else {
                        var char = Math.floor((this.val.offsetWidth) / 7.4);
                        this.val.innerHTML = title.length > char ? title.toString().substr(0, char) + "&hellip;" : title;
                        this.val.title = title;
                        
                        if (this.addObj) {
                            if (!add) {
                                this.addObj.style.display = "none";
                            }
                            else {
                                this.addObj.style.display = "";
                            }
                            this.addObj.innerHTML = add || "";
                        }
                    }
                    this.value = value;
                }
                return this;
            }.bind(c);
            //Устанавливаем значение по умолчанию
            c.set(_v[0], c.value);
            //TODO: проверить работоспособность
            c.getValue = function () {
                if (this.other) {
                    return this.other.value;
                }
                return (this.value != null ? this.value : "undefined");

            }.bind(c);
            c.optionByValue = function (val) {
                /// <summary>
                /// Получаем пункт списка по значению
                /// </summary>
                var a = $(this.down).find("a").toArray();
                for (var i = 0; i < a.length; i++) {
                    if ($(a[i]).attr("value") == val) return a[i];
                }
                return null;
            }.bind(c);
            c.setValue = function (val, change) {
                var opt = $(this.down).find("a").toArray();
                for (var i = 0; i < opt.length; i++) {
                    if (opt[i].value != null && opt[i].value.toString() == val.toString()) {
                        this.set(opt[i].innerHTML.toString(), opt[i].value.toString());
                        if (change == true) this.change();
                        break;
                    }
                }
            }.bind(c);
        }
    }
}

$(document.body).ready($CS.Init);
