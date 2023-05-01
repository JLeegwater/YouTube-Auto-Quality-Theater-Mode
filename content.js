const tag = document.createElement("script");
document.head.appendChild(tag);

async function waitForElement(selector, timeout = 30000) {
	console.log("Waiting for element", selector);
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const element = document.querySelector(selector);
		if (element) return element;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	return null;
}

async function clickSizeButton() {
	const sizeButton = await waitForElement(".ytp-size-button");
	if (sizeButton) {
		console.log("Theater mode button found");
		const theaterModeTitle = "Theater mode";
		if (sizeButton.getAttribute("data-title-no-tooltip") === theaterModeTitle) {
			console.log("Theater mode not active");
			sizeButton.dispatchEvent(
				new MouseEvent("click", { bubbles: true, cancelable: true })
			);
			console.log("Theater mode button clicked");
		} else {
			console.log("Theater  mode already active");
		}
	} else {
		console.log("Theater mode button not found");
	}
}

async function getPlayer() {
	const player = new YT.Player("movie_player");

	return new Promise((resolve, reject) => {
		player.addEventListener("onReady", () => {
			resolve(player);
		});

		setTimeout(() => {
			reject(null);
		}, 5000);
	});
}

// // Function to check if player is fully loaded
function isPlayerLoaded(player) {
	const videoQualityButton = player.querySelector(".ytp-settings-button");
	const sizeButton = player.querySelector(".ytp-size-button");

	return videoQualityButton && sizeButton;
}

// Function to wait for the player to be fully loaded
function waitForPlayerLoad() {
	console.log("Waiting for player to be fully loaded");
	return new Promise((resolve) => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				const player = mutation.target;
				if (isPlayerLoaded(player)) {
					observer.disconnect();
					resolve(player);
				}
			});
		});

		const player = document.querySelector("#movie_player");
		if (player && isPlayerLoaded(player)) {
			resolve(player);
		} else {
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: false,
				characterData: false,
			});
		}
	});
}

function waitForElement(selector, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();

		const checkElementExistence = () => {
			const element = document.querySelector(selector);

			if (element) {
				resolve(element);
			} else if (Date.now() - startTime > timeout) {
				reject(
					new Error(
						`Element with selector "${selector}" not found within ${timeout} ms.`
					)
				);
			} else {
				setTimeout(checkElementExistence, 100);
			}
		};

		checkElementExistence();
	});
}

async function clickElementByAttribute(attribute, value) {
	try {
		const selector = `[${attribute}="${value}"]`;
		const element = await waitForElement(selector, 2000); // Adjust the timeout if needed

		if (element) {
			element.click();
			return true;
		} else {
			console.log(`Element with ${attribute} "${value}" not found.`);
			return false;
		}
	} catch (error) {
		console.log(
			`Element with ${attribute} "${value}" not found within timeout.`
		);
		return false;
	}
}

function clickQualityMenuItem() {
	return new Promise((resolve, reject) => {
		const menuItems = document.querySelectorAll(
			".ytp-panel-menu .ytp-menuitem"
		);

		for (const menuItem of menuItems) {
			const labelDiv = menuItem.querySelector(".ytp-menuitem-label");

			if (labelDiv && labelDiv.textContent === "Quality") {
				menuItem.click();
				resolve(true);
				return;
			}
		}

		reject(new Error("Quality menu item not found."));
	});
}

function clickFirstQualityOption() {
	return new Promise((resolve, reject) => {
		const firstOption = document.querySelector(
			".ytp-quality-menu .ytp-panel-menu > :first-child"
		);

		if (firstOption) {
			firstOption.click();
			resolve(true);
		} else {
			reject(new Error("First quality option not found."));
		}
	});
}

async function clickElementsSequentially() {
	const actions = [
		{ type: "attribute", attribute: "aria-label", value: "Settings" },
		{ type: "qualityMenuItem" },
		{ type: "firstQualityOption" },
		{ type: "attribute", attribute: "title", value: "Theater mode (t)" },
		// Add other actions as needed
	];

	for (const action of actions) {
		try {
			if (action.type === "attribute") {
				await clickElementByAttribute(action.attribute, action.value);
				console.log(
					`Clicked element with ${action.attribute}: ${action.value}`
				);
			} else if (action.type === "qualityMenuItem") {
				await clickQualityMenuItem();
				console.log("Clicked Quality menu item.");
			} else if (action.type === "firstQualityOption") {
				await clickFirstQualityOption();
				console.log("Clicked first quality option.");
			}

			// Adjust the timeout duration as needed
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (error) {
			console.error(error.message);
			break;
		}
	}
}

async function runExtension() {
	console.log("Running extension!");
	waitForPlayerLoad().then(() => {
		console.log("Player is fully loaded");

		console.log("Clicked element with title: Theater mode (t)");

		clickElementsSequentially();
	});
}

window.addEventListener("yt-navigate-finish", runExtension);
