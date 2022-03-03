//данные, необходимые для корректной и быстрой анимации
var animationArgs = {};

//alert("-2");
animationArgs.symbolWidth = 7;//ширина 1 символа (моноширинный шрифт)
animationArgs.w = 0;//ширина самого широкого из элементов (самая длинная цифровая запись)
animationArgs.symbolHeight = 10;//высота 1 символа (собственно размер шрифта - высота от базовой линии до верхней границы кегельной площадки)
animationArgs.main = null;//для упрощения анимации, чтобы не искать все время
animationArgs.ids = [];//id анимируемых элементов массива
//var time = 0;//отладочный параметр
var historyOfInput = {
	history: [],
	pos: 0,
	add: function(e) {
		this.pos++;
		this.history.push(e);
	},
	previous: function() {
		if (this.pos - 1 >= 0)
			document.getElementById('input').value = this.history[--this.pos];
	},
	next: function() {
		if (this.pos + 1 < this.history.length)
			document.getElementById('input').value = this.history[++this.pos];
	}
};
//alert("-1");
//настройки анимации и отображения
var settings = {
	elMarginLeft: 4,
	mainPadding: 3,
	defaultFontSize: 25,
	interval: 50,
	standardVelocityK: 1/7,//2 px в 50 мс при стандартном размере шрифта шириной 7 пкс
	pause: 2000,
	elBack: '#ffffff',
	elColor: '#000000',
	elBorder: '#FFC285',
	mainBack: '#F6E4B6',
	/*mainColor: '#000000',*/
	mainBorder: '#ffffff',
	outputBack: '#85FF96',
	outputColor: '#000000',
	outputBorder: '#ffffff',
	highlightChosen: '#5BDE02',
	highlightEls: '#F287D0'
};

//предикат - запущен ли gui на движке Java FX
function runsUnderJavaFx() {
	return window.navigator.userAgent.toLowerCase().indexOf('javafx') > -1;
}

//alert('1');
//переопределение alert, чтобы в браузере не вылазили сообщения, предназначающиеся java
//переопределение console.log, чтобы
//1)если в коде используется эта функция, мы смогли увидеть вывод, когда запускаем страницу под JavaFX
//2)смогли увидеть, даже если не подключен мост(мало ли), поэтому через alert (у него есть слушатель всегда)
if (runsUnderJavaFx()) {
	console._log = console.log;
	console.log = function(s) {
		alert('java::log()'+s);
	}
} else {
	window._alert = window.alert;
	window.alert = function(s) {
		if (s.startsWith('java::')) console.warn(s);
		else _alert(s);
	}
}

//alert('1.5');

//отладочная функция-наэкранный заменитель лога
function error(str) {
	var where = document.getElementById('error');
	if (where) where.innerHTML += str+"<br>";
	else console.log("(error()) "+str);
	where.scrollTop = where.scrollHeight;
}

//функция для автоскроллинга ответа по мере добавления записей
function out(str) {
	var where = document.getElementById('output');
	if (where) where.innerHTML += str+"<br>";
	else console.log("(out()) "+str);
	where.scrollTop = where.scrollHeight;
}

//функция переключает видимость объекта
//только для блочных элементов
function toggle_show(id) {
	var elem = document.getElementById(id);
	elem.style.display = (elem.style.display=='block') ? 'none' : 'block';
}

function showSettings() {
	toggle_show('settings_list');
	toggle_show('settings_placeholder');
}
//alert('2');
//инициализируем
var initialize = function() {
	//событие onload не работает в javafx, поэтому надо извращаться
	window.htmlLoaded = true;
	animationArgs.main = document.getElementById("main");
	if (!animationArgs.main) {
		alert('There\'s no element with id "main" on the page; animation cannot be played');
		return;
	}
	var settingsChange = document.getElementById('settingsChange');
	if (settingsChange) {
		settingsChange.oninput = function() {
			setUnready('settingsAppliedIndicator', 'настройки не сохранены');
		};
	} else {
		alert('There\'s no element with id "settingsChange" on the page. You will not be able to change any settings using the textfields below.');
	}
	applyFontSize();
	setReady('animationFinishedIndicator', 'Нажмите Sort!, чтобы начать анимацию.');
	setReady('settingsAppliedIndicator', 'Настройки не изменялись');
	document.getElementById('settings_list').style.display = 'none';
	document.getElementById('settings_placeholder').style.display = 'block';
	document.getElementById('input').value = '-11 0 10 5 -4 -3 -4 8 18 2';
	//console.log('initialize() finished');
};

