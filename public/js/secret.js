// header
$(".nav-link").on({
    mouseenter: function () {
        if (!$(this).hasClass("active")) $(this).addClass("text-white");
    },
    mouseleave: function () {
        if (!$(this).hasClass("active")) $(this).removeClass("text-white");
    }
});



// my schedule page
// make sure at least 1 checkbox is checked for days of the week
$(function(){
    var requiredCheckboxes = $('.form-schedule :checkbox[required]');
    requiredCheckboxes.change(function(){
        if(requiredCheckboxes.is(':checked')) {
            requiredCheckboxes.removeAttr('required');
        } else {
            requiredCheckboxes.attr('required', 'required');
        }
    });
});



// friends page
function openForm(email, nickname, group, profile) {
  document.getElementById("myForm").style.display = "block";
  document.getElementById("friends-form-bg").style.display = "block";
  document.getElementById("friends-form-email").innerHTML = email;
  document.getElementById("friends-form-email-hidden").value = email;
  document.getElementById("friends-form-nickname").value = nickname;
  document.getElementById("friends-form-group").value = group;
  document.getElementById("friends-form-profile").value = profile;

}

function closeForm(email) {
  document.getElementById("myForm").style.display = "none";
  document.getElementById("friends-form-bg").style.display = "none";
}
