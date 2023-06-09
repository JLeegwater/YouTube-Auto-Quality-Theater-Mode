const tag = document.createElement("script");
document.head.appendChild(tag);

// Function to check if player is fully loaded
function isPlayerLoaded(player) {
	const videoQualityButton = player.querySelector(".ytp-settings-button");
	const sizeButton = player.querySelector(".ytp-size-button");

	return videoQualityButton && sizeButton;
}

function handlePlayerLoad(player, timeout, observer, resolve) {
	const loaded = isPlayerLoaded(player);
	if (loaded) {
		clearTimeout(timeout);
		observer.disconnect();
		resolve(player);
	} else {
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: false,
			characterData: false,
		});
	}
}

// Function to wait for the player to be fully loaded
const waitForPlayerLoad = () => {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			observer.disconnect();
			reject(new Error("Timed out waiting for player to load"));
		}, 10000); // 10 seconds

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				const player = mutation.target;
				handlePlayerLoad(player, timeout, observer, resolve);
			});
		});

		const player = document.querySelector("#movie_player");
		if (!player) {
			return reject(new Error("Player not found"));
		}

		handlePlayerLoad(player, timeout, observer, resolve);
	});
};

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

async function clickElementByAttribute(
	{ attribute, value, altValue },
	timeout = 5000
) {
	try {
		const selector = `[${attribute}="${value}"]`;

		const element = await waitForElement(selector, timeout);

		if (!element) {
			throw new Error(`No elements found with attribute ${attribute}`);
		}

		// Check if the altValue is provided and matches the element's attribute
		if (
			altValue &&
			element.getAttribute(altValue.attribute).includes(altValue.value)
		) {
			console.log(
				`Element with attribute ${attribute}: "${value}" has altValue "${altValue}", skipping...`
			);
			return;
		}

		if (element) {
			element.click();
			console.log(`Clicked element with attribute ${attribute}: "${value}"`);
		}
	} catch (error) {
		console.error(error.message);
	}
}

// async function clickElementByAttribute(attribute, value) {
// 	try {
// 		const selector = `[${attribute}="${value}"]`;
// 		const element = await waitForElement(selector, 2000); // Adjust the timeout if needed

// 		if (element) {
// 			element.click();
// 			return true;
// 		} else {
// 			console.log(`Element with ${attribute} "${value}" not found.`);
// 			return false;
// 		}
// 	} catch (error) {
// 		console.log(
// 			`Element with ${attribute} "${value}" not found within timeout.`
// 		);
// 		return false;
// 	}
// }
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
		{
			type: "attribute",
			attribute: "aria-label",
			value: "Settings",
		},
		{ type: "qualityMenuItem" },
		{ type: "firstQualityOption" },
		{
			type: "attribute",
			attribute: "class",
			value: "ytp-size-button ytp-button",
			altValue: { attribute: "Title", value: "Default view (t)" },
		},
		// Add other actions as needed
	];

	for (const action of actions) {
		try {
			if (action.type === "attribute") {
				await clickElementByAttribute(action);
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
	console.log("Running extension!!");
	waitForPlayerLoad().then(() => {
		console.log("Player is fully loaded");
		clickElementsSequentially();
	});
}

window.addEventListener("yt-navigate-finish", runExtension);
