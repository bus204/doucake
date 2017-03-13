
console.log("hello,doucake.js");
console.log(window.location);


/*
	全局的URL参数对象
	*/
var gQueryParam = parseQueryString(window.location.search);

/*
 * 相册的索引页面
 * @param {type} pathname
 * @returns {undefined}
 */
var is_photos_album_index = function (pathname) {
    return /\/people\/.*?\/photos/.test(pathname) && $("span.btn-pic-upload").length > 1;
};

var is_photos_album = function () {
    return /.*\/photos\/album\/\d+\/$/.test(window.location.pathname);
};

var is_group_topic = function () {
    return /.*\/group\/topic\/.*/.test(window.location.pathname);
};

var is_photos_photo = function () {
    return /.*\/photos\/photo\/.*/.test(window.location.pathname);
};

function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays === null) ? "" : ";expires=" + exdate.toUTCString());
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start === -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start === -1) {
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end === -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function parseQueryString(vhref) {
    var vars = [], hash;
    var hashes = vhref.slice(vhref.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

window.parseQueryString = parseQueryString;

/**
 打开upload页面，得到upload_token
 */
var get_page = function (get_page_callback) {
    console.log("get_page");
    var gQueryParam = parseQueryString(window.location.search);
    console.log(gQueryParam);
    /*
    如果入参中，已经包含了token和ck参数，那么就不需要再去获取，直接从链接的参数中获得。
    */
    if (gQueryParam['ck'] !== '' && undefined !== gQueryParam['ck'] &&
        gQueryParam['token'] !== '' && gQueryParam['token'] !== undefined
        && '' !== getCookie('token')
    ) {
        console.log('链接中已经包含ck和token');
        if ('' !== getCookie('token')) {
            goParam.token = getCookie('token');
            alert('从cookie中得到token ' + goParam.token);
        } else {
            goParam.token = gQueryParam['token'];
            console.log('从链接中得到token ' + goParam.token);
        }

        console.log(goParam);
        get_page_callback();
        return;
    }

    goParam.ck = getCookie('ck').replace(/\"/g, "");

    if (gQueryParam["token"] && gQueryParam["token"].length > 0) {
        goParam.token = gQueryParam['token'];
        console.log(goParam);
        console.log("token:" + goParam.token);
        get_page_callback();
        return;
    }

    /*
    访问链接获得
    */
    var xhr = new XMLHttpRequest();
    if (goParam.album == "DOUBAN_GUANGBO" || goParam.album == "beauty_stranger") {
        xhr.open('get', 'https://www.douban.com/', true);
    } else {
        xhr.open('GET', 'https://www.douban.com/photos/album/' + goParam.album + '/upload', true);
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {//服务器正常响应
                var re = /.*?UPLOAD_AUTH_TOKEN.*?\'(.*)\';/g;
                arr = re.exec(xhr.responseText);
                console.log(
                    arr[1]
                );
                goParam.token = arr[1];
                console.log("token:" + goParam.token);
                //调用回调函数
                get_page_callback();
            }//200
            else {
                console.log("get_page失败了，要重试，刷新");
                //setTimeout('window.location.href=window.location.href;',5);
            }
        }//state==4
    };
    console.log("requset upload page to get UPLOAD_AUTH_TOKEN");
    var formData = new FormData();
    xhr.send(formData);
};
window.get_page = get_page;
/*
 Just say Hello
 */
var HelloDouban = function () {
    console.log("ganxious.douban. Hello:" + get_dou_uid());
};

/*
 需要上传的目标的文件属性
 
 goParam.album   豆瓣相册的ID
 goParam.path    待上传文件的路径
 goParam.desc    待上传文件的描述
 */
window.goParam = {};

/**
 * 从页面中获取发帖人的信息。返回一个字符串，包含发帖人的主页地址，以及当前的名称。
 * 主页地址和名称之间，使用空格分隔
 * @returns {undefined}
 */
var get_poster = function () {
    var poster = "";
    if (is_group_topic()) {
        $("span.from a:eq(0)").each(function () {
            console.log($(this).attr("href"));
            poster = $(this).attr("href") + " " + $(this).text();
        });
    }
    return poster;
};
//console.log("poster:"+get_poster());

var get_poster_people_id = function () {
    var poster = "";
    if (is_group_topic()) {
        $("span.from a:eq(0)").each(function () {
            var tmpArray = $(this).attr("href").split("/");
            poster = tmpArray[tmpArray.length - 2];
        });
    }
    return poster;
};
console.log(get_poster_people_id());

/*
 * 上一次上传成功的照片。
 * @type aoParam
 */
var gLastAoParam = null;


var poem_list = [
    "大江东去浪淘尽，千古风流人物，故垒西边人道是，三国周郎赤壁。《念奴娇 赤壁怀古》 苏轼"
    , "昨夜星辰昨夜风，画楼西畔桂堂东。隔座送钩春酒暖，分曹射覆蜡灯红。身无彩凤双飞翼，心有灵犀一点通。嗟余听鼓应官去，走马兰台类转蓬。《无题》李商隐"
    , "元丰六年十月十二日，夜解衣欲睡，月色入户，欣然起行。 念无与为乐者，遂至承天寺寻张怀民。怀民亦未寝，相与步于中庭。庭下如积水空明，水中藻荇交横，盖竹柏影也。何夜无月？何处无竹柏？但少闲人如吾两人者耳。《记承天寺寻张怀民》苏轼"
    , "岐王宅里寻常见,崔九堂前几度闻。正是江南好风景,落花时节又逢君。《江南逢李龟年》杜甫"
    , "桂魄初生秋露微，轻罗已薄未更衣，银筝夜久殷勤弄，心怯空房不忍归。《秋夜曲》王维"
    , "梦后楼台高锁，酒醒帘幕低垂。去年春恨却来时，落花人独立，微雨燕双飞。 记得小苹初见，两重心字罗衣。琵琶弦上说相思，当时明月在，曾照彩云归。《临江仙》 晏几道"
    , "对酒当歌，人生几何？譬如朝露，去日苦多。慨当以慷，忧思难忘。何以解忧，唯有杜康。《短歌行》曹操"
    , "青青子衿，悠悠我心。但为君故，沉吟至今。呦呦鹿鸣，食野之苹。我有嘉宾，鼓瑟吹笙。《短歌行》曹操"
    , "东临碣石，以观沧海。水何澹澹，山岛竦峙。树木丛生，百草丰茂。秋风萧瑟，洪波涌起。日月之行，若出其中；星汉灿烂，若出其里。幸甚至哉，歌以咏志。《观沧海》曹操"
    , "岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。《望岳》杜甫"
    , "莫听穿林打叶声，何妨吟啸且徐行。竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。料峭春风吹酒醒，微冷，山头斜照却相迎。回首向来萧瑟处，归去，也无风雨也无晴。《定风波·莫听穿林打叶声》苏轼"
    , "人闲桂花落，夜静春山空。月出惊山鸟，时鸣春涧中。《鸟鸣涧》王维"
    , "木末芙蓉花，山中发红萼。涧户寂无人，纷纷开且落。《辛夷坞》王维"
    , " 十年生死两茫茫，不思量，自难忘。千里孤坟，无处话凄凉。纵使相逢应不识，尘满面，鬓如霜。      夜来幽梦忽还乡，小轩窗，正梳妆。相顾无言，惟有泪千行。料得年年肠断处，明月夜，短松冈。《江城子》苏轼"
    , "玉楼冰簟鸳鸯锦，粉融香汗流山枕。帘外辘轳声，敛眉含笑惊。 柳阴烟漠漠，低鬓蝉钗落。须作一生拼，尽君今日欢。 ——《菩萨蛮》牛峤"
    , "独坐幽篁里，弹琴复长啸。 深林人不知，明月来相照。《竹里馆》王维"
    , "云想衣裳花想容， 春风拂槛露华浓。若非群玉山头见， 会向瑶台月下逢。《清平调》李白"
    , "油壁香车不再逢，峡云无迹任西东。梨花院落溶溶月，柳絮池塘淡淡风。几日寂寥伤酒后，一番萧瑟禁烟中。鱼书欲寄何由达，水远山长处处同。《无题》晏殊"
    , "曾经沧海难为水，除却巫山不是云。 取次花丛懒回顾，半缘修道半缘君。《离思》元稹"
    , "近腊月下，景气和畅，故山殊可过。足下方温经，猥不敢相烦，辄便往山中，憩感配寺，与山僧饭讫而去。 北涉玄灞，清月映郭。夜登华子岗，辋水沦涟，与月上下。寒山远火，明灭林外。深巷寒犬，吠声如豹。村墟夜舂，复与疏钟相间。此时独坐，僮仆静默，多思曩昔，携手赋诗，步仄径，临清流也。 当待春中，草木蔓发，春山可望，轻鯈出水，白鸥矫翼，露湿青皋，麦陇朝雊，斯之不远，倘能从我游乎？非子天机清妙者，岂能以此不急之务相邀？然是中有深趣矣！无忽。因驮黄檗人往，不一。山中人王维白。《山中与裴秀才迪书》王维"
    , "不知香积寺，数里入云峰。 古木无人径，深山何处钟。 泉声咽危石，日色冷青松。 薄暮空潭曲，安禅制毒龙。《过香积寺》王维"
    , "月明星稀，乌鹊南飞。此非曹孟德之诗乎？西望夏口，东望武昌，山川相缪，郁乎苍苍，此非孟德之困于周郎者乎？方其破荆州，下江陵，顺流而东也，舳舻千里，旌旗蔽空，酾酒临江，横槊赋诗，固一世之雄也，而今安在哉？《前赤壁赋》苏轼"
    , "况吾与子渔樵于江渚之上，侣鱼虾而友麋鹿，驾一叶之扁舟，举匏樽以相属。寄蜉蝣于天地，渺沧海之一粟。哀吾生之须臾，羡长江之无穷。挟飞仙以遨游，抱明月而长终。知不可乎骤得，托遗响于悲风。《前赤壁赋》苏轼"
    , "清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。《前赤壁赋》苏轼"
    , "是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。《兰亭集序》王羲之"
    , "昨夜雨疏风骤，浓睡不消残酒。 试问卷帘人 却道“海棠依旧 知否？知否？ 应是绿肥红瘦。《如梦令》李清照"
];

var jayzhou = [
    "以敦煌为圆心的东北东，这民族的海岸线像一支弓。那长城像五千年来待射的梦。《龙拳》周杰伦"
    , "我右拳打开了天，化身为龙，那大地心脏汹涌，不安跳动。《龙拳》周杰伦"
    , "渴望着血脉相通，无限个千万弟兄。我把天地拆封将长江水掏空。人在古老河床蜕变中。《龙拳》周杰伦"
    , "我想要的 想做的 你比谁都了 你想说的 想给的 我全都知道 未接来电 没留言 一定是你孤单的想念 任何人都 猜不到 这是我们的暗号《暗号》周杰伦"
    , "什么兵器最喜欢 双截棍柔中带刚 想要去河南嵩山 学少林跟武当 《双截棍》周杰伦"
    , "一个马步向前 一记左钩拳 右钩拳 一句惹毛我的人有危险 一再重演 一根我不抽的烟 一放好多年 它一直在身边 《双截棍》周杰伦"
    , "故事的小黃花　從出生那年就飄著　童年的蕩鞦韆 隨記憶一直晃到現在 《晴天》周杰伦"
    , "從前從前　有個人愛妳很久　但偏偏　风漸漸　把距離吹得好遠 《晴天》周杰伦"
    , "让我们 半兽人 的灵魂 翻滚 收起残忍 回忆兽化的过程 让我们 半兽人 的眼神 单纯 而非贪婪著永恒 只对暴力忠诚 停止忿恨 永无止尽的战争 让我们 半兽人 的灵魂 单纯 对远古存在的神 用谦卑的身份 《半兽人》周杰伦"
    , "再也没有纯白的灵魂 自人类堕落为半兽人 我开始使用第一人称 记录眼前所有的发生 嗜血森林醒来的早晨 任何侵略都成为可能 我用古老的咒语重温 吟唱灵魂序曲寻根 面对魔界的邪吻 不被污染的转身 维持纯白的象徵 然后还原为人 《半兽人》周杰伦"
    , "喝～命有几回合 擂台等着 生死状 赢了什么 冷笑着 天下谁的 第一又如何 止干戈 我辈尚武德 我的～拳脚了得 却奈何徒增虚名一个 江湖难测 谁是强者 谁争一统武林的资格 《霍元甲》周杰伦"
    , "小城里岁月流过去 清澈地涌起 洗涤过的回忆 我记得你 骄傲地活下去 《霍元甲》周杰伦"
    , "霍霍 霍霍霍 霍霍霍 霍家拳的套路招式灵活 活活 活活活 活活活 活着生命就该完整地过 过过 过过过 过过过 过错软弱从来不属于我 我我 我我我 我我我 我们精武出手无人能躲 《霍元甲》周杰伦"
    , "一盏黄黄旧旧的灯 时间在旁闷不吭声 寂寞下手毫无分寸 不懂得轻重之分 沉默支撑跃过陌生 静静看著凌晨黄昏 你的身影 失去平衡 慢慢下沉《回到过去》周杰伦"
];
/**
 * 返回一个随机的诗歌、明言的开头。
 * @returns {undefined}
 */
var get_poem_prefix = function () {
    var target_list = poem_list.concat(jayzhou);

    var tid = get_group_topic_id();
    //return target_list[ (new Date()).valueOf() % target_list.length];
    return target_list[Math.floor(Math.random() * 10000) % target_list.length];
};


var get_group_topic_id = function () {
    var tmpArray = window.location.pathname.split("/");
    var tid = tmpArray[tmpArray.length - 2];
    return tid;
};

var get_item_id = function (url) {
    var tmpArray = url.split("/");
    var tid = tmpArray[tmpArray.length - 2];
    return tid;
}

/*
 * add_desc_save_callback 一个回调函数的句柄，在add_desc_save完成后，调用该句柄。该句柄暂时不接收任何的参数。
 * 所以只能依赖全部变量。
 * 该句柄默认情况下为null
 * @param {type} aoParam
 * @returns {undefined}
 */
var add_desc_save_callback = null;
/*
 * 在相册页面中，保存成功后的回调函数
 * @returns {undefined}
 */
var photos_photo_add_desc_save_callback = function () {
    //标记为喜欢add_comment_to_group_topic
    like(function () {

        //clicked_button.removeEventListener('click', clicked_function);
        clicked_button.innerHTML = "<a href='https://www.douban.com/photos/album/" + goParam.album + "/' target=_blank>查看</a>";
    });

};


var like = function (func) {
    var tid = get_group_topic_id();
    console.log("like tid:" + tid);

    var formData = new FormData();
    formData.append("object_kind", "1025");
    formData.append("object_id", tid);
    formData.append("target_type", "fav");
    formData.append("target_action", 0);
    formData.append("tid", tid);
    formData.append("ck", goParam.ck);
    formData.append("apikey", "None");
    formData.append("q", "quiet");
    formData.append("tkind", "1025");
    formData.append("privacy", "0");
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'https://www.douban.com/j/like', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            func();
        }
    };
    xhr.send(formData);
};
/*
 * 在小组话题页面中，保存成功后，需要做下面的处理。
 * @returns {undefined}
 */
var group_topic_add_desc_save_callback = function () {
    /*
     小组话题内游标+1，处理下一张照片
     */
    g_index = g_index + 1;
    save_single_pic(g_index);
};

var status_add_desc_save_callback = function () {
    /*
 小组话题内游标+1，处理下一张照片
 */
    g_index = g_index + 1;
    save_status_single_pic(g_index);
};

if (
    /.*\/photos\/photo\/.*/.test(window.location.pathname)
) {
    //在相册页面
    console.log("在相册页面");
    add_desc_save_callback = photos_photo_add_desc_save_callback;
} else if (
    /.*\/group\/topic\/.*/.test(window.location.pathname)
) {
    //小组话题页面
    console.log("小组话题页面");
    add_desc_save_callback = group_topic_add_desc_save_callback;
} else if (/.*\/people\/.*\/status\/.*/.test(window.location.pathname)) {
    console.log("个人状态页面");
    add_desc_save_callback = status_add_desc_save_callback;
}
else {
    console.log("当前页面未知");
}
/*
 向照片增加一条评论
 aoParam.id  照片ID
 aoParam.comment 要添加的评论
 */
var add_comment = function (aoParam) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.douban.com/photos/photo/' + aoParam.id + '/add_comment');
    var formData = new FormData();
    formData.append("ck", goParam.ck);
    formData.append("rv_comment", aoParam.comment);
    formData.append("start", "0");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("add_comment OK");
            clicked_button.innerHTML = "<a href='https://www.douban.com/photos/photo/" + aoParam.id + "/' target=_blank>查看</a>";
        }
    };
    //xhr.send(formData);
};


