var isModified = false;

var localLogs = {};
var localHistorys = [];

function processFile(file) {
    var reader = new FileReader();
    reader.onload = function (event) {
        editor.setMarkdown(event.target.result);
    };
    reader.readAsText(file);
}

const {Editor} = toastui;
const {codeSyntaxHighlight} = Editor.plugin;
const {colorSyntax} = Editor.plugin;

const editor = new toastui.Editor({
    el: document.querySelector('#editor'),
    previewStyle: 'vertical',
    initialEditType: "markdown",
    minHeight: '300px',
    height: '100%',
    width: '100%',
    plugins: [
        codeSyntaxHighlight, colorSyntax
    ],
    viewer: true,
    events: {
        change: function () {
            isModified = true;
        }
    }
});

// Using Method: Customize the first button
const toolbar = editor
    .getUI()
    .getToolbar();

editor
    .eventManager
    .addEventType('dlButton');
editor
    .eventManager
    .listen('dlButton', function () {
        var data = editor.getMarkdown();
        var mdFile;
        var downloadLink;

        if (data == null || data.trim() == "") {
            alert("입력된 글이 없습니다.");
            return;
        }

        if (!confirm("파일을 다운 받으시겠습니까?")) {
            alert("취소되었습니다.");
            return;
        }

        var filename = prompt("파일명을 입력해주세요. (기본값 : markdown)");

        if (filename == null) {
            alert("취소되었습니다.");
            return;
        }

        if (filename.trim() == "") {
            filename = "markdown";
        }

        // .md 파일을 위한 Blob 만들기
        mdFile = new Blob([data], {type: "text"})

        // Download link를 위한 a 엘리먼스 생성
        downloadLink = document.createElement("a")

        // 다운받을 md 파일 이름 지정하기
        downloadLink.download = filename + ".md";

        // 위에서 만든 blob과 링크를 연결
        downloadLink.href = window
            .URL
            .createObjectURL(mdFile)

        // 링크가 눈에 보일 필요는 없으니 숨겨줍시다.
        downloadLink.style.display = "none"

        // HTML 가장 아래 부분에 링크를 붙여줍시다.
        document
            .body
            .appendChild(downloadLink)

        // 클릭 이벤트를 발생시켜 실제로 브라우저가 '다운로드'하도록 만들어줍시다.
        downloadLink.click()
    });

toolbar.insertItem(0, {
    type: 'button',
    options: {
        className: 'first',
        event: 'dlButton',
        tooltip: 'Download file',
        text: '⇣',
        style: 'background:none; font-weight:bold; color:black;'
    }
});

editor
    .eventManager
    .addEventType('uploadButton');
editor
    .eventManager
    .listen('uploadButton', function () {
        if (!confirm("기존 내용이 모두 삭제됩니다. 계속 하시겠습니까?")) {
            alert("취소되었습니다.");
            return;
        }

        var input = document.createElement("input");
        input.type = "file";
        input.accept = "text.md"; // 확장자가 xxx, yyy 일때, ".xxx, .yyy"
        input.onchange = function (event) {
            processFile(event.target.files[0]);
        };
        input.click();
        save();
    });

toolbar.insertItem(1, {
    type: 'button',
    options: {
        className: 'first',
        event: 'uploadButton',
        tooltip: 'Upload file',
        text: '⇡',
        style: 'background:none; font-weight:bold; color:black;'
    }
});

editor
    .eventManager
    .addEventType('viewButton');
editor
    .eventManager
    .listen('viewButton', function () {
        var data = editor.getMarkdown();

        if (editor.getCurrentPreviewStyle() == 'tab') {
            editor.changePreviewStyle('vertical')
        } else {
            editor.changePreviewStyle('tab')
        }
    });

toolbar.insertItem(2, {
    type: 'button',
    options: {
        className: 'first',
        event: 'viewButton',
        tooltip: 'Change view mode',
        text: '♖',
        style: 'background:none; font-weight:bold; color:black;'
    }
});

editor
    .eventManager
    .addEventType('clipButton');
editor
    .eventManager
    .listen('clipButton', function () {
        var tempElem = document.createElement('textarea');
        tempElem.value = editor.getMarkdown();
        document
            .body
            .appendChild(tempElem);

        tempElem.select();
        document.execCommand("copy");
        document
            .getElementById("autoSaveDate")
            .innerHTML = "클립보드에 복사됨"
        document
            .body
            .removeChild(tempElem);
    });

