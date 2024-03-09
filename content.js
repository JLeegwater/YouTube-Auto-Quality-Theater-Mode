const tag = document.createElement("script");
document.head.appendChild(tag);

function createObserver(callback) {
	return new MutationObserver((mutations) => {
		callback(mutations);
	});
}

function isPlayerFullyLoaded(player) {
	return (
		!!player &&
		!!player.querySelector(".ytp-settings-button") &&
		!!player.querySelector(".ytp-size-button")
	);
}

function waitForElement(selector, predicate = () => true) {
	return new Promise((resolve, reject) => {
		const observer = createObserver((mutations) => {
			const elements = document.querySelectorAll(selector);
			elements.forEach((element) => {
				console.log("Found element:", element);
				if (predicate(element)) {
					observer.disconnect();
					resolve(element);
				}
			});
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	});
}

async function clickElementByAttribute({
	attribute,
	value,
	altValue,
	optional = false,
	predicate,
}) {
	const selector = `[${attribute}="${value}"]`;
	const element = await waitForElement(selector, predicate);

	if (!element) {
		if (optional) {
			console.log(`No elements found with attribute ${attribute}`);
		} else {
			console.error(`No elements found with attribute ${attribute}`);
		}
		return;
	}

	if (
		altValue &&
		element.getAttribute(altValue.attribute).includes(altValue.value)
	) {
		console.log(
			`Element with attribute ${attribute}: "${value}" has altValue "${altValue.value}", skipping...`
		);
		return;
	}

	element.click();
	console.log(`Clicked element with attribute ${attribute}: "${value}"`);
	console.log(element);
}

function clickQualityMenuItem() {
	const menuItems = document.querySelectorAll(".ytp-panel-menu .ytp-menuitem");

	for (const menuItem of menuItems) {
		const label = menuItem.querySelector(".ytp-menuitem-label");

		if (label && label.textContent === "Quality") {
			menuItem.click();
			return Promise.resolve(true);
		}
	}

	return Promise.reject(new Error("Quality menu item not found."));
}

function clickFirstQualityOption() {
	return new Promise((resolve, reject) => {
		const firstOption = document.querySelector(
			".ytp-quality-menu .ytp-panel-menu > :first-child"
		);

		if (firstOption) {
			// Check if the firstOption contains a div with the classname of ytp-premium-label
			const premiumLabel = firstOption.querySelector(
				"div > div > span > .ytp-premium-label"
			);
			if (premiumLabel) {
				// If it does contain this item, go to the next child element
				const nextOption = firstOption.nextElementSibling;
				if (nextOption) {
					nextOption.click();
					resolve(true);
				} else {
					reject(new Error("Next quality option not found."));
				}
			} else {
				firstOption.click();
				resolve(true);
			}
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
		{
			type: "attribute",
			attribute: "id",
			value: "dismiss-button",
			optional: true,
		},

		// Add other actions as needed
	];

	for (const action of actions) {
		try {
			switch (action.type) {
				case "attribute":
					await clickElementByAttribute(action);
					break;
				case "qualityMenuItem":
					await clickQualityMenuItem();
					console.log("Clicked Quality menu item.");
					break;
				case "firstQualityOption":
					await clickFirstQualityOption();
					console.log("Clicked first quality option.");
					break;
				default:
					console.log(`Unknown action type: ${action.type}`);
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
	waitForElement("#movie_player", (player) => isPlayerFullyLoaded(player)).then(
		(player) => {
			console.log("Player is fully loaded");
			clickElementsSequentially();
		}
	);
}

window.addEventListener("yt-navigate-finish", runExtension);
