/* jshint node:true*/
"use strict";


var msg = {};

var msgDefine = {
    1 : '亲的颜值爆表，服务器君表示压力很大',
    73 : '参数错误',
};


msg.wrapper = function(err,content,res) {
    var result = {};
    if (err) {
        result.errCode = err;
        console.log(msgDefine[err]);
        if (msgDefine[err]) {
            result.msg = msgDefine[err];
        }else{
            result.msg = '服务器内部错误';
        }
    }else{
        result.errCode = 0;
        result.msg = 'success';
        result.result = content;
    }
    console.log(result);

    res.jsonp(result);
};




module.exports = msg;



