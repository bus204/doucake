
function filterEmoji(text){
    var ranges = [
            '\ud83c[\udf00-\udfff]', 
            '\ud83d[\udc00-\ude4f]', 
            '\ud83d[\ude80-\udeff]'
        ];
    return text.replace(new RegExp(ranges.join('|'), 'g'), '?');
}

var is_photos_album_upload=function(pathname){
        console.log("is_photos_album_upload:"+pathname);
        return (/\/photos\/album\/[\d+]\/upload/.test(pathname)  || /\//.test(pathname))&& gQueryParam["src_url"] && "true"===gQueryParam["auto_upload"];
};

var gQueryParam = parseQueryString(window.location.search);
var is_post_douban_sns=function(album){
	if(!album){
		return false;
	}
	return album.indexOf("%23")==0;
}
/*
 本地文件系统对象
 */
var g_fs = null;

var gFileSize=(1024*1024);
var vImageType="image/jpg";

var fileEntryFileError = function(e) {
    console.log('fileEntryFileError failed [name:' + e.name + "][message:" + e.message + "]");
    errorHandler(e);
};

var writeFile = function(fileEntry) {

    fileEntry.createWriter(function(writer) {

        writer.onwrite = function(e) {
        };
        writer.onerror = function(e) {
        };

        var blob = new Blob([xhr.response], {type: 'image/jpg'});

        writer.write(blob);

    }, writeFileErrorHandler);
};

/*
 从asPath中，得到文件名
 */
var getFileName = function(asPath) {
    console.log("asPath:" + asPath);
    var pieces = asPath.split("/");
    var fname = pieces[pieces.length - 1];
    if(fname.indexOf('?')>-1){
    	fname=fname.substring(0,fname.indexOf('?'));
    }
    console.log("fname:" + fname);
    
    return fname;
};

var updateLoadPicErrorHandler = function(e) {
    console.log(e);
    console.log('Open file system failed [name:' + e.name + "][message:" + e.message + "]");
    errorHandler(e);
};
var writeFileErrorHandler = function(e) {
    console.log('Open file system failed [name:' + e.name + "][message:" + e.message + "]");
    errorHandler(e);
};
var getFileErrorHandler = function(e) {
    console.log('Open file system failed [name:' + e.name + "][message:" + e.message + "]");
    errorHandler(e);
};
var requestFileSystemErrHandler = function(e) {
    console.log('Open file system failed [name:' + e.name + "][message:" + e.message + "]");
    errorHandler(e);
};
/*
 文件系统请求失败的回调函数
 */
var errorHandler = function(e) {
    console.log('Open file system failed [name:' + e.name + "][message:" + e.message + "]");
    throw e;
};
/*
 启动下载，下载成功后，做上传。
 */
window.downloadFirst = function(aoParam,cb_func) {
    var asUrl = aoParam.src;

    console.log('downloadFirst src:' + asUrl);
    //默认的图片格式。
    vImageType=asUrl.substring(0,asUrl.indexOf('?'));
    vImageType=vImageType.substring(vImageType.lastIndexOf('.')+1);
    if(vImageType.length!=0){
    	vImageType="image/"+vImageType;
    }
    console.log("vImageType:"+vImageType);


    var xhr = new XMLHttpRequest();
    xhr.open('GET', asUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        console.log('xhr.onload');
        window.requestFileSystem(window.TEMPORARY, gFileSize, function(fs) {
            g_fs = fs;
            var fileName = getFileName(asUrl);

            console.log("fileName:" + fileName);
            fs.root.getFile(fileName, {create: true}, function(fileEntry) {

                console.log("getFile");
                fileEntry.createWriter(function(writer) {

                    writer.onwrite = function(e) {
                    };
                    writer.onerror = function(e) {
                    };

                    var blob = new Blob([xhr.response], {type: vImageType});

                    writer.write(blob);
                    console.log("save pics success,begin to upload");
                    var uploadParam = aoParam;
                    uploadParam.fileName = fileName;
                    if(cb_func){
                        var fr=new FileReader();
                        fr.onload=function(e){
                            //console.log(e);
                            //console.log(e.target.result);
                            uploadParam.dataURL=e.target.result;
                            //console.log(uploadParam);
                            cb_func(uploadParam);
                        };
                        fr.readAsDataURL(blob);
                    }else{
                        uploadPic(uploadParam);    
                    }
                }, writeFileErrorHandler);
            }, getFileErrorHandler);

        }, requestFileSystemErrHandler);
    };

    xhr.send();
};
/*
 把指定的图片，上传到指定的相册中。
 aoUploadParam.fileName 目标文件名
 */
window.uploadPic = function(aoUploadParam) {
    var asFileName = aoUploadParam.fileName;
    console.log("uploadFile:" + asFileName);
    window.requestFileSystem(window.TEMPORARY, gFileSize, function(fs) {
    console.log("requestFileSystem success");
    fs.root.getFile(
            asFileName//
            , {}//
    , function(fileEntry) {
        console.log("function(fileEntry)");
        fileEntry.file(function(file) {
            console.log("fileEntry.file");
            var formData = new FormData();

            console.log('fileReader.onloadend');
            var xhr = new XMLHttpRequest();
            var targetUrl="https://www.douban.com/j/photos/addphoto_draft";
            if(is_post_douban_sns(gQueryParam.album)){
				targetUrl='https://www.douban.com/j/upload';
            }
            
           	xhr.open('POST', targetUrl, true);	
            console.log('open addphoto_draft targetUrl:'+targetUrl);

            xhr.multipart = true;
            if(is_post_douban_sns(gQueryParam.album)){
            	var fileBlob = new Blob(
	                    [file]
	                    , {
	                               type: vImageType
	                               , filename: asFileName
	            });
	            formData.append("image", fileBlob);
	            formData.append("category", "photo");
            }else{
	            var fileBlob = new Blob(
	                    [file]
	                    , {
	                               type: vImageType
	                               , name: "1.jpg"//file.name.replace(/^[a-zA-Z0-9]/g,"0")
	            });
	            formData.append("file", fileBlob);
	            formData.append("category", "photo");
            	formData.append("albumid", goParam.album);
            }
            formData.append("ck", goParam.ck);
            formData.append("upload_auth_token", goParam.token);

            xhr.load = function(e) {
                console.log("xhr.port2addphoto_draft:" + e);
            };

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {//服务器正常响应
                        console.log("var picObj=" + xhr.responseText + "");
                        eval("var picObj=" + xhr.responseText + "");
                        console.log(picObj.r);
                        if (picObj.r!='0' && !picObj.id) {
                            //文件上传失败，要重试
                            console.log("上传失败，不重试");
                            return;
                        }
                        aoUploadParam.id=picObj.id;
                        aoUploadParam.url=picObj.url;
                        if(is_post_douban_sns(gQueryParam.album)){
                        	post_guangbo(aoUploadParam);
                        }else{
                            console.log("aoUploadParam:"+aoUploadParam);
                        	add_desc_save(aoUploadParam);		
                            console.log("aoUploadParam:"+aoUploadParam);
                        }
                        
                        
                    } else {//服务器无正常响应，重试
                        console.log("xhr.status:" + xhr.status + " 暂时 不 重试");
                        //uploadPic(aoUploadParam);
                        return;
                    }
                } else {
                    console.log("xhr.readyState:" + xhr.readyState);
                }
            };

            xhr.send(formData);
        }, fileEntryFileError);
    }//
    , updateLoadPicErrorHandler//
            );//end getFile
    });
    console.log("upload pic");
};


