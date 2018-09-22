bd.slide.A10_tube = function() {
	this.init.apply(this, arguments);
};

bd.slide.A10_tube.prototype = {
	isReady: false,
	
	init: function() {
		bd.util.addCss(bindobj.moduleroot + '/slide/_common/skitter/css/skitter.styles.css');
		head.load(bindobj.moduleroot + '/slide/_common/skitter/jquery.skitter.min.js', jQuery.fnbind(this, this.callback));
	},
	
	callback: function() {
		this.isReady = true;
	},
	
	render: function( elem, autost, loop ) {
		var el = jQuery(elem);
		var h  = el.height();
		var w = el.width();
		
		var slide = jQuery('<div class="box_skitter box_skitter_large">').css({
			width: w,
			height: h,
			visibility: 'hidden',
			display: 'inline-block'
		});
		var ul = jQuery('<ul>').appendTo(slide);
		
		var total = 0;
		jQuery('span', el).each(function(i, e) {
			var els = e.childNodes;
			var img = null;
			var anc = null;
			var ttl = '';
			for (var i=0; i < els.length; i++) {
				var e = els[ i ];
				if (e.nodeType == 1) {
					if (e.tagName == 'IMG') {
						img = e;
						total++;
						if (anc != null) anc.append(img);
					} else if (e.tagName == 'A') {
						anc = e;
						total++;
					} else if (e.tagName == 'SPAN') {
						ttl = jQuery(e).text();
					}
				}
			}
			
			var li = jQuery('<li>');
			if (anc != null) {
				li.append(anc);
			} else if (img != null) {
				li.append(img);
			}
			
			if (ttl != '') {
				li.append('<div class="label_text"><p>' + ttl + '</p></div>');
			}
			
			if (li.children().length > 0) ul.append(li);
		});
		
		slide.insertBefore(elem);
		el.remove();
		
		slide.skitter({
			auto_play: autost,
			stop_over: false,
			navigation: true,
			numbers: false,
			hideTools: true,
			with_animations: [ 'tube' ],
			interval: 6500,
			imageSwitched: function( num, self ) {
				if (num == 0) self.settings.is_paused = false;	// restart
				if ( !loop && num + 1 == total) {
					self.settings.is_paused = true;
				}
			}
		});
		
		slide.css({'visibility': 'visible', 'opacity': 0}).animate({ opacity: 1 }, {
			complete:function() {
				bd.util.bdRefresh();
				Bindfooter.set();
			}
		});
	}
};
