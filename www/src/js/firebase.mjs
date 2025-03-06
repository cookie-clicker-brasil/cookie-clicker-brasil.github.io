import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";

const firebase_config = {
  apiKey: "AIzaSyBLkMv2N_cnG6q-9spUj01wvxRnfWSr6XY",
  authDomain: "cookie-brasil.firebaseapp.com",
  projectId: "cookie-brasil",
  storageBucket: "cookie-brasil.firebasestorage.app",
  messagingSenderId: "202105498916",
  appId: "1:202105498916:web:d161e68c42e66c8f8997b1",
  measurementId: "G-6KZE06S4SF",
};
const app = initializeApp(firebase_config);
const analytics = getAnalytics(app);

logEvent(analytics, "app_version", {
  version: "v1.0.1",
});
