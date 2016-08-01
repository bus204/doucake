console.log("delete_comment.js");

var quick_delete_comment=function(){
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    console.log(targ.name);
    delete_comment(targ.name);
};

var delete_comment=function(cid){
        var formData = new FormData();
        formData.append("ck", getCookie('ck').replace(/\"/g, ""));
        formData.append("cid", cid);
        formData.append("reason", "other_reason");
        formData.append("other","");
        formData.append("submit","确定");

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("li#"+cid).fadeOut("slow");
        }
    };
        if(is_my_group_topic()){
            xhr.open('POST', window.location.pathname+"remove_comment?cid="+cid, true);
        }else{
            xhr.open('POST', "/j/group/topic/"+get_group_topic_id(window.location.pathname)+"/remove_comment?cid="+cid, true);
        }
        
        xhr.send(formData);
};

var quick_delete_comment_this_page=function(){
    if(!confirm("删除本页全部回复，所有删除掉的内容，都无法恢复，你确定要这样做吗？")){
        return;
    }
    console.log("准备删除本页全部回复");
    var all_length=$("div.operation_div").length;
    var index=0;
    $("div.operation_div").each(function(){
        delete_comment($(this).find("a[data-cid]").attr("data-cid"));
        index++;
        console.log(index+"::::"+all_length);
        if(index>=all_length){
            console.log("准备刷新");
            //window.location.reload();
            alert("本页删除完成，请刷新页面");
        }
    });
};


