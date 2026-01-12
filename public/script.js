import {initialVocabulary} from './data.js';

let repeatWords = new Set;
const body = document.querySelector('.body');
const main = document.querySelector('.main');
const outputText = document.querySelector('.output_text');
const answerText = document.querySelector('.answer_text');
const inputText = document.querySelector('.input_text');
const areaEditable = document.querySelector('.area_editable');
let keys = Object.keys(initialVocabulary);
let len = keys.length - 1;
let count = 0;
let answer = '';
let answerTimeoutId = 0;
let nextTimeoutId = 0;
const TIMEOUT = 10 * 1000; // 20 секунд
let lastActivity = new Date().getTime();
let waitingTimeoutId = 0;
const btnPrev = document.querySelector('.btn_prev');
const btnAnswer = document.querySelector('.btn_answer');
const btnNext = document.querySelector('.btn_next');
let autoNextSelector = false;
const btnRun = document.querySelector('.button_run');
const qtyNumber = document.querySelector('.qty_number');
const currentNumber = document.querySelector('.input_number');
const btnToFirstWord = document.querySelector('.to_first_word');
const bookmark = document.querySelector('.bookmark');
const btnRepeat = document.querySelector('.btn_repeat');
const menu = document.querySelector('.menu');
const settingsContainer = document.querySelector('.settings-container');
const settings = document.querySelector('.settings');
const settingOptions = document.querySelectorAll('.setting-option');
// let repeatState = false;
// let randomState = false;
let continueWord = 0;
const fromSetting = document.querySelector('.from_setting');
const untilSetting = document.querySelector('.until_setting');
const btnRandom = document.querySelector('.btn_random');
const btnSwap = document.querySelector('.btn_swap');
const btnMenu = document.querySelector('.btn_menu');
const btnSettings = document.querySelector('.btn_settings');
const deleteBookmarksCommand = document.querySelector('.delete_bookmarks');
const optionRightAnswBehavior = document.querySelector('.option_right_answ_behavior');
const optionWrongAnswBehavior = document.querySelector('.option_wrong_answ_behavior');
let response;
let start = 1;
let end = 1;
let subSetSize = 0;
const face = true;
const back = false;
let cardSide = face;
const objRepeat = {
  stateTurnedOn: false,
  btn: btnRepeat,
}
const objRandom = {
  stateTurnedOn: false,
  btn: btnRandom,
}

let wordStatisticList = {};
let lastFailWords = {};
let todayFailWords = new Set();
let todaySuccessWords = new Set();
// let setFailWords = new Set();

// const arrBookmarkedPages = [];

qtyNumber.innerText = len + 1 + '';
// answerTimeoutId = setTimeout(() => showAnswer(), 5000);

btnAnswer.addEventListener('click', showAnswer);
btnNext.addEventListener('click', nextWord);
btnPrev.addEventListener('click', prevWord);
btnRun.addEventListener('click', changeAutoNextSelector);
btnSwap.addEventListener('click', turnCardFace);
inputText.addEventListener('keyup', checkAnswer);
btnMenu.addEventListener('click', showMenu);
btnSettings.addEventListener('click', showSettings);
settingsContainer.addEventListener('click', (e) => closeSettings(e));
document.addEventListener('click', (e) => closeMenu(e));
deleteBookmarksCommand.addEventListener('click', deleteBookmarks);

function checkAnswer() {
  if (userAnswerIsTrue()) {
    areaEditable.classList.add('right_answer');
    wordStatisticList[keys[count]].rightAnswerQueue++;
    wordStatisticList[keys[count]].rightAnswerDate = new Date().toLocaleDateString();
    if (objRandom.stateTurnedOn) {
      todaySuccessWords.add(keys[count]);
    }
    // previous condition was objRepeat.stateTurnedOn && optionRightAnswBehavior.checked
    if (optionRightAnswBehavior.checked) {
      if (repeatWords.has(keys[count])) changeBookmarkState();
    }
  } else {
    areaEditable.classList.remove('right_answer');
  }
}


