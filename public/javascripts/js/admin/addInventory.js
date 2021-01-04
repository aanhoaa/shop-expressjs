$(document).ready(function () {
    var bind;

    $('#cateChoose').on('change', function() {
        $('#productChoose')
            .find('option.option-child')
            .remove()
            .end();

        $('#sizeChoose')
        .find('option.option-child')
        .remove()
        .end();

        $('#colorChoose')
        .find('option.option-child')
        .remove()
        .end(); 

        var cateId = this.value;
    
        $.ajax({
            url: `${window.location.origin}/admin/inventory/add/binding/${cateId}`,
            method: "GET",
            dataType: "json",
            success: function(data) {
               bind = new Array;
                $.each(data, function (i, item) {
                   
                    bind.push({id: item.id, name: item.name, detail: item.detail});
                    $('#productChoose').append($('<option>', { 
                        value: item.id,
                        text : item.name 
                    }).addClass('option-child')
                    );
                });
            },
            error: function(err) {
                console.log("fail");
            }
        })
    })

    $('#productChoose').on('change', function() {
        $('#sizeChoose')
            .find('option.option-child')
            .remove()
            .end();

        $('#colorChoose')
        .find('option.option-child')
        .remove()
        .end(); 

        var productId = this.value;

        $.each(bind, function (i, item) {
            if (productId == item.id)
            {
                $.each(item.detail, function(j, items) {
                    $('#sizeChoose').append($('<option>', { 
                        value: items.nameSize,
                        text : items.nameSize
                    }).addClass('option-child'))
                })

                $.each(item.detail[0].color, function(k, itemss) {
                    $('#colorChoose').append($('<option>', { 
                         value: itemss,
                         text : itemss
                     }).addClass('option-child'))
                })
            }
        }); 
    })

    $('#search-product').on('click', (function(e){
        if ($('#cateChoose').val() === null || $('#productChoose').val() === null || 
            $('#sizeChoose').val() === 'empty' || $('#colorChoose').val() === 'empty')
        {
            alert('Vui lòng cung cấp đầy đủ thông tin sản phẩm');
            e.preventDefault();
        }
        else{
            $('form.search_product').submit();
        }
    }));

    $('.import-goods').on('click', (function(e){
        $('form.import-product').submit();
    }));
});