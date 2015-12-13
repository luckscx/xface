//融合时考虑性别：男男、女女、男女，采用不同融合方法
//是否考虑颜值？达到颜值最大化？
//先切分五官再拼接

var tencentyoutuyun = require('..');
var conf  = tencentyoutuyun.conf;
var youtu = tencentyoutuyun.youtu;
//var conf  = require('../tencentyoutuyun/conf');
var fs = require('fs');
var easyimg = require('easyimage');
var images = require('images');
var async = require('async');
// 设置开发者和应用信息, 请填写你在开放平台
var appid = '1004063';
var secretId = 'AKIDDXhxENZWUlh31d750hdMIHCxxutj5agc';
var secretKey = '6MXQckz00OAjVL8Vj0u9XmESARzGrNGw';
var userid = 'claude';

conf.setAppInfo(appid, secretId, secretKey, userid, 1);


var _minAndMax = function(arr){
    var min = arr[0];
    var max = arr[0];
    for(var i=0;i<arr.length;i++){
        if(arr[i]<min){
            min = arr[i];
        }
        else if(arr[i]>max){
            max = arr[i];
        }
    }
    var res = {};
    res.max = max;
    res.min = min;
    return res;
}

var _getRect = function(obj){
    var x=[];
    var y=[];
    for(var i=0;i<obj.length;i++){
        x[i] = obj[i].x;
        y[i] = obj[i].y;
    }
    var tmp = _minAndMax(x);
    var minX = tmp.min;
    var maxX = tmp.max;
    tmp = _minAndMax(y);
    var minY = tmp.min;
    var maxY = tmp.max;
    var rect = {};
    rect.x = minX;
    rect.y = minY;
    rect.width = maxX - minX;
    rect.height = maxY - minY;
    return rect;
};


var getStandard = function(organData){
    var obj = {};
    obj.height = organData.face_profile[10].y - organData.left_eyebrow[2].y;
    obj.width = organData.face_profile[20].x - organData.face_profile[0].x;
    return obj;
};

var getEyeData = function(organData,standard,out){
    out.eye_weizhi = (organData.left_eye[6].y - organData.left_eyebrow[2].y)/standard.height;
    out.eye_jianju = (organData.right_eye[4].x - organData.left_eye[4].x)/standard.width;
    out.eye_kaihe = (organData.left_eye[2].y - organData.left_eye[6].y)/standard.height;
};

var getMouthData = function(organData,detectData,standard,out){
    out.gender = detectData[0].gender>50?1:2;
    out.mouth_daxiao = (organData.mouth[6].x - organData.mouth[0].x)/standard.width;
    out.mouth_weizhi = (organData.mouth[9].y - organData.left_eyebrow[2].y)/standard.height;
    out.mouth_xiao = detectData[0].expression/100; //0-100
}; 

var getNoseData = function(organData,standard,out){
    out.nose_kuandu = (organData.nose[9].x - organData.nose[5].x)/standard.width;
    out.nose_gaodu = (organData.nose[0].y - organData.left_eyebrow[2].y)/standard.height;
};

var getCheekData = function(organData,standard,out){
    out.cheek_fengman = (organData.face_profile[16].x - organData.face_profile[4].x)/standard.width;
    out.xiaba_kuandu = (organData.face_profile[15].x - organData.face_profile[5].x)/standard.width;
    out.xiaba_weizhi = (organData.face_profile[10].y - organData.left_eyebrow[2].y)/standard.height;
    out.xiaba_jiankuandu = (organData.face_profile[13].x - organData.face_profile[7].x)/standard.width;
};

