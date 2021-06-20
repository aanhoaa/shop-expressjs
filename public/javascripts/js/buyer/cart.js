$(document).ready(function(){

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