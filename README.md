## Description

This JavaScript script is designed to be used in a Chrome extension and performs a series of clicks on specific elements within a YouTube video page. The script is divided into several helper functions that handle different aspects of the clicking process, such as locating and clicking elements with specific attributes or waiting for elements to load. The main functions are executed sequentially within the `runExtension()` function, which is triggered by the `yt-navigate-finish` event.

## Features

1. Clicks the "Settings" button on the YouTube player (identified by its `aria-label` attribute).
2. Clicks the "Quality" menu item in the "Settings" menu (identified by the presence of a child element with the text content "Quality").
3. Clicks the first quality option in the "Quality" menu (identified by its position in the menu).
4. Clicks the "Theater mode" button on the YouTube player (identified by its `title` attribute).

The script first clicks the "Theater mode" button and then proceeds with the other clicks sequentially. It waits for the YouTube player to load before executing the main functions, and it also waits for specific elements to appear on the page before attempting to click them.

The script is designed to be flexible and can be extended or modified easily by adding or removing steps in the `clickElementsSequentially()` function or by updating the helper functions as needed.
