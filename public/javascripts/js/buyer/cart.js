$(document).ready(function(){

    //payemt checkou
    $(document).on('click', '.product-variation', function(e) {
        $('.product-variation').removeClass('payment-selected');
        $(this).addClass('payment-selected');
        $('#pay').attr('disabled', false);
        $('#pay').css({'opacity': 1, 'cursor': 'pointer'});
    })

    $(document).on('click', '.product-variation', function(e) {
        $('#payment-method').val($(this).attr('data-method'));  
    })

    $(document).on('click', '.select-voucher', function(e) {
       const shopId = $(this).data('shop');
       const total = $(this).data('total');
       //const code = $(this).parents().find('.voucher').val();
       const it = $(this);
       const code = $(this).closest('.apply-voucher').find('input').val();

       if (shopId == '' || code == "" || total == "") {
        alert('Mã voucher không tồn tại');
        return;
       }

       $.ajax({
        url: `${window.location.origin}/api/check-voucher`,
        method: "GET",
        dataType: "json",
        data: {
            shopId: shopId,
            code: code,
            total: total
        },
        success: function(data) {
            if (data.data == 0) alert("Mã voucher không tồn tại trong chương trình khuyến mãi của shop");
            if (data.data == 1) {
                swal({
                    title: "Success!",
                    text: "Áp dụng voucher thành công",
                    type: "success",
                    timer: 1500
                 });

                location.reload();
                it.parents().parents().parents().find('.code-success').show();
            }
        },
        error: function(err) {
            alert("fail");
        }
    })
    })
})