# HyperX Cloud Flight S Battery Monitor
A tiny electron app, that displays the battery percentage of the HyperX Cloud Flight S Headset via a tray icon.

## Installation
Just download the latest release and run the exe file.

After running the App, an Icon will be added to the System Tray. Hovering over that icon will show the current Battery Percentage of the Headset.

Currently, only windows is supported.

## Usage
After installing, run the App.

A Battery icon will appear in the System Tray of your Taskbar.

When first running the App, a config.json will be created at `%AppData%/hyperx-cloud-flight-s-battery-monitor/`.

Inside this file, you can configure the `updateDelay`. This number, which is given in minutes, determines the delay between the requests the App is sending to the Headset. So, this will determine how often the battery percentage will update in the Tray icon.

Be aware that a shorter delay may increase Battery Usage from the Headset.

## Development
If you wish to work on this Project yourself, go ahead and clone the repository.

Then, navigate to the cloned directory using a Terminal of you choice and run `npm install` or `yarn install`.

This will install the necessary dependencies of the project.

To start the app in development mode, run `npm run start` or `yarn start`.

## License
[MIT](https://choosealicense.com/licenses/mit/)