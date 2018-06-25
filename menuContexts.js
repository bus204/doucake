/*
 * http://open.chrome.360.cn/html/dev_messaging.html
 * 扩展之间传递消息。
 */

/**
 * @brief 图片右键菜单内的 广播话题列表
 */
var post_to_guangbo_list = [{
	id: "#douban_guangbo",
	name: "发豆瓣广播"
},{
	id:"#世界杯#",
	name:"#世界杯#"
}, {
	id: "#42_low_card",
	name: "#42路# #低俗广播#"
},  {
	id: "#beauty_stranger",
	name: "#42路# #漂亮的陌生人#"
}, {
	id: "#42wtf",
	name: "#哎呦#"
},{
	id:"#42章经#",
	name:"#42章经#"
}
];

/**
 * 右键菜单中的豆列.
 * @prop id：唯一标识。
 * @prop name：展示在右键菜单中的文案。
 * @prop domain_rule 基于原页面域名的规则。当规则命中时，使用 指向的doulist，否则，就是用 @ref default.
 * @prop default 默认的doulist ID。
 */
var doulist_map = {
	"1024": {
		id: "1024"
		, name: "1024"
		, default: "45956630"//"45928417"
		, domain_rule: {
			"www.douban.com": "45956630"
		}
	}//end 1024
};

function test_selection(info, tab) {
	console.log("test_selection");
	console.log("info.selectionText : " + info.selectionText);
	console.log(document.getSelection());
	console.log(document.getSelection().toString());

	chrome.tabs.sendRequest(tab.id, {
		method: "call_get_selection_html",
		img_url: info.srcUrl,
		pageUrl: info.pageUrl
	}, function (response) {
		console.log("call_get_selection_html callback");
		console.log(response);
	});
}
var getSnsConfIndex = function (id) {
	for (var a in post_to_guangbo_list) {
		if (id == post_to_guangbo_list[a].id) {
			return a;
		}
	}
	return -1;
}

function addToDoulist(info, tab) {

	saveImg(info, tab, 2);
}

function postDoubanGuangBo(info, tab) {
	saveImg(info, tab, 1);
}

function setTopics(info, tab){
	console.log("setTopics info:"+JSON.stringify(info));
	console.log("setTopics tab:"+JSON.stringify(tab));
	id=info.menuItemId.replace(/.topic/g,"");
	var iIndex = getSnsConfIndex(id);
	if (-1 == iIndex) {
		console.log('index illegel ,do nothing');
		return;
	}
	var topic= post_to_guangbo_list[iIndex].name;
	chrome.tabs.sendRequest(tab.id, {
		method: "setTopics",
		data:post_to_guangbo_list[iIndex]
	}, function(response){
		//set success
	}
	);
}

/**
 * 保存图片的执行函数
 * @param {object} info 
 * @param {object} tab 
 * @param {number} type - 默认，表示要上传图片到相册。1，发图片到广播；2，标识要加入到 豆列。
 */
function saveImg(info, tab, type) {
	console.log("info");
	console.log(info);
	console.log("tab");
	console.log(tab);
	console.log("srcUrl :" + info.srcUrl);
	console.log("pageUrl :" + info.pageUrl);
	console.log("title:" + tab.title);
	;
	var a = document.createElement('a');
	a.href = info.pageUrl;
	console.log(a);
	console.log(a.hostname);
	chrome.tabs.sendRequest(tab.id, {
		method: "call_get_src_url",
		img_url: info.srcUrl,
		pageUrl: info.pageUrl,
		albumid: info.menuItemId
	}, function (response) {
		console.log("sendRequest callback " + JSON.stringify(response));
		console.log(response);
		switch (type) {
			case 1: {//发广播
				var iIndex = getSnsConfIndex(info.menuItemId);
				if (-1 != iIndex) {
					var tmpObj = response;
					if (0 == post_to_guangbo_list[iIndex].name.indexOf("#")) {
						tmpObj.title = " " + post_to_guangbo_list[iIndex].name + " "
							+ ((response && response.title) ? response.title : tab.title);
					}
					open_douban_guangbo_page(info, tab, tmpObj);
				} else {
					open_up_load_page(info, tab, response);
				}
				break;
			}
			case 2: {//加豆列
				add_doulist(info, tab, response);
				break;
			}
			default: {//传相片到相册
				open_up_load_page(info, tab, response);
			}
		}

	});

};

