/**
 * @file 弹框
 * @version v1.1.0
 * @example
 * var pop = require('/js/lib/dialog'); //为防止与dialog冲突,请勿命名为dialog
 * pop.alert("操作成功",2);
 */
var pop = {
	//动态引入css文件
    addCSS: function() {
		var link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = "/css/ui-dialog.css?v=4";
		document.getElementsByTagName("head")[0].appendChild(link);
	},
	//$("head").append('<link href="/css/ui-dialog.css?v=20150204" rel="stylesheet">');

    showDialog: function(opts) {
		var def = {
			width: "328px",
			fixed: true,
			backdropOpacity: 0.3
		}
		if (!opts.ispage) {
			def.title = "提示";
		}
		//提示图标展示
		if (opts.icon) {
			opts.content = '<span class="dialog-icon dialog-icon' + opts.icon + '"></span><span class="dialog-msg">' + opts.content + '</span>';
		}

		//弹框皮肤，默认为蓝色
		if (opts.skin) {
			opts.skin = "skin-orange";
		} else {
			opts.skin = "skin-blue";
		}

		var options = $.extend({}, def, opts);
		var d = dialog(options);
		d.showModal();
		if (opts.ispage) {
			$(d.node).find(".g-dialog-body").css("padding", 0);
		}

		//调换按钮默认位置
		$("button[i-id='ok']").insertBefore($("button[i-id='cancel']"));
		return d;
	},

	/**
	 * 提示框
	 * @param  {string} msg - 提示语
	 * @param  {number} icon - 提示图标,默认不展示 0:none 1:fail 2:success 3:confirm 4:tips
	 * @param  {number} skin - 提示框皮肤,默认蓝色 0:blue 1:orange
	 * @example
	 * pop.alert("操作成功",2);
	 * pop.alert("操作失败",1,1);
	 */
    alert: function(msg, icon, skin, yes) {
		var opts = {
			content: msg,
			icon: icon,
			skin: skin,
			okValue: '确定',
			ok: yes || function() {}
		}
		return pop.showDialog(opts);
	},

	/**
	 * 确认框
	 * @param  {string} msg - 提示语
	 * @param  {number} icon - 提示图标
	 * @param  {number} skin - 提示框皮肤
	 * @param  {object} yes - 确认按钮执行方法
	 * @param  {object} yes - 取消按钮执行方法
	 */
    confirm: function(msg, icon, skin, yes, no) {
		var opts = {
			content: msg,
			icon: icon,
			skin: skin,
			okValue: '确定',
			cancelValue: '取消',
			ok: yes || function() {},
			cancel: no || function() {}
		}
		return pop.showDialog(opts);
	},

	/**
	 * tips框
	 * @param  {string} msg  - tips提示语
	 * @param  {string} ele  - tips指向的dom元素
	 * @param  {string} align - tips箭头指向,默认bottom,共12种("top","top right","right top","right",...)
	 * @param  {number} skin - tips皮肤
	 * @example
	 * pop.tips("这是任务大厅","#id_task_hall")
	 * pop.tips("这是任务大厅","#id_task_hall",2,"right top")
	 */
    tips: function(msg, ele, align) {
		var opts = {
			content: msg,
			align: align || "bottom"
		};
		opts.skin = "skin-tips";
		var d = dialog(opts);
		d.show($(ele)[0]);
		return d;
	},

	/**
	 * loading层
	 */
    loading: function() {
		var def = {
			fixed: true,
			skin: "skin-loading",
			backdropOpacity: 0
		}
		var d = dialog(def);
		d.showModal();
		return d;
	}
}
window.pop = pop;