window.post_guangbo=function(aoUploadParam){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.douban.com/', true);
    xhr.multipart = true;
    var formData = new FormData();
    formData.append("uploaded", aoUploadParam.url);
    formData.append("ck", goParam.ck);
    formData.append("comment", decodeURIComponent(gQueryParam["src_url"]).replace(/#.*/g,"")+" "+decodeURIComponent(gQueryParam["title"]));
    console.log("------");
    console.log(formData);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {//服务器正常响应
            	window.location.href="https://www.douban.com/";
            } else {//服务器无正常响应，重试
                console.log("post_guangbo xhr.status:" + xhr.status + " 重试");
                return;
            }
        } else {
            console.log("post_guangbo xhr.readyState:" + xhr.readyState);
        }
    };
    xhr.send(formData);
}

/*
 * 从浏览器的文件系统中读取图片文件，然后上传。
 * @param {type} file
 * @returns {undefined}
 */
window.fileEntryFile = function(file) {
    //var formData = new FormData(document.getElementById('uploader-form'));
    var formData = new FormData();
    var fileReader = new FileReader();

    console.log('fileReader.onloadend');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.douban.com/j/photos/addphoto_draft', true);
    console.log('open addphoto_draft');

    xhr.multipart = true;
    var fileBlob = new Blob([file], {type: "image/jpeg", name: file.name});
    formData.append("file", fileBlob);
    formData.append("category", "photo");
    formData.append("ck", goParam.ck);
    formData.append("upload_auth_token", goParam.token);
    formData.append("albumid", goParam.album);

    xhr.load = function(e) {
        console.log("xhr.port2addphoto_draft:" + e);
    };

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {//服务器正常响应
                console.log("var picObj=" + xhr.responseText + "");
                eval("var picObj=" + xhr.responseText + "");
                if (!picObj.id) {
                    //文件上传失败，要重试
                    console.log("上传失败，重试");
                    fileEntryFile(file);
                    return;
                }
                add_desc_save(picObj);
            } else {//服务器无正常响应，重试
                console.log("xhr.status:" + xhr.status + " 重试");
                fileEntryFile(file);
                return;
            }
        } else {
            console.log("xhr.readyState:" + xhr.readyState);
        }
    };

    xhr.send(formData);
};




/**
 在成功调用addphoto_draft后，为图片增加描述，然后保存
@param aoParam
 */
