window.get_douban_status_link=function(aoReq){
    var retObj={};
    var link=window.location.href;//+" "+aoReq.img_url;
    //link=link.replace(/http:\/\/www\./g,'');
    console.log(link);
    retObj.link=link;
    console.log("aoReq.albumid : "+aoReq.albumid);

    if(/^\/.*status\/\d+\/$/.test(window.location.pathname)){//豆瓣广播的详情页
        var douban_uid=$("div.status-item").attr("data-uid");
        retObj.author=douban_uid;
        author=$("div.text").children("a");
        if(author){
            retObj.author=retObj.author+","+author.html();
        }
    }else if(/^\/photos\/photo\//.test(window.location.pathname)){//豆瓣相册相片
        console.log("豆瓣相册相片");
        var _mod=$("div.mod-usercard");
        link=window.location.href;
        author=_mod.find("div.content").find("a");
        console.log("author.html:"+author.html());
        if(author && author.html()){
            var _href=author.attr("href")
            var douban_uid=_href.substring(0,_href.length-1);
            douban_uid=douban_uid.substring(douban_uid.lastIndexOf("/")+1);
            retObj.author=author.html()+","+douban_uid;
        }
        if(!retObj.title){
            retObj.title=document.title;
        }
        if($("div.photo_descri")){
            retObj.title+=",#漂亮的陌生人# "+$("div.photo_descri").text();
        }else  if($("span#display")){
            retObj.title=$("span#display").text();
        } 
        
        console.log(retObj);
    }else if(/^\/photos\/album\//.test(window.location.pathname)){//豆瓣相册页
        var _mod=$("div .info");
        link=window.location.href;
        author=_mod.find("a");
        console.log("author.html:"+author.html());
        if(author && author.html()){
            var _author=author.html().substring(0,author.html().indexOf("的主页"));
            var _href=author.attr("href");
            var douban_uid=_href.substring(0,_href.length-1);
            douban_uid=douban_uid.substring(douban_uid.lastIndexOf("/")+1);
            retObj.author=_author+","+douban_uid;
        }
        $("img[src='"+aoReq.img_url+"']").each(function(){
            console.log("find img element");
            link=$(this).parents("a").attr("href");
            retObj.link=link;
            return;
        });//end img[src='"+aoReq.img_url+"']").each(function(){

    }
    else if(/^\/group\/topic\/\d+\/$/.test(window.location.pathname)){//豆瓣小组的帖子
        console.log("group/topic");
        link=window.location.href;
        //找作者
        var author=$("div.topic-doc").find("span.from").children("a");
        if(author){
            retObj.author=author.html();
            var _href=author.attr("href")
            var douban_uid=_href.substring(0,_href.length-1);
            douban_uid=douban_uid.substring(douban_uid.lastIndexOf("/")+1);
            retObj.author=author.html()+","+douban_uid;
        }
        if(!retObj.title){
            retObj.title=" #漂亮的陌生人# "+document.title;
        }
    }else{//豆瓣广播
        $("img[src='"+aoReq.img_url+"']").each(function(){
            console.log("find img element");
            var douban_uid=$(this).parents("div.status-item").attr("data-uid");
            if($(this).parents("div.new-status").find("span.reshared_by")){
                console.log("this is refresh");
                
            }
            retObj.author=douban_uid;
            link=$(this).parents("div.bd").find("div.actions").children("span.created_at").find("a").attr("href");
            author=$(this).parents("div.mod").find("div.text").children("a");
            if(author){
                retObj.author=retObj.author+","+author.html();
            }
            return;
        });//end img[src='"+aoReq.img_url+"']").each(function(){
    }
    console.log("link:"+link);
    retObj.link=link;

    if(aoReq.albumid=="_test_selection"){
        //这里插入一点代码，来获取页面的dataUrl
        var aoParam={};
        aoParam.src=aoReq.img_url;
        downloadFirst(aoParam,function(param){
            console.log("get_douban_status_link,downloadFirst,callback");
            console.log(param);
            retObj=param;
            return retObj;
        });
    }else{
        return retObj;    
    }
};

window.get_weibo_detail_link=function(aoReq){
    var link=window.location.href;
    var author="";
    var title="";
    $("img[src='"+aoReq.img_url+"']").each(function(){
        console.log("不在微博详情页");
        var WB_feed_expand=$(this).parents("div.WB_feed_expand");
        if(WB_feed_expand){
            link=WB_feed_expand.find("a.S_txt2").attr("href");
            author=WB_feed_expand.find("div.WB_info").find("a.S_txt1").attr("title");
            console.log("WB_feed_expand link:"+link+" author:"+author);
        }
        if(!link || !author)
        {
            console.log("ELSE  WB_feed_expand");
            link=$(this).parents("div.WB_detail").find("div.WB_from").find("a[title]").attr("href");
            author=$(this).parents("div.WB_detail").find("div.WB_info").find("a.W_f14").html();
            title=author+"的微博:"+$(this).parents("div.WB_detail").find("div.WB_text").text();
        }
        return;
    });

    if(link.indexOf("http://")<0){
        link=window.location.hostname+link;
    }
    console.log("link:"+link);
    var retObj={};
    retObj.author=author;
    retObj.link=link;
    retObj.title=title;
    return retObj;
};

window.get_twitter_detail_link=function(aoReq){
    console.log("get_twitter_detail_link img src:"+aoReq.img_url);
    var retObj={};
    var link=window.location.href;
    var answerBody=$("img[src='"+aoReq.img_url+"']").parents("div.content");//.parent("div").parent("div");
    if(answerBody){
        console.log("find the detail element");
        link="https://twitter.com/"+answerBody.find("small.time").find("a").attr("href");
        retObj.author=answerBody.find("span.username").text();
    }
    retObj.link=link;
    return retObj;
}

window.get_zhihu_answer_link=function(aoReq){
    var retObj={};
    console.log("get_zhihu_answer_link img src:"+aoReq.img_url);
    var link=window.location.href;
    if("zhuanlan.zhihu.com"===window.location.hostname){
        console.log("专栏详情页");
        retObj.link=link;
        retObj.title=document.title;
        return retObj;
    }
    var bHasFind=false;
    var answerBody=$("img[src='"+aoReq.img_url+"']").parents(".zm-item-rich-text");//.parent("div").parent("div");
    if(answerBody){
        var dataEntryUrl=answerBody.attr("data-entry-url");
        console.log("data-entry-url "+dataEntryUrl);
        if(dataEntryUrl){
            console.log("try to find author");
            link=dataEntryUrl;
            if(0==link.indexOf("/")){
                link=window.location.hostname+link;
            }        
            retObj.link=link;
            retObj.author=answerBody.attr("data-author-name");
            if(!retObj.author){
                var author=answerBody.parent().find("a.author-link");
                if(author){
                    retObj.author=author.html();
                }
            }
            retObj.title=answerBody.parents("div .feed-main").find("h2").find("a").text();
            console.log(retObj);
            return retObj;    
        }
    }
    answerBody=$("img[src='"+aoReq.img_url+"']").parents(".ContentItem");
    if(answerBody){
        console.log("img .parents.ContentItem");
        link=answerBody.children(".ContentItem-title").children("a").attr("href");
        if(link){
            if(0==link.indexOf("/")){
                link=window.location.hostname+link;
            }
            retObj.link=link;
        }
        var authorElem=answerBody.find("div .AuthorInfo-name").find("a.UserLink-link");
        retObj.author=authorElem.text();    
        return retObj;
    }
};



window.get_src_link_log=function(){
        console.log("get_src_link.js @ 20160801181133");    
}
