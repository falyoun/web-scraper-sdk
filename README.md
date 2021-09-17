### Web Scraper SDK
This library written in Typescript to take snapshots for microsoft share points 

#### Installing

> npm i web-scraper-sdk

or

> yarn add web-scraper-sdk

#### Usage

```
const webScraperSdk = require('web-scaper-sdk');
webScraperSdk.scrape({
    removeJS: true,
    snapshot: true,
    website: 'wiki',
    headless: false
})
```

Where `ScrapeOptions` are:

* removeJS: which means remove all <script> tags from share point.

* snapshot: create a new snapshot, if passed false it will look for an already downloaded snapshot in your project dir

* website: that's either of these websites
   
   1- <a href='https://shortpointdev.sharepoint.com/sites/Boilerplate/SitePages/Wiki.aspx' target='_blank'>wiki</a>
   
   2- <a href='https://shortpointdev.sharepoint.com/sites/Boilerplate/SitePages/Blank.aspx' target='_blank'>blank</a>
   
   3- <a href='https://shortpointdev.sharepoint.com/sites/BoilerplateCommunication/SitePages/Blank.aspx' target='_blank'>communication</a>
   
   4- <a href='https://shortpointdev.sharepoint.com/sites/LockdownCommunication/SitePages/Modern.aspx' target='_blank'>modern</a>
 

* headless: chromium mode to open

* executablePath: chromium .exe path

* configPath: generated config file, if don't provide it, it will ask you to supply your credentials via command line
