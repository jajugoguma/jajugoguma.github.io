---
layout: post
title: Toast UI Editor 사용기
subtitle: 재밌다!
comments: false
---

들어가기에 앞서, 잘못된 내용이 있을 수 있습니다. 
대부분 내용이 개인적인 생각과 경험만을 통해 작성되어 있으므로 만약 틀린것이 있다면 댓글 부탁 드립니다 :)

## Toast UI Editor
Toast UI Editor는 NHN에서 개발한 마크다운&위지윅 에디터입니다.
오픈소스로 운영되고 있고, 국내외에서 꽤나 유명하다고 알고 있습니다.

저는 이 블로그를 운영하게 되면서 처음으로 마크다운을 다루게 되었는데요,
사내 동기분들께서 typora, bear 등 좋은 마크다운 에디터를 소개해주셨었습니다.

그렇지만, 그 에디터들은 제 취향이 아니었습니다.
저는 작성하는 에디터와 그 결과를 보여주는 뷰어가 한 화면에 분할되어 보여지는 것이 좋았고 이를 지원하는 Mac용 앱인 Macdown이라는 앱을 다운받아 사용하게 되었습니다.
그런데, 조금 문제가 있었습니다. 에디터에서 작성한 내용이 뷰어로 전달되는데 이 과정이 별로 부드럽지 못했고 그렇게 길지 않은 글임에도 불구하고 렉이 있었습니다.

그때, Dooray 내 마크다운 에디터를 보게 되었습니다. 제가 생각하는 그 모든 것을 가지고 있었죠.
그래서 알게 된 것이 바로 이 Toast UI Editor입니다.

