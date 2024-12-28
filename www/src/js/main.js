$(() => {
  $("splash-screen").on("click", () => {
    $("#splash")[0].play();
    setTimeout(() => {
      $("splash-screen").remove();
      $("ui").show();
    }, 1000);
  });
});