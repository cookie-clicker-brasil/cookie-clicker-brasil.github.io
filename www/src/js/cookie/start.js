const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

let name = null;
let code = null;

$('#form_button').on('click', () => {
 
  const room_player = $('#room_name').val();
  const room_code = $('#room_code').val();
  const room_time = $('#room_time').val();
 
  $('#room_modal').modal('hide');
  $("#start-screen").hide();
  
  socket.emit("room", { 
    room_code, room_time, room_player
  });
  
  name = room_player;
    
});

socket.on("update_room", ({ 
  room_player, room
}) => {
  
  $("ui").show();
  
  if (room.owner !== name) {
    $("#start_game").hide();
  };
 
  code = room.code;
  
  $("#current_code").text(room.code);
  $("#online").text(room.players.length);
  
});

$("#leave_room").on("click", () => {
  
  socket.emit("leave_room", {
    room_code: code,
    room_player: name
  });
  
  $("ui").hide();
  $("#start-screen").show();
  
});

$("#start_game").on("click", () => {
  socket.emit("start_game", {
    room_code: code,
  });
});

socket.on("count_down", ({ countdown }) => {

  $("ui").hide();
  $("#countdown-container").show();

  if (countdown > 0) {
    $("#countdown").text(countdown);
  } else {
    $("#countdown").text("GO!");

    setTimeout(() => {
      $("#countdown-container").hide();
      $(".waiting-room").hide();
      $("#game").show();
      $(".game-time").show();
      $("ui").show();
    }, 1000);
  }
});

socket.on("timer", ({ time_game }) => {
  $("#timer").text(time_game);
});

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

$("#game_exit").on("click", () => {
  return location.reload();
});