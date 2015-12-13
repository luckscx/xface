/* jshint node:true*/
"use strict";


var browDB = {
    '1' : {
        left_eyebrow : 'faked/D0001_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0001_right_eyebrow.jpg',
    },
    '2' : {
        left_eyebrow : 'faked/D0002_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0002_right_eyebrow.jpg',
    },
    '3' : {
        left_eyebrow : 'faked/D0003_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0003_right_eyebrow.jpg',
    },
    '4' : {
        left_eyebrow : 'faked/D0003_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0003_right_eyebrow.jpg',
    },
}

var eyeDB = {
    '1' : {
        left_eye : 'faked/D0001_left_eyebrow.jpg',
        right_eye : 'faked/D0001_right_eyebrow.jpg',
    },
    '2' : {
        left_eye : 'faked/D0002_left_eyebrow.jpg',
        right_eye : 'faked/D0002_right_eyebrow.jpg',
    },
    '3' : {
        left_eye : 'faked/D0003_left_eyebrow.jpg',
        right_eye : 'faked/D0003_right_eyebrow.jpg',
    },
    '4' : {
        left_eye : 'faked/D0003_left_eyebrow.jpg',
        right_eye : 'faked/D0003_right_eyebrow.jpg',
    },
}

var mouthDB = {
    '1' : {
        mouth : 'faked/D0001_left_eyebrow.jpg',
    },
    '2' : {
        mouth : 'faked/D0002_left_eyebrow.jpg',
    },
    '3' : {
        mouth : 'faked/D0003_left_eyebrow.jpg',
    },
    '4' : {
        mouth : 'faked/D0003_left_eyebrow.jpg',
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

    if (mouthDB > 0) {
        var mouthObj = mouthDB[mouthIdx];
        if (mouthObj) {
            chooseRes.mouth = mouthObj.mouth;
        }
    }
    console.log(chooseRes);
    return chooseRes;
};


module.exports = adapt;

