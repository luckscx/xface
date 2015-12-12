$(document).ready(function(){
    function toFixed2(num) {
        return parseFloat(+num.toFixed(2));
    }

    $('#submit').on('click', function(){
        var image = $('#changeAvatar img').eq(0).attr('src');
        $.ajax({
            url: 'n/uploadpic',
            type: 'POST',
            //dataType: 'jsonp',
            //contentType: "multipart/form-data; charset=utf-8",
            data: {
                picfile: image
            },
            success: function(json){
                console.log(json);
            }
        }); 
    });
    $('#cancleBtn').on('click', function() {
        $("#showEdit").fadeOut();
        $('#showResult').fadeIn();
    });

    $('#confirmBtn').on('click', function() {
        $("#showEdit").fadeOut();
        $('.page').hide();
        var $image = $('#report > img');
        var dataURL = $image.cropper("getCroppedCanvas");
        var imgurl = dataURL.toDataURL("image/jpeg", 0.5);
        var index = $(this).attr('data-index');
        $("#changeAvatar img").eq(index).attr("src", imgurl);

        $('#showResult').fadeIn();

        //var data = $image.cropper("getData");
        //console.log(data);
        //console.log('imgurl' + imgurl);
    });

    function cutImg(type) {
        $('#showResult').fadeOut();
        $("#showEdit").fadeIn();
        var $image = $('#report > img');
        $image.cropper({
            aspectRatio: 1 / 1,
            autoCropArea: 0.7,
            strict: true,
            guides: false,
            center: true,
            highlight: false,
            dragCrop: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            zoom: -0.2,
            checkImageOrigin: true,
            background: false,
            minContainerHeight: 600,
            minContainerWidth: 400
        });
    }

    function doFinish(type, sSize, rst) {
        var sourceSize = toFixed2(sSize / 1024),
        resultSize = toFixed2(rst.base64Len / 1024),
        scale = parseInt(100 - (resultSize / sourceSize * 100));

        $("#report").html('<img src="' + rst.base64 + '" style="width: 100%;height:100%">');
        cutImg(type);
    }

    $('#image1').on('change', function() {
        var that = this;
        $('#confirmBtn').attr('data-index', 0);

        lrz(this.files[0], {
            width: 800,
            height: 800,
            quality: 0.7
        })
        .then(function(rst) {
            //console.log(rst);
            doFinish(1, that.files[0].size, rst);
            return rst;
        })
        .catch(function(err) {
            // 万一出错了，这里可以捕捉到错误信息
            // 而且以上的then都不会执行

            alert(err);
        })
        .always(function() {
            // 不管是成功失败，这里都会执行
        });
    });

});
