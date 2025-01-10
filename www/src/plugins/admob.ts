import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";
import $ from "jquery";

AdMob.initialize()
  .then(() => {
    console.log("AdMob initialized.");
  })
  .catch((err) => {
    console.error("Error initializing AdMob: ", err.message);
  });

function $show_banner() {
  AdMob.showBanner({
    adId: "ca-app-pub-6690516270288705/1043067086",
    adSize: BannerAdSize.FULL_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    // isTesting: true
    // npa: true
  })
    .then(() => {
      return console.log("Banner displayed.");
    })
    .catch((err) => {
      return console.error("Error displaying banner: ", err.message);
    });
}

function $remove_banner() {
  AdMob.removeBanner()
    .then(() => {
      return console.log("Banner hidden successfully.");
    })
    .catch((err) => {
      return console.error("Error hiding banner: ", err.message);
    });
}

function $show_video() {
  const adId = "ca-app-pub-6690516270288705/7898187843";
  AdMob.prepareRewardVideoAd({ adId })
    .then(() => {
      console.log("Rewarded interstitial prepared.");
      return AdMob.showRewardVideoAd();
    })
    .then(() => {
      console.log("Rewarded interstitial displayed successfully.");
    })
    .catch((err) => {
      console.error("Error displaying rewarded interstitial: ", err.message);
    });
}

$("#form_button").on("click", () => $show_banner());

$("#start_game").on("click", () => $remove_banner());

$("#game_exit").on("click", () => $show_video());
