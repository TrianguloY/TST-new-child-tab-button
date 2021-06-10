const TST_ID = 'treestyletab@piro.sakura.ne.jp';
const ADDON_ID = 'tst-new-child-tab-button';


// ugly divs for vertically centered img
// image as data because I couldn't add it otherwise (its the icon-16.png from the icons folder)
const ICON = `<div style="height:100%; width: 17px; display: table;"><div style="display: table-cell;vertical-align: middle;">
<img part="${ADDON_ID}" style="margin-left: auto; margin-right: auto;" src='moz-extension://${location.host}/icons/newtab-child.svg'/>
</div></div>
`;

// ugly style to make space for the items
const STYLE = `

::part(${ADDON_ID}):hover {
    background: rgba(255, 255, 255, 0.1);
	box-shadow: 0 0 0.1em rgba(255, 255, 255, 0.3);
}

tab-item:not([data-child-ids]) tab-label, tab-item:not(.subtree-collapsed) tab-label
{
	margin-right: 18px
}
tab-item:not(.collapsed).sound-playing tab-label,
tab-item:not(.collapsed).has-sound-playing-member.subtree-collapsed[data-child-ids] tab-label,
tab-item:not(.collapsed).muted tab-label,
tab-item:not(.collapsed).has-muted-member.subtree-collapsed[data-child-ids] tab-label
{
	margin-right: 0px
}

tab-sound-button, tab-counter {
	margin-right: 20px
}
tab-item:not(.collapsed).sound-playing tab-counter,
tab-item:not(.collapsed).has-sound-playing-member.subtree-collapsed[data-child-ids] tab-counter,
tab-item:not(.collapsed).muted tab-counter,
tab-item:not(.collapsed).has-muted-member.subtree-collapsed[data-child-ids] tab-counter
{
	margin-right: 0px
}


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
      listeningTypes: ['sidebar-show', 'tab-mousedown', 'tab-dblclicked'],
	  style: STYLE
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