function updateProfile() {
  const phone = document.getElementById('phone').value;
  
  if (phone.length < 10) {
    alert('Số điện thoại đủ phải 10 số');
    event.preventDefault();
  }
}


function resetPassword() {
    $.ajax({
        url: `${window.location.origin}/user/account/reset`,
        type: "post",
        dataType: "json",
        data: {},
        success:function(data){ 
             if (data.state == 1) 
              {
                swal({
                    title: "Success!",
                    text: "Đã gửi email mật khẩu mới!",
                    type: "success",
                    button: "Aww yiss!",
                });
              }
              setTimeout(function(){ 
                window.location.href = '/user/account/profile';
              }, 2000);
             
        },
        error: function() {
          alert("Bị lỗi");
        }
     });
}

function getCity(it) {
  $.ajax({
    url: `${window.location.origin}/api/book/city`,
    method: "get",
    dataType: "json",
    success: function(data) {
        $.each(data, function (i, item) {
          $('.city').append($('<option>', { 
            value: item.id,
            text : item.name 
            }).addClass('option-child')
          );
        });
    },
    error: function(err) {
        alert(err);
    }
})
}

function pickCity(it) {
    $('.district')
    .find('option.option-child')
    .remove()
    .end();

    $('.ward')
    .find('option.option-child')
    .remove()
    .end();

    $('.district').attr('disabled', false);
    $('.ward').attr('disabled', true);

    const cityId = it.value;
    $.ajax({
        url: `${window.location.origin}/api/book/district/binding`,
        method: "get",
        dataType: "json",
        data: {
          cityId: cityId
        },
        success: function(data) {
            $.each(data, function (i, item) {
              $('.district').append($('<option>', { 
                  value: item.id,
                  text : item.name 
              }).addClass('option-child')
              );
            });
        },
        error: function(err) {
            alert(err);
        }
    })
}

function pickDistrict(it) {
  $('.ward')
  .find('option.option-child')
  .remove()
  .end();

  $('.ward').attr('disabled', false);
  const districtId = it.value;
  const cityId =  $(it).parent().parent().find('.city').val();

  $.ajax({
      url: `${window.location.origin}/api/book/ward/binding`,
      method: "get",
      dataType: "json",
      data: {
        cityId: cityId,
        districtId: districtId
      },
      success: function(data) {
          $.each(data, function (i, item) {
              
              $('.ward').append($('<option>', { 
                  value: item.id,
                  text : item.name 
              }).addClass('option-child')
              );
          });
      },
      error: function(err) {
          alert(err);
      }
  })
}

function pick(it) {
  $('.namecity').val($(it).parent().parent().find('.city option:selected').text()) ;
  $('.namedistrict').val($(it).parent().parent().find('.district option:selected').text()) ;
  $('.nameward').val($(it).parent().parent().find('.ward option:selected').text()) ;
}

function getAll(it) {
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
  console.log(wardID)
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

function deleteBook(it) {
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
        url: `${window.location.origin}/user/account/address/delete`,
        type: "post",
        dataType: "json",
        data: {
          bookID: bookID,
          },
        success:function(data){ 
            Swal.fire('Đã xóa!', '', 'success');
            setTimeout(function(){ 
              window.location.href = '/user/account/address'; 
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

function setDefault(it) {
  const bookID = $(it).attr('data-book');
  $.ajax({
    url: `${window.location.origin}/user/account/address/default`,
    type: "post",
    dataType: "json",
    data: {
      bookID: bookID,
      },
    success:function(data){ 
      window.location.href = '/user/account/address';   
    },
    error: function() {
      alert("Bị lỗi");
    }
 });
}