//导入CSS
function ImportCSS() {
    var jqueryScriptBlock = document.createElement('style');
    jqueryScriptBlock.type = 'text/css';
    jqueryScriptBlock.innerHTML = "#gototop{position:fixed;z-index:19;bottom:225px;right:1px;border:1px solid gray;padding:3px;width:68px;font-size:12px;cursor:pointer;border-radius: 3px;text-shadow: 1px 1px 3px #676767;display:none;}";
    jqueryScriptBlock.innerHTML += "#gototop div{cursor:pointer;}";
    jqueryScriptBlock.innerHTML += "#save_private{position:fixed;z-index:19;bottom:185px;right:1px;border:1px solid gray;padding:3px;width:68px;font-size:12px;cursor:pointer;border-radius: 3px;text-shadow: 1px 1px 3px #676767;display:none;}";
    jqueryScriptBlock.innerHTML += "#save_private div{cursor:pointer;}";
    jqueryScriptBlock.innerHTML += "#post_to_group_topic{position:fixed;z-index:19;bottom:145px;right:1px;border:1px solid gray;padding:3px;width:68px;font-size:12px;cursor:pointer;border-radius: 3px;text-shadow: 1px 1px 3px #676767;}";
    jqueryScriptBlock.innerHTML += "#post_to_group_topic div{cursor:pointer;}";
    document.getElementsByTagName('head')[0].appendChild(jqueryScriptBlock);
}
//document 全局对象
var gbody = document.getElementsByTagName("body")[0];
var newButton = null;
var savePrivateButton = null;
var clicked_button = null;
var clicked_function = null;
var postButton = null;
//为页面元素增加按钮
function AddButton() {
    ImportCSS();
    newButton = document.createElement("div");
    newButton.id = "gototop";

    var publicDiv = document.createElement("div");
    publicDiv.innerHTML = "save_pic";
    publicDiv.addEventListener('click', save_to_public);
    newButton.appendChild(publicDiv);
    gbody.appendChild(newButton);
    clicked_button = newButton;

    //新增一个按钮
    savePrivateButton = document.createElement("div");
    savePrivateButton.id = "save_private";
    var privateDiv = document.createElement("div");
    privateDiv.innerHTML = "save_private";
    privateDiv.addEventListener('click', man_save_photos_to_private);
    savePrivateButton.appendChild(privateDiv);
    gbody.appendChild(savePrivateButton);

    if (is_photos_album()) {

    }
}


