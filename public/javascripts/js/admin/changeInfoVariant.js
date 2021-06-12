function updateVariant() {
  event.preventDefault();

  var productId = document.getElementsByName('id');
  var sku = document.getElementsByName('sku');
  var price = document.getElementsByName('price');
  var stock = document.getElementsByName('stock');
  var width = document.getElementsByName('width');
  var length = document.getElementsByName('length');
  var height = document.getElementsByName('height');
  var weight = document.getElementsByName('weight');
  var arrId = [];
  var arrSku = [];
  var arrPrice = [];
  var arrStock = [];
  var arrWidth = [];
  var arrLength = [];
  var arrHeight = [];
  var arrWeight = [];

  for(let i = 0; i < productId.length; i++) {
    if (price[i].value == '' || stock[i].value == '' || width[i].value == '' || length[i].value == '' || height[i].value == '' || weight[i].value == '')
    {
      Swal.fire('Các trường không được bỏ trống', '', 'info');
      return;
    }

    if (price[i].value < 1000)
    {
      Swal.fire('Giá sản phẩm phải lớn hơn 1000đ', '', 'info');
      return;
    }

    arrId.push(productId[i].value);
    arrSku.push(sku[i].value);
    arrPrice.push(price[i].value);
    arrStock.push(stock[i].value)
    arrWidth.push(width[i].value)
    arrLength.push(length[i].value)
    arrHeight.push(height[i].value)
    arrWeight.push(weight[i].value)
  }

  Swal.fire({
    title: 'Do you want to save the changes?',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Save`,
    denyButtonText: `Don't save`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
        $.ajax({
        url: `${window.location.origin}/seller/product/edit/variant/${productId}`,
        type: "post",
        dataType: "json",
        data: {
          productId: arrId,
          sku: arrSku,
          price: arrPrice,
          stock: arrStock,
          width: arrWidth,
          length: arrLength,
          height: arrHeight,
          weight: arrWeight
          },
        success:function(data){ 
            if (data.state == 1) {
              Swal.fire('Saved!', '', 'success');
            setTimeout(function(){ 
              window.location.href = '/seller'; 
            }, 1000);
            }
            else alert('Lỗi')
             
        },
        error: function() {
          alert("Bị lỗi");
        }
     });
    } else if (result.isDenied) {
      Swal.fire('Changes are not saved', '', 'info')
    }
  })
}


function changeVariant() {

    $('.btn-update').show();
}

function btnCancel() {
  event.preventDefault();

  Swal.fire({
    title: 'Hủy thay đổi?',
    icon: 'question',
    iconHtml: '?',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy',
    showCancelButton: true,
    showCloseButton: true
  }) 
  .then((result) => {
    if (result.isConfirmed) {
     window.location.href = "/seller"
    }
  })
}

//show product
function btnShow(e) {
  event.preventDefault();

 const productId = $(e).attr('data-id');
 const status = $(e).attr('data-status')

 if (status == 1)
  {
    Swal.fire({
      title: `Bạn muốn ẩn sản phẩm này. <p>Người mua sẽ không thể xem hoặc mua sản phẩm đã ẩn</p>`,
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: `Xác nhận`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
          $.ajax({
          url: `${window.location.origin}/seller/product/show/${productId}`,
          type: "post",
          dataType: "json",
          data: {},
          success:function(data){ 
               //console.log(data);
               if (data.state == 0) 
               // Swal.fire('Tất cả biến thể phải có giá lớn hơn 1000đ', '', 'info')
                {
                  Swal.fire({
                    title: `Tất cả biến thể phải có giá lớn hơn 1000đ`,
                    showDenyButton: false,
                    showCancelButton: true,
                    confirmButtonText: `Xác nhận`,
                  })
                }
               else
                window.location.href = '/seller';
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
      }
    })
  }
  else {
    $.ajax({
      url: `${window.location.origin}/seller/product/show/${productId}`,
      type: "post",
      dataType: "json",
      data: {},
      success:function(data){ 
           //console.log(data);
           if (data.state == 0) 
           {
            Swal.fire({
              title: `Tất cả biến thể phải có giá lớn hơn 1000đ. <p>Cập nhật biến thể sản phẩm:</p>`,
              showDenyButton: false,
              showCancelButton: true,
              confirmButtonText: `Xác nhận`,
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href = `/seller/product/edit/variant/${productId}`;
              }
            })
          }
           
          if (data.state == 1) window.location.href = '/seller';
          if (data.state == 2) {
            Swal.fire({
              title: `Bạn chưa có địa chỉ kho hàng. <p>Thêm địa chỉ kho hàng</p>`,
              showDenyButton: false,
              showCancelButton: true,
              confirmButtonText: `Xác nhận`,
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href = `/seller/profile/address-book`;
              }
            })
          }
      },
      error: function() {
        alert("Bị lỗi");
      }
   });
  }
}

