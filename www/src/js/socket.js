/**
 * Countdown container element.
 * @type {jQuery}
 */
const $countdown = $("#countdown-container");

/**
 * Text element displaying the countdown.
 * @type {jQuery}
 */
const countdown_text = $("#countdown");

/**
 * Element displaying the current room code.
 * @type {jQuery}
 */
const code = $("#current_code");

/**
 * Element displaying the number of players online.
 * @type {jQuery}
 */
const online = $("#online");

/**
 * Socket.io connection to the server.
 * @type {Socket}
 */
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

/**
 * Event listener for socket connection. Sends a message to rejoin the room with player info.
 */
socket.on("connect", () => {
  socket.emit("rejoin_room", {
    room_player: Cookies.get('nickname'),
    room_code: Cookies.get('code'),
  });
});

/**
 * Event listener for the "leave room" button. Emits a "leave_room" event and resets the UI.
 */
$("#leave_room, #leave_room_2").on("click", () => {
  console.log(true);
  socket.emit("leave_room", {
    room_code: Cookies.get('code'),
    room_player: Cookies.get('nickname')
  });
  
  $("#ranking").hide();
  $(".room-code").hide();
  $(".waiting-room").hide();
  $("game").hide();
  $("#start-screen").show();
});

/**
 * Event listener for room form submission. Emits a "room" event to the server with room details.
 * @param {Event} e - The event object.
 */
$('#form_room').on('submit', (e) => {
  e.preventDefault();

  const $nickname = $('#nickname').val();
  const $code = $('#room_code').val();
  const $time = $('#game_time').val();
  
  Cookies.set('nickname', $nickname);

  socket.emit("room", {
    room_code: $code, 
    room_time: $time || 3, 
    room_player: $nickname
  });
});

/**
 * Event listener for the "update_room" event. Updates UI based on room details.
 * @param {Object} param0 - The object containing room details.
 * @param {string} param0.room_player - The nickname of the player.
 * @param {Object} param0.room - The room object.
 */
socket.on("update_room", ({ room_player, room }) => {
  if (room.owner !== Cookies.get('nickname')) {
    $("#start_game").hide();
  }

  $("#splash-screen").hide();
  $("#start-screen").hide();
  $("ui").show();
  $('#gameModal').modal('hide');

  Cookies.set('code', room.code);
  code.text(room.code);
  online.text(room.players.length);
});

/**
 * Event listener for the "count_down" event. Updates the countdown display.
 * @param {Object} param0 - The object containing countdown information.
 * @param {number} param0.countdown - The countdown value.
 */
socket.on("count_down", ({ countdown }) => {
  $(".room-code").hide();
  $(".waiting-room").hide();
  $("#countdown-container").show();

  if (countdown > 0) {
    countdown_text.text(countdown);
  } else {
    countdown_text.text("GO!");

    setTimeout(() => {
      $(".room-code").show();
      $("#countdown-container").hide();
      $("#game").show();
      $(".game-time").show();
    }, 1000);
  }
});

/**
 * Event listener for the "start_game" button. Emits a "start_game" event to the server.
 */
$("#start_game").on("click", () => {
  socket.emit("start_game", {
    room_code: Cookies.get('code'),
  });
});

/**
 * Event listener for the "timer" event. Updates the timer display with the remaining game time.
 * @param {Object} param0 - The object containing the remaining game time.
 * @param {number} param0.time_game - The remaining game time in seconds.
 */
socket.on("timer", ({ time_game }) => $("#timer").text(time_game));

/**
 * Event listener for the "game_end" event. Displays the ranking after the game ends.
 * @param {Object} param0 - The object containing the game ranking.
 * @param {Array} param0.ranking - An array of player objects with ranking information.
 */
socket.on("game_end", ({ ranking }) => {
  $(".room-code").hide();
  $("#game").hide();
  $(".game-time").hide();
  
  $("#ranking").show();
  $("#ranking-list").empty();

  ranking.forEach((player, index) => {
    $("#ranking-list").append(`
      <li class="${index === 0 ? 'new' : ''}">
        <span><b>#${player.rank}</b> ${player.room_player} - ${player.cookies} </span>
      </li>
    `);
  });

  $("#ranking").fadeIn();
});
