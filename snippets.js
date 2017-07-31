/**
 * 遍历某一个相册页面，然后把内容都添加到 doulist 中。
 */
var add_album_to_doulist = function () {
    var _doulistid = "45968650";
    var _url = "https://www.douban.com/j/doulist/" + _doulistid + "/additem";
    $("a.album_photo").each(
        function () {
            var _surl = $(this).attr("href");
            var _ck = "U4Yc";
            console.log(_surl);
            var __data = {
                dl_id: _doulistid
                , sid: ""
                , skind: ""
                , surl: _surl
                , ck: _ck
            };
            console.log("__data:" + JSON.stringify(__data));
            $.ajax({
                type: 'POST'
                , url: _url
                , data: __data
                , success: function () {
                    /**
                     * @param sort - 排序规则；time 按照添加时间倒序排列，这样可以看到最近添加的内容
                     * @param sub_type - 内容：网页；相册 。
                     */
                }
                ,
            });
        }
    );
}
add_album_to_doulist();