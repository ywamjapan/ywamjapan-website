/* blockeditor.js
(C) 2007-2013 digitalstage inc.
v 20131121
--------------------------------------------------------- */

////////// BiND application interface object
var BindApp = {
	isWorking: false,
	onload: function() {
		BindApp.call("onload");
		if (!BindApp.isWorking) {
			var ua = navigator.userAgent.toLowerCase();
			var fullUrl = ua.indexOf("msie") > -1 ? window.location.toString() : document.URL;
			BindApp.isWorking = fullUrl.indexOf("?edit") > -1;
		}
		if (BindApp.isWorking) {
			BlockEdit.set();
			if (window.attachEvent) {
				window.attachEvent('onresize',BlockEdit.resize);
				window.attachEvent('onscroll',BlockEdit.scroll);
			} else if (window.addEventListener) {
				window.addEventListener('resize',BlockEdit.resize,false);
				window.addEventListener('scroll',BlockEdit.scroll,false);
			}
		}
		else BlockEdit = null;
	},
	call: function(com, p1, p2, p3) {
		if (navigator.platform.indexOf("Win") != -1) {
			window.location.href = "call:" + com +","+ p1 +","+ p2 +","+ p3;
		} else {
			status = "call:" + com +","+ p1 +","+ p2 +","+ p3;
		}
	}
}




////////// global value set
var Value = new Object();
Value.rootDir = bindobj.dir;
Value.preview = false;
Value.borderWidth = 2;
Value.outBackground = '#000';
Value.outBorder = Value.borderWidth + 'px dashed #fff';
Value.outOpacity = new Array('0.1','alpha(opacity=10)');
Value.overBackground = '#390';
Value.selectedBackground = '#390';
Value.selectedBorder = Value.borderWidth + 'px solid #fff';
Value.selectedOpacity = new Array('0.4','alpha(opacity=40)');
Value.blocks = new Array();
Value.covers = new Array();
Value.wraps = new Array();
Value.areas = new Array();
Value.areaCovers = new Array();
Value.areaTitles = new Array();
Value.areaOpacity = new Array('0.1','alpha(opacity=10)');
Value.currentblock = '';
Value.windowWidth = 0;
Value.topOffset = 0;

