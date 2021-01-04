$(document).ready(function(){  
  var gColor = '';

  $(document).on('click', '.product_details_color .color_bind', function(e) {

      //$('.color_bind').css('box-shadow', '0 0 0 0.2rem rgba(0, 123, 255, .5)');
      // e.preventDefault();

        var color_val = $(this).find('.color_child').val();
        var size_val = $('.product_details_size .active').find('.size_child').val();
        var product_id = $('#product_id').val();
         //console.log(size_val +color_val);
        // console.log(gColor);
        if (gColor === color_val)
        {
           $('.color_fix').removeClass('focus active');
           $('.size_fix').removeClass('lbl-dsb');
           $('.size_fix').addClass('size_bind');
           $('.quantity').text('');
           gColor = '';
        }
        else {
          gColor = color_val;
        $.ajax({
          url: `${window.location.origin}/shop/product/detail/${product_id}`,
          type: "get", // phương thức gửi dữ liệu.
          dataType: "json",
          data: {
                size_val: size_val,
                color_val: color_val,
            },
          success:function(data){ //dữ liệu nhận về
             // $(".block_pay").empty();
             //$(".block_pay").append($(data).find('.block_pay'));
             
             $('.size_fix').removeClass('lbl-dsb');
             $('.size_fix').addClass('size_bind');
             $('.' + color_val).addClass('lbl-dsb');
             $('.' + color_val).removeClass('size_bind');
             $('.' + color_val).find('.size_child').attr('disabled','disabled');
          
              if (data != '')
              {
                $('.input-number').val(1);
                $('.input-number').attr('max', data[0].amount);
                $('.product_details_price_zero').text(data[0].price.toLocaleString() + '₫');
                $('.quantity').text(data[0].amount + ' sản phẩm có sẵn');
                $('#price').val(data[0].price);
                $('#qtt').val(data[0].amount);
              }
  
          },
          error: function() {
            // alert("Bị lỗi");
          }
       });
      }
    });

    var gSize = '';

  $(document).on('click', '.product_details_size .size_bind', function(e) {

    // e.preventDefault();
         var size_val = $(this).find('.size_child').val();
         var color_val = $('.product_details_color .active').find('.color_child').val();
         var product_id = $('#product_id').val();
          //console.log(size_val +color_val);
          //console.log(gSize);
          if (gSize === size_val)
          {
             $('.size_fix').removeClass('focus active');
             $('.color_fix').removeClass('lbl-dsb');
             $('.color_fix').addClass('color_bind');
             gSize = '';
             $('.quantity').text('');
          }
          else{
            gSize = size_val;
            $('.size_fix').removeClass('focus active');
            $(this).addClass('focus active')
         $.ajax({
           url: `${window.location.origin}/shop/product/detail/${product_id}`,
           type: "get", // phương thức gửi dữ liệu.
           dataType: "json",
           data: {
                 size_val: size_val,
                 color_val: color_val,
             },
           success:function(data){ //dữ liệu nhận về
           
              // $(".block_pay").empty();
              // $(".block_pay").append($(data).find('.block_pay'));
              //$('.'+)
              $('.color_fix').addClass('color_bind');
              $('.color_fix').removeClass('lbl-dsb');
              $('.' + size_val).addClass('lbl-dsb');
              $('.' + size_val).removeClass('color_bind');

               if (data != '')
              {
                $('.input-number').val(1);
                $('.input-number').attr('max', data[0].amount);
                $('.product_details_price_zero').text(data[0].price.toLocaleString() + '₫');
                $('.quantity').text(data[0].amount + ' sản phẩm có sẵn');
                $('#price').val(data[0].price);
                $('#qtt').val(data[0].amount);
              }
               
           },
           error: function() {
             // alert("Bị lỗi");
           }
        });
      }
   });

  var total_price = 0;
  $(document).on('change', '.input_new', function(e) {
    var amount_cart = $(this).val();
    var cart_id = $(this).parent().find('.cart_id').val();
    var inventAmount = $(this).parent().find('.invent_Amount').val();
    var price_original = $(this).parent().parent().parent().find('.price').val();
    // console.log(cart_id);
    var total_payment = 0;
    var total = $(this).parent().parent().parent().find('.payment_total_hidden').val();
    if(parseInt(amount_cart, 0) <= parseInt(inventAmount, 0))
    {
      $.ajax({
          url: "update-cart/" + cart_id + '/' + amount_cart,
          type: "get", // phương thức gửi dữ liệu.
          data: {
                cart_id: cart_id,
                amount_cart: amount_cart
            },
          success:function(data){ //dữ liệu nhận về
              // $(".block_pay").empty();
              // $(".block_pay").append($(data).find('.block_pay'));
              
              // if (data == "Cart_Error") {
                  
              //     $(this).val($(this).val()-1).change();
                
              // }
          },
          error: function() {
            // alert("Bị lỗi");
          }
       });
      total_price = parseInt(price_original, 10) * parseInt(amount_cart, 10);

      for(i=0; i<$('.khoimenu').length; i++)
      {
        $(this).parent().parent().parent().find('.payment_total_hidden_'+i).val(total_price);
       total_payment += parseInt($('.payment_total_hidden_'+i).val(), 10);
      }


      
      total_price = total_price.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
      total_payment = total_payment.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
      $(this).parent().parent().parent().find('#payment_total').text(total_price);

      
      // console.log(total_payment);
      // console.log(total_price);
      $('.TOTAL').text(total_payment);
    }
    else
    {
      swal({
        title: "Error!",
        text: "Sản phẩm tồn kho không đủ!",
        icon: "error",
        button: "Aww yiss!",
      });
      $(this).val($(this).val()-1).change();
    }

  });

$("#them_gio_hang").click(function(event) {
  /* Act on the event */
  var color = $('.color_fix.active .color_child').val();
  var size = $('.size_fix.active .size_child').val();

  if (color == undefined || size == undefined)
  {
    swal({
      title: "Error Message!",
      text: "Thông tin sản phẩm bị thiếu",
      icon: "error",
      button: "OK",
    });

    event.preventDefault();
  }
  else
  {
    $('#color').val(color);
    $('#size').val(size);
    $('#amount').val($('.input-number').val());

    var code = $('#'+size+color).val();

    //console.log(parseInt(code,10) + parseInt($('#amount').val(),10) + ' ' + $('#qtt').val())
    if (parseInt(code,10) + parseInt($('#amount').val(),10) > $('#qtt').val())
    {
      swal({
        title: "Warning!!!",
        text: "Sản phẩm này đã hết hàng",
        icon: "warning",
        button: "OK",
      });
      event.preventDefault();
    }
    
   // $("#them_gio_hang").submit();
  }
  
    $('#gio_hang').addClass('gio_hang');
    setTimeout(function(){
          $('#gio_hang').removeClass("gio_hang"); 
        }, 4000);

    
    // setTimeout(function(){
    //       $('#them_gio_hang_click').click();
    //     }, 3500);

    $('#icon_giohang').addClass('icon_giohang');
    setTimeout(function(){
          $('#icon_giohang').removeClass("icon_giohang"); 
        }, 5000);
    
});

$(".delete-cart").click(function(event) {
  var indexCart = $(this).attr('data-info');
  $.ajax({
    url: `${window.location.origin}/shop/cart/delete`,
    type: "get", // phương thức gửi dữ liệu.
    data: {
          iCart: indexCart
      },
    success:function(data){ //dữ liệu nhận về
      window.location.href = window.location.origin + '/shop/cart'
    },
    error: function() {
      // alert("Bị lỗi");
    }
 });
});


$('.image_gallery').click(function(event) {
  /* Act on the event */
  var imgsrc=$(this).attr('src');
  $('#image_zoom').attr('src',imgsrc);
  $('.exzoom_preview_img').attr('src',imgsrc);
});


$(".arcodion .arcodion_hover").hover(function(){
    
    $(this).each(function() {
      if($(this).hasClass("arcodion_description"))
      {
        $('.arcodion_description .arcodion_under_line').toggleClass("change_color_underline");
      }
      else if($(this).hasClass("arcodion_orientation"))
      {
        $('.arcodion_orientation .arcodion_under_line').toggleClass("change_color_underline");
      }
      else if($(this).hasClass("arcodion_shipping"))
      {
        $('.arcodion_shipping .arcodion_under_line').toggleClass("change_color_underline");
      }
      else if($(this).hasClass("arcodion_reback"))
      {
        $('.arcodion_reback .arcodion_under_line').toggleClass("change_color_underline");
      }
    });  
});


  $('.voucher_checkout').click(function(event) {
  /* Act on the event */
    event.preventDefault();
    var val = $(".voucher").val();
    var total = $('.payment_total').val();
    // alert(total);
    $.ajax({
      url: "checkout_voucher",
      type: "get", // phương thức gửi dữ liệu.
      dataType: "html",
      data: {
            val: val,
            total: total
        },
      success:function(data){ //dữ liệu nhận về
        
          if(data == "Error")
          {
            swal("Error!","Mã giảm giá chỉ được sử dụng một lần!!!","error");
          }
          else if(data == "Error_User")
          {
            swal("Error!","Bạn đã sử dụng mã giảm giá vượt quá số lần qui định!!!","error");
          }
          else if(data == "Error_Exist")
          {
            swal("Error!","Mã giảm giá không tồn tại!!!","error");
          }
          else
          {
            $(".checkout_block_small .col_text, .checkout_block_total .col_text").remove();
            $(".checkout_block_small").append($(data).find('.checkout_block_small .col_text'));
            $(".checkout_block_total").append($(data).find('.checkout_block_total .col_text'));
            $("#check_voucher .checkout_block_child").append($(data).find('.checkout_block .checkout_block_child .info_voucher_block'));
            swal("Done!","Kích hoạt mã giảm giá thành công!","success");
          }
      },
      error: function() {
        alert("Bị lỗi");
      }
   });
});

  $('.voucher_notcheckout').click(function(event) {
    /* Act on the event */
    swal({
      title: "Warning!!",
      text: "Tính năng này chỉ dành cho khách hàng đã có tài khoản!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
  });


  $('#select-payment').change(function(e) {
    e.preventDefault();
        var val = $("#select-payment option:selected").val();
        // alert(val);
        if(val === "paypal")
        {
          $("#tien_mat_child").css('display','none');
          $("#paypal_child").css('display','flex');
        }
        else
        {
          $("#tien_mat_child").css('display','block');
          $("#paypal_child").css('display','none');
        }
        
    });

  

});