//alert('3');
if (runsUnderJavaFx()) {
	//error('I\'m running under javafx');
} else {
	//error('I\'m running under some browser');
}

//alert('4');

//выход
function exit() {
	java.exit();
}

//применить размер шрифта. для корректной отработки анимации
function applyFontSize() {
	var fs = document.getElementById('font_size');
	var fontSize = (parseInt(fs.value) || settings.defaultFontSize);//если в строке встретятся запрещенные символы. "или" нужно для случая возврата NaN

	animationArgs.main.style.fontSize = fontSize+'px';
	animationArgs.main.style.height = (fontSize*2 + settings.mainPadding*2)+'px';

	var symbol = document.getElementById("symbol_width");
	symbol.style.fontSize = fontSize+'px';
	animationArgs.symbolWidth = (symbol.clientWidth + 1);
	animationArgs.symbolHeight = (symbol.clientHeight + 1);
	fs.value = ""+fontSize;
}

function setReady(id, message) {//id индикатора состояния какого-либо процесса
	var indicator = document.getElementById(id);
	indicator.style.backgroundColor = '#99ff99';
	indicator.style.borderColor = '#ccffcc';
	indicator.setAttribute('title', message);
}

function setUnready(id, message) {//id индикатора состояния какого-либо процесса
	var indicator = document.getElementById(id);
	indicator.style.backgroundColor = '';
	indicator.style.borderColor = '';
	indicator.setAttribute('title', message);
}

function applySettings() {
	for (var p in settings) {
		var field = document.getElementById('set_'+p);
		//console.log(p);
		if (field && field.value) {
			//console.log(field.value);
			var value;
			if ("0" <= field.value[0] && field.value[0] <= "9") {
				value = field.value*1; //parseFloat слишком терпим к некорректным символам
			} else value = field.value;
			if (isNaN(value) && !(typeof value == 'string')) {
				alert('Field \''+p+'\' in settings is syntactically incorrect, settings will not change');
			} else {
				//console.log(value + " type of " + (typeof value));
				settings[p] = value;
			}
		}
	}
	style();
	setReady('settingsAppliedIndicator', 'Настройки успешно применены');
}

function style() {
	main.style.borderColor = settings.mainBorder;
	main.style.backgroundColor = settings.mainBack;
	//var elements = document.getElementsByClassName;
	var output = document.getElementById('output');
	output.style.backgroundColor = settings.outputBack;
	output.style.color = settings.outputColor;
	output.style.borderColor = settings.outputBorder;
	var elements = animationArgs.ids;//если они есть, то они есть и в ids
	for (var i = 0; i < elements.length; i++) {
		document.getElementById(elements[i]).style.backgroundColor = settings.elBack;
		document.getElementById(elements[i]).style.color = settings.elColor;
		document.getElementById(elements[i]).style.borderColor = settings.elBorder;
	}
}

//вспомогательная функция, получить координаты элемента
function getCoords(elem) {
	var box = elem.getBoundingClientRect();
	return {
		top: box.top + pageYOffset,
		left: box.left + pageXOffset
	};
}

