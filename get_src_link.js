var get_douban_author_from_album = function () {
	var _div_pic = $("div#db-usr-profile").find("div.pic");
	var _href = _div_pic.find("a").attr("href");
	var douban_uid = _href.substring(0, _href.length - 1);
	douban_uid = douban_uid.substring(douban_uid.lastIndexOf("/") + 1);

	var _name = _div_pic.find("img").attr("alt");

	return douban_uid + "," + _name;
}
/**
 * 在日记页面获取作者信息
 */
var get_douban_author_from_note = function () {
	var _div_pic = $("div.mod-usercard").find("div.pic");
	var _href = _div_pic.find("a").attr("href");
	var douban_uid = _href.substring(0, _href.length - 1);
	douban_uid = douban_uid.substring(douban_uid.lastIndexOf("/") + 1);

	var _name = _div_pic.find("img").attr("alt");

	return douban_uid + "," + _name;
}
window.get_douban_status_link = function (aoReq) {
	var retObj = {};
	var link = window.location.href;// +" "+aoReq.img_url;
	// link=link.replace(/http:\/\/www\./g,'');
	console.log(link);
	retObj.link = link;
	console.log("aoReq.albumid : " + aoReq.albumid);
	if (/^\/doulist\/\d+\/$/.test(window.location.pathname)) {//豆列页面
		console.log("doulist : " + window.location.pathname);
		$("img[src='" + aoReq.img_url + "']").each(function () {
			var _item = $(this).parents("div.doulist-item");
			var _desc = _item.find("blockquote.comment").text();
			_desc = _desc.substring(_desc.indexOf("评语：") + 3);
			console.log("desc : " + _desc);
			var _url = _desc.substring(0, _desc.indexOf(" ;"));
			var _jobj = "var __jsonobj=" + _desc.substring(_desc.indexOf(" ;") + 2);
			console.log("_jobj:" + _jobj);
			eval(_jobj);
			console.log("__jsonobj :" + JSON.stringify(__jsonobj));
			retObj.author = __jsonobj.author;
			retObj.title = __jsonobj.title;
			retObj.image_url = aoReq.img_url.replace(/medium/g, "large")
			link = _url;
		});
	} else if (/^\/.*status\/\d+\/$/.test(window.location.pathname)) {// 豆瓣广播的详情页
		var douban_uid = $("div.status-item").attr("data-uid");
		retObj.author = douban_uid;
		author = $("div.text").children("a");
		if (author) {
			retObj.author = retObj.author + "," + author.html();
		}
		if (!retObj.title) {
			retObj.title = $("div.status-saying").text().replace(/\n/g, "")
				.replace(/^\s+/g, "").replace(/\s+$/g, "");
			;
		}
	} else if (/^\/note\/\d+\/$/.test(window.location.pathname)) { //豆瓣日记
		console.log("豆瓣日记" + window.location.pathname);
		link = window.location.href;
		retObj.author = get_douban_author_from_note();
		if (!retObj.title) {
			retObj.title = document.title;
		}

	} else if (/^\/photos\/photo\//.test(window.location.pathname)// 豆瓣相册相片
	) {
		console.log("豆瓣相册相片" + window.location.pathname);
		link = window.location.href;

		retObj.author = get_douban_author_from_album();
		if (!retObj.title) {
			retObj.title = document.title;
		}
		if ($("div.photo_descri")) {
			retObj.title += $("div.photo_descri").text();
		} else if ($("span#display")) {
			retObj.title = $("span#display").text().replace(/\n/g, "").replace(
				/^\s+/g, "").replace(/\s+$/g, "");
		}

		console.log(retObj);
	} else if (/^\/photos\/album\//.test(window.location.pathname)) {// 豆瓣相册页
		var _mod = $("div .info");
		link = window.location.href;

		retObj.author = get_douban_author_from_album();

		$("img[src='" + aoReq.img_url + "']").each(function () {
			console.log("find img element");
			link = $(this).parents("a").attr("href");
			retObj.link = link;
			return;
		});// end img[src='"+aoReq.img_url+"']").each(function(){

	} else if (/^\/group\/topic\/\d+\/$/.test(window.location.pathname)) {// 豆瓣小组的帖子
		console.log("group/topic");
		link = window.location.href;
		// 找作者
		var author = $("div.topic-doc").find("span.from").children("a");
		if (author) {
			retObj.author = author.html();
			var _href = author.attr("href")
			var douban_uid = _href.substring(0, _href.length - 1);
			douban_uid = douban_uid.substring(douban_uid.lastIndexOf("/") + 1);
			retObj.author = author.html() + "," + douban_uid;
		}
	} else {// 豆瓣广播
		$("img[src='" + aoReq.img_url + "']")
			.each(
			function () {
				console.log("find img element");
				var douban_uid = $(this).parents("div.status-item")
					.attr("data-uid");
				if ($(this).parents("div.new-status").find(
					"span.reshared_by")) {
					console.log("this is refresh");

				}
				retObj.author = douban_uid;
				link = $(this).parents("div.bd")
					.find("div.actions").children(
					"span.created_at").find("a").attr(
					"href");
				author = $(this).parents("div.mod")
					.find("div.text").children("a");
				if (author) {
					retObj.author = retObj.author + ","
						+ author.html();
				}
				if (!retObj.title) {
					retObj.title = $(this).parents(
						"div.status-item").find(
						"div.status-saying").text();
				}
				return;
			});// end
		// img[src='"+aoReq.img_url+"']").each(function(){
	}
	console.log("link:" + link);
	retObj.link = link;

	console.log("retObj:" + JSON.stringify(retObj));

	// throw new Error("just break");
	return retObj;

};

