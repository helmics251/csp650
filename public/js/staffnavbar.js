$(document).ready(function () {
  let path = window.location.pathname;

  // Find the anchor element with href matching the current path
  let $matchedLink = $(`[href="${path}"]`);

  // If the matched anchor element is found, add CSS styles to its closest .nav-link parent
  if ($matchedLink.length > 0) {
    $matchedLink.closest(".nav-link.staffnavbar").css({
      color: "#FFFFFF",
      "font-weight": "500",
    });

    if ( path === "/staffsetting" || path === "/report") {
      $(".nav-link.staffnavbar.profilestaffname").css({
        color: "#FFFFFF",
        "font-weight": "500",
      });
    }
  }
  
  $("#staffhomenav, #staffaddparcelnav, #staffparcellistnav, .profilestaffname").each(
    function () {
      $(this).data("original-bold", $(this).css("font-weight"));
      //console.log($(this).data('original-bold'));
    }
  );

  $("#staffhomenav, #staffaddparcelnav, #staffparcellistnav, .profilestaffname").hover(
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
