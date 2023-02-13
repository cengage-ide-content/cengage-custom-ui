const vscode = require('vscode');
const axios = require('axios');
const unzipper = require('unzipper');

async function activate(context) {
  // Create the webview panel
  const panel = vscode.window.createWebviewPanel(
    'localFileViewer',
    'Local File Viewer',
    vscode.ViewColumn.Two, // Open the panel on the left hand side of the editor
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );
  selectAndDisplayMarkdown();
  // Register the command that opens the file in the new tab
  const openFileCommand = vscode.commands.registerCommand(
    'cengage-custom-ui.openFileInNewTab',
    async () => {
      selectAndDisplayMarkdown();
    }
  );
  // Close all other vscode window
  vscode.commands.executeCommand("workbench.action.closeAllEditors");
  panel.webview.html = getWebviewContent();

  // Handle messages from the webview panel
  panel.webview.onDidReceiveMessage(
    message => {
      if (message == 'openFileSelector') {
        selectAndDisplayMarkdown();
        return;
      }
    },
    undefined,
    context.subscriptions
  );

  context.subscriptions.push(openFileCommand);
}

async function selectAndDisplayMarkdown() {
  // Prompt the user to select a local file
  const fileUri = await vscode.window.showOpenDialog({
    canSelectMany: true,
    openLabel: 'Open file',
    filters: {
      All: ['*']
    }
  });

  // If a file was selected, display its contents in the webview panel
  if (fileUri && fileUri[0]) {
    const filePath = fileUri[0].fsPath;
    vscode.commands.executeCommand('markdown.showPreviewToSide', vscode.Uri.parse(filePath));
  }
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<body>
  <button id="open-file-selector" onclick="openFile()"> Open File Selector</button>
    <script>
      const vscode = acquireVsCodeApi();
      function openFile() {
      vscode.postMessage('openFileSelector');
    }
  </script>
</body>
</html>`;
}

// Function to download and extract file
async function downloadAndExtract(url) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    response.data.pipe(unzipper.Extract({ path: './extracted-files' }));
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  activate
};
