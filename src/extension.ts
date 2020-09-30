import * as vscode from 'vscode';
import { PathHelper } from './PathHelper';
import { Utils } from './Utils';
import { exec, spawn } from 'child_process';
import { sep } from 'path';
import * as DeviceManager from './DeviceManager';


const GENYMOTION_FOLDER_CONF = 'genymotion.installedPath';
const VIRTUALBOX_FOLDER_CONF = 'virtualBox.installedPath';

let genyPath: string;
let vboxPath: string;

export function activate(context: vscode.ExtensionContext) {

	readConfigurations();
	detectePathes();
	readConfigurations();



	registerCommands(context);

	
}

export function deactivate() {}

function readConfigurations() {
	// Getting configurations
	genyPath = vscode.workspace.getConfiguration("genymotion").get(GENYMOTION_FOLDER_CONF, "");
	vboxPath = vscode.workspace.getConfiguration("genymotion").get(VIRTUALBOX_FOLDER_CONF, "");
}

function selectGenymotionPath() {
	let pathIsFolder = !Utils.isMac();

	vscode.window.showOpenDialog(
		{
			canSelectFiles: !pathIsFolder,
			canSelectFolders: pathIsFolder,
			canSelectMany: false,
			openLabel: "Genymotion Path...",
		},
	).then( async fileUri => {
		if (fileUri && fileUri[0]) {
			vscode.workspace.getConfiguration("genymotion").update(GENYMOTION_FOLDER_CONF, fileUri[0].fsPath, true).then(par => {
				if (PathHelper.verifyGenyPath(fileUri[0].fsPath)) {
					vscode.window.showInformationMessage("`Genymotion` path was detected succesfully.");
				} else {
					vscode.window.showErrorMessage("The detected path for `Genymotion` is not correct.");
				}
			});
		}
	});
}

function selectVirtualBoxPath() {
	let pathIsFolder = !Utils.isMac();
	vscode.window.showOpenDialog(
		{
			canSelectFiles: !pathIsFolder,
			canSelectFolders: pathIsFolder,
			canSelectMany: false,
			openLabel: "VirtualBox Path...",
		},
	).then( async fileUri => {
		if (fileUri && fileUri[0]) {
			vscode.workspace.getConfiguration("genymotion").update(VIRTUALBOX_FOLDER_CONF, fileUri[0].fsPath, true).then(par => {
				if (PathHelper.verifyVBoxPath(fileUri[0].fsPath)) {
					vscode.window.showInformationMessage("`VirtualBox` path was detected succesfully.");
				} else {
					vscode.window.showErrorMessage("The detected path for `Virtual Box` is not correct.");
				}
			});

		}
	});
}

function detectePathes(): boolean {
	
	let statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	statusItem.text = "~$(loading) Verifying pathes...";
	statusItem.show();
	// Finding pathes
	let pathes = PathHelper.findPathes(genyPath, vboxPath);
	let geny = pathes[0];
	let vbox = pathes[1];
	statusItem.dispose();

	// Writing correct pathes to the configuration
	if (geny[0] instanceof String) {
		vscode.workspace.getConfiguration("genymotion").update(GENYMOTION_FOLDER_CONF, geny, true);
	}
	if (vbox[0] instanceof String) {
		vscode.workspace.getConfiguration("genymotion").update(VIRTUALBOX_FOLDER_CONF, vbox, true);
	}

	// Checking Genymotion path
	if (geny === false) {
		// Show error notification for detecting Genymotion path
		vscode.window.showErrorMessage(
			"Can't detecte `Genymotion` Path.\n Detecte it here or Go to settings and Genymotion session.", ...["Detecte Path", "Dismise"]
		).then(choice => {
			// OnDetecte Selected
			if (choice === "Detecte Path") {
				selectGenymotionPath();
			}
		});
	}


	// Checking VBox path
	if (vbox === false) {
		// Shwo error notification to detecting Vbox path
		vscode.window.showErrorMessage(
			"Can't detecte `VirtualBox` Path. Detecte it here or Go to settings and Genymotion session.", ...["Detecte Path", "Dismise"]
		).then(choice => {
			if (choice === "Detecte Path") {
				selectVirtualBoxPath();
			}
		});
	}
	let result = pathes[0] !== false && pathes[1] !== false ? true : false;
	return result;
}

function registerCommands(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('genymotion.setting', commandSetting));
	context.subscriptions.push(vscode.commands.registerCommand('genymotion.start', commandStart));
	context.subscriptions.push(vscode.commands.registerCommand('genymotion.open', commandOpen));
}

function commandStart() {
	readConfigurations();

	if (!detectePathes()) {
		return;
	}
	
	let statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
	statusItem.text = "$(loading~spin) Fetching devicdes...";
	statusItem.show();
	let dedMan = new DeviceManager.DeviceManager(genyPath, vboxPath);
	let devices = dedMan.devicesList();
	statusItem.dispose();

	let items: {
		label: string,
		detail: string,
		description: string,
		uuid: string
	}[] = [];

	for (let device of devices) {
		items.push({
			label: (device.state === "Powered Off" ? "$(vm)" : device.state === "Running" ? "$(vm-running)" : 
				device.state === "Paused" ? "$(vm-active)" : "$(vm-outline)") + " " + device.name,
			detail: device.android_version + ", " + device.ip,
			description: device.state,
			uuid: device.uuid
		});
	}

	vscode.window.showQuickPick(
		items,
		{
			canPickMany: false,
		}
	).then(value => {
		if (value && value.description !== "Running") {
			dedMan.startDevice(value.uuid);
		}
		});
	return;
}

function commandSetting() {
	readConfigurations();
	let items = [
		{
			'label': '$(gear) Genymotion Path',
			'description': 'The path that you installed Genymotion on it',
			'detail': 'Current value:\t' + genyPath,
			'isGenymotion': true,
		},
		{
			'label': '$(gear) VirtualBox Path',
			'description': 'The path that you installed VirtualBox on it',
			'detail': 'Current value:\t' + vboxPath,
			'isGenymotion': false,
		},
	];

	vscode.window.showQuickPick(items, {
		canPickMany: false,
		ignoreFocusOut: false,
	}).then( item => {
		if (item) {
			if (item.isGenymotion) {
				selectGenymotionPath();
			} else {
				selectVirtualBoxPath();
			}
			
		}
	});
}

function commandOpen() {
	readConfigurations();
	if (genyPath) {
		spawn(PathHelper.genymotionPath(genyPath), {
			cwd: genyPath
		});
	}
}
