window.onload = () => {
    let name = window.prompt("請輸入你的名子", "anonymous user");
    let avatar = window.prompt("請輸入你的頭貼(格式為圖片的連結)", "https://cdn.discordapp.com/emojis/960186560555393076.webp?size=160&quality=lossless");

    let _setting = (new URL(location.href)).searchParams;
    let p2p = new P2P(_setting);

    p2p.ownConfig = {
        name: name || "anonymous user",
        avatar: avatar || "https://cdn.discordapp.com/emojis/960186560555393076.webp?size=160&quality=lossless",
        host: p2p.uuid
    }

    p2p.init();

    setTimeout(() => {
        
        const containter = document.querySelector(".containter");
        const donut = document.querySelector(".donut");
        const msgcontainer = document.querySelector(".msgcontainer");
        const msgcontent = document.querySelector(".msgcontent");

        const typing = document.querySelector(".typing");
        typing.innerHTML = `
            <span style="vertical-align:middle"><img class="author" style='background-image: url(${p2p.ownConfig.avatar})'></img></span>&nbsp;${p2p.ownConfig.name} is typing
            <div class="box-flex">
                <div></div>
                <div></div>
                <div></div>
            </div>`;

        const author = document.querySelector(".author");
        const btnSend = document.querySelector(".btnSend");

        const btnInvite = document.querySelector("#invite");
        const btnJoin = document.querySelector("#join");

        const backgroundImages = [
            "4K_VerD.jpg",
            //"005.gif"
        ]

        const RGBColor = [
            "#FF0000",
            "#FF7F00",
            "#FFFF00",
            "#00FF00",
            "#0000FF",
            "#4B0082",
            "#8B00FF"
        ]

        const system_config = {
            name: "system",
            avatar: "https://cdn.discordapp.com/emojis/874309709933457482.webp?size=80&quality=lossless"
        }

        let inputIdCheck = false;
        let isTyping = false;
        let timeout = null;
        let backgroundImageIndex = 0;

        donut.style.display = "none";
        containter.style.display = "";        

        const sleep = (ms) => {
            return new Promise((res, rej) => setTimeout(() => res, ms))
        }

        const getMsg = () => {
            let msg  = msgcontent.value;
            msgcontent.value = "";
            return msg
        }

        const runMarquee = () => {
            const marquee = document.querySelector(".marquee");
            let now = 0;
            marquee.children.map((ele, i) => {
                ele.backgroundColor = RGBColor[i + now];
                now++;
            });
            sleep(50).then(() => runMarquee());
        }

        const handleMsg = () => {
            let msg = getMsg();
            renderMsg(null, msg, p2p.ownConfig);

            if(inputIdCheck) {
                p2p.connect(msg);
                inputIdCheck = false;
            } else {
                p2p.send({
                    msg: msg,
                    type: "MSG",
                });
            }
        }

        const renderMsg = (event, msg = null, _config) => {
            if (!msg) return;
            msgcontainer.innerHTML += `<h3>>&emsp;<span style='vertical-align:middle'><img class='author' style='background-image: url(${_config.avatar || "https://cdn.discordapp.com/emojis/960186560555393076.webp?size=160&quality=lossless"});'></img></span>&nbsp;${_config.name || "櫻2"} - <span class="timestamp">${new Date().toLocaleString()}</span><br><div class="content">${msg || msgcontent.value}</div></h3>`;
            msgcontainer.scrollTo(0, msgcontainer.scrollHeight);
        }

        const renderBackground = (source) => {
            document.body.style.backgroundImage = `url(${source})`;
        }
        renderBackground(`./assets/backgrounds/${backgroundImages[backgroundImageIndex]}`);

        author.onclick = () => {
            location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }

        // 預設的訊息內容
        let defaultMsg = [
            `<div class="marquee"><span>-</span><span>-</span><span>-</span><span>-</span><span>-</span><span>-</span><span>-</span></div><script>runMarquee()</script>`,
        ]
        if(p2p.config.isHomework == "ok") {
            defaultMsg = defaultMsg.concat([
                `<span class="highlighting">兩點距離</span> : <br> ((x1, y1)<sup>2</sup>-((x2, y2)<sup>2</sup>)<sup>1/2</sup>`,
                `<span class="highlighting">畢氏定理</span> : <br> &radic;2+5`
            ]);
        }
        defaultMsg.push(` <img src="https://cdn.discordapp.com/emojis/960186560555393076.webp?size=160&quality=lossless">`)
        defaultMsg.forEach((val, index) => {
            renderMsg(null, val, system_config);
        });

        p2p.ondata = (data) => {
            console.log(data);
            switch(data.type) {
                case "CONFIG":
                    p2p.config = data.config;
                    p2p.send({
                        config: p2p.ownConfig,
                        type: "RES_CONFIG"
                    });
                    break;
                case "RES_CONFIG":
                    p2p.config = data.config;
                    break;
                case "MSG":
                    renderMsg(null, data.msg, p2p.config);
                    break;
            }
        }


        msgcontent.oninput = () => {
            if (timeout) clearTimeout(timeout);
            isTyping = true;
            typing.style.visibility = "visible";
            timeout = setTimeout(() => {
                isTyping = false;
                typing.style.visibility = "hidden";
            }, 1000);
        }

        btnSend.onclick = handleMsg;


        window.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                handleMsg();
            }
        });

        msgcontainer.addEventListener("click", () => {
            if (backgroundImageIndex < backgroundImages.length - 1) {
                backgroundImageIndex++;
            } else {
                backgroundImageIndex = 0;
            }
            renderBackground(`./assets/backgrounds/${backgroundImages[backgroundImageIndex]}`);
        });

        btnInvite.addEventListener("click", () => {
            let url = new URL(location.href);
            url.search = new URLSearchParams(p2p.ownConfig);
            console.log("use link ", url.href);
            renderMsg(null, `邀請ID: ${p2p.ownConfig.host}<br>把它複製給你的朋友吧!`, system_config);
        });
        btnJoin.addEventListener("click", () => {
            inputIdCheck = true;
            renderMsg(null, `請貼上朋友的ID!`, system_config);
        });
    }, 2000);
}