var add_doulist = function (info, tab, response) {
	var img_src_url = info.srcUrl.replace(/http:/g, "https:");
	//在默认的情况下，使用 id 对应的default  doulist
	//然后根据 域名的规则，来匹配 具体的 doulist。
	var doulistid = doulist_map[info.menuItemId].default;
	if (response.pageUrl) {
		var _a = document.createElement("a");
		_a.href = response.pageUrl;
		var _domainname = _a.hostname;
		if (doulist_map[info.menuItemId].domain_rule[_domainname]) {
			doulistid = doulist_map[info.menuItemId].domain_rule[_domainname];
		}
	}
	var url = "https://www.douban.com/doulist/" + doulistid + "/?";
	url = url + "auto_upload=true"//            
		+ "&img_url=" + encodeURIComponent(img_src_url.replace(/\.webp/g, ".jpg")) + "&title="
		+ encodeURIComponent(response.title ? response.title : tab.title)
		+ "&album=" + encodeURIComponent(doulistid);
	if (response && response.pageUrl) {
		url = url
			+ "&src_url="
			+ encodeURIComponent((response.pageUrl.indexOf("http") == 0 ? ""
				: "https://")
				+ response.pageUrl);
	} else {
		url = url
			+ "&src_url="
			+ encodeURIComponent((info.pageUrl.indexOf("http") == 0 ? ""
				: "https://")
				+ info.pageUrl);
	}

	var pageUrl = "";
	if (response && response.pageUrl) {
		pageUrl = ((response.pageUrl.indexOf("http") == 0 ? "" : "https://") + response.pageUrl);
	} else {
		pageUrl = ((info.pageUrl.indexOf("http") == 0 ? "" : "https://") + info.pageUrl);
	}
	url = url + "&src_url=" + encodeURIComponent(pageUrl);
	url = url + "&src_tabid=" + tab.id;
	if (response && response.author) {
		// 把名字中的空格替换掉。
		url = url + "&author="
			+ encodeURIComponent(response.author.replace(/\s+/g, ""));
	}

	console.log("open upload page:  " + url);
	chrome.tabs.create({
		"url": url,
		"active": false
	});
}

var open_douban_guangbo_page = function (info, tab, response) {
	console.log("open_douban_guangbo_page");
	var img_src_url=info.srcUrl;
	if (response.image_url && response.image_url.length > 0) {
		img_src_url = response.image_url;
	}
	img_src_url =img_src_url.replace(/http:/g, "https:");
	var url = "https://www.douban.com/";
	url = url + "?auto_upload=true"//            
		+ "&img_url=" + encodeURIComponent(img_src_url) + "&title="
		+ encodeURIComponent(response.title ? response.title : tab.title)
		+ "&album=" + encodeURIComponent(info.menuItemId);
	if (response && response.pageUrl) {
		url = url
			+ "&src_url="
			+ encodeURIComponent((response.pageUrl.indexOf("http") == 0 ? ""
				: "https://")
				+ response.pageUrl);
	} else {
		url = url
			+ "&src_url="
			+ encodeURIComponent((info.pageUrl.indexOf("http") == 0 ? ""
				: "https://")
				+ info.pageUrl);
	}

	chrome.tabs.create({
		"url": url,
		"active": false
	});
}
/**
 * 打开一个新的tab页面，在新的tab页面会自动上传照片，新tab页面可能是 豆瓣广播页，也可能是 一个相册的上传页。
 * 新页面中的js代码，见  @file upload.js .
 * @param {Object} info 
 * @param {string} info.srcUrl 要上传的照片的源链接。
 * @param {string} info.pageUrl 照片所在的页面的URL。
 * @param {string} info.menuItemId 页面上右键的菜单ID，同时也是目标相册的ID。
 * @param {object} tab 
 * @param {object} response 
 */