function changeWord() {
  areaEditable.classList.remove('right_answer');
  outputText.classList.add('invisible');
  answerText.classList.add('invisible');
  inputText.classList.add('invisible');
  setTimeout(() => {
    outputText.innerText = "";
    answerText.innerText = "";
    inputText.innerText = "";
  }, 500);
  // answer = keys[count];
  answer = getAnswer();
  setTimeout(() => {
    outputText.innerText = getWord();
    if (repeatWords.size && repeatWords.has(keys[count])) {
      bookmark.classList.add('bookmark_filled');
    } else {
      bookmark.classList.remove('bookmark_filled');
    }
    outputText.classList.remove('invisible');
    // answerText.classList.remove('invisible');
    inputText.classList.remove('invisible');
  }, 500);
}

function nextWord() {
  const inputNotEmpty = inputText.innerText;
  const answerIsTrue = userAnswerIsTrue();
  const answerIsFalse = !userAnswerIsTrue();
  const rightQueueIsSmall = wordStatisticList[keys[count]].rightAnswerQueue < 10;
  const wordIsBookmarked = repeatWords.has(keys[count]);
  if (inputNotEmpty && answerIsFalse && rightQueueIsSmall && wordIsBookmarked) {
    wordStatisticList[keys[count]].rightAnswerQueue = 0;
    todayFailWords.add(keys[count]);
  }
  if (count < len){
    count++;
  } else {
    count = 0;
    if (objRepeat.stateTurnedOn){
      keys = Array.from(repeatWords);
      len = keys.length - 1;
      qtyNumber.innerText = len + 1 + '';
    }
  }
  changeWord();
  if (autoNextSelector) {
    if (answerTimeoutId) {
      clearTimeout(answerTimeoutId);
      answerTimeoutId = 0;
    }
    answerTimeoutId = setTimeout(() => showAnswer(), 5000);
    if (nextTimeoutId) {
      clearTimeout(nextTimeoutId);
      nextTimeoutId = 0;
    }
  }
  currentNumber.value = count + 1;
}

function prevWord() {
  if (count > 0){
    count--;
  } else {
    count = len;
  }
  changeWord();
  setTimeout(() => {
    answerText.innerText = answer;
    answerText.classList.remove('invisible');
  }, 500);
  if (autoNextSelector) {
    changeAutoNextSelector();
  }
  currentNumber.value = count + 1;
}

function showAnswer() {
  if (answerText.innerText == "") {
    answerText.innerText = answer;
    answerText.classList.remove('invisible');
  }
  if (autoNextSelector) {
    clearTimeout(answerTimeoutId);
    answerTimeoutId = 0;
    nextTimeoutId = setTimeout(() => nextWord(), 5000);
  }
  if (!userAnswerIsTrue()) {
    if (optionWrongAnswBehavior.checked) {
      if (!repeatWords.has(keys[count])) changeBookmarkState();
      // const splitAnswer = getAnswer().trim().split(' ');
      // if (splitAnswer.length == 1) {
      // };
    }
  }
}

body.addEventListener('keydown', keyInterpret);

function keyInterpret(e) {
  // console.log(e.key);
  switch (e.key){
    case 'F2':
      e.preventDefault();
      showAnswer();
      break;
    case 'F1':
      e.preventDefault();
      prevWord();
      break;
    case 'F3':
      e.preventDefault();
      nextWord();
      break;
    case 'F5':
      e.preventDefault();
      changeBookmarkState();
      break;
    case 'Enter':
      if (e.target != currentNumber) {
        e.preventDefault();
        if (answerText.innerHTML == '') {
          showAnswer();
          if (waitingTimeoutId) {
            clearTimeout(waitingTimeoutId);
            waitingTimeoutId = 0;
          }
        } else {
          nextWord();
        }
      }
      break;
    default:
      lastActivity = new Date().getTime();
      if (!event.ctrlKey && !event.altKey) {
        if (e.target != currentNumber & e.target != inputText & (inputText.innerHTML == '' || inputText.innerHTML == '<br>')) {
          inputText.focus();
        }
      }
      if (autoNextSelector) {
        clearTimeout(answerTimeoutId);
        answerTimeoutId = 0;
        if (waitingTimeoutId == 0) {
          waitingTimeoutId = setInterval(() => {
            if (new Date().getTime() - lastActivity > TIMEOUT) {
              showAnswer();
              clearTimeout(waitingTimeoutId);
              waitingTimeoutId = 0;
            }
          }, 1000);
        }
      }
  }
}