var save_to_public = function () {
    clicked_button = newButton;
    clicked_function = man_save_photos_to_private;
    //更新目标相册的ID
    goParam.album = "124153766";
    get_page(save_pics_entry);
};
/**
 * 页面点击按钮时，手工收藏私有相册
 * @returns {undefined}
 */
var man_save_photos_to_private = function () {
    clicked_button = savePrivateButton;
    //更新目标相册的ID
    goParam.album = "128994584";
    get_page(save_pics_entry);
};

var save_pics_entry = function () {
    if (/.*\/group\/topic\/.*/.test(window.location.pathname)) {
        save_pics();
    } else if (/.*\/photos\/photo\/.*/.test(window.location.pathname)) {
        save_photos_photo();
    } else if (/.*\/people\/.*\/status\/.*/.test(window.location.pathname)) {
        save_status_photo();
    }
};

var save_photos_photo = function () {
    console.log('save_photos_photo');
    var selector = "div.image-show-inner img:eq(0)";
    if (/movie.douban.com/.test(window.location.host)) {
        selector = "a.mainphoto img:eq(0)";
    }
    console.log("selector : " + selector);
    $(selector).each(function () {
        var dlObj = { src: this.src, index: 0 };
        console.log(dlObj);
        downloadFirst(dlObj);
        if (null == gLastAoParam) {
            gLastAoParam = "\n" + get_poem_prefix() + "\n 【时光机】\n";//
            gLastAoParam = gLastAoParam + "\n" + window.location.href + "\n";
        }
        //gLastAoParam=gLastAoParam+this.src+"\n";
    });
    //add_comment_to_group_topic(function(){});

};

