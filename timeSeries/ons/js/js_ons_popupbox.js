
			/***************************/

//@Author: Adrian "yEnS" Mato Gondelle

//@website: www.yensdesign.com

//@email: yensamg@gmail.com

//@license: Feel free to use it, but keep this credits please!					

/***************************/


//SETTING UP OUR POPUP

//0 means disabled; 1 means enabled;

var popupStatus = 0;


//loading popup with jQuery magic!

function loadPopup(){

	//loads popup only if it is disabled

	if(popupStatus==0){

		$(".popup-box-background").css({

			"opacity": "0.2"

		});

		$(".popup-box-background").fadeIn("slow");

		$(".popup-box").fadeIn("slow");

		popupStatus = 1;

	}

}


//disabling popup with jQuery magic!

function disablePopup(){

	//disables popup only if it is enabled

	if(popupStatus==1){

		$(".popup-box-background").fadeOut("slow");

		$(".popup-box").fadeOut("slow");

		popupStatus = 0;

	}

}


//centering popup

function centerPopup(){

	//request data for centering

	var windowWidth = document.documentElement.clientWidth;

	var windowHeight = document.documentElement.clientHeight;

	var popupHeight = $(".popup-box").height();

	var popupWidth = $(".popup-box").width();

	//centering

	$(".popup-box").css({

		"position": "absolute",

		"top": windowHeight/2-popupHeight/2,

		"left": windowWidth/2-popupWidth/2


	});

	//only need force for IE6


	$(".popup-box-background").css({

		"height": windowHeight

	});


}



//CONTROLLING EVENTS IN jQuery

$(document).ready(function(){


	//LOADING POPUP

	//Click the button event!

	$(".popup-box-link").click(function(){

		//centering with css

		centerPopup();

		//load popup

		loadPopup();

	});


	//CLOSING POPUP

	//Click the close event!

	$(".popup-box-close").click(function(){

		disablePopup();

	});

	//Click out event!

	$(".popup-box-background").click(function(){

		disablePopup();

	});

	//Press Escape event!

	$(document).keypress(function(e){

		if(e.keyCode==27 && popupStatus==1){

			disablePopup();

		}

	});


});


		