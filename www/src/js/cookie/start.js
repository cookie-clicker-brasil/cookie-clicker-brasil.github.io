
  // Display a message with boostrap toast 
function $message(text) {

  $('#message').html('');

  setTimeout(() => {
    $('#message').html('');
  }, 10000);
  
  return $('#message').html(`
    <div class="toast fade show">
    <div class="toast-header">
    <img style="width: 10%;" src="./src/img/icon.webp" class="rounded me-2">
    <strong class="me-auto">Cookie</strong>
    <small>Agora</small>
    <button type="button" style="box-shadow: none; outline: none;" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body"> ${text}</div></div>`);
    
};

 // connect the server to the socket
/*
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});
*/

const socket = io("https://socket-hj1h.onrender.com", {
  transports: ["websocket", "polling"],
});

let name = null;
let code = null;

 // form for creating the room 
$('#form_button').on('click', () => {
 
  const option = $('input[name="option_game"]:checked').val();
  const room_player = $('#room_name').val();
  const room_code = $('#room_code').val();
  const room_time = $('#room_time').val();
 
  if (!room_player) {
    return $message('<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não definiu seu nickname!');
  }; 
  
  if (option === "create" && !room_time) {
    return $message('<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não definiu o tempo da sala!');
  }; 
  
  if (option === "join" && !room_code) {
    return $message('<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não adicionou o código da sala');
  }; 
  
  if (!socket.connected) {
    return $message('<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você foi desconectado do jogo Cookie!');
  }; 
  
  socket.emit("room", { 
    room_code, room_time, room_player
  });
  
  name = room_player;
    
});

socket.on("err_socket", ({ message }) => {
  $message(message)
});

socket.on("update_room", ({ 
  room_player, room
}) => {
  
  $('#room_modal').modal('hide');
  $("#start-screen").hide();
  $("ui").show();
  
  if (room.state === "waiting") {
    $(".waiting-room").show();
    $(".room-code").show();
  } else if (room.state = "in_game") {
    $("#game").show();
  };
  
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
  $("ui").hide();
  $("#ranking").hide();
  $("#start-screen").show();
});
