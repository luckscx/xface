$(document).ready(function(){
    pop.addCSS();
    var bImmediatery = true; 
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
                    //alert(json.msg);
                    showResult(1, 2);
                } else {
                    showResult(1, 1);
                    //alert("上传成功");
                }
            }
        })
        return false;
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
        return false;
    })
    $('.list span').click(function(){
        $(this).addClass('cur').siblings().removeClass('cur');
        $('.position span').removeClass('p1cur').removeClass('p2cur').removeClass('p3cur');
        var useArray = $('.position span[data-i="' + $(this).attr("data-i") + '"]');
        for(var i = 0; i < useArray.length; i++) {
            var $ele = $(useArray[i]);
            switch (parseInt($ele.index(), 10)) {
                case 0:
                    $ele.addClass('p1cur');
                    break;
                case 1:
                    $ele.addClass('p2cur');
                    break;
                case 2:
                    $ele.addClass('p3cur');
                    break;
                default:
                    break;
            }
        }
        return false;
    });
    $('.position span').click(function(){
        if(checkSelected()) {
            var $ele = $(this);
            var index = $(this).index();
            switch (parseInt(index, 10)) {
                case 0:
                    if($ele.hasClass('p1cur')){
                        $ele.removeClass('p1cur');
                        $ele.attr('data-i', ''); 
                    }else{
                        $ele.addClass('p1cur');
                        $ele.attr('data-i', $('.list .cur').attr('data-i')); 
                        if(bImmediatery) {
                            merge(function(url){
                                $('.show img').attr('src', url);
                            });           
                        }
                    }
                    break;
                case 1:
                    if($ele.hasClass('p2cur')){
                        $ele.removeClass('p2cur');
                        $ele.attr('data-i', ''); 
                    }else{
                        $ele.addClass('p2cur');
                        $ele.attr('data-i', $('.list .cur').attr('data-i')); 
                        if(bImmediatery) {
                            merge(function(url){
                                $('.show img').attr('src', url);
                            });           
                        }
                    }
                    break;
                case 2:
                    if($ele.hasClass('p3cur')){
                        $ele.removeClass('p3cur');
                        $ele.attr('data-i', ''); 
                    }else{
                        $ele.addClass('p3cur');
                        $ele.attr('data-i', $('.list .cur').attr('data-i')); 
                        if(bImmediatery) {
                            merge(function(url){
                                $('.show img').attr('src', url);
                            });           
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return false;
    })
    function merge(callback){
        $.ajax({
            url: 'n/merge',
            type: 'POST',
            data: {
                face1: $('.show img').attr('data-s'),
                browIdx: $('.position .p1').attr('data-i') == "" ? 0: $('.position .p1').attr('data-i'),
                eveIdx: $('.position .p2').attr('data-i') == "" ? 0: $('.position .p2').attr('data-i'),
                mouthIdx: $('.position .p3').attr('data-i') == ''? 0: $('.position .p3').attr('data-i')
            },
            success: function(json){
                if(json.errCode != 0) {
                    alert(json.msg);
                } else {
                    callback(json.result);
                }
            }
        })
    };
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
            merge(function(url){
                showMergeResult(url);
            });
        }
        return false;
    })
    function showMergeResult(url){
        $('.merge').hide();
        $('.transfer').show();
        $('.show img').attr('src', url);
    }
    $('.dotrans').click(function(){
        var image = $('.show img').attr('src');
        $.ajax({
            url:  'n/do',
            type: "POST",
            data: {
                filename: image
            },
            success: function(json){
                if(json.errCode != 0) {
                    //alert(json.msg);
                    showResult(1, 2);
                } else {
                    showResult(1, 1);
                    //alert("上传成功");
                }
            }
        })
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
        return false;
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
                    $('.btn span').addClass('enable');
                }
            }
        })
        return false;
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
        $('.btn span').removeClass('enable');
        return false;
    })
    function showResult(tType, type){
        var url = location.href;
        if(type == 1) {
            url = 'index.html';
        }
        location.href = 'result.html?tType=' + tType + '&type=' + type + '&url=' + url;
    }
})
