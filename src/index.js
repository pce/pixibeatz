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



// function playSeries(...aliases) {
//   return new Promise((resolve) => {
//     const tasks = [];
//     aliases.forEach((alias) => {
//       tasks.push((done) => {
//          sound.play(alias,(sound) => { done(); });
//       })
//     });
//     async.series(tasks, resolve);
//   });
// }

// set up a kit library
sound.add({
    bd: 'bd.mp3',
    snr: 'snr.mp3',
    ch: 'ch.mp3',
});


app.loader.load(function() {
    playButton.on('click', function() {
        // playSeries('bd', 'snr', 'ch').then(() => {
        //     // completed
        // });

        sound.play('bd');
        sound.play('snr');
        sound.play('ch');
        playButton.visible = false;
        stopButton.visible = true;
        app.render();
    });

    stopButton.on('click', function() {
        sound.stop('bd');
        sound.stop('snr');
        sound.stop('ch');
        playButton.visible = true;
        stopButton.visible = false;
        app.render();
    });
});
