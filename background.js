// Handle download requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'downloadCode') {
    chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(message.text),
      filename: message.filename,
      conflictAction: 'uniquify',
      saveAs: true
    });
    sendResponse({status: 'success'});
  }
  return true;
});

// Context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'download-selected-code',
    title: 'Download Selected Code',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'download-selected-code' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'downloadSelectedText',
      text: info.selectionText
    });
  }
});