function userAnswerIsTrue() {
  let answerInLowerCase = getAnswer().toLowerCase().trim();
  answerInLowerCase = answerInLowerCase.replace("’", "'");
  answerInLowerCase = answerInLowerCase.replace("‘", "'");
  answerInLowerCase = answerInLowerCase.replace("'ve", " have");
  answerInLowerCase = answerInLowerCase.replace("…", "...");
  let inputInLowerCase = inputText.innerText.toLowerCase().trim();
  inputInLowerCase = inputInLowerCase.replace("’", "'");
  inputInLowerCase = inputInLowerCase.replace("‘", "'");
  inputInLowerCase = inputInLowerCase.replace("'ve", " have");
  inputInLowerCase = inputInLowerCase.replace("…", "...");
  if (answerInLowerCase != inputInLowerCase) {
    answerInLowerCase = answerInLowerCase.replace("?", "");
  }
  if (answerInLowerCase != inputInLowerCase) {
    answerInLowerCase = answerInLowerCase.replace("-", " ");
  }
  return answerInLowerCase == inputInLowerCase;
}

function changeAutoNextSelector(){
  autoNextSelector = !autoNextSelector;
  if (autoNextSelector){
    btnRun.classList.add('active');
    if (answerTimeoutId) {
      nextTimeoutId = setTimeout(() => nextWord(), 5000);
    } else {
      answerTimeoutId = setTimeout(() => showAnswer(), 5000);
    }
  } else {
    btnRun.classList.remove('active');
    clearTimeout(answerTimeoutId);
    answerTimeoutId = 0;
    if (nextTimeoutId) {
      clearTimeout(nextTimeoutId);
      nextTimeoutId = 0;
    }
  }
}

function setLocalStorage() {
  localStorage.setItem('count', count);
  if (repeatWords.size != 0) {
    localStorage.setItem('repeatWords', JSON.stringify(Array.from(repeatWords)));
  } else {
    localStorage.setItem('repeatWords', '');
  }
  if (objRepeat.stateTurnedOn) {
    localStorage.setItem('continueWord', continueWord);
    localStorage.setItem('repeatState', objRepeat.stateTurnedOn);
  } else {
    localStorage.setItem('continueWord', '');
    localStorage.setItem('repeatState', '');
  }
  localStorage.setItem('wordStatisticList', JSON.stringify(wordStatisticList));
  if (todayFailWords.size) {
    const prepareToSave = {};
    prepareToSave.date = new Date().toLocaleDateString();
    prepareToSave.set = [...todayFailWords];
    localStorage.setItem('lastFailWords', JSON.stringify(prepareToSave));
  }
  localStorage.setItem('todaySuccessWords', JSON.stringify([...todaySuccessWords]));
  settingOptions.forEach((option, i) => {
    if (option.id) {
      localStorage.setItem(option.id, +option.checked);
    }
  });
  // localStorage.setItem('optionRightAnswBehavior', +optionRightAnswBehavior.checked);
  // localStorage.setItem('optionWrongAnswBehavior', +optionWrongAnswBehavior.checked);
}
window.addEventListener('beforeunload', setLocalStorage);

