var toggleCurrencyIcon = {
    init: function () {
        toggleCurrencyIcon.toggle();
    },
    toggle: function () {
        $('.currency-icon').click(function (e) {
            var par = $(e.target).parent();
        	par.find('.active-icon').toggleClass('active-icon');
            $(this).toggleClass('active-icon');
        })
    }
};

$(document).ready(toggleCurrencyIcon.init);