var open_up_load_page = function (info, tab, response) {

	var img_src_url = info.srcUrl.replace(/http:/g, "https:");
	if (response.image_url && response.image_url.length > 0) {
		img_src_url = response.image_url;
	}
	var pageUrl = "";
	if (response && response.pageUrl) {
		pageUrl = ((response.pageUrl.indexOf("http") == 0 ? "" : "https://") + response.pageUrl);
	} else {
		pageUrl = ((info.pageUrl.indexOf("http") == 0 ? "" : "https://") + info.pageUrl);
	}
	/*
	替换 豆瓣相册内的 缩略图 路径。
	*/
	if (-1 != img_src_url.indexOf('/lthumb/')) {
		img_src_url = img_src_url.replace(/lthumb/g, "lphoto");
		try {
			var myArr = /.*\/p(\d+).*/.exec(img_src_url);
			if (myArr && myArr.length > 0) {
				pageUrl = "https://www.douban.com/photos/photo/" + myArr[1]
					+ "/";
			}
		} catch (e) {
		}
	}
	var albumid = info.menuItemId;
	var tags = "";
	if (info.menuItemId.indexOf("|") > -1) {
		albumid = info.menuItemId.substring(0, info.menuItemId.indexOf("|"));
		tags = info.menuItemId.substring(info.menuItemId.indexOf("|") + 1);
	} else {
		tags = "";//默认是相册名称
	}

	var url = "https://www.douban.com/photos/album/"
		+ encodeURIComponent(albumid) + "/upload";
	url = url + "?auto_upload=true"//            
		+ "&img_url=" + encodeURIComponent(img_src_url) + "&title="
		+ encodeURIComponent(tab.title) + "&album="
		+ encodeURIComponent(albumid);
	url = url + "&token=92012873:b4de5ab6c7a3bdbddd45f0d1418765c97145fd65"
	url = url + "&src_url=" + encodeURIComponent(pageUrl);
	url = url + "&src_tabid=" + tab.id;
	if (response && response.author) {
		// 把名字中的空格替换掉。
		url = url + "&author="
			+ encodeURIComponent(response.author.replace(/\s+/g, ""));
	}
	/*
	追加tags参数，在新页面上传成功后，自动tags .
	*/
	url = url + "&tags=" + encodeURIComponent(tags);
	console.log("open upload page:  " + url);
	chrome.tabs.create({
		"url": url,
		"active": false
	});
};

var requestFileSystemErrHandler = function () {
	console.log("requestFileSystemErrHandler");
};

function openUrlWindow(info, tab) {

	var url = info['linkUrl'];

	url = getQueryString(url, 'url');

	chrome.tabs.create({
		"url": url,
		"active": false
	});

};

function getQueryString(url, name) {

	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");

	var r = url.match(reg);

	if (r !== null)
		return unescape(r[2]);
	return null;

};
/**
 * @brief 右键菜单内的相册列表
 * @details 
 * json 数组，例如：<br/>
 * [
 * 	{"id":"1625193659","name":"1024（私）"}
 * ]
 * 
 * 
 * <br/>
 * 
 */
/**
 * @typedef {Object} album_info 右键菜单中的相册信息
 * @property 
 * @property id - 豆瓣相册的id
 * @property name - 豆瓣相册的name，也会展示为右键菜单。
 * @property {string[]} tags - 这个相册可供选择的标签列表
 */
/**
 * @type album_info[] 相册列表数组
 * @property 
 */
var album_list = null;
/**
 * 鼠标菜单上追加列表。
 */
