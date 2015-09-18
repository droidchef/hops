/* Listen for messages */

var REGEX_IMPORT = /^(import )/
var REGEX_BASE_PACKAGE;
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text == "report_back")) {
      var packageNameFolders = msg.packageName.split(".");

      REGEX_BASE_PACKAGE = new RegExp('('+packageNameFolders[0] + '\.' + packageNameFolders[1] + '\.' + packageNameFolders[2] + ')');

      var tableRows = $('div.blob-wrapper tr');
      $(tableRows).each(function(){
        var sourceCodeLine = $(this).find(':nth-child(2)').text();
        if (itIsAnImportStatement(sourceCodeLine)) {
          var packageName = getPackageName(sourceCodeLine);
          if (packageBelongsToOurSourceCode(packageName)) {
              console.log('class :' + getClassName(packageName));
          }
        }
      });
    }
});

/**
* Checks if this line of code is an import statement.
* @param {String} lineOfCode
* @return (Boolean) true if it is an import statement and false otherwise
*/
function itIsAnImportStatement(lineOfCode) {

  var result = lineOfCode.match(REGEX_IMPORT);
  if (result) {
    return true;
  } else {
    return false;
  }

}

/**
* Checks if this package lies in our source code or not, by checking the first
* two folder names in the package. Like if com.ishankhanna.example.app is the
* is a package to be tested if it belongs to us or not, we will check if
* com.ishankhanna.example is there in this package name or not.
* @param {String} packageNameToBeValidated
* @returns {Boolean} true if it belongs to our source code and false otherwise
*/
function packageBelongsToOurSourceCode(packageNameToBeValidated) {

  var result = packageNameToBeValidated.match(REGEX_BASE_PACKAGE)
  if (result) {
    return true;
  } else {
    return false;
  }

}

/**
* Extracts the package name from the import statement of the source code.
* @param {String} importStatement
* @return {String} packageName
*/
function getPackageName(importStatement) {

  // TODO : Figure out why the hell are we doing this split twice.
  var codes = importStatement.split(" ");
  var packageName = codes[1].split(";")[0];
  return packageName;
}

/**
* Extracts the class name from the package name.
* @param {String} packageName
* @return {String} className
*/
function getClassName(packageName) {
  var elementsOfPackageName = packageName.split(".");
  var className = elementsOfPackageName[elementsOfPackageName.length-1];
  return className;
}
