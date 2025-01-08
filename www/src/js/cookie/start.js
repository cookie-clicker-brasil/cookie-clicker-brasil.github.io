// Display a message with bootstrap toast
function $message(text) {
  $("#message").html("");

  setTimeout(() => {
    $("#message").html("");
  }, 10000);

  return $("#message").html(`
    <div class="toast fade show">
     <div class="toast-header">
     <img style="width: 10%;" src="https://i.imgur.com/EOzKknx.webp" class="rounded me-2">
     <strong class="me-auto">Cookie</strong>
     <small>Agora</small>
     <button type="button" style="box-shadow: none; outline: none;" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body"> ${text}</div></div>`);
}

/*
 // connect the server to the socket
const socket = io("http://0.0.0.0:3000", {
  transports: ["websocket", "polling"],
});
*/

const socket = io("https://socket-hj1h.onrender.com", {
  transports: ["websocket", "polling"],
});

let cookies = Number(localStorage.getItem("cookie")) || 0;

if (cookies < 0) {
  cookies = 0;
  localStorage.setItem("cookie", cookies);
}

let $cps = 0;

const $update_cps = () => {
  $("#cps").text($cps);
  $cps = 0;
};

const $update_cookies = () => {
  cookies++;
  $cps++;
  $("#click-cookie").text(`${cookies}`);
  localStorage.setItem("cookie", cookies);
  socket.emit("update_cookies", {
    room_player: localStorage.getItem("name"),
    room_code: localStorage.getItem("code"),
    cookies,
  });
};

setInterval($update_cps, 1000);

$(".cookie").on("click", function (e) {
  $update_cookies();

  const $effect = $(`<div class="click-effect">+1</div>`);

  const offset = $(this).offset();
  const X = e.pageX - offset.left;
  const Y = e.pageY - offset.top;

  $effect.css({
    left: `${X}px`,
    top: `${Y}px`,
    position: "absolute",
  });

  $(this).append($effect);

  $effect
    .animate(
      {
        top: "-=2.5rem",
        opacity: 1,
        fontSize: "1.5rem",
      },
      300,
    )
    .animate(
      {
        opacity: 0,
      },
      200,
      function () {
        $(this).remove();
      },
    );
});

/*
const socket = io("https://socket-hj1h.onrender.com", {
  transports: ["websocket", "polling"],
});*/

socket.emit("rejoin_room", {
  room_player: localStorage.getItem("name"),
  room_code: localStorage.getItem("code"),
});

if (localStorage.getItem("name")) {
  $("#room_name").val(localStorage.getItem("name"));
}

// form for creating the room
$("#form_button").on("click", () => {
  const option = $('input[name="option_game"]:checked').val();
  const room_player = $("#room_name").val();
  const room_code = $("#room_code").val();
  const room_time = $("#room_time").val();

  if (!room_player) {
    return $message(
      '<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não definiu seu nickname!',
    );
  }

  if (option === "create" && !room_time) {
    return $message(
      '<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não definiu o tempo da sala!',
    );
  }

  const time_check = parseInt(room_time, 10);
  
  if (isNaN(time_check) || time_check <= 10 || time_check > 600) {
    return $message(
      '<b><i class="fas fa-exclamation-circle"></i> Ops!</b> O tempo da sala deve ser maior que 10 segundos e menor ou igual a 10 minutos!',
    );
  }

  if (option === "join" && !room_code) {
    return $message(
      '<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você não adicionou o código da sala',
    );
  }

  if (!socket.connected) {
    return $message(
      '<b><i class="fas fa-exclamation-circle"></i> Ops!</b> Parece que você foi desconectado do jogo Cookie!',
    );
  }

  localStorage.setItem("name", room_player);

  socket.emit("room", {
    room_code,
    room_time,
    room_player,
  });

  $("#room_modal").modal("hide");
});

socket.on("err_socket", ({ message }) => {
  $message(message);
});

socket.on("update_room", ({ room_player, room }) => {
  $("#splash-screen").hide();
  $("#start-screen").hide();
  $("ui").show();

  if (room.state === "waiting") {
    $(".waiting-room").show();
    $(".room-code").show();
  } else if (room.state === "in_game") {
    $(".waiting-room").hide();
    $("#game").show();
  }

  if (room.owner === localStorage.getItem("name")) {
    $("#start_game").show();
  } else {
    $("#start_game").hide();
  }

  localStorage.setItem("code", room.code);

  $("#current_code").text(room.code);
  $("#online").text(room.players.length);
});

$("#leave_room").on("click", () => {
  socket.emit("leave_room", {
    room_code: localStorage.getItem("code"),
    room_player: localStorage.getItem("name"),
  });

  $("ui").hide();
  $("#start-screen").show();
});

$("#start_game").on("click", () => {
  cookies = 0;
  localStorage.setItem("cookie", cookies);
  socket.emit("start_game", {
    room_code: localStorage.getItem("code"),
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
  $("#cps").text("0");
  $("#click-cookie").text("0");

  cookies = 0;
  localStorage.setItem("cookie", cookies);
  localStorage.setItem("code", null);

  $(".room-code").hide();
  $("#game").hide();
  $("#ranking").show();
  $("#ranking-list").empty();

  ranking.forEach((player, index) => {
    $("#ranking-list").append(`
      <li class="${index === 0 ? "new" : ""}">
        <span><b>#${player.rank}</b> ${player.room_player} - ${player.cookies || 0} </span>
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
