var isModified = false;

var localLogs = {};
var localHistoryList = [];

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
}
function closeNav() {
    document.getElementById('mysidenav').style.width = '0';
}

function logBtnClick() {

    loadLogs()

    document.getElementById('editorDrop').style.display = 'none';
    document.getElementById('historyList').style.display = 'none';
    document.getElementById('logList').style.display = '';

    closeNav();

}

function editorBtnClick() {

    document.getElementById('editorDrop').style.display = '';
    document.getElementById('historyList').style.display = 'none';
    document.getElementById('logList').style.display = 'none';

    closeNav();
}

function historyBtnClick() {
    loadHistorys()

    document.getElementById('editorDrop').style.display = 'none';
    document.getElementById('historyList').style.display = '';
    document.getElementById('logList').style.display = 'none';

    closeNav();

}

function loadLogs() {
    var logEl = document.querySelector('#logList');
    logEl.textContent = '';

    var logList = [];

    var savedTimes = [];
    var markdowns = [];

    for (key in localLogs) {
        savedTimes.push(key);
        markdowns.push(localLogs[key]);
    }

    for (var i = 0; i < savedTimes.length; i++) {
        logList.push(((i + 1) + " # " + savedTimes[i] + " # " + markdowns[i]).substr(0, 200) + "...")
    }

    logList.forEach(l => {
        var newContent = document.createElement('p');
        newContent.innerHTML = `<button>삭제</button>&nbsp<span> ${l} </span>`;

        newContent.querySelector('button').addEventListener('click', () => {
            var idx = newContent.querySelector("span").innerHTML.split(" # ")[0];
            if (confirm(`${idx}번 데이터를 삭제하시겠습니까?`)) {

                console.log(Object.keys(localLogs)[idx - 1]);

                delete localLogs[Object.keys(localLogs)[idx - 1]];
                save(true);

                loadLogs();
                
                logEl.style.display = 'none';
                logEl.style.display = '';
            }
        });

        newContent.querySelector("span").addEventListener('click', () => {

            var logInfo = newContent.querySelector("span").innerHTML.split(" # ");

            if(!confirm(`${+logInfo[0]}번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)`)) {
                return;
            }
        
            editorBtnClick();
        
            var md = localLogs[logInfo[1]];
        
            editor.setMarkdown(md);
        
            editor.moveCursorToEnd();

            save();
        });

        logEl.appendChild(newContent);
    }); 
}

function loadHistorys() {
    localHistoryList = JSON.parse(localStorage.getItem('history'));

    var historyEl = document.querySelector('#historyList');
    historyEl.innerHTML = '';

    var historyList = [];

    for (var i = 0; i < localHistoryList.length; i++) {
        historyList.push(((i + 1) + " # " + localHistoryList[i]).substr(0, 200) + "...")
    }

    historyList.forEach(h => {

        var newContent = document.createElement('p');
        newContent.innerHTML = `<button>삭제</button>&nbsp<span> ${h} </span>`;

        newContent.querySelector('button').addEventListener('click', () => {

            var idx = +newContent.querySelector("span").innerHTML.split(" # ")[0];

            if (confirm(`${idx}번 데이터를 삭제하시겠습니까?`)) {

                localHistoryList.splice(idx - 1, 1);

                saveHistory();

                loadHistorys();
                
                historyEl.style.display = 'none';
                historyEl.style.display = '';

            }

        });

        newContent.querySelector("span").addEventListener('click', () => {

            var idx = +newContent.querySelector("span").innerHTML.split(" # ")[0];

            if(!confirm(`${idx}번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)`)) {
                return;
            }
        
            editorBtnClick();
        
            var md = localHistoryList[idx - 1];
        
            editor.setMarkdown(md);
        
            editor.moveCursorToEnd();

            save();
        });

        historyEl.appendChild(newContent);

    }); 
}

$(document).keydown(function(event) {

    if((event.ctrlKey || event.metaKey) && event.which == 83) {

        saveHistory(true);
        alert("저장되었습니다.");
        event.preventDefault();
        return false;

    };
}
);

function saveHistory(isCmd = false) {

    if (isCmd) {
        localHistoryList.push(editor.getMarkdown());
    }

    localStorage.removeItem('history');
    localStorage.setItem('history', JSON.stringify(localHistoryList));

}