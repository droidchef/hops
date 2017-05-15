chrome.tabs.onUpdated.addListener(function (tabId, changedInfo, tab) {

  console.log('TAB ID = ' + tabId);
  if (changedInfo.status === 'complete') {
    var GITHUB_URL = "github.com";
    var tabUrl = tab.url;
    if (tabUrl.indexOf(GITHUB_URL) > -1) {
      var SOURCE_REGEX = /^(https?):\/\/(github\.com)\/([\w]+)\/([\S]+)\/blob\/([\w]+)\/(.*)\/(src\/main\/(?:java|kotlin))\/(.*)\/([\w]+\.(?:java|kt))/;
      var result = tabUrl.match(SOURCE_REGEX);
      if (result) {
        var len = result.length;
        console.log(result);
        var protocol = result[1]; // http or https
        var domain = result[2]; // github.com
        var userName = result[3]; // github username. for example: ishan1604
        var repositoryName = result[4]; // github repo name. for example: hoppr
        var branchName = result[5]; // current branch. for example: master
        var modulename = result[6]; // gradle project module name. for example : mobile
        var sourceCodeFolder = result[7]; // root folder java packages are stored. for example: src/main/java
        var className = result[len - 1];
        var ext = className.split(".")[1];
        var packageNameWithSlashes = result[len - 2];
        var packageName = packageNameWithSlashes.replace(/\//g, ".");
        console.log("Package Name : " + packageName);
        console.log("Class Name : " + className);

        var messagePayload = {
          task: "activate_class_links",
          protocol: result[1], // http or https
          domain: result[2], // github.com
          userName: result[3], // github username. for example: ishan1604
          repositoryName: result[4], // github repo name. for example: hoppr
          branchName: result[5], // current branch. for example: master
          modulename: result[6], // gradle project module name. for example : mobile
          sourceCodeFolder: result[7], // root folder java packages are stored. for example: src/main/java
          packageName: packageName,
          ext: ext
        };

        /*
         https://github.com/NewsInShorts/inshortsapp/blob/master/mobile/src/main/java/com/nis/app/agents/AppAgent.java
         Now from a URL like above extract out the current package we are in, for example
         Package Name = com.nis.app.agents
         Class Name = AppAgent
         */
        chrome.tabs.sendMessage(tab.id, messagePayload, doStuffWithDOM);
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
