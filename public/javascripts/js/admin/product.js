$(document).ready(function(){

  $('#addImages').hide();

  function addImgAfterDelete(i)
  {
      // /* Act on the event */
      //     $('#insertImage').append('<div class="form-group image_block" style="margin-top: 10px;"><label>Product Image Detail '+i+'</label><div class="custom-file"><input type="file" class="custom-file-input" name="image_product_multiple'+ i +'" id="validatedCustomFile_'+(i-1)+'" required><label class="custom-file-label" required for="validatedCustomFile_'+(i-1)+'">Choose file...</label></div></div>');

  }

  //<img class="image_multiple_block img_detail" id="image_block_'+(i-1)+'" src="http://placehold.it/180" alt="your image" style="width: 69%; height: 10%;" />

  	var numSizeImage = $('.image_block').length;
    
    $(document).on('change', '#file-upload', function(e) {
		  $(this).removeAttr("disabled"); 
	});


    function readURL(input, $image_id) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $($image_id)
                    .attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }


	$(document).on('change', '#validatedCustomFile_0', function(e) {
		readURL(this,'#image_block_0');
	});
	$(document).on('change', '#validatedCustomFile_1', function(e) {
		readURL(this,'#image_block_1');
	});
	$(document).on('change', '#validatedCustomFile_2', function(e) {
		readURL(this,'#image_block_2');
	});


    $('a#del_image').on('click',(function(e){
      var idImg = $(this).parent().find("img").attr("idImg");
      var img = $(this).parent().find("img").attr("src");
      $(this).parent().find("img").remove();
      $(this).parent().removeAttr('id')
      $(this).parent().append(`<div class="custom-file"> <input type="file" class="custom-file-input" name="image_product_multiple${idImg}" id="validatedCustomFile"> <label class="custom-file-label" required for="validatedCustomFile">Choose file...</label> </div>`);
      $(this).parent().find('.img-hidden').remove();
      $(this).remove();
      e.preventDefault();
      //addImgAfterDelete(idImg);
   }));

	$(document).ready(function() {
	  // $('#dataTables-example').DataTable({
	  //   responsive: true,
	  //   columnDefs: [
	  //           {
	  //               targets: [ 0, 1, 2 ],
	  //               className: 'mdl-data-table__cell--non-numeric'
	  //           }
	  //       ]
	        
	  // });
	});

  	$(document).ready(function() {
        $('.size_product').select2({
          placeholder: "Please Choose Size",
		  maximumSelectionLength: 4,
		  // chỉ được chọn nhiều nhất 2 option
		});

  		$('.color_product').select2({
            placeholder: "Please Choose Color",
  		  maximumSelectionLength: 4,
  		  // chỉ được chọn nhiều nhất 2 option
  		});

      $('.followVoucherProduct_list').select2({
            placeholder: "Please Choose Product",
        maximumSelectionLength: 4,
        // chỉ được chọn nhiều nhất 2 option
      });

      $('.followVoucherCategory_list').select2({
            placeholder: "Please Choose Category",
        maximumSelectionLength: 4,
        // chỉ được chọn nhiều nhất 2 option
      });
    });

    $(document).on('change', '#show_payment', function() {
	    if(this.checked) {
	      // checkbox is checked
	      $('.payment_block_show').css('display', 'block');
	    }
	    else
	    {
	    	$('.payment_block_show').css('display', 'none');
	    }
	});


	// $('.productChoose').change(function(e) {
	// 	e.preventDefault();
  //       var val = $("#productChoose option:selected").val();
  //       // alert(val);
  //       var _token = $('input[name="_token"]').val(); // token để mã hóa dữ liệu
  //       $.ajax({
  //         url: "inventory_filter_product",
  //         type: "get", // phương thức gửi dữ liệu.
  //         dataType: "html",
  //         data: {
  //               option: val,
  //               _token:_token
  //           },
  //         success:function(data){ //dữ liệu nhận về
  //             $(".size_block select").remove();
  //             $(".size_block").append($(data).find('.size_block select'));
  //             $(".color_block select").remove();
  //             $(".color_block").append($(data).find('.color_block select'));
  //             // // console.log($(data).find('.khoi_sp'));
  //             // // alert(data);
  //             // console.log(data);
  //         },
  //         error: function() {
  //           alert("Bị lỗi");
  //         }
  //      });
  //   });


    $(".form-control-inline").change(function(e) {
    	// var totalPrice = parseInt($(this).val(), 10) * parseInt($(this).parent().parent().find('#old_price').val(), 10);
      var totalPrice = parseInt($(this).val(), 10) * parseInt($(this).parent().parent().find('.form-control-inline-input-price').val(), 10);
      var totalForPay = 0;
      var amountInput = 0;
      var gia_von = 0;
      var gia_von_show = 0;
      var gia_kho = parseInt($(this).parent().parent().find('td #slt').text(), 10) * parseInt($(this).parent().parent().find('#old_price').val(), 10);
      if((parseInt($(this).val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10)) !== 0)
      {
        gia_von = (totalPrice + gia_kho)/( parseInt($(this).val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10) );
        gia_von_show = (totalPrice + gia_kho)/( parseInt($(this).val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10) );
      }
      else
      {
        gia_von = 0;
        gia_von_show = 0;
      }
      
      $(this).parent().parent().find('.gia_von').val(Math.ceil(gia_von));
      gia_von = gia_von.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
      $(this).parent().parent().find('.gia_von').text(gia_von);
      // console.log(Math.ceil(gia_von));

      for(i=0; i<$('.gradeX').length; i++)
      {
        $(this).parent().parent().find('.line_'+i).val(totalPrice);
        if($('.line_'+i).val() != "")
        {
          totalForPay += parseInt($('.line_'+i).val(), 10);
        }
        
        $(this).parent().parent().find('.lineAmount_'+i).val(parseInt($(this).val(), 10));
        if($('.lineAmount_'+i).val() != "")
        {
          amountInput += parseInt($('.lineAmount_'+i).val(), 10);
        } 
      }

      totalPrice = totalPrice.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})
      $(this).parent().parent().find('.total').text(totalPrice);

      $('.pricePayment_hidden').val(totalForPay);
      $('.pricePayment').val(totalForPay);
      totalForPay = totalForPay.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});

      $('.table_block_info .list-info-money .item-info-money .product_amount').text(amountInput);
      $('.table_block_info .list-info-money .item-info-money .total_amount').val(amountInput);
    	$('.table_block_info .list-info-money .item-info-money .total_price').text(totalForPay);
    	$('.table_block_info .list-info-money .item-info-money .pricePay').text(totalForPay);
      $('.pricePayment_show, .reback_price').val(totalForPay);
      $('.reback_price').text(totalForPay);
      
      

      var inventory_Amount = $(this).parent().parent().find('.inventory_Id').val();
      inventory_Amount += '_'+Math.ceil(gia_von_show)+'_'+$(this).val();
      $(this).parent().parent().find('.inventory_Id').val(inventory_Amount);
    });

    $(".form-control-inline-input-price").change(function(e) {
      var totalPrice = parseInt($(this).val(), 10) * parseInt($(this).parent().parent().find('.form-control-inline').val(), 10);
      var totalForPay = 0;
      var amountInput = 0;
      var gia_von = 0;
      var gia_von_show = 0;
      var gia_kho = parseInt($(this).parent().parent().find('td #slt').text(), 10) * parseInt($(this).parent().parent().find('#old_price').val(), 10);
      if((parseInt($(this).parent().parent().find('.form-control-inline').val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10)) !== 0)
      {
        gia_von = (totalPrice + gia_kho)/( parseInt($(this).parent().parent().find('.form-control-inline').val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10) );
        gia_von_show = (totalPrice + gia_kho)/( parseInt($(this).parent().parent().find('.form-control-inline').val(), 10)+parseInt($(this).parent().parent().find('td #slt').text(), 10) );
      }
      else
      {
        gia_von = 0;
        gia_von_show = 0;
      }
      
      $(this).parent().parent().find('.gia_von').val(Math.ceil(gia_von));
      gia_von = gia_von.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
      $(this).parent().parent().find('.gia_von').text(gia_von);
      // console.log(Math.ceil(gia_von));

      for(i=0; i<$('.gradeX').length; i++)
      {
        $(this).parent().parent().find('.line_'+i).val(totalPrice);
        if($('.line_'+i).val() != "")
        {
          totalForPay += parseInt($('.line_'+i).val(), 10);
        }
        
        $(this).parent().parent().find('.lineAmount_'+i).val(parseInt($(this).parent().parent().find('.form-control-inline').val(), 10));
        if($('.lineAmount_'+i).val() != "")
        {
          amountInput += parseInt($('.lineAmount_'+i).val(), 10);
        } 
      }

      totalPrice = totalPrice.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})
      $(this).parent().parent().find('.total').text(totalPrice);

      $('.pricePayment_hidden').val(totalForPay);
      $('.pricePayment').val(totalForPay);
      totalForPay = totalForPay.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});

      $('.table_block_info .list-info-money .item-info-money .product_amount').text(amountInput);
      $('.table_block_info .list-info-money .item-info-money .total_price').text(totalForPay);
      $('.table_block_info .list-info-money .item-info-money .pricePay').text(totalForPay);
      $('.pricePayment_show, .reback_price').val(totalForPay);
      $('.reback_price').text(totalForPay);
      
      

      var inventory_Amount = $(this).parent().parent().find('.inventory_Id').val();
      inventory_Amount += '_'+Math.ceil(gia_von_show)+'_'+parseInt($(this).parent().parent().find('.form-control-inline').val(), 10);
      $(this).parent().parent().find('.inventory_Id').val(inventory_Amount);
    });


    $('.supplier').change(function(e) {
    e.preventDefault();
        var val = $(".supplier option:selected").val();
        // alert(val);
        $.ajax({
          url: "inventory_filter_supplier",
          type: "get", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                option: val
            },
          success:function(data){ //dữ liệu nhận về
              $(".supplier_info_details").empty();
              $(".supplier_info_details").append($(data).find('.supplier_info_details .supplier_info'));
              console.log(data);
              // // alert(data);
              // console.log(data);
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
    });

    $('.gia_ban').change(function(e) {
    e.preventDefault();
        var gia_ban = $(this).val();
        var id_sp = $(this).attr('data-id');
        var gia_von = $(this).attr('data-investment');
        var _token = $('input[name="_token"]').val(); // token để mã hóa dữ liệu
        var productId = $(this).attr('data-productId');
        var size = $(this).attr('data-size');
        var color = $(this).attr('data-color');
     
        $('.act-update').css('display','block') 
    });

  //$('#timepicker, #timepicker1').timepicker();

  function generate(n) {
          var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   

          if ( n > max ) {
                  return generate(max) + generate(n - max);
          }

          max        = Math.pow(10, n+add);
          var min    = max/10; // Math.pow(10, n) basically
          var number = Math.floor( Math.random() * (max - min + 1) ) + min;

          return ("" + number).substring(add); 
  }

  $('.generate_code').click(function(event) {
    /* Act on the event */
    $('.codeVoucher').val('COUPON'+generate(2)+'%');
  });

   var numberVoucher = $('.numberVoucher_block').html();
   var numberUse = $('.numberUse_block').html();
   var voucherCode = $('.voucherCode').html();
   var followVoucherCategory = $('.followVoucherCategory').html();
   var followVoucherProduct = $('.followVoucherProduct').html();
   var type_shipping_0 = $('.type_shipping_content').html();
   var type_shipping_1 = $('.type_shipping_content_privacy').html();

   var val = parseInt($(".formvoucher option:selected").val(),10);
   if(val === 1)
   {
    $('.followVoucherCategory, .followVoucherProduct').prop('hidden', true);
   }
   
  $('.formvoucher').change(function(e) {
    e.preventDefault();
        var val = parseInt($(".formvoucher option:selected").val(),10);
        // alert(val);
        if(val === 2)
        {
          $('.voucherCode, .numberUse_block, .numberVoucher_block').empty();
          $('.generate_code').addClass('ctkm');
          $('.followVoucherPro_block').removeClass('ctkm');
          $('.followVoucherPro').prop('required', true);
          $('.followVoucherCategory').removeAttr('hidden').prop('style', 'display:grid')
          $('.followVoucherCategory_list').prop('required', true);
          $('.followVoucherProduct_list').removeAttr('required');
        }
        else
        {
          $('.voucherCode').append(voucherCode);
          $('.generate_code').removeClass('ctkm');
          $('.followVoucherPro_block').addClass('ctkm');
          $('.followVoucherCategory, .followVoucherProduct').hide();
          $('.followVoucherPro').removeAttr('required');
          $('.numberUse_block').append(numberUse);
          $('.numberVoucher_block').append(numberVoucher);
          $('.followVoucherProduct').prop('hidden', true);
        }
    });

  $('.followVoucherPro').change(function(e) {
            var val_chosen = $(".followVoucherPro option:selected").val();
            if(val_chosen == 'dm')
            {
              $('.followVoucherProduct').prop('hidden', true);
              $('.followVoucherCategory').removeAttr('hidden').prop('style', 'display:grid').prop('required', true);
              $('.followVoucherCategory_list').prop('required', true);
              $('.followVoucherProduct_list').removeAttr('required');
            }
            else if(val_chosen == 'sp')
            {
              $('.followVoucherCategory').prop('hidden', true);
              $('.followVoucherProduct').removeAttr('hidden').prop('style', 'display:grid')
              $('.followVoucherProduct_list').prop('required', true);
              $('.followVoucherCategory_list').removeAttr('required');
            }
          });

  $('.type_shipping').change(function(e) {
    e.preventDefault();
        var val = parseInt($(".type_shipping option:selected").val(),10);
        //alert(val);
        $('.type_shipping_content_privacy').empty();
        $('.type_shipping_content').empty();
        if(val === 0)
        {
          $('.type_shipping_content_privacy').empty();
          $('.type_shipping_content').removeClass('partner-type-show');
          $('.type_shipping_content_privacy').addClass('partner-type-show');
          $('.type_shipping_content').append(type_shipping_0);
          $('#shipper_type_id').val(val);
        }
        else if(val === 1)
        {
          $('.type_shipping_content').empty();
          $('.type_shipping_content_privacy').removeClass('partner-type-show');
          $('.type_shipping_content').addClass('partner-type-show');
          $('.type_shipping_content_privacy').append(type_shipping_1);
          $('#shipper_type_id').val(val);
        }
        else
        {
          $('#shipper_type_id').val(1000);
        }
    });




  $(".panel-heading h4").bind('click',function() { 
      $('.change_color').removeClass('change_color');
      if(!$(this).closest('.panel').find('.panel-collapse').hasClass('show'))
      {
        $(this).parent().addClass('change_color');
      }
      else $(this).parent().removeClass('change_color');
 });

  $('.connection').click(function(e) {
        var shippingId = $(this).data('id');
        // alert(shippingId);
        e.preventDefault();
       var _token = $('input[name="_token"]').val(); // token để mã hóa dữ liệu
        $.ajax({
          url: "getShippingId",
          type: "get", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                shipping_id: shippingId,
                _token:_token
            },
          success:function(data){ //dữ liệu nhận về
              $("#inputPartner .card-body").empty();
              $("#inputPartner .card-body").append($(data).find('#inputPartner .card-body'));
              // console.log($(data).find('#inputPartner .card-body'));
              // alert(data);
              // console.log(data);
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
    });

  $('#customize').click(function(e) {
        var shippingId = $(this).data('id');
        // alert(shippingId);
        e.preventDefault();
       var _token = $('input[name="_token"]').val(); // token để mã hóa dữ liệu
        $.ajax({
          url: "getShippingIdCustomize",
          type: "get", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                shipping_id: shippingId,
                _token:_token
            },
          success:function(data){ //dữ liệu nhận về
              $("#customizePartner .card-body").empty();
              $("#customizePartner .card-body").append($(data).find('#customizePartner .card-body'));
              // console.log($(data).find('#customizePartner .card-body'));
              // alert(data);
              // console.log(data);
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
    });

});

function checkRadio() {
    var checkbox = document.getElementsByName("optradio");
    for (var i = 0; i < checkbox.length; i++){
        if (checkbox[i].checked === true){
            document.getElementById("partner_show_th_id_for_use").value = checkbox[i].parentElement.parentNode.getElementsByClassName("partner_show_th_id")[0].value
        }
    }
}

// $(document).on("click", ".connection", function () {
//      var shippingId = $(this).data('id');
//      $(".modal-body #shippingId").val(shippingId);
// });

