$(document).ready(function(){
    function getQuestions(){
        $.ajax({
            url: '',
            data: {},
            success: function(json){
                if(json.errCode == 0) {
                    setQuestions(json.result);
                }
            }
        })
    }
    function setQuestions(data){
        $('#questionimg').attr('src', data.img);
        for(var i = 0; i < data.ans.length; i++) {
            $('.ans .opt div').eq(i).attr('data-id', data.ans[i].id);
            $('.ans .opt div').eq(i).text(data.ans[i].desc);
        }
    }
    function addEvent() {
        $('.ans .opt div').click(function(){
            var id = $(this).attr('data-id');
            getAnswer(id);
        });
    }
    function getAnswer(id) {
        $.ajax({
            url: '',
            data: {
                id: id 
            },
            success: function(json){
                if(json.errCode == 0 && json.result) {
                    alert('true');
                } else {
                    alert('false');
                }
            }
        })
    }
});
