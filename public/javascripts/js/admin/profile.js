$(document).ready(function(){
    $(document).on('click', '.delete-user', function(e) {
        const userId = $(this).data('id');
        console.log(userId)
        if (userId != '') {
            swal({
                title: "Xác nhận",
                text: "Bạn xác nhận Xóa người dùng này?",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
            },
            function(inputValue){
                if (inputValue === null) return false;
                if (!inputValue) return false;
                
                $.ajax({
                    url: `${window.location.origin}/admin/user/delete`,
                    type: "delete", 
                    dataType: "json",
                    data: {
                        userId: userId
                    },
                    success:function(data){ 
                        if (data.state == 1) {
                            swal("Thành công!", "Đã xóa người dùng khỏi hệ thống", "success");
                            setTimeout(function(){ 
                                window.location.href = "/admin/profile/user";
                            }, 900);
                        }
                        if (data.state == 0) alert('Lỗi hệ thống');
                        if (data.state == -1) alert('Dữ liệu trống');
                    },
                    error: function(err) {
                        alert('fail');
                    }
                })
            });
        }
    })
})
//shop
function getShopAll(it) {
    //load city
    const cityID = $(it).parent().parent().find('.codecity').val();
    $.ajax({
      url: `${window.location.origin}/api/book/city`,
      method: "get",
      dataType: "json",
      success: function(data) {
          $.each(data, function (i, item) {
            if (item.id == cityID) {
              $('.city').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child').attr('selected', true)
              );
            }
            else {
              $('.city').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child')
              );
            }
          });
      },
      error: function(err) {
          alert(err);
    }
    });
  
    //load district
    const districtID = $(it).parent().parent().find('.codedistrict').val();
    $.ajax({
      url: `${window.location.origin}/api/book/district/binding`,
      method: "get",
      dataType: "json",
      data: {
        cityId: cityID
      },
      success: function(data) {
          $.each(data, function (i, item) {
            if (item.id == districtID) {
              $('.district').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child').attr('selected', true)
              );
            }
            else {
              $('.district').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child')
              );
            }
          });
      },
      error: function(err) {
          alert(err);
      }
    })
  
    //load ward
    const wardID = $(it).parent().parent().find('.codeward').val();
    $.ajax({
      url: `${window.location.origin}/api/book/ward/binding`,
      method: "get",
      dataType: "json",
      data: {
        cityId: cityID,
        districtId: districtID
      },
      success: function(data) {
          $.each(data, function (i, item) {
            if (item.id == wardID) {
              $('.ward').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child').attr('selected', true)
              );
            }
            else {
              $('.ward').append($('<option>', { 
                value: item.id,
                text : item.name 
                }).addClass('option-child')
              );
            }
          });
      },
      error: function(err) {
          alert(err);
      }
    })
  
    //load name
    $('.fullname').val($(it).parent().parent().find('.fullname').val());
    $('.phone').val($(it).parent().parent().find('.phone').val());
    $('.name-identity').val($(it).parent().parent().find('.codename').val());
}

function deleteShopBook(it) {
    const bookID = $(it).attr('data-book');
    Swal.fire({
      title: 'Bạn chắc chắn muốn xóa địa chỉ này?',
      showCancelButton: true,
      confirmButtonText: `Xóa`,
      cancelButtonText: `Trở lại`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
          $.ajax({
          url: `${window.location.origin}/seller/profile/address/delete`,
          type: "post",
          dataType: "json",
          data: {
            bookID: bookID,
            },
          success:function(data){ 
              Swal.fire('Đã xóa!', '', 'success');
              setTimeout(function(){ 
                window.location.href = '/seller/profile/address-book'; 
              }, 1000);
               
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
  
function setShopDefault(it) {
const bookID = $(it).attr('data-book');
$.ajax({
    url: `${window.location.origin}/seller/profile/address/default`,
    type: "post",
    dataType: "json",
    data: {
    bookID: bookID,
    },
    success:function(data){ 
    window.location.href = '/seller/profile/address-book';   
    },
    error: function() {
    alert("Bị lỗi");
    }
});
}