var isModified = false;

        function processFile(file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                editor.setMarkdown(event.target.result);
            };
            reader.readAsText(file);
        }

        const { Editor } = toastui;
        const { codeSyntaxHighlight } = Editor.plugin;
        const { colorSyntax } = Editor.plugin;

        const editor = new toastui.Editor({
            el: document.querySelector('#editor'),
            previewStyle: 'vertical',
            initialEditType: "markdown",
            minHeight: '300px',
            height: '100%',
            plugins: [codeSyntaxHighlight, colorSyntax],
            viewer: true,
            events: {
                change: function ()
                {
                    isModified = true;
                }
            }
        });

        // Using Method: Customize the first button
        const toolbar = editor.getUI().getToolbar();

        editor.eventManager.addEventType('SaveButton');
        editor.eventManager.listen('SaveButton', function() {
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
                    downloadLink.href = window.URL.createObjectURL(mdFile)

                    // 링크가 눈에 보일 필요는 없으니 숨겨줍시다.
                    downloadLink.style.display = "none"

                    // HTML 가장 아래 부분에 링크를 붙여줍시다.
                    document.body.appendChild(downloadLink)

                    // 클릭 이벤트를 발생시켜 실제로 브라우저가 '다운로드'하도록 만들어줍시다.
                    downloadLink.click()
        });

        toolbar.insertItem(0, {
        type: 'button',
        options: {
            className: 'first',
            event: 'SaveButton',
            tooltip: 'Save',
            text: '⇣',
            style: 'background:none; font-weight:bold; color:black;'
        }
        });

        editor.eventManager.addEventType('uploadButton');
        editor.eventManager.listen('uploadButton', function() {
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

        editor.eventManager.addEventType('viewButton');
        editor.eventManager.listen('viewButton', function() {
            var data = editor.getMarkdown();
  
            if (editor.getCurrentPreviewStyle() == 'tab') {
                editor.changePreviewStyle('vertical')
            }
            else {
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

        window.onload = function () {
            editor.setMarkdown(localStorage.getItem("markdown"));
            document.getElementById("autoSaveDate").innerHTML = localStorage.getItem("savedTime");
        }

        autoSave = setInterval(function() {
            if (isModified) {
                save();
            }
        }, 5000);

        function save() {
            localStorage.clear;
            localStorage.setItem("markdown", editor.getMarkdown());

            var nowTime = getNow() + "에 저장됨.";
            localStorage.setItem("savedTime", nowTime);
            document.getElementById("autoSaveDate").innerHTML = nowTime;

            isModified = false;
        }

        function getNow() {
            var now = new Date;
            return now.getFullYear() + '/' + now.getMonth() + 1 + '/' + now.getDate().toString().padStart(2, '0') + ' ' + 
                now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
        }

        var holder = document.getElementById('editorDrop');

        holder.ondragover = function() {
            this.className = 'hover';
            return false;
        };
        holder.ondragend = function() {
            this.className = '';
            return false;
        };
        holder.ondrop = function(e) {
            this.className = '';
            e.preventDefault();

            var file = e.dataTransfer.files[0],
                reader = new FileReader();
            reader.onload = function(event) {
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