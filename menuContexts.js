/*
 * http://open.chrome.360.cn/html/dev_messaging.html
 * 扩展之间传递消息。
 */

var _douban_guangbo="DOUBAN_GUANGBO";

function test_selection(info,tab){
  console.log("test_selection");
  console.log("info.selectionText : "+info.selectionText);
  console.log(document.getSelection());
  console.log(document.getSelection().toString());

    chrome.tabs.sendRequest(
        tab.id,
        {
            method:"call_get_selection_html"
            ,img_url:info.srcUrl
            ,pageUrl:info.pageUrl
        }
        ,function(response){
            console.log("call_get_selection_html callback");
            console.log(response);
        }
    );
}

/*
 * 
 * @param {type} info
 * @param {type} tab
 * @returns {undefined}
 */
function saveImg(info, tab){
    console.log("info");
    console.log(info);
    console.log("tab");
    console.log(tab);
    console.log("srcUrl :"+info.srcUrl );
    console.log("pageUrl :"+info.pageUrl );
    console.log("title:"+tab.title);
    ;
   var a=document.createElement('a'); 
   a.href=info.pageUrl;
   console.log(a);
   console.log(a.hostname);
   if(!/.*zhihu.com/.test(a.hostname)
   &&!/.*weibo.com/.test(a.hostname)
   &&!/www.douban.com/.test(a.hostname)
    ){
       open_up_load_page(info,tab);
       return;
   }
    chrome.tabs.sendRequest(
        tab.id,
        {
            method:"call_get_src_url"
            ,img_url:info.srcUrl
            ,pageUrl:info.pageUrl
            ,albumid:info.menuItemId
        }
        ,function(response){
            console.log("sendRequest callback");
            console.log(response);
            if(_douban_guangbo==info.menuItemId){
              //发广播
              open_douban_guangbo_page(info,tab,response);
            }else{
              open_up_load_page(info,tab,response);
            }
        }
    );
    
};

var open_douban_guangbo_page=function(info,tab,response){
    var img_src_url=info.srcUrl.replace(/http:/g,"https:");
    var url="https://www.douban.com/";
    url=url+"?auto_upload=true"//            
            +"&img_url="+encodeURIComponent(img_src_url)
            +"&title="+encodeURIComponent(tab.title)
            +"&album="+encodeURIComponent(info.menuItemId);
            if(response && response.pageUrl){
                url=url+"&src_url="+encodeURIComponent((response.pageUrl.indexOf("http")==0?"":"https://")+response.pageUrl);
            }else{
                url=url+"&src_url="+encodeURIComponent((info.pageUrl.indexOf("http")==0?"":"https://")+info.pageUrl);
            }
            
            chrome.tabs.create({"url":url, "active": false}); 
}

var open_up_load_page=function(info,tab,response){

    var img_src_url=info.srcUrl.replace(/http:/g,"https:");
    
    var pageUrl="";
    if(response && response.pageUrl){
        pageUrl=((response.pageUrl.indexOf("http")==0?"":"https://")+response.pageUrl);
    }else{
        pageUrl=((info.pageUrl.indexOf("http")==0?"":"https://")+info.pageUrl);
    }
    if(-1!=img_src_url.indexOf('/thumb/')){
        img_src_url=img_src_url.replace(/thumb/g,"photo");
        try{
            var myArr=/.*\/p(\d+).*/.exec(img_src_url);
            if(myArr && myArr.length>0){
                pageUrl="www.douban.com/photos/photo/"+myArr[1]+"/";
            }
        }catch(e){}
    }
    var url="https://www.douban.com/photos/album/"+encodeURIComponent(info.menuItemId)+"/upload";
    url=url+"?auto_upload=true"//            
            +"&img_url="+encodeURIComponent(img_src_url)
            +"&title="+encodeURIComponent(tab.title)
            +"&album="+encodeURIComponent(info.menuItemId);
    url=url+"&src_url="+encodeURIComponent(pageUrl);
    if(response && response.author){
      //把名字中的空格替换掉。
      url=url+"&author="+encodeURIComponent(response.author.replace(/\s+/g,""));  
    }
    
    chrome.tabs.create({"url":url, "active": false}); 
};


var requestFileSystemErrHandler=function(){
    console.log("requestFileSystemErrHandler");
};


function openUrlWindow(info, tab) {

     var url = info['linkUrl'];

     url =  getQueryString(url, 'url');

     chrome.tabs.create({"url":url, "active": false});

};



function getQueryString(url, name) {

    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");

    var r = url.match(reg);

    if (r !== null) return unescape(r[2]); return null;

};




