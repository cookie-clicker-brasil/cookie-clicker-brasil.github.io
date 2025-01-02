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

  $("start-screen button").on("click", () => $("#click")[0].play());


  $('input[name="gameOption"]').on('change', () => {
    if ($('#joinRoom').is(':checked')) {
      $('#roomCodeContainer').show();
      $("#gameTimeContainer").hide();
    } else {
      $('#roomCodeContainer').hide();
      $("#gameTimeContainer").show();
    }
  });

  // Captura os dados do formulário
  $('#gameSettingsForm').on('submit', function (e) {
    e.preventDefault();

    const nickname = $('#nickname').val();
    const gameOption = $('input[name="gameOption"]:checked').val();
    const roomCode = $('#roomCode').val();

    if (gameOption === 'join' && !roomCode) {
      alert('Por favor, insira o código da sala.');
      return;
    }

    // Processar os dados (exemplo: enviar para o backend)
    console.log({
      nickname,
      gameOption,
      roomCode: gameOption === 'join' ? roomCode : null,
    });

    // Fechar o modal após a confirmação
    $('#gameModal').modal('hide');
  });

  $("#play").on("click", () => {
    // $("start-screen").remove();
    // $("ui").show();
  });
});
