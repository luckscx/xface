$(document).ready(function(){
    pop.addCSS();
    $('.do').click(function(){
        var image = $('.img img').eq(0).attr('src');
        if(image.length == 0) {
            alert('请先上传图片哦');
            return;
        }
        $.ajax({
            url:  'n/do',
            type: "POST",
            data: {
                filename: image
            },
            success: function(json){
                if(json.errCode != 0) {
                    alert(json.msg);
                } else {
                    alert("上传成功");
                }
            }
        })
    })
    $('.pic2').click(function(){
        var image = $('.img img').eq(0).attr('src');
        if(image.length == 0) {
            alert('请先上传图片哦');
            return;
        }
        $('.title').text('效果图');
        $('.merge').show();
        $('.btn').hide();
    })
    $('.list span').click(function(){
        $(this).addClass('cur').siblings().removeClass('cur');
    });
    $('.position span').click(function(){
        if(checkSelected()) {
            var $ele = $(this);
            var index = $(this).index();
            switch (parseInt(index, 10)) {
                case 0:
                    if($ele.hasClass('p1cur')){
                        $ele.removeClass('p1cur');
                    }else{
                        $ele.addClass('p1cur');
                    }
                    break;
                case 1:
                    if($ele.hasClass('p2cur')){
                        $ele.removeClass('p2cur');
                    }else{
                        $ele.addClass('p2cur');
                    }
                    break;
                case 2:
                    if($ele.hasClass('p3cur')){
                        $ele.removeClass('p3cur');
                    }else{
                        $ele.addClass('p3cur');
                    }
                    break;
                default:
                    break;
            }
        }
    })
    $('.fun .f').click(function(){
        var index = $(this).index();
        var $ele = $(this);
        if(index == 0) {
            $('.position .cur').removeClass('cur');
            $('.p1cur').removeClass('p1cur');
            $('.p2cur').removeClass('p2cur');
            $('.p3cur').removeClass('p3cur');
            $('.show img').attr('src', $('.show img').attr('data-s'));
        } else if(index == 2) {
            $.ajax({
                url: 'n/merge',
                type: 'POST',
                data: {
                    face1: $('.show img').attr('data-s'),
                    face2: $('.list .cur img').attr('src'),
                    useBrow: $('.position .p1').hasClass('p1cur')? 1: 0,
                    useEve: $('.position .p2').hasClass('p2cur')? 1: 0,
                    useMouth: $('.position .p3').hasClass('p3cur')? 1: 0
                },
                success: function(json){
                    alert(json.msg);
                }
            })
        }
    })
    function checkSelected(){
        if($('.list span.cur').length === 0) {
            alert('请先选择一个明星哦');
            return false;
        }
        return true;
    }
    function getUrlParam(p, u) {
        var u = u || document.location.toString();
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = u.substr(u.indexOf('?') + 1).match(reg);
        if(r!=null)return  unescape(r[2]);
        return "";
    }
    $(document).ajaxStart(function () {
        if (window.loadingOverlay) {
            window.loadingOverlay.showModal();
        } else {
            window.loadingOverlay = pop.loading();
        }
        //超出10秒后自动关闭
        window.loadingTimer = setTimeout(function () {
            window.loadingOverlay.close();
        }, 5000);

    });
    $(document).ajaxStop(function () {
        if (window.loadingOverlay) {
            window.loadingOverlay.close();
        }
    });
    
    function toFixed2(num) {
        return parseFloat(+num.toFixed(2));
    }

    $('#cancleBtn').on('click', function() {
        $("#showEdit").fadeOut();
        $('#showResult').fadeIn();
    });

    $('#confirmBtn').on('click', function() {
        var $image = $('#report > img');
        var dataURL = $image.cropper("getCroppedCanvas");
        var imgurl = dataURL.toDataURL("image/jpeg", 0.5);
        $.ajax({
            url:  'n/uploadpic',
            type: "POST",
            data: {
                filename: imgurl 
            },
            success: function(json){
                if(json.errCode != 0) {
                    alert(json.msg);
                } else {
                    $("#showEdit").fadeOut();
                    $('.img .sel').hide();
                    $('.img .show').show();
                    $('.img .show img').attr('src', json.result);
                    $('.img .show img').attr('data-s', json.result);
                }
            }
        })
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
            minContainerHeight: 400,
            minContainerWidth: 300
        });
    }

    function doFinish(type, sSize, rst) {
        var sourceSize = toFixed2(sSize / 1024),
        resultSize = toFixed2(rst.base64Len / 1024),
        scale = parseInt(100 - (resultSize / sourceSize * 100));

        $("#report").html('<img src="' + rst.base64 + '" style="width: 100%;height:100%">');
        cutImg(type);
    }

    $('#image').on('change', function() {
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
    $('.del').click(function(){
        $('.img .sel').show();
        $('.img .show').hide();
        $('.img .show img').attr('src', '');
    })
})
