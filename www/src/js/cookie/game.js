$('.cookie').on('click', function (e) {
  
  const a = 1;
  
  const $effect = $(`<div class="click-effect">+${a}</div>`);

  const offset = $(this).offset();
  const X = e.pageX - offset.left;
  const Y = e.pageY - offset.top;

  $effect.css({
    left: X + 'px',
    top: Y + 'px',
    position: 'absolute',
  });

  $(this).append($effect);

  $effect
    .animate(
      {
        top: '-=2.5rem',
        opacity: 1,
        fontSize: '1.5rem',
      },
      300
    )
    .animate(
      {
        opacity: 0,
      },
      200,
      function () {
        $(this).remove();
      }
    );
});