var g_index = 0;
var save_pics = function () {
    console.log("click on save_pics");
    save_single_pic(g_index);
};


/*
 * 在状态页面保存图片到相册中。
 * @returns {undefined}
 */
var save_status_photo = function () {
    console.log('save_status_photos');
    save_status_single_pic(g_index);
};

var save_status_single_pic = function (aiIndex) {
    if (aiIndex >= $("img.upload-pic").length) {
        console.log("save over,number:" + $("img.upload-pic").length);
        clicked_button.innerHTML = "<a href='https://www.douban.com/photos/album/" + goParam.album + "/' target=_blank>查看</a>";
        add_comment_to_group_topic(function () { });
        return;
    }
    $("img.upload-pic:eq(" + aiIndex + ")").each(function () {
        var dlObj = { src: this.src, index: aiIndex };
        console.log(aiIndex + ":" + this.src);
        downloadFirst(dlObj);
        if (null == gLastAoParam) {
            gLastAoParam = "\n" + get_poem_prefix() + "\n 【时光机】\n";//
            gLastAoParam = gLastAoParam + "\n" + window.location.href + "\n";
        }
        gLastAoParam = gLastAoParam + this.src + "\n";
    });

};


/*
 保存单张照片。
 aiIndex，是其中ID，从0开始。
 */
var save_single_pic = function (aiIndex) {
    if (aiIndex === -1) {
        console.log("save over,number:" + $(".topic-doc img").length);
        clicked_button.innerHTML = "<a href='https://www.douban.com/photos/album/" + goParam.album + "/' target=_blank>查看</a>";


        if (window.location.search.indexOf('lid=') > -1) {
            console.log("add_tags");
            add_tags();
        }

        return;
    }
    if (0 === $(".topic-doc img").length) {
        //没有图片
        console.log("没有图片");
        // unlike();
        add_tags();
        return;
    }

    /*
     * 最后一张照片
     * @param {type} aiIndex
     */
    if (aiIndex >= $(".topic-doc img").length) {
        console.log("save over,number:" + $(".topic-doc img").length);
        clicked_button.innerHTML = "<a href='https://www.douban.com/photos/album/" + goParam.album + "/' target=_blank>查看</a>";
        if (window.location.search.indexOf('lid=') > -1) {
            console.log("add_tags");
            add_tags();
        }
        /*
        2014-05-23 leungma
        不再提交，等待后续，从相册中，批量提交。
        */
        add_comment_to_group_topic();
    }
    $(".topic-doc img:eq(" + aiIndex + ")").each(function () {
        var dlObj = { src: this.src, index: aiIndex };
        downloadFirst(dlObj);
    });
};

var back2Index = function () {
    if (window.location.href.indexOf('back_to_index=true') > -1) {
        var backIndex = goParam.likes_index;
        if (window.location.search.indexOf('src_index=') > -1) {
            backIndex = decodeURIComponent(gQueryParam['src_index']);
        }
        var tmpBackParam = parseQueryString(backIndex);
        console.log(tmpBackParam);
        if (tmpBackParam.length == 0) {
            backIndex = backIndex + "?ck=" + goParam.ck + "&token=" + goParam.token;
        } else if (!tmpBackParam["ck"] && !tmpBackParam["token"]) {
            backIndex = backIndex + "&ck=" + goParam.ck + "&token=" + goParam.token;
        }
        console.log("backIndex=" + backIndex);
        setTimeout("window.location.href='" + backIndex + "'", //
            //2 * 1000
            4 * 1000
        );
    }
}
/*
 当前页面取消喜欢。
 */
var unlike = function () {
    var tmpArray = window.location.pathname.split("/");
    var tid = tmpArray[tmpArray.length - 2];
    console.log("tid:" + tid);
    var xhr = new XMLHttpRequest();

    xhr.open('DELETE', 'https://www.douban.com/j/like', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            back2Index();
        }
    };
    var formData = new FormData();
    formData.append('tid', tid);
    formData.append('ck', goParam.ck);
    formData.append('tkind', '1013');
    xhr.send(formData);
};

/*
 为当前页面增加标签
 */
var add_tags = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://www.douban.com/j/like_tags", true);

    var formData = new FormData();
    formData.append('ck', goParam.ck);
    formData.append('lid', gQueryParam['lid']);
    formData.append('tags', gQueryParam['tags']);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            back2Index();
        }
    };
    try {
        xhr.send(formData);
    } catch (e) {
        console.log("add tags error");
        setTimeout("add_tags();", 2 * 1000);

    }

};

/**
 * 向当前小组话题添加评论。
 * @returns {undefined}
 */
var add_comment_to_group_topic = function (call_back_func) {
};



/*
 在小组喜欢页面中，依次打开页面。
 打开的页面中，需要追加参数  auto_save=true
 */
var auto_open_in_group_likes = function () {
    var group_likes_fresh_interval = 10;
    if (/.*likes\/topic\//.test(window.location)
        && (window.location.href.indexOf('auto_save=true') > -1)
    ) {
        if ($(".title a:eq(0)").length === 0) {
            setTimeout("window.location.href=window.location.href", group_likes_fresh_interval * 1000);
        } else {
            /*遍历喜欢的条目列表，找到第一个还没有UP标签的条目，并打印日志链接*/
            $("ul.fav-list").children("li").each(function () {
                //console.log("Get Li");
                /*依次处理每一个喜欢的条目*/
                var target_href = $(this).find("div.title:eq(0)").children("a:eq(0)").attr("href")
                    //追加目标页面的参数
                    + "?"
                    + "auto_save=true"
                    + "&back_to_index=true&src_index=" + encodeURIComponent(window.location.href)

                    ;
                if (gQueryParam['ck'] !== '' && undefined !== gQueryParam['ck'] //
                    && gQueryParam['token'] !== '' && gQueryParam['token'] !== undefined) {
                    target_href = target_href + "&ck=" + gQueryParam['ck'] + "&token=" + gQueryParam['token'];
                }
                var hasTagged = false;
                /*判断是否有已经指定的标签*/
                $(this).find("p.author-tags").children("a.tag-add").each(function () {
                    var tags = $(this).attr("data-tags").split(",");
                    console.log("has tags:" + $(this).attr("data-tags") + " tags length:" + tags.length);
                    if ($(this).attr("data-tags") === "") {
                        console.log("Has No Tags");
                        hasTagged = false;
                        target_href += "&lid=" + $(this).attr("data-id") + "&tags=" + goParam.tag;
                        return;
                    }

                    for (var index = 0; index < tags.length; index++) {
                        if (tags[index] === goParam.tag) {
                            hasTagged = true;
                            target_href += "&lid=" + $(this).attr("data-id") + "&tags=" + tags + "," + goParam.tag;
                        }
                    }
                });


                if (!hasTagged) {
                    //如果还没有打过指定的标签，那么就打开这个页面
                    console.log("DEBUG,should OPEN THIS:" + target_href);
                    window.location.href = target_href;
                } else {
                    console.log("HAS UPLOADED:" + target_href);
                }
            });
        }
        setTimeout("window.location.href=window.location.href", group_likes_fresh_interval * 1000);
    }
};


