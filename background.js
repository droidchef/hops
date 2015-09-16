chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab){

  console.log('TAB ID = ' + tabId);
  if (changedInfo.status == 'complete') {
    var GITHUB_URL = "github.com";
    var tabUrl = tab.url;
    if (tabUrl.indexOf(GITHUB_URL) > -1) {
      console.log('We might be on github.com');
      var GITHUB_REPO_REGEX = /^(https?):\/\/(github\.com)\/([\w]+)\/([\w]+)\/tree\/([\w]+).*/;
      var result = tabUrl.match(GITHUB_REPO_REGEX);
      if (result) {
        console.log(result);
        console.log("Currently viewing " + result[5] + " branch of " + result[4] + " by " + result[3]);
      }

      // if () {
      //   console.log('Digging into the source now');
      // } else {
      //   console.log('We are on a github repository fellas');
      // }
    }
  }

});
