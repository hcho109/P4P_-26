/* Liveaudio recording Js file
  generates waveform and spectrogram but not good quality
  buttons to save images and download audio recording also work */
  
const startRecordingButton = document.getElementById("startRecording");
const stopRecordingButton = document.getElementById("stopRecording");
const saveRecordingButton = document.getElementById("saveRecording");
const saveWaveformButton = document.getElementById("saveWaveform");
const saveSpectrogramButton = document.getElementById("saveSpectrogram");
const isRecordingStatus = document.getElementById("isRecording");
const waveformCanvas = document.getElementById("canvas_waveform");
const spectrogramCanvas = document.getElementById("canvas_spectrogram");
const audioElement = document.getElementById("audioElement");

let isRecording = false;
let audioChunks = [];
let mediaRecorder = null;
let mediaStream = null;
let audioContext = null;
let sourceNode = null;
let analyser = null;
let bufferLength = 0;
let waveformCanvasCtx = waveformCanvas.getContext("2d");
let spectrogramCanvasCtx = spectrogramCanvas.getContext("2d");

startRecordingButton.addEventListener("click", startRecording);
stopRecordingButton.addEventListener("click", stopRecording);
saveRecordingButton.addEventListener("click", saveRecording);
saveWaveformButton.addEventListener("click", saveWaveform);
saveSpectrogramButton.addEventListener("click", saveSpectrogram);

function startRecording() {
  isRecording = true;
  audioChunks = [];

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      mediaStream = stream;
      audioContext = new AudioContext();
      sourceNode = audioContext.createMediaStreamSource(mediaStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);

      const frequencyDataArray = new Uint8Array(bufferLength);

      function drawWaveform() {
        if (!isRecording) {
          return;
        }

        requestAnimationFrame(drawWaveform);

        analyser.getByteTimeDomainData(dataArray);

        waveformCanvasCtx.fillStyle = "rgb(255, 255, 255)";
        waveformCanvasCtx.fillRect(
          0,
          0,
          waveformCanvas.width,
          waveformCanvas.height
        );

        waveformCanvasCtx.lineWidth = 2;
        waveformCanvasCtx.strokeStyle = "rgb(0, 0, 0)";

        waveformCanvasCtx.beginPath();

        const sliceWidth = waveformCanvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * waveformCanvas.height) / 2;

          if (i === 0) {
            waveformCanvasCtx.moveTo(x, y);
          } else {
            waveformCanvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        waveformCanvasCtx.lineTo(
          waveformCanvas.width,
          waveformCanvas.height / 2
        );
        waveformCanvasCtx.stroke();
      }

      drawWaveform();

      function drawSpectrogram() {
        if (!isRecording) {
          return;
        }

        requestAnimationFrame(drawSpectrogram);

        analyser.getByteFrequencyData(frequencyDataArray);

        spectrogramCanvasCtx.fillStyle = "rgb(0, 0, 0)";
        spectrogramCanvasCtx.fillRect(
          0,
          0,
          spectrogramCanvas.width,
          spectrogramCanvas.height
        );

        const barWidth = spectrogramCanvas.width / bufferLength;

        for (let i = 0; i < bufferLength; i++) {
          const value = frequencyDataArray[i];
          const percent = value / 255;
          const height = spectrogramCanvas.height * percent;
          const offset = spectrogramCanvas.height - height - 1;

          const hue = (i / bufferLength) * 360;
          const color = `hsl(${hue}, 100%, 50%)`;

          spectrogramCanvasCtx.fillStyle = color;
          spectrogramCanvasCtx.fillRect(
            i * barWidth,
            offset,
            barWidth,
            height
          );
        }
      }

      drawSpectrogram();

      mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorder.start();

      mediaRecorder.addEventListener("dataavailable", function (event) {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      isRecordingStatus.textContent = "Recording...";
    })
    .catch(function (error) {
      console.error("Error accessing microphone:", error);
    });
}

function stopRecording() {
  isRecording = false;

  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(function (track) {
      track.stop();
    });
    mediaStream = null;
  }

  isRecordingStatus.textContent = "Click 'Start' button to record";

  if (audioChunks.length > 0) {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const audioURL = URL.createObjectURL(audioBlob);
    audioElement.src = audioURL;
    audioElement.controls = true;
    audioElement.load(); // Load the audio for playback
  }
}

function saveRecording() {
  if (audioChunks.length === 0) {
    console.log("No recorded audio available.");
    return;
  }

  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(audioBlob);
  link.download = "recorded_audio.wav";
  link.click();
}

function saveWaveform() {
  const waveformURL = waveformCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = waveformURL;
  link.download = "waveform.png";
  link.click();
}

function saveSpectrogram() {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = spectrogramCanvas.width;
  tempCanvas.height = spectrogramCanvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(
    spectrogramCanvas,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  const spectrogramURL = tempCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = spectrogramURL;
  link.download = "spectrogram.png";
  link.click();
}