goParam = {
    album: "124153766"
    , likes_index: "https://www.douban.com/people/70930346/likes/topic/?auto_save=true"
    , desc: "desc"
    , tag: "UP"
};

if (/movie.douban.com/.test(window.location.host)) {
    console.log("in movie.douban.com");
    goParam.album = "130190735";
}

/*
 从cookies中得到豆瓣的uid。
 */
var get_dou_uid = function () {
    var tmp = "var tmpObj=" + $("div.global-nav-items").find("li").find("a").attr("data-moreurl-dict");
    console.log(tmp);
    eval(tmp);
    console.log(tmpObj.uid);
    return tmpObj.uid;
};

var back_to_index = function () {
    window.location.href = goParam.likes_index;
};

if (/.*douban.com/.test(window.location.hostname) && "/share/recommend" !== window.location.pathname) {
    try {
        HelloDouban();
        AddButton();
    } catch (e) {
        console.log("AddButton:" + e);
    }
}


window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
/*
 如果是豆瓣小组的页面，脚本启动。
 先展示一个按钮，点击触发动作
 */
if (/.*\/group\/topic\/.*/.test(window.location.pathname)
    || /.*\/photos\/photo\/.*/.test(window.location.pathname)
    || /.*\/people\/.*\/status\/.*/.test(window.location.pathname)
) {
    if (window.location.href.indexOf('auto_save=true') > -1) {
        /*
         如果链接中有参数auto_save=true，那么就尝试自动保存
         */
        console.log("auto_save");
        /*
        在自动保存之前，优先得到token和ck字段
        得到成功后，再获取。
        */
        get_page(save_pics);
    }
}

/*
 小组喜欢页
 */
if (/.*likes\/topic\//.test(window.location.pathname)) {
    auto_open_in_group_likes();
}

/*
 * 评论的窗口加大
 */
$("textarea[name='rv_comment']").attr("rows", 20);


var auto_upload_other_site_pic_to_album = function () {
    //真正的代码其实从后面的if开始的，这里定义个函数，只是为了方便导航定位。
};


var auto_submit_group_topic_comment = function () {
    //    console.log("小组话题内的快捷键");
    document.getElementsByName("comment_form")[0].submit();
};

$("#last").keydown(function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
        auto_submit_group_topic_comment();
    }
});

$("textarea[name='rv_comment']").keydown(function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
        auto_submit_group_topic_comment();
    }
});

/*
状态发表回应
*/
$("input[name='text']").keydown(function (e) {
    if (e.keyCode === 13 && e.ctrlKey) {
        console.log(e);
        //e.target.form.submit();
    }
});




function adjustRange(range) {
    range = range.cloneRange();

    // Expand range to encompass complete element if element's text
    // is completely selected by the range
    var container = range.commonAncestorContainer;
    var parentElement = container.nodeType == 3 ?
        container.parentNode : container;

    if (parentElement.textContent == range.toString()) {
        range.selectNode(parentElement);
    }

    return range;
}

function getSelectionHtml() {
    var html = "", sel, range;
    if (typeof window.getSelection != "undefined") {
        console.log("window.getSelection");
        sel = window.getSelection();
        console.log(sel);
        console.log(sel.rangeCount);
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                range = adjustRange(sel.getRangeAt(i));
                container.appendChild(range.cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        console.log("document.selection");
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

var methodManager = {
    load_album_list: function (request, sender, sendResponse) {
        var tmp = "var album_list=" + window.localStorage.getItem("album_list");
        eval(tmp);
        console.log(JSON.stringify(album_list));
        if (!album_list) {
            console.log("未读到配置");
            return;
        }
        sendResponse(album_list);
    }
    , call_downloadFirst: function (request, sender, sendResponse) {
        console.log("recv msg call_downloadFirst:request ");
        console.log(request);
        var dlObj = request;
        console.log(dlObj);
        downloadFirst(dlObj, function (aoParam) {
            console.log("downloadFirst callback param");
            console.log(aoParam);
            sendResponse(aoParam);
        });
    }//end call_downloadFirst
    , call_get_selection_html: function (request, sender, sendResponse) {
        console.log("call_get_selection_html");
        console.log("document.getSelection:" + document.getSelection());
        console.log("document.getSelection().toString():" + document.getSelection().toString());

        //console.log(getSelectionHtml());
        var response = request;
        response.html = getSelectionHtml();
        //console.log(response);
        sendResponse(response);
        /*
        // Only works with a single range - add extra logic to 
        // iterate over more ranges if needed
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var container = range.commonAncestorContainer;
        var html = container.innerHTML;
        console.log("container.innerHTML:"+html);
        */
    }
    , call_get_src_url: function (request, sender, sendResponse) {
        console.log("call_get_src_url:" + request.img_url);
        console.log("request.pageUrl:" + request.pageUrl);
        console.log("window.location.href:" + window.location.href);
        console.log("under : " + window.location.hostname);

        if (request.pageUrl !== window.location.href) {
            console.log("request.pageUrl!=window.location.href,no callback");
            console.log("request.pageUrl:" + request.pageUrl);
            console.log("window.location.href:" + window.location.href);
            return;
        }
        if ("strip.taobaocdn.com" === window.location.hostname
            || "s.alitui.weibo.com" === window.location.hostname
            || "cdn.tanx.com" === window.location.hostname
        ) {
            console.log("hostname in blacklist,no callback");
            return;
        }

        var response = request;
        response.pageUrl = window.location.href;

        if (window.location.hostname.indexOf('weibo.com') > -1) {
            console.log("under weibo.com");
            var retObj = get_weibo_detail_link(request);
            response = retObj;
            response.pageUrl = retObj.link;
            if (retObj.author) {
                response.author = retObj.author;
            }
        } else if (window.location.hostname.indexOf('zhihu.com') > -1) {
            console.log("under zhihu.com");
            var retObj = get_zhihu_answer_link(request);
            response = retObj;
            response.pageUrl = retObj.link;
            if (retObj.author) {
                response.author = retObj.author;
            }
            if (retObj.title) {
                response.title = retObj.title;
            }
        } else if (window.location.hostname.indexOf('douban.com') > -1) {
            console.log("under douban.com index");
            var retObj = get_douban_status_link(request);
            response = retObj;
            response.pageUrl = retObj.link;
            if (retObj.author) {
                response.author = retObj.author;
            }
        } else if (window.location.hostname.indexOf('twitter.com') > -1) {
            console.log("twitter.com");
            var retObj = get_twitter_detail_link(request);
            response = retObj;
            response.pageUrl = retObj.link;
            if (retObj.author) {
                response.author = retObj.author;
            }
        }
        else {
            console.log("域名未知");
            response.pageUrl = window.location.href;
            //   return ;
        }
        console.log("callback");
        console.log(response);
        sendResponse(response);
    }//end call call_get_src_url
};

console.log("hello");
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.method) {
            methodManager[request.method](request, sender, sendResponse);
        }
    }
);