/**
 * weibo
 * @param {} aoReq 
 */
function get_weibo_detail_link__(aoReq) {
	var retObj = {};
	var imgUrl = aoReq.img_url.replace(/http:/g, "").replace(/https:/g, "");
	imgUrl = aoReq.img_url;
	switch (window.location.hostname) {
		case "photo.weibo.com": {
			console.log("under photo.weibo.com");
			$("img[src='" + imgUrl + "']").each(function(){
				console.log("页面中找到图片了：" + imgUrl);
				var m_photoItem=$(this).parents("div.F_cols_main");
				retObj.link=m_photoItem.find("p.time").find("a:eq(0)").attr("href");
				retObj.title=m_photoItem.find("p.desc").find("em").text();
				retObj.author=$("div.about").find("p.name").find("a").attr("title");
			});
			break;
		}
		default: {
			$("img[src='" + imgUrl + "']").each(
				function () {
					console.log("页面中找到图片了：" + imgUrl);
					var WB_feed_expand = $(this).parents("div.WB_feed_expand");
					if(!WB_feed_expand){
						 $(this).parents("div.WB_detail")
					}
					if (WB_feed_expand) {
						retObj.link = WB_feed_expand.find("a.S_txt2").attr("href");
						retObj.author = WB_feed_expand.find("div.WB_info")
							.find("a.S_txt1").attr("title");
						retObj.title = retObj.author
							+ "的微博:"
							+ WB_feed_expand.find("div.WB_text").text()
								.replace(/\n/g, "").replace(/^\s+/g, "")
								.replace(/\s+$/g, "");
						;
						console.log("WB_feed_expand link:" + retObj.link + " author:"
							+ retObj.author);
					}
					if (!retObj.link || !retObj.author) {
						console.log("ELSE  WB_feed_expand");
						retObj.link = $(this).parents("div.WB_detail").find("div.WB_from")
							.find("a[title]").attr("href");
						retObj.author = $(this).parents("div.WB_detail").find(
							"div.WB_info").find("a.W_f14").html();
						retObj.title = retObj.author
							+ "的微博:"
							+ $(this).parents("div.WB_detail").find(
								"div.WB_text").text().replace(/\n/g, "")
								.replace(/^\s+/g, "").replace(/\s+$/g, "");
					}
					return;
				});
		}//end default
	}//end swtich
	if (retObj.link.indexOf("http") < 0) {
		retObj.link = window.location.hostname + retObj.link;
	}
	console.log("retObj:" + JSON.stringify(retObj));
	return retObj;
};
window.get_weibo_detail_link = get_weibo_detail_link__;


