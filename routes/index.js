var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var mail = require('../interface/mail.js');
var imgfile = require('../interface/imgfile.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'X-Face' });
});


router.post('/n/uploadpic', function(req, res) {
    console.log('get pic upload req');
    var data = req.body.picfile;
    var base64Data = req.body.picfile.replace(/^data:image\/jpeg;base64,/, "");
    imgfile.newFile(function(err,fileName) {
        if (!err) {
            console.log(fileName);
            fs.writeFile(fileName,base64Data,'base64',function(err) {
                var frontName = fileName.slice(8,-1);
                res.send(frontName);
                res.end();
            });
        }else{
            res.send('error');
            res.end();
        }
    });
});


router.post('/n/merge',function(req,res) {

    //call claude function 
    //get dat file name
    mail(address,filename);
    res.send('ok');
    res.end();
    
});


router.post('/n/do',function(req,res) {
    var filename = req.body.picfile; 
    var address = req.body.mailAddress;

    //call claude function 
    //get dat file name
    mail(address,filename);
    res.send('ok');
    res.end();
    
});

module.exports = router;
