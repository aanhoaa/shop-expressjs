(function($) {
	$( document ).ready(function() {   
    	$('ul.user-option').each(function () {
        // For each set of tabs, we want to keep track of
        // which tab is active and it's associated content
        var $active, $content, $links = $(this).find('a');
       
       
        // If the location.hash matches one of the links, use that as the active tab.
        // If no match is found, use the first link as the initial active tab.
        $active = $($links.filter('[href="' + location.hash + '"]')[0] || $links[0]);
        $active.addClass('option-active');
        $active.closest('.option').addClass('option-active');
        $content = $($active.attr('href'));

        // Hide the remaining content
        $links.not($active).each(function () {
            $($(this).attr('href')).hide();
        });

        // Bind the click event handler
        $(this).on('focus', 'a', function (e) {
            
            // Make the old tab inactive.
            $active.removeClass('option-active');
            $active.closest('.option').removeClass('option-active');
         
            $content.hide();
            //$('#tab4').hide();

            // Update the variables with the new link and content
            $active = $(this);
            $content = $($(this).attr('href'));

            // Make the tab active.
            $active.addClass('option-active');
            $active.closest('.option').addClass('option-active');
            
            $content.show();

            $('input:checkbox').prop('checked', false);
            $('.show-opt').remove();
           
            // Prevent the anchor's default click action
            e.preventDefault();
        });
    });
    // $(document).on('focus', ".datepicker-me-class", function() {
    //   $(this).datepicker({
    //     weekStart: 1,
    //     autoclose: 1,
    //     daysOfWeekHighlighted: "6,0",
    //     todayHighlight: true,
    //   });
    // });
	});
})(jQuery);