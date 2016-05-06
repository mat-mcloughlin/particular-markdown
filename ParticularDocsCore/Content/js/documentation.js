
function momentify(obj) {
    var content = obj.text();
    var m = moment(content);
    if (!m.isValid()) {
        return;
    }
    obj.attr('title', content);
    obj.text(m.fromNow());
}

function getDescriptionContent() {
    var metas = document.getElementsByTagName('meta');

    for (i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute("name") == "description") {
            return metas[i].getAttribute("content");
        }
    }

    return "";
};

function getTitleContent() {
    var title = document.getElementsByTagName("title");

    if (title.length != 0) {
        return title[0].innerHTML;
    }

    return "";
};

//feedbacklite config
var fbl = { 'campaign': { 'id': 618, 'type': 3, 'size': 1, 'position': 7, 'tab': 1, 'control': 1 } };


function stopPropagation(elements) {
    elements.click(function (e) {
        e.stopPropagation();
    });
};

function addToggle(elements) {
    elements.click(function () {
        var parent = $(this).parent();
        parent.children('ul.nav').toggle(300);
    });
};


$(document).ready(function (e) {
    $('.time-ago').each(function () {
        momentify($(this));
    });

    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active');
    });

    $('div.panel-body>ul.nav>li').one("click", function () {
        var topicObj = $(this);
        if (topicObj.data('loaded')) {
            return;
        }
        var topicUrl = topicObj.data('articles');

        $.ajax({
            url: "/menu/" + topicUrl + "/articles"
        })
        .success(function (response) {
            topicObj.data('loaded', true);
            topicObj.html(topicObj.html() + response);
            topicObj.children('ul.nav').show(300);
            addToggle(topicObj.children('label'));
            stopPropagation(topicObj.children('a'));
        });
    });

    addToggle($('div.panel-collapse label'));
    stopPropagation($('div.panel-body a'));
    stopPropagation($('.editSnippet'));


    $(document).scroll(function () {

        if (window.location.hash) {
            var hash = window.location.hash;
            var hashName = hash.substring(1, hash.length);
            var element;

            //if element has this id then scroll to it
            if ($(hash).length !== 0) {
                element = $(hash);
            }
                //catch cases of links that use anchor name
            else if ($('a[name="' + hashName + '"]').length !== 0) {
                //just use the first one in case there are multiples
                element = $('a[name="' + hashName + '"]:first');
            }

            //if we have a target then go to it
            if (element != undefined) {
                var offset = element.offset();

                window.scrollTo(0, offset.top - 50);
            }
            //unbind the scroll event
            $(document).unbind("scroll");
        }

    });

});