var album_list=null;
var attach_album_list = function() {
    chrome.contextMenus.removeAll();
    /*
     * 增加页面上的右键菜单
     */
    var pid = chrome.contextMenus.create({
        "title": "保存到豆瓣",
        "contexts": ["image","selection"]
    }
    , function() {
        console.log("chrome.contextMenus.create");
    }
    );
    console.log(window.localStorage.getItem("album_list"));
    var tmp = "album_list=" + window.localStorage.getItem("album_list");
    eval(tmp);
    console.log(JSON.stringify(album_list));
      /*
      在第一个位置上，插入一个按钮，发豆瓣广播。
      */
      chrome.contextMenus.create(
              {
                  "title": "发 豆瓣广播"
                  , "contexts": ["image"]
                  , "onclick": saveImg
                  , "parentId": pid
                  , "id": _douban_guangbo
              }
      );
      chrome.contextMenus.create(
              {
                  "title": "测试用的"
                  , "contexts": ["image","selection"]
                  , "onclick": saveImg
                  , "parentId": pid
                  , "id": "_test_selection"
              }
      );
    for (var a in album_list) {
        chrome.contextMenus.create(
                {
                    "title": "保存图片到 " + album_list[a].name
                    , "contexts": ["image"]
                    , "onclick": saveImg
                    , "parentId": pid
                    , "id": album_list[a].id
                }
        );
    }//end for
};//end attach_album_list

attach_album_list();
/*
 * 监听外部的查询和添加
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
          "from a content script:" + sender.tab.url :
          "from the extension");
          if("douban_is_in_context"===request.method){
              douban_is_in_context(request, sender, sendResponse);
          }
          if("rm_from_right_menu"===request.method){
              rm_from_right_menu(request, sender, sendResponse);
          }
          if("add_to_right_menu"===request.method){
              add_to_right_menu(request, sender, sendResponse);
          }
          if("get_all_right_menu"===request.method){
              get_all_right_menu(request, sender, sendResponse);
          }
          if("group_is_in_fav"===request.method){
             group_is_in_fav(request, sender, sendResponse); 
          }
          if("add_group_to_fav"===request.method){
             add_group_to_fav(request, sender, sendResponse); 
          }
          if("rm_group_from_fav"===request.method){
             rm_group_from_fav(request, sender, sendResponse); 
          }
          
          if("group_fav_list"===request.method){
             group_fav_list_func(request, sender, sendResponse); 
          }
    }
);
var group_fav_list=new Array();
var group_fav_list_func=function(request, sender, sendResponse){
    console.log("group_fav_list : "+JSON.stringify(request)); 
    var item=null;
    console.log("getItem :"+window.localStorage.getItem("group_fav_list"));
    var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
    eval(tmp);
    console.log(JSON.stringify(group_fav_list));
    sendResponse(group_fav_list);
}

var group_is_in_fav=function(request, sender, sendResponse){
    console.log("group_is_in_fav : "+JSON.stringify(request)); 
    var item=null;
    //if(group_fav_list.length==0){
        console.log("getItem :"+window.localStorage.getItem("group_fav_list"));
        var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
        eval(tmp);
        console.log(JSON.stringify(group_fav_list));
    //}
    for(var i in group_fav_list){
        if(group_fav_list[i].group_id===request.group_id){
          item=group_fav_list[i];
          break; 
        }
    }
    console.log("group_is_in_fav sendResponse: "+JSON.stringify(item)); 
    sendResponse(item);
}

var rm_group_from_fav=function(request, sender, sendResponse){
    console.log("rm_group_from_fav : "+JSON.stringify(request)); 
    var item=null;
    //if(group_fav_list.length==0){
        console.log("getItem :"+window.localStorage.getItem("group_fav_list"));
        var tmp = "group_fav_list=" + window.localStorage.getItem("group_fav_list");
        eval(tmp);
        console.log(JSON.stringify(group_fav_list));
    //}
    for(var i in group_fav_list){
        if(group_fav_list[i].group_id===request.group_id){
          group_fav_list.splice(i,1);
        }
    }
    window.localStorage.setItem("group_fav_list",JSON.stringify(group_fav_list));
    console.log(JSON.stringify(group_fav_list));
    sendResponse();
}

var add_group_to_fav=function(request, sender, sendResponse){
    console.log(request);
    var item=null;
    if(!group_fav_list){
      group_fav_list=new Array();
    }
    group_fav_list.push({"group_id":request.group_id,"group_icon":request.group_icon});
    sendResponse(item);
    window.localStorage.setItem("group_fav_list",JSON.stringify(group_fav_list));
    console.log(JSON.stringify(group_fav_list));
    sendResponse();
}

var douban_is_in_context=function(request, sender, sendResponse){
    console.log(request);
    var album_item=null;
    for(var i in album_list){
        if(album_list[i].id===request.albumid){
            album_item=album_list[i];
           break; 
        }
    }
    sendResponse(album_item);
};

var rm_from_right_menu=function(request, sender, sendResponse){
    console.log(request);
    for(var i in album_list){
        if(album_list[i].id===request.albumid){
           album_list.splice(i,1);
           window.localStorage.setItem("album_list",JSON.stringify(album_list));
           console.log(JSON.stringify(album_list));
           break; 
        }
    }
    attach_album_list();
    sendResponse();
};

var add_to_right_menu=function(request, sender, sendResponse){
    if(album_list===null){
        album_list=new Array();
    }
    album_list.push({"id":request.albumid,"name":request.name});
    window.localStorage.setItem("album_list",JSON.stringify(album_list));
    console.log(JSON.stringify(album_list));
    attach_album_list();
    sendResponse();
};

var get_all_right_menu=function(request, sender, sendResponse){
    if(album_list===null){
        album_list=new Array();
    }
    sendResponse(album_list);
}