var post_tor_group_topic_page_cnt = 6;


/*
 * 是否为帖子首页。 
 */
var is_group_topic_index = function () {
    return parseInt(gQueryParam["start"], 10) === 0;
};

/*
 * 判断当前页面是否为我发的帖子的首页。
 * @returns {undefined}
 */
var is_my_group_topic = function () {
    //if(is_group_topic_index()){
    console.log($("span.fleft").find("a").text());
    return $("span.fleft").find("a").text() === "修改";
    //}
    //return false;
};
console.log(gQueryParam["auto_delete"]);
if (is_my_group_topic() || "true" === gQueryParam["auto_delete"]) {

    if (is_my_group_topic() //&& is_group_topic_index()
    ) {

        console.log("我发的帖子的首页");
        var a_delete_all = document.createElement("a");
        a_delete_all.innerHTML = "&nbsp;&gt;删除本页全部回复";
        a_delete_all.href = "javascript:void(0)";
        a_delete_all.style = "margin-left:20px;";
        a_delete_all.addEventListener('click', quick_delete_comment_this_page);
        $("div.topic-opt.clearfix")[0].appendChild(a_delete_all);
    }

    //$("div.sns-bar-rec").css("margin-right","20px");
    $("div.operation_div").each(function () {
        /*
         * 判断是否可以进行删除，如果可以，则插入快删按钮。
         */
        var del_element = $(this).find("div").find("a.lnk-delete-comment");
        //console.log(del_element.attr("title"));
        /*
        if(del_element!=="display:inline"){
               return;
        }
        */
        var a = document.createElement("a");
        a.innerHTML = "&nbsp;快删&nbsp;";
        a.href = "javascript:void(0)";
        a.name = $(this).find("a[data-cid]").attr("data-cid");
        a.addEventListener('click', quick_delete_comment);
        $(this)[0].insertBefore(a, $(this)[0].childNodes[2]);

        if ("true" === gQueryParam["auto_delete"] //&& get_dou_uid()===$(this).attr("id")
        ) {
            console.log("delete " + a.name);
            delete_comment(a.name);
        }

    });
}


/*
 *  删除我在本页的回复
 */
var delete_my_comment = function () {
    //$("div.sns-bar-rec").css("margin-right","20px");
    $("div.operation_div").each(function () {
        if ($(this).attr("id") !== get_dou_uid()) {
            //不是我的回复，跳过。
            return;
        }
        var a = document.createElement("a");
        a.name = $(this).find("a[data-cid]").attr("data-cid");
        delete_comment(a.name);
    });
};


if ("true" === gQueryParam["delete_mine"]) {
    delete_my_comment();
}

/*
为话题的回复增加链接
*/
if (is_group_topic()) {
    $("ul.topic-reply").children("li").each(function () {
        var did = $(this).attr("id");

        $(this).find("span.pubtime").each(function () {
            var txt = $(this).text();
            //console.log(txt);
            var link = "http://" + window.location.hostname + window.location.pathname + window.location.search + "#" + did;
            $(this).html("<a href='" + link + "'>" + txt + "</a>");
        });
    });
}


function rm_from_right_menu() {
    console.log("rm_from_right_menu");
    var albumid = get_item_id(window.location.pathname);
    if (is_photos_album_index(window.location.pathname)) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        console.log(targ.name);
        albumid = (targ.name);
    }

    chrome.runtime.sendMessage({ method: "rm_from_right_menu", "albumid": albumid }, function (response) {
        console.log("rm_from_right_menu callback");
        //window.location.reload();
        show_all_right_menu();
    });
};

function add_to_right_menu() {
    console.log("add_to_right_menu");
    var albumid = get_item_id(window.location.pathname);
    chrome.runtime.sendMessage({ method: "add_to_right_menu", "albumid": albumid, "name": document.title.substring(document.title.indexOf('-') + 1) }
        , function (response) {
            console.log("add_to_right_menu callback");
            //window.location.reload();
            show_all_right_menu();
        });
}

/*
如果是在自己的某个相册首页，那么就显示一个加入到右键菜单的选项。
*/
if (is_photos_album() && $("div.pl.photitle").find("a").length > 1) {
    var albumid = get_item_id(window.location.pathname);
    console.log("在某个相册首页 " + albumid);
    chrome.runtime.sendMessage({ method: "douban_is_in_context", "albumid": albumid }
        , function (response) {//回调函数
            console.log(response);
            if (response) {
                //在右键菜单中
                console.log("在右键菜单中");
                var a = document.createElement("a");
                a.innerHTML = ">从右键菜单中取消";
                a.href = "javascript:void(0)";
                a.addEventListener('click', rm_from_right_menu);
                $("div.pl.photitle")[0].insertBefore(a, $("div.pl.photitle")[0].childNodes[0]);

            } else {
                //暂时不在右键菜单中
                console.log("不在右键菜单中");
                var a = document.createElement("a");
                a.innerHTML = ">添加到右键菜单中";
                a.href = "javascript:void(0)";
                a.addEventListener('click', add_to_right_menu);
                $("div.pl.photitle")[0].insertBefore(a, $("div.pl.photitle")[0].childNodes[0]);
            }
        });
}


var gRightMenuAlbumList = {};

/*
 * 在相册索引页面展示全部的右键菜单
 */
var show_all_right_menu = function () {
    if (!$("div.aside")) {
        return;
    }
    var _all_right_menu_list = document.getElementById("_all_right_menu_list");
    if (_all_right_menu_list) {
        var _ul = document.getElementById("_all_right_menu_ul");
        _ul.innerHTML="";
    } else {
        var _div = document.createElement("div");
        _div.innerHTML = "<h2>右键菜单</h2>";
        _div.className = "mod";
        _div.id = "_all_right_menu_list";
        var _ul = document.createElement("ul");
        _ul.id="_all_right_menu_ul";
        _ul.className = "mbt";
        _div.appendChild(_ul);
        $("div.aside")[0].insertBefore(_div, $("div.mod")[0]);
    }
    var _all_right_menu_list = document.getElementById("_all_right_menu_list");
    var _ul = document.getElementById("_all_right_menu_ul");
    chrome.runtime.sendMessage({ method: "get_all_right_menu" }
        , function (response) {
            if (!response) {
                return;
            }
            for (var a in response) {
                /*
                    {
                        "title": "保存图片到 " + album_list[a].name
                        , "contexts": ["image"]
                        , "onclick": saveImg
                        , "parentId": pid
                        , "id": album_list[a].id
                    }
                    */
                gRightMenuAlbumList[response[a].id] = response[a];
                if (!is_photos_album_index(window.location.pathname)) {
                    return;
                }
                var _empty = document.createElement("li");
                _empty.className = "mbtl";
                _ul.appendChild(_empty);

                var _li = document.createElement("li");
                _li.innerHTML = "<a href='/photos/album/" + response[a].id + "/'>" + response[a].name + "</a>";
                _li.id = "_id_album_" + response[a].id;

                var _a = document.createElement("a");
                _a.innerHTML = "&nbsp;&nbsp;X";
                _a.href = "javascript:void(0)";
                _a.title = "从右键菜单中移除:" + response[a].name;
                _a.name = response[a].id;
                _a.addEventListener('click', rm_from_right_menu);
                _li.appendChild(_a);
                _ul.appendChild(_li);
            }//end for
        });//end sendMessage

};

