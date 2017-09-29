document.getElementById('new_tab').addEventListener('click', function () {
  console.log(document.getElementById("new_tab").checked);
  chrome.storage.local.set({
    newTab: document.getElementById("new_tab").checked
  });
});

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get({
    newTab: true
  }, function (i) {
    document.getElementById("new_tab").checked = i.newTab;
  });
});