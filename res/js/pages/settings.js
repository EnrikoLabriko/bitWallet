/// <reference path="../jquery-1.10.2.min.js"/>
var $page = {
    init: function () {
        $CS.init(document.body);
        $(".btn-show-pwd").on("click", $page.togglePwd);
    },
    togglePwd: function (e) {
        var a = e.target;
        var next = $(a).next().get(0);
        if (next.tagName.toLowerCase() == "input") {
            next.type = next.type == "text" ? "password" : "text";
            $(a).toggleClass("hide");
        }
    }
}
$(document).ready($page.init);