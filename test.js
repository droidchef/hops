// document.addEventListener('DOMContentLoaded', function() {
//   var checkPageButton = document.getElementById('checkPage');
//   checkPageButton.addEventListener('click', function() {
//     console.log("Hello World");
//     var bkg = chrome.extension.getBackgroundPage();
//     bkg.console.log('foo');
//     // chrome.tabs.getSelected(null, function(tab) {
//     //   d = document;
//     //
//     //   var f = d.createElement('form');
//     //   f.action = 'http://gtmetrix.com/analyze.html?bm';
//     //   f.method = 'post';
//     //   var i = d.createElement('input');
//     //   i.type = 'hidden';
//     //   i.name = 'url';
//     //   i.value = tab.url;
//     //   f.appendChild(i);
//     //   d.body.appendChild(f);
//     //   f.submit();
//     // });
//   }, false);
// }, false);


chrome.tabs.onUpdate.addListener(function(tabId, changedInfo, tab){

  console.log('TAB ID = ' + tabId);
  console.log('URL = ' + changedInfo.url);

});
