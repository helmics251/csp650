$(document).ready(function () {
  function checkViewport() {
    if ($(window).width() > 768) {
      // Adjust 768 to the width that determines PC view
      $(".navbar-brand.logo span").replaceWith(function () {
        return $("<h2>").html($(this).html());
      });

    } else {
      $(".navbar-brand.logo h2").replaceWith(function () {
        return $("<span>").html($(this).html());
      });

    }
  }

  // Check on page load
  checkViewport();

  // Check on window resize
  $(window).resize(checkViewport);
  
});
