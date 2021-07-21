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
                url: `${window.location.origin}/user/purchase/?type=cancel`,
                type: "put", 
                dataType: "json",
                data: {
                    orderId: orderId,
                    cancelReason: inputValue
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal("Nice!", "Hủy đơn hàng thành công", "success");
                        //window.location.href = "/user/purchase";
                        window.location.replace(data.data)
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

    //rating
    // $(document).on('click', '.rating', function(e) {
    //     var $star_rating = $('.star-rating .fa');

    //     var SetRatingStar = function() {
    //     return $star_rating.each(function() {
    //        if (parseInt($star_rating.siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
    //           return $(this).removeClass('fa-star-o').addClass('fa-star');
    //        } else {
    //           return $(this).removeClass('fa-star').addClass('fa-star-o');
    //        }
    //     });
    //     };
     
    //     $star_rating.on('click', function() {
    //     $star_rating.siblings('input.rating-value').val($(this).data('rating'));
    //     return SetRatingStar();
    //     });
     
    //     SetRatingStar();
    // })
    var $star_rating = $('.star-rating .fa');

    var SetRatingStar = function(event) {
    return $star_rating.each(function(event) {
        if (parseInt($(this).siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
            return $(this).removeClass('fa-star-o').addClass('fa-star');
        } else {
            return $(this).removeClass('fa-star').addClass('fa-star-o');
        }
    });
    };
    
    $star_rating.on('click', function(event) {
        $(this).siblings('input.rating-value').val($(this).data('rating'));
        const rating = $(this).siblings('input.rating-value').val();
        const r_id = $(this).siblings('input.rating-value').data('id');

        $.ajax({
            url: `${window.location.origin}/user/purchase/rating`,
            type: "put", 
            dataType: "json",
            data: {
                rating: rating,
                r_id: r_id
            },
            success:function(data){ 
                if (data.state == 1) {
                    location.reload();
                }
                else alert('Lỗi hệ thống');
            },
            error: function(err) {
                alert('fail');
            }
        });
        return SetRatingStar();
    });
    
    SetRatingStar();
})