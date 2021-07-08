$(document).ready(function(){
  $(document).on('change', '.input-number', function(e) {
    $("#amount_input").val($(this).val());
  });
  
  // $(document).on('click', '.product_details_color .color_fix', function(e) {
  //     // e.preventDefault();
  //       var color_val = $(this).find('.color_child').val();
  //       //console.log(color_val)
  //       var size_val = $('.product_details_size .active').find('.size_child').val();
  //       var product_id = $('#product_id').val();
      
  //       $.ajax({
  //         url: `${window.location.origin}/shop/product/detail/${product_id}`,
  //         type: "get", // phương thức gửi dữ liệu.
  //         data: {
  //               size_val: size_val,
  //               color_val: color_val
  //           },
  //         success:function(data){ //dữ liệu nhận về
  //             $(".block_pay").empty();
  //             $(".block_pay").append($(data).find('.block_pay'));
  //              console.log(data);
  //         },
  //         error: function() {
  //           // alert("Bị lỗi");
  //         }
  //      });
  //   });



  // $(document).on('click', '.product_details_size .size_fix', function(e) {
  //  // e.preventDefault();
  //       var size_val = $(this).find('.size_child').val();
  //       var color_val = $('.product_details_color .active').find('.color_child').val();
  //       var product_id = $('#product_id').val();
  //       // console.log(size_val +color_val);
  //     //   $.ajax({
  //     //    // url: "http://shop.test/public/view/" + product_id,
  //     //     type: "get", // phương thức gửi dữ liệu.
  //     //     data: {
  //     //           size_val: size_val,
  //     //           color_val: color_val
  //     //       },
  //     //     success:function(data){ //dữ liệu nhận về
  //     //         $(".block_pay").empty();
  //     //         $(".block_pay").append($(data).find('.block_pay'));
  //     //         // console.log(data);
  //     //     },
  //     //     error: function() {
  //     //       // alert("Bị lỗi");
  //     //     }
  //     //  });
  //   });

$('.btn-number').click(function(e){
    e.preventDefault();
    
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {
            
            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            } 
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});
$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});
$('.input-number').change(function() {
    
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    
    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    
    
});
$(".input-number").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
$("#them_gio_hang").click(function(event) {
  /* Act on the event */
  
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
$(".btn-search").click(function(event) {
  const query = $('#search-text').val();
  window.location.href = `/search?q=${query}`
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

});

/*
                        <!-- <%-size[i].price != 0 ? 'btn-outline-danger auth' : 'lbl-dsb'%>
                        <%-size[i].price != 0 ? '': 'disabled'%> -->
                    
*/