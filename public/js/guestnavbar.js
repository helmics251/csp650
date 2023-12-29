$(document).ready(function () {
  var path = window.location.pathname;

  // Find the anchor element with href matching the current path
  var $matchedLink = $(`[href="${path}"]`);

  // If the matched anchor element is found, add CSS styles to its closest .nav-link parent
  if ($matchedLink.length > 0) {
    $matchedLink.closest(".nav-link.guestnavbar").css({
      "color": "#FFFFFF",
      "font-weight": "500",
    });
  }

  $("#guestnavbarhome, #guestnavbarsignup, #guestnavbarlogin").each(
    function () {
      $(this).data("original-bold", $(this).css("font-weight"));
      //console.log($(this).data('original-bold'));
    }
  );

  $("#guestnavbarhome, #guestnavbarsignup, #guestnavbarlogin").hover(
    // On mouse enter
    function () {
      if ($(this).data("original-bold") !== "500") {
        $(this).data("original-color", $(this).css("color"));
        $(this).css("color", "#000000");
      }
    },
    // On mouse leave
    function () {
      if ($(this).data("original-bold") !== "500") {
        $(this).css("color", $(this).data("original-color"));
      }
    }
  );
});
