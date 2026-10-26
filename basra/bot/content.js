'use strict';
/* Markaz kontenti: kurslar, vaqtlar, alifbo (saytdagi bilan bir xil) */

const COURSES = [
  { id: 'arab', emoji: '🕌', name: 'Arab tili', who: 'Kattalar', text: 'Yozuv, o’qish va kundalik suhbat. Noldan boshlab, qadam-baqadam.' },
  { id: 'arabkids', emoji: '🧒', name: 'Arab Kids', who: 'Bolalar', text: 'Bolalar uchun arab tili. Harflar va so’zlar bilan qiziqarli tanishuv.' },
  { id: 'english', emoji: '🇬🇧', name: 'Ingliz tili', who: 'Kattalar', text: 'Muloqotga yo’naltirilgan darslar, grammatika va so’z boyligi.' },
  { id: 'engkids', emoji: '🎈', name: 'English Kids', who: 'Bolalar', text: 'Bolalar uchun ingliz tili. Yoshga mos, qiziqarli mashg’ulotlar.' },
  { id: 'school', emoji: '🎒', name: 'Maktabga tayyorlov', who: 'Bolalar', text: 'Maktab dasturiga oldindan tayyorgarlik: o’qish, yozish va mantiq.' }
];

const TIMES = [
  { id: 'morning', name: 'Ertalab (9:00–12:00)' },
  { id: 'day', name: 'Tushdan keyin (12:00–16:00)' },
  { id: 'evening', name: 'Kechqurun (16:00–20:00)' },
  { id: 'any', name: 'Farqi yo’q' }
];

const AUDIENCE = [
  { id: 'child', name: 'Bola uchun' },
  { id: 'adult', name: 'O’zim uchun' }
];

const LETTERS = [
  ['ا', 'Alif', 'sher'], ['ب', 'Baa', 'uy'], ['ت', 'Taa', 'olma'], ['ث', 'Saa', 'tulki'],
  ['ج', 'Jiim', 'tuya'], ['ح', 'Haa', 'ot'], ['خ', 'Xoo', 'non'], ['د', 'Daal', 'ayiq'],
  ['ذ', 'Zaal', 'oltin'], ['ر', 'Roo', 'anor'], ['ز', 'Zaay', 'gul'], ['س', 'Siin', 'baliq'],
  ['ش', 'Shiin', 'quyosh'], ['ص', 'S’ood', 'shohin'], ['ض', 'Dood', 'qurbaqa'], ['ط', 'Too', 'samolyot'],
  ['ظ', 'Z’oo', 'soya'], ['ع', '’Ayn', 'ko’z'], ['غ', 'G’oyn', 'kiyik'], ['ف', 'Faa', 'fil'],
  ['ق', 'Qoof', 'oy'], ['ك', 'Kaaf', 'kitob'], ['ل', 'Laam', 'limon'], ['م', 'Miim', 'maktab'],
  ['ن', 'Nuun', 'yulduz'], ['ه', 'Ha', 'yarim oy'], ['و', 'Vov', 'atirgul'], ['ي', 'Yaa', 'qo’l']
].map(([g, n, m]) => ({ g, n, m }));

module.exports = { COURSES, TIMES, AUDIENCE, LETTERS };