function getLocalStorage() {
  if (localStorage.getItem('count')) {
    count = +localStorage.getItem('count');
    continueWord = +localStorage.getItem('continueWord');
    objRepeat.stateTurnedOn = Boolean(localStorage.getItem('repeatState'));
    settingOptions.forEach((option, i) => {
      if (option.id) {
        option.checked = +localStorage.getItem(option.id);
      }
    });
    // optionRightAnswBehavior.checked = +localStorage.getItem('optionRightAnswBehavior');
    // optionWrongAnswBehavior.checked = +localStorage.getItem('optionWrongAnswBehavior');
    if (localStorage.getItem('repeatWords')) {
      repeatWords = new Set(JSON.parse(localStorage.getItem('repeatWords')));
    }
    if (localStorage.getItem('wordStatisticList') != null) {
      wordStatisticList = JSON.parse(localStorage.getItem('wordStatisticList'));
    }
    // wordStatisticList = JSON.parse(localStorage.getItem('wordStatisticList'));
  }
  if (wordStatisticList[keys[0]] == undefined) {
    keys.forEach((key) => {
      const wordStatistic = {
        lastBookmarked: '',
        rightAnswerDate: '',
        showings: [],
        rightAnswerQueue: 0,
      };
      wordStatisticList[key] = wordStatistic;
    });
  }
  if (localStorage.getItem('lastFailWords') != null) {
    lastFailWords = JSON.parse(localStorage.getItem('lastFailWords'));
    lastFailWords.set = new Set(lastFailWords.set);
  }
  // answer = keys[count];
  answer = getAnswer();
  if (objRepeat.stateTurnedOn) {
    keys = Array.from(repeatWords);
    updatePage(objRepeat);
  } else {
    outputText.innerText = getWord();
    currentNumber.value = count + 1;
    if (repeatWords.size && repeatWords.has(getKey())) {
      bookmark.classList.add('bookmark_filled');
    } else {
      bookmark.classList.remove('bookmark_filled');
    }
  }
  todaySuccessWords = new Set(JSON.parse(localStorage.getItem('todaySuccessWords')));
}
window.addEventListener('load', getLocalStorage);

currentNumber.addEventListener('change', goToWord);
function goToWord() {
  count = currentNumber.value - 1;
  // answer = keys[count];
  answer = getAnswer();
  // outputText.innerText = vocabulary[answer];
  changeWord();
}

btnToFirstWord.addEventListener('click', toFirstWord);
function toFirstWord() {
  currentNumber.value = 1;
  goToWord();

}

currentNumber.style.width = qtyNumber.offsetWidth + 'px';

bookmark.addEventListener('click', changeBookmarkState);
function changeBookmarkState() {
  bookmark.classList.toggle('bookmark_filled');
  if (repeatWords.size && repeatWords.has(keys[count])) {
    repeatWords.delete(answer);
    if (objRepeat.stateTurnedOn){
      if (repeatWords.size == 0){
        repeatToggle();
      }
    }
  } else {
    repeatWords.add(keys[count]);
    wordStatisticList[keys[count]].lastBookmarked = new Date().toLocaleDateString();
  }
}

btnRepeat.addEventListener('click', repeatToggle);
function repeatToggle() {
  if (objRandom.stateTurnedOn) randomSet();
  if (objRepeat.stateTurnedOn) {
    modeOff(objRepeat);
    updatePage(objRepeat);
  } else {
    if (repeatWords.size) {
      objRepeat.stateTurnedOn = true;
      continueWord = count;
      count = 0;
      keys = Array.from(repeatWords);
      updatePage(objRepeat);
    }
  }
}

function modeOff(objMode) {
  objMode.stateTurnedOn = false;
  count = continueWord;
  keys = Object.keys(initialVocabulary);
}

function updatePage(objMode) {
  objMode.btn.classList.toggle('active');
  len = keys.length - 1;
  qtyNumber.innerText = len + 1 + '';
  answer = getAnswer();
  currentNumber.value = count + 1;
  changeWord();
}

