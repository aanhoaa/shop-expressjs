
    $(document).ready(function () {
            
        $('.par-cate').on('change', function() {
            $('.child-cate')
            .find('option.option-child')
            .remove()
            .end();

            var parentId = this.value;
            $.ajax({
                url: `${window.location.origin}/admin/product/add/binding/${parentId}`,
                method: "GET",
                dataType: "json",
                success: function(data) {
                    //console.log(data);
                    $.each(data, function (i, item) {
                        
                        $('.child-cate').append($('<option>', { 
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
        });
    });
           