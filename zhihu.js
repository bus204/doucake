var save2pocket=function(phref,ptitle){
    if(true){
        return ;
    }
		var e=function(t,n,r,i,s){
			var o=[5506913,3697640,4383574,1585008,3421956,7350036,2069329,1946920,1123705,9134632];
			var i=i||0,u=0,n=n||[],r=r||0,s=s||0;
			var a={'a':97,'b':98,'c':99,'d':100,'e':101,'f':102,'g':103,'h':104,'i':105,'j':106,'k':107,'l':108,'m':109,'n':110,'o':111,'p':112,'q':113,'r':114,'s':115,'t':116,'u':117,'v':118,'w':119,'x':120,'y':121,'z':122,'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,'V':86,'W':87,'X':88,'Y':89,'Z':90,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'\/':47,':':58,'?':63,'=':61,'-':45,'_':95,'&':38,'$':36,'!':33,'.':46};
			if(!s||s==0){t=o[0]+t}for(var f=0;f<t.length;f++){var l=function(e,t){return a[e[t]]?a[e[t]]:e.charCodeAt(t)}(t,f);if(!l*1)l=3;
			var c=l*(o[i]+l*o[u%o.length]);n[r]=(n[r]?n[r]+c:c)+s+u;var p=c%(50*1);
			if(n[p]){var d=n[r];n[r]=n[p];n[p]=d}u+=c;r=r==50?0:r+1;i=i==o.length-1?0:i+1}
			if(s==291){var v='';for(var f=0;f<n.length;f++){v+=String.fromCharCode(n[f]%(25*1)+97)}
			o=function(){};return v+'f97909db5a'}else{return e(u+'',n,r,i,s+1)}
		};//end e=function
		var t=document,n=phref,r=ptitle;var i=e(n);
		var s=t.createElement('script');
		s.type='text/javascript';
		s.src='https://getpocket.com/b/r4.js?h='+i+'&u='+encodeURIComponent(n);//+'&t='+encodeURIComponent(r);
		e=i=function(){};
		console.log("save2pocket");
	    //添加到收藏夹
	    $.get(s.src
	    , function(data,status) {
	        console.log("pocket success");
	        eval(data);
	    }).fail(function(){
	        console.log("pocket failed");
	    });
}
/*
chrome.webRequest.onBeforeSendHeaders.addListner(
    function(details){
        console.log(details);
    }
);
*/
//setTimeout(function(){var e=new PKT_BM;e.th="";e.init();e.save()},1)
console.log("ganxious.zhihu. Started");

function getCookie(c_name)
{
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start === -1)
    {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start === -1)
    {
        c_value = null;
    }
    else
    {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end === -1)
        {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}


function HelloZhihu() {
    console.log("hello zhihu 2013年7月21日 12:30:11");
}
/*
 * 一些全局变量，方便使用。
 输入中文
 */

var newButton;
var prevButton;
var nextButton;
var shuffleButton;
var foldButton;
var gbody = document.getElementsByTagName("body")[0];
//保存用来作为“我的感谢”收藏夹的ID
var gThanksFavId = "";
var gThanksFavName = "我的感谢";
var gFavList = [];

function CreateButton(sName, parentNode) {
    var b = document.createElement("div");
    b.innerHTML = "fold";
    b.id = sName;
    b.style = "cursor:pointer";
    parentNode.appendChild(b);
    return b;
}

//为页面元素增加按钮
function AddButton() {
    ImportCSS();
    newButton = document.createElement("div");
    newButton.id = "gototop";
    //上一个
    prevButton = document.createElement("div");
    prevButton.innerHTML = "prev";
    newButton.appendChild(prevButton);
    //下一个
    nextButton = document.createElement("div");
    nextButton.innerHTML = "next";
    newButton.appendChild(nextButton);
    //随机看看
    shuffleButton = document.createElement("div");
    shuffleButton.innerHTML = "shuffle";
    newButton.appendChild(shuffleButton);
    //收起已经打开的答案
    foldButton = CreateButton("fold", newButton);

    //gbody.insertBefore(newButton,gbody.childNodes[0]);
    gbody.appendChild(newButton);

}
//导入CSS
function ImportCSS() {
    var jqueryScriptBlock = document.createElement('style');
    jqueryScriptBlock.type = 'text/css';
    jqueryScriptBlock.innerHTML = "#gototop{position:fixed;z-index:19;bottom:225px;right:1px;border:1px solid gray;padding:3px;width:48px;font-size:12px;cursor:pointer;border-radius: 3px;text-shadow: 1px 1px 3px #676767;}";
    jqueryScriptBlock.innerHTML += "#gototop div{cursor:pointer;}";

    jqueryScriptBlock.innerHTML += "#collect_index{position:fixed;z-index:19;top:95px;left:1px;border:1px solid gray;padding:3px;width:155px;font-size:12px;cursor:pointer;border-radius: 3px;text-shadow: 1px 1px 3px #676767;overflow:auto;height:550px;}";
    jqueryScriptBlock.innerHTML += "#collect_index div{cursor:pointer;}";

    document.getElementsByTagName('head')[0].appendChild(jqueryScriptBlock);
}



//定义按钮的行为函数
/*
 * 随机的查看一个问题。
 在实现中，调用 http://www.zhihu.com/question/random，该接口会返回一个302的重定向，自动引导浏览器进行跳转。
 但是这个URL的响应速度比较坑爹。
 所以在请求之前，先展示一个loading，然后再发起请求。
 */
var g_zhihu_random = "http://www.zhihu.com/question/random";
var fShuffle = function() {
    shuffleButton.innerHTML = "LOADING......";
    window.location.href = g_zhihu_random;
};

var fFoldExpandedAnswer = function() {
    $(".collapse.meta-item.zg-right").each(function() {
        //$("a[href='collaps']").each(function(){
        $(this)[0].click();
    });
    //fold comment
    $("div[class=zm-comment-box]").hide();
};
/*
 * 为按钮绑定事件
 */
var AddEvent = function() {
    //随便看看
    shuffleButton.addEventListener('click', fShuffle);
    /*
     仅在问题的详情页中可以使用上一个/下一个按钮
     在收藏页也使用prev next
     */
    //if(/\/question\/.*/.test(window.location.pathname)
    //|| /\/collection\/.*/.test(window.location.pathname)
    //){
    nextButton.addEventListener('click', fNextAnswer);
    prevButton.addEventListener('click', fPrevAnswer);
    console.log("next & prev attached");
    //}else{
    //仅在首页可以使用折叠
    foldButton.addEventListener('click', fFoldExpandedAnswer);
    console.log("fFoldExpandedAnswer attached");
    //}
    //监听用户对“收藏”的点击。
    $("i.z-icon-thank").each(function(){
        console.log($(this).parent().html());
        $(this).parent()[0].addEventListener("click",fThanksAndFav);
    });

    $("a.copyright").each(function(){
        console.log($(this).html());
        $(this).html("福利满满");
        $(this).attr("href","#");
        $(this)[0].addEventListener("click",fAdd1024Fav);
    });
    console.log("AddEvent");
};

var getNextAnchorName = function(offset) {
    //默认的问题答案
    var defaultAnswer = window.location.hash;
    console.log("default hash:" + defaultAnswer);
    //页面中，答案的锚点队列
    var anchorArray = $("button[aria-owns]");

    console.log("target answer array length:" + anchorArray.length);
    if (0 === anchorArray.length) {
        return "";
    }
    ;
    //获取当前锚点在anchorArray中的index
    var index = 0;
    for (index = 0; index < anchorArray.length; index++) {
        console.log(
                "INDEX:" + index//
                + " name:"//
                + anchorArray.get(index).getAttribute("id")
                );//end console
        if (defaultAnswer === "#"+anchorArray.get(index).getAttribute("id")) {
            break;
        }
    }
    console.log("current index:" + index);

    var nextAns = "";
    if (index < anchorArray.length && index + offset < anchorArray.length && index + offset > 0) {
        nextAns = anchorArray.get(index + offset).getAttribute("id");
    } else {
        nextAns = anchorArray.get(0).getAttribute("id");
    }
    console.log("next index:" + nextAns);
    window.location.href = window.location.pathname + window.location.search + "#" + nextAns;
    $("button[id='" + nextAns + "']")[0].scrollIntoView();
};

/**
 * 在单独的一个回答详情页里面，自动定位到下一个回答的详情。 
 */
var fNextAnswer = function() {
    //根据answerid找到下一个
    try {
        //var nextAnchor=
        getNextAnchorName(1);
        //console.log("next answerid:"+nextAnchor);
        // window.location.href =window.location.pathname+window.location.search+"#"+nextAnchor;
        //$("a[name="+nextAnchor+"]").scrollTop(30);
    } catch (err) {
        console.log(err);
    }
};

var fPrevAnswer = function() {
    //根据answerid找到下一个
    try {
        //var nextAnchor=
        getNextAnchorName(-1);
        //console.log("next answerid:"+nextAnchor);
        //window.location.href =window.location.pathname+"#"+nextAnchor;
        //$("a[name="+nextAnchor+"]").scrollTop(30);
    } catch (err) {
        console.log(err);
    }
};
/**
 * 判断当前是否在知乎首页
 * @returns {undefined}
 */
var bIfAtIndex=function(){
    
};
var fAdd2Fav=function(obj){
    console.log("点击了:" + obj.html());
    console.log("点击了:" + obj.attr("class"));
    //获取对应的答案ID
    var aid = "";
    var token="";

    if("/"==window.location.pathname){
        aid=obj.parents("div.feed-content").children("meta[itemprop=\"answer-id\"]").attr("content");        
    }else{
        obj.parents().each(function(){
           console.log(obj.attr("class")+": data-aid---"+obj.attr("data-aid"));
        });
        aid = obj.parents("[data-aid]").attr("data-aid");
        token=obj.parents("[data-atoken]").attr("data-atoken");
    }
    
    if("undefined" === aid || aid === undefined){
        console.log("get aid in second way");
         aid = obj.parents("div.content").children("div.entry-body").attr("data-aid");
         token = obj.parents("div.content").children("div.entry-body").attr("data-atoken");
    }
    
    
    console.log("点击了 答案:" + aid);
    console.log("gThanksFavId:" + gThanksFavId);
    console.log("token:" + token);

    //如果点击的是感谢
    //如果gThanksFavId这个字段为空，那么就获取对应的收藏夹ID
    if ("" === gThanksFavId) {
        fGetThanksFavId(aid,obj);
        return;
    }
    console.log(gThanksFavName + "ID:" + gThanksFavId + ",aid:" + aid);
    if ("" !== gThanksFavId && "undefined" !== gThanksFavId && gThanksFavId && gThanksFavId !== undefined) {
        fAdd2ThanksFav(aid,obj);
    } else {
        console.log("收藏夹" + gThanksFavName + "不存在");
    }
}
var fAdd1024Fav=function(){
    gThanksFavId="";
    gThanksFavName="福利满满"
    fAdd2Fav($(this));
}
//监听对 操作栏 按钮的点击
var fThanksAndFav = function() {
    if($(this).children("i").length<1){
        return;
    }
    gThanksFavId="";
    gThanksFavName="我的感谢";
    fAdd2Fav($(this));
};
/**
 * 把答案ID添加到收藏夹中
 * @param {type} aid
 * @param {type} obj 「感谢」的jquery对象。
 * @returns {undefined}
 */
var fAdd2ThanksFav = function(aid,obj) {
    //添加到收藏夹
    $.post("/collection/add", {
        "answer_id": aid
        , "favlist_id": gThanksFavId
        , "_xsrf": getCookie('_xsrf')
    }, function() {
        console.log("收藏夹添加成功");
        obj.html(obj.html()+"&nbsp;收藏成功");
    }).fail(function(){
        console.log("收藏夹添加失败");
        obj.html("收藏失败");
    });
};

//获取gThanksFavName对应的收藏夹ID
var fGetThanksFavId = function(aid,obj) {
    console.log("gFavList.length:" + gFavList.length);
    if (gFavList.length === 0) {
        fGetFavList(aid,obj);
    } else {
        for (var fav in gFavList) {
            if (gFavList[fav].length !== 0) {
                var oneFav = gFavList[fav];
                console.log("收藏夹：" + oneFav[0] + ":" + oneFav[1] + " fav:" + fav);
                if (gThanksFavName === oneFav[1]) {
                    gThanksFavId = oneFav[0];
                    fAdd2ThanksFav(aid,obj);
                    return;
                }
            }
        }
        gThanksFavId = "";
    }
};
/**
 * 获取收藏夹列表
 * @param {type} aid
 * @returns {undefined}
 */
var fGetFavList = function(aid,obj) {
    console.log("fGetFavList answer-id:" + aid);
    $.getJSON("/collections/json", {"answer_id": aid}, function(json) {
        if (0 === json.r) {
            gFavList = json.msg[0];
            fGetThanksFavId(aid,obj);
        }
    });
};

/**
 如果是在 我关注的收藏夹 的首页，那么修改这些收藏夹的链接，追加参数，可以跳转后提供
 未读的数量。
 */
var alterCollectLink = function() {
    if (!/.*www.zhihu.com\/collections.*/.test(window.location.href)) {
        console.log("Not In Collections Index");
    }
    $("h2.zm-item-title").each(function() {
        var zg_num = parseInt($(this).children("span:eq(0)").html(), 10);
        //console.log("zg-num:"+zg_num);
        if (zg_num > 0) {
            $(this).children("a").each(function() {
                var old = ($(this).attr("href"));
                $(this).attr("href", $(this).attr("href") + "?zgnum=" + zg_num);
            });
        }
    });
};

/*
 在收藏页中，在页面的左侧悬浮收藏夹导引栏
 */
var show_collect_guide = function() {
    /*
     打开了具体的收藏页
     */
    if (!
        /.*www.zhihu.com\/collection\/[0-9]+.*/.test(window.location.href)
        ) {
        return;
    }
    var collectIndexDiv = document.createElement("div");
    collectIndexDiv.id = "collect_index";

    gbody.appendChild(collectIndexDiv);
    //$("div.zg-wrap.zu-main")[0].appendChild(collectIndexDiv);
    var guideHtml = "<table>";
    $(".zm-item").each(function() {

        $(this).find("h2.zm-item-title:eq(0)").each(function() {
            guideHtml += "<tr><td title='" + $(this).children("a:eq(0)").html() + "'>" + $(this).children("a:eq(0)").html().substring(0, 9) + "...</td></tr>";
        });
        //$(this).attr("name","item-"+$(this).find("div.zm-item-answer").attr("data-aid"));
        //$(this).prepend("<a href='' name='item-"+$(this).find("div.zm-item-answer").attr("data-aid")+"'");
        $(this).find("div.zm-item-answer").each(function() {
            var id = "answer-" + $(this).attr("data-aid");
            var linkName = $(this).find("h3.zm-item-answer-author-wrap:eq(0)").children("a:eq(1)").html();
            if (undefined === linkName) {
                linkName = "匿名用户";
            }
            guideHtml += "<tr><td id='guild_" + $(this).attr("data-aid") + "'><a href='" + window.location.pathname + window.location.search + "#" + id + "'>" + linkName + "</a></td></tr>";
        });
    });

    guideHtml += "</table>";
    collectIndexDiv.innerHTML = guideHtml;
    /*
     把收藏页的右侧隐藏掉，没啥用
     */
    //$("div.zu-main-sidebar").hide();
    //collectIndexDiv.className="zu-main-sidebar";
};

if ("www.zhihu.com" === (window.location.host)) {
    HelloZhihu();
    AddButton();
    AddEvent();
    alterCollectLink();
    show_collect_guide();
}