if ("www.douban.com" == window.location.hostname) {
    show_all_right_menu();
}



var hide_group_intro = function () {
    if ($("div.group-intro")) {
        $("div.group-intro").hide();
        if ($("a#switch_group_intro")[0]) {
            $("a#switch_group_intro")[0].innerHTML = "查看小组介绍";
            $("a#switch_group_intro")[0].removeEventListener('click');
            $("a#switch_group_intro")[0].addEventListener('click', show_group_intro);
        }

    }
}
var show_group_intro = function () {
    if ($("div.group-intro")) {
        $("div.group-intro").show();
        $("a#switch_group_intro")[0].innerHTML = "关闭小组介绍";
        $("a#switch_group_intro")[0].removeEventListener('click');
        $("a#switch_group_intro")[0].addEventListener('click', hide_group_intro);
    }
}

if ($("div.group-rec") && $("div.group-board")) {
    var _a = document.createElement("a");
    _a.href = "javascript:void(0)";
    _a.innerHTML = "查看小组介绍";
    _a.addEventListener('click', show_group_intro);
    _a.id = "switch_group_intro";
    if ($("div.group-board")[0]) {
        $("div.group-board")[0].insertBefore(_a, $("div.group-rec")[0]);
    }

}

hide_group_intro();

var showHrefUnderPhoto = function () {
    if (0 != window.location.pathname.indexOf("/photos/photo/")) {
        return;
    }
    var new_html = $("#display").html();
    $("#display").html(new_html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<wbr>/g, "").replace(/<\/wbr>/g, ""));
}
showHrefUnderPhoto();

var add_group_to_fav = function () {
    console.log("add_group_to_fav");
    var groupUrl = window.location.host + window.location.pathname;
    console.log(groupUrl);
    var group_icon = $("#group-info").children("img").attr("src");
    console.log(group_icon);
    chrome.runtime.sendMessage({ method: "add_group_to_fav", "group_id": group_id, "group_icon": group_icon }
        , function (response) {//回调函数
            window.location.reload();
        }
    );
}

var rm_group_from_fav = function () {
    console.log("rm_group_from_fav");
    var groupUrl = window.location.host + window.location.pathname;
    console.log(groupUrl);
    var group_icon = $("#group-info").children("img").attr("src");
    console.log(group_icon);
    chrome.runtime.sendMessage({ method: "rm_group_from_fav", "group_id": group_id, "group_icon": group_icon }
        , function (response) {//回调函数
            window.location.reload();
        }
    );
}


