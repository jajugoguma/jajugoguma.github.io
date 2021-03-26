(function () {
	const autoSaveDate = document.querySelector('.autoSaveDate');
	const editorDrop = document.querySelector('.editorDrop');
	const sidebar = document.querySelector('.sidebar');
	const logListElement = document.querySelector('.logList');
	const historyListElement = document.querySelector('.historyList');

	let isModified = false;

	let localLogs = {};
	let localHistoryList = [];

	const { Editor } = toastui;
	const { codeSyntaxHighlight } = Editor.plugin;
	const { colorSyntax } = Editor.plugin;

	const editor = new toastui.Editor({
		el: document.querySelector('#editor'),
		previewStyle: 'vertical',
		initialEditType: 'markdown',
		minHeight: '300px',
		height: '100%',
		width: '100%',
		plugins: [codeSyntaxHighlight, colorSyntax],
		viewer: true,
		events: {
			change: function () {
				isModified = true;
			},
		},
	});

	const loadDatas = () => {
		if (localStorage.getItem('history') === null) {
			localStorage.setItem('history', JSON.stringify(localHistoryList));
		}

		localHistoryList = JSON.parse(localStorage.getItem('history'));

		if (localStorage.getItem('markdown') === null) {
			localStorage.setItem('markdown', JSON.stringify(localLogs));
		}

		localLogs = JSON.parse(localStorage.getItem('markdown'));
	};

	const setTime = () => {
		const localLogKeys = Object.keys(localLogs);

		editor.setMarkdown(localLogs[localLogKeys[localLogKeys.length - 1]]);
		autoSaveDate.textContent = localLogKeys[localLogKeys.length - 1];
	};

	//Save
	const save = (isAuto = false) => {
		const nowTime = getNow() + '에 저장됨.';

		if (isAuto) {
			delete localLogs[Object.keys(localLogs)[Object.keys(localLogs).length - 1]];
		}

		if (editor.getMarkdown() !== '') {
			localLogs[nowTime] = editor.getMarkdown();
		}

		localStorage.clear;
		localStorage.setItem('markdown', JSON.stringify(localLogs));

		autoSaveDate.textContent = nowTime;

		isModified = false;
	};

	const autoSave = setInterval(() => {
		if (isModified) {
			if (Object.keys(localLogs).length > 20) {
				delete localLogs[Object.keys(localLogs)[0]];
			}
			save(true);
		}
	}, 3000);

	document.onkeydown = (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key === 's') {
			saveHistory(true);
			alert('저장되었습니다.');
			event.preventDefault();
			return false;
		}
	};

	const saveHistory = (isCmd = false) => {
		if (isCmd) {
			localHistoryList.push(editor.getMarkdown());
		}

		localStorage.removeItem('history');
		localStorage.setItem('history', JSON.stringify(localHistoryList));
	};

	window.onload = function () {
		loadDatas();
		setTime();
	};

	const processFile = (file) => {
		var reader = new FileReader();
		reader.onload = function (event) {
			editor.setMarkdown(event.target.result);
		};
		reader.readAsText(file);
	};

	//Custom button
	// Using Method: Customize the first button
	const toolbar = editor.getUI().getToolbar();

	editor.eventManager.addEventType('dlButton');
	editor.eventManager.listen('dlButton', function () {
		const data = editor.getMarkdown();
		let mdFile;
		let downloadLink;

		if (data == null || data.trim() == '') {
			alert('입력된 글이 없습니다.');
			return;
		}

		if (!confirm('파일을 다운 받으시겠습니까?')) {
			alert('취소되었습니다.');
			return;
		}

		var filename = prompt('파일명을 입력해주세요. (기본값 : markdown)');

		if (filename == null) {
			alert('취소되었습니다.');
			return;
		}

		if (filename.trim() == '') {
			filename = 'markdown';
		}

		// .md 파일을 위한 Blob 만들기
		mdFile = new Blob([data], { type: 'text' });

		// Download link를 위한 a 엘리먼스 생성
		downloadLink = document.createElement('a');

		// 다운받을 md 파일 이름 지정하기
		downloadLink.download = filename + '.md';

		// 위에서 만든 blob과 링크를 연결
		downloadLink.href = window.URL.createObjectURL(mdFile);

		// 링크가 눈에 보일 필요는 없으니 숨겨줍시다.
		downloadLink.style.display = 'none';

		// HTML 가장 아래 부분에 링크를 붙여줍시다.
		document.body.appendChild(downloadLink);

		// 클릭 이벤트를 발생시켜 실제로 브라우저가 '다운로드'하도록 만들어줍시다.
		downloadLink.click();
	});

	toolbar.insertItem(0, {
		type: 'button',
		options: {
			className: 'first',
			event: 'dlButton',
			tooltip: 'Download file',
			text: '⇣',
			style: 'background:none; font-weight:bold; color:black;',
		},
	});

	editor.eventManager.addEventType('uploadButton');
	editor.eventManager.listen('uploadButton', function () {
		if (!confirm('기존 내용이 모두 삭제됩니다. 계속 하시겠습니까?')) {
			alert('취소되었습니다.');
			return;
		}

		var input = document.createElement('input');
		input.type = 'file';
		input.accept = 'text.md'; // 확장자가 xxx, yyy 일때, ".xxx, .yyy"
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
			style: 'background:none; font-weight:bold; color:black;',
		},
	});

	editor.eventManager.addEventType('viewButton');
	editor.eventManager.listen('viewButton', function () {
		if (editor.getCurrentPreviewStyle() == 'tab') {
			editor.changePreviewStyle('vertical');
		} else {
			editor.changePreviewStyle('tab');
		}
	});

	toolbar.insertItem(2, {
		type: 'button',
		options: {
			className: 'first',
			event: 'viewButton',
			tooltip: 'Change view mode',
			text: '♖',
			style: 'background:none; font-weight:bold; color:black;',
		},
	});

	editor.eventManager.addEventType('clipButton');
	editor.eventManager.listen('clipButton', function () {
		const tempElem = document.createElement('textarea');
		tempElem.value = editor.getMarkdown();
		document.body.appendChild(tempElem);

		tempElem.select();
		document.execCommand('copy');
		autoSaveDate.textContent = '클립보드에 복사됨';
		document.body.removeChild(tempElem);
	});

	toolbar.insertItem(2, {
		type: 'button',
		options: {
			className: 'first',
			event: 'clipButton',
			tooltip: 'Copy to clipboard',
			text: 'Clip',
			style: 'background:none; font-weight:bold; color:black; font-size: 1px; text-align: ce' + 'nter;',
		},
	});

	toolbar.insertItem(4, {
		type: 'divider',
		options: {
			className: 'first',
			text: '|',
			style: 'background:none; color:black;',
		},
	});

	editor.eventManager.addEventType('newButton');
	editor.eventManager.listen('newButton', function () {
		if (confirm('새 파일을 작성합니다.\n기존 내용을 저장하시겠습니까?')) {
			saveHistory(true);
		}
		save();

		editor.setMarkdown('');
	});

	toolbar.insertItem(0, {
		type: 'button',
		options: {
			className: 'first',
			event: 'newButton',
			tooltip: 'New file',
			text: '📄',
			style: 'background:none; font-weight:bold; color:black; font-size: 1px; text-align: ce' + 'nter;',
		},
	});

	const getNow = () => {
		const now = new Date();
		return `${now.getFullYear()}/${now.getMonth() + 1}/${now
			.getDate()
			.toString()
			.padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now
			.getMinutes()
			.toString()
			.padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
	};

	//Drag & Drop

	editorDrop.ondragover = function () {
		this.className = 'hover';
		return false;
	};
	editorDrop.ondragend = function () {
		this.className = '';
		return false;
	};
	editorDrop.ondrop = function (e) {
		this.className = '';
		e.preventDefault();

		const file = e.dataTransfer.files[0],
			reader = new FileReader();
		reader.onload = function (event) {
			if (!confirm('기존 내용이 모두 삭제됩니다. 계속 하시겠습니까?')) {
				alert('취소되었습니다.');
				return;
			}
			editor.setMarkdown(event.target.result);
			save();
		};
		reader.readAsText(file);

		return false;
	};

	//Sidebar
	const openNav = () => {
		sidebar.style.width = '200px';
	};
	const closeNav = () => {
		sidebar.style.width = '0';
	};

	const logBtnClick = () => {
		loadLogs();

		editorDrop.style.display = 'none';
		historyListElement.style.display = 'none';
		logListElement.style.display = '';

		closeNav();
	};

	const editorBtnClick = () => {
		editorDrop.style.display = '';
		historyListElement.style.display = 'none';
		logListElement.style.display = 'none';

		closeNav();
	};

	const historyBtnClick = () => {
		loadHistorys();

		editorDrop.style.display = 'none';
		historyListElement.style.display = '';
		logListElement.style.display = 'none';

		closeNav();
	};

	document.querySelector('.openmenu').addEventListener('click', () => {
		openNav();
	});

	document.querySelector('.closebtn').addEventListener('click', () => {
		closeNav();
	});

	document.querySelector('.editorbtn').addEventListener('click', () => {
		editorBtnClick();
	});

	document.querySelector('.historybtn').addEventListener('click', () => {
		historyBtnClick();
	});

	document.querySelector('.logbtn').addEventListener('click', () => {
		logBtnClick();
	});

	const loadLogs = () => {
		logListElement.textContent = '';

		const savedTimes = Object.keys(localLogs);

		savedTimes.forEach((key, i) => {
			const logData = `${i + 1} # ${key} # ${localLogs[key]}`.substr(0, 200) + '...';

			const newContent = document.createElement('p');

			newContent.innerHTML = `<button>삭제</button>&nbsp<span> ${logData} </span>`;

			newContent.querySelector('button').addEventListener('click', () => {
				const idx = newContent.querySelector('span').textContent.split(' # ')[0];
				if (confirm(`${idx}번 데이터를 삭제하시겠습니까?`)) {
					delete localLogs[Object.keys(localLogs)[idx - 1]];
					save(true);

					loadLogs();

					logListElement.style.display = 'none';
					logListElement.style.display = '';
				}
			});

			newContent.querySelector('span').addEventListener('click', () => {
				const logInfo = newContent.querySelector('span').textContent.split(' # ');

				if (!confirm(`${logInfo[0]}번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)`)) {
					return;
				}

				editorBtnClick();

				editor.setMarkdown(localLogs[logInfo[1]]);

				editor.moveCursorToEnd();

				save();
			});

			logListElement.appendChild(newContent);
		});
	};

	const loadHistorys = () => {
		localHistoryList = JSON.parse(localStorage.getItem('history'));

		historyListElement.textContent = '';

		localHistoryList.forEach((history, i) => {
			formattedHistory = `${i + 1} # ${history}`.substr(0, 200) + '...';

			const newContent = document.createElement('p');
			newContent.innerHTML = `<button>삭제</button>&nbsp<span> ${formattedHistory} </span>`;

			newContent.querySelector('button').addEventListener('click', () => {
				const idx = newContent.querySelector('span').innerHTML.split(' # ')[0];

				if (confirm(`${idx}번 데이터를 삭제하시겠습니까?`)) {
					localHistoryList.splice(idx - 1, 1);

					saveHistory();

					loadHistorys();

					historyListElement.style.display = 'none';
					historyListElement.style.display = '';
				}
			});

			newContent.querySelector('span').addEventListener('click', () => {
				const idx = newContent.querySelector('span').textContent.split(' # ')[0];

				if (!confirm(`${idx}번 데이터를 불러올까요? (기존 내용은 삭제 됩니다.)`)) {
					return;
				}

				editorBtnClick();

				editor.setMarkdown(localHistoryList[idx - 1]);

				editor.moveCursorToEnd();

				save();
			});

			historyListElement.appendChild(newContent);
		});
	};
})();
