///<reference path="engine.js" />

/*  
    Обратите внимание!!!
    Данная версия global.js не совместима с проектами, разработанными раньше 01.07.2012
    Совсем не совместима. Даже чуть-чуть работать не будет. 
    Не пытайтесь подключить его к Вашим старым проектам. Может вызвать зомби-апокалипсис.
*/

if (window["console"] == null) {
    window["console"] = {
        _logged: [],
        log: function (obj) {
            console._logged.push({ obj: obj, date: new Date() });
        }
    }
}

Date.fromString = function (str) {
    var res = new Date(); var datetime = str.split(" "); if (datetime.length == 1) { datetime.push("00:00"); }
    var date = datetime[0].split("."); if (date.length != 3) { new Date(); }
    else { res.setFullYear(Number(date[2]), Number(date[1]) - 1, Number(date[0])); }
    return res;
};
Date.prototype.clone = function () {
    var _wd = new Date(); _wd.setFullYear(this.getFullYear(), this.getMonth(), this.getDate());
    return _wd;
};

Date.prototype.dateIsEqual = function (date) {
    /// <summary>
    /// Сравнение с датой по дню, месяцу и году
    /// </summary>
    return this.getFullYear() == date.getFullYear()
           && date.getMonth() == this.getMonth()
           && this.getDate() == date.getDate();
};

Date.isLeapYear = function (year) {
    if (isNaN(year) || year < 1 || year > 9999)
        throw new Error("year");

    return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
};
Date.daysInMonth = function (year, month) {
    var daysNonLeap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var daysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (isNaN(year) || year < 1 || year > 9999)
        throw new Error("year");
    if (isNaN(month) || month < 0 || month > 11)
        throw new Error("month");

    return (Date.isLeapYear(year) ? daysLeap[month] : daysNonLeap[month]);
};
Date.prototype.addMilliseconds = function (value) {
    if (isNaN(value))
        throw new Error("value must be a Number");

    return new Date(this.getTime() + value);
};
Date.prototype.addSeconds = function (value) {
    return this.addMilliseconds(value * 1000);
};
Date.prototype.addMinutes = function (value) {
    return this.addSeconds(value * 60);
};
Date.prototype.addHours = function (value) {
    return this.addMinutes(value * 60);
};
Date.prototype.addDays = function (value) {
    return this.addHours(value * 24);
};
Date.prototype.addMonths = function (value) {
    if (isNaN(value))
        throw new Error("value must be a Number");

    var date = new Date();
    var day = this.getDate();
    var month = this.getMonth() + parseInt(value % 12, 10);
    var year = this.getFullYear() + parseInt(value / 12, 10);

    if (month < 0) {
        month = 12 + month;
        year--;
    }
    else if (month > 11) {
        month = month - 12;
        year++;
    }

    var maxday = Date.daysInMonth(year, month);

    if (day > maxday)
        day = maxday;

    date.setTime(this.getTime());
    date.setFullYear(year);
    date.setMonth(month);
    date.setDate(day);

    return date;
};
Date.prototype.addYears = function (value) {
    return this.addMonths(value * 12);
};
Date.prototype.date = function () {
    var d = new Date();

    d.setFullYear(this.getFullYear());
    d.setMonth(this.getMonth());
    d.setDate(this.getDate());

    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
};
Date.prototype.shortHours = function () {
    /// <summary>Получить часы в 12-часовом представлении (Number)</summary>
    return this.getHours() > 12 ? this.getHours() - 12 : this.getHours();
};
Date.prototype.toFormatString = function (str) {
    var d = this;
    if (!str || !d)
        return "";
    var gd = $g.date;
    return str.replace(/dddd/gi, gd.daysOfWeek[d.getDay()])
              .replace(/ddd/gi, gd.daysOfWeekShort[d.getDay()])
              .replace(/dd/gi, d.getDate().norm(2))
              .replace(/d/gi, d.getDate().norm(1))
              .replace(/^MMMM/g, gd.monthEntity[d.getMonth() + 1])
              .replace(/MMMM/g, gd.month[d.getMonth() + 1])
              .replace(/MMM/g, gd.shortMonth[d.getMonth() + 1])
              .replace(/MM/g, (d.getMonth() + 1).norm(2))
              .replace(/M/g, (d.getMonth() + 1).norm(1))
              .replace(/yyyy/gi, d.getFullYear().norm(4))
              .replace(/yy/gi, d.getFullYear().toString().substring(2, 4))
              .replace(/mm/g, d.getMinutes().norm(2))
              .replace(/m/g, d.getMinutes().toString())
              .replace(/HH/g, d.getHours().norm(2))
              .replace(/H/g, d.getHours().norm(1))
              .replace(/hh/g, d.shortHours().norm(2))
              .replace(/h/g, d.shortHours().norm(1))
              .replace(/ss/g, d.getSeconds().norm(2))
              .replace(/s/g, d.getSeconds().norm(1));
};

