/* Listen for messages */

var REGEX_IMPORT = /^(import )/;
var REGEX_VALID_USAGE_OF_CLASS_NAME = /^(\s+)?[A-Z][\S]+(\(|\.|>|\s|$)/;
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
var MODULE_NAME; // gradle based projects have modules
var SOURCE_FOLDER_ROOT;

var ANDROID_REFERENCE_URL_BASE = "https://developer.android.com/reference/";

String.prototype.replaceBetween = function (start, end, what) {
  return this.substring(0, start) + what + this.substring(end);
};

chrome.runtime.onMessage.addListener(function (msg) {
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
            var browseableClass = new BrowseableClass(className, packageName, msg.ext);
            arrayOfBroweseableClasses.push(browseableClass);
            // console.log(browseableClass.getGithubUrl());
          }
        }

        if (INDEX_OF_LAST_IMPORT_STATEMENT < index) {
          INDEX_OF_LAST_IMPORT_STATEMENT = index;
        }
      }
    });
    for (var i = 0; i < arrayOfBroweseableClasses.length; i++) {
      var clazz = arrayOfBroweseableClasses[i];
      // Skip line number
      var el = $('td[id*=LC]' + ( msg.ext === "java" ? " " : "") + ':contains(' + clazz.className + ')');
      for (var j = 0; j < el.length; j++) {

        if (msg.ext === "java") {
          var code = $(el[j]).text();
          if (code.startsWith("import ")) continue;

          var result = code.match(REGEX_VALID_USAGE_OF_CLASS_NAME);
          if (result) {
            if (~code.indexOf('List') || ~code.indexOf('ArrayList') || ~code.indexOf('Set') || ~code.indexOf('Iterator')) {
              // Handle more collections stuff probably wrapped inside a fucking function.
              $(el[j]).wrapInner('<a href=\"' + clazz.getLinkedUrl() + '\" target=\"_blank\" />');
            } else if (code.length === clazz.className.length) {
              $(el[j]).wrapInner('<a href=\"' + clazz.getLinkedUrl() + '\" target=\"_blank\" />');
            }
          }
        } else if (msg.ext === "kt") {
          var codeHtml = $(el[j]).html();
          var codeText = $(el[j]).text();

          /*
           Workaround for Kotlin. It gets the first char of a class (first index); it checks if before the class name there's another char, if true skip this line;
           it calculates the used length, adding to the first index, the length of class name, plus a special char (like . (  <  >).
           At the end it checks if the substring matches with a valid usage of class name, so replace it with the URL
           */
          var indexHtml = codeHtml.indexOf(clazz.className);
          var indexText = codeText.indexOf(clazz.className);

          switch (codeText.charAt(indexText - 1)) {
            case "<":
            case ">":
            case " ":
            case "(":
              break;
            default:
              continue;
          }

          var classUsage = indexHtml + clazz.className.length + 1;
          if (codeHtml.charAt(classUsage - 1) >= 'A' || 'Z' <= codeHtml.charAt(classUsage - 1)) continue;

          var result = codeHtml.substr(indexHtml, classUsage).match(REGEX_VALID_USAGE_OF_CLASS_NAME);

          if (result) {
            $(el[j]).html(codeHtml.replaceBetween(indexHtml, classUsage - 1, '<a href=\"' + clazz.getLinkedUrl() + '\" target=\"_blank\">' + clazz.className + '</a>'));
          }
        }
      }
    }

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

function BrowseableClass(className, packageName, ext) {
  this.className = className;
  this.packageName = packageName;
  this.ext = ext;
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
        + packageNameWithSlashes + this.className + "." + this.ext;
  }
};