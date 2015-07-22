(function(window){
	'use strict';
	var id = null;
	var email = JSON.parse(localStorage.getItem("email")) || "";
	$(document).ready(function(){
		$("#email").val(email);
		$("#save").prop("disabled", true);

		$("#save").click(function(event) {
			event.preventDefault();

			console.log("Saving email address");
			localStorage.setItem("email", JSON.stringify($("#email").val().trim()));

			if (JSON.parse(localStorage.getItem("started"))) {
				$("div.notify.hide").removeClass("hide");
				id = setTimeout(function() {
						$("div.notify").addClass("hide");
						clearTimeout(id);
					}, 2000);
			} else {
				$("div.thankyou.hide").removeClass("hide");
				id = setTimeout(function() {
						$("div.thankyou").addClass("hide");
						localStorage.setItem("started", JSON.stringify(true));
						clearTimeout(id);
					}, 3000);
			}
		});

		$("#email").keyup(function(params) {
			email = JSON.parse(localStorage.getItem("email")) || "";

			if (email == $("#email").val().trim())
				$("#save").prop("disabled", true);
			else {
				$("#save").prop("disabled", false);

				if (params.keyCode == 13)
					$("#save").click();
			}
		});
	});
})(window);