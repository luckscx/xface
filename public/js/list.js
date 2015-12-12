$(document).ready(function(){
    $('.img-item img').click(function(){
        if($(this).parent().find('a').hasClass('cur')) {
            $(this).parent().find('a').removeClass('cur');
        } else {
            $('.cur').removeClass('cur');
            $(this).parent().find('a').addClass('cur');
        }
    })
    $('.sbm').click(function(){
        var filename = $('.cur').parent().find('img').attr('src'); 
        $.ajax({
            url: 'n/do',
            type: 'POST',
            data: {
                picfile: filename,
                mailaddress: ''
            },
            success: function(json){
                console.log(json);
            }
        }); 
    })
})
