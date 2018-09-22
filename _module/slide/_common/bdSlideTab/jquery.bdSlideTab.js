(function($) {
	var defaults = {
		autoStart: false,
		loop: false
	};
	
	$.fn.bdSlideTab = function(opts) {
		return this.each(function() {
			var element = $(this);
			if (element.data('bdSlideTab')) return element.data('bdSlideTab');
			var slide = new Slide();
			element.data('bdSlideTab', slide);
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
			
			this.slide = jQuery('<div class="shift04"></div>').css({
				width: w,
				height: h,
				visibility: 'hidden'
			});
			
			var self = this;
			var totalLeft = 0;
			this.imageTotal = 0;
			this.images = [];
			this.boat = jQuery('<div class="boat"></div>');
			jQuery('span', el).each(function(i, e) {
				var els = e.childNodes;
				var img = null;
				var anc = null;
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
					self.imageTotal++;
					
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
			
			// tab
			var tabBase = jQuery('<div class="tab-base"></div>');
			jQuery('<div class="tab-top"></div>').appendTo(tabBase);
			var tabCont = jQuery('<div class="tab-container"></div>').appendTo(tabBase);
			this.tabBoat = jQuery('<div class="tab-boat"></div>').appendTo(tabCont);
			this.tabs = [];
			for (var i=0; i<this.imageTotal; i++) {
				var a = jQuery('<a href="javascript:;" class="tab"></a>').bind('click', {idx: i}, function(e){
					self.currentIndex = e.data.idx;
					self.gotoImage( self.currentIndex );
					self.restartTimer();
				}).css({
					'border': 'none'
				}).appendTo(this.tabBoat);
				
				// tab caption
				var ttl = this.images[ i ].attr('title');
				if (typeof(ttl) == 'undefined' || ttl == '') {
					ttl = 'Image' + (i+1);
				}
				a.append(jQuery('<p></p>').text(ttl));
				
				this.tabs.push( a );
			}
			
			// footer
			var tabBottom = jQuery('<div class="tab-bottom"></div>').appendTo(tabBase);
			if (this.imageTotal > 8) {
				jQuery('<a href="javascript:;" class="nextNav"></a>').click(function(e) {
					self.nextImage();
					self.restartTimer();
				}).appendTo(tabBottom);
				jQuery('<a href="javascript:;" class="prevNav"></a>').click(function(e) {
					self.prevImage();
					self.restartTimer();
				}).appendTo(tabBottom);
				
				tabBottom.append(jQuery('<p></p>').text('Total ' + this.imageTotal + 'photos'));
				
				// adjust size
				tabCont.height(280);
				tabBottom.height(49);
				tabBottom.css('background', 'url(' + bindobj.moduleroot + '/slide/tab/banner_nav_bg_withline.png) 20px -291px no-repeat');
			}
			
			// append tab
			tabBase.appendTo(this.slide);
			
			// current tab
			this.feedbackTab( 0 );
			
			this.slide.insertBefore(el);
			el.remove();
			
			this.slide.css({'visibility': 'visible', 'opacity': 0}).animate({ opacity: 1 }, {
				complete:function() {
					bd.util.bdRefresh();
					Bindfooter.set();
				}
			});
			
			// Timer
			if (this.autoStart) {
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
			
			this.feedbackTab(idx);
		},
		
		feedbackTab: function(idx){
			for (var i=0; i<this.imageTotal; i++) {
				var tab = this.tabs[ i ];
				if (i==idx) {
					tab.addClass('on');
				} else {
					tab.removeClass('on');
				}
			}
			
			if (this.imageTotal > 8) {
				var targetTop = 0;
				if (idx > 6) {
					targetTop = (idx - 6) * 40 * -1;
				}
				this.tabBoat.stop().animate({
					marginTop: targetTop
				}, 600, 'easeOutExpo');
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