var getFaceData = function(imgPath,out,cb){
    var organData;
    var detectData;
    var standard = {};
    async.waterfall([
        function(callback){
            youtu.faceshape(imgPath,1,function(res){
                //console.log(res.data.face_shape[0]);
                console.log('faceshape');
                if(res.data.errorcode != 0){
                    callback(res.data.errormsg);
                }
                else{
                    organData = res.data.face_shape[0];
                    standard = getStandard(organData);
                    callback();
                }
            });
        },
        function(callback){
            youtu.detectface(imgPath,1,function(res){
                console.log('detectface');
                console.log(res.data.face);
                if(res.data.errorcode != 0){
                    callback(res.data.errormsg);
                }
                else{
                    detectData = res.data.face;
                    callback();
                }
            });    
        },
        function(callback){
            console.log('get data');
            getEyeData(organData,standard,out);
            getMouthData(organData,detectData,standard,out);
            getNoseData(organData,standard,out);
            getCheekData(organData,standard,out);
            callback();
        }
        
    ],function(err){
        if(err){
            cb(err);
        }
        else{
            cb();
        }
    });
};

var replaceFactor = function(dstFile,keyArr,valueArr){
    var content = fs.readFileSync('./test_data/src.dat','utf8');
    console.log(content);
    for(var x in keyArr){
        var tmp = content.indexOf(keyArr[x]+'"]=');
        var begin = content.indexOf('=',tmp);
        var end = content.indexOf(',',begin);
        var value = content.substr(begin+1,end-begin-1);
        console.log("aaaaaaaaaaaaa");
        console.log(x);
        console.log('["'+keyArr[x]+'"]='+value);
        console.log('["'+keyArr[x]+'"]='+valueArr[x]);
        content = content.replace('["'+keyArr[x]+'"]='+value,'["'+keyArr[x]+'"]='+valueArr[x]);
    }
    fs.writeFileSync(dstFile,content);
}

var femaleFactor = {
    'eye_weizhi':100/(11),
    'eye_jianju':(18*100)/(25),
    'eye_kaihe':(28*100)/(10),
    'mouth_daxiao':(82*100)/(39),
    'mouth_weizhi':(7*100)/(64),
    'mouth_xiao':(71*100)/(10),
    'nose_kuandu':(199*100)/(25),
    'nose_gaodu':(94*100)/(42),
    'cheek_fengman':(76*100)/(85),
    'xiaba_kuandu':(139*100)/(75),
    'xiaba_weizhi':65,
    'xiaba_jiankuandu':(31*100)/(50),
    'gender':1
};

var maleFactor = {
    'eye_weizhi':46*1000/(65),
    'eye_jianju':(25*1000)/(256),
    'eye_kaihe':(52*1000)/(65),
    'mouth_daxiao':(38*1000)/(397*2),
    'mouth_weizhi':(10*1000)/(662),
    'mouth_xiao':(73*1000)/(270),
    'nose_kuandu':(110*1000)/(242),
    'nose_gaodu':(80*1000)/481,
    'cheek_fengman':(149*1000)/(859),
    'xiaba_kuandu':(81*1000)/(782*3),
    'xiaba_weizhi':40,
    'xiaba_jiankuandu':(100*1000)/(545),
    'gender':1
};

var femaleMinFactor = {
    'eye_weizhi':-54,
    'eye_jianju':-17,
    'eye_kaihe':-16,
    'mouth_daxiao':-65,
    'mouth_weizhi':-10,
    'mouth_xiao':-54,
    'nose_kuandu':-124,
    'nose_gaodu':-92,
    'cheek_fengman':-72,
    'xiaba_kuandu':-74,
    'xiaba_weizhi':-128,
    'xiaba_jiankuandu':-29,
    'gender':0
};

var maleMinFactor = {
    'eye_weizhi':-46,
    'eye_jianju':-5,
    'eye_kaihe':-28,
    'mouth_daxiao':-27,
    'mouth_weizhi':-23,
    'mouth_xiao':-32,
    'nose_kuandu':-92,
    'nose_gaodu':-66,
    'cheek_fengman':-119,
    'xiaba_kuandu':-36,
    'xiaba_weizhi':-128,
    'xiaba_jiankuandu':-105,
    'gender':0
};

