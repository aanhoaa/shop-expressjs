$(document).ready(function(){
    //cancel order
    $(document).on('click', '.order-cancel', function(e) {
        const orderId = $(this).attr('data-id');
        swal({
            title: "Hủy đơn hàng",
            text: "Lý do hủy đơn hàng này:",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Lý do"
          },
          function(inputValue){
            if (inputValue === null) return false;
            
            if (inputValue === "") {
              swal.showInputError("Cần thông tin hủy đơn hàng!");
              return false
            }
            
            if (!inputValue) return false;
            
            $.ajax({
                url: `${window.location.origin}/user/purchase/cancel`,
                type: "put", 
                dataType: "json",
                data: {
                    orderId: orderId,
                    cancelReason: inputValue
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Hủy đơn hàng thành công", "success");
                        window.location.href = "/user/purchase";
                    }
                    if (data.state == 0) alert('Lỗi hệ thống');
                    if (data.state == -1) alert('Dữ liệu trống');
                },
                error: function(err) {
                    alert('fail');
                }
            });
          });
    })
})