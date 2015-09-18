/* Listen for messages */

var REGEX_IMPORT = /^(import )/

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text == "report_back")) {
      console.log(msg.packageName);
      var sourceTable = document.getElementsByClassName('blob-wrapper')[0].innerHTML;
      var sourceCodeLines = $("div.blob-wrapper > table > tbody").find('td.blob-code blob-code-inner js-file-line');
      var tableRows = $('div.blob-wrapper tr');
      $(tableRows).each(function(){
        var sourceCodeLine = $(this).find(':nth-child(2)').text();
        if (itIsAnImportStatement(sourceCodeLine)) {
          console.log(sourceCodeLine);
        }
      });
    }
});

function itIsAnImportStatement(lineOfCode) {

  var result = lineOfCode.match(REGEX_IMPORT);
  if (result) {
    return true;
  } else {
    return false;
  }

}
