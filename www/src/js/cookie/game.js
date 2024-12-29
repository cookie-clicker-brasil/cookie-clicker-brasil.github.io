let cookies = 0;
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
