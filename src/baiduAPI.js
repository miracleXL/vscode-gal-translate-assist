"use strict";
const crypto = require("crypto");
const request = require("request");
const config = require("./config").config;

class Baidu{
    constructor(){
        this.cache = {}
    }

    search(text, to = "zh"){
        if(this.cache[text]) return this.cache[text];
        return new Promise((resolve, reject)=>{
            let salt = (new Date()).getTime();
            let data = {
                q: text,
                from: 'auto',
                to: to,
                appid: config.baiduAPI.appId,
                salt: salt,
                sign: this.getMD5(config.baiduAPI.appId+text+salt+config.baiduAPI.appKey)
            };
            request.get(config.baiduAPI.api,{
                gzip: true,
                headers: {
                    Referer: config.baiduAPI.api,
                    "User-Agent" : config.UA
                },
                qs: data
            },(err, res, body)=>{
                if(err) reject(err);
                let sentences = JSON.parse(body);
                if (sentences.trans_result) {
                    sentences = sentences.trans_result;
                    let result = "";
                    for (let i in sentences) {
                        result += sentences[i].dst;
                    }
                    resolve(result);
                } else {
                    reject(
                        `Error. Raw result: ${body}`
                    );
                }
            });
        });
    }

    getMD5(content){
        if(!content){
            return content;
        }
        var md5 = crypto.createHash('md5');
        md5.update(content);
        var d = md5.digest('hex'); 
        return d.toLowerCase();
    }
}

let baidu = new Baidu();

exports.baiduAPI = baidu;