$(() => {
  $("splash-screen").on("click", () => {
    $("#splash")[0].volume = 0.1;
    $("#splash")[0].play();
    setTimeout(() => {
      $("splash-screen").remove();
      $("start-screen").show();
    }, 1000);
  });

  $("start-screen button").on("click", () => $("#click")[0].play());

  $("#play").on("click", () => {
    
   // $("start-screen").remove();
  // $("ui").show();
  });

});
