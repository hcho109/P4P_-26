"use strict";
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var arrayBuffer = null; // Declare arrayBuffer in the broader scopee

document.addEventListener("DOMContentLoaded", function () {
    class renderWave {
        constructor(message) {
            console.log("Initializing renderWave");
            this._samples = 10000;
            this._strokeStyle = "#3098ff";
            this.audioContext = new AudioContext();
            this.canvas = document.querySelector("#canvas_waveform");
            this.ctx = this.canvas.getContext("2d");
            this.isPlaying = 0;
            this.playheadPosition = 0;
            this.data = [];
            
            // Wait for a user action to start the AudioContext
            document.body.addEventListener("click", () => {
                if (this.audioContext.state !== "running") {
                    this.audioContext.resume().then(() => {
                        console.log("AudioContext resumed from user action");
                    });
                }
            });
                message
                .then(arrayBuffer => {
                    console.log("Decoding audio data");
                    return this.audioContext.decodeAudioData(arrayBuffer);
                })
                .then(audioBuffer => {
                    // Draw waveform and spectrogram
                    console.log("Decoding complete. Drawing waveform and spectrogram.");
                    this.draw(this.normalizedData(audioBuffer));
                    //this.drawSpectrogram(audioBuffer);
                    this.drawData(this.data);
                });
        }

        // drawSpectrogram(audioBuffer) {
        //     console.log("Drawing spectrogram");
        //     const canvas = document.querySelector("#canvas_spectrogram");
        //     const context = canvas.getContext("2d");
        
        //     const width = canvas.width;
        //     const height = canvas.height;
        
        //     // Create a Tone.Buffer from the decoded audioBuffer
        //     const audio = new Tone.Buffer(audioBuffer);
        
        //     // Create a Tone.Player with the audio
        //     const player = new Tone.Player(audio).toDestination();
        
        //     // Create a Tone.Analyser to get frequency data
        //     const analyser = new Tone.Analyser("fft", 256);
        
        //     // Connect the player to the analyser and start playing
        //     player.connect(analyser);
        //     player.start();
        
        //     // Render the spectrogram
        //     const bufferLength = analyser.size;
        //     const dataArray = new Uint8Array(bufferLength);
        
        //     const barWidth = width / bufferLength;
            
        //     function renderFrame() {
        //         console.log("Rendering spectrogram frame");
        //         analyser.getValue(dataArray);
        //         context.clearRect(0, 0, width, height);
        
        //         for (let i = 0; i < bufferLength; i++) {
        //             const barHeight = (dataArray[i] / 256) * height; // Normalize values and adjust scaling as needed
        //             const x = i * barWidth;
        //             const y = height - barHeight;
        
        //             context.fillStyle = "rgba(0, 0, 255, 0.8)"; // Adjust color as needed
        //             context.fillRect(x, y, barWidth, barHeight);
        //         }
        
        //         requestAnimationFrame(renderFrame);
        //     }
        
        //     renderFrame();
        // }        


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

        drawData(data) {
            data.forEach(item => {
                const colors = this.isPlaying && item.x <= this.playheadPosition * this.canvas.offsetWidth
                  ? "#000000" // Change color to black if it's part of the audio being played
                  : this._strokeStyle; // Otherwise, use the original color
                  this.drawLineSegment(this.ctx, item.x, item.h, item.w, item.isEven, colors);
              });
        }

        drawTimeline(percent) {
            let end = Math.ceil(this._samples * percent);
            let start = end - 5 || 0;
            let t = this.data.slice(0, end);
            this.drawData(t, "#1d1e22");
            this.playheadPosition = percent;
        }

    }

    var duration = 0;
    var currentTime = 0;
    var currentTimeInSec = 0;

    document.getElementById("fileinput").addEventListener("change", function () {
        var audioPlayer = document.getElementById("audio");

        var wave = new renderWave(this.files[0].arrayBuffer());
        audioPlayer.src = URL.createObjectURL(this.files[0]);

        let playerStatus = document.getElementById("AudioPlayerStatus");

        audioPlayer.addEventListener("play", () => {
            wave.isPlaying = 1;
            playerStatus.textContent = "Audio is playing...";
        });

        audioPlayer.addEventListener("pause", () => {
            wave.isPlaying = 0;
            playerStatus.textContent = "Audio paused...";
        });

        audioPlayer.addEventListener('ended', function() {
            wave.isPlaying = 0;
            playerStatus.textContent = "Audio ended...";
        });

        audioPlayer.addEventListener('durationchange', function() {
            duration = this.duration;
        });

        this.files[0].arrayBuffer().then(buffer => {
            arrayBuffer = buffer;
        });

        audioPlayer.ontimeupdate = function () {
            let percent = this.currentTime / this.duration;
            wave.drawTimeline(percent);

            currentTime = this.currentTime;
            currentTimeInSec = currentTime.toFixed(2);
        };

        // Feature extraction
        document.getElementById("extractFeaturesButton").addEventListener("click", async () => {
            // Check if arrayBuffer is already loaded
            if (arrayBuffer) {
                const frameLengthT = 0.02; // 20ms

                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                // Calculate the nearest power of 2 value greater than or equal to the desired frame length
                const frameLength = Math.pow(2, Math.ceil(Math.log2(audioContext.sampleRate * frameLengthT)));

                // Create an AudioBufferSourceNode to play the audio
                const sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = audioBuffer;

                // Create Meyda Analyzer Node
                const analyzer = Meyda.createMeydaAnalyzer({
                    audioContext: audioContext,
                    source: sourceNode,
                    bufferSize: frameLength,
                    featureExtractors: ["rms", "chroma"],
                    callback: (features) => {
                        // Callback function when features are calculated
                        console.log("Features:", features);
                    },
                });

                // Start the audio playback and feature extraction
                sourceNode.start();

                // Stop the sourceNode after the audio is played
                sourceNode.onended = () => {
                    sourceNode.disconnect();
                    analyzer.stop();
                };

                // Start playing the audio
                audioPlayer.play();
            } else {
                console.log("ArrayBuffer is not loaded yet.");
            }
        });

    });

});