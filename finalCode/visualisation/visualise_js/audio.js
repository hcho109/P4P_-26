"use strict";
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var arrayBuffer = null;

document.addEventListener("DOMContentLoaded", function () {
    class renderWave {
        constructor(message) {
            this._samples = 10000;
            this._strokeStyle = "#3098ff";
            this.audioContext = new AudioContext();
            this.canvas = document.querySelector("#canvas_waveform");
            this.ctx = this.canvas.getContext("2d");
            this.isPlaying = 0;
            this.playheadPosition = 0;
            this.data = [];

            document.body.addEventListener("click", () => {
                if (this.audioContext.state !== "running") {
                    this.audioContext.resume().then(() => {
                        console.log("AudioContext resumed from user action");
                    });
                }
            });

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
            const rawData = audioBuffer.getChannelData(0);
            const samples = this._samples;
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];
            for (let i = 0; i < samples; i++) {
                filteredData.push(rawData[i * blockSize]);
            }
            return filteredData;
        }

        draw(normalizedData) {
            const canvas = this.canvas;
            const dpr = window.devicePixelRatio || 1;
            const padding = 10;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
            this.ctx.scale(dpr, dpr);
            this.ctx.translate(0, canvas.offsetHeight / 2 + padding);

            const width = canvas.offsetWidth / normalizedData.length;
            for (let i = 0; i < normalizedData.length; i++) {
                const x = width * i;
                let height = normalizedData[i] * canvas.offsetHeight - padding;
                if (height < 0) {
                    height = 0;
                } else if (height > canvas.offsetHeight / 2) {
                    height = canvas.offsetHeight / 2;
                }
                this.data.push({
                    x: x,
                    h: height,
                    w: width,
                    isEven: (i + 1) % 2
                });
            }
        }

        drawLineSegment(ctx, x, height, width, isEven, colors = this._strokeStyle) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = colors;
            ctx.beginPath();
            height = isEven ? height : -height;
            ctx.moveTo(x, 0);
            ctx.lineTo(x + width, height);
            ctx.stroke();
        }

        drawData(data) {
            data.forEach(item => {
                const colors = this.isPlaying && item.x <= this.playheadPosition * this.canvas.offsetWidth
                  ? "#000000"
                  : this._strokeStyle;
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

        document.getElementById("extractFeaturesButton").addEventListener("click", async () => {
            if (arrayBuffer) {
                const frameLengthT = 0.02;
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const frameLength = Math.pow(2, Math.ceil(Math.log2(audioContext.sampleRate * frameLengthT)));
                const sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = audioBuffer;
                const analyzer = Meyda.createMeydaAnalyzer({
                    audioContext: audioContext,
                    source: sourceNode,
                    bufferSize: frameLength,
                    featureExtractors: ["rms", "chroma"],
                    callback: (features) => {
                        console.log("Features:", features);
                    },
                });

                sourceNode.start();
                sourceNode.onended = () => {
                    sourceNode.disconnect();
                    analyzer.stop();
                };

                audioPlayer.play();
            } else {
                console.log("ArrayBuffer is not loaded yet.");
            }
        });
    });
});
