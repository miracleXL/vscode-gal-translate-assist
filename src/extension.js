// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const config = require("./config").config;
const dictionary = require("./dictionary").dictionary;
const jpdict = require("./dictionary").jpdict;
const mydict = require("./dictionary").mydict;
const baiduAPI = require("./baiduAPI").baiduAPI;

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

	translate(){
		baiduAPI.search(this.selectedText()).then(res => {
			this.channel.appendLine(res);
			this.channel.show();
		}).catch(e => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			console.error(e);
		});
	}

	autodcit(){
		dictionary.autoSearch(this.selectedText());
	}

	jpdict() {
		jpdict.search(this.selectedText()).then((res)=>{
			this.channel.appendLine(res);
			this.channel.show();
		}).catch((e)=>{
			vscode.window.showErrorMessage("查询失败！请检查错误日志");
			console.error(e);
		})
	}

	searchMydict(){
		try{
			this.channel.appendLine(mydict.search(this.selectedText()));
			this.channel.show();
		}
		catch(e){
			vscode.window.showErrorMessage("未知错误！");
			console.error(e);
		}
	}

	addToMydict(){
		if(this.initialled){
			mydict.add(this.selectedText()).then((res)=>{
			this.channel.appendLine(res);
			}).catch((e)=>{
				vscode.window.showErrorMessage("未知错误！");
				console.error(e);
			})
		}
		else{
			this.channel.appendLine("请先初始化项目！");
		}
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
	let yume = new ControlCenter();

	context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',()=>{yume.jpdict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",()=>{yume.searchMydict()}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",()=>{yume.addToMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
