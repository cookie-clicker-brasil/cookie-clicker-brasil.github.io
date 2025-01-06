
$(() => {
  
   // splash-screen
  $("#splash-screen").on("click", () => {
    setTimeout(() => {
      $("#splash-screen").hide();
      $("#start-screen").show();
    }, 1000);
  });

  // add and remove add room field
  $('input[name="option_game"]').on('change', () => {
   
    $('#room_code').val("");
      
    if ($('#room_join').is(':checked')) {
      $('#code_container').show();
      $("#game_container").hide();
    } else {
      $('#code_container').hide();
      $("#game_container").show();
    };
    
  });

});