var add_menuContext = function () {
	chrome.contextMenus.removeAll();
	/*
	 * 增加页面上的右键菜单
	 */
	var pid = chrome.contextMenus.create({
		"title": "保存到豆瓣",
		"contexts": ["image", "editable"]
	}, function () {
		console.log("chrome.contextMenus.create");
	});


	/**
	 * doulist
	 */
	for (var a in doulist_map) {
		chrome.contextMenus.create({
			"title": "豆列:" + doulist_map[a].name
			, "contexts": ["image"]
			, "onclick": addToDoulist
			, "id": doulist_map[a].id
		});
	}


	console.log(window.localStorage.getItem("album_list"));
	var tmp = "album_list=" + window.localStorage.getItem("album_list");
	eval(tmp);
	//	console.log(JSON.stringify(album_list));
	/*
	 * 发豆瓣广播。
	 */
	for (var a in post_to_guangbo_list) {
		chrome.contextMenus.create({
			"title": post_to_guangbo_list[a].name,
			"contexts": ["image"],
			"onclick": postDoubanGuangBo,
			"parentId": pid,
			"id": post_to_guangbo_list[a].id
		});
	}//end for post_to_guangbo_list
	for (var a in post_to_guangbo_list) {
		chrome.contextMenus.create({
			"title": post_to_guangbo_list[a].name,
			"contexts": ["editable"],
			"onclick": setTopics,
			"parentId": pid,
			"id": post_to_guangbo_list[a].id+".topic"
		});
	}//end for post_to_guangbo_list




	/*
	相册列表
	*/
	for (var a in album_list) {
		if (album_list[a].tags && album_list[a].tags.length > 0) {
			/*
			 * @todo 为相册增加二级菜单。
			 * 二级菜单中的选项仍然是传入  album_list[a].id 指定的相册，但是会增加 二级菜单限定的标签。
			 */
			var _tmpMenuContextId = chrome.contextMenus.create({
				"title": "保存图片到 " + album_list[a].name,
				"contexts": ["image"],
				//"onclick": saveImg,//这里应该有事件吗？
				//"parentId": pid,
				"id": album_list[a].id
			});
			/// 对于这种有 二级标签的，需要 设置一个额外的二级菜单，表示没有标签。
			chrome.contextMenus.create({
				"title": album_list[a].name,
				"contexts": ["image"],
				"onclick": saveImg,
				"parentId": _tmpMenuContextId,
				"id": album_list[a].id
			});
			/// 添加其它的二级标签。
			for (var t in album_list[a].tags) {
				chrome.contextMenus.create({
					"title": album_list[a].tags[t],
					"contexts": ["image"],
					"onclick": saveImg,
					"parentId": _tmpMenuContextId,
					"id": album_list[a].id + "|" + album_list[a].tags[t]
				});
			}
		} else {
			//没有二级标签。
			chrome.contextMenus.create({
				"title": "保存图片到 " + album_list[a].name,
				"contexts": ["image"],
				"onclick": saveImg,
				//"parentId": pid,
				"id": album_list[a].id + "|" + album_list[a].name
			});
		}
	}// end for  album_list


};// end attach_album_list