var add_desc_save = function(aoParam) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.douban.com/photos/album/' + goParam.album + "/upload", true);
    var desc=window.location.origin +window.location.pathname+" "+aoParam.src+" "+gQueryParam["src_url"];

    if(is_photos_album_upload(window.location.pathname)){
        desc=decodeURIComponent(gQueryParam["src_url"]);
        console.log("desc:"+desc);
    }
    console.log("desc:" + desc);
    var formData = new FormData();
    formData.append("ck", goParam.ck);
    formData.append("desc_" + aoParam.id, desc);

    var a=document.createElement('a'); 
    a.href=decodeURIComponent(gQueryParam["src_url"]);
    var tags=a.hostname;

    if(gQueryParam["tags"]){
        tags=tags+","+decodeURIComponent(gQueryParam["tags"]);
    }


    if(gQueryParam["author"]){
        console.log("author:"+decodeURIComponent(gQueryParam["author"])+"---"+gQueryParam["author"]);
        var author=filterEmoji(decodeURIComponent(gQueryParam["author"]));
        console.log("author:"+decodeURIComponent(gQueryParam["author"])+"---"+author);
        tags=tags+","+author;
    }
    

    if(0==tags.indexOf(",")){
        tags=tags.substring(1);
    }
    formData.append("tags_" + aoParam.id, tags);    
    goParam.photo_id=aoParam.id;
    console.log("desc:" + desc);
    xhr.onreadystatechange = function() {
        console.log("desc:" + desc);
        
        console.log("xhr.readyState:"+xhr.readyState);
        console.log("xhr.status:"+xhr.status);
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("add_desc_save OK");
            clicked_button.innerHTML = "SAVING";
            
            aoParam.comment = desc;           

            if (null !== add_desc_save_callback) {
                //如果有指定回调句柄，那么就执行这个函数
                //add_desc_save_callback();
            } else {
                return;
            }
        }else if(xhr.status === 301 || xhr.status === 302 || xhr.status === 0 ){
            window.location.replace('https://www.douban.com/photos/photo/'+aoParam.id);
        }
        

        console.log("desc:" + desc);
    };
    console.log("desc:" + desc);
    try{
        xhr.send(formData);
    }catch(e){
        window.location.replace('https://www.douban.com/photos/album/' + goParam.album);
    }
    console.log("desc:" + desc);
};



/*
 * 
 */
var upload_other_site_pic=function(){
    var dlObj = {src: decodeURIComponent(gQueryParam["img_url"]), index: -1,fileName:decodeURIComponent(gQueryParam["fileName"])};
    goParam.album=gQueryParam["album"];
    if("1634429996"==goParam.album){
        download_pic_call(dlObj);
    }else{
        downloadFirst(dlObj);    
    }
    
};

var upload_other_site_pic_callback=function(){
    if(goParam.photo_id){
        setTimeout("window.location.href='https://www.douban.com/photos/photo/"+goParam.photo_id+"/'",1*1000);    
    }else{
        setTimeout("window.location.href='https://www.douban.com/photos/album/"+gQueryParam["album"]+"/'",1*1000);    
    }
    
};

var download_pic_call=function(dlObj){
    console.log("download_pic_call");
    var request=
        {
            method:"call_downloadFirst"
            ,tabid:gQueryParam["src_tabid"]
            ,src:dlObj.src
            ,index:dlObj.index
            ,fileName:dlObj.fileName
        };
    console.log(request);
    
    chrome.runtime.sendMessage(
        request
        ,function(response){
            console.log("download_pic_call sendRequest callback");
            console.log(response);
        }
    );
}


if(is_photos_album_upload(window.location.pathname)){
    console.log("photos_album_upload");
    if("true"===gQueryParam["auto_upload"]
        && gQueryParam["img_url"]
        && gQueryParam["album"]
    ){
        goParam.album=gQueryParam["album"];
        console.log("准备自动上传");
        $("div.uploader-button").css({"height":"500px","width":"600px","background":"url() no-repeat 0 0"});
        $("div.uploader-button").html("自动上传中....<br/>"
            +"原链接：<a href='"+decodeURIComponent(gQueryParam["src_url"])+"' target='_blank'>"+decodeURIComponent(gQueryParam["src_url"])+"</a><br/><br/>"
            +"图片链接：<a href='"+decodeURIComponent(gQueryParam["img_url"])+"' target='_blank'>"+decodeURIComponent(gQueryParam["img_url"])+"</a><br/><br/>"
            +"<img src='"+decodeURIComponent(gQueryParam["img_url"])+"'/>");
        $("p.uploader-tips").hide();
        
        var _header=$("div#content").find("h1");
        var _old_html=_header.html();
        var _href=window.location.href;
        _new_html="<a target='_blank' href='"+_href.substring(0,_href.lastIndexOf("/"))+"'>"+_old_html+"</a>";
        _header.html(_new_html);
        
        get_page(upload_other_site_pic);
        add_desc_save_callback=upload_other_site_pic_callback;
    }
}



