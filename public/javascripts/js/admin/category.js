
function addCategory() {
    const level = document.getElementById('getLevel').value;
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    $('#save').show();

    if (level == 1) {
        $('#parent').prop('required', false);
        $('.show-category').show();
        $('.show-cate1').hide();
    }
    else if (level == 2) {
        $('#parent').prop('required', true);
        $('.show-category').show();
        $('.show-cate1').show();
    }
}

function saveDB() {
    //event.preventDefault();
    const level = document.getElementById('getLevel').value; 
    const name = document.getElementById('name').value;
    const id = document.getElementById('parent').value;
    const des = document.getElementById('description').value;

    if (level == 1 && name != '')
        event.preventDefault();
    if (level == 2 && (name != '' || id != ''))
        event.preventDefault();

    $.ajax({
        url: `${window.location.origin}/admin/category/add`,
        type: "post",
        dataType: "json",
        data: {
            level: level,
            name: name,
            id: id,
            des: des,
            },
        success:function(data){ 
            if (data.state == 0) {
                Swal.fire('Tên danh mục đã tồn tài', '', 'info');
                }
    
                if (data.state == 1) {
                Swal.fire('Saved!', '', 'success');
                setTimeout(function(){ 
                    window.location.href = '/admin/category'; 
                }, 1000);
                }
                
        },
        error: function() {
            alert("Bị lỗi");
        }
    });
}
$( document ).ready(function() { 
    $(document).on('click', '.edit-name', function() {
        const cate_name = $(this).data('name');
        const cate_id = $(this).data('id');
        const cate_des = $(this).data('des');
        const cate_type = $(this).data('type');
        $('#cate_name').val(cate_name);
        $('#cate_id').val(cate_id);
        $('#cate_des').val(cate_des);
        $('#cate_type').val(cate_type);
    })
})