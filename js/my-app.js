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

//QR Code
var qrcode = new QRCode(document.getElementById("qr-container"), {
  width : 250,
  height : 250
});
qrcode.makeCode(window.location.href);

//Installation Query
var qrStr = decodeURIComponent(window.location.search);
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
          var appTitle = response.split('stringkeytitlekeystring')[1].toString().split('string')[0];
          var appIdentifier = response.split('keybundleidentifierkeystring')[1].toString().split('string')[0];
          var appVersion = response.split('stringkeybundleversionkeystring')[1].toString().split('string')[0];
          document.getElementById('appTitle').textContent = appTitle;
          document.getElementById('appVersion').textContent = appVersion;
          document.getElementById('appIdentifier').textContent = appIdentifier;
          document.getElementById('installButton').textContent = "Install Application";
          document.getElementById('showAllBuildButton').hidden = true;
          document.getElementById('showMoreDetailsOption').hidden = true;
          document.title = appTitle + " | AppBox";
          trackPageName();
          updateInstallationMessage(appTitle);
          showHome();
        }
        catch (err) {
          showErrorUI();
        }
      } else if (client.status >= 400) {
        showErrorUI();
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
          //response
          var response = JSON.parse(client.responseText);
          menifestLinkPath = response.latestVersion.manifestLink.split("dropbox.com")[1];

          //app title
          var appTitle = response.latestVersion.name;
          document.getElementById('appTitle').textContent = appTitle;
          document.getElementById('appTitleAllBuilds').textContent = appTitle;
          document.getElementById('appTitleMoreDetails').textContent = appTitle;
          document.getElementById('appTitleProvisionDevice').textContent = appTitle;

          //bundle identifier
          var appIdentifier = response.latestVersion.identifier;
          document.getElementById('appIdentifier').textContent = appIdentifier;

          //app version and build
          var appVersion = response.latestVersion.version;
          var appBuild = response.latestVersion.build;
          document.getElementById('appVersion').textContent = appVersion + ' (' + appBuild  +')';
          
          //IPA File Link
          var ipaDownloadLink = response.latestVersion.ipaFileLink;
          document.getElementById('downloadIPAFileButton').hidden = (ipaDownloadLink == null);
          document.getElementById('downloadIPAFileLink').href = "../download.html?down=" + ipaDownloadLink;

          //provisioning profile details
          if (response.latestVersion.mobileprovision) {
            //upload time
            var uploadDate = getDateFromTimeStamp(response.latestVersion.timestamp);
            document.getElementById('uploadedDate').textContent = uploadDate;
            
            //build type
            var buildType = response.latestVersion.buildtype;
            document.getElementById('profileType').textContent = buildType;

            //ipa file size
            var ipaFileSize = response.latestVersion.ipafilesize;
            document.getElementById('appSize').textContent = ipaFileSize + ' MB';

            //minimum iOS version
            var minOSVersion = response.latestVersion.minosversion;
            document.getElementById('miniOSVersion').textContent = minOSVersion;

            //supported device
            var supporteddevice = response.latestVersion.supporteddevice;
            document.getElementById('deviceFamily').textContent = supporteddevice;

            //profile creation date
            var provisonCreationDate = getDateFromTimeStamp(response.latestVersion.mobileprovision.createdate);
            document.getElementById('profileCreation').textContent = provisonCreationDate;

            //profile expiration date
            var provisonExpirationDate = getDateFromTimeStamp(response.latestVersion.mobileprovision.expirationdata);
            document.getElementById('profileExpiration').textContent = provisonExpirationDate;
          
            //profile team name
            var teamName = response.latestVersion.mobileprovision.teamname;
            document.getElementById('teamName').textContent = teamName;

            //provision device udid
            var devicesUDID = response.latestVersion.mobileprovision.devicesudid
            if (devicesUDID && devicesUDID.length > 1) {
              updateProvisionDeviceView(devicesUDID);
            } else {
              document.getElementById('showProvisionedDevicesList').hidden = true;
            }
          } else {
            //hide hide more details for old builds
            document.getElementById('showMoreDetailsOption').hidden = true;
          }

          //update page title and installation message
          document.title = appTitle + " | AppBox";
          trackPageName();
          updateInstallationMessage(appTitle);

          //check for other version of this build
          if (response.versions.length > 1) {
            document.getElementById('installButton').textContent = "Install Latest Version";
            updatePreviousBuild(response.versions);
          } else {
            document.getElementById('installButton').textContent = "Install Application";
            document.getElementById('showAllBuildButton').hidden = true;
          }

          //show home page
          showHome();
        }
        catch (err) {
          showErrorUI();
        }
      } else if (client.status >= 400) {
        showErrorUI();
      }
    };
    client.open('GET', 'https://dl.dropboxusercontent.com' + qrStr);
    client.setRequestHeader('Content-Type', 'text/xml');
    client.overrideMimeType('text/xml')
    client.send();
  } else {
    showErrorUI();
  }
} else {
  showErrorUI();
}