Number.prototype.nearest = function (a, b) {
    ///<summary>Близжайшее число</summary>
    var mid = (b - a) / 2 + a;
    return this > mid ? b : a;
}

Number.prototype.norm = function (c) {
    /// <summary>Строковое представление числа определенной длинны. Если число короче, представляются нули</summary>
    /// <param name="c" type="Object">длинна числа</param>
    var a = this.toString();
    var _c = c == null ? 2 : c;
    while (a.length < _c)
        a = "0" + a;
    return a;
}
// закончили упражнение
Array.from = function (iterable) {
    /// <summary>Создает массив из перечисляемого объекта. В случае, если у объекта есть метод "toArray", возвращает результат его выполнения. Пустые значениея не сохраняются</summary>
    if (!iterable) return [];
    if (iterable.toArray) {
        return iterable.toArray();
    } else {
        var results = [];
        for (var i in iterable) {
            if (iterable[i] != null) {
                results.push(iterable[i]);
            }
        }
        return results;
    }
};
Array.prototype.select = function (templ, not) {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if ($g.object.conformsTemplate(this[i], templ, not)) {
            arr.push(this[i]);
        }
    }
    return arr;
};
Array.prototype.tryGet = function (index, path, def) {
    /// <summary>
    /// Возвращает или свойство элемента массива или значение по умолчанию
    /// </summary>
    /// <param name="index">Индекс элемента</param>
    /// <param name="path">Путь к свойству (через разделитель '.' )</param>
    /// <param name="def">Значение по умолчанию</param>
    /// <returns>Элемент массива (если path - undefined) или значение свойства path элемента [index]</returns>
    if (this.length < index) {
        return def || null;
    }
    if (!path) {
        return this[index];
    }
    return $g.tryGet(this[index], path, def);
}
//BIND
if (!Function.prototype.bind) {
    Function.prototype.bind = function (obj) {
        /// <summary>Возвращает функцию, this которой определен как "obj". Остальные параметры передаются в новую функцию последовательно при ее вызове</summary>
        var method = this, args = Array.from(arguments), obj = args.shift();
        temp = function () {
            return method.apply(obj, args.concat(Array.from(arguments)));
        };
        return temp;
    }
}
Array.prototype.summ = function (prop) {
    var a = 0;
    for (var i = 0; i < this.length; i++) {
        a += prop ? Number($g.tryGet(this[i], prop, 0)) : Number(this[i]);
    }
    return a;
}
Array.prototype.applyFunc = function (func) {
    /// <summary>Применяет функцию func к каждому элементу из массива</summary>
    if (Function.prototype.isPrototypeOf(func)) {
        for (var i = 0; i < this.length; i++) {
            func(this[i]);
        }
    }
    return this;
};
Array.prototype.execFunc = function (func) {
    /// <summary>Вызывает функцию с именем func у каждого элемента с параметрами, поданными после func через запятую</summary>
    for (var i = 0; i < this.length; i++) {
        var a = this[i];
        if (a[func] && Function.prototype.isPrototypeOf(a[func])) {
            a[func].apply(a, Array.prototype.slice.call(arguments, 1));
        }
    }
};
Array.prototype.convert = function (func) {
    /// <summary>Возвращает массив, элементы которого являются результатом применения функции func к соответствующим элементам исходного массива</summary>
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr.push(func(this[i]));
    }
    return arr;
}
Array.prototype.unique = function (eqparams) {
    /// <summary>Возвращает новый массив, состоящий из уникальных элментов данного</summary>
    var result = [];
    for (var i = 0; i < this.length; i++) {
        if (!result.contains(this[i], eqparams))
            result.push(this[i]);
    }
    return result;
}
Array.prototype.contains = function (value, eqparams) {
    /// <summary>Возвращает true, если значение есть в массиве</summary>
    if (!eqparams)
        return this.indexOf(value) > -1;
    //Если передан массив свойств для сравнения, сравниваем по нему
    for (var i = 0; i < this.length; i++) {
        if ($g.object.equals(this[i], value, eqparams)) {
            return true;
        }
    }
    return false;
};
Array.prototype.remove = function (value) {
    /// <summary>Удаляет значение из массива</summary>
    for (var i = 0; i < this.length; i++)
        if (this[i] == value)
            this.splice(i, 1);
}
Array.prototype.formatJoin = function (sep, format, def) {
    /// <summary>
    /// Формат должен содержать в себе ссылки на свойтва вида: ##prop.subprop##
    /// </summary>
    var res = [];
    var format = Function.prototype.isPrototypeOf(format) ? format : function () {
        return this.format;
    }.bind({ format: format });
    for (var i = 0; i < this.length; i++) {
        var _f = format(this, i);
        var props = [];
        var ex = /##(.+?)##/gi;
        var m = ex.exec(_f);
        while (m) {
            if (m.length > 1) {
                props.push(m[1]);
            }
            m = ex.exec(_f);
        }

        var s = _f + "";
        for (var p = 0; p < props.length; p++) {
            var prop = $g.tryGet(this[i], props[p], def);
            s = s.replace(new RegExp("##" + props[p] + "##", "gi"), prop);
        }
        res.push(s);
    }
    var sep = sep || "";
    return res.join(sep);
};
Array.prototype.xjoin = function (sep, prop) {
    /// <summary>Склеивает массив по разделителю "sep". Для склейки берет свойство "prop" у каждого объекта массива. Вложенность "prop" определяется точкой.</summary>
    var str = [];
    for (var i = 0; i < this.length; i++) {
        var props = prop.split(".");
        var v = null;
        for (var j = 0; j < props.length; j++) {
            if (v == null)
                v = this[i][props[j]];
            else
                v = v[props[j]];
            if (Function.prototype.isPrototypeOf(v))
                v = v();
            if (v == null)
                break;
        }
        if (v != null)
            str.push(v);
    }
    return str.join(sep);
}
Array.prototype.foreach = function (func) {
    /// <summary>
    /// Выполняет функцию func(c,i) для все элементов массива. 
    /// c - элемент, i - индекс. Возвращает массив после обработки
    /// </summary>
    var a = [];
    if (func) {
        for (var i = 0; i < this.length; i++) {
            a.push(func(this[i], i));
        }
    }
    return a;
}
Array.prototype.getNonEmpty = function () {
    /// <summary>
    /// Получает массив непустых элементов из заданного
    /// </summary>
    var _arr = [];
    for (var i = 0; i < this.length; i++) {
        if (this[i])
            _arr.push(this[i]);
    }
    return _arr;
}
Array.prototype.without = function (arr) {
    /// <summary>
    /// Массив элементов
    /// </summary>
    var ret = new Array();
    var _arr = Array.prototype.isPrototypeOf(arr) ? arr : [arr];
    for (var i = 0; i < this.length; i++)
        if (!_arr.contains(this[i]))
            ret.push(this[i]);
    return ret;
}
Array.prototype.indexOf = function (item) {
    for (var i = 0; i < this.length; ++i)
        if (this[i] == item)
            return i;

    return -1;
};
Array.prototype.merge = function (arr, eqparams) {
    /// <summary>
    /// Объединение двух массивов. 
    /// Старый массив не меняет.
    /// Добавляет только уникальные элементы второго массива
    /// </summary>
    var first = [];
    for (var i = 0; i < this.length; i++) {
        first.push(this[i]);
    }
    var arr = Array.prototype.isPrototypeOf(arr) ? arr : [arr];
    for (var i = 0; i < arr.length; i++) {
        if (first.contains(arr[i], eqparams))
            continue;
        first.push(arr[i]);
    }
    return first;
};
Array.prototype.extract = function (to, save) {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr.push($g.object.extract(this[i], to, save, i));
    };
    return arr;
};
Array.prototype.clone = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr.push(this[i]);
    }
    return arr;
};
Array.prototype.populate = function (add, notReplace) {
    /// <summary>Добавляет к полям элементов поля из add</summary>
    for (var i = 0; i < this.length; i++) {
        $g.object.populate(this[i], add, notReplace);
    }
    return this;
};
Array.prototype.mergeElements = function (add, notReplace) {
    /// <summary>Создает новый массив с элементами снабженными полями из add</summary>
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr.push($g.object.merge(this[i], add, notReplace));
    }
    return arr;
};
Number.prototype.roundTo = function (n) {
    /// <summary>
    /// Округляет до n знаков после запятой
    /// </summary>
    /// <param name="n">Количество знаков после запятой</param>
    /// <returns type="">Округленное значение</returns>
    return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
};
Number.prototype.roundToString = function (n, sep, decSep, addZero) {
    /// <summary>Округляет число до n знаков после запятой и возвращает его строковое представление с разделителем sep</summary>
    var _v = this.roundTo(n);
    var sep = sep || ",";
    var _vs = _v.toString().replace(/[\.\,]+/gi, sep);
    if (decSep) {
        var s = _vs.split(sep);
        var _s = s[0];
        var min = /^-/gi.test(_s);
        _s = _s.replace(/^-/gi, "");
        var _a = [];
        while (_s.length > 3) {
            _a.push(_s.substr(_s.length - 3, 3));
            _s = _s.substr(0, _s.length - 3);
        }
        _a.push((min ? "-" : "") + _s);
        _a.reverse();
        _vs = _a.join(decSep) + (s.length > 1 ? sep + s[1] : "");
    }
    if (addZero && n > 0) {
        var _s = _vs.split(sep);
        if (_s.length == 1) {
            _vs += ",";
            for (var i = 0; i < n; i++) {
                _vs += "0";
            }
        }
        else {
            var _n = n - _s[1].length;
            if (_n > 0) {
                for (var i = 0; i < _n; i++) {
                    _vs += "0";
                }
            }
        }
    }
    return _vs;

};
Number.prototype.formatTo = function (format, def) {
    /// <summary>
    /// Форматирует на основе строки 
    /// </summary>
    /// <param name="format">например: {0:00.00}$ </param>
    /// <returns type="">В случае примера: 12,30$</returns>
    var parsed = $g.number.parseFormat(format, def);
    return parsed.templ.replace(/\#/gi, (this * parsed.mult).roundToString(parsed.after, parsed.sep, parsed.decSep));
};

String.prototype.trim = function () {
    /// <summary>Вырезает пробелы в конце и в начале переданной строки</summary>
    return this.replace(/^\s+|\s+$/gi, "");
};
String.prototype.despace = function () {
    /// <summary>Вырезает множественные пробелы, а так же пробелы в начале и конце строки</summary>
    return this.replace(/\s+/gi, " ").trim();
};
String.prototype.firstUpper = function () {
    /// <summary>Возвращает строку с первой заглавной буквой</summary>
    if (this.length > 0) {
        return this.substring(0, 1).toUpperCase() + (this.length > 1 ? this.substring(1, this.length) : "");
    }
    return this;
};

(function ($) {
    $.fn.replaceClass = function (a, b) {
        /// <summary>Замена класса. (Последовательный вызов удаления (все включения) и добавления.)</summary>
        var a = Array.prototype.isPrototypeOf(a) ? a : [a];
        for (var i = 0; i < a.length; i++) {
            while (this.hasClass(a[i])) {
                this.removeClass(a[i]);
            }
        }
        this.addClass(b);
        return this;
    }
    $.fn.hasOneClass = function (css) {
        /// <summary>Есть ли хоть один из классов</summary>
        var classes = Array.prototype.isPrototypeOf(css) ? css : css.despace().split(" ");
        for (var i = 0; i < classes.length; i++) {
            if (this.hasClass(classes[i]))
                return true;
        }
        return false;

    }

    $.fn.pxcss = function (prop) {
        /// <summary>Возвращает числовое значение свойства. Для свойств заданых в пикселях.</summary>
        return Number(this.css(prop).replace(/px/gi, "")) || 0;
    }

    $.fn.selectText = function (start, end) {
        /// <summary>Выделить текст в диапозоне [start, end]</summary>
        var o = this.get(0);
        if (o.createTextRange) {
            var r = o.createTextRange();
            r.select();
            r.moveStart('character', start);
            r.moveEnd('character', -(r.text.length - end + start));
            r.select();
        }
        else {
            o.setSelectionRange(start, end);
        }
        return this;
    }
    $.fn.disableSelection = function () {
        /// <summary>Запретить выделение</summary>
        this.each(function () {
            this.onselectstart = function () { return false; };
            this.unselectable = "on";
            $(this).css('user-select', 'none');
            $(this).css('-o-user-select', 'none');
            $(this).css('-moz-user-select', 'none');
            $(this).css('-khtml-user-select', 'none');
            $(this).css('-webkit-user-select', 'none');
        });
        return this;
    };
    $.fn.enableSelection = function () {
        /// <summary>Разрешить выделение</summary>
        this.each(function (i, el) {
            el.onselectstart = null;
            el.unselectable = "off";
            $(el).css('user-select', '');
            $(el).css('-o-user-select', '');
            $(el).css('-moz-user-select', '');
            $(el).css('-khtml-user-select', '');
            $(el).css('-webkit-user-select', '');
        });
        return this;
    };
    $.fn.tremble = function (range) {
        /// <summary>Анимация "тряски" блока; rage задает горизонтальное смещение</summary>
        var range = range || 8;
        this.each(function (i, el) {
            var a = $(el).pxcss("marginLeft") - this.r;
            var b = a + this.r * 2;
            var c = b - this.r;

            $(el).animate({ "marginLeft": a + "px" }, { duration: 20 })
                 .animate({ "marginLeft": b + "px" }, { duration: 20 })
                 .animate({ "marginLeft": c + "px" }, { duration: 20 });
        }.bind({ r: range }));
        return this;
    };
    $.fn.rotateTremble = function (range, complete) {
        var a = { deg: 0 };
        var w = this.get(0);
        //Формируем очередь анимаций
        $(a).animate({ deg: range || 5 }, {
            queue: "rotation-shake",
            duration: 50,
            step: function (now) {
                $(this.w).css({ transform: "rotate(" + now + "deg)" });
            }.bind({ w: w })
        }).animate({ deg: -(range || 5) }, {
            queue: "rotation-shake",
            duration: 100,
            step: function (now) {
                $(this.w).css({ transform: "rotate(" + now + "deg)" });
            }.bind({ w: w })
        }).animate({ deg: 0 }, {
            queue: "rotation-shake",
            duration: 50,
            step: function (now) {
                $(this.w).css({ transform: "rotate(" + now + "deg)" });
            }.bind({ w: w }),
            complete: function () {
                //Вызываем переданную функцию по завершении анимации
                if (this.comp)
                    this.comp();
            }.bind({ comp: complete })
        }).dequeue("rotation-shake"); //Вызываем анимацию
    };
    $.fn.contentHeight = function () {
        /// <summary>Сумарная высота вложенных элементов, не включая спозиционированные абсолютно</summary>
        var el = this.get(0);
        var cn = $(el).children().toArray();

        var h = 0;
        for (var i = 0; i < cn.length; i++) {
            var e = $(cn[i]);
            if (!["absolute", "fixed"].contains(e.css("position")) && !["none"].contains(e.css("display")) && !e.hasClass("__g-nocount")) {
                h += cn[i].offsetHeight;
                h += e.pxcss("margin-top");
                h += e.pxcss("margin-bottom");
            }
        }
        return h;
    };
    $.fn.parentScroll = function () {
        /// <summary>Получаем сумарную величину вертикальной прокрутки родительских элементов</summary>
        var el = this.get(0);
        var p = el.parentNode;
        var sc = 0;
        while (p) {
            sc += $(p).scrollTop();
            p = p.parentNode;
        }
        return sc;
    };
    $.fn.fullHeight = function () {
        /// <summary>Получаем полную занимаемую высоту</summary>
        var el = this.get(0);
        var h = el.offsetHeight;
        h += $(el).pxcss("margin-top");
        h += $(el).pxcss("margin-bottom");
        return h;
    };
    $.fn.fullInnerWidth = function () {
        var el = this.get(0);
        var ow = el.offsetWidth
            - $(el).pxcss("padding-left")
            - $(el).pxcss("padding-right")
            - $(el).pxcss("border-left-width")
            - $(el).pxcss("border-right-width");
        return ow;
    };
    $.fn.outHtml = function () {
        /// <summary>Получаем оутер html</summary>
        var el = this.get(0);
        var h = $(el).wrap("<div></div>").parent().html();
        $(el).unwrap();
        return h;
    };
})(jQuery);

var $g = {
    _suid: 0,
    suid: function (prefix, postfix) {
        /// <summary>Уникальный идентификатор в пределах страницы</summary>
        return (prefix || "") + (++$g._suid) + (postfix || "");
    },
    _init: function () {
        $(document).on("mousemove", $g.mouse.track);
        if (navigator.userAgent.indexOf("Trident") > -1) {
            $("html").addClass("ie");
        }
    },
    date: {
        shortMonth: ["", "янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
        month: ["", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        monthEntity: ["", "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
        daysOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        daysOfWeekShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    },
    sort: {
        alfa: function (a, b, prop) {
            /// <summary>Функция для сортировки по алфавиту. Возвращает 0 если ровно, 1 если а > b, -1 если b > a</summary>
            var av = !prop ? a : $g.tryGet(a, prop, "");
            var bv = !prop ? b : $g.tryGet(b, prop, "");
            for (var i = 0; i < av.length; i++) {
                if (bv.length <= i)
                    return 1;
                if (av.charCodeAt(i) != bv.charCodeAt(i)) {
                    return av.charCodeAt(i) - bv.charCodeAt(i);
                }
            }
            return 0;
        }
    },
    cookie:
	{
	    clear: function (name) {
	        $g.cookie.set(name, "", -1);
	    },
	    set: function (name, value, days, path, domain, secure) {
	        var expire = new Date();
	        if (days) { expire.setTime(expire.getTime() + (days * 24 * 60 * 60 * 1000)); }
	        document.cookie = name + "=" + escape(value) +
					((days) ? "; expires=" + expire.toGMTString() : "") +
					((path) ? "; path=" + path : "") +
					((domain) ? "; domain=" + domain : "") +
					((secure) ? "; secure" : "");
	    },
	    get: function (name) {
	        var cookie = " " + document.cookie;
	        var search = " " + name + "=";
	        var setStr = null;
	        var offset = 0;
	        var end = 0;
	        if (cookie.length > 0) {
	            offset = cookie.indexOf(search);
	            if (offset != -1) {
	                offset += search.length;
	                end = cookie.indexOf(";", offset)
	                if (end == -1) {
	                    end = cookie.length;
	                }
	                setStr = unescape(cookie.substring(offset, end));
	            }
	        }
	        return (setStr);
	    }
	},
    mouse: {
        //Трэкинг мышки
        x: 0,
        y: 0,
        track: function (e) {
            $g.mouse.x = e.pageX;
            $g.mouse.y = e.pageY;
        }
    },
    object: {
        conformsTemplate: function (obj, templ, not) {
            /// <summary>
            ///    Проверяет на полное соответсткие всем полям шаблона (пока полное)
            ///    TODO: Проверку на больше, меньше, like
            /// </summary>
            var conforms = true;
            if (["string", "number", "boolean"].contains(typeof (templ))) {
                return not ? obj != templ : obj == templ;
            }
            if (typeof (obj) == "number") {
                if (not) {
                    if (templ.min != null && templ.min > obj)
                        return true;
                    if (templ.max != null && templ.max < obj)
                        return true;
                }
                if (templ.min != null && obj < templ.min)
                    return false;
                if (templ.max != null && obj > templ.max)
                    return false;

                return true;
            }
            //RegExp
            if (RegExp.prototype.isPrototypeOf(templ)) {
                //Копируем регекс
                var a = templ.toString().replace(/^\/(.+?)\/(.{2})$/gi, "$1:::$2").split(":::");
                var exp = new RegExp(a[0], a[1]);
                //console.log(exp);
                return not ? !exp.test(obj) : exp.test(obj);
            }
            for (var i in templ) {
                if (obj[i] == null) {
                    conforms = !!not;
                    break;
                }

                conforms = $g.object.conformsTemplate(obj[i], templ[i], not);
                if (!conforms)
                    break;

            }
            return conforms;
        },
        extract: function (obj, to, save, __i) {
            var res = {};
            if (typeof (to) == "string") {
                res = $g.tryGet(obj, to);
            }
            else {
                for (var i in to) {
                    var _v = $g.tryGet(obj, i);
                    if (_v != null) {
                        $g.trySet(res, to[i], _v);
                    }
                    if (__i != null && i == "_i") {
                        $g.trySet(res, to[i], __i);
                    }
                    if (i == "_v") {
                        $g.trySet(res, to[i], obj);
                    }
                }
            }
            if (save) {
                for (var i in obj) {
                    if (!to[i]) {
                        res[i] = obj[i];
                    }
                }
            }
            return res;
        },
        equals: function (obj, obj2, params) {
            /// <summary>Сравнивает два объекта на осонве массива свойств</summary>
            var eq = true;
            var params = Array.prototype.isPrototypeOf(params) ? params : [params];
            for (var i = 0; i < params.length; i++) {
                eq = eq && obj[params[i]] == obj2[params[i]];
            }
            return eq;
        },
        populate: function (obj, add, notReplace) {
            /// <summary>Добавляет в obj поля из add. Если notReplace - непустые поля obj не заменяет полями из add</summary>
            for (var i in add) {
                if (!notReplace || (notReplace && obj[i]))
                    obj[i] = add[i];
            }
            return obj;
        },
        merge: function (obj, add, notReplace) {
            /// <summary>Создает объект из полей из obj и add. Если notReplace - не заменяет полями из add</summary>
            var res = {};
            $g.object.populate(res, obj);
            $g.object.populate(res, add, notReplace);
            return res;
        },
        without: function (obj, props) {
            /// <summary>Возвращает новый объект со всеми полями obj, не указанными в props</summary>
            var res = {};
            for (var i in obj) {
                if (!props.contains(i)) {
                    res[i] = obj[i];
                }
            }
            return res;
        }
    },
    number: {
        format: function (number, constantPart, one, two, many) {
            var abs = Math.floor(Math.abs(number));
            if (abs > 100)
                abs %= 100;

            if ((abs == 1) || (abs > 20 && (abs % 10 == 1)))
                return [constantPart, one].join("");
            if ((abs > 1 && abs < 5) || (abs % 10 >= 2) && (abs % 10 <= 4) && (abs > 20))
                return [constantPart, two].join("");

            return [constantPart, many].join("");
        },
        parseFormat: function (format, def) {
            var parsed = new _format();//{ mult: 1, sep: ",", decSep: "&nbsp;", templ: "#", after: 5, percents: false };
            if (def) {
                for (var i in def) {
                    parsed[i] = def[i];
                }
            }
            var f = /\{0\:(.+?)\}/gi.exec(format);
            parsed.mult = 1;
            if (format.indexOf("%") > -1) {
                parsed.mult = 100; //В случае, если формат задан в процентах, умножаем число на 100
                parsed.percents = true;
            }
            if (f && f.length > 1) {
                var n = 0;
                var m = f[1].split(".");
                if (m.length > 1) {
                    n = m[1].length;
                }
                parsed.decSep = m[0].indexOf(",") > 0 ? "," : "&nbsp;";
                parsed.after = n;
                parsed.templ = format.replace(/\{0\:(.+?)\}/gi, "#");
                //return format.replace(/\{0\:(.+?)\}/gi, (this * multiplier).roundToString(n, ",", decSep));
            }
            if (/\{0\}/gi.test(format)) {
                parsed.templ = format.replace(/\{0\}/gi, "#");
                //return format.replace(/\{0\}/gi, (this * multiplier).roundToString(99, ",", decSep));
            }
            return parsed;
        }
    },
    tryGet: function (obj, path, def) {
        if (obj != null && path) {
            var path = path.split(".");
            for (var i = 0; i < path.length; i++) {
                obj = obj[path[i]];
                if (obj == null)
                    return def;
            }
            return obj;
        }
        return def;
    },
    trySet: function (obj, path, val) {
        var path = path.split(".");
        var _o = obj;
        for (var i = 0; i < path.length; i++) {
            if (_o[path[i]] == null)
                _o[path[i]] = {};
            if (i == path.length - 1)
                _o[path[i]] = val == null ? {} : val;
            _o = _o[path[i]];
        }
        return obj;
    },
    baseAuth: function (user, password) {
        var tok = user + ':' + password;
        var hash = Base64.encode(tok);
        return "Basic " + hash;
    },
    _syncParams: {},
    addSync: function (param) {
        $g._syncParams[param] = true;
    },
    removeSync: function (param) {
        $g._syncParams[param] = null;
    },
    sync: function (params, ok) {
        for (var i = 0; i < params.length; i++) {
            if ($g._syncParams[params[i]])
                return;
        }
        if (ok)
            ok();
    },
    wcf: {
        globalErrorHandler: function (req) {
            if (req._message == "Сессия работы с сервером прервана в результате непредвиденной ошибки!") {
                if ($routing)
                    $routing._returnUrl = "";//$routing.currentState;
                if (win)
                    win.hide();
                $g.wcf.invoke($e.server, "ClearSession", [], function (req) {
                    document.location = "#login";
                }, function (err) {
                    document.location = "#login";
                }, new _consoleLoader("ClearSession"), true);
            }
        },
        globalSuccessHandler: function (req) {
        },
        invoke: function (proxy, method, params, success, error, loader, noGlobalHandler) {
            /// <summary>Обертка над вызовом прокси методов AJAX WCF. 
            /// params - массив объектов в порядке их перечисления в объявлении серверного метода.</summary>
            if (proxy && method && proxy[method]) {
                //Если подали лоадер типа _preloader, выполнять будем его, ну или заглушку в противном случае
                var loader = (loader && _preloader.prototype.isPrototypeOf(loader))
                    ? loader : new _globalLoader();
                //Показываем прелоадер
                loader.show();
                //Создаем заглушку для метода успешного выполнения
                var suc = function (req) {
                    if (this.success)
                        this.success(req);
                    if (this.loader)
                        this.loader.hide(req);
                }.bind({ success: success, loader: loader });
                //Создаем заглушку для метода неудачного выполнения
                var err = function (req) {
                    //Глобальный обработчик ошибки
                    if ($g.wcf.globalErrorHandler && !this.noGlobalHandler)
                        $g.wcf.globalErrorHandler(req);
                    if (this.loader)
                        this.loader.hide(req);
                    if (this.error)
                        this.error(req);

                }.bind({ error: error, loader: loader, noGlobalHandler: noGlobalHandler });
                //Вызываем метод с заданными параметрами и заглушками обработчиков
                return proxy[method].apply(proxy, params.concat([suc, err]));
            }
            return null;
        }
    }
}

function _format(mult, sep, decSep, after, percents) {
    this.mult = mult || 1,
    this.sep = sep || ",";
    this.decSep = decSep || "&nbsp;";
    this.after = after || 5;
    this.percents = percents || false;

    this.toICU = function () {
        var a = "";
        for (var i = 0; i < this.after; i++) {
            a += "#";
        }
        return "#,###" + (a.length > 0 ? "." : "") + a + (this.percents ? "%" : "");
    }.bind(this);

}

$(document).on("ready", $g._init);

function _preloader(show, hide) {
    this.show = show || function () {
    }.bind(this);
    this.hide = hide || function () {
    }.bind(this);
}
function _consoleLoader(method) {
    this.method = method;
    this.show = function () {
        console.log("Start loading " + this.method);
    }.bind(this);
    this.hide = function () {
        console.log("Stop loading " + this.method);
    }.bind(this);
}
_consoleLoader.prototype = new _preloader();

var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}