toolbar.insertItem(2, {
    type: 'button',
    options: {
        className: 'first',
        event: 'clipButton',
        tooltip: 'Copy to clipboard',
        text: 'Clip',
        style: 'background:none; font-weight:bold; color:black; font-size: 1px; text-align: ce' +
                'nter;'
    }
});

toolbar.insertItem(4, {
    type: 'divider',
    options: {
        className: 'first',
        text: '|',
        style: 'background:none; color:black;'
    }
});

window.onload = function () {

    localLogs = JSON.parse(localStorage.getItem("markdown"));

    var savedTimes = [];
    var markdowns = [];

    for (key in localLogs) {
        savedTimes.push(key);
        markdowns.push(localLogs[key]);
    }

    editor.setMarkdown(markdowns[markdowns.length - 1]);
    document
        .getElementById("autoSaveDate")
        .innerHTML = savedTimes[savedTimes.length - 1];
}

autoSave = setInterval(function () {
    if (isModified) {
        if (Object.keys(localLogs).length > 20) {
            delete localLogs[Object.keys(localLogs)[0]];
        }
        save(true);
    }
}, 3000);

function save(isAuto = false) {

    var nowTime = getNow() + "에 저장됨.";

    if (isAuto) {

        var lastKey = Object.keys(localLogs)[Object.keys(localLogs).length - 1];
        delete localLogs[lastKey];
        
    }
    localLogs[nowTime] = editor.getMarkdown();

    localStorage.clear;
    localStorage.setItem("markdown", JSON.stringify(localLogs));

    document
        .getElementById("autoSaveDate")
        .innerHTML = nowTime;

    isModified = false;

}

function getNow() {
    var now = new Date;
    return now.getFullYear() + '/' + now.getMonth() + 1 + '/' + now
        .getDate()
        .toString()
        .padStart(2, '0') + ' ' + now
        .getHours()
        .toString()
        .padStart(2, '0') + ':' + now
        .getMinutes()
        .toString()
        .padStart(2, '0') + ':' + now
        .getSeconds()
        .toString()
        .padStart(2, '0');
}

var holder = document.getElementById('editorDrop');

holder.ondragover = function () {
    this.className = 'hover';
    return false;
};
holder.ondragend = function () {
    this.className = '';
    return false;
};
holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    var file = e
            .dataTransfer
            .files[0],
        reader = new FileReader();
    reader.onload = function (event) {
        if (!confirm("기존 내용이 모두 삭제됩니다. 계속 하시겠습니까?")) {
            alert("취소되었습니다.");
            return;
        }
        editor.setMarkdown(event.target.result);
        save();
    };
    reader.readAsText(file);

    return false;
};

function openNav() {
    
    document.getElementById('mysidenav').style.width = '200px';

    //document.getElementById('editorDrop').style.marginLeft = '200px';

    //document.getElementById('logList').style.marginLeft = '200px';
    //document.body.style.backgroundColor = 'rgba(0,0,0)';
}
function closeNav() {
    var editContent = document.getElementById('editorDrop');
    var historyContent = document.getElementById('historyList');
    var logContent = document.getElementById('logList');

    document.getElementById('mysidenav').style.width = '0';

    editContent.style.margin = '0 auto';
    editContent.style.width = '95%';
    editContent.style.marginTop = '52px'

    historyContent.style.margin = '0 auto';
    historyContent.style.width = '92%';
    historyContent.style.marginTop = '60px'

    logContent.style.margin = '0 auto';
    logContent.style.width = '92%';
    logContent.style.marginTop = '60px'
}

function logBtnClick() {

    loadLogs()

    document.getElementById('editorDrop').style.display = 'none';
    document.getElementById('historyList').style.display = 'none';
    document.getElementById('logList').style.display = 'block';

    closeNav();
}

function editorBtnClick() {
    var logs = document.getElementById('logList');
    logs.innerHTML = '';

    document.getElementById('editorDrop').style.display = 'block';
    document.getElementById('historyList').style.display = 'none';
    document.getElementById('logList').style.display = 'none';

    closeNav();
}

function historyBtnClick() {

    loadHistorys()

    document.getElementById('editorDrop').style.display = 'none';
    document.getElementById('historyList').style.display = 'block';
    document.getElementById('logList').style.display = 'none';

    closeNav();
}

