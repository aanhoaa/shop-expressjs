$(document).ready(function(){
    $(document).on('click', '.order-confirm', function(e) {
        const orderId = $(this).attr('data-id');
        
        if (orderId != '') {
            $.ajax({
                url: `${window.location.origin}/admin/order/confirm`,
                type: "put", 
                dataType: "json",
                data: {
                    orderId: orderId
                },
                success:function(data){ 
                    if (data.state == 1) window.location.href = "/admin/order";
                    if (data.state == 0) alert('Lỗi hệ thống');
                    if (data.state == -1) alert('Dữ liệu trống');
                },
                error: function(err) {
                    alert('fail');
                }
            });
        }
    })

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
                url: `${window.location.origin}/admin/order/cancel`,
                type: "put", 
                dataType: "json",
                data: {
                    orderId: orderId,
                    cancelReason: inputValue
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Hủy đơn hàng thành công", "success");
                        window.location.href = "/admin/order";
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

    //delivery
    $(document).on('click', '.order-delivery', function(e) {
        const orderId = $(this).attr('data-id');
        swal({
            title: "Xác nhận",
            text: "Bạn xác nhận giao đơn hàng này?",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
          },
          function(inputValue){
            if (inputValue === null) return false;
            if (!inputValue) return false;
            
            $.ajax({
                url: `${window.location.origin}/seller/order/delivery`,
                type: "put", 
                dataType: "json",
                data: {
                    orderId: orderId
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Đơn hàng đang giao", "success");
                        window.location.href = "/seller/order?type=delivery";
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
    
    //delivered
    $(document).on('click', '.order-delivered', function(e) {
        
    })
})