////////// BlockEdit functions
var BlockEdit = {
	areas:{
		'area-header':{title:'ヘッダ', color:'#0072bb', rgba:'rgba(0, 114, 187, 0.2)'},
		'area-billboard':{title:'ビルボード', color:'#f89321', rgba:'rgba(248, 147, 33, 0.2)'},
		'area-contents':{title:'コンテンツ', color:'#e191d1', rgba:'rgba(225, 145, 209, 0.2)'},
		'area-main':{title:'メイン', color:'#39b74c', rgba:'rgba(57, 183, 76, 0.2)'},
		'area-side-a':{title:'サイドA', color:'#f06777', rgba:'rgba(240, 103, 119, 0.2)'},
		'area-side-b':{title:'サイドB', color:'#f06777', rgba:'rgba(240, 103, 119, 0.2)'},
		'area-footer':{title:'フッタ', color:'#0072bb', rgba:'rgba(0, 114, 187, 0.2)'}
	},
	form : null,
	buttons : null,
	toolbarWidth: 250,
	e: function(id) {
		return document.getElementById(id);
	},
	t: function(tag) {
		return document.getElementsByTagName(tag);
	},
	send: function(id) {
		var obj = new Object();
		obj.id = BlockEdit.e('Form').className;
		obj.btn = id;

		BindApp.call("command", obj.btn, obj.id);
	},
	preview: function(flg) {
		Value.preview = flg;
		var blocks = Value.blocks;
		var covers = Value.covers;
		var wraps = Value.wraps;
		if (flg) {
			for (var i=0;i<covers.length;i++) {
				var c = covers[i];
				c.style.display = 'none';
				if (c.className=='blankblock') blocks[i].style.height = '0px';
				if (bindobj.ie60) {		//forIE6
					wraps[i].style.display = 'none';
					wraps[i].onmouseover = '';
				}
				else blocks[i].onmouseover = '';
			}
			BlockEdit.form.style.display = 'none';
		}
		else if (!flg) {
			if (Value.covers.length<1) BlockEdit.set();
			for (var i=0;i<covers.length;i++) {
				var c = covers[i];
				c.style.display = 'block';
				if (c.className == 'blankblock') {
					blocks[i].style.height = '100px';
					c.style.height = '100px';
					if (bindobj.ie60) wraps[i].height = 100;
				}
			}
			if (Value.currentblock.length>0) BlockEdit.e('Form').style.display = 'block';
			BlockEdit.resize();
		}
		location.reload();
	},
	scroll: function() {
		BlockEdit.moveToolbar();
	},
	resize: function(dummy) {
		//var offset = (dummy==null) ? Value.topOffset:0;
		var offset = 0;
		if (bindobj.ie60) {
			var win = document.body.clientWidth;
			if (win==Value.windowWidth) return;
		}
		var blocks = Value.blocks;
		var covers = Value.covers;
		var wraps = Value.wraps;
		for (var i=0;i<blocks.length;i++) {
			var block = blocks[i];
			var obj = getElementPos(block);
			var c = covers[i];
			c.style.width = obj.w - (Value.borderWidth*2) + 'px';
			try {
				c.style.height = obj.h - (Value.borderWidth*2) + 'px';
			} catch(e) {}
			c.style.left = obj.x + 'px';
			c.style.top = (obj.y + offset) + 'px';
			if (bindobj.ie60) {		//forIE6
				var w = wraps[i];
				w.style.width = obj.w + 'px';
				w.style.height = obj.h + 'px';
				w.style.left = obj.x + 'px';
				w.style.top = (obj.y + offset) + 'px';
			}
		}
		
		var areas = Value.areas;
		var areaCovers = Value.areaCovers;
		var areaTitles = Value.areaTitles;
		for (var i=0; i<areas.length; i++) {
			var obj = getElementPos(areas[i]);
			var c = areaCovers[i];
			c.style.width = obj.w - (Value.borderWidth*2) + 'px';
			c.style.height = obj.h - (Value.borderWidth*2) + 'px';
			c.style.left = obj.x + 'px';
			c.style.top = (obj.y + offset) + 'px';
			var t = areaTitles[i];
			t.style.left = obj.x + 'px';
			t.style.top = (obj.y + offset) + 'px';
		}
		
		BlockEdit.moveToolbar();
		
		if (Bindfooter) Bindfooter.set();
	},
	moveToolbar: function() {
		var form = BlockEdit.form;
		var btns = BlockEdit.buttons;
		if (form != null && form.style.display == 'block') {		//if toolbars is shown
			var blockobj = getElementPos(BlockEdit.e(Value.currentblock));
			form.style.left = blockobj.x + 'px';
			var btop = 0;
			if (bindobj.ie || bindobj.ffx) {
				btop = document.documentElement.scrollTop + Value.topOffset;
			} else {
				btop = document.body.scrollTop + Value.topOffset;
			}
			
			var max = (blockobj.y + blockobj.h - 46);
			if (max < blockobj.y) max = blockobj.y;
			var tp = 0;
			
			if (blockobj.y < btop && btop < max) {
				tp = btop;
			} else if (max < btop) {
				tp = max;
			} else {
				tp = blockobj.y;
			}
			
			form.style.top = tp + 'px';
			form.style.height = (blockobj.y + blockobj.h - tp) + 'px';
			form.style.zIndex = 20000;
			
			var btns = BlockEdit.buttons;
			var btnsx = blockobj.w - BlockEdit.toolbarWidth - 3;
			btns.style.left = btnsx + 'px';
			btns.style.top = '3px';
			if (btnsx<3) {
				var leftpos = Math.abs(blockobj.w-BlockEdit.toolbarWidth-3);
				btns.style.left = blockobj.x-leftpos<3 ? '3px' : btnsx + 'px';
			}
		}
	},
	blank: function(block, cover) {
		if (cover.className=='blankblock') block.style.height = '100px';
		else {
			var flg = BlockEdit.blankCheck(block);
			if (flg==0 && !Value.preview) {
				Value.blocks[Value.blocks.length-1].style.height = '100px';
				Value.covers[Value.covers.length-1].style.height = '100px';
				Value.covers[Value.covers.length-1].className = 'blankblock';
				if (bindobj.ie60) Value.wraps[Value.wraps.length-1].height = 100;
			}
		}
	},
	blankCheck: function(block) {
		var blockdivs = block.getElementsByTagName('div');
		var blocktds = block.getElementsByTagName('td');
		var cmcs = new Array();
		var flg = 0;
		for (var j=0;j<blockdivs.length;j++) {
			var cls = blockdivs[j].className;
			if (cls.indexOf('column')>-1 || cls.indexOf('bmc')>-1) cmcs.push(blockdivs[j]);
		}
		for (var j=0;j<blocktds.length;j++) {
			var cls = blocktds[j].className;
			if (cls.indexOf('column')>-1 || cls.indexOf('cmc')>-1) cmcs.push(blocktds[j]);
		}
		for (var j=0;j<cmcs.length;j++) {
			var s = cmcs[j].innerHTML.replace(/\s/g,'');
			s = s.replace(/<!--custom_tags_start-->/g, '');
			s = s.replace(/<!--custom_tags_end-->/g, '');
			if (s != '' && s.match(/^<!--.*?-->$/) == null) {
				flg++;
			}
		}
		if (flg==0 && !Value.preview) {
			block.style.height = '100px';
		} else if (jQuery(block).height() == 0) {
			block.style.height = '100px';
		}
		return flg;
	},
	cover: function(block) {
		var obj = getElementPos(block);
		
		var cover = document.createElement('div');
		cover.id = 'c_' + block.id;
		document.body.appendChild(cover);
		
		cover.style.position = 'absolute';
		cover.style.width = obj.w - Value.borderWidth * 2 < 0 ? 'auto' : obj.w - Value.borderWidth * 2 + 'px';
		cover.style.height = obj.h - Value.borderWidth * 2 < 0 ? 'auto' : obj.h - Value.borderWidth * 2 + 'px';
		cover.style.left = obj.x + 'px';
		cover.style.top = (obj.y + Value.topOffset) + 'px';
		cover.style.cursor = 'pointer';
		cover.style.border = Value.outBorder;
		cover.style.background = Value.outBackground;
		cover.style.opacity = Value.outOpacity[0];	//forSafari
		cover.style.filter = Value.outOpacity[1];	//forIE
		cover.style.zIndex = 9999;
		cover.className = block.className;
		cover.onclick = BlockEdit.click;
		cover.onmouseover = function( e ) {
			cover.style.background = Value.overBackground;
			BlockEdit.dispSize( cover, e );
		};
		cover.onmouseout = function() {
			cover.style.background = Value.outBackground;
			BlockEdit.hideSize();
		};
		cover.onmousemove = function(e) {
			BlockEdit.moveSize(e);
		};
		return cover;
	},
	coverArea: function(area) {
		Value.areas.push(area);
		
		area.style.paddingTop = '24px';
		area.style.paddingBottom = '10px';
		area.style.marginBottom = '2px';
		
		if (navigator.platform.indexOf("Win") == -1) {
			if (area.id.indexOf('-side-') == -1 && area.id != 'area-main') {
				area.style.paddingLeft = '10px';
				area.style.paddingRight = '10px';
				area.style.width = area.style.width + 20;
			}
		}
		
		var obj = getElementPos(area);
		var col = BlockEdit.areas[area.id].color;
		
		var cover = document.createElement('div');
		cover.id = 'ac_' + area.id;
		document.body.appendChild(cover);
		
		cover.style.position = 'absolute';
		cover.style.width = obj.w - Value.borderWidth * 2 < 0 ? 'auto' : obj.w - Value.borderWidth * 2 + 'px';
		cover.style.height = obj.h - Value.borderWidth * 2 < 0 ? 'auto' : obj.h - Value.borderWidth * 2 + 'px';
		cover.style.top = (obj.y + Value.topOffset) + 'px';
		cover.style.left = obj.x + 'px';
		cover.style.border = '3px solid ' + col;
		if (bindobj.ie && !bindobj.ie100 && !bindobj.ie110) {
			cover.style.backgroundColor = col;
			cover.style.filter = Value.areaOpacity[1]	//forIE
		} else {
			cover.style.backgroundColor = BlockEdit.areas[area.id].rgba;
		}
		Value.areaCovers.push(cover);
		
		var title = document.createElement('div');
		document.body.appendChild(title);
		title.innerHTML = BlockEdit.areas[area.id].title;
		title.style.padding = '3px 10px';
		title.style.color = '#ffffff';
		title.style.fontSize = '14px';
		title.style.fontFamily = 'sans-serif';
		title.style.backgroundColor = col;
		title.style.position = 'absolute';
		title.style.top = obj.y + 'px';
		title.style.left = obj.x + 'px';
		Value.areaTitles.push(title);
		
		return cover;
	},
	toolbar: function() {
		var form = document.createElement('form');
		form.id = 'Form';
		document.body.appendChild(form);
		form.style.display = 'none';
		form.style.position = 'absolute';
		form.ondblclick = function() { BlockEdit.send('block_edit');}
		form.onmouseover = function( e ) {
			BlockEdit.dispSize( BlockEdit.e('c_' + form.className), e );
		};
		form.onmouseout = function() {
			BlockEdit.hideSize();
		};
		form.onmousemove = function(e) {
			BlockEdit.moveSize(e);
		};
		BlockEdit.form = form;
		
		var btns = document.createElement('div');
		btns.id = 'Buttons';
		btns.style.position = 'absolute';
		btns.style.width = BlockEdit.toolbarWidth + 'px';
		btns.style.height = '50px';
		form.appendChild(btns);
		BlockEdit.buttons = btns;
		
		var setstyle = function(id) {
			id.style.cssFloat = 'left';		//forFireFox,Safari
			id.style.styleFloat = 'left';	//forIE6
			id.style.overflow = 'hidden';
			id.style.height = '50px';
			id.style.background = 'url(' + Value.rootDir + '_module/js/blockeditor/BlockToolbar.png) no-repeat';
			id.style.backgroundPosition = 'left top';
			id.style.cursor = 'pointer';
			id.onmouseover = function() { id.style.backgroundPositionY = '-50px';}
			id.onmouseout = function() { id.style.backgroundPositionY = 'top';}
		};
		var setseperator = function(id) {
			id.style.cssFloat = 'left';
			id.style.styleFloat = 'left';
			id.style.height = '40px';
		};
		
		var btnEdit = document.createElement('div');
		btnEdit.id = 'block_edit';
		btnEdit.style.width = '73px';
		btnEdit.onclick = function() { BlockEdit.send(btnEdit.id);}
		setstyle(btnEdit);
		btns.appendChild(btnEdit);
		
		var btnUp = document.createElement('div');
		btnUp.id = 'block_up';
		btnUp.style.width = '35px';
		btnUp.onclick = function() { BlockEdit.send(btnUp.id);}
		setstyle(btnUp);
		btnUp.style.backgroundPosition = '-73px top';
		btns.appendChild(btnUp);
		
		var btnDown = document.createElement('div');
		btnDown.id = 'block_down';
		btnDown.style.width = '35px';
		btnDown.onclick = function() { BlockEdit.send(btnDown.id);}
		setstyle(btnDown);
		btnDown.style.backgroundPosition = '-108px top';
		btns.appendChild(btnDown);
		
		var btnAdd = document.createElement('div');
		btnAdd.id = 'block_add';
		btnAdd.style.width = '36px';
		btnAdd.onclick = function() { BlockEdit.send(btnAdd.id);}
		setstyle(btnAdd);
		btnAdd.style.backgroundPosition = '-143px top';
		btns.appendChild(btnAdd);
		
		var btnCopy = document.createElement('div');
		btnCopy.id = 'block_copy';
		btnCopy.style.width = '29px';
		btnCopy.onclick = function() { BlockEdit.send(btnCopy.id);}
		setstyle(btnCopy);
		btnCopy.style.backgroundPosition = '-179px top';
		btns.appendChild(btnCopy);
		
		var btnDelete = document.createElement('div');
		btnDelete.id = 'block_delete';
		btnDelete.style.width = '42px';
		btnDelete.onclick = function() { BlockEdit.send(btnDelete.id);}
		setstyle(btnDelete);
		btnDelete.style.backgroundPosition = '-208px top';
		btns.appendChild(btnDelete);
	},
	clear: function() {
		if (Value.preview) return;
		BlockEdit.form.style.display = 'none';
		var covers = Value.covers;
		for (var i=0;i<covers.length;i++) {
			var c = covers[i];
			c.style.border = Value.outBorder;
			c.style.background = Value.outBackground;
			c.style.opacity = Value.outOpacity[0];
			c.style.filter = Value.outOpacity[1];
		}
		Value.currentblock = '';
	},
	click: function() {
		var covers = Value.covers;
		for (var i=0; i<covers.length; i++) {
			var coverTmp = covers[i];
			if(coverTmp.id != this.id) {
				coverTmp.style.border = Value.outBorder;
				coverTmp.style.background = Value.outBackground;
				coverTmp.style.opacity = Value.outOpacity[0];
				coverTmp.style.filter = Value.outOpacity[1];
			}
		}
		
		var cover = BlockEdit.e(this.id);
		cover.style.border = Value.selectedBorder;
		cover.style.background = Value.selectedBackground;
		cover.style.opacity = Value.selectedOpacity[0];
		cover.style.filter = Value.selectedOpacity[1];
		cover.onmouseout = function() {}
		
		var form = BlockEdit.form;
		var idTmp = this.id.split('_');
		form.className = idTmp[1];
		Value.currentblock = idTmp[1];
		
		var obj = getElementPos(cover);
		form.style.width = obj.w + 'px';
		form.style.height = obj.h + 'px';
		form.style.display = 'block';
		BlockEdit.moveToolbar();
	},
	dispSize: function( cover, e ) {
		var curW = parseInt(omitPx(cover.style.width)) + Value.borderWidth * 2;
		var curH = parseInt(omitPx(cover.style.height)) + Value.borderWidth * 2;
		if (!BlockEdit.sizeArea) {
			var sizeArea = document.createElement('div');
			sizeArea.style.position = 'absolute';
			sizeArea.style.background = '#000000';
			sizeArea.style.color = '#ffffff';
			sizeArea.style.display = 'block';
			sizeArea.style.padding = '4px';
			sizeArea.style.fontSize = '11px';
			sizeArea.style.fontFamily = 'sans-serif';
			sizeArea.style.opacity = '0.6';
			sizeArea.style.filter = 'alpha(opacity=60)';
			sizeArea.style.zIndex = 20001;
			sizeArea.style.borderRadius = '4px';
			if (bindobj.ie90) {
				jQuery(document.body).prepend(sizeArea);
			} else {
				document.body.appendChild(sizeArea);
			}
			BlockEdit.sizeArea = sizeArea;
		}
		
		BlockEdit.sizeArea.innerHTML = '幅:' + curW + '  x  高さ:' + curH + '<br />' +
			'モード:' + ((cover.className.indexOf('bd-sm-smart')>-1) ? "スマート":"エディタ");
		
		BlockEdit.moveSize(e);
		BlockEdit.sizeArea.style.display = 'block';
	},
	moveSize: function(e) {
		if (BlockEdit.sizeArea) {
			if (bindobj.ie) {
				var ev = e || window.event;
				var scrollX = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
				    scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
				if (bindobj.ie100 || bindobj.ie90) {
					BlockEdit.sizeArea.style.top = (scrollY + e.clientY + 20) + 'px';
					BlockEdit.sizeArea.style.left = (scrollX + e.clientX + 20) + 'px';
				} else {
					var mouseY = ev.pageY?ev.pageY:(ev.clientY + document.body.scrollTop);
					var mouseX = ev.pageX?ev.pageX:(ev.clientX + document.body.scrollLeft);
					BlockEdit.sizeArea.style.top = (scrollY + mouseY + 20) + 'px';
					BlockEdit.sizeArea.style.left = (scrollX + mouseX + 20) + 'px';
				}
			} else {
				BlockEdit.sizeArea.style.top = (window.scrollY + e.clientY + 20) + 'px';
				BlockEdit.sizeArea.style.left = (window.scrollX + e.clientX + 20) + 'px';
			}
		}
	},
	hideSize: function() {
		if (BlockEdit.sizeArea) BlockEdit.sizeArea.style.display = 'none';
	},
	set: function() {
		if (Value.preview) return;
		var metas = BlockEdit.t('meta');
		for (var i=0; i<metas.length; i++) {
			var m = metas[i];
			if (m.name == 'bind-mobile' && m.content == 'true') {
				Value.topOffset = 90;
				break;
			}
		}
		var divs = BlockEdit.t('div');
		if (document.all) Value.windowWidth = document.body.clientWidth;	//forIE onresize bug
		if (Value.covers.length>0 && bindobj.ie60) for (var i=0;i<Value.blocks.length;i++) {	//forIE6
			Value.wraps[i].style.display = 'block';
			BlockEdit.blank(Value.blocks[i], Value.covers[i]);
		}
		if (Value.covers.length>0) {
			for (var i=0;i<Value.blocks.length;i++) BlockEdit.blank(Value.blocks[i], Value.covers[i]);	//forIE7,Safari
		} else {
			for (var i=0;i<divs.length;i++) {
				var div = divs[i];
				var id = div.id;
				if (id.indexOf('bk')==0 && div.className.indexOf('block')==0) {
					Value.blocks.push(div);
					if (bindobj.ie60) BlockEdit.ie60set(div);	//forIE6
					var cover = BlockEdit.cover(div);
					Value.covers.push(cover);
					BlockEdit.blank(div, cover);
				}
			}
			
			for (var i=0;i<divs.length;i++) {
				var div = divs[i];
				var id = div.id;
				if (id.indexOf('bk')==0 && div.className.indexOf('block')==0) {
					Value.blocks.push(div);
					if (bindobj.ie60) BlockEdit.ie60set(div);	//forIE6
					var cover = BlockEdit.cover(div);
					Value.covers.push(cover);
					BlockEdit.blank(div, cover);
					
				} else if (id.indexOf('area-')==0) {
					if (div.offsetHeight > 0) BlockEdit.coverArea(div);
					
				}
			}
			
			BlockEdit.resize(null);
			
			BlockEdit.toolbar();
			BlockEdit.e('page').onclick = BlockEdit.clear;
			if (bindobj.ie60) BlockEdit.e('page').style.width = '100%';	//forIE6
		}
	},
	ie60set: function(block) {		//forIE6
		var ie6obj = getElementPos(block);
		var wrap = document.createElement('img');
		wrap.src = Value.rootDir + '_module/js/blockeditor/block.gif';
		wrap.id = 'w_' + block.id;
		wrap.width = ie6obj.w;
		wrap.height = ie6obj.h;
		wrap.style.display = 'block';
		wrap.style.position = 'absolute';
		wrap.style.left = ie6obj.x + 'px';
		wrap.style.top = ie6obj.y + 'px';
		document.body.appendChild(wrap);
		Value.wraps.push(wrap);
	}
};

function omitPx(src) {
	return src.replace('px', '');
}

////////// get the element's position (caluculating from the corner of the screen)
function getElementPos(element) {
	var obj = new Object();
	obj.w = element.offsetWidth;
	obj.h = element.offsetHeight;
	obj.x = element.offsetLeft;
	obj.y = element.offsetTop;
	while(element.offsetParent) {
		element = element.offsetParent;
		obj.x += element.offsetLeft;
		obj.y += element.offsetTop;
	}
	return obj;
}