function loadLogs() {
    var logs = document.getElementById('logList');
    logs.innerHTML = '';

    var logs = [];

    var savedTimes = [];
    var markdowns = [];

    for (key in localLogs) {
        savedTimes.push(key);
        markdowns.push(localLogs[key]);
    }

    for (var i = 0; i < savedTimes.length; i++) {
        logs.push(((i + 1) + " # " + savedTimes[i] + " # " + markdowns[i]).substr(0, 300) + "...")
    }

    console.log(logs);

    logs.forEach(l => {
        var newA1 = document.createElement("a");

        newA1.innerHTML = 'X';

        newA1.setAttribute("id", (parseInt(l.split("  #  ")[0]) - 1) + 'a');
        newA1.setAttribute("style", "color: red; font-weight: 700;");
        newA1.setAttribute("onclick", 'removeLog(this.id)');

        var newA2 = document.createElement("a");

        newA2.innerHTML = l;

        newA2.setAttribute("onclick", 'setLog(this.innerText)');
        newA2.setAttribute("style", "margin-left: 10px");

        newP = document.createElement("p");

        var parent = document.getElementById("logList");

        parent.appendChild(newA1);
        parent.appendChild(newA2);
        parent.appendChild(newP);
    }); 
}

function loadHistorys() {
    localHistorys = JSON.parse(localStorage.getItem('history'));

    console.log(localHistorys);

    var historyL = document.getElementById('historyList');
    historyL.innerHTML = '';

    var historys = [];

    var markdowns = [];


    for (var i = 0; i < localHistorys.length; i++) {
        historys.push(((i + 1) + " # " + localHistorys[i]).substr(0, 300) + "...")
    }

    console.log(historys);

    historys.forEach(h => {
        var newA1 = document.createElement("a");

        newA1.innerHTML = 'X';

        newA1.setAttribute("id", (parseInt(h.split("  #  ")[0]) - 1) + 'a');
        newA1.setAttribute("style", "color: red; font-weight: 700;");
        newA1.setAttribute("onclick", 'removeHistory(this.id)');

        var newA2 = document.createElement("a");

        newA2.innerHTML = h;

        newA2.setAttribute("onclick", 'setHistory(this.innerText)');
        newA2.setAttribute("style", "margin-left: 10px");

        newP = document.createElement("p");

        historyL.appendChild(newA1);
        historyL.appendChild(newA2);
        historyL.appendChild(newP);
    }); 
}

function setLog(log) {
    var datas = log.split(' # ');
    if(!confirm(datas[0] + '번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)')) {
        return;
    }

    editorBtnClick();

    if (datas[0] != Object.keys(localLogs).length) {
        save(true);
    }

    var md = localLogs[datas[1]];

    editor.setMarkdown(md);

    editor.moveCursorToEnd();
    
    save();
}

function setHistory(history) {
    var historyInfo = history.split(' # ');
    if(!confirm(historyInfo[0] + '번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)')) {
        return;
    }

    editorBtnClick();

    var md = localHistorys[parseInt(historyInfo[0]) - 1];

    console.log(md);

    editor.setMarkdown(md);

    editor.moveCursorToEnd();

    //localHistorys.splice(parseInt(historyInfo[0]) - 1, 1);


}

function removeLog(id) {
    var num = parseInt(id.split('a')[0]);

    var key = Object.keys(localLogs)[num];

    if(!confirm((num + 1) + '번 데이터를 삭제할까요?')) {
        return;
    }

    if (num <= 0) {
        alert("현재 작성 중인 문서가 저장됩니다.");
    }

    delete localLogs[key];
    save(true);

    loadLogs();
    
    document.getElementById('logList').style.display = 'none';
    document.getElementById('logList').style.display = 'block';
}

function removeHistory(id) {
    var idx = parseInt(id.split('a')[0]);

    if(!confirm((idx + 1) + '번 데이터를 삭제할까요?')) {
        return;
    }

    localHistorys.splice(idx, 1);

    saveHistory();

    loadHistorys();
    
    document.getElementById('historyList').style.display = 'none';
    document.getElementById('historyList').style.display = 'block';
}

$(document).keydown(function(event) {
    // If Control or Command key is pressed and the S key is pressed
    // run save function. 83 is the key code for S.
    if((event.ctrlKey || event.metaKey) && event.which == 83) {
        // Save Function

        saveHistory(true);
        alert("저장되었습니다.");
        event.preventDefault();
        return false;
    };
}
);

function saveHistory(isCmd = false) {

    if (isCmd) {
        localHistorys.push(editor.getMarkdown());
    }

    localStorage.removeItem('history');
    localStorage.setItem('history', JSON.stringify(localHistorys));

}