/**
 * 获取虎扑页面。
 * 
 * hupu不允许跨域获取图片。。。。
 * 
 */
window.get_hupu_detail_link__ = function (aoReq) {
	console.log("get_twitter_detail_link img src:" + aoReq.img_url);
	var retObj = {};
	var link = window.location.href;
	retObj.link = link;
	retObj.author=window.location.hostname;
	retObj.title=document.title.replace(/^\(.*\)/g,"");
	console.log("retObj:" + JSON.stringify(retObj));
	return retObj;
}
window.get_hupu_detail_link=get_hupu_detail_link__;

window.get_twitter_detail_link = function (aoReq) {
	console.log("get_twitter_detail_link img src:" + aoReq.img_url);
	var retObj = {};
	var link = window.location.href;

	if (/\/.*?\/status\/\d+/.test(window.location.pathname)) {
		/**
		 * 当前页面的链接，就是twitter的详情页面，直接从URL中解析twitter的ID
		 */
		console.log("now is details link:" + window.location.pathname);
		link = window.location.href;
		retObj.author = "@" + window.location.pathname.substring(1, window.location.pathname.indexOf("/", 1));
	} else {
		/**
		 * 从页面DOM中解析。
		 */
		var answerBody = $("img[src='" + aoReq.img_url + "']").parents(
			"div.content");
		if (answerBody) {
			console.log("find the detail element");
			if (answerBody.find("small.time").find("a").attr("href")) {
				console.log("small.time.a.href");
				var tmpLink=answerBody.find("small.time").find("a").attr("href");
				if(tmpLink.indexOf("/")==0){
					link="https://twitter.com"+tmpLink;
				}else{
					link="https://twitter.com/"+tmpLink;
				}
				retObj.author = answerBody.find("span.username").first().text();
				retObj.title = retObj.author
					+ ":"
					+ answerBody.find("p.tweet-text").text().replace(/pic.*$/g,
						"");
			} else {
				console.log("permalink-header.username");
			}
		}
	}
	retObj.link = link;
	console.log("retObj:" + JSON.stringify(retObj));
	//throw new Error("xxxx");
	return retObj;
}
/**
 * 在 pinterest.com 下获取页面的链接
 */
function get_pinterest_detail_link_(aoReq) {
	var retObj = {};
	if (/\/pin\/.+/.test(window.location.pathname)) {//当前已经是详情页面
		console.log("already in detail page");
		var zm_item = $("img[src='" + aoReq.img_url + "']").parents("div._tjnr4");
		retObj.author = "";
		retObj.link = window.location.href;
		retObj.title = document.title;

	} else {
		var article = $("img[src='" + aoReq.img_url + "']").parents("div.pinLink pinImageWrapper");
		retObj.author = "";
		var tmpLink = article.children("a:eq(0)").attr("href");
		if (!tmpLink) {
			throw new Error("parse pinterest error");
		}
		retObj.link = window.location.origin + tmpLink;

	}
	return retObj;
}
window.get_pinterest_detail_link = get_pinterest_detail_link_;

/**
 * 解析instagram的页面。
 * 利用 srcset 模糊匹配，找到页面元素。
 */
