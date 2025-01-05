import { Server } from 'socket.io';
import { 
  $generate_code,
  $generate_uuid
} from './functions/functions.js';

const io = new Server();
const ROOMS = {};

io.on("connection", (socket) => {
 
   // room 
  socket.on("room", ({ room_code, room_time, room_player }) => {
   
    // Gera um código para a sala, se necessário
    if (!room_code) {
        const new_room_code = $generate_code(); // Certifique-se de que $generate_code está definida
        room_code = new_room_code;
        ROOMS[room_code] = {
            code: room_code,
            date: new Date(),
            players: [],
            owner: room_player,
            time: room_time || 1,
            state: "waiting"
        };
    }

    // Seleciona a sala pelo código
    const room = ROOMS[room_code];
    
    // Verifica se a sala existe
    if (!room) {
        console.log(`O "${room_player}" tentou entrar em uma sala "${room_code}" que não existe!`);
        return;
    }

    // Verifica se a sala está no estado "waiting"
    if (room.state !== "waiting") {
        console.log(`O "${room_player}" tentou entrar em uma sala "${room_code}" que está com status: ${room.state}`);
        return;
    }

    // Verifica se já existe um jogador com o mesmo nickname na sala
    const existingPlayer = room.players.find(player => player.room_player === room_player);
    if (existingPlayer) {
        console.log("Já existe um jogador com este nick na sala!");
        return;
    }

    // Adiciona o socket à sala
    socket.join(room_code);
    
    // Registra o jogador na sala
    room.players.push({
        id: $generate_uuid(), // Certifique-se de que $generate_uuid está definida
        date: new Date(),
        socket: socket.id,
        player_date: { 
            cps: 0, 
            cookies: 0
        },
        room_player
    });

    // Envia uma atualização da sala para todos os jogadores
    io.to(room_code).emit("update_room", { room_player, room });

    // Log para depuração
    console.log(`Jogador "${room_player}" entrou na sala "${room_code}".`);
    console.log(`Estado da sala:`, room);
});
 
   // leave_room
  socket.on("leave_room", ({ room_code, room_player }) => {
    
    const room = ROOMS[room_code];
    
    // Verifica se a sala existe
    if (!room) return;

    // Remove o jogador da sala
    room.players = room.players.filter(player => player.room_player !== room_player);

    // Se a sala ficar vazia, remove-a
    if (room.players.length === 0) {
        delete ROOMS[room_code];
        console.log(`Sala ${room_code} foi deletada.`);
    } else if (room.owner === room_player) {
        // Atualiza o dono da sala, se necessário
        room.owner = room.players[0]?.room_player || null;
        console.log(`Novo dono da sala ${room_code}: ${room.owner}`);
    }

    // Remove o socket da sala
    socket.leave(room_code);
    
    // Envia uma atualização para todos os membros restantes da sala
    io.to(room_code).emit("update_room", { room_player, room });

    // Log para fins de depuração
    console.log(`Socket ${socket.id} (${room_player}) saiu da sala ${room_code}`);
    
});

   // rejoin_room
  socket.on('rejoin_room', ({
    room_player, room_code
  }) => {
     
     // select code room 
    const room = ROOMS[room_code];
    
    if (!room) return;

     // trocar o socket id
    room.players.forEach(x => {
     if (x.room_player === room_player) {
         x.socket = socket.id;
      };
    });
       
     // enter the code room 
    socket.join(room_code);

     // send the update to room.
    io.to(room_code).emit("update_room", { room_player, room });
    
  });
  
  socket.on("start_game", ({ room_code }) => {
    
    const room = ROOMS[room_code];
    room.state = "in_game";

    let countdown = 1; // Contagem regressiva de 10 segundos
    const countdownInterval = setInterval(() => {
        io.to(room_code).emit("count_down", { countdown });

        if (countdown === 0) {
            clearInterval(countdownInterval);

            // Envia o início do jogo
            io.to(room_code).emit("game_start");

            // Inicia o temporizador do jogo
            let time_game = room.time * 1; // Converte minutos em segundos (60 ta em 1 para teste)
            
            const gameInterval = setInterval(() => {
                time_game--;

                // Atualiza o tempo restante
                io.to(room_code).emit("timer", { time_game });

                if (time_game === 0) {
                    clearInterval(gameInterval);

                    // Finaliza o jogo e envia o ranking
                    const ranking = room.players
                        .sort((a, b) => b.player_date.cookies - a.player_date.cookies) // Ordena por cookies
                        .map((player, index) => ({
                            rank: index + 1,
                            room_player: player.room_player,
                            cookies: player.player_date.cookies
                        }));

                    // Atualiza o estado da sala e envia o ranking
                    room.state = "finished";
                    io.to(room_code).emit("game_end", { ranking });

                    console.log(`Jogo na sala ${room_code} finalizado! Ranking:`, ranking);
                }
            }, 1000); // Atualiza a cada segundo
        }

        countdown--;
    }, 1000); // Atualiza a cada segundo
});

});

io.listen(3000);