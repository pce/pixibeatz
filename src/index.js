import { Application, Graphics } from 'pixi.js';
import sound from 'pixi-sound';

const app = new Application({
  backgroundColor: 0x999999,
  width: window.innerWidth,
  height: window.innerHeight,
  autoStart: false
});
document.body.appendChild(app.view);

function createButton(visible) {
  const button = new Graphics()
    .beginFill(0x0, 0.5)
    .drawRoundedRect(0, 0, 100, 100, 10)
    .endFill()
    .beginFill(0xffffff);

  button.pivot.set(50, 50);
  button.position.set(app.view.width / 2, app.view.height / 2);
  button.interactive = true;
  button.buttonMode = true;
  button.visible = visible;
  return button;
}

const playButton = createButton(true)
  .moveTo(36, 30)
  .lineTo(36, 70)
  .lineTo(70, 50);

const stopButton = createButton(false)
  .drawRect(34, 34, 32, 32);

app.stage.addChild(playButton, stopButton);
app.render();

// ---------------------------------

let tempo = 120.0;
let lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)


let currentStep = 0;
let lastStep = 16;
let nextNoteTime = 0.0; // when the next note is due.

let off = 20000;


function nextNote() {
  const secondsPerBeat = 60.0 / tempo;
  // todo 64 or 96 ticks instead of 16 steps
  // add steps to last beat time
  nextNoteTime += secondsPerBeat / 4;

  // advance the step, wrap to zero
  currentStep++;
  if (currentStep === lastStep) {
    currentStep = 0;
  }
}


let seq = [
  { 'bd': true, 'ch': true },   // 1
  { 'bd': false, 'ch': true },  // 2
  { 'bd': true, 'ch': true },  // 3
  { 'bd': false, 'ch': true }, // 4
  { 'bd': false, 'snr': true, 'ch': true },  // 5
  { 'bd': false, 'ch': true },  // 6
  { 'bd': false, 'ch': true },  // 7
  { 'bd': false, 'snr': false, 'ch': true }, // 8
  { 'bd': true, 'ch': true },  // 9
  { 'bd': false, 'ch': true }, // 10
  { 'bd': false, 'ch': true }, // 11
  { 'bd': false, 'ch': true }, // 12
  { 'bd': false, 'ch': true, 'snr': true, }, // 13
  { 'bd': true, 'ch': true }, // 14
  { 'bd': false, 'ch': true }, // 15
  { 'bd': false, 'snr': true, 'ch': true }, // 16
]


// const notesInQueue = [];
function scheduleNote(beatNumber, time) {
  // push the note on the queue for vis
  // notesInQueue.push({ note: beatNumber, time: time });
  console.log('beatNumber')
  console.log(beatNumber)
  // sound.play('bd')
  // return

  if (typeof seq[beatNumber]['bd'] !== 'undefined' && seq[beatNumber]['bd']) {
    sound.play('bd')
  }
  if (typeof seq[beatNumber]['ch'] !== 'undefined' && seq[beatNumber]['ch']) {
    sound.play('ch')
  }
  // get rid of typeof
  if (typeof seq[beatNumber]['snr'] !== 'undefined' && seq[beatNumber]['snr']) {
    sound.play('snr')
  }
}

let timerID = null;
let offCount = 0
function scheduler() {
  offCount++

  // console.log('sound.context.currentTime')
  // console.log(sound.context)
  // console.log(sound.context._ctx.currentTime)

  if (offCount > off) {
    window.clearTimeout(timerID);
    return
  }

  // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
  while (nextNoteTime < sound.context._ctx.currentTime + scheduleAheadTime) {
    scheduleNote(currentStep, nextNoteTime);
    nextNote();
  }
  timerID = window.setTimeout(scheduler, lookahead);
}


// ---------------------------------


// set up a kit library
sound.add({
  bd: 'bd.mp3',
  snr: 'snr.mp3',
});


sound.filtersAll = [
  new sound.filters.DistortionFilter(0.42),
];

const hh = sound.add('ch', 'ch.mp3')
hh.volume = 0.25;
hh.filters = [ new sound.filters.ReverbFilter(1, 5),]

app.loader.load(function () {
  playButton.on('click', function () {
    scheduler();
    playButton.visible = false;
    stopButton.visible = true;
    app.render();
  });

  stopButton.on('click', function () {
    window.clearTimeout(timerID);
    playButton.visible = true;
    stopButton.visible = false;
    app.render();
  });
});
