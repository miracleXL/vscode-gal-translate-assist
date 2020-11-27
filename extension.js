// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const fs = require('fs');
const dictionary = require('./dictionary.js');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Hello World from GAL翻译助手!');
	// dictionary.get();
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('gal-translate-assist.helloWorld', function () {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from GAL翻译助手!');
	// });

	let disposable = vscode.commands.registerCommand('gal-translate-assist.dict', function() {
			// console.log("No Error!");
			try{
				dictionary.get();
			}
			catch(e){
				vscode.window.showErrorMessage("查询插件运行失败！");
				console.log(e);
			}
		});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