//создать все элементы, которые будут участвовать в анимации
function initAnimatedElements(seq, max, min) {
	//error('initAnimatedElements called with seq.length='+seq.length);
	//error(max);
	if (new String(max).length > new String(min).length) var longest = new String(max).length;
	else var longest = new String(min).length;
	animationArgs.w = animationArgs.symbolWidth * longest;
	var mainCoords = getCoords(animationArgs.main);
	animationArgs.main.style.width = settings.mainPadding*2 + (animationArgs.w + settings.elMarginLeft)*seq.length+'px';
	for (var i = 0; i < seq.length; i++) {
		var div = document.createElement('div');
		
		div.setAttribute('class', 'element');
		div.style.backgroundColor = settings.elBack;
		div.style.color = settings.elColor;
		div.style.borderColor = settings.elBorder;
		
		div.style.width = animationArgs.w+'px';
		div.style.height = animationArgs.symbolHeight+'px';
		div.style.top = mainCoords.top + settings.mainPadding+'px';//граница сверху и снизу по 3 пкс
		div.style.left = mainCoords.left + settings.mainPadding + i*(animationArgs.w + settings.elMarginLeft) + 'px';//граница слева 2 пкс
		
		div.innerHTML = "<span>"+seq[i]+"</span>";
		div.id = "id_"+i;
		animationArgs.ids.push(div.id);
		animationArgs.main.appendChild(div);
	}
	var pointer1 = document.createElement('div');
		pointer1.style.width = animationArgs.symbolWidth+'px';
		pointer1.style.height = animationArgs.symbolHeight+'px';
		pointer1.style.top = mainCoords.top + animationArgs.symbolHeight + settings.mainPadding + 'px';
		pointer1.style.left = mainCoords.left + settings.mainPadding + animationArgs.w/2 + 'px';
		pointer1.innerHTML = "^";
		pointer1.id = 'pointer1';
	var pointer2 = document.createElement('div');
		pointer2.style.width = animationArgs.symbolWidth+'px';
		pointer2.style.height = animationArgs.symbolHeight+'px';
		pointer2.style.top = mainCoords.top + animationArgs.symbolHeight + settings.mainPadding + 'px';
		pointer2.style.left = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*(seq.length-1) + animationArgs.w/2 + 'px';
		pointer2.innerHTML = "^";
		pointer2.id = 'pointer2';
	var border1 = document.createElement('div');
		border1.style.width = '2px';
		border1.style.height = animationArgs.symbolHeight*2+'px';
		border1.style.top = mainCoords.top + settings.mainPadding + 'px';
		border1.style.left = mainCoords.left + settings.mainPadding + 'px';
		border1.id = 'border1';
	var border2 = document.createElement('div');
		border2.style.width = '2px';
		border2.style.height = animationArgs.symbolHeight*2+'px';
		border2.style.top = mainCoords.top + settings.mainPadding+'px';
		border2.style.left = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*seq.length + 'px';
		border2.id = 'border2';
	animationArgs.main.appendChild(pointer1);
	animationArgs.main.appendChild(pointer2);
	animationArgs.main.appendChild(border1);
	animationArgs.main.appendChild(border2);
	//error("---");
}

function clear() {
	while (animationArgs.main.firstChild) {
		animationArgs.main.removeChild(animationArgs.main.firstChild);
	}
	//error('animationArgs.main - '+animationArgs.main.firstChild);
	animationArgs.ids = [];
	document.getElementById('input').value = '';
	document.getElementById('output').innerHTML = '';
	animationArgs.main.removeEventListener('anim', animationArgs.main.listener, false);
	animationArgs.main.style.width = '';
	setReady('animationFinishedIndicator', 'Нажмите Sort!, чтобы начать анимацию.');
	//document.getElementById('error').innerHTML = 'log cleared';
	document.getElementById('sort').value = 'Sort!';
}

