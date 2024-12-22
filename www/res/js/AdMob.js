const { AdMob } = window.Capacitor.Plugins;

$(document).ready(() => {
	// Initialize AdMob plugin
	AdMob.initialize()
		.then(() => {
			console.log("AdMob initialized.");
		})
		.catch((err) => {
			console.log("Error initializing AdMob: ", err.message);
		});

	// Function to show a banner ad
	function $show_banner() {
		AdMob.showBanner({
			adId: "ca-app-pub-6690516270288705/1043067086",
			adSize: "BANNER",
			position: "BOTTOM_CENTER",
			margin: 0,
		})
			.then(() => {
				// Log when the banner is displayed successfully
				return console.log("Banner displayed.");
			})
			.catch((err) => {
				// Log error if the banner fails to display
				return console.log("Error displaying banner: ", err.message);
			});
	}

	// Function to hide the banner ad
	function $hide_banner() {
		AdMob.hideBanner()
			.then(() => {
				// Log when the banner is hidden successfully
				return console.log("Banner hidden successfully.");
			})
			.catch((err) => {
				// Log error if hiding the banner fails
				return console.log("Error hiding banner: ", err.message);
			});
	}

	// Function to show a rewarded video ad
	function $show_video() {
		const adId = "ca-app-pub-6690516270288705/7898187843";
		AdMob.prepareRewardVideoAd({ adId })
			.then(() => {
				// Log when the rewarded video ad is prepared
				console.log("Rewarded interstitial prepared.");
				// Show the prepared rewarded video ad
				return AdMob.showRewardVideoAd();
			})
			.then(() => {
				// Log when the rewarded video ad is displayed successfully
				console.log("Rewarded interstitial displayed successfully.");
			})
			.catch((err) => {
				// Log error if showing the rewarded video ad fails
				console.log("Error displaying rewarded interstitial: ", err.message);
			});
	}

	// Event listener to show the banner when the button is clicked
	$("#show_banner").on("click", () => {
		return $show_banner();
	});

	// Event listener to show the video when the button is clicked
	$("#show_video").on("click", () => {
		return $show_video();
	});

	// Event listener to hide the banner when the button is clicked
	$("#hide_banner").on("click", () => {
		return $hide_banner();
	});

	// Event listener to show an interstitial ad when the button is clicked
	$("#award").on("click", () => {
		AdMob.prepareInterstitial({
			adId: "ca-app-pub-6690516270288705/8937605645",
			autoShow: false,
		})
			.then(() => {
				// Log when the interstitial ad is prepared
				console.log("Interstitial prepared.");
				// Show the prepared interstitial ad
				return AdMob.showInterstitial();
			})
			.then(() => {
				// Log when the interstitial ad is displayed successfully
				console.log("Interstitial ad displayed successfully.");
			})
			.catch((err) => {
				// Log error if showing the interstitial ad fails
				console.log("Error displaying interstitial ad: ", err.message);
			});
	});
});
