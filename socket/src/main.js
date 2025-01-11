import { Server } from "socket.io";

// Inicialização do servidor
const io = new Server();
const ROOMS = {};
let roomIdCounter = 0;

/**
 * Gera um identificador único para cada jogador.
 * @returns {number} O identificador gerado.
 */
function $generate_uuid() {
  roomIdCounter += 1;
  return roomIdCounter;
}

/**
 * Gera um código de sala aleatório.
 * @returns {string} O código gerado para a sala.
 */
function $generate_code() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Evento de conexão de um novo cliente.
 * @param {Socket} socket - O objeto socket que representa a conexão do cliente.
 */
io.on("connection", (socket) => {

  /**
   * Manipula a criação ou entrada de um jogador em uma sala.
   * @param {Object} data - Dados para criação ou entrada na sala.
   * @param {string} [data.room_code] - O código da sala. Se não fornecido, uma nova sala será criada.
   * @param {number} data.room_time - A duração da sala em minutos.
   * @param {string} data.room_player - O nome do jogador entrando na sala.
   * @throws {Error} Se a sala não existir ou se o jogador já estiver na sala.
   */
  socket.on("room", ({ room_code, room_time, room_player }) => {
    if (!room_code) {
      room_code = $generate_code();
      ROOMS[room_code] = {
        code: room_code,
        date: new Date(),
        players: [],
        owner: room_player,
        time: room_time || 11,
        state: "waiting",
      };
    }

    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    if (room.state !== "waiting") {
      socket.emit("err_socket", { err_socket: "ROOM_STATE_ERROR" });
      return;
    }

    if (room.players.find((player) => player.room_player === room_player)) {
      socket.emit("err_socket", { err_socket: "PLAYER_EXISTS" });
      return;
    }

    socket.join(room_code);

    room.players.push({
      id: $generate_uuid(),
      date: new Date(),
      socket: socket.id,
      player_data: { cookies: null },
      room_player,
    });

    io.to(room_code).emit("update_room", { room_player, room });
    console.log(`Player "${room_player}" joined room "${room_code}". Room state:`, room);
  });

  /**
   * Manipula a saída de um jogador de uma sala.
   * @param {Object} data - Dados para sair da sala.
   * @param {string} data.room_code - O código da sala.
   * @param {string} data.room_player - O nome do jogador que está saindo.
   * @throws {Error} Se a sala ou o jogador não forem encontrados.
   */
  socket.on("leave_room", ({ room_code, room_player }) => {
    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    room.players = room.players.filter(player => player.room_player !== room_player);

    if (room.players.length === 0) {
      delete ROOMS[room_code];
      console.log(`Room ${room_code} has been deleted.`);
    } else if (room.owner === room_player) {
      room.owner = room.players[0]?.room_player || null;
      console.log(`New owner of room ${room_code}: ${room.owner}`);
    }

    socket.leave(room_code);
    io.to(room_code).emit("update_room", { room_player, room });

    console.log(`Player ${room_player} (Socket ID: ${socket.id}) left room ${room_code}`);
  });

  /**
   * Manipula o retorno de um jogador para uma sala.
   * @param {Object} data - Dados para retornar à sala.
   * @param {string} data.room_player - O nome do jogador retornando.
   * @param {string} data.room_code - O código da sala.
   * @throws {Error} Se a sala não for encontrada ou o jogador não estiver na sala.
   */
  socket.on("rejoin_room", ({ room_player, room_code }) => {
    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    if (room.state === "finished") {
      socket.emit("err_socket", { err_socket: "ROOM_STATE_ERROR" });
      return;
    }

    const player = room.players.find(player => player.room_player === room_player);
    if (player) {
      player.socket = socket.id;
      socket.join(room_code);
      io.to(room_code).emit("update_room", { room_player, room });
      console.log(`Player "${room_player}" rejoined room "${room_code}".`);
    } else {
      socket.emit("err_socket", { err_socket: "PLAYER_NOT_FOUND" });
    }
  });

  /**
   * Inicia o jogo em uma sala.
   * @param {Object} data - Dados para iniciar o jogo.
   * @param {string} data.room_code - O código da sala.
   * @throws {Error} Se a sala não existir.
   */
  socket.on("start_game", ({ room_code }) => {
    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    room.state = "in_game";
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      io.to(room_code).emit("count_down", { countdown });

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        io.to(room_code).emit("game_start");

        let time_game = room.time * 1;
        const gameInterval = setInterval(() => {
          io.to(room_code).emit("timer", { time_game });

          if (time_game <= 0) {
            clearInterval(gameInterval);

            const ranking = room.players
              .sort((a, b) => b.player_data.cookies - a.player_data.cookies)
              .map((player, index) => ({
                rank: index + 1,
                room_player: player.room_player,
                cookies: player.player_data.cookies,
              }));

            room.state = "finished";
            io.to(room_code).emit("game_end", { ranking });

            if (room.state === "finished") {
              delete ROOMS[room_code];
              console.log(`Room ${room_code} has been deleted.`);
            }

            console.log(`Game in room "${room_code}" finished! Ranking:`, ranking);
            return;
          }

          time_game--;
        }, 1000); 
      }

      countdown--;
    }, 1000); 
  });

  /**
   * Atualiza o número de cookies de um jogador na sala.
   * @param {Object} data - Dados para atualizar os cookies.
   * @param {string} data.room_player - O nome do jogador.
   * @param {string} data.room_code - O código da sala.
   * @param {number} data.cookies - O número de cookies a ser atualizado.
   * @throws {Error} Se a sala ou o jogador não forem encontrados ou se o valor de cookies for inválido.
   */
  socket.on("update_cookies", ({ room_player, room_code, cookies }) => {
    if (typeof cookies !== "number" || cookies < 0) {
      socket.emit("err_socket", { err_socket: "INVALID_COOKIES" });
      return;
    }

    const room = ROOMS[room_code];

    if (!room) {
      socket.emit("err_socket", { err_socket: "ROOM_NOT_FOUND" });
      return;
    }

    const player = room.players.find(player => player.room_player === room_player);

    if (player) {
      player.player_data.cookies = cookies;
      console.log(`Player "${room_player}" in room "${room_code}" updated cookies to ${cookies}.`);
    } else {
      socket.emit("err_socket", { err_socket: "PLAYER_NOT_FOUND" });
    }
  });
});

// Inicia o servidor na porta 3000
io.listen(3000);