btnRandom.addEventListener('click', randomSet);
function randomSet() {
  let len;
  let keysSet;
  let tempSet;
  let wellKnownWords;
  let wellKnownWordsFiltered;
  let excludedWords = [];
  let qtySameItems;
  let limOnDeletion;
  let qtyNotRandomWords;
  let setA;
  let setB;
  let setC;
  let setF;
  let setG;
  let setH;
  const percentNotRandomWords = 20;
  if (objRepeat.stateTurnedOn) {
    modeOff(objRepeat);
    updatePage(objRepeat);
  }
  if (objRandom.stateTurnedOn) {
    modeOff(objRandom);
    updatePage(objRandom);
  } else {
    try {
      start = +safePrompt('Введите начальную границу выборки', 1) - 1;
      end = +safePrompt('Введите конечную границу выборки', count + 1);
      subSetSize = +safePrompt('Введите количество слов в выборке. \r Ноль, если выборка полная.', 20);
    } catch (e) {
      return;
    }
    if (end > start) {
      len = end - start;
      subSetSize = Math.min(subSetSize, len) || len;
      objRandom.stateTurnedOn = !objRandom.stateTurnedOn;
      keysSet = keys.slice(start, end);
      // randomWords;
      shuffle(keysSet);
      console.log('Base keyset:');
      console.log(keysSet.slice(0, subSetSize));
      setA = new Set(keysSet);
      // shift the only words from lastFailWords.set which keysSet contained to begining
      // of keysSet
      // TODO: it would be better if wellKnownWords were replaced first on words from lastFailWords.set
      // and then other words from the keysSet.
      if (lastFailWords.date) {
        if (lastFailWords.date != new Date().toLocaleDateString()) {
          qtyNotRandomWords = Math.round(subSetSize * percentNotRandomWords / 100);
          setG = setA.intersection(lastFailWords.set);
          if (setG.size > qtyNotRandomWords) {
            setG = new Set([...setG].slice(0, qtyNotRandomWords));
          }
          // let i = 0;
          console.log('Words for repeat');
          console.log(setG);
          setG.forEach((item) => {
            let i = Math.floor(Math.random() * subSetSize);
            // for prevent the same value of i several times
            while (setG.has(keysSet[i])) {
              i = Math.floor(Math.random() * subSetSize);
            }
            let j = keysSet.indexOf(item);
            [keysSet[i], keysSet[j]] = [keysSet[j], keysSet[i]];
            // i++;
          });
        }
        setA = new Set(keysSet);
      }
      // delete words which have property rightAnswerQueue > 3 from keysSet
      limOnDeletion = len - subSetSize;
      if (limOnDeletion) {
        const todayDate = new Date();
        const millisecondsInDay =  1000 * 60 * 60 * 24;
        // wellKnownWords = keys.filter((key) => wordStatisticList[key].rightAnswerQueue >= 3);
        wellKnownWords = keys.filter((key) => {
          const rightAnswerQueue = wordStatisticList[key].rightAnswerQueue;
          const rightAnswerDate = wordStatisticList[key].rightAnswerDate || todayDate;
          const passDays = Math.floor((todayDate - rightAnswerDate) / millisecondsInDay);
          return rightAnswerQueue >= 10 || rightAnswerQueue >= 3 && passDays <= 14;
        });
        if (wellKnownWords) {
          console.log('Keyset with words for repeat:');
          console.log(keysSet.slice(0, subSetSize));
          console.log('Well known words:');
          console.log(wellKnownWords);
          // setA = new Set(keysSet);
          setB = new Set(wellKnownWords);
          // console.log('setB from well known words:');
          // console.log(setB);
          setC = setB.intersection(setA);
          setF = new Set(keysSet.slice(0,subSetSize));
          if (setC.size) {
            if (setC.size > limOnDeletion) {
              setC = new Set([...setC].slice(0, limOnDeletion));
            }
            setA = setA.difference(setC);
            keysSet = Array.from(setA);
            console.log('Excluded well known words:');
            console.log([...setF.intersection(setC)]);
            // console.log('Final keyset:');
            console.log('Current keyset:');
            console.log(keysSet.slice(0, subSetSize));
          }
          // delete words from todaySuccessWords which keysSet contained
          if (todaySuccessWords.size) {
            setH = setA.intersection(todaySuccessWords);
            if (setH.size) {
              limOnDeletion = limOnDeletion - setC.size;
              setF = new Set(keysSet.slice(0,subSetSize));
              if (todaySuccessWords.size > limOnDeletion) {
                todaySuccessWords = new Set([...todaySuccessWords].slice(0, limOnDeletion));
              }
              setA = setA.difference(todaySuccessWords);
              keysSet = Array.from(setA);
              console.log('Excluded last success words:');
              console.log([...setF.intersection(todaySuccessWords)]);
              console.log('Final keyset:');
              console.log(keysSet.slice(0, subSetSize));
            }
          }
          todaySuccessWords = new Set();
          //wellKnownWordsFiltered = wellKnownWords.filter((key) => tempSet.has(key));
          // console.log('Excluded words:');
          // console.log(wellKnownWordsFiltered);
          // while (wellKnownWordsFiltered.length > 0 && tempSet.size > subSetSize) {
          //   tempSet.delete(wellKnownWordsFiltered.pop());
          // }
          // if (tempSet.size < keysSet.length) {
          //   // const n = Array.from(tempSet).slice(0, subSetSize);
          //   // excludedWords = keysSet.slice(0, subSetSize).filter((item) => !n.has(item));
          //   keysSet = Array.from(tempSet);
          //   console.log('Final keyset:');
          //   console.log(keysSet.slice(0, subSetSize));
          // }
        }
      }
      // let keysSubset = keysSet.slice(0, subSetSize);
      continueWord = count;
      count = 0;
      keys = keysSet.slice(0, subSetSize);
      updatePage(objRandom);
    } else {
      alert('Введены некорректные данные, попробуйте снова.');
    }
  }
}

