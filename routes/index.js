var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');
var router = express.Router();
var mail = require('../interface/mail.js');
var imgfile = require('../interface/imgfile.js');
//var niubiFace = require('../face_merge/sample/faceProcessor.js');
var niubiFace = require('../face_merge/sample/faceProcessor.js');
var getFaceData = require('../face_merge/sample/getFaceData.js');
var adapt = require('../interface/adapt.js');
var msg = require('../interface/msg');

//上传图片
router.post('/n/uploadpic', function(req, res) {
    console.log('get pic upload req');
    var data = req.body.filename;
    if (!data) {
        msg.wrapper(73,null,res);
        return;
    }
    var base64Data = data.replace(/^data:image\/jpeg;base64,/, "");
    console.log(base64Data.length);
    imgfile.newFile(function(err,fileName) {
        var frontName = '';
        if (!err) {
            frontName = imgfile.getName(fileName);
            console.log(fileName);
            fs.writeFile(fileName,base64Data,'base64',function(err) {
                console.log(frontName);
                niubiFace.checkFace(fileName,function(err) {
                    if (!err) {
                        msg.wrapper(err,frontName,res);
                    }else{
                        msg.wrapper(1,err,res);
                    }
                });
            });
        }else{
            msg.wrapper(-1,null,res);
        }
    });
});


//图像融合
router.post('/n/merge_old',function(req,res) {
    console.log(req.body);
    var face1 = req.body.face1;
    var face2 = req.body.face2;
    var useBrow = + req.body.useBrow;
    var useEye = + req.body.useEye;
    var useMouth = + req.body.useMouth;

    if (!face1 || !face2) {
        res.end('need params');
        msg.wrapper(73,null,res);
        return;
    }

    //var chooseRes = adapt(face2,useBrow,useEye,useMouth);

    //if (!chooseRes) {
        //msg.wrapper(73,null,res);
        //return ;
    //}

    face1 = imgfile.fullname(face1);
    face2 = imgfile.fullname(face2);

    var chooseRes = {
        base:0,
        left_eyebrow:0,
        right_eyebrow:0,
        left_eye:0,
        right_eye:0,
        mouth:0,
        nose:0
    };

    if (useBrow === 1) {
        chooseRes.left_eyebrow = 1;
        chooseRes.right_eyebrow = 1;
    }

    if (useEye === 1) {
        chooseRes.left_eye = 1;
        chooseRes.right_eye = 1;
    }

    if (useMouth === 1) {
        chooseRes.mouth = 1;
    }

    console.log(chooseRes);


    imgfile.newFile(function(err,fileName) {
        console.log(fileName);
        niubiFace.mergeFace([face1,face2],chooseRes,fileName,function(err) {
            var frontName = '';
            if (!err) {
                frontName = imgfile.getName(fileName);
                msg.wrapper(err,frontName,res);
            }else{
                msg.wrapper(2,frontName,res);
            }
        });
    });
});

router.post('/n/merge',function(req,res) {
    
    console.log(req.body);
    var face1 = req.body.face1;
    var browIdx = req.body.browIdx;
    var eyeIdx = req.body.eyeIdx;
    var mouthIdx = req.body.mouthIdx;

    if (!face1) {
        console.log(1111);
        msg.wrapper(73,null,res);
        return;
    }

    var organArray = adapt(browIdx,eyeIdx,mouthIdx);

    if (!organArray) {
        msg.wrapper(73,null,res);
        return ;
    }

    face1 = imgfile.fullname(face1);

    imgfile.newFile(function(err,distName) {
        console.log(distName);
        niubiFace.mergeOrgan(organArray,face1,distName,function(err) {
            var frontName = '';
            if (!err) {
                frontName = imgfile.getName(distName);
                msg.wrapper(err,frontName,res);
            }else{
                msg.wrapper(2,frontName,res);
            }
        });
    });
});


//进行3d捏脸
router.post('/n/do',function(req,res) {
    var filename = req.body.filename; 
    var address = req.body.mailAddress || 'pancheng@tencent.com' ;
    if (!filename) {
        msg.wrapper(73,null,res);
        return;
    }

    var fullname = imgfile.fullname(filename);
    var distFile = imgfile.fullname(filename) + '.dat';

    getFaceData(fullname,distFile,function(err) {
        mail(null,distFile);
        console.log(distFile);
        msg.wrapper(err,null,res);
    });

});

module.exports = router;
