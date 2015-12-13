/* jshint node:true*/
"use strict";
var path = require('path');


var browDB = {
    '1' : {
        left_eyebrow : 'test_data/left_eyebrow.png',
        right_eyebrow : 'test_data/right_eyebrow.png',
    },
    '2' : {
        left_eyebrow : 'test_data/left_eyebrow.png',
        right_eyebrow : 'test_data/right_eyebrow.png',
    },
    '3' : {
        left_eyebrow : 'test_data/left_eyebrow.png',
        right_eyebrow : 'test_data/right_eyebrow.png',
    },
    '4' : {
        left_eyebrow : 'test_data/left_eyebrow.png',
        right_eyebrow : 'test_data/right_eyebrow.png',
    },
}

var eyeDB = {
    '1' : {
        left_eye : 'test_data/left_eye.png',
        right_eye : 'test_data/right_eye.png',
    },
    '2' : {
        left_eye : 'test_data/left_eye.png',
        right_eye : 'test_data/right_eye.png',
    },
    '3' : {
        left_eye : 'test_data/left_eye.png',
        right_eye : 'test_data/right_eye.png',
    },
    '4' : {
        left_eye : 'test_data/left_eye.png',
        right_eye : 'test_data/right_eye.png',
    },
}

var mouthDB = {
    '1' : {
        mouth : 'test_data/mouth.png',
    },
    '2' : {
        mouth : 'test_data/mouth.png',
    },
    '3' : {
        mouth : 'test_data/mouth.png',
    },
    '4' : {
        mouth : 'test_data/mouth.png',
    },
}


var adapt = function(browIdx,eyeIdx,mouthIdx) {

    var chooseRes = {};

    console.log(browIdx);
    console.log(eyeIdx);
    console.log(mouthIdx);

    if (browIdx > 0) {
        var browObj = browDB[browIdx];
        console.log(browObj);
        if (browObj) {
            chooseRes.left_eyebrow = browObj.left_eyebrow;
            chooseRes.right_eyebrow = browObj.right_eyebrow;
        }
    }

    if (eyeIdx > 0) {
        var eyeObj = eyeDB[eyeIdx];
        if (eyeObj) {
            chooseRes.left_eye = eyeObj.left_eye;
            chooseRes.right_eye = eyeObj.right_eye;
        }
    }

    if (mouthIdx > 0) {
        var mouthObj = mouthDB[mouthIdx];
        if (mouthObj) {
            chooseRes.mouth = mouthObj.mouth;
        }
    }

    console.log(chooseRes);

    for(var key in chooseRes){
        chooseRes[key] = path.join(__dirname + '/../face_merge/sample',chooseRes[key]);
        
    }
    console.log(chooseRes);
    return chooseRes;
};


module.exports = adapt;

