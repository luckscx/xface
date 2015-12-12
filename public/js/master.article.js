/**
 * Created by aleczhang on 2015/3/16.
 */

define(function(require, exports, module) {
    var $ = require('jquery');
    require('/js/lib/jquery_ui')($);
    require('/js/lib/jquery-ui-timepicker-addon');
    var raphale = require('/js/lib/raphale_master');
    var child = require('/js/lib/child_master');
    window.pop = require('/js/lib/dialog');
    require('/js/lib/tvp.player_v2_jq_master');
    require('/js/lib/json2');
    require('/js/lib/jquery.pin')($);
    var TFL = require("/js/lib/tfl/build/tfl-editor");
    require('/js/lib/plupload.full.min');
    require('/js/lib/drag')($);
    var template = require('/js/lib/template');

    var articleVideo = null;
    var iProductID = "";
    var iArticleID = "";
    var iStatus = "";
    var articleEdited = "";
    var iAttacheFlag = 0;
    var tagIDs = [];
    var needTag = false;
    var tagSelected = {};
    var tagSelectedArr = [];
    var tags = [];  //分类字典表
    var tagsHash = {};
    var subtags = {};
    var hotgameid = -100;
    var h5uploader = null;

    function init() {
        $('#id_my_game').addClass('cur');
        parameterCheck(function() {
            getChannelList(getUrlParam('iProductID'), function() {
                setEditor();
                getArticle();
                setTimeSelecter();
                bindEvent();
            });
        })
    }

    function getChannelList(iProductID, callback) {
        raphale.ajax({
            url: '/user/article/listclass',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                iProductID: iProductID
            },
            success: function(json) {
                if (json.errCode != 0) {
                    pop.alert(json.msg, 1, 1);
                    return;
                }
                try {
                    for (var i = 0; i < json.result.articleClass.length; i++) {
                        $('#id_select').append(
                            '<option value="' + json.result.articleClass[i].iClassID + '">' + json.result.articleClass[i].szClassTitle + '</option>'
                        );
                    }
                    callback();
                } catch (e) {

                }
            }
        })
    }

    function parameterCheck(callback) {
        iProductID = getUrlParam('iProductID');
        iArticleID = getUrlParam('iArticleID');
        iStatus = getUrlParam('iStatus');
        if (iProductID == "") {
            pop.alert("参数错误", 1, 2);
            return;
        }
        if (iArticleID != '') {
            document.title = '编辑文章';
            $('.ar-tit').text('编辑文章');
        }
        if (iArticleID != '' && iStatus == 0) {
            $('#id_publish').text('更新发布');
            $('#id_appointment').attr('disabled', true);
            $('#id_appointment').parent().addClass('color-gray');
            $('#id_article_draft').remove();
        } else {
            if (iArticleID != '') {
                $('#id_article_draft').text('保存修改');
            } else {
                $('#id_article_draft').text('保存到草稿箱');
            }
            $('#id_publish').text('发布');
        }
        callback();
    }

    function setEditor() {
        TFL.editor({
            id: 'id_article',
            buttons: ['bold', 'italic', 'underline', '|',
                'font', 'size', 'color', '|', 'insertorderedlist', 'insertunorderedlist', 'justify', "|",
                'link', 'table', 'emoticons', 'uploadimage'
            ],
            pasteMode:'default',
            width: 650,
            height: 520
        })
        $('.tfl-editor-wrapper').css('float', 'left');
    }

    function bindEvent() {
        //文章类型
        $('#id_select').change(function() {
                if ($(this).val() == "0") {
                    $('.leadwords').show();
                    $('.set-pic').find('div label em').text("*");
                    $('#id_appointment').attr('disabled', false);
                    $('#id_appointment').parent().removeClass('color-gray');
                    $('#id_h5_background').hide();
                    if(h5uploader != null) {
                        h5uploader.destroy();
                        h5uploader = null;
                    }
                } else if (getUrlParam('iProductID') == 19 && ($(this).find("option:selected").text()=="游戏头条" || $(this).find("option:selected").text()=="全民吐槽")){ //大事件下的 游戏头条、全民吐槽需要导语
                    $('.leadwords').show();    //导语
                    $('.leadwords').find('div label em').text("");
                    $('.set-pic').find('div label em').text("*"); //配图
                    $('#id_appointment').attr('disabled', false);  //可以自定义发布时间
                    $('#id_appointment').parent().removeClass('color-gray');
                    if($(this).find("option:selected").text()=="全民吐槽") {
                        $('#id_h5_background').show();
                        if (h5uploader == null) {
                            uploadPicture('_h5');
                        }
                    } else {
                        $('#id_h5_background').hide();
                        if(h5uploader != null) {
                            h5uploader.destroy();
                            h5uploader = null;
                        }
                    }
                    $('#id_tag').show();
                    $('#from_name').show();
                    $('#from_url').show();
                    needTag = true;
                } else {
                    $('.leadwords').hide();
                    $('.set-pic').find('div label em').text("");
                    $('#id_appointment').attr('disabled', true);
                    $('#id_appointment').parent().addClass('color-gray');
                    $('#id_appointment').removeAttr('checked');
                    $('#id_appointment').parent().find('span.set-time').hide();
                    $('#id_h5_background').hide();
                    if(h5uploader != null) {
                        h5uploader.destroy();
                        h5uploader = null;
                    }
                }
        });
            //预览
        $('#id_article_preview').unbind('click').bind('click', function() {
                preview();
        })
            //保存草稿
        $('#id_article_draft').unbind('click').bind('click', function() {
                setDraft(1);
        })
            //取消
        $('#id_article_cancel').unbind('click').bind('click', function() {
                cancel();
        })
            //失去焦点
        $("#id_article_title, #id_article_summary, #id_article_video, #from_name, #from_url").blur(function() {
            detailCheck($(this));
        });
        //删除配图
        $('#id_picture').undelegate('span em', 'click').delegate('span em', 'click', function() {
                $('#id_picture').html(
                    '<span class="btn-file"><input type="file" class="file-style" id="id_article_picture"></span>'
                );
                uploadPicture("");
        })
        $('#id_picture_h5').undelegate('span em', 'click').delegate('span em', 'click', function() {
            $('#id_picture_h5').html(
                '<span class="btn-file"><input type="file" class="file-style" id="id_article_picture_h5"></span>'
            );
            uploadPicture("_h5");
        })
            //选择时间
        $('#id_now').unbind('click').bind('click', function() {
            $('#id_time').hide();
        })
        $('#id_appointment').unbind('click').bind('click', function() {
                $('#id_time').show();
        })
            //自动保存
        var loop = this.setInterval(function() {
            setDraft(3);
        }, 60000);
        $('#id_article_video').val('插入腾讯视频地址');
        $('#id_article_video').click(function() {
            if ($('#id_article_video').val() == '插入腾讯视频地址') {
                $('#id_article_video').val('');
            }
        });
        $('#id_article_video').change(function() {
            if ($('#id_article_video').val().trim().length <= 0) {
                $('#id_article_video').val('插入腾讯视频地址');
            }
        });
        //投票相关
        $('#id_vote').find('.btn-add').click(function() {
            $('#id_vote').find('div.vote-li').show();
            $('#id_vote').find('a.btn-cancel').show();
        });
        $('#id_vote').find('a.btn-cancel').click(function() {
            $('#id_vote').find('div.vote-li').hide();
            $('#id_vote').find('a.btn-cancel').hide();
            $('#id_vote').find('.btn-add').click(function() {
                $('#id_vote').find('div.vote-li').show();
                $('#id_vote').find('a.btn-cancel').show();
            });
        });
        $("div.box-div a").live("click", function() {
            var sCnt = $('#id_vote').find('div.vote-li p').length - 1;
            if (sCnt >= 10) {
                pop.alert("选项不能超过十条", 1, 1);
            } else {
                $('#id_vote').find('div.box-div').before('<p><input type="text" placeholder="选项' + (sCnt + 1) + '"><a href="javascript:;" class="btn-delet" style="display: none">删除</a></p>');
                $(".btn-delet").show();
            }
        });

        $(".btn-delet").live("click", function() {
            if ($("#id_vote").find(".vote-li p").length > 2) {
                $(this).parent().remove();
            }
            if ($("#id_vote").find(".vote-li p").length == 3) {
                $(".btn-delet").hide();
            }
            var options = $('#id_vote').find('div.vote-li p');
            for (var i = 1; i < options.length; i++) {
                options.eq(i).find('input').attr('placeholder', '选项' + i);
            }
        });
        $('#id_vote').undelegate('p.input', 'blur').delegate('p.input', 'blur', function() {
            voteCheck();
        });

        //标签相关
        $('#id_tag').find('.btn-add').click(function() {
            showDefaultTag('');
        });
        $("#id_tag").find('span.tab-span').click(function(){
            $(this).addClass('cur').siblings().removeClass('cur');
            $('#id_tag').find('div.lab-boxes').hide();
            $("#id_tag").find('div.lab-boxes[data-index="'+ $(this).attr('data-index') + '"]').show();
        });
        $("#id_tag .checked").undelegate('a.delet', 'click').delegate('a.delet', 'click', function(){
            $(this).parent().remove();
            $('#id_tag').find('label[data-id="' + $(this).parent().attr("id") + '"]').find("input").attr('checked', false);
        });
        $("#id_tag .lab-boxes").undelegate('input', 'change').delegate('input', 'change', function(){
            if($(this).attr("checked") == "checked") {
                if($("#id_tag").find('.checked span').length >= 10) {
                    pop.alert("最多只能选择10个标签", 1, 1);
                }else {
                    $("#id_tag").find('.checked').append('<span class="ch-labs" id="' + $(this).parent().attr('data-id') + '"><a href="javascript:;" class="delet"></a>' + $(this).parent().text() + '</span>');
                    $("#id_checked").dragsort("destroy");
                    $("#id_checked").dragsort({
                        dragSelector: "span.ch-labs",
                        dragBetween: true,
                        placeHolderTemplate: "<span class='placeHolder'></span>"
                    });
                }
            }else{
                $("#" + $(this).parent().attr('data-id')).remove();
            }
        })
        $("#id_tag").find('.lab-boxes a.loadmore').click(function(){
            var id = $(this).attr('hid');
            var pagenum = parseInt($(this).attr('data-pagenum'), 10) + 1;
            $(this).attr('data-pagenum', pagenum);
            getHotGames(id, pagenum);
        });
    }

    function setDraft(iPublishType) {
        if(needTag){
            tagIDs = [];
            $('.checked span').each(function(){
                tagIDs.push($(this).attr("id"));
            });
        }
        if (iPublishType == 1) { //1保存草稿 3自动保存
            if (getUrlParam('iArticleID') != "" && getUrlParam('iArticleID') != 'undefined' && iStatus == 0) {
                iPublishType = 2; //修改
            } else {
                iPublishType = 1;//新增 保存草稿
            }
        }
        var type = '';
        var time = '';
        if ($(':radio[checked]').attr('id') == 'id_now') {
            type = 0;
            time = '';
        } else if ($(':radio[checked]').attr('id') == 'id_appointment') {
            type = 1;
            time = $('#id_time').val();
        } else {
            type = '';
            time = '';
        }
        var detail = getArticleDetail();
        var videourl = "";
        try {
            videourl = new Object({
                url: articleVideo.szVideoUrl,
                vid: articleVideo.source,
                img: articleVideo.img,
                fromtitle:$('#id_from_title').val().trim() || "",
                fromurl:$('#id_from_url').val().trim() || ""
            })
            videourl = JSON.stringify(videourl);
        } catch (e) {
            if($('#id_from_title').val().trim() || $('#id_from_url').val().trim()) {
                videourl = new Object({
                    fromtitle: $('#id_from_title').val().trim() || "",
                    fromurl: $('#id_from_url').val().trim() || ""
                })
                videourl = JSON.stringify(videourl);
            }else{
                videourl = "";
            }
        }
        var iPublishScope = 0;
        if ($('#id_select').val() != "0") {
            iPublishScope = 1;
        }
        if ($('#id_select').find("option:selected").text()=="游戏头条"){
            iPublishScope = 14;
        }
        if($('#id_select').find("option:selected").text()=="全民吐槽"){
            iPublishScope = 13 ;
        }
        var iClassID = $('#id_select').val();
        var imgUrl = $('#id_picture').find('span img').attr('src');
        if(!needTag){
            var szSummary = $('#id_article_summary').val().trim();
        }
        else{
            var html = TFL.editor.getInstance('id_article').html();
            var sszSummary = $('<div>' + filterXSS(html) + '</div>').text().substr(0, 70);
            var summaryObj = {
                daoyu : $("#id_article_summary").val().trim(),
                srcname : $("#id_from_title").val().trim(),
                srcurl : $("#id_from_url").val().trim(),
                szSummary : sszSummary
            };
            if($('#id_select').find("option:selected").text()=="全民吐槽") {
                summaryObj.h5background = $('#id_picture_h5 span img').attr('src');
            } else {
                summaryObj.h5background = "";
            }
            var szSummary = JSON.stringify(summaryObj);
        }

        if (iClassID != "0") {
            if ($('#id_select').find("option:selected").text() != "游戏头条" &&  $('#id_select').find("option:selected").text() != "全民吐槽") {
                var html = TFL.editor.getInstance('id_article').html();
                szSummary = $('<div>' + html + '</div>').text().substr(0, 80);
                if (imgUrl == "" || typeof(imgUrl) == 'undefined') {
                    var url = TFL.editor.getInstance("id_article").getImgUrl();
                    var imgUrl = "";
                    for (var i = 0; i < url.length; i++) {
                        if (/http/.test(url[i])) {
                            imgUrl = url[i];
                        }
                    }
                }
            }
        } else {
            iClassID = '';
            imgUrl = $('#id_picture').find('span img').attr('src');
        }

        var aFlag = 0;
        if ($('#id_vote').find('div.vote-li').is(":visible")) {
            aFlag = 1;
        }

        raphale.ajax({
            url: '/master/article/publish',
            type: 'post',
            dataType: 'json',
            data: {
                iPublishType: iPublishType,        //新增 修改 自动保存
                iArticleType: type,                //文章发布时间类型
                iPublishScope: iPublishScope,      //发布到频道 对应的文章类型
                iProductID: iProductID,
                iArticleID: iArticleID,
                szTitle: $('#id_article_title').val().trim() || "",
                szSummary: szSummary || "",
                szDetails: detail,
                szImageUrl: imgUrl || "",
                dtTime: time,
                szVideoUrl: videourl,
                iClassID: iClassID,
                iAttacheFlag: aFlag
            },
            success: function(json) {
                if (json.errCode == 0) {
                    iAttacheFlag = aFlag;
                    if (aFlag) {
                        publishVote(json.result.iArticleID, 1);
                    }
                    //标签单独加
                    publishTag(json.result.iArticleID);


                    if (iPublishType == 1 || iPublishType == 2) {
                        $('#id_auto_save').text('已保存至草稿箱');
                        $('#id_article_draft').text('保存修改');
                        $('#id_auto_save').show();
                        iArticleID = json.result.iArticleID;
                        setTimeout(function() {
                            $("#id_auto_save").hide();
                        }, 5000);
                    }
                }
            }
        })
    }

    function cancel() {
        location.href="/master/articlemanager.html?iProductID=" + getUrlParam('iProductID');
    }

    function detailCheck(obj) {
        var id = obj.attr('id');
        switch (id) {
            case 'id_article_title':
                //标题
                var title = $('#id_article_title').val().trim();
                if (title.length == 0) {
                    $('#id_article_title').parent().parent().find('span.watn-line').text('请填写标题');
                    $('#id_article_title').parent().parent().find('span.watn-line').show();
                    return false;
                } else if (title.length > 30) {
                    $('#id_article_title').parent().parent().find('span.watn-line').text('请不要超过30字');
                    $('#id_article_title').parent().parent().find('span.watn-line').show();
                    return false;
                } else {
                    $('#id_article_title').parent().parent().find('span.watn-line').hide();
                }
                return true;
            case 'from_name':
                //来源名称
                if ($('#id_select').find("option:selected").text() != "游戏头条" &&  $('#id_select').find("option:selected").text() != "全民吐槽") {
                    return true;
                }
                var title = $('#from_name').val().trim();
                if (title.length > 30) {
                    $('#from_name').parent().parent().find('span.watn-line').text('请不要超过30字');
                    $('#from_name').parent().parent().find('span.watn-line').show();
                    return false;
                } else {
                    $('#from_name').parent().parent().find('span.watn-line').hide();
                }
                return true;
            case 'from_url':
                //来源地址
                if ($('#id_select').find("option:selected").text() != "游戏头条" &&  $('#id_select').find("option:selected").text() != "全民吐槽") {
                    return true;
                }
                var title = $('#from_url').val().trim();
                if (title.length > 0) {
                    if (title.match(/(http[s]?|ftp):\/\/[^\/\.]+?\..+\w$/i) == null) {
                        $('#from_url').parent().parent().find('span.watn-line').text('来源地址格式不正确');
                        $('#from_url').parent().parent().find('span.watn-line').show();
                        return false;
                    } else {
                        $('#from_url').parent().parent().find('span.watn-line').hide();
                    }
                }
                return true;
            case 'id_article_summary':
                //导语
                if ($('#id_select').val() != "0" || $('.leadwords').is(":hidden")) {
                    return true;
                }

                var title = $('#id_article_summary').val().trim();
                if (title.length == 0) {
                    $('#id_article_summary').parent().parent().find('span.watn-line').text('请填写导语');
                    $('#id_article_summary').parent().parent().find('span.watn-line').show();
                    return false;
                } else if (title.length > 80) {
                    $('#id_article_summary').parent().parent().find('span.watn-line').text('请不要超过80字');
                    $('#id_article_summary').parent().parent().find('span.watn-line').show();
                    return false;
                } else {
                    $('#id_article_summary').parent().parent().find('span.watn-line').hide();
                }
                return true;
            case 'id_picture':
                //配图
                if ($('#id_select').val() != "0" && $('#id_select').find("option:selected").text() != "游戏头条" &&  $('#id_select').find("option:selected").text() != "全民吐槽") {
                    return true;
                }
                var pic = $('#id_picture').find('span img').attr('src');
                if (!pic || pic.length == 0) {
                    $('#id_picture').parent().parent().find('span.watn-line').text('请上传配图');
                    $('#id_picture').parent().parent().find('span.watn-line').show();
                    return false;
                } else {
                    $('#id_picture').parent().parent().find('span.watn-line').hide();
                }
                return true;
            case 'id_picture_h5':
                //配图
                if ($('#id_select').find("option:selected").text() != "全民吐槽") {
                    return true;
                }
                var pic = $('#id_picture_h5').find('span img').attr('src');
                if (!pic || pic.length == 0) {
                    $('#id_picture_h5').parent().parent().find('span.watn-line').text('请上传配图');
                    $('#id_picture_h5').parent().parent().find('span.watn-line').show();
                    return false;
                } else {
                    $('#id_picture_h5').parent().parent().find('span.watn-line').hide();
                }
                return true;
            case 'id_article_video':
                //视频
                var url = $('#id_article_video').val().trim();
                if (url.length != 0 && url != '插入腾讯视频地址') {
                    var reg = new RegExp("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
                    var r = url.match(reg);
                    if (r == null) {
                        $('#id_article_video').parent().parent().find('span.watn-line').text('url地址错误');
                        $('#id_article_video').parent().parent().find('span.watn-line').show();
                        return false;
                    }
                    if (url.indexOf('qq.com') == -1) {
                        $('#id_article_video').parent().parent().find('span.watn-line').text('目前只支持腾讯视频链接');
                        $('#id_article_video').parent().parent().find('span.watn-line').show();
                        return false;
                    }
                    raphale.ajax({
                        url: "/php/getvid.php",
                        type: "GET",
                        data: {
                            url: url
                        },
                        success: function(data) {
                            if (data.errCode != 0) {
                                $('#id_article_video').parent().parent().find('span.watn-line').text(data.msg);
                                $('#id_article_video').parent().parent().find('span.watn-line').show();
                                articleVideo = null;
                                return false;
                            } else {
                                articleVideo = data.result;
                                $('#id_article_video').parent().parent().find('span.watn-line').hide();
                                return true;
                            }
                        },
                        fail: function() {
                            return false;
                        }
                    })
                } else {
                    $('#id_article_video').parent().parent().find('span.watn-line').hide();
                    $('#id_article_video').val('插入腾讯视频地址');
                    articleVideo = null;
                }
                break;
            case 'id_article':
                //文章
                var editor = TFL.editor.getInstance('id_article');
                var htmlStr = editor.html();
                var textLength = $("<div>" + filterXSS(htmlStr) + "</div>").text().length;
                var tLen = getArticleDetail();
                if (textLength == 0 && editor.getImgUrl().length == 0) {
                    pop.alert('请输入文章描述', 1, 2);
                    return false;
                }
                if (textLength < 10) {
                    pop.alert('文章描述不能少于10字', 1, 2);
                    return false;
                }

                if(tLen.length > 40960){
                    pop.alert('内容超出上限', 1, 2);
                    return false;
                }
                return true;
            case 'id_time':
                //时间
                if ($(':radio[checked]').attr('id') != 'id_now' && $(':radio[checked]').attr('id') != 'id_appointment') {
                    $('#id_time_warn').text('请选择发布时间');
                    $('#id_time_warn').show();
                    return false;
                } else if ($(':radio[checked]').attr('id') == 'id_appointment') {
                    var time = $('#id_time').val().trim();
                    if (time.length == 0) {
                        $('#id_time_warn').text('请填写自定义时间');
                        $('#id_time_warn').show();
                        return false;
                    } else {
                        var appointment = new Date(
                            parseInt(time.substr(0, 4), 10), (parseInt(time.substr(5, 2), 10) - 1),
                            parseInt(time.substr(8, 2), 10),
                            parseInt(time.substr(11, 2), 10),
                            parseInt(time.substr(14, 2), 10)
                        ).getTime();
                        var now = new Date().getTime();
                        if (appointment < now) {
                            $('#id_time_warn').text('自定义时间不合法');
                            $('#id_time_warn').show();
                            return false;
                        }
                    }
                } else {
                    $('#id_time_warn').hide();
                }
                return true;
            default:
                break;
        }
    }

    function preview() {
        var pass = true;
        //标签单独加
        if(needTag){
            tagIDs = [];
            $('.checked span').each(function(){
                tagIDs.push($(this).attr("id"));
            });
        }

        $('#id_article_title, #id_article_summary, #id_picture, #id_picture_h5, #id_article, #id_time, #from_name, #from_url').each(function() {
            if (!detailCheck($(this))) {
                pass = false;
            }
        });
        if ($('#id_article_video').val().trim().length != 0 && $('#id_article_video').val().trim() != '插入腾讯视频地址' && articleVideo == null) {
            pass = false;
        }
        if ($('#id_vote').find('div.vote-li').css("display") == "block") {
            if (!voteCheck()) {
                pass = false;
            }
        }
        if ($(".t-tit").val() == "") {
            pop.alert("请输入投票标题", 4);
            return;
        }
        var selectItem = [];
        $(".close-box").find("input").each(function() {
            if ($(this).val() != "") {
                selectItem.push($(this).val());
            }
        });
        if (!pass) {
            $('#id_auto_save').text('请先填写正确后再预览');
            $('#id_auto_save').show();
            return;
        }

        $('#id_preview_title').text($('#id_article_title').val().trim());
        if (articleVideo != null) {
            $('#id_preview_video').show();
            var video = new tvp.VideoInfo();
            var player = new tvp.Player();
            video.setVid(articleVideo.source);
            player.create({
                width: 680,
                height: 500,
                video: video,
                modId: "id_preview_video",
                autoplay: true,
                //playerType: 'flash',
                isHtml5UseUI: true,
                vodFlashExtVars: {
                    clientbar: 0
                }
            });
        } else {
            $('#id_preview_video').hide();
        }
        $('#id_preview_detail').html(getArticleDetail());
        $('#id_preview_time').text(new Date().Format("yyyy:MM:dd hh:mm:ss"));
        $('#id_article_edit').parent().hide();
        //投票相关
        if ($('#id_vote').find('div.vote-li').css("display") == "block") {
            var voteTitle = $('#id_vote').find('p.p-tit input').val().trim();
            if (parseInt(iStatus, 10) === 0) {
                voteTitle = voteTitle.substr(voteTitle.indexOf('：') + 1, voteTitle.length);
            }
            var options = $("#id_vote").find("p input");
            $('#id_vote_detail').append('<p class="vote-tit">' + voteTitle + '</p>');
            var str = "<div>";
            for (var i = 1; i < options.length; i++) {
                var tmp = options.eq(i).val().trim();
                if (parseInt(iStatus, 10) === 0) {
                    str += '<label><input type="radio" name="vote"/>' + tmp.substr(tmp.indexOf('：') + 1, tmp.length) + '</label><br/>';
                } else {
                    str += '<label><input type="radio" name="vote"/>' + tmp + '</label><br/>';
                }
            }
            str += '</div>';
            $('#id_vote_detail').append(str);
            $('#id_vote_detail').show();
        } else {
            $('#id_vote_detail').hide();
        }
        //投票相关end
        $('#id_preview').show();
        $(window).scrollTop(0);
        $('#id_toolbar').pin({
            containerSelector: "#id_preview_main"
        });
        $('#id_return_edit').unbind('click').bind('click', function() {
            $('#id_toolbar').css('width', '1000px');
            destroyPin();
            $('#id_preview_video').html('');
            $('#id_preview_video').hide();
            $('#id_article_edit').parent().show();
            $('#id_preview').hide();
            $("#id_vote_detail").html('');
        })
        var type = '';
        var time = '';
        if ($(':radio[checked]').attr('id') == 'id_now') {
            type = 0;
            time = new Date().Format("yyyy:MM:dd hh:mm:ss");
        } else if ($(':radio[checked]').attr('id') == 'id_appointment') {
            type = 1;
            time = $('#id_time').val();
        } else {
            type = '';
            time = '';
        }
        $('#id_publish').unbind('click').bind('click', function() {
            pop.confirm("确定发布吗？", 3, 1, function() {
                var detail = getArticleDetail();
                var videourl = "";
                try {
                    videourl = new Object({
                        url: articleVideo.szVideoUrl,
                        vid: articleVideo.source,
                        img: articleVideo.img,
                        fromtitle:$('#id_from_title').val().trim() || "",
                        fromurl:$('#id_from_url').val().trim() || ""
                    })
                    videourl = JSON.stringify(videourl);
                } catch (e) {
                    if($('#id_from_title').val().trim() || $('#id_from_url').val().trim()) {
                        videourl = new Object({
                            fromtitle: $('#id_from_title').val().trim() || "",
                            fromurl: $('#id_from_url').val().trim() || ""
                        })
                        videourl = JSON.stringify(videourl);
                    }else{
                        videourl = "";
                    }
                }
                var iPublishType = 0;
                if (iArticleID != "" && parseInt(iStatus, 10) === 0) {
                    iPublishType = 2;
                }
                var iPublishScope = 0;
                if ($('#id_select').val() != "0") {
                    iPublishScope = 1;
                }
                if ($('#id_select').find("option:selected").text()=="游戏头条"){
                    iPublishScope = 14;
                }
                if($('#id_select').find("option:selected").text()=="全民吐槽"){
                    iPublishScope = 13 ;
                }

                var iClassID = $('#id_select').val();
                var imgUrl = $('#id_picture').find('span img').attr('src');

                if(!needTag){
                    var szSummary = $('#id_article_summary').val().trim();
                }
                else{
                    var html = TFL.editor.getInstance('id_article').html();
                    var sszSummary = $('<div>' + html + '</div>').text().substr(0, 70);
                    var summaryObj = {
                        daoyu : $("#id_article_summary").val().trim(),
                        srcname : $("#id_from_title").val().trim(),
                        srcurl : $("#id_from_url").val().trim(),
                        szSummary : sszSummary
                    };
                    if($('#id_select').find("option:selected").text()=="全民吐槽") {
                        summaryObj.h5background = $('#id_picture_h5 span img').attr('src');
                    } else {
                        summaryObj.h5background = "";
                    }
                    var szSummary = JSON.stringify(summaryObj);
                }
                if (iClassID != "0") {
                    if ($('#id_select').find("option:selected").text() != "游戏头条" &&  $('#id_select').find("option:selected").text() != "全民吐槽") {
                        var html = TFL.editor.getInstance('id_article').html();
                        szSummary = $('<div>' + html + '</div>').text().substr(0, 80);

                        if (imgUrl == "" || typeof(imgUrl) == 'undefined') {
                            var url = TFL.editor.getInstance("id_article").getImgUrl();
                            var imgUrl = "";
                            for (var i = 0; i < url.length; i++) {
                                if (/http/.test(url[i])) {
                                    imgUrl = url[i];
                                }
                            }
                        }
                    }
                } else {
                    iClassID = '';
                    imgUrl = $('#id_picture').find('span img').attr('src');
                }
                if ($('#id_vote').find('div.vote-li').css("display") == "none") {
                    if (articleEdited.iAttacheFlag == 1) {
                        delVote(iArticleID);
                    }
                    var iAttacheFlag = 0;
                    publishArticle(iPublishType, type, iPublishScope, iProductID, iArticleID, szSummary, detail, imgUrl, time, videourl, iClassID, iAttacheFlag);
                } else {
                    var iAttacheFlag = 1;
                    publishArticle(iPublishType, type, iPublishScope, iProductID, iArticleID, szSummary, detail, imgUrl, time, videourl, iClassID, iAttacheFlag);
                }
            });
        })


    }

    function publishVote(iArticleID, flag) {
        if(parseInt(iStatus, 10) === 0){
            return;
        }
        var selectItem = [];
        var options = $("#id_vote").find("p input");
        for (var i = 1; i < options.length; i++) {
            if (options.eq(i).val().trim() != "") {
                selectItem.push(options.eq(i).val().trim());
            }
        }
        var szVoteDetails = {
            "szVoteTitle": $('#id_vote').find('p.p-tit input').val().trim(),
            "voteItem": selectItem
        };
        szVoteDetails = JSON.stringify(szVoteDetails);
        var dTime = new Date();
        var nTime = dTime.setDate(dTime.getDate() + 7);
        var sTime = new Date(nTime).Format("yyyy-MM-dd hh:mm:ss");


        delVote(iArticleID).done(function(result) {
            if (result) {
                raphale.ajax({
                    url: g.serviceCgi + '/user/vote/publish',
                    dataType: "json",
                    data: {
                        iProductID: iProductID,
                        iType: 1,
                        iID: iArticleID,
                        dtEndTime: sTime,
                        szVoteDetails: szVoteDetails
                    },
                    success: function(json) {
                        if (json.errCode == 0) {
                            publishSuccess(flag);
                        } else {
                            pop.alert(json.msg, 1, 1);
                        }
                    }
                })
            }
        });

    }

    //草稿投票删除
    function delVote(iArticleID) {
        var dtd = $.Deferred();
        if (iAttacheFlag == 0 || parseInt(iStatus, 10) === 0) {
            dtd.resolve(1);
            return dtd;
        }

        raphale.ajax({
            url: g.serviceCgi + '/master/article/delvote',
            dataType: "json",
            data: {
                iProductID: iProductID,
                iType: 1,
                iID: iArticleID
            },
            success: function(json) {
                if (json.errCode == 0) {
                    dtd.resolve(1);
                } else {
                    dtd.resolve(0);
                }
            },
            error: function() {
                dtd.resolve(0);
            }
        })
        return dtd;
    }

    //添加标签
    function publishTag(iArticleID){
        if(tagIDs.length == 0){
            return;
        }
        raphale.ajax({
            url: '/master/tag/updatetag',
            type: 'post',
            dataType: 'json',
            data: {
                iQQ: raphale.login.getUin(),
                iProductID: getUrlParam('iProductID'),
                iItemID: iArticleID,
                szTagIDs:tagIDs.join("|")
            },
            success: function (json){
                if(json && json.errCode != 0){
                    pop.alert(json.msg,1);
                }
            }
        })
    }

    //获取贴的标签
    function showTag(iArticleID){
        raphale.ajax({
            url: '/tag/querytags',
            type: 'get',
            dataType: 'json',
            data: {
                iProductID: getUrlParam('iProductID'),
                szItemIDs: iArticleID,
                iPageSize: 200,
                iPageNum: 0,
                iOrder: 2
            },
            success: function (json) {
                if (json.errCode == 0 && json.result) {
                    if(json.result[iArticleID].rows && json.result[iArticleID].rows.length > 0){ //有绑定过标签
                        tagSelected = {};
                        for(var i = 0; i < json.result[iArticleID].rows.length; i++) {
                            tagSelected[json.result[iArticleID].rows[i].iTagID] = json.result[iArticleID].rows[i];
                        }
                        tagSelectedArr = json.result[iArticleID].rows;
                        showDefaultTag(json.result[iArticleID].rows);
                    }
                }
            }
        })
    }

    function showDefaultTag(checkedTags){
        if ($('#id_tag').find('div.lab-div').is(":hidden")) {
            $('#id_tag .btn-add').text('-收起标签');
			tags = [];
			tagsHash = {};
			subtags = {};
			$("#id_tag .lab-div .lab-boxes").eq(0).html('');
			$("#id_tag .lab-div .lab-boxes").eq(1).find('.gamelabs').html('');
			$("#id_tag .lab-div .lab-boxes").eq(1).find('a').attr('data-pagenum',0);
            raphale.ajax({
                url: '/tag/querylist',
                type: 'get',
                dataType: 'json',
                data: {
                    iTagType: 0,
                    iCategoryID: "",
                    iPageNum: 0,
                    iPageSize: 200,
                    iOrder: 1
                },
                success: function (json) {
                    if (json.errCode == 0 && json.result.rows) {
                        for (var i = 0; i < json.result.rows.length; i++) {
                            if (json.result.rows[i].szTagName == "热门游戏") {
                                hotgameid = json.result.rows[i].iTagID;
                            } else {
                                tags.push(json.result.rows[i]);
                                tagsHash[json.result.rows[i].iTagID] = json.result.rows[i].szTagName;
                            }
                        }
                        if(hotgameid != -100) {
                            getHotGames(hotgameid, 0, function(){
                                getSubTags(checkedTags);
                            });
                        }else {
                            getSubTags(checkedTags);
                        }
                        $('#id_tag').find('div.lab-div').show();
                    }
                }
            })
        }else{
            $('#id_tag .btn-add').text('+添加标签');
            $('#id_tag').find('div.lab-div').hide();
        }
    }
    function getSubTags(checkedTags) {
        raphale.ajax({
            url: '/tag/querylist',
            type: 'get',
            dataType: 'json',
            data: {
                iTagType: 2,
                iCategoryID: -hotgameid,
                iPageNum: 0,
                iPageSize: 200,
                iOrder: 1
            },
            success: function (json) {
                if (json.errCode == 0 && json.result.rows) {
                    for (var i = 0; i < json.result.rows.length; i++) {
                        if (!subtags[json.result.rows[i].iCategoryID]) {
                            subtags[json.result.rows[i].iCategoryID] = new Array();
                        }
                        subtags[json.result.rows[i].iCategoryID].push(json.result.rows[i]);
                    }
                    for (var i = 0; i < subtags.length; i++) {
                        if (!tagsHash[subtags[i].iTagID]) { //分类不存在字典中
                            if (!tagsHash['-1']) {
                                tags.push({
                                    iTagID: -1,
                                    szTagName: '未分类'
                                });
                                tagsHash[-1] = '未分类';
                            }
                            subtags[-1].push(subtags[i]);
                        }
                    }
                    var objs = {};
                    objs.tags = tags;
                    template.helper("getTagItem", function (iTagID) {
                        var str = '';
                        if (typeof subtags[iTagID] != "undefined") {
                            for (var i = 0; i < subtags[iTagID].length; i++) {
                                str += '<label data-id="' + subtags[iTagID][i].iTagID + '"><input type="checkbox">' + subtags[iTagID][i].szTagName + '</label>';
                            }
                        } else {
                            str = "<label>该分类下暂无tag</label>"
                        }
                        return str;
                    });
                    var $html = template("id_tag_list", objs);
                    $("#id_tag .lab-div .lab-boxes").eq(0).html($html);

                    //热门游戏
                    if (hotgameid != -100) {
                        try {
                            $("#id_tag .lab-boxes").find('a.loadmore').attr('hid', hotgameid);
                            var $hotGameHtml = "";
                            for (var i = 0; i < subtags[hotgameid].length; i++) {
                                $hotGameHtml += '<label data-id="' + subtags[hotgameid][i].iTagID + '"><input type="checkbox">' + subtags[hotgameid][i].szTagName + '</label>';
                            }
                            $("#id_tag .tab-span").eq(1).show();
                            $("#id_tag .lab-div .lab-boxes").eq(1).find('.gamelabs').html($hotGameHtml);
                            if (subtags[hotgameid].length >= 200) {
                                $("#id_tag .lab-boxes").find('a.loadmore').show();
                            } else {
                                $("#id_tag .lab-boxes").find('a.loadmore').hide();
                            }
                        } catch (e) {
                        }
                    }
                    $('#id_tag').find('div.lab-div').show();
                    if (checkedTags) { //修改状态 绑定的标签选中
                        for (var i = 0; i < checkedTags.length; i++) {
                            $('#id_tag').find('label[data-id=' + checkedTags[i].iTagID + ']').find("input").attr("checked", "checked");
                            var tmp = '<span class="ch-labs" id="' + checkedTags[i].iTagID + '"><a href="javascript:;" class="delet"></a>' + filterXSS(checkedTags[i].szTagName) + '</span>';
                            $('#id_tag').find(".checked").append(tmp);
                        }
                    }

                    $("#id_checked").dragsort({
                        dragSelector: "span.ch-labs",
                        dragBetween: true,
                        placeHolderTemplate: "<span class='placeHolder'></span>"
                    });
                }
            }
        })
    }
    function getHotGames(id, pagenum, callback) {
        raphale.ajax({
            url: '/tag/querylist',
            type: 'get',
            dataType: 'json',
            data: {
                iTagType: 2,
                iCategoryID: id,
                iPageNum: pagenum,
                iPageSize: 200,
                iOrder: 1
            },
            success: function (json) {
                if (json.errCode == 0 && json.result.rows) {
                    var hotgames = [];
                    for (var i = 0; i < json.result.rows.length; i++) {
                        hotgames.push(json.result.rows[i]);
                    }

                    var $hotGameHtml = "";
                    for (var i = 0; i < hotgames.length; i++) {
                        $hotGameHtml += '<label data-id="' + hotgames[i].iTagID + '"><input type="checkbox">' + hotgames[i].szTagName + '</label>';
                    }
                    $("#id_tag .tab-span").eq(1).show();
                    $("#id_tag .lab-div .lab-boxes").eq(1).find('.gamelabs').append($hotGameHtml);
                    if (hotgames.length >= 200) {
                        $("#id_tag .lab-boxes").find('a.loadmore').show();
                    } else {
                        $("#id_tag .lab-boxes").find('a.loadmore').hide();
                    }

                    if (tagSelectedArr) { //修改状态 绑定的标签选中
                        for (var i = 0; i < tagSelectedArr.length; i++) {
                            $('#id_tag').find('label[data-id=' + tagSelectedArr[i].iTagID + ']').find("input").attr("checked", "checked");
                        }
                    }
                }
                if(typeof callback == "function") {
                    callback();
                }
            }
        })
    }
    function publishArticle(iPublishType, type, iPublishScope, iProductID, iArticleID, szSummary, detail, imgUrl, time, videourl, iClassID, iAttacheFlag) {
        raphale.ajax({
            url: '/master/article/publish',
            type: 'post',
            dataType: 'json',
            data: {
                iPublishType: iPublishType,
                iArticleType: type,
                iPublishScope: iPublishScope,
                iProductID: iProductID,
                iArticleID: iArticleID,
                szTitle: $('#id_article_title').val().trim(),
                szSummary: szSummary,
                szDetails: detail,
                szImageUrl: imgUrl,
                dtTime: time,
                szVideoUrl: videourl,
                iClassID: iClassID,
                iAttacheFlag: iAttacheFlag
            },
            success: function(json) {
                if (json.errCode != 0) {
                    pop.alert(json.msg, 1, 2);
                    return;
                }
                //标签单独加
                publishTag(json.result.iArticleID);

                if (iAttacheFlag == 1 && parseInt(iStatus, 10) != 0) {
                    publishVote(json.result.iArticleID);
                } else {
                    publishSuccess();
                }
            },
            fail: function(e, d) {
                pop.alert('发布文章失败', 1, 2);
            }
        })
    }

    function publishSuccess(flag) {
        if(flag){
            return;
        }
        var iProductID = getUrlParam('iProductID');
        if ($(':radio[checked]').attr('id') == 'id_now') {
            if(flag){

            }
            var alert = pop.alert('发布成功', 2, 1, function() {
                location.href = '/master/articlemanager.html?iProductID=' + iProductID;
            });
            alert.onclose = function() {
                    location.href = '/master/articlemanager.html?iProductID=' + iProductID;
                }
                //$('#id_success').show();
        } else {
            var time = $('#id_time').val();
            var str = '已设定为' + time.substr(5, 2) + '月' + time.substr(8, 2) + '日' + time.substr(11, 2) + '：' + time.substr(14, 2) + '分发送！';
            var alert = pop.alert(str, 2, 1, function() {
                location.href = '/master/articlemanager.html?iProductID=' + iProductID;
            });

            alert.onclose = function() {
                location.href = '/master/articlemanager.html?iProductID=' + iProductID;
            }
        }
    }

    function getArticleDetail() {
        var desc = TFL.editor.getInstance("id_article").html();

        function parseDom(ele) {
            var objE = document.createElement("div");
            objE.innerHTML = ele;
            return objE;
        }
        var descDom = parseDom(desc);
        $(descDom).find("img").each(function(index) {
            if (this.src && this.src.indexOf("emoticons") != -1) {
                $(this).addClass("inputemot");
            }
        });
        desc = descDom.outerHTML;
        return desc;
    }

    function uploadPicture(type) {
        var uploader = new plupload.Uploader({
            runtimes: 'html5,silverlight,flash',
            flash_swf_url: '/lib/js/Moxie.swf',
            silverlight_xap_url: '/lib/js/Moxie.xap',
            browse_button: 'id_article_picture' + type,
            url: '/php/upload.php?from=web',
            dataType: 'json',
            multi_selection: false,
            max_file_size: "1MB",
            filters: [{
                title: "Image文件",
                extensions: "jpg,jpeg,png,ico,icon"
            }]
        });
        if(type != '') {
            h5uploader = uploader;
        }
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
    }

    function getArticle() {
        var iType;
        if (iArticleID == '') {
            iType = 1;  //取自动保存的文章
        } else {
            iType = 2; //取有ID的文章
        }
        raphale.ajax({
            url: '/master/article/articlelist',
            type: 'GET',
            dataType: 'jsonp',
            data: {
                iProductID: iProductID,
                iArticleID: iArticleID,
                iType: iType,
                iStatus: 0,
                iPageSize: 1,
                iOrder:0,
                iPageNum: 0,
                iClassID: ''
            },
            success: function(json) {
                if (json.errCode == 0 && json.result) {
                    if (json.result.rows && json.result.rows.length > 0) {
                        articleEdited = json.result.rows[0];
                        setArticle(json.result.rows[0]);
                        showTag(iArticleID);
                    } else if (json.result && json.result.length > 0) {
                        articleEdited = json.result[0];
                        setArticle(json.result[0]);
                        showTag(iArticleID);
                        if (json.result[0].iAttacheFlag == 1) {
                            raphale.ajax({
                                url: '/user/vote/get',
                                type: 'GET',
                                dataType: 'jsonp',
                                data: {
                                    iID: iArticleID,
                                    iType: 1,
                                    iProductID: iProductID,

                                    iQQ: raphale.login.getUin()
                                },
                                success: function(json) {
                                    if (json.errCode != 0) {
                                        pop.alert(json.msg, 1, 1);
                                        return;
                                    }
                                    iAttacheFlag = 1;
                                    $('#id_vote').show();
                                    $('#id_vote').find('.btn-add').show();
                                    $('#id_vote').find('.vote-li').show();
                                    $('#id_vote').find('.btn-add').unbind('click');
                                    if (parseInt(iStatus, 10) === 0) {
                                        $('#id_vote').find('.btn-cancel').hide();
                                    } else {
                                        $('#id_vote').find('.btn-cancel').show();
                                    }
                                    $('#id_vote').find('.vote-li').html('');
                                    try {
                                        var voteT = '';
                                        if (iStatus == 0) {
                                            voteT = '<p class="p-tit"><input type="text" readonly="readonly" value="' + filterXSS(json.result.voteTitle[0].szTitle) + '"></p>';
                                        } else {
                                            voteT = '<p class="p-tit"><input type="text" value="' + filterXSS(json.result.voteTitle[0].szTitle) + '"></p>';
                                        }

                                        $('#id_vote').find('.vote-li').append(voteT);
                                        for (var i = 0; i < json.result.voteItem.length; i++) {
                                            var voteI = '';
                                            if (iStatus == 0) {
                                                voteI = '<p><input type="text" readonly="readonly" value="' + filterXSS(json.result.voteItem[i].szVoteItem) + '"></p>';
                                            } else {
                                                voteI = '<p><input type="text" value="' + filterXSS(json.result.voteItem[i].szVoteItem) + '">';
                                                if(json.result.voteItem.length > 2){
                                                    voteI += '<a href="javascript:;" class="btn-delet">删除</a>';
                                                }
                                                voteI += '</p>';
                                            }
                                            $('#id_vote').find('.vote-li').append(voteI);
                                        }
                                        if(iStatus != 0){
                                            $('#id_vote').find('.vote-li').append('<div class="box-div"><a href="javascript:;">增加选项</a></div>');
                                        }
                                    } catch (e) {}
                                }
                            })
                        } else {
                            if (parseInt(iStatus, 10) === 0) {
                                $('.btn-add').hide();
                            }
                        }
                    } else {
                        uploadPicture("");
                    }
                } else {
                    uploadPicture("");
                }
            },
            fail: function() {
                uploadPicture("");
            }
        })
    }

    function setArticle(article) {
        var szSummary = article.szSummary;
        try{
             var o =JSON.parse(article.szSummary);
            if(article.iType == 13) {
                if(o.h5background && o.h5background.length > 0) {
                    $('#id_picture_h5').html(
                        '<span class="ar-pic"><img src="' + o.h5background + '"><em class="delet-img"></em></span>'
                    );
                } else {
                    $('#id_picture_h5').html(
                        '<span class="btn-file"><input type="file" class="file-style" id="id_article_picture_h5"></span>'
                    );
                    uploadPicture('_h5');
                }
            }
            szSummary = o.daoyu||o.szSummary;
        } catch(e) { }
        $('#id_select').val(article.iClassID);
        $('#id_select').trigger('change');
        if (parseInt(iStatus, 10) === 0) {
            $('#id_select').attr('disabled', "disabled");
        } else {
            $('#id_select').removeAttr('disabled');
        }
        $('#id_article_title').val(article.szTitle);

        if (article.iType == 1) {
            $('.leadwords').hide();
            $('.set-pic').find('div div label em').text("");
        } else if (article.iType == 13 || article.iType == 14){
            $('.leadwords').show();
            $('.leadwords').find('div label em').text("");
            $('.set-pic').find('div div label em').text("*");
            $('#id_article_summary').val(szSummary);
            $('#id_tag').show();
            $('#from_name').show();
            $('#from_url').show();
        } else {
            $('.leadwords').show();
            $('.set-pic').find('div div label em').text("*");
            $('#id_article_summary').val(szSummary);
        }
        if (article.szImageUrl != "") {
            $("#id_picture").html(
                '<span class="ar-pic"><img src="' + filterXSS(article.szImageUrl) + '"/><em class="delet-img"></em></span>'
            );
        } else {
            $('#id_picture').html(
                '<span class="btn-file"><input type="file" class="file-style" id="id_article_picture"></span>'
            );
            uploadPicture("");
        }
        var editor = TFL.editor.getInstance("id_article");
        editor.setHtml(article.szDetails);
        if (article.iStatus == 2) {
            $('#id_appointment').attr('checked', 'checked');
            $('#id_time').val(article.dtTime);
            $('#id_time').show();
        } else {
            $('#id_now').attr('checked', 'checked');
            $('#id_time').hide();
        }
        var video = article.szVideoUrl;
        try {
            var url = JSON.parse(article.szVideoUrl).url;
            $('#id_article_video').val(url);
            if (JSON.parse(article.szVideoUrl).fromtitle){
                $('#id_from_title').val(JSON.parse(article.szVideoUrl).fromtitle);
            }
            if (JSON.parse(article.szVideoUrl).fromurl){
                $('#id_from_url').val(JSON.parse(article.szVideoUrl).fromurl);
            }
        } catch (e) {
            $('#id_article_video').val("插入腾讯视频地址");
        }
        detailCheck($('#id_article_video'));
    }

    function setTimeSelecter() {
        $.datepicker.regional['zh-CN'] = {
            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月',
                '7月', '8月', '9月', '10月', '11月', '12月'
            ],
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月',
                '7月', '8月', '9月', '10月', '11月', '12月'
            ],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            hourText: '时',
            minuteText: '分',
            dateFormat: 'yy-mm-dd',
            isRTL: false,
            showMonthAfterYear: true
        };
        $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
        $("#id_time").datetimepicker({
            regional: "zh-CN",
            changeMonth: true,
            changeYear: true,
            minDate: new Date()
        });
    }

    //投票相关
    function voteCheck() {
        if (parseInt(iStatus, 10) === 0) {
            return true;
        }
        var pass = true;
        if ($('#id_vote').find('p.p-tit input').val().trim().length == 0) {
            $('#id_vote').find('span.watn-line').text("选项标题不能为空").show();
            return false;
        }
        if ($('#id_vote').find('p.p-tit input').val().trim().length > 30) {
            $('#id_vote').find('span.watn-line').text("选项标题不能超过30字").show();
            return false;
        }
        var options = $("#id_vote").find("p input");
        if (options.length < 3) {
            $('#id_vote').find('span.watn-line').text("选项不能少于两条").show();
            return false;
        } else if (options.length > 11) {
            $('#id_vote').find('span.watn-line').text("选项不能超过十条").show();
            return false;
        }
        for (var i = 1; i < options.length; i++) {
            var option = options.eq(i);
            if ($(option).val().trim().length <= 0) {
                $('#id_vote').find('span.watn-line').text("选项不能为空").show();
                return false;
            }
            if ($(option).val().trim().length > 30) {
                //不能超过30字
                $('#id_vote').find('span.watn-line').text("选项不能超过30字").show();
                return false;
            }
        };
        if (pass) {
            for (var i = 1; i < options.length; i++) {
                for (var j = i + 1; j < options.length; j++) {
                    if (options.eq(i).val().trim() == options.eq(j).val().trim()) {
                        //不能相同
                        $('#id_vote').find('span.watn-line').text("选项不能重复").show();
                        return false;
                    }
                }
            }
        }
        $('#id_vote').find('span.watn-line').text("").hide();
        return true;
    }


    var run = function() {
        var iProductID = getUrlParam('iProductID');
        if (!raphale.login.isProductManager(iProductID)) {
            location.href = '/master/index.html';
        } else {
            init();
        }
    }

    //初始化函数
    exports.run = run;
})
