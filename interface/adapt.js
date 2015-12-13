/* jshint node:true*/
"use strict";


var starDB = {
    'upload/D0001.jpg' : {
        left_eyebrow : 'faked/D0001_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0001_right_eyebrow.jpg',
        left_eye : 'faked/D0001_left_eye.jpg',
        right_eye : 'faked/D0001_right_eye.jpg'
        mouth : 'faked/D0001_mouth.jpg'
    },
    'upload/D0002.jpg' : {
        left_eyebrow : 'faked/D0002_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0002_right_eyebrow.jpg',
        left_eye : 'faked/D0002_left_eye.jpg',
        right_eye : 'faked/D0002_right_eye.jpg'
        mouth : 'faked/D0002_mouth.jpg'
    },
    'upload/D0003.jpg' : {
        left_eyebrow : 'faked/D0003_left_eyebrow.jpg',
        right_eyebrow : 'faked/D0003_right_eyebrow.jpg',
        left_eye : 'faked/D0003_left_eye.jpg',
        right_eye : 'faked/D0003_right_eye.jpg'
        mouth : 'faked/D0003_mouth.jpg'
    },
}


var adapt = function(choose_pic,useBrow,useEye,useMouth) {

    if (starDB[choose_pic]) {

        var starPics = starDB[choose_pic];
        var chooseRes = {
            left_eyebrow:0,
            right_eyebrow:0,
            left_eye:0,
            right_eye:0,
            mouth:0,
        };

        if (useBrow === 1) {
            chooseRes.left_eyebrow = starPics.left_eyebrow;
            chooseRes.right_eyebrow = starPics.right_eyebrow;
        }

        if (useEye === 1) {
            chooseRes.left_eye = starPics.left_eye;
            chooseRes.right_eye = starPics.right_eye;
        }

        if (useMouth === 1) {
            chooseRes.mouth = starPics.mouth;
        }
        return chooseRes;
    }else{
        return 0;
    }
};


module.exports = adapt;

