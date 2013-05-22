/*
 * Varicon
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

/* this: [$, _, DSS, jekt, Pasta, CLOS]  */

var tech_news_json = "http://pipes.yahoo.com/pipes/pipe.run?_id=7eaefd6f25d7c11fd00c7c78b0628882&_render=json";

//var tsu_json = "http://133.242.154.120:3000/api/tab/tab_main/20/0";


$(function () {
    $.getJSON(tech_news_json, function (j) {
        main(j/*.data*/ .value.items);
    });
});

function main (news) {
    "use strict";

    /* Images to use for the slideshow */
    var slides = [
        "images/ha_001.jpg",
        "images/ha_012.jpg",
        "images/ka_010.jpg",
        "images/ka_019.jpg",
        "images/ka_035.jpg",
        "images/so_035.jpg"
    ];

    var SLIDE_TIMEOUT = 15000;
    var NEWS_TIMEOUT  = 20000;


    function inc_circular (l, i) {
        /* Circular incrementation */
        return  i >= l ? 0 : i + 1;
    }

    /* Model */
    var Model = _.module(
        {},

        function next_slide (st) {
            return {slide_index: inc_circular(slides.length, st.slide_index)};
        },

        function next_news (st) {
            return {news_index: inc_circular(news.length, st.news_index)};
        },

        function drag_start (st, $el) {
            return {dragging: $el};
        },

        function drag_end (st) {
            return {dragging: null};
        },

        function mouse_move (st, m) {
            return {mouse: {x: m.x,y: m.y}};
        },

        function stop_news_timer (st) {
            return {news_timer: clearInterval(st.news_timer)};
        },

        function start_news_timer (st, d, signal) {
            return {news_timer: setInterval(signal('next_news'), SLIDE_TIMEOUT)};
        },

        function start_slide_timer (st, d, signal) {
            return {slide_timer: setInterval(signal('next_slide'), SLIDE_TIMEOUT)};
        }
    );


    var UI = _.module(
        {},

        function change_slide (i) {
            $("#slide").animate({opacity: 0}, 1000, function () {
                $("#slide").css({backgroundImage: "url(" + slides[i] + ")"});
                $("#slide").animate({opacity: 1}, 1000);
            });
        },

        function change_news (i) {
            $(".news").animate({opacity: 0}, 1000, function () {
                $(this).remove();
            });  //remove previous
            var title = news[i].title;
            var $news = $('<a class="news" target="_blank">')
                    .attr({ "data-index": i,
                            "href": news[i].link })
                    .text(title)
                    .css({left: $(window).width()})
                    .appendTo("#news-wrap");

            $news.animate({left: 0 + "em"}, NEWS_TIMEOUT - 2000, "linear");

            $(".news-title").text(news[i].title);
            $(".news-text").html(news[i].text);
        },

        function move_el (el, x, y) {
            el.css({left: x, top: y});
        }
    );


    var View = _.module(
        {},

        function slide_index (UI, st) {
            UI.change_slide(st.slide_index);
        },

        function news_index (UI, st) {
            UI.change_news(st.slide_index);
        },

        function mouse (UI, st) {
            if (st.dragging)
                UI.move_el(st.dragging, st.mouse.x, st.mouse.y);
        }
    );


    var initial_state = {
        slide_index: 0,
        news_index:  0,
        mouse:       {el: null, x:0, y:0},
        slide_timer: null,
        news_timer:  null
    };


    var pasta = Pasta(Model, UI, View, initial_state);

    pasta.signal('start_news_timer')();
    pasta.signal('start_slide_timer')();

    /* Controllers */
    $("#news-wrap").hover(pasta.signal('stop_news_timer'),
                          pasta.signal('start_news_timer'));

    $("#news-wrap").mousewheel(function (e, delta) {
        var $nc = $("#news-content");
        $nc.scrollTop($nc.scrollTop() - delta);
    });



    $(".draggable").on("mousedown", pasta.signal('drag_start', function (e) {
        var t = e.currentTarget;
        return $(t);
    }));

    $("body").on("mouseup", pasta.signal('drag_end'));

    $("body").on("mousemove", pasta.signal('mouse_move', function (e) {
        return {x: e.clientX - 50, y: e.clientY - 5};
    }));

    $(".draggable").dblclick(function (e) {
        e.preventDefault();
        $(this).find(".content").slideToggle();
    });
}


DSS({
    "#music-player,#twitter::mouseover": {
        "opacity": 1
    },
    "#music-player,#twitter,#news-content::mouseout": {
        "opacity": 0.5
    },
    "#news-content::mouseover": {
        "opacity": 0.9
    },
    "#news-wrap::mouseover": {
        fn: function () {
            $("#news-content").css("visibility", "visible");
        }
    },
    "#news-wrap::mouseout": {
        fn: function () {
            $("#news-content").css("visibility", "hidden");
        }
    }
});