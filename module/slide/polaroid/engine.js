bd.slide.Polaroid = function() {
	this.init.apply(this, arguments);
};

bd.slide.Polaroid.prototype = {
	isReady: false,
	interval: 7000,
	currentIndex: 0,
	currentTargetLeft: 0,
	
	init: function() {
		bd.util.addCss(bindobj.moduleroot + '/slide/polaroid/slide05.css');
		head.load(bindobj.moduleroot + '/slide/_common/jquery-ui-1.10.0.custom.min.js', jQuery.fnbind(this, this.callback));
	},
	
	render: function( elem, autost, loop ) {
		var el = jQuery(elem);
		var w = el.width();
		var h = el.height();
		
		this.autoStart = autost;
		this.loop = loop;
		
		var slide = jQuery('<div class="shift05"></div>').css({
			width: w,
			height: h,
			visibility: 'hidden'
		});
		
		this.zIndex = 1;
		this.dragging = false;
		var self = this;
		
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
						if (anc != null) anc.append(img);
					} else if (e.tagName == 'A') {
						anc = e;
						if (img != null) anc.append(img);
					} else if (e.tagName == 'SPAN') {
						ttl = jQuery(e).text();
					}
				}
			}
			
			if (anc != null || img != null) {
				total++;
				
				var tempVal = Math.round(Math.random());
				if(tempVal == 1) {
					var deg = randomXToY(w, h);
				} else {
					var deg = randomXToY(0, 30);
				}
				var rotateStr = 'rotate('+ deg +'deg)';
				
				var l = parseInt(Math.random() * (w-400));
				var t = parseInt(Math.random() * (h-400));
				var pora = jQuery('<div class="polaroid"></div>').css({
					'position' : 'absolute',
					'left' : l,
					'top' : t,
					'-webkit-transform' : rotateStr,
					'-moz-transform' : rotateStr,
					'-ms-transform' : rotateStr,
					'tranform' : rotateStr
				});
				if (bindobj.ie90) pora[0].style['-ms-transform'] = rotateStr;
				
				var imgArea = jQuery('<div class="img-area"></div>').appendTo(pora);
				if (anc != null) {
					jQuery(anc).css('-webkit-user-drag', 'none');
					jQuery('img', anc).css('-webkit-user-drag', 'none');
					imgArea.append(anc);
				} else if (img != null) {
					jQuery(img).css('-webkit-user-drag', 'none');
					imgArea.append(img);
				}
				if (ttl == '') ttl = 'Image' + total;
				jQuery('<p></p>').append(ttl).appendTo(pora);
				pora.appendTo(slide);
				
				// action
				pora.mousedown(function(event){
					self.zIndex++;
					jQuery(this).css({
						zIndex: self.zIndex
					});
				}).dblclick(function(event){
					var rotateStr = 'rotate(0deg)';
					jQuery(this).css({
						'-webkit-transform' : rotateStr,
						'-moz-transform' : rotateStr,
						'-ms-transform' : rotateStr,
						'tranform' : rotateStr
					});
					if (bindobj.ie90) pora[0].style['-ms-transform'] = rotateStr;
				});
				
				pora.draggable();
			}
		});
		
		// show
		slide.insertBefore(el);
		el.remove();
		
		slide.css({'visibility': 'visible', 'opacity': 0}).animate({ opacity: 1 }, {
			complete:function() {
				bd.util.bdRefresh();
				Bindfooter.set();
			}
		});
	},
	
	callback: function() {
		this.isReady = true;
	}
};

function randomXToY(minVal,maxVal,floatVal) {
	var randVal = minVal+(Math.random()*(maxVal-minVal));
	return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}
