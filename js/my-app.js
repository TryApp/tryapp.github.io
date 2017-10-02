// Initialize your app
var myApp = new Framework7({
  panelLeftBreakpoint: 1024
});

// Export selectors engine
var $$ = Dom7;

// Add views
var leftView = myApp.addView('.view-left', {
  dynamicNavbar: true
});

var mainView = myApp.addView('.view-main', {
  dynamicNavbar: true,
  domCache: true
});


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
          document.getElementById('showAllBuildButton').hidden = true;
          mainView.router.load({ pageName: 'home' });
          document.title = appTitle + " | AppBox";
          //trackPageName();
          updateInstallationMessage(appTitle);
          insertAdsOnDiv('home-ads');
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
          updateInstallationMessage(appTitle);
          if (response.versions.length > 1) {
            document.getElementById('installButton').textContent = "Install Latest Version";
            updatePreviousBuild(response.versions);
          } else {
            document.getElementById('installButton').textContent = "Install Application";
            document.getElementById('showAllBuildButton').hidden = true;
          }
          mainView.router.load({ pageName: 'home' });
          insertAdsOnDiv('home-ads');
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
  if (menifest == null) {
    menifest = menifestLinkPath;
  }
  window.location.href = "itms-services://?action=download-manifest&url=https://dl.dropbox.com" + menifest;
  mainView.router.load({ pageName: 'post-install' });
  insertAdsOnDiv('post-install-ads');
}

function updateInstallationMessage(title) {
  document.getElementById('installationTitle').textContent = "By now, you should have seen an iOS popup proposing to install \"" + title
    + "\" .  Please confirm the installation dialog, then press your Home button to see the installation progress. ";
}

function insertAdsOnDiv(divId){
  document.getElementById(divId).innerHTML = `
    <center>
      <ins class="adsbygoogle adslot_1" data-ad-client="ca-pub-3139212365885959" data-ad-slot="5702922209" data-ad-format="auto"></ins>
    </center>
  `;
  (adsbygoogle =window.adsbygoogle || []).push({});
}