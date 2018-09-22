(function($) {
	var defaults = {
		autoStart: false,
		loop: false
	};
	
	$.fn.bdSlideHorizontal = function(opts) {
		return this.each(function() {
			var element = $(this);
			if (element.data('bdSlideHorizontal')) return element.data('bdSlideHorizontal');
			var slide = new Slide();
			element.data('bdSlideHorizontal', slide);
			return slide.render(this, opts.autostart, opts.loop);
		});
	};
	
	function Slide() {
	}
	
	Slide.prototype = {
		interval: 7000,
		currentIndex: 0,
		currentTargetLeft: 0,
		
		render: function( elem, autost, loop ) {
			var el = jQuery(elem);
			var h = el.height();
			var w = el.width();
			
			this.autoStart = autost;
			this.loop = loop;
			this.loopEnd = false;
			
			this.slide = jQuery('<div class="shift03"></div>').css({
				width: w,
				height: h,
				visibility: 'hidden'
			});
			
			var self = this;
			var totalLeft = 0;
			this.images = [];
			this.boat = jQuery('<div class="boat"></div>');
			jQuery('span', el).each(function(i, e) {
				var els = e.childNodes;
				var img = null, anc = null;
				var imgW = 0, imgH = 0;
				for (var i=0; i < els.length; i++) {
					var e = els[ i ];
					if (e.nodeType == 1) {
						if (e.tagName == 'IMG') {
							img = e;
							if (anc != null) anc.append(img);
						} else if (e.tagName == 'A') {
							anc = e;
							img = jQuery('img', anc)[0];
						} else if (e.tagName == 'SPAN') {
							if (img != null) img.title = jQuery(e).text();
						}
					}
				}
				
				if (img != null) {
					var jqImg = jQuery(img);
					
					var imgW = jqImg.width();
					if (imgW<=0) imgW = jqImg.attr('width');
					var imgH = jqImg.height();
					if (imgH<=0) imgH = jqImg.attr('height');
					
					jqImg.myLeft = totalLeft;
					totalLeft += imgW;
					self.images.push( jqImg );
					
					var wrap = jQuery('<div class="img-wrap"></div>').css({
						width: imgW,
						height: imgH
					});
					if (img.complete == false) {
						wrap.css({
							background: '#ffffff url(' + bindobj.moduleroot + '/theme/default08/blockskin/share/bindboxslim_loading.gif) no-repeat center center'
						});
					}
					if (anc != null) {
						wrap.append(anc);
					} else if (img != null) {
						wrap.append(img);
					}
					self.boat.append(wrap);
				}
				
			});
			
			this.boat.width(totalLeft).height(h);
			this.slide.append(this.boat);
			
			// message board
			this.message = jQuery('<div class="message"></div>').css({
				'display': 'none'
			}).appendTo(this.slide);
			this.messageBk = jQuery('<div class="message-bk"></div>').css({
				'opacity': .7
			}).appendTo(this.message);
			this.messageText = jQuery('<div class="message-text"></div>').appendTo(this.message);
			
			// dot nav
			this.dotsNav = jQuery('<div class="dotsNav"></div>').appendTo(this.slide);
			this.dots = [];
			for (var i=0; i<this.images.length; i++) {
				var a = jQuery('<a href="javascript:;" class="dots"></a>').bind('click', {idx: i}, function(e){
					self.currentIndex = e.data.idx;
					self.gotoImage( self.currentIndex );
					self.restartTimer();
				}).css({
					'border': 'none'
				}).appendTo(this.dotsNav);
				if (!bindobj.ie) a.css('opacity', 0.6);
				this.dots.push( a );
			}
			
			var navWidth = this.images.length * 14;
			jQuery('.dotsNav', this.slide).css('left', ((w - navWidth) / 2) + 'px');
			
			// direction nav
			this.prevNav = jQuery('<a href="javascript:;" class="prevNav navctl"></a>').click(function(e){
				self.prevImage();
				self.restartTimer();
			}).css({
				'border': 'none',
				'background-color': 'transparent'
			}).appendTo(this.slide);
			
			this.nextNav = jQuery('<a href="javascript:;" class="nextNav navctl"></a>').click(function(e){
				self.nextImage();
				self.restartTimer();
			}).css({
				'border': 'none',
				'background-color': 'transparent'
			}).appendTo(this.slide);
			
			this.slide.insertBefore(el);
			el.remove();
			
			if (bindobj.ie) {
				this.dotsNav.hide();
				this.prevNav.hide();
				this.nextNav.hide();
			} else {
				this.dotsNav.fadeOut();
				this.prevNav.fadeOut();
				this.nextNav.fadeOut();
			}
			
			this.slide.mouseover(function(){
				if (bindobj.ie) {
					self.dotsNav.show();
					self.prevNav.show();
					self.nextNav.show();
				} else {
					self.dotsNav.stop().fadeTo('normal', 1);
					self.prevNav.stop().fadeTo('normal', 1);
					self.nextNav.stop().fadeTo('normal', 1);
				}
			}).mouseout(function(){
				if (bindobj.ie) {
					self.dotsNav.hide();
					self.prevNav.hide();
					self.nextNav.hide();
				} else {
					self.dotsNav.stop().fadeOut();
					self.prevNav.stop().fadeOut();
					self.nextNav.stop().fadeOut();
				}
			});
			
			// current pos
			this.feedbackDots( 0 );
			
			// message
			this.dispMessage();
			
			this.slide.css({'visibility': 'visible', 'opacity': 0}).animate({ opacity: 1 }, {
				complete:function() {
					bd.util.bdRefresh();
					Bindfooter.set();
				}
			});
			
			// Timer
			if (bd.util.onEditBlock()==false && this.autoStart) {
				this.tm = setInterval(function(){
					self.nextImage();
				}, this.interval);
			}
		},
		
		prevImage: function() {
			this.currentIndex--;
			if (this.currentIndex < 0) this.currentIndex = this.images.length - 1;
			this.gotoImage(this.currentIndex);
		},
		
		nextImage: function() {
			this.currentIndex++;
			if (this.currentIndex == this.images.length) {
				if (this.autoStart && this.loop==false) {
					clearInterval(this.tm);
					this.loopEnd = true;
				}
				this.currentIndex = 0;
			}
			this.gotoImage(this.currentIndex);
		},
		
		gotoImage: function(idx){
			var self = this;
			var img = this.images[ idx ];
			this.boat.stop().animate({
				left: (img.myLeft * -1) + 'px'
			}, 1200, 'easeOutExpo');
			
			this.dispMessage();
			
			this.feedbackDots(idx);
		},
		
		dispMessage: function(){
			this.message.slideUp(200);
			
			var img = this.images[ this.currentIndex ];
			var ttl = img.attr('title');
			if (ttl != undefined && ttl != '') {
				this.messageText.text(ttl);
				this.messageBk.text(ttl);
				var th = this.messageText.attr('scrollHeight');
				this.message.slideDown(200);
			}
		},
		
		feedbackDots: function(idx){
			for (var i=0; i<this.dots.length; i++) {
				var dot = this.dots[ i ];
				if (i==idx) {
					dot.addClass('on');
					if (!bindobj.ie) dot.css('opacity', 1);
				} else {
					dot.removeClass('on');
					if (!bindobj.ie) dot.css('opacity', 0.6);
				}
			}
		},
		
		restartTimer: function() {
			if (this.autoStart && this.loopEnd==false) {
				clearInterval(this.tm);
				var self = this;
				this.tm = setInterval(function(){
					self.nextImage();
				}, this.interval);
			}
		},
		
		getLeft: function() {
			return new Number(omitPx(this.boat.css('left')));
		}
	
		
	};
	
	function omitPx(src) {
		return src.replace('px', '');
	}
	
})(jQuery);
