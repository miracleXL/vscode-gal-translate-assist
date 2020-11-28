// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const dictionary = require('./dictionary');
const config = require("./config");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Hello World from GAL翻译助手!');
	vscode.languages.registerHoverProvider({scheme:"file"},{
		async provideHover(){
			let text = selectedText();
			text = await dictionary.get(text);
			if(text !== null){
				return new vscode.Hover(text);
			}
		}
	});

	// 注册vscode命令，需要在package.json中添加对应命令
	let disposable = vscode.commands.registerCommand('gal-translate-assist.dict', function() {
			// console.log("No Error!");
			try{
				dictionary.get(selectedText());
				config.channel.show();
			}
			catch(e){
				vscode.window.showErrorMessage("查询插件运行失败！");
				console.error(e);
			}
		});

	context.subscriptions.push(disposable);
}



// 获取待查询文本
function selectedText() {
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return "";
    }
    var selection = editor.selection;
    return editor.document.getText(selection);
}

exports.selectedText = selectedText;
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
