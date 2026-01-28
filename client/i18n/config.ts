import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en_common from "../locales/en/common.json";
import en_auth from "../locales/en/auth.json";
import en_trips from "../locales/en/trips.json";
import en_itinerary from "../locales/en/itinerary.json";

import es_common from "../locales/es/common.json";
import es_auth from "../locales/es/auth.json";
import es_trips from "../locales/es/trips.json";
import es_itinerary from "../locales/es/itinerary.json";

import pt_common from "../locales/pt/common.json";
import pt_auth from "../locales/pt/auth.json";
import pt_trips from "../locales/pt/trips.json";
import pt_itinerary from "../locales/pt/itinerary.json";

import fr_common from "../locales/fr/common.json";
import fr_auth from "../locales/fr/auth.json";
import fr_trips from "../locales/fr/trips.json";
import fr_itinerary from "../locales/fr/itinerary.json";

const resources = {
  en: {
    common: en_common,
    auth: en_auth,
    trips: en_trips,
    itinerary: en_itinerary,
  },
  es: {
    common: es_common,
    auth: es_auth,
    trips: es_trips,
    itinerary: es_itinerary,
  },
  pt: {
    common: pt_common,
    auth: pt_auth,
    trips: pt_trips,
    itinerary: pt_itinerary,
  },
  fr: {
    common: fr_common,
    auth: fr_auth,
    trips: fr_trips,
    itinerary: fr_itinerary,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  ns: ["common", "auth", "trips", "itinerary"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
