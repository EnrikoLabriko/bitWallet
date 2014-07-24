/// <reference path="global.js"/>
/// <reference path="ctrl.js"/>
/// <reference path="drag.js"/>
if ($CS && $CS.ctrls) {
    $CS.ctrls["discrete-slider"] = function (c) {
        c.move = c.$().append("<div class='move'></div>").find(".move").get(0);
        c.steps = c.$().attr("steps").split(",").convert(parseFloat);
        c.value = parseFloat(c.$().attr("value") || "0");
        c.currentStep = 0;
        c.syncStep = function () {

            for (var i = 0; i < this.steps.length; i++) {
                if (this.steps[i] == this.value) {
                    this.currentStep = i;
                    return i;
                }
            }
            this.currentStep = 0;
            return 0;
        }.bind(c);
        
        c.width = c.$().width();
        c.wsteps = [];
        for (var i = 0; i < c.steps.length; i++) {
            var a = c.steps[i] * c.width;
            c.wsteps.push(a);
        }

        c.posByVal = function (val) {
            for (var i = 0; i < this.steps.length; i++) {
                if (this.steps[i] == val) {
                    return this.wsteps[i];
                }
            }
        }.bind(c);

        $drag.add($dslider.drag(c));
        c.changeHandler = function () {
            var s = this.syncStep();
            for (var i = 0; i < this.steps.length; i++) {
                this.$().removeClass("step-" + i);
            }
            this.$().addClass("step-" + s);
        }.bind(c);
        c.setValue = function (val) {
            var res = this.posByVal(val);
            if (res <= 0) {
                res = 0;
            }
            else if (res >= this.width - this.move.offsetWidth) {
                res = this.width - this.move.offsetWidth;
            }
            else {
                res -= this.move.offsetWidth / 2;
            }
            $(this.move).css("margin-left", res + "px");

            this.value = val;

            this.fireEvent("on-change");
        }.bind(c);
        c.addEvent("on-change", c.changeHandler);
        c.setValue(c.value);
    }
}
var $dslider = {
    drag: function (c) {
        var res = {
            obj: c.move,
            c: c
        };
        res.start = function (e) {
            $(document.body).disableSelection();
            this.c.width = this.c.$().width();
            this.c.wsteps = [];
            for (var i = 0; i < this.c.steps.length; i++) {
                var a = this.c.steps[i] * this.c.width;
                this.c.wsteps.push(a);
            }
            this.c.startml = $(this.c.move).pxcss("margin-left");
            //сортируем по возрастанию
            this.c.wsteps.sort(function (a, b) { return a > b ? 1 : -1; });
        }.bind(res);
        res.stop = function (e, delta) {
            $(document.body).enableSelection();

            this.c.startml = 0;
            var cp = $(this.c.move).pxcss("margin-left") + this.c.move.offsetWidth / 2;
            var resi = 0;
            var res = 0;
            for (var i = 0; i < this.c.wsteps.length; i++) {
                var a = this.c.wsteps[i];
                if (a > cp) {
                    res = cp.nearest(res, a);
                    if (a == res) {
                        resi = i;
                    }
                    break;
                }
                resi = i;
                res = a;
            }
            c.setValue(this.c.steps[resi]);

        }.bind(res);
        res.move = function (e, delta) {

            var res = this.c.startml + delta.x;
            if (res < 0) {
                res = 0;
            }
            if (res > this.c.width - this.c.move.offsetWidth) {
                res = this.c.width - this.c.move.offsetWidth;
            }
            $(this.c.move).css("margin-left", res + "px");
        }.bind(res);
        console.log(res);
        return res;
    }
}