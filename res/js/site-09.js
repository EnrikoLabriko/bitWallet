var checkbox = {
    init: function () {
        checkbox.toggle();
    },
    toggle: function () {
        $('.checkbox').click(function() {
            $(this).toggleClass('checked');
        })
    }
};

$(document).ready(checkbox.init);