//Install App
function installApp(menifest) {
  if (menifest == null) {
    menifest = menifestLinkPath;
  }
  window.location.href = "itms-services://?action=download-manifest&url=https://dl.dropbox.com" + menifest;
  mainView.router.load({ pageName: 'post-install' });
  insertAdsOnDiv('post-install-ads');
}

//Show QR
function showQR(){
  mainView.router.load({ pageName: 'qr' });
  insertAdsOnDiv('qr-ads');
}

//Show Home
function showHome(){
  mainView.router.load({ pageName: 'home' });
  insertAdsOnDiv('home-ads');
}

//Show All Builds
function showAllBuilds(){
  mainView.router.load({ pageName: 'allBuilds' });
  insertAdsOnDiv('allBuilds-ads');
}

//Show Error UI
function showErrorUI(){
  mainView.router.load({ pageName: 'error' });
  insertAdsOnDiv('error-ads');
}

//Show More Details
function showMoreDetails() {
  mainView.router.load({pageName: 'moreDetails'});
  insertAdsOnDiv('moreDetails-ads');
}

//Show Provisioned Devices
function showProvisionedDevices() {
  mainView.router.load({pageName: 'allProvisionedDevices'});
  insertAdsOnDiv('allProvisionedDevices-ads');
}

//Update installation message
function updateInstallationMessage(title) {
  document.getElementById('installationTitle').textContent = "By now, you should have seen an iOS popup proposing to install \"" + title
    + "\" .  Please confirm the installation dialog, then press your Home button to see the installation progress. ";
}


//Insert ads at page hide/unhide
function insertAdsOnDiv(divId){
  document.getElementById(divId).innerHTML = `
    <center>
      <ins class="adsbygoogle adslot_1" data-ad-client="ca-pub-3139212365885959" data-ad-slot="5702922209" data-ad-format="auto"></ins>
    </center>
  `;
  (adsbygoogle =window.adsbygoogle || []).push({});
}

//Get date
function getDateFromTimeStamp(timestamp) {
  var date = new Date(timestamp * 1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours < 10 ? '0'+hours : hours;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = date.toLocaleDateString() + ', ' + hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

//Update Previous Build
function updatePreviousBuild(versions){
  versions.reverse();
  var allBuildDiv = document.getElementById("allBuildDiv");
  var htmlContent = '<ul>';
  for (i=0; i<versions.length; i++){
    var version = versions[i];

    var datestring = getDateFromTimeStamp(version.timestamp);
    var installButtonId = 'appInstall' + i;
    var menifestLink = version.manifestLink.split("dropbox.com")[1];

    var listItem = '<li class="item-content"> \
                        <div class="item-inner">\
                          <div class="item-title-row">\
                            <div class="item-title">Ver ' + version.version + '(' + version.build  +')</div>\
                          </div>\
                          <div class="item-subtitle">'+datestring+'</div>\
                        </div>\
                        <div class="item-inner"> \
                          <button id=\"'+installButtonId+'\" link=\"'+menifestLink+'\" class="button button-big" style="width: 100%;">Install</button>\
                        </div>\
                    </li>'

    htmlContent += listItem;
  }
  htmlContent += '</ul>';
  allBuildDiv.innerHTML = htmlContent;

  for (i=0; i<versions.length; i++){
    var installButtonId = 'appInstall' + i;
    var installButton = document.getElementById(installButtonId);
    installButton.addEventListener('click', function(){
      installApp(this.getAttribute("link"));
    });
  }
}


//Update Provisioned Device View
function updateProvisionDeviceView(devicesUDID) {
  var provisionDeviceDiv = document.getElementById("allProvisionedDevicesDiv");
  document.getElementById("provisionedDeviceCount").textContent = 'Provisioned Devices ('+ devicesUDID.length +')';

  var htmlContent = '<ul>';
  for (i=0; i<devicesUDID.length; i++){
    var listItem = '<li class="item-content"> \
                        <div class="item-inner">\
                          <div class="item-title-row">\
                            <div class="item-after">' + devicesUDID[i] + '</div>\
                          </div>\
                        </div>\
                    </li>'

    htmlContent += listItem;
  }
  htmlContent += '</ul>';
  provisionDeviceDiv.innerHTML = htmlContent;
}

//Track Page Name
function trackPageName(){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-85215717-1', 'auto');
    ga('send', 'pageview');
}
