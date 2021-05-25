

$(document).ready(function(){
   $('.product-variation').click(function(event) {
       //reset input quantity
       $('#quantity').val(1);
        if ($(this).hasClass('product-variation-selected')) {
            $(this).removeClass('product-variation-selected');
            $(this).parent().find('.product-variation').removeClass('product-variation-selected');
        }
        else {
            $(this).parent().find('.product-variation').removeClass('product-variation-selected');
            $(this).addClass('product-variation-selected');
        }

        if ($('.product_details_color').length > 0 && $('.product_details_size').length > 0) {
            var color = $('.product_details_color').find('.product-variation-selected').text();
            var size = $('.product_details_size').find('.product-variation-selected').text();
        }
        else if ($('.product_details_color').length > 0 && $('.product_details_size').length < 1) {
            var color = $('.product_details_color').find('.product-variation-selected').text();
            var size = 1;
        }
        else if ($('.product_details_size').length > 0 && $('.product_details_color').length < 1) {
            var size = $('.product_details_size').find('.product-variation-selected').text();
            var color = 1;
        }
        else {
            var color = 1;
            var size = 1;
        }
    
        if (color != '' && size != '') {
            //warning error, miss data
            $('.column-variant-option').removeClass('error-miss-info');
            $('.notifi-miss').remove();
        }
        else {
            console.log('out event')
            $('.quantity').html('');
            return;
        }

        console.log('call ajax')
            const productId = document.getElementById('product_id').value;
            const quantity = document.getElementById('quantity').value;
            //ajax here
            $.ajax({
                url: `${window.location.origin}/getproductinfo`,
                type: "get", // phương thức gửi dữ liệu.
                dataType: "json",
                data: {
                    productId: productId,
                    color: color,
                    size: size,
                    quantity: quantity
                },
                success:function(data){ 
                    $('#pdv').val(data.productvariant_id);
                    $('#stock').val(data.stock);
                    if (data.stock > 0) {
                        $('.quantity').html(data.stock + ' sản phẩm có sẵn');
                        $('#quantity').attr('max', data.stock);
                    }
                   else {
                        $('.quantity').html('Hết hàng');
                        $('#quantity').attr('disabled', true);
                    }
                },
                error: function(err) {
                    alert(err.err);
                }
            });
   })

   document.getElementById("buy").onclick = function() {
        warningProduct();
   };

   document.getElementById('add-cart').onclick = function() {
       var {color, size} = warningProduct();
       const productId = document.getElementById('product_id').value;

       if (color != '' && size != ''){
        const pdvID = document.getElementById('pdv').value;
        const quantity = document.getElementById('quantity').value;
            //ajax save db
            $.ajax({
                url: `${window.location.origin}/cart/add_to_cart`,
                type: "post", 
                dataType: "json",
                data: {
                pdvID: pdvID,
                amount: quantity
                },
                success:function(data){ 
                    if (data.state == 1) {
                        swal({
                        title: "Success!",
                        text: "Sản phẩm đã được thêm vào giỏ hàng",
                        type: "success",
                        timer: 1300,
                        });
                    }
                },
                error: function(err) {
                    //console.log(document.referrer)
                    window.location.href = "/login"
                }
            });
        }
    };

    
    document.getElementById('quantity').onkeyup = function(e) {
        var quantity = document.getElementById('quantity').value;
        var {color, size} = warningProduct();
        if (color != '' && size != ''){
            const productId = document.getElementById('product_id').value;
            $.ajax({
                url: `${window.location.origin}/getproductinfo`,
                type: "get", 
                dataType: "json",
                data: {
                    productId: productId,
                    quantity: quantity,
                    color: color,
                    size: size
                },
                success:function(data){ 
                    $('#pdv').val(data.productvariant_id);
                    $('#stock').val(data.stock);
                    if (data.stock > 0) {
                        $('.quantity').html(data.stock + ' sản phẩm có sẵn');
                        $('#quantity').attr('max', data.stock);
                    }
                   else {
                        $('.quantity').html('Hết hàng');
                        $('#quantity').attr('disabled', true);
                    }
                },
                error: function(err) {
                    $('#quantity').val(1);
                    alert(err.responseText)
                }
            });
        }
    }

})

function warningProduct() {
    if ($('.product_details_color').length > 0 && $('.product_details_size').length > 0) {
        var color = $('.product_details_color').find('.product-variation-selected').text();
        var size = $('.product_details_size').find('.product-variation-selected').text();
    }
    else if ($('.product_details_color').length > 0 && $('.product_details_size').length < 1) {
        var color = $('.product_details_color').find('.product-variation-selected').text();
        var size = 1;
    }
    else if ($('.product_details_size').length > 0 && $('.product_details_color').length < 1) {
        var size = $('.product_details_size').find('.product-variation-selected').text();
        var color = 1;
    }
    else {
        var color = 1;
        var size = 1;
    }

    if (color == '' || size == '') {
        //warning error, miss data
        $('.column-variant-option').addClass('error-miss-info');
        if ($('.notifi-miss').length < 1) {
            $('.column-variant-option').append('<div class="notifi-miss"> <span>Vui lòng chọn phân loại hàng</span> </div>');
        }
    }
    else {
        $('.column-variant-option').removeClass('error-miss-info');
        $('.notifi-miss').remove();
        var quantity = document.getElementById('quantity').value;
    }
    return {color, size, quantity};
}
