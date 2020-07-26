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

let tempo = 60.0;
let lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)


let currentNote = 0;
let nextNoteTime = 0.0; // when the next note is due.

let off = 20000;


function nextNote() {
    const secondsPerBeat = 60.0 / tempo;

    nextNoteTime += secondsPerBeat; // Add beat length to last beat time

    // Advance the beat number, wrap to zero
    currentNote++;
    if (currentNote === 4) {
            currentNote = 0;
    }
}



let seq = [
    {'bd':true, 'ch':true},
    {'bd':false, 'ch':true},
    {'bd':false, 'ch':true},
    {'bd':false, 'snr':true, 'ch':true},
]


// const notesInQueue = [];
function scheduleNote(beatNumber, time) {

    // push the note on the queue, even if we're not playing.
    // notesInQueue.push({ note: beatNumber, time: time });

    console.log('beatNumber')
    console.log(beatNumber)
    sound.play('bd')
    return

    if (typeof seq[beatNumber]['bd'] !== 'undefined' && seq[beatNumber]['bd'] === 'true') {
        sound.play('bd')
    }
    if (typeof seq[beatNumber]['ch'] !== 'undefined' && seq[beatNumber]['ch'] === 'true') {
        sound.play('ch')
    }
    // get rid of typeof
    if (typeof seq[beatNumber]['snr'] !== 'undefined' && seq[beatNumber]['snr'] === 'true') {
        sound.play('snr')
    }
}

let timerID = null;
let offCount = 0
function scheduler() {
    offCount++

    console.log('sound.context.currentTime')
    console.log(sound.context)
    console.log(sound.context._ctx.currentTime)

    if (offCount > off) {
        window.clearTimeout(timerID);
        return
    }

    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (nextNoteTime < sound.context._ctx.currentTime + scheduleAheadTime ) {
        scheduleNote(currentNote, nextNoteTime);
        nextNote();
    }
    timerID = window.setTimeout(scheduler, lookahead);
}



// ---------------------------------


// set up a kit library
sound.add({
    bd: 'bd.mp3',
    snr: 'snr.mp3',
    ch: 'ch.mp3',
});


app.loader.load(function() {
    playButton.on('click', function() {
        scheduler();
        playButton.visible = false;
        stopButton.visible = true;
        app.render();
    });

    stopButton.on('click', function() {
        window.clearTimeout(timerID);
        playButton.visible = true;
        stopButton.visible = false;
        app.render();
    });
});
