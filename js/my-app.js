// Initialize your app
var myApp = new Framework7({
    panelLeftBreakpoint: 1024
});

// Export selectors engine
var $$ = Dom7;

// Add views
var leftView = myApp.addView('.view-left', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});
var mainView = myApp.addView('.view-main') 


var qrStr = window.location.search;
qrStr = qrStr.split("?url=")[1];
var menifestLinkPath = qrStr;
if (qrStr) {
  if (qrStr.indexOf('manifest.plist') != -1) {
    var client = new XMLHttpRequest();
    client.timeout = 60000;
    client.onreadystatechange = function () {
      if (client.readyState == 4 && client.status == 200) {
        try {
          menifestLinkPath = qrStr;
          var response = client.responseText.replace(new RegExp(/[^a-zA-Z0-9.]/g), '');
          var first = response.split('stringkeytitlekeystring')[1].toString().split('string')[0];
          var appTitle = response.split('stringkeytitlekeystring')[1].toString().split('string')[0];
          var appIdentifier = response.split('keybundleidentifierkeystring')[1].toString().split('string')[0];
          var appVersion = response.split('stringkeybundleversionkeystring')[1].toString().split('string')[0];
          document.getElementById('appTitle').textContent = appTitle;
          document.getElementById('appVersion').textContent = appVersion;
          document.getElementById('appIdentifier').textContent = appIdentifier;
          document.getElementById('installButton').textContent = "Install Application";
          document.getElementById('mainDiv').hidden = false;
          document.getElementById('loaderDiv').hidden = true;
          document.getElementById('showAllBuildButton').hidden = true;
          document.title = appTitle + " | AppBox";
          //trackPageName();
          //updateInstallationMessage(appTitle);
        }
        catch (err) {
          //showErrorUI();
        }
      } else if (client.status >= 400) {
        //showErrorUI();
      }
    };
    client.open('GET', 'https://dl.dropboxusercontent.com' + qrStr);
    client.setRequestHeader('Content-Type', 'text/xml');
    client.overrideMimeType('text/xml')
    client.send();
  } else if (qrStr.indexOf('appinfo.json') != -1) {
    var client = new XMLHttpRequest();
    client.timeout = 60000;
    client.onreadystatechange = function () {
      if (client.readyState == 4 && client.status == 200) {
        try {
          var response = JSON.parse(client.responseText);
          menifestLinkPath = response.latestVersion.manifestLink.split("dropbox.com")[1];
          var first = response.latestVersion.build;
          var appTitle = response.latestVersion.name;
          var appIdentifier = response.latestVersion.identifier;
          var appVersion = response.latestVersion.version;
          document.getElementById('appTitle').textContent = appTitle;
          document.getElementById('appVersion').textContent = appVersion;
          document.getElementById('appIdentifier').textContent = appIdentifier;
          document.title = appTitle + " | AppBox";
          //trackPageName();
          //updateInstallationMessage(appTitle);
          if (response.versions.length > 1) {
            document.getElementById('installButton').textContent = "Install Latest Version";
            updatePreviousBuild(response.versions);
          } else {
            document.getElementById('installButton').textContent = "Install Application";
            document.getElementById('showAllBuildButton').hidden = true;
          }
          document.getElementById('mainDiv').hidden = false;
          document.getElementById('loaderDiv').hidden = true;
        }
        catch (err) {
          //showErrorUI();
        }
      } else if (client.status >= 400) {
        //showErrorUI();
      }
    };
    client.open('GET', 'https://dl.dropboxusercontent.com' + qrStr);
    client.setRequestHeader('Content-Type', 'text/xml');
    client.overrideMimeType('text/xml')
    client.send();
  } else {
    //showErrorUI();
  }
} else {
  //appPage();
}


function installApp(menifest) {
    if (menifest == null){
        menifest = menifestLinkPath;
    }
    window.location.href = "itms-services://?action=download-manifest&url=https://dl.dropbox.com" + menifest;
    mainView.router.load({pageName: 'post-install'});
}