$(document).ready(function(){
    var uploadIndex = -1;
    $('.upbtn').click(function(){
        uploadIndex = $(this).attr('data-i');
        $('.pop').show();
    });
});
