var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var redisMgr = require('../redis/redisMgr.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'X-Face' });
});


var uploadDir = './upload';

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
} 

function pad(num, size) {
    var s = num+"";
    while (s.length < size){
        s = "0" + s;
    }
    return s;
}

var pic_index_key = 'PIC_INDEX';

router.post('/uploadpic', function(req, res) {
    console.log('get pic upload req');
    var data = req.body.picfile;
    var base64Data = req.body.picfile.replace(/^data:image\/jpeg;base64,/, "");
    redisMgr.incr(pic_index_key,function(err,val) {
        if (!err && val > 0) {
            var fileName = util.format('%s.jpg',pad(val,5));
            console.log(fileName);
            var saveFile = path.join(uploadDir,fileName);
            fs.writeFile(saveFile,base64Data,'base64',function(err) {
                res.send(fileName);
                res.end();
            });
        }else{
            res.send('error');
            res.end();
        }
    });
});

module.exports = router;