//сбор и отправка данных java в виде JSON, а затем получение ответа в той же форме
function sort() {
	if (animationArgs.main.firstChild) {
		clear();
		return;
	}
	document.getElementById('sort').value = 'Clear / Stop';
	var input = document.getElementById('input');
	if (!input) {
		alert('var "input" in function sort() is '+input);
		return;
	} else if (input.value == '') {
		alert('You haven\'t entered any numbers to sort.');
		return;
	}
	//console.log('sort 1');
	historyOfInput.add(input.value);
	var seq = input.value.split(' ');
	var flag = false; var numNaN = null; var iNaN = -1;
	var max = -Infinity; var min = +Infinity;
	//console.log('sort 2');
	seq = seq.map(function(item, i) {//преобразовать массив строк в массив чисел
		var res = parseInt(item);
		if (!flag && isNaN(res)) {
			flag = true;
			numNaN = item;
			iNaN = i;
		}
		if (res > max) max = res;
		if (res < min) min = res;
		return res;
	});
	//console.log('sort 3');
	if (flag) {
		alert('Incorrect input: for element "'+numNaN+'" at position '+iNaN);
		return;
	}
	initAnimatedElements(seq, max, min);

	///console.log('sort 4');
	var strSeq = JSON.stringify(seq);
	//error("calling java.qs()");
	//console.log('sort 5');
	var result = java.qs(strSeq);
	document.getElementById('output').innerHTML = 'Ответ: ' + JSON.parse(result).join(',') + '<hr>Решение:<br>';
	getStateObj(window._sendChangesReply);//это вынужденный костыль, проблема описана в отчете
	//error('Reply: '+result);
	//error("sort() is finished");
}

//прием плана анимации и установка слушателя
function getStateObj(jsonStr) {
	//error('getStateObj() called');
	//error(jsonStr);
	if (!jsonStr) {
		alert('For some reason jsonStr is "'+jsonStr+'". It can be caused by too late execution of java.sendChanges(). Please try again');
		return;
	}
	var states = JSON.parse(jsonStr);
	//error('states = ' + jsonStr.replace(/\{/g, '{<br>'));
	var i = 0;
	if (!Array.isArray(states)) {
		alert('<font color="red">function getStateObj(): can\'t play anim. states is not an array</font>');
		return;
	}
	//time = Date.now();
	setUnready('animationFinishedIndicator', 'анимация не закончилась');
	var previousChosen = null;
	//var output = document.getElementById('output');
	animationArgs.main.listener = function() {
		if (i == states.length) {
			//error('animation finished');
			out('Сортировка окончена.');
			setReady('animationFinishedIndicator', 'Анимация окончена.');
			animationArgs.main.removeEventListener('anim', animationArgs.main.listener, false);
			return;
		}
		//error('Current i='+i);
		var state = states[i++];
		switch (state.type) {
			case 1:
				//error(previousChosen);
				//if () out('Сортировка окончена.');
				if (state.pointer1 == state.pointer2) out('Сортировать массив длиной в 1 элемент не нужно. (на позиции '+state.pointer1+')');
				else if (!(Math.max(state.pointer1, state.pointer2) >= animationArgs.ids.length))
					out("Начнем сортировку на подмассиве, который находится между " + state.border1 + "-м и " + state.border2 + "-м элементами<br>");
				animSetBordersAndPointers(state.pointer1, state.pointer2, state.border1, state.border2, previousChosen);
			break;
			case 2:
				out("Выберем опорный элемент на позиции " + state.chosen + "<br>");
				animHighlightChosen(state.chosen);
				previousChosen = animationArgs.ids[state.chosen];
			break;
			case 3:
				out("Элемент не >= опорного. Передвинем <font color=\"red\">красную</font> стрелочку вправо<br>");
				animMovePointer1(state.pointer1);
			break;
			case 4:
				out("Элемент не < опорного. Передвинем <font color=\"blue\">синюю</font> стрелочку влево<br>");
				animMovePointer2(state.pointer2);
			break;
			case 5:
				if ((state.pos1 != state.pos2) && (state.pos1 != state.chosen)) out("<font color=\"red\">Нашли</font> элемент >= опорного, на позиции "+state.pos1+"<br>");
				else if ((state.pos1 != state.pos2) && (state.pos1 == state.chosen)) out("<font color=\"red\">Красная</font> стрелочка дошла до опорного элемента на позиции "+state.pos1+"<br>");
				else out("Кусок отсортирован.<br>");
				animBlinkElem(state.pos1);
			break;
			case 6:
				if ((state.pos1 != state.pos2) && (state.pos2 != state.chosen)) out("<font color=\"blue\">Нашли</font> элемент < опорного, на позиции "+state.pos2+"<br>");
				else if ((state.pos1 != state.pos2) && (state.pos2 == state.chosen)) out("<font color=\"blue\">Синяя</font> стрелочка дошла до опорного элемента на позиции "+state.pos2+"<br>");
				else out("Кусок отсортирован.<br>");
				animBlinkElem(state.pos2);
			break;
			case 7:
				out("Поменяем местами "+state.pos1+"-й и "+state.pos2+"-й элементы<br>");
				animJump(state.pos1, state.pos2);//в анимации мы получаем их по id, поэтому меняем потом
			break;
			default://сюда -1 и иже с ним (но уже не нужен)
				animNone();
			break;
		}
	}
	animationArgs.main.addEventListener('anim', animationArgs.main.listener);
	animationArgs.main.dispatchEvent(new Event('anim'));
}

