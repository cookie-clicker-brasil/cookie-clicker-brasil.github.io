import $ from "jquery";
    
/**
 * This function runs when the document is ready.
 * It initializes interactions with the splash screen and handles the game room code visibility logic.
 */
$(() => {

  /**
   * Event handler for clicking on the splash screen.
   * Hides the splash screen and shows the start screen after a 1-second delay.
   */
  $("#splash-screen").on("click", () => {
    setTimeout(() => {
      $("#splash-screen").hide();
      $("#start-screen").show();
    }, 1000);
  });

  /**
   * Event handler for changing the game option selection (either creating a new game or joining an existing one).
   * Shows or hides the room code input field based on the user's choice.
   */
  $('input[name="option_game"]').on("change", () => {
    // Clear the room code input field
    const $room_code_input = $("#room_code") as JQuery<HTMLInputElement>;
    const $code_container = $("#code_container");
    const $game_container = $("#game_container");
    const $room_join_input = $("#room_join") as JQuery<HTMLInputElement>;

    $room_code_input.val("");

    // Toggle visibility of the room code and game containers based on the selection
    if ($room_join_input.is(":checked")) {
      $code_container.show();
      $game_container.hide();
    } else {
      $code_container.hide();
      $game_container.show();
    }
  });
});
