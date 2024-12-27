$(() => {
  // Splash screen animation
  $("splash-screen").on("click", () => {
    $("#splash")[0].play();

    setTimeout(() => {
      $("splash-screen").remove();
    }, 1000);
  });
});
