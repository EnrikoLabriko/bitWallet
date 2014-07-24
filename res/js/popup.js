var table = {
    init: function () {
        table.popup();
        table.menu();
        table.activeLine();
    },
    popup: function () {
        var helpPlate = $('body').find('.table-help-plate')
        $(".main-table tbody").mouseenter(function (e) {
            helpPlate.css('top', e.pageY + 10 + 'px')
            helpPlate.css('left', e.pageX + 20 + 'px')
            helpPlate.css('display', 'block')
        })
        $(".main-table tbody").mouseleave(function () {
            helpPlate.css('display', 'none')
        })
    },
    menu: function () {
        var tableMenu = $('.table-menu')
        var title = $('head').find('title')
        var b = $(title).text();
        $('.main-table tr:not(.thead)').dblclick(function (e) {
            $(document.body).disableSelection();
            var offset = $(this).offset();
            tableMenu.css('top', offset.top + 45 + 'px')
            tableMenu.css('left', e.pageX - 225 + 'px')
            $(tableMenu).removeClass('hidden');
        })
    },
    activeLine: function () {
        $(".tline:not(.thead), .vert-border").mouseenter(function () {
            $(this).addClass('active-line');
        })
        $(".tline:not(.thead)").mouseleave(function () {
            $(this).removeClass('active-line');
        })
    }
};

var inputMenu = {
    init: function () {
        //inputMenu.toggle();
    },
    toggle: function () {
        $('.input, .input-choose-wallet').click(function (event) {
            $('.input-menu').toggleClass('hidden');
            event.stopPropagation();
        })
    }
};

var closeOnClick = {
    init: function () {
        closeOnClick.setMenuCloseOnClick();
    },
    setMenuCloseOnClick: function () {
        $('html').click(function () {
            $(document.body).enableSelection();
            $('.input-menu, .table-menu, .table-help-plate').addClass('hidden');
        });
        $('.input-menu, .table-menu, .table-help-plate').click(function (event) {
            event.stopPropagation();
        });
    }
};

$(document).ready(table.init);
$(document).ready(inputMenu.init);
$(document).ready(closeOnClick.init);