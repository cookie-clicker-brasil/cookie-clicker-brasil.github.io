// @lang/es-ES
const translation = {
  general: {
    cookies: "Galletas",
    seconds: "Segundos",
    timeLabel: "Tiempo:",
    start: "¡IR!",
    message_now: "Ahora",
  },
  splashScreen: {
    splashClick: "Haz clic...",
  },
  menu: {
    cookieTitle: "Cookie",
    playButton: "Jugar",
    settings: "Configuraciones",
  },
  ranking: {
    rankingTitle: "Clasificación",
    roomCode: "Código de la Sala:",
    waiting: "Esperando...",
    startButton: "Comenzar",
    leaveButton: "Salir",
  },
  game: {
    nicknameLabel: "Apodo",
    gameOptionLabel: "Elige una opción:",
    randomRoom: "Únete a una sala al azar",
    createRoom: "Crear una sala",
    joinRoom: "Unirse a una sala",
    roomCodeLabel: "Código de la Sala",
    gameTimeLabel: "Tiempo de Juego (en segundos)",
  },
  room: {
    no_room_player: "¡Parece que no has definido tu apodo!",
    no_room_time: "¡Parece que no has definido el tiempo de la sala!",
    time_check:
      "¡El tiempo de la sala debe ser mayor a 10 segundos y menor o igual a 10 minutos!",
    no_room_code: "¡Parece que no has añadido el código de la sala!",
    no_connected: "¡Parece que te desconectaste del juego Cookie!",
  },

  modal: {
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
  err_message: {
  ROOM_NOT_FOUND: "¡La sala no fue encontrada!",
  ROOM_STATE_ERROR_IN_GAME: "El partido ya ha comenzado.",
  ROOM_STATE_ERROR_FINISHED: "El partido ya termino",
  PLAYER_EXISTS: "Ya existe un jugador con ese nombre en la sala.",
  INVALID_COOKIES: "Datos de cookies inválidos recibidos.",
  ROOM_CODE_NOT_FOUND: "No se encontró el código de la sala."
}
};

export default translation;