var femaleMaxFactor = {
    'eye_weizhi':11,
    'eye_jianju':21,
    'eye_kaihe':44,
    'mouth_daxiao':27,
    'mouth_weizhi':59,
    'mouth_xiao':23,
    'nose_kuandu':91,
    'nose_gaodu':46,
    'cheek_fengman':25,
    'xiaba_kuandu':125,
    'xiaba_weizhi':93,
    'xiaba_jiankuandu':84,
    'gender':100
};

var maleMaxFactor = {
    'eye_weizhi':15,
    'eye_jianju':40,
    'eye_kaihe':32,
    'mouth_daxiao':55,
    'mouth_weizhi':13,
    'mouth_xiao':56,
    'nose_kuandu':105,
    'nose_gaodu':33,
    'cheek_fengman':57,
    'xiaba_kuandu':126,
    'xiaba_weizhi':126,
    'xiaba_jiankuandu':38,
    'gender':100
};

var femaleDatFactor = {
    'eye_weizhi':'EYE_POS',
    'eye_jianju':'EYE_DIST',
    'eye_kaihe':'EYE_OPEN',
    'mouth_daxiao':'MOUTH_SIZE',
    'mouth_weizhi':'MOUTH_POS',
    'mouth_xiao':'MOUTH_END',
    'nose_kuandu':'NOSE_SIZE',
    'nose_gaodu':'NOSETOP_POS_Y',
    'cheek_fengman':'FACE_SCALE',
    'xiaba_kuandu':'JAW_WIDTH',
    'xiaba_weizhi':'JAW_POS',
    'xiaba_jiankuandu':'JAW_END',
    'gender':'nRoleType'
};

var maleDatFactor = {
    'eye_weizhi':'EYE_POS',
    'eye_jianju':'EYE_DIST',
    'eye_kaihe':'EYE_OPEN',
    'mouth_daxiao':'MOUTH_SIZE',
    'mouth_weizhi':'MOUTH_POS',
    'mouth_xiao':'MOUTH_END',
    'nose_kuandu':'NOSE_SIZE',
    'nose_gaodu':'NOSETOP_POS_Y',
    'cheek_fengman':'FACE_SCALE',
    'xiaba_kuandu':'JAW_WIDTH',
    'xiaba_weizhi':'JAW_POS',
    'xiaba_jiankuandu':'JAW_END',
    'gender':'nRoleType'
};

var maleInfo = {
    'factor':maleFactor,
    'minFactor':maleMinFactor,
    'maxFactor':maleMaxFactor,
    'datFactor':maleDatFactor,
};

var femaleInfo = {
    'factor':femaleFactor,
    'minFactor':femaleMinFactor,
    'maxFactor':femaleMaxFactor,
    'datFactor':femaleDatFactor,
};

var humanInfo = [maleInfo,femaleInfo];

var generateDat = function(imgPath,dstDatPath,cb){
    var out = {};
    getFaceData(imgPath,out,function(err){
        if(err){
            console.log(err);
        }         
        else{
            /*
            var minFactor;
            var maxFactor;
            var factor;
            var datFactor;
            
            minFactor = humanInfo[out.gender-1].minFactor;
            maxFactor = humanInfo[out.gender-1].maxFactor;
            factor = humanInfo[out.gender-1].factor;
            datFactor = humanInfo[out.gender-1].datFactor;
            for(var x in out){
                out[x] = minFactor[x]+Math.round(out[x]*factor[x]);
                out[x] = Math.min(maxFactor[x],out[x]);
                out[x] = Math.max(minFactor[x],out[x]);
            }
            replaceFactor(dstDatPath,datFactor,out);
            */
            fs.writeFileSync(dstDatPath,JSON.stringify(out));
        }
        cb(err);
    });
};

if(require.main === module){
    generateDat('./test_data/man-1.jpg','res.dat',function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log('finish');
        }
    });
}
