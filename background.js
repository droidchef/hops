chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab){

  console.log('TAB ID = ' + tabId);
  if (changedInfo.status == 'complete') {
    var GITHUB_URL = "github.com";
    var tabUrl = tab.url;
    if (tabUrl.indexOf(GITHUB_URL) > -1) {
      var JAVA_SOURCE_REGEX = /^(https?):\/\/(github\.com)\/([\w]+)\/([\w]+)\/blob\/([\w]+).*\/(src\/main\/java)\/(.*)\/([\w]+\.java)$/;
      var result = tabUrl.match(JAVA_SOURCE_REGEX);
      if (result) {
        var len = result.length;
        console.log(result);
        var className = result[len - 1];
        var packageNameWithSlashes = result[len - 2];
        var packageName = packageNameWithSlashes.replace(/\//g, ".");
        console.log("Package Name : " + packageName);
        console.log("Class Name : "  + className);

          /*
            https://github.com/NewsInShorts/inshortsapp/blob/master/mobile/src/main/java/com/nis/app/agents/AppAgent.java
            Now from a URL like above extract out the current package we are in, for example
            Package Name = com.nis.app.agents
            Class Name = AppAgent

          */
          chrome.tabs.sendMessage(tab.id, { text: "report_back", packageName: packageName},
                                doStuffWithDOM);
      }

    }
  }

});

/* A function creator for callbacks */
function doStuffWithDOM(dataToBeLogged) {
    // console.log("I received the following DOM content:\n" + dataToBeLogged);
    if (jQuery) {
      console.log('Jquery Loaded');
      // jQuery loaded
      console.log(dataToBeLogged);

    } else {
      // jQuery not loaded
      console.log('Jquery Not Loaded Yet');
    }


}
