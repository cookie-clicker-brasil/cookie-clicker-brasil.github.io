$(() => {
  
   // splash-screen
  $("#splash-screen").on("click", () => {
    $("#splash")[0].volume = 0.1;
    $("#splash")[0].play();
    setTimeout(() => {
      $("#splash-screen").hide();
      $("#start-screen").show();
    }, 1000);
  });

  $("#start-screen button").on("click", () => $("#click")[0].play());

  $('input[name="option_game"]').on('change', () => {
    if ($('#room_join').is(':checked')) {
      $('#room_code').val("");
      $('#code_container').show();
      $("#game_container").hide();
    } else {
      $('#room_code').val("");
      $('#code_container').hide();
      $("#game_container").show();
    }
  });

});