function animNone() {//функция-заглушка
	animationArgs.main.dispatchEvent(new Event('anim'));
}

//анимация типа поменять местами два элемента
function animJump(pos1, pos2) {//pos1, pos2 - позиция элемента в сортируемом массиве
	//var timeStart = Date.now();
	//error('animJump() called: pos1='+pos1+', pos2='+pos2 + '; '+(timeStart-time));
	//time = timeStart;
	var el1 = document.getElementById(animationArgs.ids[pos1]);
	var el2 = document.getElementById(animationArgs.ids[pos2]);
	//error('el1.id=' + el1.id + ', el2.id=' + el2.id);
	
	//выезжаем из строчки
	//console.log('top1: '+el1.style.top+' left1:'+el1.style.left+'\ntop2:'+el2.style.top+' left2:'+el2.style.left);
	var v = animationArgs.w*settings.standardVelocityK;
	var top0 = parseFloat(el1.style.top);
	var up = setInterval(function() {
		var top = parseFloat(el1.style.top);
		if (top - v + animationArgs.symbolHeight*2 <= top0) {
			el1.style.top = top0 - animationArgs.symbolHeight*2 + 'px';
			clearInterval(up);
			return;
		}
		el1.style.top = (top-v)+'px';
	}, settings.interval);
	
	var top0 = parseFloat(el2.style.top);
	var down = setInterval(function() {
		var top = parseFloat(el2.style.top);
		//console.log(el2.style.top);
		if (top + v - animationArgs.symbolHeight*2 >= top0) {
			el2.style.top = top0 + animationArgs.symbolHeight*2 + 'px';
			animationArgs.main.dispatchEvent(new Event('step2'));
			clearInterval(down);
			return;
		}
		el2.style.top = (top+v)+'px';
	}, settings.interval);

	//едем к своей позиции
	var goSide = function() {
		//var timeStart = Date.now();
		//error('animJump() step2 listener: el1.id=' + el1.id + ', el2.id=' + el2.id + '; '+(timeStart-time));
		//time = timeStart;
		var d = Math.abs(parseFloat(el2.style.left) - parseFloat(el1.style.left));
		var goodOrder = pos2 > pos1;//порядок физичаского следования элементов - pos1 левее, pos2 правее
		if (goodOrder) {
			var v1 = d*settings.interval/1000;//время анимации строго 1с, на этом основании высчитывается скорость
			var v2 = -v1;
		} else {
			var v2 = d*settings.interval/1000;
			var v1 = -v2;
		}
		
		var left1_0 = parseFloat(el1.style.left);
		var move1 = setInterval(function() {
			var left = parseFloat(el1.style.left);
			if ((goodOrder && (left + v1 >= left1_0 + d)) || (!goodOrder && (left + v1 <= left1_0 - d))) {
				el1.style.left = left1_0 + (goodOrder ? 1 : -1)*d + 'px';
				animationArgs.main.removeEventListener('step2', goSide, false);
				clearInterval(move1);
				return;
			}
			el1.style.left = (left+v1)+'px';
		}, settings.interval);
		
		var left2_0 = parseFloat(el2.style.left);
		var move2 = setInterval(function() {
			var left = parseFloat(el2.style.left);
			if ((goodOrder && (left + v2 <= left2_0 - d)) || (!goodOrder && (left + v2 >= left2_0 + d))) {//pos2 != pos1
				el2.style.left = left2_0 + (goodOrder ? -1 : 1)*d + 'px';
				animationArgs.main.removeEventListener('step2', goSide, false);
				animationArgs.main.dispatchEvent(new Event('step3'));
				//console.log('top1: '+el1.style.top+' left1:'+el1.style.left+'\ntop2:'+el2.style.top+' left2:'+el2.style.left);
				clearInterval(move2);
				return;
			}
			el2.style.left = (left+v2)+'px';
		}, settings.interval);

		//въезжаем в строчку
		var goDown = function() {
			//var timeStart = Date.now();
			//error('animJump() step3 listener: el1.id=' + el1.id + ', el2.id=' + el2.id + '; '+(timeStart-time));
			//time = timeStart;
			var v = animationArgs.w*settings.standardVelocityK;
			
			var top2_0 = parseFloat(el2.style.top);
			var up = setInterval(function() {
				var top = parseFloat(el2.style.top);
				if (top - v + animationArgs.symbolHeight*2 <= top2_0) {
					el2.style.top = top2_0 - animationArgs.symbolHeight*2 + 'px';
					//el2.style.backgroundColor = '';
					animationArgs.main.removeEventListener('step3', goDown, false);
					clearInterval(up);
					return;
				}
				el2.style.top = (top-v)+'px';
			}, settings.interval);
			
			var top1_0 = parseFloat(el1.style.top);
			var down = setInterval(function() {
				var top = parseFloat(el1.style.top);
				//console.log(el1.style.top);
				if (top + v - animationArgs.symbolHeight*2 >= top1_0) {
					el1.style.top = top1_0 + animationArgs.symbolHeight*2 + 'px';
					//el1.style.backgroundColor = '';
					animationArgs.main.removeEventListener('step3', goDown, false);
					animationArgs.main.dispatchEvent(new Event('step4'));
					clearInterval(down);
					return;
				}
				el1.style.top = (top+v)+'px';
			}, settings.interval);

			//убрать подсветку с выбранного элемента
			//var label = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5).toUpperCase();
			//var unhighlight = animFinJump.bind(this, chosen, randomLabel, unhighlight);

			//label - отладочный параметр, позволяет отличать копии коллбеков
			var animFinJump = function() {
				animationArgs.main.removeEventListener('step4', animFinJump, false);
				//var timeStart = Date.now();
				//error('animFinJump() called: label='+label+'; '+(timeStart-time));
				//time = timeStart;
				setTimeout("animationArgs.main.dispatchEvent(new Event('anim'))", settings.pause);
			}
			animationArgs.main.addEventListener('step4', animFinJump);
		};
		animationArgs.main.addEventListener('step3', goDown);
	};
	animationArgs.main.addEventListener('step2', goSide);

	//меняем id местами, чтобы это соответствовало их визуальному порядку
	var t = animationArgs.ids[pos1];
	animationArgs.ids[pos1] = animationArgs.ids[pos2];
	animationArgs.ids[pos2] = t;
}

