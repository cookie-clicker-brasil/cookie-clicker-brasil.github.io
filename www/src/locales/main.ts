import i18next, { type TFunction } from "i18next";
import $ from "jquery";

import pt from "@lang/pt-BR.ts";
import en from "@lang/en-US.ts";
import es from "@lang/es-ES.ts";
  
  i18next.init({
    lng: "pt-BR",
    debug: false,
    preload: true,
    resources: {
      "en-US": {
        translation: en,
      },
      "pt-BR": {
        translation: pt,
      },
      "es-ES": {
        translation: es,
      },
    },
    interpolation: {
      escapeValue: false,
      useRawValueToEscape: true,
    },
    load: "all",
  });


let lang: TFunction | undefined;

switch ("en-US" || window.navigator.language) {
  case "pt-BR":
    lang = i18next.getFixedT("pt-BR");
    break;
  case "en-US":
    lang = i18next.getFixedT("en-US");
    break;
  case "es-ES":
    lang = i18next.getFixedT("en-US");
    break;
  default:
    lang = i18next.getFixedT("en-US");
}

$("[i18next-id]").each(function () {
  const id = $(this).attr("i18next-id");
  $(this).text(lang(id));
});

export { lang };
