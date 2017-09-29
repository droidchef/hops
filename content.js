/* Listen for messages */

var REGEX_IMPORT = /^(import )/;
var REGEX_PACKAGE_NAME_EXCLUDING_CLASS_NAME = /(.*\.)/;
var REGEX_BASE_PACKAGE;
// This will help us determine the line from which the actual code begins.
var INDEX_OF_LAST_IMPORT_STATEMENT = -1;
var arrayOfBroweseableClasses = [];
var PROTOCOL;
var DOMAIN;
var USER_NAME;
var REPOSITORY_NAME;
var BRANCH;
var MODULE_NAME; // gadle based projects have modules
var SOURCE_FOLDER_ROOT;

var ANDROID_REFERENCE_URL_BASE = "https://developer.android.com/reference/";

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  /* If the received message has the expected format... */
  if (msg.task && (msg.task === "activate_class_links")) {
    PROTOCOL = msg.protocol;
    DOMAIN = msg.domain;
    USER_NAME = msg.userName;
    REPOSITORY_NAME = msg.repositoryName;
    BRANCH = msg.branchName;
    MODULE_NAME = msg.modulename;
    SOURCE_FOLDER_ROOT = msg.sourceCodeFolder;

    var packageNameFolders = msg.packageName.split(".");

    REGEX_BASE_PACKAGE = new RegExp('(' + packageNameFolders[0] + '\.' + packageNameFolders[1] + ')');

    var tableRows = $('div.blob-wrapper tr');
    $(tableRows).each(function (index) {
      var sourceCodeLine = $(this).find(':nth-child(2)').text();
      if (itIsAnImportStatement(sourceCodeLine)) {
        var packageName = getPackageName(sourceCodeLine);
        if (packageBelongsToOurSourceCode(packageName) || packageBelongsToAndroid(packageName)) {
          var className = getClassName(packageName);
          if (className !== 'R') {
            var browseableClass = new BrowseableClass(className, packageName);
            arrayOfBroweseableClasses.push(browseableClass);
            // console.log(browseableClass.getGithubUrl());
          }
        }

        if (INDEX_OF_LAST_IMPORT_STATEMENT < index) {
          INDEX_OF_LAST_IMPORT_STATEMENT = index;
        }
      }
    });

    chrome.storage.local.get({
      newTab: true
    }, function (r) {
      var target = "";
      if (r.newTab) {
        target = "_blank";
      }

      for (var i = 0; i < arrayOfBroweseableClasses.length; i++) {
        var el = $('td :contains(' + arrayOfBroweseableClasses[i].className + ')');
        for (var j = 0; j < el.length; j++) {
          var code = $(el[j]).text();
          var result = code.match(REGEX_VALID_USAGE_OF_CLASS_NAME);
          if (result) {
            if (~code.indexOf('List') || ~code.indexOf('ArrayList') || ~code.indexOf('Set') || ~code.indexOf('Iterator')) {
              // Handle more collections stuff probably wrapped inside a fucking function.
              $(el[j]).wrapInner('<a href=\"' + arrayOfBroweseableClasses[i].getLinkedUrl() + '\" target=\"' + target + '\" />');
            } else if (code.length === arrayOfBroweseableClasses[i].className.length) {
              $(el[j]).wrapInner('<a href=\"' + arrayOfBroweseableClasses[i].getLinkedUrl() + '\" target=\"' + target + '\" />');
            }
          }
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
  return !!result;
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
  return !!packageNameToBeValidated.match(REGEX_BASE_PACKAGE);
}

/**
 * Checks if the package belongs to android - simply checks if it starts with "android.*"
 */
function packageBelongsToAndroid(packageNameToBeValidated) {
  return packageNameToBeValidated.startsWith("android.");
}

/**
 * Extracts the package name from the import statement of the source code.
 * @param {String} importStatement
 * @return {String} packageName
 */
function getPackageName(importStatement) {

  // TODO : Figure out why the hell are we doing this split twice.
  var codes = importStatement.split(" ");
  return codes[1].split(";")[0];
}

/**
 * Extracts the class name from the package name.
 * @param {String} packageName
 * @return {String} className
 */
function getClassName(packageName) {
  var elementsOfPackageName = packageName.split(".");
  return elementsOfPackageName[elementsOfPackageName.length - 1];
}

function BrowseableClass(className, packageName) {
  this.className = className;
  this.packageName = packageName;
}

BrowseableClass.prototype.getLinkedUrl = function () {
  if (packageBelongsToAndroid(this.packageName)) {
    var packageNameWithSlashes = this.packageName.replace(/\./g, "\/");
    return ANDROID_REFERENCE_URL_BASE + packageNameWithSlashes + ".html";
  } else if (packageBelongsToOurSourceCode(this.packageName)) {
    var result = this.packageName.match(REGEX_PACKAGE_NAME_EXCLUDING_CLASS_NAME);
    var packageNameWithSlashes = result[0].replace(/\./g, "\/");
    return PROTOCOL + "://" + DOMAIN + "/" + USER_NAME + "/" + REPOSITORY_NAME +
      "/blob/" + BRANCH + "/" + MODULE_NAME + "/" + SOURCE_FOLDER_ROOT + "/"
      + packageNameWithSlashes + this.className + '.java';
  }
};

var REGEX_VALID_USAGE_OF_CLASS_NAME = /^(\s+)?[A-Z][\S]+(\(|\.|>|\s|$)/;
