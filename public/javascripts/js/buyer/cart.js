$(document).ready(function(){
    document.getElementById('list-cart').addEventListener("mouseenter", function( event ) {
       $('#show-cart').toggle();
    });
    $('#list-cart').hover(function() {
        $('.test').append('<div class="dropdown-menu" aria-labelledby="dropdownMenuLink" style=" display: block, width: fit-content; left: -256px; top: 10px" id="show-cart"> <a class="dropdown-item" href="/user/account/profile" style="width: fit-content !important"> <div> <img src="https://res.cloudinary.com/do3we3jk1/image/upload/v1621236044/t3jqecgil7ikcv5dtzuz.jpg" alt="" width="35px" height="35px"> <span>test nhẹ cái tên chưa load</span> <span>5000000đ</span> </div> </a> <a class="dropdown-item" href="/user/account/profile" style="width: fit-content !important"> <div> <img src="https://res.cloudinary.com/do3we3jk1/image/upload/v1621236044/t3jqecgil7ikcv5dtzuz.jpg" alt="" width="35px" height="35px"> <span>test nhẹ cái tên chưa load</span> <span>5000000đ</span> </div> </a> <a class="dropdown-item" href="/user/account/profile" style="width: fit-content !important"> <div> <img src="https://res.cloudinary.com/do3we3jk1/image/upload/v1621236044/t3jqecgil7ikcv5dtzuz.jpg" alt="" width="35px" height="35px"> <span>test nhẹ cái tên chưa load</span> <span>5000000đ</span> </div> </a> <a class="dropdown-item" href="/user/account/profile" style="width: fit-content !important"> <div> <img src="https://res.cloudinary.com/do3we3jk1/image/upload/v1621236044/t3jqecgil7ikcv5dtzuz.jpg" alt="" width="35px" height="35px"> <span>test nhẹ cái tên chưa load</span> <span>5000000đ</span> </div> </a> </div>');
    })

    //payemt checkou
    $(document).on('click', '.product-variation', function(e) {
        $('.product-variation').removeClass('payment-selected');
        $(this).addClass('payment-selected');
        $('#pay').attr('disabled', false);
        $('#pay').css({'opacity': 1, 'cursor': 'pointer'});
    })

    $(document).on('click', '.product-variation', function(e) {
        $('#payment-method').val($(this).attr('data-method'));  
    })
})