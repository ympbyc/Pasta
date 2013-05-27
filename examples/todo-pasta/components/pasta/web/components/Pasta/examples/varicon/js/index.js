/*
 * Varicon
 *
 * 2013 Minori Yamashita <ympbyc@gmail.com>
 */

/* this: [$, _, DSS, jekt, Pasta, CLOS]  */

var tech_news_json = "http://pipes.yahoo.com/pipes/pipe.run?_id=7eaefd6f25d7c11fd00c7c78b0628882&_render=json";

var flickr_recent  = "http://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=c1cc9e10eb2c1c809eb97d2be0bbb8d7&format=json&nojsoncallback=1";

//var tsu_json = "http://133.242.154.120:3000/api/tab/tab_main/20/0";


$(function () {
    $.getJSON(tech_news_json, function (j) {
        getFlickr(_.partial(main, j.value.items));
    });
});

function getFlickr (f) {
    $.getJSON(flickr_recent, function (j) {
        console.log(j);
        f(j.photos.photo);
    });
}

function main (news, slides) {
    "use strict";

    var SLIDE_TIMEOUT = 25000;
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
            return {dragging: _.Maybe.just($el)};
        },

        function drag_end (st) {
            return {dragging: _.Maybe.nothing()};
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
            var url = _.simple_template("http://farm{{farm}}.staticflickr.com/{{server}}/{{id}}_{{secret}}.jpg", slides[i]);
            $("#slide").animate({opacity: 0}, 1000, function () {
                $("#slide").css({backgroundImage: "url(" + url + ")"});
                setTimeout(function () {
                    $("#slide").animate({opacity: 1}, 1000);
                }, 1000);
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
                    .text(i + ': ' + title)
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
            UI.change_news(st.news_index);
        },

        function mouse (UI, st) {
            _.domonad(
                _.Maybe,
                st.dragging,
                function (d) {
                    UI.move_el(d, st.mouse.x, st.mouse.y);
                });
        }
    );


    var initial_state = {
        slide_index: 0,
        news_index:  0,
        mouse:       {x:0, y:0},
        dragging:    _.Maybe.nothing(),
        slide_timer: null,
        news_timer:  null
    };


    var pasta_signal = Pasta(Model, UI, View, initial_state);

    pasta_signal('start_news_timer')();
    pasta_signal('start_slide_timer')();

    /* Controllers */
    $("#news-wrap").hover(pasta_signal('stop_news_timer'),
                          pasta_signal('start_news_timer'));

    $("#news-wrap").mousewheel(function (e, delta) {
        var $nc = $("#news-content");
        $nc.scrollTop($nc.scrollTop() - delta);
    });



    $(".draggable").on("mousedown", pasta_signal('drag_start', function (e) {
        var t = e.currentTarget;
        return $(t);
    }));

    $("body").on("mouseup", pasta_signal('drag_end'));

    $("body").on("mousemove", pasta_signal('mouse_move', function (e) {
        return {x: e.clientX - 50, y: e.clientY - 5};
    }));

    $(".draggable").dblclick(function (e) {
        e.preventDefault();
        $(this).find(".content").slideToggle();
    });

    $("#fullscreen").click(function () {
        fullScreen($("#content")[0]);
    });
}


DSS({
    ".draggable::mouseover": {
        "opacity": 1
    },
    ".draggable,#news-content::mouseout": {
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


function fullScreen (elem) {
    console.log(elem);
    if (elem.requestFullscreen)
        elem.requestFullscreen();
    else if (elem.mozRequestFullScreen)
        elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen)
        elem.webkitRequestFullscreen();
    throw "Fullscreen API is unavailable on your platform";
}
