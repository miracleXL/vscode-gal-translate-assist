"use strict";
// const fs = require("fs");
const request = require("request");
const config = require("./config");

exports.get = dictionary;
exports.searchMydict = searchMydict;

// @ts-ignore 待之后改成存放再工作区.vscode文件夹里
const mydict = require("./dict/mydict.json");
var cache = {};

async function dictionary(text = ""){
    if(text === "") return null;
    // 缓存一次最近查询，有机会再优化
    if(cache[text]) return cache[text];
    // 首先查询自定义名词表
    if(mydict[text]) return mydict[text];
    cache[text] = await jp2zh(text);
    config.channel.appendLine(cache[text]);
    return cache[text];
};

function searchMydict(text){
    if(mydict[text]){
        config.channel.appendLine(text + ":    " + mydict[text]);
        return mydict[text];
    }
    else return "查找失败！请确认是否已添加进名词表";
}


// 调用时应该使用await，且上级调用函数必须是异步函数async function，最外层非异步函数调用后应使用.then(处理函数)
// convert的值表示是否转换为字符串，为false时返回json
function jp2zh(text, convert = true){
    return new Promise(function(resolve, reject){
        var jsonData = {
            word : text,
            katakana : [],
            type : "",
            simple : [],
            detail : []
        };
        request(encodeURI(config.config.hjUrl + text), config.config.header, (err, res, body) => {
            if(err) reject("查询失败！");
            const cheerio = require('cheerio'), $ = cheerio.load(body);
            $(`.word-details-pane`).map(function (index, html){
                if(index !== 0) reject("查询失败！");
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
            if(convert) resolve(convertResult(jsonData));
            else resolve(jsonData);
        })
    });
}

// 转换查询结果至字符串
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
