import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";
import $ from "jquery";

$(() => {

  if (window.Capacitor.getPlatform() !== "android") {
    console.log(
      `AdMob: Unsupported platform (${window.Capacitor.getPlatform()})`,
    );
    return;
  }

  AdMob.initialize()
    .then(() => {
      console.log("AdMob initialized.");
    })
    .catch((err) => {
      console.log("Error initializing AdMob: ", err.message);
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
        return console.log("Error displaying banner: ", err.message);
      });
  }

  function $hide_banner() {
    AdMob.hideBanner()
      .then(() => {
        return console.log("Banner hidden successfully.");
      })
      .catch((err) => {
        return console.log("Error hiding banner: ", err.message);
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
        console.log("Error displaying rewarded interstitial: ", err.message);
      });
  }

  function $award() {
    AdMob.prepareInterstitial({
      adId: "ca-app-pub-6690516270288705/8937605645",
    })
      .then(() => {
        console.log("Interstitial prepared.");

        return AdMob.showInterstitial();
      })
      .then(() => {
        console.log("Interstitial ad displayed successfully.");
      })
      .catch((err) => {
        console.log("Error displaying interstitial ad: ", err.message);
      });
  }

  $("#show_banner").on("click", () => {
    return $show_banner();
  });
  $("#show_video").on("click", () => {
    return $show_video();
  });

  $("#hide_banner").on("click", () => {
    return $hide_banner();
  });

  $("#award").on("click", () => {
    return $award();
  });
});