function checkAlls() {
  const checkAll = document.getElementById('ckbAllS').checked;

  if (checkAll) {
    var checkboxes = document.getElementsByName('ckbProduct');
 
   for (var i = 0; i < checkboxes.length; i++){
      checkboxes[i].checked = true;
   }

   countChecked();
   //append
   //$('.opt-all').append('')
  }
  else {
    var checkboxes = document.getElementsByName('ckbProduct');
 
   for (var i = 0; i < checkboxes.length; i++){
      checkboxes[i].checked = false;
   }

   $('.show-opt').remove();
   document.getElementById('ckbAll').checked = false;
  }
}

function checkAll() {
  let visibleStep = $(".tab-option:visible");
  
  //var a = visibleStep.find('#ckbAll');
  //console.log(a.prop('checked'))
  
  //const checkAll = document.getElementById('ckbAll').checked;
  const checkAll = visibleStep.find('#ckbAll').prop('checked');

  if (checkAll) {
    //visibleStep.find('#ckbAll').prop('checked', true);
    var checkboxes = visibleStep.find('.checkOne');
 
   for (var i = 0; i < checkboxes.length; i++){
      checkboxes[i].checked = true;
   }

   if ($('.act-ckb').length < 1) {
    $('.opt-all').append('<div class="show-opt is-flex"> <div class="act-ckb col-sm-6"> <label for="">Chọn tất cả</label> <input type="checkbox" id="ckbAllS" onclick="checkAlls()"> </div> <div class="act-choose col-sm-6 is-flex" > <div style="margin: auto 0;"><p id="count-product-checked"></p></div> <div class="delete-product"> <button class="btn-group" id="delete-product" onclick="deleteProduct()">Xóa</button> </div> </div> </div>');
  }

 document.getElementById('ckbAllS').checked = true; 

   countChecked();
   //append
   //$('.opt-all').append('')
  }
  else {
    var checkboxes = visibleStep.find('.checkOne');
 
   for (var i = 0; i < checkboxes.length; i++){
      checkboxes[i].checked = false;
   }

   $('.show-opt').remove();
  }
}

function countChecked() {
  let visibleStep = $(".tab-option:visible");
  var checkboxes = visibleStep.find('.checkOne');
  var count = 0;

  for (var i = 0; i < checkboxes.length; i++){
    if (checkboxes[i].checked)
      count++;
  }
  
  if (count != checkboxes.length) {
    document.getElementById('ckbAll').checked = false;
    document.getElementById('ckbAllS').checked = false;
  }
  else {
    document.getElementById('ckbAll').checked = true;
    document.getElementById('ckbAllS').checked = true;
  }
  if (count > 0) {
    $('#count-product-checked').html(`${count} sản phẩm đã được chọn`);
  }
  else {
    $('.show-opt').remove();
  }
}

function checkOne() {
  if ($('.act-ckb').length < 1) {
    $('.opt-all').append('<div class="show-opt is-flex"> <div class="act-ckb col-sm-6"> <label for="">Chọn tất cả</label> <input type="checkbox" id="ckbAllS" onclick="checkAlls()"> </div> <div class="act-choose col-sm-6 is-flex" > <div style="margin: auto 0;"><p id="count-product-checked"></p></div> <div class="delete-product"> <button class="btn-group" id="delete-product" onclick="deleteProduct()">Xóa</button> </div> </div> </div>');
  }
  countChecked();
}

function deleteProduct() {
  let visibleStep = $(".tab-option:visible");
  var checkboxes = visibleStep.find('.checkOne');
  var arrProduct = [];

  for (var i = 0; i < checkboxes.length; i++){
    if (checkboxes[i].checked)
      arrProduct.push(checkboxes[i].value);
  }

  Swal.fire({
    title: `Bạn muốn xóa sản phẩm này`,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: `Xác nhận`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
        $.ajax({
        url: `${window.location.origin}/seller/product/delete`,
        type: "post",
        dataType: "json",
        data: {
          arrProduct: arrProduct
        },
        success:function(data){ 
             if (data.state == 0) 
              Swal.fire('Tất cả biến thể phải có giá lớn hơn 1000đ', '', 'info')
             else
              window.location.href = '/seller';
        },
        error: function() {
          alert("Bị lỗi");
        }
     });
    }
  })
}

//adminSys viewProduct
function approve(it) {
  const productId = $(it).attr('data-id');
  
  $.ajax({
    url: `${window.location.origin}/admin/product/edit/status`,
    type: "post",
    dataType: "json",
    data: {
      productId: productId
    },
    success:function(data){ 
         if (data.state == 0) 
          Swal.fire('Lỗi', '', 'info')
         else
          {
            Swal.fire('Đã phê duyệt', '', 'success');
            setTimeout(function(){ 
              window.location.href = '/admin'; 
            }, 900);
          }
    },
    error: function() {
      alert("Bị lỗi");
    }
 });
}