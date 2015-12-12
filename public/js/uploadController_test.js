$(document).ready(function(){
    var uploadIndex = -1;
    $('.upbtn').click(function(){
        uploadIndex = $(this).attr('data-i');
        $('.pop').show();
    });
    var uploader = new plupload.Uploader({
        runtimes: 'html5, silverlight, flash',
        flash_swf_url: 'lib/plupload/Moxie.swf',
        silverlight_xap_url: 'lib/plupload/Moxie.xap',
        browse_button: 'id_picture',
        url: '',
        dataType: 'json',
        multi_selection: false,
        max_file_size: "1MB",
        filters: [{
            title: "Image文件",
            extensions: "jpg,jpeg,png,ico,icon"
        }]
    });
    uploader.init();
    uploader.bind('FilesAdded', function(uploader, files) {
        if (files.length > 1) {
            uploader.files.splice(0, files.length);
            uploader.refresh();
            pop.alert("只能上传1张", 1, 2)
        } else {
            uploader.start();
        }
    });
    uploader.bind('UploadProgress', function() {
        if (window.loadingOverlay) {
            window.loadingOverlay.showModal();
        } else {
            window.loadingOverlay = pop.loading();
        }
    })
    uploader.bind('FileUploaded', function(uploader, files, response) {
        if (window.loadingOverlay) {
            window.loadingOverlay.close();
        }
        response = (new Function("return " + response.response))();
        if (response.errCode != 0) {
            uploader.files.splice(0, 1);
            pop.alert("图片上传失败", 1, 2);
        } else {
            uploader.destroy();
            $("#id_article_picture" + type).parent().parent().find("span.watn-line").hide();
            $("#id_picture" + type).html(
                    '<span class="ar-pic"><img src="' + response.result + '0"/><em class="delet-img"></em></span>'
                    );
        }
    });
    uploader.bind('Error', function(uploader, errObject) {
        //raphale.add_game.icon_num = (raphale.add_game.icon_num - 1 < 0)? 0: (raphale.add_game.icon_num - 1);
        uploader.files.splice(0, 1);
        if (errObject.message == "File extension error.") {
            pop.alert("请上传jpg,png,jpeg,ico,icon图片文件", 1, 2);
        } else if (errObject.message == "File size error.") {
            pop.alert("上传icon大小不能超过1MB", 1, 2);
        } else {
            pop.alert(errObject.message, 1, 2);
        }
    });
});
