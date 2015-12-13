$(document).ready(function(){
    var type = getUrlParam('type');
    var titleType = getUrlParam('tType');
    var url = getUrlParam('url');
    if(titleType == 2) {
        $('.title').addClass('ts');
        $('.title').text('捏明星脸');
        if(type == 1) {
            $('.success').show();
            $('.rtn span').text('返回首页');
        } else {
            $('.fail').show();
            $('.rtn span').text('重新导入');
        }
    } else {
        $('.title').addClass('tf');
        $('.title').text('捏我的脸');
        if(type == 1) {
            $('.success').show();
            $('.rtn span').text('返回首页');
        } else {
            $('.fail').show();
            $('.rtn span').text('重新导入');
        }
    }
    $('.rtn span').click(function(){
        location.href = url;
    })
    function getUrlParam(p, u) {
        var u = u || document.location.toString();
        var reg = new RegExp("(^|&)"+ p +"=([^&]*)(&|$)");
        var r = u.substr(u.indexOf('?') + 1).match(reg);
        if(r!=null)return  unescape(r[2]);
        return "";
    }
})
