$(document).ready(function(){
    var $star_rating = $('.star-rating .fa');

    var SetRatingStar = function(event) {
    return $star_rating.each(function(event) {
        if (parseInt($(this).siblings('input.rating-value').val()) >= parseInt($(this).data('rating'))) {
            return $(this).removeClass('fa-star-o').addClass('fa-star');
        } else {
            return $(this).removeClass('fa-star').addClass('fa-star-o');
        }
    });
    };

    SetRatingStar();
})