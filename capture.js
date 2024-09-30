import {resetAnimation, rows, cells, renderMessages, parseMessages, setStatus} from './script.js';

const startButton = document.getElementById('start');
const testButton = document.getElementById('test');
const content = document.getElementById('content');

const frameDelay = 200;

let gif = new GIF({
    workers: 2,
    quality: 10,
    delay: frameDelay,
    width: 738,
    height: 136,
    workerScript: 'gif.worker.js'
});

let recording = false;
let captureInterval;

function captureFrames() {
    if (recording) {
        html2canvas(content, {
            backgroundColor: '#0d1117',
            useCORS: true
        }).then(canvas => {
            gif.addFrame(canvas, { delay: frameDelay });
            requestAnimationFrame(captureFrames);
        }).catch(error => {
            console.error('Error capturing canvas:', error);
        });
    }
}

startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    testButton.disabled = true;
    recording = true;
    setStatus("Recording in progress. It wont come out glitchy. DO NOT CLOSE OR REFRESH THE PAGE.");

    resetAnimation();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (let i = 0; i < 52; i++) {
            cells[rowIndex][i].style.backgroundColor = "";
        }
    }

    const captureFramesAsync = async () => {
        requestAnimationFrame(captureFrames);
    };

    await Promise.all([
        renderMessages(parseMessages()),
        captureFramesAsync()
    ]);

    stopRecording();
});

function stopRecording() {
    clearInterval(captureInterval);
    recording = false;

    setStatus("Recording Finished... Rendering GIF. Please wait...");

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'recorded-content.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(img);
    });

    setTimeout(() => {
        gif.render();
    }, 100);

    startButton.disabled = false;
}