//подсветить границы и указатели, а также убрать подсветку предыдущего выбранного элемента(функция animUnhighlightChosen расформирована)
function animSetBordersAndPointers(p1pos, p2pos, b1pos, b2pos, previousChosen) {
	//var timeStart = Date.now();
	//error('animSetBordersAndPointers() called; '+(timeStart-time));
	//time = timeStart;

	if (previousChosen) {//в самом начале он null
		var chosenElem = document.getElementById(previousChosen);
		chosenElem.style.backgroundColor = settings.elBack;
	}
	
	var pointer1 = document.getElementById('pointer1');
	var pointer2 = document.getElementById('pointer2');
	var border1 = document.getElementById('border1');
	var border2 = document.getElementById('border2');
	var mainCoords = getCoords(animationArgs.main);
	pointer1.style.left = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*p1pos + animationArgs.w/2 + 'px';
	pointer2.style.left = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*p2pos + animationArgs.w/2 + 'px';
	border1.style.left  = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*b1pos + 'px';
	border2.style.left  = mainCoords.left + settings.mainPadding + (animationArgs.w + settings.elMarginLeft)*(b2pos + 1) + 'px';//чтобы он был правее элемента
	pointer1.style.color = settings.highlightEls;
	pointer2.style.color = settings.highlightEls;
	border1.style.backgroundColor = settings.highlightEls;
	border2.style.backgroundColor = settings.highlightEls;
	//out(border1.style.backgroundColor);
	setTimeout(function() {
		pointer1.style.color = '';
		pointer2.style.color = '';
		border1.style.backgroundColor = '';
		border2.style.backgroundColor = '';
		animationArgs.main.dispatchEvent(new Event('anim'));
	}, settings.pause);
}