if (new RegExp(/\/group\/[a-zA-Z0-9\-]+\//).test(window.location.pathname)) {
    console.log("某个小组首页");
    var _a = document.createElement("a");
    _a.href = "javascript:void(0)";
    _a.id = "add_group_to_fav";
    var group_id = get_item_id(window.location.pathname);
    chrome.runtime.sendMessage({ method: "group_is_in_fav", "group_id": group_id }
        , function (response) {//回调函数
            console.log(response);
            if (response) {
                console.log("already in group favorate");
                _a.innerHTML = "取消常用";
                _a.addEventListener('click', rm_group_from_fav);
            } else {
                console.log("NOT in group favorate");
                _a.innerHTML = "设为常用";
                _a.addEventListener('click', add_group_to_fav);
            }
            if ($("#group-info")[0]) {
                $("#group-info")[0].appendChild(_a, $("#group-info")[0]);
            }
        });

}



if ("/group/" === window.location.pathname || new RegExp(/\/group\/[a-zA-Z0-9\-\/]*\//).test(window.location.pathname)) {

    chrome.runtime.sendMessage({ method: "group_fav_list" }
        , function (response) {//回调函数
            var newHtml = "";
            for (var i in response) {
                console.log(JSON.stringify(response[i]));
                newHtml = newHtml + "<li class style='display:inline-block'><a href='" + "https://www.douban.com/group/" + response[i].group_id + "'><img src='" + response[i].group_icon + "'></a></li>";
            }
            console.log("new List: " + newHtml);
            $("div.content").children("ul").html(newHtml);
            var mod = $("div.aside").find("div.mod:eq(0)");
            //mod.html("<div class=content><ul>"+newHtml+"</ul></div>"+mod.html());
            //$("div.side-reg").html("<div class=content><ul>"+newHtml+"</ul></div>");
        }
    );
}

var _reply = function () {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    console.log(targ.name);
    did = (targ.name);

    var txt = $("#add_comment").find("textarea");
    //txt.html(txt.html()+'@'+targ.title+' ');
    txt.val(txt.val() + '@' + did + ' ');
    //console.log(txt.html());
    //console.log(txt.text());
    //console.log(txt.val());

}

//为豆瓣广播下增加回复按钮。
if (/^\/$/.test(window.location.pathname)) {
    console.log("status index");
    $("em").each(function () {
        var did = $(this).find("a").attr("href").substring(30);
        did = did.substring(0, did.length - 1);
        console.log("did:" + did);
        var _a = document.createElement("a");
        _a.innerHTML = "&nbsp;&nbsp;@";
        _a.href = "#add_comment";
        _a.name = did;
        _a.title = $(this).find("a").html();
        _a.addEventListener('click', _reply);//rm_from_right_menu
        $(this)[0].appendChild(_a);
    }
    );
}

if (/^\/people\/.*\/status\/\d+\/$/.test(window.location.pathname)) {
    console.log("status link");
    $("div.author").each(function () {
        var did = $(this).find("a").attr("href").substring(30);
        did = did.substring(0, did.length - 1);
        console.log("did:" + did);
        var _a = document.createElement("a");
        _a.innerHTML = "&nbsp;&nbsp;@";
        _a.href = "#add_comment";
        _a.name = did;
        _a.title = $(this).find("a").html();
        _a.addEventListener('click', _reply);//rm_from_right_menu
        $(this)[0].appendChild(_a);
    }
    );
}


if (/^\/group\/[a-zA-Z0-9\-]+/.test(window.location.pathname)) {
    $("table.olt tr").each(function () {
        var url = $(this).children("td:eq(0)").children("a").attr("href");
        var td = $(this).children("td:eq(2)");
        var num = parseInt(td.html(), 10);
        var start = 0;
        if (num > 100) {
            start = parseInt(td.html().substring(0, td.html().length - 2), 10);
        }
        if (start > 0) {
            td.html("<a href='" + url + "?start=" + start + "00#last'>" + td.html() + "</a>");
        } else {
            td.html("<a href='" + url + "#last'>" + td.html() + "</a>");
        }
    });
}

if (/^\/group\/$/.test(window.location.pathname)) {
    $("table.olt tr").each(function () {
        var url = $(this).children("td:eq(0)").children("a").attr("href");
        var td = $(this).children("td:eq(1)");
        var num = parseInt(td.html().substr(0, td.html().length - 2), 10);
        var start = 0;
        if (num > 100) {
            start = parseInt(td.html().substring(0, td.html().length - 4), 10);
        }
        if (start > 0) {
            td.html("<a href='" + url + "?start=" + start + "00#last'>" + td.html() + "</a>");
        } else {
            td.html("<a href='" + url + "#last'>" + td.html() + "</a>");
        }
    });
}


if (is_photos_photo()) {
    console.log("相片页");
    $("span#display").each(function () {
        var url = $(this).html();
        $(this).html("<a href='" + url + "' target=_blank>" + url + "</a>");
    });
}


if ("/" == window.location.pathname && window.location.hostname.indexOf("douban.com") > -1) {
    var __expand_all = function () {
        $("div.status-wrapper").show();
    }
    var _a = document.createElement("a");
    _a.innerHTML = "展开全部";
    _a.href = "javascript:void(0)";
    _a.style.cssText = "right:70px;position:absolute;top:-24px;line-height:1.2";
    _a.addEventListener('click', __expand_all);
    $("div.hd")[0].appendChild(_a);


    $("li.isay-pic").find("a").unbind();
    $("li.isay-pic").find("a").attr("href", "https://www.douban.com/mine/photos");


    /*
    $(this).find("div.status-item").attr("data-target-type")
    + sns 广播
    + movie 电影
    + rec 推荐
    + site 小站
    + "" 转播？？  --  refresh


    
    $(this).find("div.status-item").attr("data-object-kind")
    + 1000 关注了新成员
    + 1001 图书
    + 1018 广播
    + 1002 想看
    + 1022 推荐网页
    + 1025 推荐相册中的照片
    + 1026 推荐相册
    + 1013 小组话题
    + 1015 日记
    + 1060 添加豆列
    + 2001 参加线上活动
    + 3043 豆瓣FM
    */
    var forbidShowUserNameStatusConfig = {//
        //data-uid:data-object-kind,data-object-kind,data-object-kind,data-object-kind
        //林夕 小组话题推荐
        "133431218": "-1013"
        //文森  全部
        , "115947384": "-ALL"
        //小蘑菇
        , "58404341": "-ALL"
        //
        , "61296149": "-ALL"
        //
        , "my774880647": "-ALL"
        , "1957950815": "-ALL"
        , "125837622": "-ALL"
        , "115970827": "-ALL"
        , "57425095": "-ALL"
        , "50012669": "-1000;"
        , "lemonhall2016": "+refresh"
        //dearbear
        , "1687784": "-ALL"
        , "park0322": "-ALL"
        , "143564618": "-ALL"
        , "140966605": "-ALL"
        , "133431218": "-ALL"
        , "84146679": "-ALL"
        , "64568774": "-ALL"
        , "boomla7": "-ALL"
        , "babustar": "-ALL"
        , "154141451": "-ALL"
        , "4383866": "-ALL"
        , "115116249": "-ALL"
    };

    var bHideStatus = function (data_uid, data_target_type, data_object_kind) {
        if (!forbidShowUserNameStatusConfig[data_uid]) {
            return false;
        } else if (-1 != forbidShowUserNameStatusConfig[data_uid].indexOf("+" + data_object_kind) //
            || -1 !== forbidShowUserNameStatusConfig[data_uid].indexOf("+" + data_target_type) //
            || -1 !== forbidShowUserNameStatusConfig[data_uid].indexOf("+" + "ALL")//
        )//end if
        {
            return false;
        } else if (-1 != forbidShowUserNameStatusConfig[data_uid].indexOf("-" + data_object_kind) //
            || -1 !== forbidShowUserNameStatusConfig[data_uid].indexOf("-" + data_target_type)//
            || -1 !== forbidShowUserNameStatusConfig[data_uid].indexOf("-" + "ALL")//
        )//end if
        {
            return true;
        }
        return false;
    }
    var get_data_uid_from_href = function (_href) {
        _href = _href.substring(0, _href.length - 1)
        return _href.substring(_href.lastIndexOf("/") + 1);
    }
    //首页里面，屏蔽某个人的广播。
    $("div.new-status").each(function () {
        var _status = $(this).find("div.status-item");
        var posterName = _status.find("a.lnk-people").html();
        var posterHref = _status.find("a.lnk-people").attr("href");
        //var data_uid=_status.attr("data-uid");
        var data_uid = get_data_uid_from_href(posterHref);
        var postType = _status.attr("data-target-type");
        var objectKind = _status.attr("data-object-kind");
        if (postType == "") {
            postType = "refresh";
        }
        if (!bHideStatus(data_uid, postType, objectKind)) {
            //无配置，打开的。
            console.log("show posterName:" + posterName + ",postType:" + postType + ",objectKind:" + objectKind + ",data_uid:" + data_uid);
        } else {
            //如果配置了，我不想看到这个人的状态。
            $(this).hide();
            console.log("hide posterName:" + posterName + ",postType:" + postType + ",objectKind:" + objectKind + ",data_uid:" + data_uid);
        }

        //如果是转播
        _href = $(this).find("span.reshared_by").find("a").attr("href");
        if (-1 != $(this).attr("class").indexOf("status-reshared-wrapper") || _href) {
            console.log("this is refresh");
            postType = "refresh";
            if (!_href) {
                _href = $(this).find("div.reshared_hd").attr("data-status-url");
            }
            data_uid = get_data_uid_from_href(_href);
            if (!bHideStatus(data_uid, postType, objectKind)) {
                //无配置，打开的。
                console.log("show posterName:" + posterName + ",postType:" + postType + ",objectKind:" + objectKind + ",data_uid:" + data_uid);
            } else {
                //如果配置了，我不想看到这个人的状态。
                $(this).hide();
                console.log("hide posterName:" + posterName + ",postType:" + postType + ",objectKind:" + objectKind + ",data_uid:" + data_uid);
            }
        }//end span.reshared_by
    });//end $("div.new-status").each(function())


}




//分享你大爷
if (is_group_topic()) {
    $("div.sharing").hide();
}

$("div.top-nav-doubanapp").hide();