$(document).ready(function(){
    $('.img img').attr('src', getUrlParam('url'));
    $('.do').click(function(){
        $.ajax({
            url:  'n/uploadpic',
            data: {
                filename: $('.img img').attr('src'),
            },
            success: function(json){}
        })
    })
    $('.pic2').click(function(){
        //todo
    })
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
})
