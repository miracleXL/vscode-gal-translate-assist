"use strict";
const fs = require("fs");
const request = require("request");
const Func = require("./extension");

exports.get = dictionary;
exports.searchMydict = searchMydict;

const header = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
        Cookie: 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
    }
};
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
var cache = {};

function dictionary(){
    let text = Func.selectedText();
    if(text === "") return null;
    // 缓存一次最近查询，有机会再优化
    if(cache[text]) return cache[text];
    // 首先查询自定义名词表
    if(mydict[text]) return mydict[text];
    else{
        return jp2zh(text).then(function(jsonData){
                // console.log(jsonData);
                cache[text] = convertResult(jsonData);
                return cache[text];
            }).catch(function(e){
                console.log(e);
                return "查询失败！";
            });
    }
};

function searchMydict(){
    let text = Func.selectedText();
    if(mydict[text]) Func.showMsg(mydict[text]);
    else Func.showMsg("查找失败！请确认是否已添加进名词表");
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
            // console.log("回调执行完成");
            resolve(jsonData);
        })
    });
}

// 转换查询结果
function convertResult(jsonData){
    let msg = "";
    msg += jsonData["word"] + "  \n";
    msg += jsonData["katakana"][0] + jsonData["katakana"][1] + "  " + jsonData["type"] + "  \n";
    msg += "释义：" + "  \n";
    for(let data of jsonData["simple"]){
        msg += "  " + data + "  \n";
    }
    msg += "详细释义：" + "  \n";
    for(let data of jsonData["detail"]){
        msg += "  " + data + "  \n";
    }
    // console.log(msg);
    return msg;
}
