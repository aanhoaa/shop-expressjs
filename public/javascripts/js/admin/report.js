$(document).ready(function(){
    $(document).on('change', '#pick-option-report', function() {
        const option = $(this).val();
        if (option != '') {
            $.ajax({
                url: `${window.location.origin}/seller/api/finance/income`,
                type: "post", // phương thức gửi dữ liệu.
                dataType: "html",
                data: {
                  optionSelect: option,
                  },
                success:function(data){ //dữ liệu nhận về
                    $("#dataTables-example").empty();
                    $("#dataTables-example").append($(data).find('#dataTables-example').children());
                },
                error: function(err) {
                  console.log(err)
                  alert("Bị lỗi");
                }
            });
        }
    })
})