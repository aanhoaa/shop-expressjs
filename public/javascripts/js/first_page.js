$(document).ready(function(){

  $( "#slider-range" ).slider({
    range: true,
    min: 100000,
    max: 3000000,
    values: [ 1000000, 2000000 ],
    slide: function( event, ui ) {
      $( "#amount" ).val( ui.values[ 0 ] + " VND" + " - " + ui.values[ 1 ] + " VND" ).change();
    }
  });
  $( "#amount" ).val( $( "#slider-range" ).slider( "values", 0 ) + " VND" +
    " - " + $( "#slider-range" ).slider( "values", 1 ) + " VND" ).change();

  $('#teenager').click(function(event) {
      /* Act on the event */
      $('.menu_teenager').toggleClass('teen_none');
      
    });


    $('#quan_nam').click(function(event) {
      /* Act on the event */
      $('.menu_quan_nam').toggleClass('quan_nam_none');
      
    });

    $('#phu_kien').click(function(event) {
      /* Act on the event */
      $('.menu_phu_kien').toggleClass('phu_kien_none');
      
    });

    $(document).on('click', '.categories_parents', function(e) {
      
      $(this).parent().parent().find('a').removeClass('active2');
      $(this).addClass('active2');
      $('.categories_child').removeClass('active');
      e.preventDefault();
       /* Act on the event */
        
        $.ajax({
          url: `${window.location.origin}/shop/cateFilter`,
          type: "post", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                cate: $(this).attr('cate')
            },
          success:function(data){ //dữ liệu nhận về
              $(".khoi_sp").empty();
              $(".khoi_sp").append($(data).find('.khoi_sp').children());
              $("#category_id").val($(data).find('#category_id').val());
              $("#count_product").text($(data).find('.khoi_sp').children().length);
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
    });

    $(document).on('click', '.categories_child', function(e) {
      $(this).parent().toggleClass('dropdown');
      $(this).parent().parent().parent().find('a').removeClass('active');
      $(this).addClass('active');
      e.preventDefault();
       /* Act on the event */
        
        $.ajax({
          url: `${window.location.origin}/shop/cateFilter`,
          type: "post", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                child: $(this).attr('value'),
                cate: $(this).attr('cate')
            },
          success:function(data){ //dữ liệu nhận về
              $(".khoi_sp").empty();
              $(".khoi_sp").append($(data).find('.khoi_sp').children());
              $("#category_id").val($(data).find('#category_id').val());
              $("#count_product").text($(data).find('.khoi_sp').children().length);
          },
          error: function() {
            alert("Bị lỗi");
          }
       });
    });

    $('#SortBy').change(function(e) {
      var val = $("#SortBy option:selected").val();
      var category_id = $("#category_id").val();
      e.preventDefault();
      $.ajax({
        url: `${window.location.origin}/sortby`,
        type: "post", // phương thức gửi dữ liệu.
        dataType: "html",
        data: {
          optionSelect: val,
          cateOneId: category_id
          },
        success:function(data){ //dữ liệu nhận về
            $(".khoi_sp").empty();
            $(".khoi_sp").append($(data).find('.khoi_sp').children());
            $("#count_product").text($(data).find('.khoi_sp').children().length);
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
            // console.log($(data).find('.khoi_sp'));
            // alert(data);
             //console.log(data);
        },
        error: function(err) {
          console.log(err)
          alert("Bị lỗi");
        }
      });
    });

    $("input[name='group_brand[]'], input[name='group_color[]'], input[name='group_size[]'], input[name='group_rating[]'], input[name='group_price[]']").on('click', function() {
      // in the handler, 'this' refers to the box clicked on
      var $box = $(this);
      if ($box.is(":checked")) {
        // the name of the box is retrieved using the .attr() method
        // as it is assumed and expected to be immutable
        var group = "input:checkbox[name='" + $box.attr("name") + "']";
        // the checked state of the group/box on the other hand will change
        // and the current value is retrieved using .prop() method
        $(group).prop("checked", false);
        $box.prop("checked", true);
      } else {
        $box.prop("checked", false);
      }
  });
   

    $("input[name='group_brand[]'], input[name='group_rating[]'], input[name='group_price[]'], input[name='group_color[]'], input[name='group_size[]']").change(function(e) {
        var group_brand = $("input[name='group_brand[]']:checked").val();
        var group_rating = $("input[name='group_rating[]']:checked").val();
        var group_price = $("input[name='group_price[]']:checked").val();
        var group_color = $("input[name='group_color[]']:checked").val();
        var group_size =  $("input[name='group_size[]']:checked").val();
        var category_id = $("#category_id").val();

        $.ajax({
          url: `${window.location.origin}/filter`,
          type: "POST", // phương thức gửi dữ liệu.
          dataType: "html",
          data: {
                group_brand: group_brand,
                group_rating: group_rating,
                optionSelect: group_price,
                group_color: group_color,
                group_size: group_size,
                cateOneId: category_id,
            },
          success:function(data){ //dữ liệu nhận về
           // console.log(data)
              $(".khoi_sp").empty();
              $(".khoi_sp").append($(data).find('.khoi_sp').children());
              $("#count_product").text($(data).find('.khoi_sp').children().length);
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
          },
          error: function() {
            alert("Bị lỗi here");
          }
       });
    });

    

});;
