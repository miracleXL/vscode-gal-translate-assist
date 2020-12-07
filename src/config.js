"use strict";

const config = {
    header : {
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
            Cookie: 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
        }
    },

    // 本地字典路径
    mydictPath : __dirname + "\\dict\\mydict.json",         //自定义名词表
    hjUrl : 'https://dict.hjenglish.com/jp/jc/',
    // 词典来源：https://github.com/pwxcoo/chinese-xinhua
    // const idiomUrl = __dirname+"\\dict\\idiom.json";           //成语词典
    // const xiehouyuUrl = __dirname+"\\dict\\xiehouyu.json";     //歇后语
    // const ciUrl = __dirname+"\\dict\\ci.json";                 //词典
    // const wordUrl = __dirname+"\\dict\\word.json";             //字典

    initialled: false,
}


exports.config = config;