function animHighlightChosen(chPos) {
	//var timeStart = Date.now();
	//error('animHighlightChosen() called; '+(timeStart-time));
	//time = timeStart;
	var chosen = document.getElementById(animationArgs.ids[chPos]);
	chosen.style.backgroundColor = settings.highlightChosen;
	setTimeout("animationArgs.main.dispatchEvent(new Event('anim'))", settings.pause);
}

function animBlinkElem(pos) {
	//var timeStart = Date.now();
	//error('animBlinkElem() called; '+(timeStart-time));
	//time = timeStart;
	var elem = document.getElementById(animationArgs.ids[pos]);
	//case it was chosen and so green
	var oldColor = elem.style.backgroundColor;
	elem.style.backgroundColor = settings.highlightEls;
	//out(elem.style.backgroundColor);
	setTimeout(function() {
		elem.style.backgroundColor = oldColor;
		animationArgs.main.dispatchEvent(new Event('anim'));
	}, settings.pause);
}

function animMovePointer1(pos) {
	//var timeStart = Date.now();
	//error('animMovePointer1() called; '+(timeStart-time));
	//time = timeStart;
	var pointer1 = document.getElementById('pointer1');
	var v = (animationArgs.w + settings.elMarginLeft)*settings.standardVelocityK;
	var left0 = parseFloat(pointer1.style.left);
	var move = setInterval(function() {
		var left = parseFloat(pointer1.style.left);
		if (left + v >= left0 + (animationArgs.w + settings.elMarginLeft)) {
			pointer1.style.left = left0 + (animationArgs.w + settings.elMarginLeft);
			setTimeout(function() {
				animationArgs.main.dispatchEvent(new Event('anim'));
			}, settings.pause);
			clearInterval(move);
			return;
		}
		pointer1.style.left = (left+v)+'px';
	}, settings.interval);
}

function animMovePointer2(pos) {
	//var timeStart = Date.now();
	//error('animMovePointer2() called; '+(timeStart-time));
	//time = timeStart;
	var pointer2 = document.getElementById('pointer2');
	var v = -animationArgs.w*settings.standardVelocityK;
	var left0 = parseFloat(pointer2.style.left);
	var move = setInterval(function() {
		var left = parseFloat(pointer2.style.left);
		if (left + v <= left0 - (animationArgs.w + settings.elMarginLeft)) {
			pointer2.style.left = left0 - (animationArgs.w + settings.elMarginLeft);
			setTimeout(function() {
				animationArgs.main.dispatchEvent(new Event('anim'));
			}, settings.pause);
			clearInterval(move);
			return;
		}
		pointer2.style.left = (left+v)+'px';
	}, settings.interval);
}
//console.log('js loaded');
