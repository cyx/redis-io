;(function($) {

var cssPrefix = null;

if ($.browser.mozilla) cssPrefix = "moz";
  else if ($.browser.webkit) cssPrefix = "webkit";
  else if ($.browser.opera) cssPrefix = "o";

$.cssHooks["columnCount"] = {
  get: function(element, computed) {
    var browserSpecificName = "-" + cssPrefix + "-column-count";

    if (computed) {
      return $.css(element, browserSpecificName);
    }
    else {
      return element.style[browserSpecificName];
    }
  }
}

function commandReference() {
  var $groups = $("#commands nav a")

  $groups.click(function() {
    window.location.hash = this.getAttribute("href").substring(1)

    filterCommandReference()

    return false
  })
}

function filterCommandReference() {
  var $commands = $("#commands ul")

  var group = window.location.hash.substring(1)

  if (group.length == 0) {
    $commands.children().show()
    $commands.css("height", "auto")
  }
  else {
    $commands.find("li[data-group='" + group + "']").show()
    $commands.find("li[data-group!='" + group + "']").hide()
  }

  adjustCommandReference()

  var $groups = $("#commands nav a")

  $groups.removeClass("current")

  $groups.filter("[href='#" + group + "']").addClass("current")
}

function adjustCommandReference() {
  var $commands = $("#commands ul")

  $commands.css("height", "auto")

  var $command = $commands.find("> *:first")

  var commandHeight = $command.outerHeight(true)

  var containerHeight = $commands.innerHeight()

  var factor = Math.floor(containerHeight / commandHeight)

  if ((factor * $commands.css("column-count")) < $commands.children(":visible").length) factor++;

  $commands.css("height", factor * commandHeight)
}

function autolink(text) {
  return text.replace(/(https?:\/\/[-\w\.]+:?\/[\w\/_\-\.]*(\?\S+)?)/, "<a href='$1'>$1</a>");
}

function massageTweet(text) {
  text = text.replace(/^.* @\w+: /, "");

  return autolink(text);
}

function legitimate(text) {
  return !text.match(/le redis|redis le/i);
}

function buzz() {
  var $buzz = $("#buzz");

  if ($buzz.length == 0) return;

  var $ul = $buzz.find("ul");
  var count = 0;
  var limit = parseInt($buzz.attr("data-limit"));
  var page = $buzz.attr("data-page") || 1;

  $.getJSON("http://search.twitter.com/search?q=redis+-RT&lang=en&rpp=20&format=json&page=" + page + "&callback=?", function(response) {
    $.each(response.results, function() {

      // Skip if the tweet is not Redis related.
      if (!legitimate(this.text)) { return; }

      // Stop when reaching the hardcoded limit.
      if (count++ == limit) { return false; }

      $ul.append(
        "<li>" +
        "<a href='http://twitter.com/" + this.from_user + "/statuses/" + this.id_str + "' title='" + this.from_user + "'>" +
        "<img src='" + this.profile_image_url + "' alt='" + this.from_user + "' />" +
        "</a> " +
        massageTweet(this.text) +
        "</li>"
      );
    });
  });

  $buzz.find("> a.paging").click(function() {
    var $buzz = $(this).parent();
    $buzz.attr("data-page", parseInt($buzz.attr("data-page")) + 1);
    buzz();
    return false;
  });
}

$(document).ready(function() {
  commandReference()

  $(window).resize(adjustCommandReference)

  filterCommandReference()

  buzz();
})

})(jQuery);
