$(document).ready(function(){
    var envCheck = 0;
    $(document).on('click', '#createEmp', function(e) {
        if (envCheck == 0) e.preventDefault();
        const username = $('#username').val();
        
        if (envCheck == 0) {
            $.ajax({
                url: `${window.location.origin}/admin/profile/check/employee`,
                type: "get", 
                dataType: "json",
                data: {
                    username: username
                },
                success:function(data){ 
    
                    if (data.state == 1) {
                        $('#error-username').text('Tên đăng nhập đã tồn tại');
                        alert('Tên đăng nhập đã tồn tại');
                        e.preventDefault();
                    }
    
                    if (data.state == 0) {
                        envCheck = 1;
                        $('#createEmp').trigger('click');
                    }
                },
                error: function(err) {
                    alert('fail');
                }
            });
        }

        if (envCheck == 1) envCheck = 0;
    })

    $(document).on('keypress', '#username', function(e) {
        $('#error-username').hide();
    })
})