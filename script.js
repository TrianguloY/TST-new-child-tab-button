const TST_ID = 'treestyletab@piro.sakura.ne.jp';
const ADDON_ID = 'tst-new-child-tab-button';


// ugly divs for vertically centered img
// image as data because I couldn't add it otherwise (its the icon-16.png from the icons folder)
const ICON = `<div style="height:100%;display: table;"><div style="display: table-cell;vertical-align: middle;">
<img id="${ADDON_ID}" style="margin-left: auto; margin-right: auto;" src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtUWqInYQcchQnSyIijhKFYtgobQVWnUwufRDaNKQpLg4Cq4FBz8Wqw4uzro6uAqC4AeIm5uToouU+L+k0CLGg+N+vLv3uHsHCPUyU82OcUDVLCMVj4nZ3IoYeEUXguhHLyISM/VEeiEDz/F1Dx9f76I8y/vcn6NHyZsM8InEs0w3LOJ14ulNS+e8TxxmJUkhPiceM+iCxI9cl11+41x0WOCZYSOTmiMOE4vFNpbbmJUMlXiKOKKoGuULWZcVzluc1XKVNe/JXxjKa8tprtMcRhyLSCAJETKq2EAZFqK0aqSYSNF+zMM/5PiT5JLJtQFGjnlUoEJy/OB/8LtbszA54SaFYkDni21/jACBXaBRs+3vY9tunAD+Z+BKa/krdWDmk/RaS4scAX3bwMV1S5P3gMsdYPBJlwzJkfw0hUIBeD+jb8oBA7dA96rbW3Mfpw9AhrpaugEODoHRImWvebw72N7bv2ea/f0AVwRynEhfJJIAAAAGYktHRAArACoAM8VYB0oAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflBggSIhxsuJCvAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAGNJREFUOMtj1NYy/s9AAWBctXIdRQawMDAwMDQ2tpKlub6+moGJgUIw8AZQHIiM2KKxvr6aqIAlKRDnzJ1BmzBgIcVmGDslOYN4A2CK58ydgaKR/ukAm+14vVBfX01+OiAFAAAFqR+rcHgIggAAAABJRU5ErkJggg=='/>
</div></div>
`;


// API help:
// https://github.com/piroor/treestyletab/wiki/API-for-other-addons
// https://github.com/piroor/treestyletab/wiki/Extra-Tab-Contents-API

// Notifies to set our icon in all tabs...
function insertContents(tabId) {
  browser.runtime.sendMessage(TST_ID, {
    type:     'set-extra-tab-contents',
    id:       tabId,
    contents: ICON
  });
}

// ...for all existing tabs in currently shown sidebars
browser.tabs.query({}).then(tabs => {
  for (const tab of tabs) {
    insertContents(tab.id);
  }
});

// ...for new tabs opened after initialized
browser.tabs.onCreated.addListener(tab => {
  insertContents(tab.id);
});


// Registers our addon in TST
async function registerToTST() {
  try {
    await browser.runtime.sendMessage(TST_ID, {
      type: 'register-self',
      name: 'TST new child tab button',
      listeningTypes: ['sidebar-show', 'tab-mousedown', 'tab-dblclicked']
    });
  }
  catch(e) {
    console.log('TST is not available');
  }
}
registerToTST();


// Reacts to new messages from the TST addon
browser.runtime.onMessageExternal.addListener((message, sender) => {
  if (sender.id != TST_ID)
    return;

  switch (message.type) {
	  
	// ...for existing tabs, after the sidebar is shown
    case 'sidebar-show':
      browser.tabs.query({ windowId: message.windowId }).then(tabs => {
        for (const tab of tabs) {
          insertContents(tab.id);
        }
      });
      break;
	  
	
	// when our image is clicked, create new child from that tab
	case 'tab-mousedown':
    case 'tab-dbclicked':
      if (message.originalTarget && message.originalTarget.match(ADDON_ID)) {
		return browser.tabs.create({
		  openerTabId: message.tab.id
		});
      }
      break;
  }
});