bd.slide.Slide03 = function() {
	this.init.apply(this, arguments);
};

bd.slide.Slide03.prototype = {
	isReady: false,
	
	init: function() {
		bd.util.addCss(bindobj.moduleroot + '/slide/_common/bdSlideHorizontal/jquery.bdSlideHorizontal.css');
		head.load(bindobj.moduleroot + '/slide/_common/bdSlideHorizontal/jquery.bdSlideHorizontal.js', jQuery.fnbind(this, this.callback));
	},
	
	callback: function() {
		this.isReady = true;
	},
	
	render: function( elem, autost, loop ) {
		jQuery(elem).bdSlideHorizontal({'autostart':autost, 'loop':loop});
	}
};
