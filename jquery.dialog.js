(function ($){
    'use strict';
	var tpl_button = '<button class="xdsoft_btn" type="button"></button>',
		tpl_dialog = '<div class="xdsoft_dialog xdsoft_dialog_shadow_effect">'+
				'<div class="xdsoft_dialog_popup_title">'+
					'<span></span>'+
					'<a class="xdsoft_close">&times;</a>'+
				'</div>'+
				'<a class="xdsoft_close">&times;</a>'+
				'<div class="xdsoft_dialog_content">'+'</div>'+
				'<div class="xdsoft_dialog_buttons">'+'</div>'+
			'</div>',

		default_options = {
			title: false,
			buttons: {},
			closeFunction: 'fadeOut',
			showFunction: 'fadeIn',
			closeBtn: true,
			shown: true
		};

	function makeButtons(buttons, tpl_button, buttons_box, dialog_box) {
		var title, btn, k = 0;

		if (buttons !==undefined) {
			buttons_box
				.empty();
		}
		if (buttons && $.isPlainObject(buttons)) {
			for (title in buttons) {
				if (!buttons.hasOwnProperty(title)) {
					continue;
				}

				if (buttons[title] instanceof jQuery) {
					btn = buttons[title];
				} else {
					btn = $(tpl_button).html(title);

					if (!k) {
						btn.addClass('xdsoft_primary');
					}

					(function(callback){
						btn.click(function (event) {
							if (callback.call(this, event)!==false) {
								dialog_box
									.dialog('hide')
							}
						});
					}(
					 $.isFunction(buttons[title]) ? buttons[title] : ((buttons[title].click && $.isFunction(buttons[title].click)) ? buttons[title].click : function () {})
					))

					if ($.isPlainObject(buttons[title])) {
						if (buttons[title].className) {
							btn.addClass(buttons[title].className);
						}

						if (buttons[title].primary) {
							buttons_box.find('button')
								.removeClass('xdsoft_primary')
							btn
								.addClass('xdsoft_primary');
						}

						if (buttons[title].title) {
							btn = btn.html(title);
						}
					}
				}

				buttons_box.append(btn);
				k++;
			}
		}
	}

	function makeTitle (text, title, dialog_box, options) {
		if (!text && text!=='') {
			title.hide();
			dialog_box.find('div.xdsoft_dialog>.xdsoft_close').show();
		} else {
			dialog_box.find('div.xdsoft_dialog>.xdsoft_close').hide();
			title
				.show()
				.find('span')
					.html(text);
		}
		if (!options.closeBtn) {
			dialog_box.find('.xdsoft_close').hide();
		}
	}

	$.fn.dialog = function (_options, second) {
		var	that = this,
			dialog_box = that,
			options = $.extend(true, {},default_options, $.isPlainObject(_options) ? _options : {}),
			dialog,
			buttons_box,
			event;

		if (dialog_box.hasClass('xdsoft_dialog_overlay')) {
			if ($.type(_options) === 'string') {
				event = $.Event('before'+_options+'.xdsoft');
				dialog_box.trigger( event );
				if (!event.isDefaultPrevented()) {
					switch (_options) {
						case 'hide' :
							if (dialog_box.is(':visible')) {
								dialog_box.stop()[options.closeFunction]();
							}
						break;
						case 'show' :
							if (!dialog_box.is(':visible')) {
								dialog_box.stop()[options.showFunction]();
							}
						break;
						case 'title' :
							makeTitle(second, dialog_box.find('.xdsoft_dialog_popup_title'), dialog_box, options);
						break;
						case 'content' :
							dialog_box
								.find('.xdsoft_dialog_content')
								.html(second);
						break;
					}
					dialog_box.trigger('after'+_options+'.xdsoft');
				}
			} else {
				makeTitle(options.title, dialog_box.find('.xdsoft_dialog_popup_title'), dialog_box, options)
				makeButtons(options.buttons, tpl_button, dialog_box.find('.xdsoft_dialog_buttons'), dialog_box);
			}

			return dialog_box;
		}

		dialog_box = $('<div class="xdsoft_dialog_overlay"></div>');
		dialog = $(tpl_dialog);

		dialog_box.on('mousedown.xdsoft', function (event) {
			dialog_box.dialog('hide')
		});

		dialog.on('mousedown.xdsoft', function (event) {
			event.stopPropagation();
		});

		buttons_box = dialog.find('.xdsoft_dialog_buttons');

		dialog_box.append(dialog);

		dialog_box.dialog('content', that.length ? that[0] : '<div>'+that.selector+'</div>');

		dialog
			.find('.xdsoft_close')
			.click(function () {
				dialog_box.dialog('hide')
			});

		makeTitle(options.title, dialog.find('.xdsoft_dialog_popup_title'), dialog_box, options);
		makeButtons(options.buttons, tpl_button, buttons_box, dialog_box);

		$('body').append(dialog_box);
		if (options.shown) {
			dialog_box.dialog('show');
		}
		return dialog_box;
	}
	$(window)
		.on('keydown', function (event) {
			switch(event.which) {
				case 27 :
					$('.xdsoft_dialog_overlay')
						.dialog('hide')
				break;
			}
		});
}(jQuery));

function jAlert(msg,callback, title) {
	jQuery(msg).dialog({
		title: title,
		buttons: {
			'Ok': true
		}
	});
}

function jConfirm(msg,callback, title) {
	jQuery(msg).dialog({
		title: title,
		buttons: {
			'Ok': callback || function () {},
			'Cancel': true,
		}
	});
}

function jPrompt(msg, default_value, callback, title) {
    if ($.isFunction(default_value)) {
		callback = default_value;
		default_value = false;
    }

    var tpl = '<div>'+
		'<div>'+msg+'</div>'+
		'<div>'+
			'<input autofocus class="xdsoft_prompt" type="text" value="'+(default_value ? default_value.replace(/[&<>"']/g, function (match) {return '&#' + match.charCodeAt(0) + ';';}) : '')+'">'+
		'</div>'+
	'</div>';

	jQuery(tpl).dialog({
		title: title,
		buttons: {
			'Ok': function (event) {
				var val = jQuery(this).closest('.xdsoft_dialog').find('input.xdsoft_prompt').val();
				(callback || function() {}).call(this, event, val);
			},
			'Cancel': true,
		}
	});
}
function jWait(title, with_close) {
	jQuery('<div class="xdsoft_waiter"></div>').dialog({
		title: title,
		closeBtn: with_close ? true : false
	});
}