function safePrompt(message, defVal) {
    const result = prompt(message, defVal);
    if (result === null) {
        throw new Error('Операция отменена пользователем');
    }
    return result;
}

function shuffle(array){
	const len = array.length;
	for (let i = 0; i < len; i++){
		let j = Math.floor(Math.random() * len);
		[array[i], array[j]] = [array[j], array[i]];
	}
    return array;
}

function turnCardFace() {
  cardSide = !cardSide;
  changeWord();
}

function getAnswer() {
  let res = undefined;
  if (cardSide == face){
    res = keys[count];
  } else {
    res = initialVocabulary[keys[count]];
  }
  return res;
}

function getWord() {
  let res = undefined;
  if (cardSide == back){
    res = keys[count];
  } else {
    res = initialVocabulary[keys[count]];
  }
  return res;
}

function getKey() {
  return initialVocabulary[keys[count]];
}
function getWellknownWords(tresold, passDaysObject) {
  tresold = tresold || 3;
  console.log(Object.keys(initialVocabulary).filter((key) => wordStatisticList[key].rightAnswerQueue >= tresold));
}

function showMenu() {
  menu.classList.toggle('display_block');
}

function showSettings() {
  settingsContainer.classList.toggle('hidden');
  // main.classList.toggle('hidden');
}

function closeSettings(e) {
  if (e.target != settings && !settings.contains(e.target)) {
    settingsContainer.classList.toggle('hidden');
  }
}

function closeMenu(e) {
  if (e.target != btnMenu) {
    if (menu.classList.contains('display_block')) {
      menu.classList.remove('display_block');
    }
  }
}

function deleteBookmarks() {
  let confirmed = false;
  confirmed = confirm('Вы действительно хотите очистить все закладки?');
  if (confirmed) {
    repeatWords = new Set();
  }
  if (objRepeat.stateTurnedOn) {
    if (repeatWords.size == 0){
      repeatToggle();
    }
  }
}
