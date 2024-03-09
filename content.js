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

function waitForElement(selector, predicate = () => true, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const observer = createObserver((mutations) => {
			const elements = document.querySelectorAll(selector);
			const element = Array.from(elements).find(predicate);

			if (element) {
				observer.disconnect();
				resolve(element);
			}
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});

		setTimeout(() => {
			observer.disconnect();
			reject(new Error(`Timed out waiting for element matching "${selector}"`));
		}, timeout);
	});
}

async function clickElementByAttribute({
	attribute,
	value,
	altValue,
	optional = false,
	predicate,
}) {
	console.log(`Looking for ${attribute}="${value}"...`);
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

async function clickElementsSequentially() {
	const actions = [
		{
			attribute: "aria-label",
			value: "Settings",
		},
		{
			attribute: "class",
			value: "ytp-menuitem-label",
			predicate: (label) => {
				return label && label.textContent === "Quality";
			},
		},
		{
			attribute: "class",
			value: "ytp-menuitem-label",
			predicate: (element) => {
				const premiumLabel = element.querySelector(
					"div > div > span > .ytp-premium-label"
				);

				console.log(premiumLabel);
				return !premiumLabel;
			},
		},

		{
			attribute: "class",
			value: "ytp-size-button ytp-button",
			altValue: { attribute: "Title", value: "Default view (t)" },
		},

		// {
		// 	attribute: "id",
		// 	value: "dismiss-button",
		// 	optional: true,
		// },

		// Add other actions as needed
	];

	for (const action of actions) {
		try {
			await clickElementByAttribute(action);

			// Adjust the timeout duration as needed
			await new Promise((resolve) => setTimeout(resolve, 200));
		} catch (error) {
			console.error(error.message);
			break;
		}
	}
}

async function runExtension() {
	const player = await waitForElement(
		"#movie_player",
		isPlayerFullyLoaded
	).then(() => {
		console.log("Player fully loaded");
		clickElementsSequentially();
	});
}

window.addEventListener("yt-navigate-finish", runExtension);
