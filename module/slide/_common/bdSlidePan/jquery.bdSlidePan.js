(function($) {
	var defaults = {
		autoStart: false,
		loop: false
	};
	
	$.fn.bdSlidePan = function(opts) {
		return this.each(function() {
			var element = $(this);
			if (element.data('bdSlidePan')) return element.data('bdSlidePan');
			var slide = new Slide();
			element.data('bdSlidePan', slide);
			return slide.render(this, opts.autostart, opts.loop);
		});
	};
	
	function Slide() {
	}
	
	Slide.prototype = {
		interval: 6000,
		currentIndex: 0,
		currentTargetLeft: 0,
		
		render: function( elem, autost, loop ) {
			var el = jQuery(elem);
			this.slideW = el.width();
			this.slideH = el.height();
			
			this.autoStart = autost;
			this.loop = loop;
			this.loopEnd = false;
			
			this.slide = jQuery('<div class="pan-window"></div>').css({
				width: this.slideW,
				height: this.slideH,
				visibility: 'hidden',
				overflow: 'hidden'
			});
			
			var self = this;
			self.images = [];
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
			
			this.boat.width(this.slideW * 2).height(this.slideH * Math.round(self.images.length / 2));
			this.slide.append(this.boat);
			
			this.slide.css('visibility', 'visible').show();
			
			// message board
			this.message = jQuery('<div class="message"></div>').css({
				'display': 'none'
			}).appendTo(this.slide);
			this.messageBk = jQuery('<div class="message-bk"></div>').css({
				'opacity': .6
			}).appendTo(this.message);
			this.messageText = jQuery('<div class="message-text"></div>').appendTo(this.message);
			
			this.messageText.width(this.slideW - 20);		// 20px - padding
			this.messageBk.width(this.slideW - 20);		// 20px - padding
			
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
				if (!bindobj.ie) a.css('opacity', 0.5);
				this.dots.push( a );
			}
			
			var navWidth = this.images.length * 14;
			jQuery('.dotsNav', this.slide).css('left', ((this.slideW - navWidth) / 2) + 'px');
			
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
			
			bd.util.bdRefresh();
			Bindfooter.set();
			
			// Timer
			if (bd.util.onEditBlock()==false && this.autoStart) {
				this.tm = setInterval(function(){
					self.nextImage();
				}, this.interval);
			}
			
			return el;
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
			var row = Math.floor(idx / 2);
			var sw = idx % 2;
			
			this.boat.stop().animate({
				left: (sw == 1) ? "-" + this.slideW + "px":"0px",
				top: "-" + String(this.slideH * row) + "px"
			}, {easing: 'easeOutBack', duration: 2500});
			
			this.dispMessage();
			this.feedbackDots(idx);
		},
		
		dispMessage: function(){
			this.message.stop().animate({
				top: this.messageBk.outerHeight(true) * -1
			}, 1000);
			
			this.messageText.text("");
			this.messageBk.text("");
			
			var img = this.images[ this.currentIndex ];
			var ttl = img.attr('title');
			if (ttl != undefined && ttl != '') {
				var fmtTxt = ttl.replace(/[\n\r]/g,'<br>');
				this.messageText.html(fmtTxt);
				this.messageBk.html(fmtTxt);
				var th = this.messageText[0].scrollHeight;
				if (th==0) th = 40;
				this.message.stop().css({
					height: th,
					top: th * -1
				}).show().animate({
					top: 0
				}, 1000);
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
