$(() => {

  $("splash-screen img").on("click", () => {
    $('#splash')[0].play();
    $("splash-screen h1").slideUp()
    $("splash-screen").slideUp(5000)
  });

});