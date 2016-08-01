# doucake
a chrome extension ,work on douban.com.

# CHANGE @ 2016-08-01
尝试在图片页下载图片，并得到dataURL，然后通过 通过后台页面落 localStorage，
再从新页面中读取。

在图片的当前页下载图片，可以确保读取的是缓存，所以不会造成新的网络请求。

并且可以绕过跨域问题。

##localStorage存储
但是，localStorage 的大小有限制，所以，每次上传成功后，要记得清空对应的存储。
