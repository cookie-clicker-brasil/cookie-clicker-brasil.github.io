import i18next, { type TFunction } from "i18next";
import { resources } from "@language/resources.ts";
import $ from "jquery";

i18next.init({
  lng: "pt-BR",
  debug: false,
  preload: true,
  resources,
  interpolation: {
   escapeValue: false,
   useRawValueToEscape: true,
  },
  load: "all",
});

let lang: TFunction | undefined;

switch (window.navigator.language) {
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

$('[i18next-id]').each(function() {
  const id = $(this).attr('i18next-id');
  $(this).text(lang(id));
});

export { lang };