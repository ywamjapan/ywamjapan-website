jQuery(document).bind("mobileinit", function(){
	jQuery.mobile.ajaxEnabled = false;
	jQuery.mobile.hashListeningEnabled = false;
	jQuery.mobile.loadingMessageTextVisible = true;
	jQuery.mobile.pushStateEnabled = false;
	jQuery.mobile.defaultPageTransition = 'flip';
	jQuery.mobile.loadingMessageTextVisible = true;
	jQuery.mobile.loadingMessage = 'ロード中';
	jQuery.mobile.pageLoadErrorMessage = 'ページの読み込みに失敗しました';
	jQuery.mobile.page.prototype.options.backBtnText = '戻る';
	jQuery.mobile.dialog.prototype.options.closeBtnText = '閉じる';
	jQuery.mobile.selectmenu.prototype.options.closeText= '閉じる';
});

/**
 jQuery Mobileに読み込まれる前の初期化処理
 **/
jQuery(document).bind("pagebeforecreate", function(){
	// page
	jQuery('#page').attr('data-theme', 'a');
	
	// block
	jQuery('.block').each(function(){
		var blk = jQuery(this);
		
		// LiVE Connect
		var liveframe = blk.find('iframe.live-ifrm');
		if (liveframe.length > 0) {
			liveframe.before('<span class="jqm-nolive">スマートフォン向けテンプレートではLiVE Connectは使用できません。</span>');
			liveframe.remove();
		}
		
		// listview
		jQuery("ul:jqmData(role='listview')").each(function(){
			jQuery(this).attr('data-inset', 'true').attr('data-theme', 'a');
		});
		
		// album
		if (blk.hasClass('album')) {
			jQuery("a:jqmData(role='button')").each(function(){
				this.removeAttribute('data-role');
			});
		}
		
		// tab, accordion
		if (blk.hasClass('tab') || blk.hasClass('accordion')) {
			jQuery('.column', blk).each(function(){
				var root = jQuery(this),
					set = jQuery('<div data-role="collapsible-set">').appendTo(root);
				jQuery('div.h2', this).each(function(){
					var bar = jQuery('<div data-role="collapsible">'),
						h2 = jQuery(this);
					bar.append(h2.next());
					bar.prepend(h2.children());
					set.append(bar);
				});
			});
		}
	});
	
	// side
	jQuery('#area-side-a').remove();
	jQuery('#area-side-b').remove();
	
	// footer
	jQuery('#area-footer').attr('data-role', 'footer');
	jQuery('#blank-footer').remove();
});