Toast UI Editor에 관한 자세한 내용은 [tui,editor](https://github.com/nhn/tui.editor)와 [TOAST UI](https://ui.toast.com/)에서 볼 수 있습니다.

## 사용해보기
세부적인 구현 방법과 예제들은 [Toast UI Editor repo](https://nhn.github.io/tui.editor/latest/)에서 확인해 보시길 바랍니다.

먼저 웹페이지에 에디터를 띄워봐야겠죠?

저는 CDN 서버를 이용해 환경을 설정하는 방법을 이용해 봣습니다.

```html
...
<head>
    ...
    <!-- Editor's Dependecy Style -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.48.4/codemirror.min.css"/>
    <!-- Editor's Style -->
    <link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" />
</head>
...
```
먼저, 위와 같이 CSS 파일을 불러옵니다.

```html
...
<body>
    ...
    <script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
</body>
...
```
그리고 바디의 하단에 Javascript 소스를 불러옵니다.

```html
...
<body>
    ...
    <div id="editor"></div>
    ...
</body>
...
```
이어서 원하는 위치에 id를 editor로 지정해 blcok요소를 생성합니다.

이제 에디터의 인스턴스를 생성해 줍시다.
```js
const editor = new Editor({
  el: document.querySelector('#editor')
});
```
위 코드는 Javascript code로 html 내에 `<script> ... </script>` 태그로 감싸주거나 `<script src="your/src/dir.js>`로 외부에 `.js`파일로 작성해서 불러와 주면 됩니다.

![img](https://user-images.githubusercontent.com/18183560/84381972-d3c62600-ac24-11ea-99e2-9640b0a2bfe8.png)
사진처럼 에디터 화면을 볼 수 있습니다.(내용은 없겠지요!)

다만, editor와 그의 부모 요소의 배경색은 흰색으로 해주세요!
제가 못찾은건지, 배경색을 바꾸면 에디터의 배경색만 흰색으로 유지되어서 보기가 안좋더라구요.😢

## 플러그인 추가하기
Toast UI Editor는 다양하고 강력한 플러그인들을 지원합니다.
`code-syntax-highlight`, `color-syntax`뿐만 아니라 `chart`도 그릴 수 있고, `tabel-merged-cell`을 이용해 병합된 셀이 있는 테이블도 생성 할 수 있으며 `uml`을 이용해 UML을 그릴수도 있습니다.
플러그인 설치 또한 어렵지 않습니다. 

```html
...
<head>
    ...
    <link rel="stylesheet" href="https://uicdn.toast.com/tui-color-picker/latest/tui-color-picker.min.css"/>
</head>
```
먼저 사용하고 하는 플러그인의 CSS를 불러옵니다.

```html
...
<body>
    ...
    <script src="https://uicdn.toast.com/editor-plugin-color-syntax/latest/toastui-editor-plugin-color-syntax.min.js"></script>
</body>
```
그리고 플러그인의 스크립트도 불러옵니다.

```js
...
const {colorSyntax} = Editor.plugin;
...
const editor = new Editor({
    ...
    plugins: [colorSyntax],
});
```
그리고 위와 같이 플러그인을 설정하기만 해주면 됩니다.

플러그인 리스트는 [여기](https://github.com/nhn/tui.editor/tree/master/plugins/)에 있으니 원하는 플러그인을 추가해서 사용하면 됩니다.

## 나만의 기능 추가하기
기본으로 지원하는 기능만으로는 제 욕구를 충족시켜주지 못했습니다.
그래서 저만의 기능을 넣어보기로 했죠!

Toast UI Editor의 API 문서를 보니 상단 toolBar에 커스텀 버튼을 넣을 수 있는 것을 확인했습니다. [Customizing Toolbar Buttons Ex](https://nhn.github.io/tui.editor/latest/tutorial-example19-customizing-toolbar-buttons) 

```js
const toolbar = editor
        .getUI()
        .getToolbar();
```
먼저 툴바에 버튼을 넣기위해 툴바 객체를 가져옵니다.

```js
    editor
        .eventManager
        .addEventType('dlButton');
```
그리고 에디터에 이벤트를 등록해줍니다.
저는 다운로드 기능을 넣기 위해 다운로드 버튼의 클릭 이벤트를 넣어주기로 했습니다.

```js
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


        mdFile = new Blob([data], {type: "text"})

        downloadLink = document.createElement("a")

        downloadLink.download = filename + ".md";

        downloadLink.href = window
            .URL
            .createObjectURL(mdFile)
                
        downloadLink.style.display = "none"

        document
            .body
            .appendChild(downloadLink)
                
        downloadLink.click()
   });
```
그리고 아까 등록한 이벤트에 대한 리스너를 구현해 줍니다.
저는 다운로드를 받기 위해 에디터로 부터 작성한 마크다운을 불러와 다운로드 할 수 있도록 코드를 작성 했습니다.

```js
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
```
마지막으로 아까 불러온 tool bar 객체에 버튼을 넣어줍니다.
버튼을 넣을 위치, 타입(계속 버튼이라고 했지만 버튼이 아닌 다른 타입도 있습니다!)을 지정해주고, 옵션(class name, 이벤트(아까 등록한 그 이벤트를 지정해 주면 됩니다.), tool tip(Mouse over시 나타나는 문구입니다.), text(버튼 모양) 그리고 스타일을 지정해 줍니다.

이런식으로 저는 새 파일, 파일 다운로드, 파일 업로드, 클립보드 복사버튼, 뷰모드 전환 버튼을 추가해 줬습니다!
![image](https://user-images.githubusercontent.com/41339744/106928855-00502480-6757-11eb-942d-b7244255f551.png)


그 외에도 `Drag&Drop` 파일 업로드 기능, 로그(작성 기록)기능, 히스토리(사용자 임의 저장) 기능을 추가로 구현했습니다.

이러한 기능들을 구현하는데 가장 잘 사용한 기능은 `editor.getMarkdown()`과 `editor.setMarkdown()` 입니다. 각각 에디터의 문장을 추출하거나 삽입하는 함수인데 이 덕분에 앞처럼 많은 기능을 구현 할 수 있었습니다.
<br>
<br>
아직 제가 html과 CSS, Javascript를 다루는데 능숙하지 않을 뿐더러 모두 새로 접한지 한달이 안되어서 개인적으로는 제가 작성한 코드 등이 썩 마음에 들지는 않습니다.
그렇지만 지금도 계속 배우고 있고, 기존의 문제점에 대해 배우면 그에 맞춰 리팩토링을 찬찬히 진행 중입니다.

제가 구현한 Toast UI Editor는 블로그 우측 상단의 Markdown Editor 버튼을 클릭하거나 [Markdown Editor](https://jajugoguma.github.io/toastEditor.html)에서 이용할 수 있습니다.
현재 MacOS, Chrome에서만 정상작동하고 Windows 10과 MacOS의 safari에서는 UI가 깨지거나 로그 기능이 작동하지 않는 문제가 있습니다.
조만간 위 문제들에 대해 빠르게 해결해 볼 예정입니다.

지금 이 글도 저곳에서 작성되고 있습니다 :)
![img](https://user-images.githubusercontent.com/41339744/106932179-c41ec300-675a-11eb-8283-5633609a039c.png)