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

var faceObjectArray = {};

//src转成target的大小
var _resizeOrgan = function(src,target){
    var imageSrc = images(src);
    var imageTarget = images(target);
    imageSrc.resize(imageTarget.width(),imageTarget.height());
    return imageSrc;
}

var _getOrgans = function(imgPath,cb){
    console.log("getOrgans "+imgPath);
    var organArr = ['left_eye','right_eye','left_eyebrow','right_eyebrow','mouth','nose'];
    var name = new String(imgPath).substring(imgPath.lastIndexOf('/') + 1,imgPath.lastIndexOf('.')); 
    var suffix = new String(imgPath).substring(imgPath.lastIndexOf('.')); 
    var path = new String(imgPath).substring(0,imgPath.lastIndexOf('/')); 
    var dstPath = path+'/'+name+'_res'+'/';
    if(!fs.existsSync(dstPath)){
        fs.mkdirSync(dstPath);
    }
    youtu.faceshape(imgPath,1,function(res){
        if(res.data.errorcode != 0){
            cb(res.data.errormsg);
            return;
        }
        var faceObject = res.data.face_shape[0];
        faceObjectArray[name] = faceObject;
        async.eachSeries(organArr,function(organ,callback){
            _getPartofFace(res,imgPath,dstPath,suffix,organ,callback);
        },function(err){
            cb(err);
        });
    });
}

// 人脸比对 测试
//youtu.facecompare('a.jpg', 'a.jpg', function(data){
//    console.log("facecompare:" + JSON.stringify(data));
//});

// 人脸比对 测试
//youtu.fuzzydetect('a.jpg', function(data){
//    console.log("fuzzydetect:" + JSON.stringify(data));
//});

//youtu.fooddetect('a.jpg', function(data){
//    console.log("fooddetect:" + JSON.stringify(data));
//});

//youtu.imagetag('a.jpg', function(data){
//    console.log("imagetag:" + JSON.stringify(data));
//});
/*
var rect;
    youtu.faceshape('./test_data/SCUT-FBP-4.jpg',1,function(res){
        if(res.data.errorcode != 0){
            cb(res.data.errormsg);
            return;
        }
        var obj = res.data.face_shape[0].left_eye;
        console.log(obj);
        rect = _getRect(obj);
        console.log(rect);
        var base = images('./test_data/SCUT-FBP-4.jpg');
        var left_eye_self = images('./test_data/SCUT-FBP-4_res/left_eye.jpg');
        var left_eye_other = images('./test_data/SCUT-FBP-22_res/left_eye.jpg');
        left_eye_other.resize(left_eye_self.width(),left_eye_self.height());
        base.draw(left_eye_other,rect.x,rect.y);
        
        obj = res.data.face_shape[0].nose;
        console.log(obj);
        rect = _getRect(obj);
        console.log(rect);
        var nose_self= images('./test_data/SCUT-FBP-4_res/nose.jpg');
        var nose_other= images('./test_data/SCUT-FBP-22_res/nose.jpg');
        nose_other.resize(nose_self.width(),nose_self.height());
        base.draw(nose_other,rect.x,rect.y);

        obj = res.data.face_shape[0].mouth;
        console.log(obj);
        rect = _getRect(obj);
        console.log(rect);
        var mouth_self= images('./test_data/SCUT-FBP-4_res/mouth.jpg');
        var mouth_other= images('./test_data/SCUT-FBP-22_res/mouth.jpg');
        mouth_other.resize(mouth_self.width(),mouth_self.height());
        base.draw(mouth_other,rect.x,rect.y);
        
        base.save('./res.jpg',{quality:100});
    });
*/

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
    minX = tmp.min;
    maxX = tmp.max;
    var tmp = _minAndMax(y);
    minY = tmp.min;
    maxY = tmp.max;
    var rect = {};
    rect.x = minX;
    rect.y = minY;
    rect.width = maxX - minX;
    rect.height = maxY - minY;
    return rect;
}

