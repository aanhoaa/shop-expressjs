
function changeVariant() {

    $('.act-update').show();
}

function updateVariant() {
    event.preventDefault();
    var productId = document.getElementById('id').value;
    var sku = document.getElementById('sku').value;
    var price = document.getElementById('price').value;
    var stock = document.getElementById('stock').value;

    if (sku == '--') sku = '';

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
            url: `${window.location.origin}/admin/product/edit/variant/${productId}`,
            type: "post", // phương thức gửi dữ liệu.
            dataType: "json",
            data: {
                  sku: sku,
                  price: price,
                  stock: stock,
              },
            success:function(data){ //dữ liệu nhận về
                 console.log(data);
                 Swal.fire('Saved!', '', 'success');
                 window.location.href = '/admin';
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