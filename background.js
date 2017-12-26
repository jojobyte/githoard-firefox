var currentTab;
var currentHasRepo;
var repoList = [];
var repoObject = {};

function updateIcon() {
  browser.browserAction.setIcon({
    path: currentHasRepo ? {
      19: "icons/19.png",
      38: "icons/38.png"
    } : {
      19: "icons/19-bizaro.png",
      38: "icons/38-bizaro.png"
    },
    tabId: currentTab.id
  });
}

function testUrl(url) {
  // var checkForGitURL = /(?!")((http(s)|git|ssh?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?(?=")/gi;
  // console.log('testUrl', repoObject[url].matches);
  if (repoObject[url].matches.length) {
    return true;
  }

  return false;
}

function name(str) {
  return str ? str.replace(/^\W+|\.git$/g, '') : null;
}

function owner(str) {
  if (!str) return null;
  var idx = str.indexOf(':');
  if (idx > -1) {
    return str.slice(idx + 1);
  }
  return str;
}

function matchProtocol(matches, protocol) {
  return matches.findIndex((matchVal) => matchVal.startsWith(protocol));
}

function getPreferredProtocol(matches) {
  if (matches.length > 0) {
    let matchIdx = matchProtocol(matches, 'https');
    if (matchIdx === -1) {
      matchIdx = matchProtocol(matches, 'http');
    }
    if (matchIdx === -1) {
      matchIdx = 0;
    }
    return matches[matchIdx];
  }
}

/*
 * Clone repo
 */
function triggerClone() {
  let currentId = currentTab.id;
  let currentURL = new URL(currentTab.url);

  // githoard://openRepo/https://github.com/${owner}/{$name}

  if (testUrl(currentURL)) {
    let cloneStr = ['githoard://openRepo', getPreferredProtocol(repoObject[currentURL].matches)].join('/');
    let repoUrl = new URL(cloneStr);

    // console.log('githoard id', currentId);
    // console.log('githoard tab', currentTab);
    // console.log('githoard url', currentURL);

    var creating = browser.tabs.create({
      url: cloneStr,
      active: false
    });
    creating.then((tab) => {
      console.log('githoard clone', cloneStr);
      var removing = browser.tabs.remove(tab.id);
      removing.then((tab) => {
        var updating = browser.tabs.update(currentId, {
          active: true
        });
      });
    });
  }
}

browser.browserAction.onClicked.addListener(triggerClone);

function updateActiveTab(tabs) {
  // console.log('githoard updateActiveTab', tabs);
  function isSupportedProtocol(urlString) {
    var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    var url = document.createElement('a');
    url.href = urlString;
    return supportedProtocols.indexOf(url.protocol) != -1;
  }

  function updateTab(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      // console.log('updateTab repoObject', Object.keys(repoObject).includes(currentTab.url), currentTab.url);

      currentHasRepo = Object.keys(repoObject).includes(currentTab.url);
      updateIcon();
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

browser.tabs.onUpdated.addListener(updateActiveTab);
browser.tabs.onActivated.addListener(updateActiveTab);
browser.windows.onFocusChanged.addListener(updateActiveTab);

function hasGitRepo(message) {
  // console.log('hasGitRepo msg', message);
  if (message.matches !== null) {
    // repoList.push(message.url);
    repoObject[message.url] = message;
    updateActiveTab();
  }
}

browser.runtime.onMessage.addListener(hasGitRepo);

// update when the extension loads initially
updateActiveTab();
