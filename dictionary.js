"use strict";
const vscode = require("vscode");
const fs = require("fs");
const request = require("request");

const header = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
        Cookie: 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
    }
};
const channel = vscode.window.createOutputChannel("词典查询结果");
// 本地字典路径
const mydictPath = __dirname+"\\dict\\mydict.json";         //自定义名词表
const hjUrl = 'https://dict.hjenglish.com/jp/jc/';
// 词典来源：https://github.com/pwxcoo/chinese-xinhua
// const idiomUrl = __dirname+"\\dict\\idiom.json";           //成语词典
// const xiehouyuUrl = __dirname+"\\dict\\xiehouyu.json";     //歇后语
// const ciUrl = __dirname+"\\dict\\ci.json";                 //词典
// const wordUrl = __dirname+"\\dict\\word.json";             //字典
// @ts-ignore
const mydict = JSON.parse(fs.readFileSync(mydictPath));

exports.get = dictionary;
exports.searchMydict = searchMydict;

function dictionary(){
    let text = selectedText();
    // 首先查询自定义名词表
    if(mydict[text]) showMsg(mydict[text]);
    else{
        jp2zh(text).then(function(jsonData){
            console.log(jsonData);
            printResult(jsonData);
        }).catch(function(e){
            console.log(e);
            showMsg("查询失败！");
        });
    }
};

function searchMydict(){
    let text = selectedText();
    if(mydict[text]) showMsg(mydict[text]);
    else showMsg("查找失败！请确认是否已添加进名词表");
    return mydict[text];
}


function jp2zh(text){
    return new Promise(function(resolve, reject){
        var jsonData = {
            word : text,
            katakana : [],
            type : "",
            simple : [],
            detail : []
        };
        request(encodeURI(hjUrl + text), header, (err, res, body) => {
            if(err) reject(err);
            const cheerio = require('cheerio'), $ = cheerio.load(body);
            $(`.word-details-pane`).map(function (index, html){
                if(index !== 0) reject({word:"查询失败！"});
                let sub$ = cheerio.load(html);
                sub$('.word-info .pronounces span').each(function(){
                    jsonData["katakana"].push($(this).text());
                });
                jsonData["type"] = sub$('.simple h2').text();
                sub$('.simple li').each(function(){
                    jsonData["simple"].push($(this).text());
                });
                sub$('.detail-groups p').each(function(){
                    let tmp = $(this).text().trim();
                    if(tmp != "") jsonData["detail"].push(tmp);
                });
            })
            console.log("回调执行完成");
            resolve(jsonData);
        })
    });
}

// 转换并打印输出查询结果
function printResult(jsonData){
    showMsg(jsonData["word"]);
    showMsg(jsonData["katakana"][0] + jsonData["katakana"][1] + "  " + jsonData["type"]);
    showMsg("释义：");
    for(let data of jsonData["simple"]){
        showMsg("  " + data);
    }
    showMsg("详细释义：");
    for(let data of jsonData["detail"]){
        showMsg("  " + data);
    }
    showMsg("\n");
}

// 通用打印输出，传入值应当是字符串
function showMsg(msg) {
    // channel.appendLine("查询结果：\n");
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