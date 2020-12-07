// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const config = require("./config").config;
const dictionary = require("./dictionary").dictionary;
const jpdict = require("./dictionary").jpdict;
const mydict = require("./dictionary").mydict;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

class ControlCenter{
	constructor(){
		this.channel = vscode.window.createOutputChannel("Yume");
		if(vscode.workspace.workspaceFolders && config.initialled){
			this.initialled = true;
		}
		else{
			this.initialled = false;
		}
	}

	activate(context){
		// 注册vscode命令，需要在package.json中添加对应命令
		let cc = this;
		context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',function() {
			try{
				jpdict.search(cc.selectedText()).then((res)=>{
					cc.channel.appendLine(res);
					cc.channel.show();
				})
			}
			catch(e){
				vscode.window.showErrorMessage("查询失败！请检查错误日志");
				console.error(e);
			}
		}));
		context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",function(){
			try{
				cc.channel.appendLine(mydict.search(cc.selectedText()));
				cc.channel.show();
			}
			catch(e){
				vscode.window.showErrorMessage("未知错误！");
			}
		}));
		context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",async function(){
			if(cc.initialled){
				let res = await mydict.add(cc.selectedText());
				cc.channel.appendLine(res);
			}
			else{
				cc.channel.appendLine("请先初始化项目！");
			}
		}));
	}

	// 获取待查询文本
	selectedText() {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let selection = editor.selection;
		return editor.document.getText(selection);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Hello World from GAL翻译助手!');
	let cc = new ControlCenter();
	cc.activate(context);
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
