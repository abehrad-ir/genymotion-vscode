<h1 align="center">
  <br>
    <img src="https://github.com/abehrad-ir/genymotion-vscode/resources/images/genymotion-logo.png/ic_genymotion.png?raw=true" alt="logo" width="200">
  <br>
  VS Code - Genymotion Device Manager
  <br>
  <br>
</h1>

<h4 align="center">Create and manage your Genymotion devices in vscode directly.</h4>



![Demo](https://github.com/abehrad-ir/genymotion-vscode/resources/watchme.gif?raw=true)

**Supported features**
* View and run Genymotion devices
* Open Genymotioin ffrom vscode
* Custome Genymotion nd VirtualBox path

## Getting Started
1. [Install the extension](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)
2. Run Genymotion sertting from command pallet and detecte Genymotion and VirtualBox path.
3. Run Genymotion devices command from command pallet and choise your Genymotion devices to start.

> **`Tip`**`:` It doesn't need to detecte  Genymotion and VirtualBox path if you installed them in default path.

## Using the debugger

When your launch config is set up, you can debug your project. Pick a launch config from the dropdown on the Debug pane in Code. Press the play button or F5 to start.

### Configuration

The extension operates in two modes - it can launch an instance of Chrome navigated to your app, or it can attach to a running instance of Chrome. Both modes requires you to be serving your web application from local web server, which is started from either a VS Code task or from your command-line. Using the `url` parameter you simply tell VS Code which URL to either open or launch in Chrome.

Just like when using the Node debugger, you configure these modes with a `.vscode/launch.json` file in the root directory of your project. You can create this file manually, or Code will create one for you if you try to run your project, and it doesn't exist yet.

> **Tip**: See recipes for debugging different frameworks here: https://github.com/Microsoft/vscode-recipes

---

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.