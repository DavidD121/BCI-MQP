# BCI-MQP NCS branch
Note: This was developed on the original Google Chrome browser, it should run on any chromium-based browser, but it has not been tested and the setup process may differ
## Extension setup
1. Download or clone the Git repository on the computer you will be running the experiment on.
2. In the Chrome browser, click on the puzzle piece in the top right corner and click "Manage Extensions"
3. In the top right of the page make sure that developer mode is enabled
4. Once developer mode is enabled a "Load unpacked" button should appear in the top left, Click it and select the folder of the github repo. Ensure that the folder contains the "manifest.json" file.

## Follow-up question
1. In the Chrome browser, right click the extension icon and click "Options." this will open the follow-up problems page.
2. Drag the options tab to a new window and position it side by side with the assistments page
3. Open a terminal in the folder of the Git repository and run the following command ```npm start```
4. Proceed through the problem set and the responses will be saved after every main problem to a csv file named in the format "response_#.csv" 


Note: the number in the file name represents the time in milliseconds after epoch, meaning the higher the number, the more recent the file.


