$(document).ready(function(){
    $(document).on('change', '#pick-option-report', function() {
        const option = $(this).val();
        if (option != '') {
            $.ajax({
                url: `${window.location.origin}/seller/api/finance/income`,
                type: "post", // phương thức gửi dữ liệu.
                dataType: "html",
                data: {
                  optionSelect: option,
                  },
                success:function(data){ //dữ liệu nhận về
                    $("#dataTables-example").empty();
                    $("#dataTables-example").append($(data).find('#dataTables-example').children());
                },
                error: function(err) {
                  console.log(err)
                  alert("Bị lỗi");
                }
            });
        }
    })

    $(document).on('click', '.delete-voucher', function(e) {
        e.preventDefault();

        const id = $(this).data('id');
        
        swal({
            title: "Xác nhận",
            text: "Bạn muốn xóa voucher này?",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
        },
        function(inputValue){
            if (inputValue === null) return false;
            if (!inputValue) return false;
            
            $.ajax({
                url: `${window.location.origin}/seller/api/sales/delete`,
                type: "delete", // phương thức gửi dữ liệu.
                dataType: "json",
                data: {
                    id: id
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Đã xóa voucher này", "success");
                        window.location.href = "/seller/sales";
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

    $(document).on('click', '.finish-voucher', function(e) {
        e.preventDefault();

        const id = $(this).data('id');
        
        swal({
            title: "Xác nhận",
            text: "Bạn muốn kết thúc chương trình khuyến mãi này?",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
        },
        function(inputValue){
            if (inputValue === null) return false;
            if (!inputValue) return false;
            
            $.ajax({
                url: `${window.location.origin}/seller/api/sales/update`,
                type: "put", // phương thức gửi dữ liệu.
                dataType: "json",
                data: {
                    id: id
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Đã kết thúc đợt khuyến mãi này", "success");
                        window.location.href = "/seller/sales";
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