/* jshint node:true*/
"use strict";

var redisMgr = require('../redis/redisMgr.js');
var util = require('util');
var path = require('path');
var fs = require('fs');

var imgfile = {};

var uploadDir = './public/upload';

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
} 

var pic_index_key = 'PIC_INDEX';

function pad(num, size) {
    var s = num+"";
    while (s.length < size){
        s = "0" + s;
    }
    return s;
}

imgfile.newFile = function(cb) {
    redisMgr.incr(pic_index_key,function(err,val) {
        if (!err && val > 0) {
            var fileName = util.format('%s.jpg',pad(val,5));
            console.log(fileName);
            var saveFile = path.join(uploadDir,fileName);
            cb(null,saveFile);
        }else{
            console.error('redis error');
            cb(-1);
        }
        
    });
};

module.exports = imgfile;