/*
var getLeftEye = function(){
    youtu.faceshape('SCUT-FBP-22.jpg',1,function(res){
        //console.log(JSON.stringify(data));
        var left_eye = res.data.face_shape[0].left_eye;
        console.log(left_eye);
        //var fdRead = fs.openSync('SCUT-FBP-22.jpg',"r");
        //var fdWrite = fs.openSync('out.jpg',"w+");
        //var length = 486*638;
        var rect = _getRect(left_eye);
        console.log(rect);
        //var buffer = new Buffer(length);
        //fs.readSync(fdRead,buffer,0,length,0);
        //for(var i=0;i<left_eye.length;i++){
        //    var point = left_eye[i];
        //    console.log(buffer[point.x*point.y]);
        //}
        //fs.writeSync(fdWrite,buffer,0,length,0);
        //fs.closeSync(fdRead);
        //fs.closeSync(fdWrite);
        easyimg.crop({
            src:'SCUT-FBP-22.jpg', dst: 'left_eye.jpg',
            width:res.data.image_width, height:res.data.image_height,
            cropwidth:rect.width, cropheight:rect.height,
            x:rect.x, y:rect.y,
            gravity:'NorthWest'

        }).then(
            function (file) {
                console.log(file);
            },
            function(err){
                console.log(err);
            }   
        );
    });
}


var getRightEye = function(){
    youtu.faceshape('SCUT-FBP-22.jpg',1,function(res){
        var right_eye = res.data.face_shape[0].right_eye;
        console.log(right_eye);
        var rect = _getRect(right_eye);
        console.log(rect);
        easyimg.crop({
            src:'SCUT-FBP-22.jpg', dst: 'right_eye.jpg',
            width:res.data.image_width, height:res.data.image_height,
            cropwidth:rect.width, cropheight:rect.height,
            x:rect.x, y:rect.y,
            gravity:'NorthWest'

        }).then(
            function (file) {
                console.log(file);
            },
            function(err){
                console.log(err);
            }   
        );
    });
}

var getNose = function(){
    youtu.faceshape('SCUT-FBP-22_resize.jpg',1,function(res){
        var nose = res.data.face_shape[0].nose;
        console.log(nose);
        var rect = _getRect(nose);
        console.log(rect);
        easyimg.crop({
            src:'SCUT-FBP-22.jpg', dst: 'nose.jpg',
            width:res.data.image_width, height:res.data.image_height,
            cropwidth:rect.width, cropheight:rect.height,
            x:rect.x, y:rect.y,
            gravity:'NorthWest'

        }).then(
            function (file) {
                console.log(file);
            },
            function(err){
                console.log(err);
            }   
        );
    });
}
*/

var _getPartofFace = function(res,srcPath,dstPath,suffix,organ,cb){
    console.log(organ);
    var organData = res.data.face_shape[0][organ];
    //console.log(organData);
    var rect = _getRect(organData);
    //console.log(rect);
    easyimg.crop({
        src:srcPath, dst: dstPath+organ+suffix,
        width:res.data.image_width, height:res.data.image_height,
        cropwidth:rect.width, cropheight:rect.height,
        x:rect.x, y:rect.y,
        gravity:'NorthWest'

    }).then(
        function (file) {
            //console.log(file);
            cb();
        },
        function(err){
            cb(err);
        }   
    );
}


var _processOneFace = function(face,cb){
    if(!fs.existsSync(face)){
        cb(face+" is not exists!");
    }
    _getOrgans(face,cb);
}

var _processFace = function(faceArray,cb){
    faceObjectArray = {};
    async.eachSeries(faceArray,function(face,callback){
        _processOneFace(face,callback);
    },function(err){
        cb(err);
    });
}


