var $page = {
    init: function () {

    },
    showRestore: function () {
        var cont = $("#restore-password-container").get(0);
        var shad = $(cont).next();
        shad.css("display", "");
        $(cont).animate({ height: "257px" }, {
            duration: 300, complete: function () {
                $("#restore-password-container").css("overflow-y", "");
            }
        });
    },
    hideRestore: function () {
        var cont = $("#restore-password-container").css("overflow-y", "hidden").get(0);
        
        $(cont).animate({ height: "0px" }, {
            duration: 300, complete: function () {
                var shad = $(this).next();
                shad.css("display", "none");
            }.bind(cont)
        });
    },
    toggleRestore: function () {
        var cont = $("#restore-password-container");
        if (cont.css("height") == "0px") {
            $page.showRestore();
        }
        else {
            $page.hideRestore();
        }
    }
}
$(document).ready($page.init);