var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var mail = require('../interface/mail.js');
var imgfile = require('../interface/imgfile.js');
var faceMerge = require('../face_merge/sample/faceProcessor');
var msg = require('../interface/msg');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'X-Face' });
});


router.post('/n/uploadpic', function(req, res) {
    console.log('get pic upload req');
    var data = req.body.picfile;
    if (!data) {
        msg.wrapper(73,null,res);
        return;
    }
    var base64Data = req.body.picfile.replace(/^data:image\/jpeg;base64,/, "");
    imgfile.newFile(function(err,fileName) {
        var frontName = '';
        if (!err) {
            frontName = imgfile.getName(fileName);
            console.log(fileName);
            fs.writeFile(fileName,base64Data,'base64',function(err) {
                console.log(frontName);
                msg.wrapper(err,frontName,res);
            });
        }else{
            msg.wrapper(-1,null,res);
        }
    });
});


router.post('/n/merge',function(req,res) {
    var face1 = req.body.face1;
    var face2 = req.body.face2;
    console.log(req.body);

    if (!face1 || !face2) {
        res.end('need params');
        return;
    }

    face1 = imgfile.fullname(face1);
    face2 = imgfile.fullname(face2);

    var choose = req.body.choose;

    choose = {
        base:0,
        left_eyebrow:1,
        right_eyebrow:1,
        left_eye:1,
        right_eye:1,
        mouth:1,
        nose:1
    };

    imgfile.newFile(function(err,fileName) {
        console.log(fileName);
        faceMerge([face1,face2],choose,fileName,function(err) {
            if (!err) {
                var frontName = imgfile.getName(fileName);
                console.log(frontName);
                res.send(frontName);
            }else{
                res.send(err);
            }
            res.end();
        });
    });
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
