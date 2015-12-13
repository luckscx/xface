$(document).ready(function(){
    $('.img-item img, .img-item a').click(function(){
        if($(this).parent().find('a').hasClass('cur')) {
            $(this).parent().find('a').removeClass('cur');
        } else {
            $('.cur').removeClass('cur');
            $(this).parent().find('a').addClass('cur');
        }
    })
    $('.sbm').click(function(){
        var filename = $('.cur').parent().find('img').attr('src');
        if(typeof filename == "undefined" || filename.length == 0) {
            alert('请先选择图片哦');
            return;
        } 
        $.ajax({
            url: 'n/do',
            type: 'POST',
            data: {
                filename: filename
            },
            success: function(json){
                if(json.errCode != 0) {
                    //alert(json.msg);
                    showResult(2, 2);
                } else {
                    //alert('success');
                    showResult(2, 1);
                }
            }
        }); 
    })
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
    function showResult(tType, type){
        var url = location.href;
        if(type == 1) {
            url = 'fchose.html';
        }
        location.href = 'result.html?tType=' + tType + '&type=' + type + '&url=' + url;
    }
})
