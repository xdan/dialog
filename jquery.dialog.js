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
			modal: true,
			shown: true,
			removeOnHide: true,
			onBeforeShow: function() {},
			onBeforeHide: function() {},
			onAfterShow: function() {},
			onAfterHide: function() {}
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
							if (callback.call(dialog_box, event, this)!==false) {
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
			dialog = dialog_box.find('.xdsoft_dialog'),
			buttons_box = dialog_box.find('.xdsoft_dialog_buttons'),
			event;

		if (dialog_box.hasClass('xdsoft_dialog_overlay') && dialog_box.data('options')) {

			options = dialog_box.data('options');

			if ($.type(_options) === 'string' && _options.length) {
				_options = _options.toLowerCase();
				_options = _options.charAt(0).toUpperCase() + _options.slice(1);
				event = $.Event('before'+_options+'.xdsoft');
				dialog_box.trigger(event);
				if (options['onBefore'+_options] && $.isFunction(options['onBefore'+_options])) {
					options['onBefore'+_options].call(that, options, _options);
				}
				if (!event.isDefaultPrevented()) {
					switch (_options.toLowerCase()) {
						case 'resize' :
							if (dialog_box.is(':visible')) {
								if (!options.modal) {
									dialog_box.removeClass('xdsoft_modal');
									dialog.css('margin-left', '-'+Math.round(dialog.width()/2)+'px');
								}
							}
						break;
						case 'ok' :
							if (dialog_box.is(':visible')) {
								buttons_box.find('.xdsoft_primary').trigger('click');
							}
						break;
						case 'hide' :
							if (dialog_box.is(':visible')) {
								dialog_box.stop()[options.closeFunction](function(){
									if (options.removeOnHide) {
										dialog_box.remove();
									}
								});
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
					if (options['onAfter'+_options] && $.isFunction(options['onAfter'+_options])) {
						options['onAfter'+_options].call(that, options, _options);
					}
				}
			} else {
				makeTitle(options.title, dialog_box.find('.xdsoft_dialog_popup_title'), dialog_box, options)
				makeButtons(options.buttons, tpl_button, dialog_box.find('.xdsoft_dialog_buttons'), dialog_box);
			}

			return dialog_box;
		}

		if ($.type(_options) === 'string') {
			return this;
		}

		dialog_box = $('<div class="xdsoft_dialog_overlay xdsoft_modal"></div>');

		dialog_box.data('options', options);

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
		if (!options.modal) {
			dialog_box.dialog('resize');
		}

		return dialog_box;
	}
	$(window)
		.on('resize', function (event) {
			$('.xdsoft_dialog_overlay:visible')
				.dialog('resize')
		})
		.on('keydown', function (event) {
			var dialogs;
			switch(event.which) {
				case 27 :
				case 13 :
					dialogs = $('.xdsoft_dialog_overlay:visible');
					if (dialogs.length) {
						event.stopPropagation();
						event.preventDefault();
					}
			}
			switch(event.which) {
				case 27 :
					if (dialogs.length) {
						dialogs.dialog('hide')
						return false;
					}
				case 13 :
					if (dialogs.length) {
						dialogs.dialog('ok')
						return false;
					}
			}
		});
}(jQuery));

function jAlert(msg,callback, title) {
	return jQuery('<div>'+msg+'</div>').dialog({
		title: title,
		buttons: {
			'Ok': true
		}
	});
}

function jConfirm(msg,callback, title) {
	return jQuery('<div>'+msg+'</div>').dialog({
		title: title,
		buttons: {
			'Ok': callback || function () {},
			'Cancel': true,
		}
	});
}

function jPrompt(msg, default_value, callback, title) {
    if (jQuery.isFunction(default_value)) {
		callback = default_value;
		default_value = false;
    }

    var tpl = '<div>'+
		'<div>'+msg+'</div>'+
		'<div>'+
			'<input autofocus class="xdsoft_prompt" type="text" value="'+(default_value ? default_value.replace(/[&<>"']/g, function (match) {return '&#' + match.charCodeAt(0) + ';';}) : '')+'">'+
		'</div>'+
	'</div>';

	return jQuery(tpl).dialog({
		title: title,
		onAfterShow: function() {
			this.find('.xdsoft_prompt').focus();
		},
		buttons: {
			'Ok': function (event) {
				var val = this.find('input.xdsoft_prompt').val();
				(callback || function() {}).call(this, event, val);
			},
			'Cancel': true,
		}
	});
}
function jWait(title, with_close) {
	return jQuery('<div class="xdsoft_waiter"></div>').dialog({
		title: title,
		closeBtn: with_close ? true : false
	});
}