add_menuContext();
/*
 * 监听外部的查询和添加
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(sender.tab ? "from a content script:" + sender.tab.url
		: "from the extension");
	if ("douban_is_in_context" === request.method) {
		douban_is_in_context(request, sender, sendResponse);
	}
	if ("rm_from_right_menu" === request.method) {
		rm_from_right_menu(request, sender, sendResponse);
	}
	if ("add_to_right_menu" === request.method) {
		add_to_right_menu(request, sender, sendResponse);
	}
	if ("get_all_right_menu" === request.method) {
		get_all_right_menu(request, sender, sendResponse);
	}
	if ("group_is_in_fav" === request.method) {
		group_is_in_fav(request, sender, sendResponse);
	}
	if ("add_group_to_fav" === request.method) {
		add_group_to_fav(request, sender, sendResponse);
	}
	if ("rm_group_from_fav" === request.method) {
		rm_group_from_fav(request, sender, sendResponse);
	}

	if ("group_fav_list" === request.method) {
		group_fav_list_func(request, sender, sendResponse);
	}

	if ("call_downloadFirst" == request.method) {
		call_downloadFirst(request, sender, sendResponse);
	}
});
var group_fav_list = new Array();

var call_downloadFirst = function (request, sender, sendResponse) {
	console.log(request);
	var tmpRequest = request;
	tmpRequest.method = "call_downloadFirst";
	console.log(tmpRequest);

	chrome.tabs.sendRequest(parseInt(request.tabid, 10), tmpRequest, function (
		response) {
		console.log("call_downloadFirst callback");
		console.log(response);
		sendResponse(tmpRequest);

		console.log("call_downloadFirst callback  222");
	});
}

var group_fav_list_func = function (request, sender, sendResponse) {
	console.log("group_fav_list : " + JSON.stringify(request));
	var item = null;
	console.log("getItem :" + window.localStorage.getItem("group_fav_list"));
	var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
	eval(tmp);
	console.log(JSON.stringify(group_fav_list));
	sendResponse(group_fav_list);
}

var group_is_in_fav = function (request, sender, sendResponse) {
	console.log("group_is_in_fav : " + JSON.stringify(request));
	var item = null;
	// if(group_fav_list.length==0){
	console.log("getItem :" + window.localStorage.getItem("group_fav_list"));
	var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
	eval(tmp);
	console.log(JSON.stringify(group_fav_list));
	// }
	for (var i in group_fav_list) {
		if (group_fav_list[i].group_id === request.group_id) {
			item = group_fav_list[i];
			break;
		}
	}
	console.log("group_is_in_fav sendResponse: " + JSON.stringify(item));
	sendResponse(item);
}

var rm_group_from_fav = function (request, sender, sendResponse) {
	console.log("rm_group_from_fav : " + JSON.stringify(request));
	var item = null;
	// if(group_fav_list.length==0){
	console.log("getItem :" + window.localStorage.getItem("group_fav_list"));
	var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
	eval(tmp);
	console.log(JSON.stringify(group_fav_list));
	// }
	for (var i in group_fav_list) {
		if (group_fav_list[i].group_id === request.group_id) {
			group_fav_list.splice(i, 1);
		}
	}
	window.localStorage.setItem("group_fav_list", JSON
		.stringify(group_fav_list));
	console.log(JSON.stringify(group_fav_list));
	sendResponse();
}

var add_group_to_fav = function (request, sender, sendResponse) {
	console.log(request);
	var item = null;
	if (!group_fav_list) {
		group_fav_list = new Array();
	}
	group_fav_list.unshift({
		"group_id": request.group_id,
		"group_icon": request.group_icon
	});
	sendResponse(item);
	window.localStorage.setItem("group_fav_list", JSON
		.stringify(group_fav_list));
	console.log(JSON.stringify(group_fav_list));
	sendResponse();
}

var douban_is_in_context = function (request, sender, sendResponse) {
	console.log(request);
	var album_item = null;
	for (var i in album_list) {
		if (album_list[i].id === request.albumid) {
			album_item = album_list[i];
			break;
		}
	}
	sendResponse(album_item);
};

var rm_from_right_menu = function (request, sender, sendResponse) {
	console.log(request);
	for (var i in album_list) {
		if (album_list[i].id === request.albumid) {
			album_list.splice(i, 1);
			window.localStorage.setItem("album_list", JSON
				.stringify(album_list));
			console.log(JSON.stringify(album_list));
			break;
		}
	}
	add_menuContext();
	sendResponse();
};


/**
 * 执行函数，向右键菜单中添加新的object
 * @param {Object} request 
 * @param {string} request.albumid - 相册ID
 * @param {string} request.name - 相册名称
 * @param {Object} request.albuminfo - 相册信息
 * @param {string} request.albuminfo.id - 相册ID，同 request.albumid
 * @param {string} request.albuminfo.name - 相册名称，同 request.name
 * @param {string} request.albuminfo.desc - 相册描述。
 * @param {*} sender 
 * @param {*} sendResponse 
 */
var add_to_right_menu = function (request, sender, sendResponse) {
	if (album_list === null) {
		album_list = new Array();
	}
	var album = {
		"id": request.albumid,
		"name": request.name
	};
	if (request.albuminfo) {
		//相册描述，切分，得到可选的列表标签
		//使用相册描述中，使用 英文冒号开头的那一行，然后 使用英文的分号作为 切分的 关键字。
		var _desc = request.albuminfo.desc;
		console.log("_desc:" + _desc);
		album.tags = new Array();
		var _desc_array = _desc.split("\n");
		for (var index in _desc_array) {
			if (0 == _desc_array[index].length) {
				//空行跳过
				continue;
			}
			if (_desc_array[index].indexOf(":") != 0) {
				//不是以 : 开头，跳过
				continue;
			} else {
				//跳过开头的 英文冒号，可能有多个，所以使用正则表达式来替换。
				var _tag_array = _desc_array[index].replace(/^:+/g, "").split(',');
				for (var ti in _tag_array) {
					if (_tag_array[ti].length == 0) {
						continue;
					}
					album.tags.push(_tag_array[ti]);
				}
			}
		}
	}
	album_list.push(album);
	window.localStorage.setItem("album_list", JSON.stringify(album_list));
	console.log(JSON.stringify(album_list));
	add_menuContext();
	sendResponse();
};

var get_all_right_menu = function (request, sender, sendResponse) {
	if (album_list === null) {
		album_list = new Array();
	}
	sendResponse(album_list);
}