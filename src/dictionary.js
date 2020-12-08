"use strict";
const fs = require("fs");
const request = require("request");
const config = require("./config").config;

class Dictionary{
    constructor(){
        this.cache = {};
    }
    autoSearch(text){
        return "尚未实现";
    }
}

class JPdict extends Dictionary{
    constructor(){
        super();
    }

    // convert的值表示是否转换为字符串，为false时返回json
    search(text, convert = true){
        let dict = this;
        if(text === "") return null;
        // 缓存查询结果
        if(this.cache[text]) return this.cache[text];
        return new Promise(function(resolve, reject){
            let jsonData = {
                word : text,
                katakana : [],
                type : "",
                simple : [],
                detail : []
            };
            request(encodeURI(config.hjUrl + text), config.hj_header, (err, res, body) => {
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
                if(convert) resolve(dict.convertResult(jsonData));
                else resolve(jsonData);
            })
        });
    }

    // 转换查询结果至字符串
    convertResult(jsonData){
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
}

class ZhDict extends Dictionary{
    constructor(){
        super();
    }
}

class Mydict extends Dictionary{
    constructor(){
        super();
        // @ts-ignore
        this.mydict = require("./dict/mydict.json");
    }
    
    search(text){
        if(text === "") return null;
        if(this.mydict[text]){
            return this.mydict[text];
        }
        return "查找失败！请确认是否已添加进名词表";
    }

    async add(jp, zh){
        this.mydict[jp] = zh;
        return new Promise(function(resolve, reject){
            try{
                fs.writeFileSync(config["mydictPath"], this.mydict);
            }
            catch(e){
                reject(e);
            }
            resolve(`成功添加"${jp}"："${zh}"到自定义词典`);
        })
    }
}

let dictionary = new Dictionary();
let jpdict = new JPdict();
let mydict = new Mydict();

module.exports = {dictionary, jpdict, mydict};