// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const dictionary = require('./dictionary');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const channel = vscode.window.createOutputChannel("词典查询结果");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Hello World from GAL翻译助手!');
	vscode.languages.registerHoverProvider({scheme:"file"},{
		provideHover(){
			let text = dictionary.get();
			channel.appendLine(text);
			if(text !== null) return new vscode.Hover(text);
		}
	});

	// 注册vscode命令，需要在package.json中添加对应命令
	let disposable = vscode.commands.registerCommand('gal-translate-assist.dict', function() {
			// console.log("No Error!");
			try{
				showMsg(dictionary.get());
			}
			catch(e){
				vscode.window.showErrorMessage("查询插件运行失败！");
				console.error(e);
			}
		});

	context.subscriptions.push(disposable);
}



// 通用打印输出，传入值应当是字符串
function showMsg(msg) {
    channel.appendLine("查询结果：\n");
    channel.appendLine(msg);
    channel.show();
    // console.log("打印完成");
}

// 获取待查询文本
function selectedText() {
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return "";
    }
    var selection = editor.selection;
    var text = editor.document.getText(selection);
    return text;
}

exports.showMsg = showMsg;
exports.selectedText = selectedText;
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
