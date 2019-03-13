String.prototype.render = function (context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;

    return this.replace(tokenReg, function (word, slash1, token, slash2) {
        if (slash1 || slash2) {  
            return word.replace('\\', '');
        }

        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var i, length, variable;

        for (i = 0, length = variables.length; i < length; ++i) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) return '';
        }
        return currentObject;
    });
};

var re = /x/;
console.log(re);
re.toString = function() {
    showMessage('哈哈，你打开了控制台，是想要看看我的秘密吗？', 5000, true);
    return '';
};

$(document).on('copy', function (){
    showMessage('你都复制了些什么呀，转载要记得加上出处哦', 5000, true);
});

$('.waifu-tool .fui-home').click(function (){
    //window.location = 'https://www.fghrsh.net/';
    window.location = window.location.protocol+'//'+window.location.hostname+'/'
});

$('.waifu-tool .fui-eye').click(function (){
    loadOtherModel();
});

$('.waifu-tool .fui-chat').click(function (){
    showHitokoto();
});

$('.waifu-tool .fui-user').click(function (){
    loadRandModel();
});

//window.hitokotoTimer = window.setInterval(showHitokoto,30000);
/* 检测用户活动状态，并在空闲时 定时显示一言 */
var getActed = false;
window.hitokotoTimer = 0;
var hitokotoInterval = false;

$(document).mousemove(function(e){getActed = true;}).keydown(function(){getActed = true;});
setInterval(function() { if (!getActed) ifActed(); else elseActed(); }, 1000);

function ifActed() {
    if (!hitokotoInterval) {
        hitokotoInterval = true;
        hitokotoTimer = window.setInterval(showHitokoto, 30000);
    }
}

function elseActed() {
    getActed = hitokotoInterval = false;
    window.clearInterval(hitokotoTimer);
}

function showMessage(text, timeout, flag){
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        //console.log(text);
        
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout){
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}

function initModel(waifuPath){
    
    if (waifuPath === undefined) waifuPath = '';
    var modelId = localStorage.getItem('modelId');
    var modelTexturesId = localStorage.getItem('modelTexturesId');
    
    if (modelId == null) {
        
        /* 首次访问加载 指定模型 的 指定材质 */
        
        var modelId = 1;            // 模型 ID
        var modelTexturesId = 53    // 材质 ID
        
    } loadModel(modelId, modelTexturesId);
	
	$.ajax({
        cache: true,
        url: waifuPath+'waifu-tips.json',
        dataType: "json",
        success: function (result){
            $.each(result.mouseover, function (index, tips){
                $(document).on("mouseover", tips.selector, function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({text: $(this).text()});
                    showMessage(text, 3000);
                });
            });
            $.each(result.click, function (index, tips){
                $(document).on("click", tips.selector, function (){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({text: $(this).text()});
                    showMessage(text, 3000, true);
                });
            });
            $.each(result.seasons, function (index, tips){
                var now = new Date();
                var after = tips.date.split('-')[0];
                var before = tips.date.split('-')[1] || after;
                
                if((after.split('/')[0] <= now.getMonth()+1 && now.getMonth()+1 <= before.split('/')[0]) && 
                   (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])){
                    var text = tips.text;
                    if(Array.isArray(tips.text)) text = tips.text[Math.floor(Math.random() * tips.text.length + 1)-1];
                    text = text.render({year: now.getFullYear()});
                    showMessage(text, 6000, true);
                }
            });
        }
    });
}

function loadModel(modelId, modelTexturesId){
    localStorage.setItem('modelId', modelId);
    if (modelTexturesId === undefined) modelTexturesId = 0;
    localStorage.setItem('modelTexturesId', modelTexturesId);
    loadlive2d('live2d', 'https://api.fghrsh.net/live2d/get/?id='+modelId+'-'+modelTexturesId, console.log('live2d','模型 '+modelId+'-'+modelTexturesId+' 加载完成'));
}

function loadRandModel(){
    var modelId = localStorage.getItem('modelId');
    var modelTexturesId = localStorage.getItem('modelTexturesId');
    
    var modelTexturesRandMode = 'rand';     // 可选 'rand'(随机), 'switch'(顺序)
    
    $.ajax({
        cache: false,
        url: 'https://api.fghrsh.net/live2d/'+modelTexturesRandMode+'_textures/?id='+modelId+'-'+modelTexturesId,
        dataType: "json",
    });
}

function loadOtherModel(){
    var modelId = localStorage.getItem('modelId');
    
    var modelTexturesRandMode = 'switch';     // 可选 'rand'(随机), 'switch'(顺序)
    
    $.ajax({
        cache: false,
        url: 'https://api.fghrsh.net/live2d/'+modelTexturesRandMode+'/?id='+modelId,
        dataType: "json",
        success: function (result){
            loadModel(result.model['id']);
            showMessage(result.model['message'], 3000, true);
        }
    });
}