window.get_instagram_detail_link = function (aoReq) {
	var retObj = {};
	if (/\/p\/.+/.test(window.location.pathname)) {
		console.log("already in detail page");
		var zm_item = $("img[srcset*='" + aoReq.img_url + "']").parents("article");
		retObj.author = zm_item.find("header:eq(0)").find("a[title]").text();
		retObj.link = window.location.href;
		retObj.title =// "instagram :#" + retObj.author +"# " + 
			document.title;

	} else {
		var article = $("img[srcset*='" + aoReq.img_url + "']").parents("article");
		retObj.author = article.find("header").find("div:eq(0)").find("a:eq(0)").text();
		//retObj.title = "instagram :#" + retObj.author + "#";
		var tmpLink = article.children("div:eq(1)").children("div:eq(1)").children("a:eq(0)").attr("href");
		if (!tmpLink) {
			throw new Error("parse instagram error");
		}
		retObj.link = window.location.origin + tmpLink;

	}
	retObj.pageUrl = retObj.link;
	console.log("retObj under instagram detail page : " + JSON.stringify(retObj));
	if (!retObj.author || retObj.author.length == 0 || !retObj.pageUrl) {
		throw new Error("parse instagram error");
	} else {
		return retObj;
	}
}
window.get_zhihu_answer_link = function (aoReq) {
	var retObj = {};
	console.log("get_zhihu_answer_link img src:" + aoReq.img_url);
	var link = window.location.href;
	if ("zhuanlan.zhihu.com" === window.location.hostname) {
		console.log("专栏详情页");
		retObj.link = link;
		retObj.title = document.title;
		return retObj;
	}
	var bHasFind = false;
	if ("/" == window.location.pathname) {
		console.log("知乎首页");
		var zm_item = $("img[src='" + aoReq.img_url + "']").parents("div.feed-item");
		retObj.title = zm_item.find("a.question_link").text();
		retObj.author = zm_item.find("span.author-link-line").find("a.author-link").text();
		retObj.link = window.location.hostname + zm_item.find("a.question_link").attr("href");
		console.log(" 知乎首页 retObj : " + JSON.stringify(retObj));
		return retObj;
	}
	if (/\/collection\/\d+/.test(window.location.pathname)) {
		console.log("知乎收藏栏");
		var zm_item = $("img[src='" + aoReq.img_url + "']").parents(".zm-item");
		retObj.title = zm_item.find("h2").find("a").text();
		retObj.author = zm_item.find("span.author-link-line").find("a.author-link").text();
		var tmpLink= zm_item.find("link[itemprop='url']").attr("href");
		if(tmpLink.indexOf("/")==0){
			tmpLink= window.location.hostname + tmpLink;
		}
		retObj.link = tmpLink;
		console.log("retObj under zhihu collect : " + JSON.stringify(retObj));
		return retObj;
	}

	if (/\/question\/\d+/.test(window.location.pathname)) {
		console.log("问题列表页面");
		var zm_item = $("img[src='" + aoReq.img_url + "']").parents("div.AnswerItem");
		retObj.title = document.title;
		retObj.author = zm_item.find("img.AuthorInfo-avatar").attr("alt");
		retObj.link = window.location.hostname + zm_item.find("div.ContentItem-time").find("a").attr("href");
		console.log("retObj under zhihu question answer : " + JSON.stringify(retObj));
		return retObj;
	}
	if (/\/people\/.+\//.test(window.location.pathname)) {
		console.log("个人动态页");
		var zm_item = $("img[src='" + aoReq.img_url + "']").parents("div.List-item");
		retObj.title = zm_item.find("h2.ContentItem-title").find("a").text();
		retObj.author = zm_item.find("span.AuthorInfo-name").find("a.UserLink-link").text();
		retObj.link = window.location.hostname + zm_item.find("h2.ContentItem-title").find("a").attr("href");
		console.log("retObj under zhihu collect : " + JSON.stringify(retObj));
		return retObj;
	}
};

window.get_src_link_log = function () {
	console.log("get_src_link.js @ 20160801181133");
}