var composition = function(faceArray,savePath,method,cb){
    var name = [];
    var suffix = [];
    var path = [];

    for(var i=0;i<faceArray.length;i++){
        name.push(new String(faceArray[i]).substring(faceArray[i].lastIndexOf('/') + 1,faceArray[i].lastIndexOf('.'))); 
        suffix.push(new String(faceArray[i]).substring(faceArray[i].lastIndexOf('.'))); 
        path.push(new String(faceArray[i]).substring(0,faceArray[i].lastIndexOf('/'))); 
    }
    
    var base,selfIndex;
    
    selfIndex = method.base;
    base = images(faceArray[method.base]);
    
    for(organ in method){
        var selfOrgan,otherOrgan;
        if(organ === 'base' || organ.length === 0 || method[organ] === selfIndex){
            continue;
        }        
        var otherIndex = method[organ];
        var selfPath = path[selfIndex]+'/'+name[selfIndex]+'_res/'+organ+suffix[selfIndex];
        var otherPath = path[otherIndex]+'/'+name[otherIndex]+'_res/'+organ+suffix[otherIndex];
        if(!fs.existsSync(selfPath)){
            cb(selfPath+" is not exists!");
            return;
        } 
        if(!fs.existsSync(otherPath)){
            cb(otherPath+" is not exists!");
            return;
        }
        var rect =  _getRect(faceObjectArray[name[selfIndex]][organ]);
        var selfOrgan = images(selfPath);
        var otherOrgan = images(otherPath);
        otherOrgan.resize(selfOrgan.width(),selfOrgan.height());
        base.draw(otherOrgan,rect.x,rect.y);
    }
    base.save(savePath,{quality:100});
    cb();
}

var getFaceScore = function(imgPath,cb){
    youtu.detectface(imgPath,1,function(res){
        console.log(res.data.face);
    });    
};

var _getFaceShape = function(face,dataArray,cb){
    youtu.faceshape(face,1,function(res){
        if(res.data.errorcode != 0){
            cb(res.data.errormsg);
            return;
        }
        var faceObject = res.data;
        dataArray[face] = faceObject;
        cb();
    });
}

var _joint = function(face0,face1,dataArray,cb){
    async.waterfall([
        function(callback){
            easyimg.crop({
                src:face0, dst: 'half1.jpg',
                width:dataArray[face0].image_width, height:dataArray[face0].image_height,
                cropwidth:dataArray[face0].face_shape[0].nose[0].x, cropheight:dataArray[face0].image_height,
                x:0, y:0,
                gravity:'NorthWest'

            }).then(
                function (file) {
                    callback();
                },
                function(err){
                    callback(err);
                }   
            );

        },
        function(callback){
            var base = images(face1);
            var halfFace = images('half.jpg'); 
            halfFace.resize(dataArray[face1].face_shape[0].nose[0].x,dataArray[face1].image_height);
            base.draw(halfFace,0,0);
            base.save('./res.jpg',{quality:100});
            callback();
        }

    ],function(err){
        cb(err);
    })

}

var halfFaceJoint = function(face0,face1,cb){
    var dataArray = {};
    async.waterfall([
        function(callback){
            _getFaceShape(face0,dataArray,callback);
        },
        function(callback){
            _getFaceShape(face1,dataArray,callback);
        },
        function(callback){
            _joint(face0,face1,dataArray,callback);
        }
    ],function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log('success');
        }
    });
}

var globalFaceArray = ['./test_data/SCUT-FBP-22.jpg','./test_data/SCUT-FBP-4.jpg'];

var globalMethod = {
    base:0,
    left_eyebrow:1,
    right_eyebrow:1,
    left_eye:0,
    right_eye:0,
    mouth:1,
    nose:1
};

var mergeFace = function(faceArray,method,savePath,cb){
    async.waterfall([
        function(callback){
            _processFace(faceArray,callback);
        },
        function(callback){
            console.log('start composition');
            composition(faceArray,savePath,method,callback);
        }
    ],function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log('success');
        }
        cb(err);
    });
}

exports.mergeFace = mergeFace;

if(require.main === module){
    //main();
    //getFaceScore('./test_data/SCUT-FBP-4.jpg',1);
    //halfFaceJoint('./test_data/SCUT-FBP-4.jpg','./test_data/SCUT-FBP-22.jpg');
    mergeFace(globalFaceArray,globalMethod,'..compositon.jpg',function(){
        console.log('callback');
    });
}
