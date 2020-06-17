const btnId = 'ghqc-btn';

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

function checkCode() {
    const checkForGitURL = /(?!")((http(s)|git|ssh?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?(?=")/gi;
    let matches = document.documentElement.innerHTML.match(checkForGitURL);
    matches = [...new Set(matches)]; // de-dupe matches

    const cloneStr = ['githoard://openRepo', getPreferredProtocol(matches)].join('/');
    const repoUrl = new URL(cloneStr);

    console.log('find matches', location, matches, cloneStr, repoUrl);

    const btnExists = document.getElementById(btnId)

    if (btnExists) {
        btnExists.remove();
    }

    if (matches.length > 0) {
        const ghBtn = document.createElement('a');
        ghBtn.style = 'display:none;position:fixed;bottom:1em;right:1em;width:50px;height:50px;z-index:1000;'
        ghBtn.href = repoUrl
        ghBtn.id = btnId
        // ghBtn.target = '_blank'
        ghBtn.title = 'Clone Repository'
        ghBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="gh gh-logo" style="width:100%;height:100%" viewBox="0 0 1024 1024"><path d="M994 62a20 20 0 00-19 0L767 175 520 61a20 20 0 00-17 0L276 175 48 61a20 20 0 00-19 1 20 20 0 00-9 17v748c0 7 4 14 11 17l236 119c6 2 12 2 18 0l227-114 248 114a20 20 0 0017-1l217-118a20 20 0 0010-17V79c0-7-4-13-10-17zM891 641c10 7 13 22 5 33l-15 20a24 24 0 01-37-30 333 333 0 0013-18c8-10 23-13 34-5zm3-107a24 24 0 0122 25l-3 26a24 24 0 01-41 13 24 24 0 01-6-21 182 182 0 003-21c1-13 12-23 25-22zM617 303c13 0 24 10 24 23l1 21a24 24 0 11-47 6 286 286 0 01-2-26 24 24 0 0124-24zm-16-65l6-24a24 24 0 0145 12l-5 22a24 24 0 01-46-10zm51 194l-3-2a24 24 0 01-5-33c7-11 21-14 33-6l2 1a138 138 0 0015 9c12 7 16 21 10 32-6 12-20 17-32 11a196 196 0 01-20-12zm-42 209l-22-1c-13 1-24-10-24-23s10-24 23-24h25a24 24 0 0123 25 24 24 0 01-25 23zm109 27c-8 10-23 10-33 2a106 106 0 00-16-12c-11-7-15-21-8-32a24 24 0 0133-8c8 4 15 10 22 16 10 9 11 24 2 34zm58-206a95 95 0 00-19 0 24 24 0 11-2-48 144 144 0 0128 1 24 24 0 0120 27 24 24 0 01-27 20zm19 268a235 235 0 01-26-4 24 24 0 019-47l21 3a24 24 0 11-4 48zm93-232a24 24 0 01-25 3l-9-6a274 274 0 00-14-17 24 24 0 0135-32 311 311 0 0116 19c9 10 7 25-3 33zm-359 63L339 370c-6-6-14-10-22-10s-16 4-22 10l-41 41 48 48a33 33 0 0115-4c20 0 35 15 35 35 0 6-1 11-3 15l46 47c5-2 10-3 16-3 20 0 35 15 35 35s-15 35-35 35-35-15-35-35c0-6 1-11 3-15l-47-47-3 1v122c14 5 23 18 23 33 0 20-15 35-35 35s-35-15-35-35c0-15 9-28 23-33V522c-14-5-23-18-23-33 0-6 1-10 3-15l-48-48-133 135c-6 5-10 14-10 22s4 16 10 22l191 191c6 6 14 9 22 9s16-3 22-9l191-191c6-6 10-14 10-22s-4-17-10-22z" fill-rule="evenodd" fill="#F4511E"/></svg>';

        document.body.appendChild(ghBtn);
    }

    browser.runtime.sendMessage({ url: location.href, matches });
}

browser.runtime.onMessage.addListener(({ clone }) => {
    if (clone) {
        document.getElementById(btnId).click();
        // console.log("bg script begin clone:", clone);
        return Promise.resolve({ status: `Cloning ${clone}` });
    }
});

checkCode();