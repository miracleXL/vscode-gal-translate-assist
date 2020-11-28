"use strict";
// const fs = require("fs");
const request = require("request");
const Func = require("./extension");
const config = require("./config")

exports.get = dictionary;
exports.searchMydict = searchMydict;

// @ts-ignore 待之后改成存放再工作区.vscode文件夹里
const mydict = require("./dict/mydict.json");
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
        request(encodeURI(config.config.hjUrl + text), config.config.header, (err, res, body) => {
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