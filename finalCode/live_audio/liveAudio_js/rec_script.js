/* let display Audio waveform and Spectrogram
visualise spectrogram as audio is being recorded  
generates waveform once recording completes and let users replay the recording */
  
"use strict";
window.AudioContext = window.AudioContext || window.webkitAudioContext;

let isRecordingInProgress = false; // Flag to track if recording is in progress

class renderWave {
  constructor(message) {
      this._samples = 10000;
      this._strokeStyle = "#3098ff";
      this.audioContext = new AudioContext();
      this.canvas = document.querySelector("#canvas_waveform");
      this.ctx = this.canvas.getContext("2d");
      this.isPlaying = false; // Flag to track if audio is currently playing
      this.playheadPosition = 0; // Current position of the playhead (slider)
      this.data = [];
      message
          .then(arrayBuffer => {
          return this.audioContext.decodeAudioData(arrayBuffer);
      })
          .then(audioBuffer => {
          this.draw(this.normalizedData(audioBuffer));
          this.drawData(this.data);
      });
  }
  normalizedData(audioBuffer) {
      const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
      const samples = this._samples; // Number of samples we want to have in our final data set
      const blockSize = Math.floor(rawData.length / samples); // Number of samples in each subdivision
      const filteredData = [];
      for (let i = 0; i < samples; i++) {
          filteredData.push(rawData[i * blockSize]);
      }
      return filteredData;
  }
  draw(normalizedData) {
      // set up the canvas
      const canvas = this.canvas;
      const dpr = window.devicePixelRatio || 1;
      const padding = 10;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
      this.ctx.scale(dpr, dpr);
      this.ctx.translate(0, canvas.offsetHeight / 2 + padding); // set Y = 0 to be in the middle of the canvas
      // draw the line segments
      const width = canvas.offsetWidth / normalizedData.length;
      for (let i = 0; i < normalizedData.length; i++) {
          const x = width * i;
          let height = normalizedData[i] * canvas.offsetHeight - padding;
          if (height < 0) {
              height = 0;
          }
          else if (height > canvas.offsetHeight / 2) {
              height = height > canvas.offsetHeight / 2;
          }
          // this.drawLineSegment(this.ctx, x, height, width, (i + 1) % 2);
          this.data.push({
              x: x,
              h: height,
              w: width,
              isEven: (i + 1) % 2
          });
      }
      return this.data;
  }
  drawLineSegment(ctx, x, height, width, isEven, colors = this._strokeStyle) {
      ctx.lineWidth = 1; // how thick the line is
      ctx.strokeStyle = colors; // what color our line is
      ctx.beginPath();
      height = isEven ? height : -height;
      ctx.moveTo(x, 0);
      ctx.lineTo(x + width, height);
      ctx.stroke();
  }

  drawData(data, playheadPosition) {
    data.forEach(item => {
        const colors = item.x <= playheadPosition * this.canvas.offsetWidth
            ? "#000000" // Change color to black for the currently recorded audio
            : this._strokeStyle; // Otherwise, use the original color
        this.drawLineSegment(this.ctx, item.x, item.h, item.w, item.isEven, colors);
    });
}


  drawTimeline(percent) {
      let end = Math.ceil(this._samples * percent);
      let start = end - 5 || 0;
      let t = this.data.slice(0, end);
      this.drawData(t, percent);
      this.playheadPosition = percent;
  }
}

document
  .getElementById("startRecording")
  .addEventListener("click", initFunction);

let isRecording = document.getElementById("isRecording");
let audioPlayer = document.getElementById("audioElement");
let audioStream;
let rec;

let waveform = document.getElementById("canvas_waveform");


// Function to stop streaming from the microphone
function stopMicrophoneStream() {
  if (audioStream) {
      // Stop the microphone stream
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
  }
}
function initFunction() {
  if(isRecordingInProgress){
    // If recording is already in progress, stop it
    rec.stop();
    stopMicrophoneStream();
    isRecordingInProgress = false;
  } else {
      // If recording is not in progress, start it
      isRecordingInProgress = true;
      isRecording.textContent = "Recording...";
      let audioChunks = [];

      // Display recording
      async function getUserMedia(constraints) {
        if (window.navigator.mediaDevices) {
          return window.navigator.mediaDevices.getUserMedia(constraints);
        }
    
        let legacyApi =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;
    
        if (legacyApi) {
          return new Promise(function (resolve, reject) {
            legacyApi.bind(window.navigator)(constraints, resolve, reject);
          });
        } else {
          alert("user api not supported");
        }
      }
    
      function handlerFunction(stream) {
        rec = new MediaRecorder(stream);
        rec.start();
        rec.ondataavailable = (e) => {
          audioChunks.push(e.data);
          if (rec.state == "inactive") {
            let blob = new Blob(audioChunks, { type: "audio/wav" });
            console.log(blob);
            audioPlayer.src = URL.createObjectURL(blob);
    
            // Tear down after recording.
            rec.stream.getTracks().forEach(t => t.stop())
            // rec = null
    
            if (audioChunks.length > 0) {
              // Initialize renderWave after recording is stopped
              const wave = new renderWave(audioChunks[0].arrayBuffer());
    
              audioPlayer.addEventListener("play", function () {
                wave.isPlaying = true;
              });
    
              audioPlayer.addEventListener("pause", function () {
                wave.isPlaying = false;
              });
              audioPlayer.addEventListener("ended", function () {
                wave.isPlaying = false;
              });
              
              audioPlayer.addEventListener("timeupdate", function () {
                let percent = this.currentTime / this.duration;
                wave.drawTimeline(percent);
                wave.drawData(wave.data, percent); // Update the waveform visualization
    
              });
            }else {
              console.log("No recorded audio available.");
            }
          }
        };
      }
    
      function startusingBrowserMicrophone(boolean) {
        getUserMedia({ audio: boolean }).then((stream) => {
          handlerFunction(stream);
        });
      }
    
      startusingBrowserMicrophone(true);
    
      function saveRecording() {
        console.log(audioChunks)
        if (audioChunks.length === 0) {
          console.log("No recorded audio available.");
          return;
        }
      
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(audioBlob);
        link.download = "recorded_audio.wav";
        link.click();
    
         // Clear the audioChunks array
         audioChunks = [];
      }
    
      // Stoping handler
      document.getElementById("stopRecording").addEventListener("click", (e) => {
        rec.stop();
        stopMicrophoneStream();
        isRecording.textContent = "Recording's DONE! Click 'Play' button to start listening";
        isRecordingInProgress = false;
        console.log(audioChunks)
    
      });
    
      
      document.getElementById("saveRecording").addEventListener("click", saveRecording);
    }

}
