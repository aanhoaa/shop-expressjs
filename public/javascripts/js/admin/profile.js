$(document).ready(function(){
    $(document).on('click', '.delete-user', function(e) {
        const userId = $(this).data('id');
        console.log(userId)
        if (userId != '') {
            swal({
                title: "Xác nhận",
                text: "Bạn xác nhận Xóa người dùng này?",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
            },
            function(inputValue){
                if (inputValue === null) return false;
                if (!inputValue) return false;
                
                $.ajax({
                    url: `${window.location.origin}/admin/user/delete`,
                    type: "delete", 
                    dataType: "json",
                    data: {
                        userId: userId
                    },
                    success:function(data){ 
                        if (data.state == 1) {
                            swal("Thành công!", "Đã xóa người dùng khỏi hệ thống", "success");
                            setTimeout(function(){ 
                                window.location.href = "/admin/profile/user";
                            }, 900);
                        }
                        if (data.state == 0) alert('Lỗi hệ thống');
                        if (data.state == -1) alert('Dữ liệu trống');
                    },
                    error: function(err) {
                        alert('fail');
                    }
                })
            });
        }
    })
})