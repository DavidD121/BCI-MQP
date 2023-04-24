# BCI Chrome Extension
Note: This was developed on the original Google Chrome browser, it should run on any chromium-based browser, but it has not been tested and the setup process may differ
## Extension setup
1. Download or clone the Git repository on the computer you will be running the experiment on.
2. In the Chrome browser, click on the puzzle piece in the top right corner and click "Manage Extensions"
3. In the top right of the page make sure that developer mode is enabled
4. Once developer mode is enabled a "Load unpacked" button should appear in the top left, Click it and select the folder of the github repo. Ensure that the folder contains the "manifest.json" file.

## Development Guide
### Supporting online platforms beyond ASSISTments
Supporting new online platforms will require new content scripts to be written and injected into the webpage of the platform. The content script is responsible for monitor for changes in the html DOM and send messages to the extensions background script to make requests to the API. For ASSISTments, problem-page.js is the content script, so look there for inspiration. Once a new content script is written you will need to update the "content_scripts" field in manifest.json to assign the content script to a webpage like so:
```json5
{
...
"content_scripts": [
    {
      "matches": ["https://*.assistments.org/assistments/student/*"],
      "js": ["problem-page.js"]
    }, 
    {
      "matches": ["https://*.mynewplatform.org/problemset/*"],
      "js": ["new-content-script.js"]
    }
  ]
 ...
}
```

### Creating new visualizations/interventions
To change the contents of the popup menu, the menus the shows up after clicking the icon, you're looking to modify popup.html popup.css and popup.js. The chrome extension icon can be updated programmatically in background.js. Content scripts can also be used to modify and interact with pages based on brain data. If you're looking to create visualizations or a dashboard that requires a separate webpage, consider using the options page of the extension as it can easily recieve messages from content scripts and the background.js script, see options.html, options.css, and options.js. The options page was used in the NCS branch to create the question prompt, so look there for inspiration.

### Supporting other cognitive state classifications / different brain data
This will likely require new API calls to be created, see the [Neurolearn library](https://github.com/WPIHCILab/NeuroLearn). Once the appropriate API calls are created, modify background.js accordingly to schedule API calls  to recieve the desired data and store it.

## Resources for Developers
- [GitHub cheatsheet](https://education.github.com/git-cheat-sheet-education.pdf)
- Javascript tutorials:
  - [Textbook](https://github.com/getify/You-Dont-Know-JS)
  - [Video course](https://www.youtube.com/watch?v=PkZNo7MFNFg)
- [Chrome Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
  - [Message passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
  - [Injecting content scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Mutation Observer Interface](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
