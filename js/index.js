/*==============================*/
//     * author -> Print        //
//     * QQ -> 2662256509       //
/*=============================*/
(function(){
    //兼容H5定时器
    window.requestAnimationFrame = window.requestAnimationFrame || function(fn){return setTimeout(fn,1000/60)};
    window.cancelAnimationFrame = window.cancelAnimationFrame || function(timer){clearTimeout(timer)};


    function PieGame(config){
        this.obj = {};  //储存游戏中的对象
        this.config = config;   //储存游戏配置信息
        this.method = {};   //用于储存一些内部公开的函数
        //储存游戏信息
        this.Game_Info = {};
    }

    //启用程序(储存一些初始化公用方法)
    PieGame.prototype.exe = function(){
        this.PieGameInit();
    };

    //生成游戏初始界面
    PieGame.prototype.PieGameInit = function(){
        var This = this;

        //添加游戏容器
        var oMain = document.createElement('div');
        oMain.id = "main";
        document.body.appendChild(oMain);

        //添加游戏菜单
        var Menu_Wrap = document.createElement('div');
        Menu_Wrap.className = "menu-wrap";
        Menu_Wrap.innerHTML = '<div class="title">Pie Game - Print</div><div class="game-menu"><div class="column column1">开始游戏</div><div class="column column2">排行榜</div><div class="column column3">关于作者</div></div>';
        oMain.appendChild(Menu_Wrap);
        setTimeout(function(){Menu_Wrap.className += " show";});


        //给对象加上这些元素
        this.obj.oMain = oMain;
        this.obj.oMenu_Wrap = Menu_Wrap;
        this.obj.oMenu_option = Menu_Wrap.querySelectorAll(".game-menu .column");

        //把this储存到自己身上
        each(this.obj.oMenu_option,function(t){
            this.sourceThis = t;
        }, this);

        //添加默认游戏信息
        this.Game_Info.score = 0;
        this.Game_Info.health = 5;
        this.Game_Info.get = 0;
        this.Game_Info.playTime = 0;

        //开始游戏
        addEvent(this.obj.oMenu_option[0], "click", function(){
            this.sourceThis.PieGameStart();
        });
        //生成排行榜
        addEvent(this.obj.oMenu_option[1], "click", function(){
            //创建list
            createList();
            This.obj.oMenu_Wrap.style.display = "none";
            //获取并填入数据
            FillData.call(This);
            //超出出现滚动条
            This.obj.oMain.style.overflowY = "auto";
        });
        //关于作者
        addEvent(this.obj.oMenu_option[2], "click", function(){
            alert("QQ: 2662256509\nGitHub：https://github.com/PrintG\nemmmm... Excuse me sir");
        });

        //创建table
        function createList(){
            var list = document.createElement("div");
                list.className = 'list';
                list.innerHTML = '<h2 class="title">Game 排行榜<span>(仅显示本周成绩)</span></h2><table width="580" border="1"><thead><tr><td>排行</td><td>用户名</td><td>分数</td><td>Get的红包</td><td>时间</td></tr></thead></table><button>确定</button>';
                This.obj.oMain.appendChild(list);
                addEvent(list.getElementsByTagName('button')[0], "click", function(){
                    this.parentNode.parentNode.removeChild(this.parentNode);
                    This.obj.oMenu_Wrap.style.display = "block";
                    This.obj.oMain.style.overflowY = "hidden";
                });
            This.obj.list = list;
        };
        //填入数据
        function FillData(){
            var tBody = document.createElement('tbody');

            //获取数据

            var dCookie = DataChange();
            if(dCookie[0][0]==="") return;

            var dCLeng = dCookie.length;
            for(i = 0; i < dCLeng; i++){
                var tr = document.createElement("tr"),
                    dL = dCookie[i].length;
                for(j = 0; j <= dL; j++){
                    var td = document.createElement("td");
                    if(j === 0){
                        ChangeText(td, i+1);
                    }else{
                        ChangeText(td, dCookie[i][j-1]);
                    }
                    tr.appendChild(td);
                }
                tBody.appendChild(tr);
            }

            this.obj.list.getElementsByTagName("table")[0].appendChild(tBody);

        }

        function ChangeText(obj, inner){
            typeof obj.textContent === "string"?obj.textContent = inner:obj.innerText = inner;
        };
        this.method.ChangeText = ChangeText;

    };

    //用于生成人物,人物移动等
    PieGame.prototype.createRole = function(){
        var role = document.createElement("div");
        role.className = "role";
        role.info = {};
        this.obj.oMain.appendChild(role);

        var This = this;

        //控制移动方向
        // 0 -> 不移动  1 -> 左   2 -> 右
        role.info.dir = 0,
        role.info.isDown = false;
        //按键按下
        addEvent(document, 'keydown', function(e){
            e = e || window.event;
                if(!role.info.isDown){
                    if(e.keyCode===65||e.keyCode===37) role.info.dir = 1;
                    if(e.keyCode===68||e.keyCode===39) role.info.dir = 2;
                    moveRole();
                    role.info.isDown = true;
                }
        });
        //松开
        addEvent(document, 'keyup', function(e){
            role.info.dir = 0;
            role.info.isDown = false;
        });
        //人物移动
        function moveRole(){
            role.info.speed = This.config.RoleMoveSpeed;
            switch(role.info.dir){
                case 1:
                    role.info.speed = -role.info.speed;
                    break;
                case 0:
                     return;
                    break;
            }

            var x = role.offsetLeft + role.info.speed;

            x = Math.max(x, 0);
            x = Math.min(x, This.obj.oMain.offsetWidth-role.offsetWidth);

            role.style.left = x + 'px';
            requestAnimationFrame(moveRole);
        }
        //无炸弹开挂模式
        /*gg()
        function gg(){
            setInterval(function(){
                var val = role.offsetLeft + 66;
                if(val > This.obj.oMain.offsetWidth-role.offsetWidth){
                    val = 0;
                }
                role.style.left = val + 'px';
            },13);
        }*/
        this.obj.oRole = role;
    };

    //用于生成 红包/炸弹 红包移动等
    PieGame.prototype.createRed = function(){
        var This = this;
        this.obj.RedcreateTimer = setInterval(createR, this.config.hongbaoSpeed);

        function createR(){
            var hongbao = document.createElement("div");
            var tmpA = document.getElementById("tmpAudio");

            hongbao.className = (Math.floor(Math.random()*This.config.enemy)===0?"zhadan":"hongbao");
            This.obj.oMain.appendChild(hongbao);
            hongbao.style.left = Math.floor(Math.random()*(This.obj.oMain.offsetWidth-hongbao.offsetWidth)) + 'px';

            //下落
            hongbao.config = {};
            down();
            function down(){
                var y = hongbao.offsetTop + This.config.hongbaoDownSpeed;
                if(y>document.body.clientHeight&&hongbao.parentNode){
                    This.obj.oMain.removeChild(hongbao);
                }else{
                    hongbao.style.top = y + 'px';
                    requestAnimationFrame(down);
                }
                //红包与角色撞上了
                if(collision(This.obj.oRole, hongbao)&&hongbao.parentNode){

                    if(hongbao.className === "hongbao"){
                        //撞上的是红包

                        //增加分数
                        This.obj.Game_Msg_Span[0].innerHTML = This.Game_Info.score += This.config.score;
                        This.obj.Game_Msg_Span[2].innerHTML = ++This.Game_Info.get;

                        //添加音乐
                        setAudio("audio/get.mp3" ,tmpA, 1000);
                    }else{
                        //撞上的是炸弹
                        This.Game_Info.health --;
                        if(This.Game_Info.health<0) This.Game_Info.health = 0;
                        var str = "♥♥♥♥♥",
                            RoleSrc = "img/maomi.png";
                        switch(This.Game_Info.health){
                            case 4:
                                str = "♥♥♥♥♡";
                                RoleSrc = "img/maomi-boom1.png";
                                break;
                            case 3:
                                str = "♥♥♥♡♡";
                                RoleSrc = "img/maomi-boom2.png";
                                break;
                            case 2:
                                str = "♥♥♡♡♡";
                                RoleSrc = "img/maomi-boom3.png";
                                break
                            case 1:
                                str = "♥♡♡♡♡";
                                RoleSrc = "img/maomi-boom4.png";
                                break;
                            case 0:
                                //游戏结束
                                This.PieGameEnd();
                                break;
                        };
                        This.obj.Game_Msg_Span[1].innerHTML = str;
                        This.obj.oRole.style.backgroundImage = "url("+RoleSrc+")";
                        setAudio("audio/boom.mp3" ,tmpA, 1000);
                    }
                    if(hongbao.parentNode){
                        This.obj.oMain.removeChild(hongbao);
                    }
                };
            }
        }


        //设置音乐
        /*
            src 音乐路径
            parent 父级
            removeTime 过多久移出
         */
        function setAudio(src, parent, removeTime){
            var music = document.createElement("audio");
            music.src = src;
            music.autoplay = true;
            parent.appendChild(music);
            setTimeout(function(){
                music.parentNode.removeChild(music);
            },removeTime);
        }

        //碰撞检测
        function collision(obj1, obj2){
            var L1 = obj1.offsetLeft,
                L2 = obj2.offsetLeft + obj2.clientWidth,
                T1 = obj1.offsetTop,
                T2 = obj2.offsetTop + obj2.clientHeight,
                R1 = L1 + obj1.clientWidth,
                R2 = obj2.offsetLeft;

            return !(L1 > L2 || T1 > T2 || R2 > R1);
        }

        //把碰撞检测储存到公用函数里面
        this.method.collision = collision;
    };

    //游戏开始
    PieGame.prototype.PieGameStart = function(){
        var This = this;
        this.obj.oMenu_Wrap.style.display = "none";

        //创建人物
        var Role = this.createRole();

        //创建游戏信息
        var Game_Msg = document.createElement("div");
        Game_Msg.className = "game-msg";
        Game_Msg.innerHTML = "<p>分数：<span class='score'>0</span>分</p>"+
                             "<p>生命值：<span class='health'>♥♥♥♥♥</span></p>"+
                             "<p>接到的红包：<span class='get'>0</span>个</p>"+
                             "<p>你已经玩了：<span class='gameTime'>0</span>分钟了</p>";

        this.obj.oMain.appendChild(Game_Msg);

        this.obj.Game_Msg = Game_Msg;
        this.obj.Game_Msg_Span = each(Game_Msg.getElementsByTagName("p"),function(){
            return this.getElementsByTagName("span")[0];
        });

        This.config.STime = new Date();

        //实时监测已玩时间
        This.config.STimer = setInterval(function(){
            This.obj.Game_Msg_Span[3].innerHTML = ((new Date()-This.config.STime)/1000/60).toFixed(0);
        },1000);

        //掉红包
        this.createRed();

        //根据时间增加难度
        this.config.difAd = [];
        var nowDate = new Date();
        this.config.difAd.push(setTimeout(function(){
           This.config.hongbaoDownSpeed = 5;
            This.config.score = 300;
            This.config.enemy = 4;
        },15000));
        this.config.difAd.push(setTimeout(function(){
           This.config.hongbaoDownSpeed = 8;
            This.config.score = 561;
            This.config.enemy = 3;
        },30000));
        this.config.difAd.push(setTimeout(function(){
            This.config.hongbaoDownSpeed = 10;
            This.config.score = 1623;
            This.config.enemy = 2;
        },60000));
        this.config.difAd.push(setTimeout(function(){
            This.config.hongbaoDownSpeed = 14;
            This.config.score = 2134;
            This.config.enemy = 2;
        },100000));
    };

    //游戏结束
    PieGame.prototype.PieGameEnd = function(){
        var This = this;

        //关闭监测已玩时间
        clearInterval(this.config.STimer);
        //移除Role
        var role = this.obj.oRole;
        role.parentNode && role.parentNode.removeChild(role);
        //停止 红包、炸弹 的生成
        clearInterval(this.obj.RedcreateTimer);
        //移除信息栏
        var msg = this.obj.Game_Msg;
            msg.parentNode.removeChild(msg);

        //关闭困难增加延时器
        var dl = This.config.difAd.length;
        for(var i = 0; i < dl; i++){
            clearTimeout(this.config.difAd[i]);
        }

        //恢复正常困难
        This.config.hongbaoDownSpeed = 5;
        This.config.score = 123;
        This.config.enemy = 6;

        //生成结束页面
        var Game_Over = document.createElement("div");
        Game_Over.className = "game-over";
        Game_Over.innerHTML = '<h3 class="title">Game Over</h3>'+
            '<p>你的分数是：<span>'+this.Game_Info.score+'</span>分</p>'+
            '<p>共Get到：<span>'+this.Game_Info.get+'</span>个红包</p>'+
            '<p>留下你的名字：<input type="text"></p>'+
            '<button>确定</button>';
        this.obj.oMain.appendChild(Game_Over);
        addEvent(Game_Over.getElementsByTagName('button')[0], 'click', function(){
            //页面存在炸弹或者红包则不可点击
            if(!This.obj.oMain.querySelector(".hongbao,.zhadan")){
                var name = Game_Over.getElementsByTagName("input")[0].value;

                if(name ==='' || name === undefined){
                    name = "无名氏";
                }

                if(name.length>=10){
                    alert("用户名过长！！！,请重新输入");
                    return;
                }

                var par = Game_Over.parentNode;
                par.parentNode.removeChild(par);
                //要存入Cookie的数据

                var score = This.Game_Info.score,
                    get = This.Game_Info.get,
                    date = new Date(),
                    time = date.getFullYear()+"年"+(date.getMonth()+1)+"月"+date.getDate()+"日"+date.getHours()+"时"+(date.getMinutes())+"分";

                var gScore = getCookie("score"),
                    gGet = getCookie("get"),
                    gName = getCookie("name"),
                    gTime = getCookie("time");

                var rS = gScore===''?score:gScore+"&"+score,
                    rG = gGet===''?get:gGet+"&"+get,
                    rN = gName===''?name:gName+"&"+name,
                    rT = gTime===''?time:gTime+"&"+time;

                createCookie({
                    score : rS,
                    get : rG,
                    name : rN,
                    time : rT,
                }, 7);
                This.exe();
            }
        });
    };

    var Game = new PieGame({
        RoleMoveSpeed : 8,  //人物移动速度
        hongbaoSpeed : 150,    //红包生成速度 单位 ms
        hongbaoDownSpeed : 5,  //红包下落速度(建议在10及以下)
        score : 123,    //每次增加的分数
        STime : null,   //用于储存开始时的时间
        enemy : 6,  //敌人出现的几率 值越小出现的次数越多
    });

    window.onload = function(){
        var Game = new PieGame({
            RoleMoveSpeed : 8,  //人物移动速度
            hongbaoSpeed : 150,    //红包生成速度 单位 ms
            hongbaoDownSpeed : 5,  //红包下落速度(建议在10及以下)
            score : 123,    //每次增加的分数
            STime : null,   //用于储存开始时的时间
            enemy : 6,  //敌人出现的几率 值越小出现的次数越多
        });
        Game.exe();
    }

    //公用内部全局函数
        /*=== 事件的绑定和解绑 ===*/
        function addEvent(obj, event, fn){
            obj.attachEvent?obj.attachEvent("on"+event, fn):obj.addEventListener(event, fn, false);
        }
        function removeEvent(obj, event, fn){
            obj.detachEvent?obj.detachEvent("on"+event, fn):obj.removeEventListener(event, fn);
        }
        /*=== 遍历元素 ===*/
        /*
            obj        要遍历的元素
            fn         遍历执行的函数
            uThis      把一个this通过实参传进去,用fn的第一个参数接受

         */
        function each(obj, fn, uThis){
            var objL = obj.length;
            var r = []; //返回值
            if(objL===undefined){
                r = fn.call(obj,uThis);
            }else{
                for(var i = 0; i < objL; i++){
                    r.push(fn.call(obj[i],uThis));
                }
            }
            return r;
        }
        /***********
           创建cookie
           mJson:  'cookie名' : '值'
           date:  几天后过期
        ***********/
        function createCookie(mJson, date){
            var time = new Date(new Date().getTime() + date*24*60*60*1000).toUTCString();
            for(var key in mJson){
                document.cookie = key+"="+mJson[key]+"; expires="+time;
            }
        }

        /***********
           删除cookie
           key:  cookie名字
        ***********/
        function removeCookie(key){
            var json = {};
            json[key] = "";
            createCookie(json,-1);
        }
        /***********
           获取cookie
           key:  cookie名字
        ***********/
        function getCookie(key){
            var Val = document.cookie.match(new RegExp('\\b'+key+'=([^;]*)(;|$)'));
            return Val?Val[1]:'';
        }
        //关于表格数据的处理
        function DataChange(){
            var cookie = [
                getCookie("name").split('&'),
                getCookie("score").split('&'),
                getCookie("get").split('&'),
                getCookie("time").split('&'),
            ];
            var cookie_length = cookie.length;

            //储存处理后的数据
            var dCookie = [];

            //根据情况增加数组长度
            var Il = cookie[0].length;
            for(var i = 0; i < Il; i++){
                dCookie.push([]);
            }

            //数据处理
            for(var i = 0; i < cookie_length; i++){
                var cL = cookie[i].length;
                for(var j = 0; j < cL; j++){
                    dCookie[j][i] = cookie[i][j];
                }
            }
            //排序
            dCookie.sort(function(a, b){
                return b[1]-a[1];
            });
            return dCookie;
        }

})();