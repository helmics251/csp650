$(document).ready(function () {
  let path = window.location.pathname;

  // Find the anchor element with href matching the current path
  let $matchedLink = $(`[href="${path}"]`);

  // If the matched anchor element is found, add CSS styles to its closest .nav-link parent
  if ($matchedLink.length > 0) {
    $matchedLink.closest(".nav-link.studentnavbar").css({
      color: "#FFFFFF",
      "font-weight": "500",
    });

    if ( path === "/studentsetting") {
      $(".nav-link.studentnavbar.profilestudentname").css({
        color: "#FFFFFF",
        "font-weight": "500",
      });
    }
  }
  
  $("#studenthomenav, .profilestudentname").each(
    function () {
      $(this).data("original-bold", $(this).css("font-weight"));
      //console.log($(this).data('original-bold'));
    }
  );

  $("#studenthomenav, .profilestudentname").hover(
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
