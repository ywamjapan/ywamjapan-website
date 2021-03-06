bd.slide.PtPan = function() {
	this.init.apply(this, arguments);
};

bd.slide.PtPan.prototype = {
	isReady: false,
	
	init: function() {
		bd.util.addCss(bindobj.moduleroot + '/slide/_common/bdSlidePan/jquery.bdSlidePan.css');
		head.load(bindobj.moduleroot + '/slide/_common/bdSlidePan/jquery.bdSlidePan.js', jQuery.fnbind(this, this.callback));
	},
	
	callback: function() {
		this.isReady = true;
	},
	
	render: function( elem, autost, loop ) {
		jQuery(elem).bdSlidePan({'autostart':autost, 'loop':loop});
	}
};
