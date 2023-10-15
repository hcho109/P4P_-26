(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./src/dct.js');

},{"./src/dct.js":2}],2:[function(require,module,exports){
/*===========================================================================*\
 * Discrete Cosine Transform
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Mel-scale and its related coefficients used in
 * human speech analysis.
\*===========================================================================*/
var cosMap = null;

// Builds a cosine map for the given input size. This allows multiple input sizes to be memoized automagically
// if you want to run the DCT over and over.
var memoizeCosines = function(N) {
  cosMap = cosMap || {};
  cosMap[N] = new Array(N*N);

  var PI_N = Math.PI / N;

  for (var k = 0; k < N; k++) {
    for (var n = 0; n < N; n++) {
      cosMap[N][n + (k * N)] = Math.cos(PI_N * (n + 0.5) * k);
    }
  }
};

function dct(signal, scale) {
  var L = signal.length;
  scale = scale || 2;

  if (!cosMap || !cosMap[L]) memoizeCosines(L);

  var coefficients = signal.map(function () {return 0;});

  return coefficients.map(function (__, ix) {
    return scale * signal.reduce(function (prev, cur, ix_, arr) {
      return prev + (cur * cosMap[L][ix_ + (ix * L)]);
    }, 0);
  });
};

module.exports = dct;

},{}],3:[function(require,module,exports){
'use strict';

var utils = require('./utils');

// real to complex fft
var fft = function fft(signal) {

  var complexSignal = {};

  if (signal.real === undefined || signal.imag === undefined) {
    complexSignal = utils.constructComplexArray(signal);
  } else {
    complexSignal.real = signal.real.slice();
    complexSignal.imag = signal.imag.slice();
  }

  var N = complexSignal.real.length;
  var logN = Math.log2(N);

  if (Math.round(logN) != logN) throw new Error('Input size must be a power of 2.');

  if (complexSignal.real.length != complexSignal.imag.length) {
    throw new Error('Real and imaginary components must have the same length.');
  }

  var bitReversedIndices = utils.bitReverseArray(N);

  // sort array
  var ordered = {
    'real': [],
    'imag': []
  };

  for (var i = 0; i < N; i++) {
    ordered.real[bitReversedIndices[i]] = complexSignal.real[i];
    ordered.imag[bitReversedIndices[i]] = complexSignal.imag[i];
  }

  for (var _i = 0; _i < N; _i++) {
    complexSignal.real[_i] = ordered.real[_i];
    complexSignal.imag[_i] = ordered.imag[_i];
  }
  // iterate over the number of stages
  for (var n = 1; n <= logN; n++) {
    var currN = Math.pow(2, n);

    // find twiddle factors
    for (var k = 0; k < currN / 2; k++) {
      var twiddle = utils.euler(k, currN);

      // on each block of FT, implement the butterfly diagram
      for (var m = 0; m < N / currN; m++) {
        var currEvenIndex = currN * m + k;
        var currOddIndex = currN * m + k + currN / 2;

        var currEvenIndexSample = {
          'real': complexSignal.real[currEvenIndex],
          'imag': complexSignal.imag[currEvenIndex]
        };
        var currOddIndexSample = {
          'real': complexSignal.real[currOddIndex],
          'imag': complexSignal.imag[currOddIndex]
        };

        var odd = utils.multiply(twiddle, currOddIndexSample);

        var subtractionResult = utils.subtract(currEvenIndexSample, odd);
        complexSignal.real[currOddIndex] = subtractionResult.real;
        complexSignal.imag[currOddIndex] = subtractionResult.imag;

        var additionResult = utils.add(odd, currEvenIndexSample);
        complexSignal.real[currEvenIndex] = additionResult.real;
        complexSignal.imag[currEvenIndex] = additionResult.imag;
      }
    }
  }

  return complexSignal;
};

// complex to real ifft
var ifft = function ifft(signal) {

  if (signal.real === undefined || signal.imag === undefined) {
    throw new Error("IFFT only accepts a complex input.");
  }

  var N = signal.real.length;

  var complexSignal = {
    'real': [],
    'imag': []
  };

  //take complex conjugate in order to be able to use the regular FFT for IFFT
  for (var i = 0; i < N; i++) {
    var currentSample = {
      'real': signal.real[i],
      'imag': signal.imag[i]
    };

    var conjugateSample = utils.conj(currentSample);
    complexSignal.real[i] = conjugateSample.real;
    complexSignal.imag[i] = conjugateSample.imag;
  }

  //compute
  var X = fft(complexSignal);

  //normalize
  complexSignal.real = X.real.map(function (val) {
    return val / N;
  });

  complexSignal.imag = X.imag.map(function (val) {
    return val / N;
  });

  return complexSignal;
};

module.exports = {
  fft: fft,
  ifft: ifft
};
},{"./utils":4}],4:[function(require,module,exports){
'use strict';

// memoization of the reversal of different lengths.

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var memoizedReversal = {};
var memoizedZeroBuffers = {};

var constructComplexArray = function constructComplexArray(signal) {
  var complexSignal = {};

  complexSignal.real = signal.real === undefined ? signal.slice() : signal.real.slice();

  var bufferSize = complexSignal.real.length;

  if (memoizedZeroBuffers[bufferSize] === undefined) {
    memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
  }

  complexSignal.imag = memoizedZeroBuffers[bufferSize].slice();

  return complexSignal;
};

var bitReverseArray = function bitReverseArray(N) {
  if (memoizedReversal[N] === undefined) {
    var maxBinaryLength = (N - 1).toString(2).length; //get the binary length of the largest index.
    var templateBinary = '0'.repeat(maxBinaryLength); //create a template binary of that length.
    var reversed = {};
    for (var n = 0; n < N; n++) {
      var currBinary = n.toString(2); //get binary value of current index.

      //prepend zeros from template to current binary. This makes binary values of all indices have the same length.
      currBinary = templateBinary.substr(currBinary.length) + currBinary;

      currBinary = [].concat(_toConsumableArray(currBinary)).reverse().join(''); //reverse
      reversed[n] = parseInt(currBinary, 2); //convert to decimal
    }
    memoizedReversal[N] = reversed; //save
  }
  return memoizedReversal[N];
};

// complex multiplication
var multiply = function multiply(a, b) {
  return {
    'real': a.real * b.real - a.imag * b.imag,
    'imag': a.real * b.imag + a.imag * b.real
  };
};

// complex addition
var add = function add(a, b) {
  return {
    'real': a.real + b.real,
    'imag': a.imag + b.imag
  };
};

// complex subtraction
var subtract = function subtract(a, b) {
  return {
    'real': a.real - b.real,
    'imag': a.imag - b.imag
  };
};

// euler's identity e^x = cos(x) + sin(x)
var euler = function euler(kn, N) {
  var x = -2 * Math.PI * kn / N;
  return { 'real': Math.cos(x), 'imag': Math.sin(x) };
};

// complex conjugate
var conj = function conj(a) {
  a.imag *= -1;
  return a;
};

module.exports = {
  bitReverseArray: bitReverseArray,
  multiply: multiply,
  add: add,
  subtract: subtract,
  euler: euler,
  conj: conj,
  constructComplexArray: constructComplexArray
};
},{}],5:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("dct"),require("fftjs")):"function"==typeof define&&define.amd?define(["dct","fftjs"],e):(t="undefined"!=typeof globalThis?globalThis:t||self).Meyda=e(t.dct,t.fftjs)}(this,(function(t,e){"use strict";function r(t,e,r){if(r||2===arguments.length)for(var n,a=0,o=e.length;a<o;a++)!n&&a in e||(n||(n=Array.prototype.slice.call(e,0,a)),n[a]=e[a]);return t.concat(n||Array.prototype.slice.call(e))}var n=Object.freeze({__proto__:null,blackman:function(t){for(var e=new Float32Array(t),r=2*Math.PI/(t-1),n=2*r,a=0;a<t/2;a++)e[a]=.42-.5*Math.cos(a*r)+.08*Math.cos(a*n);for(a=Math.ceil(t/2);a>0;a--)e[t-a]=e[a-1];return e},hamming:function(t){for(var e=new Float32Array(t),r=0;r<t;r++)e[r]=.54-.46*Math.cos(2*Math.PI*(r/t-1));return e},hanning:function(t){for(var e=new Float32Array(t),r=0;r<t;r++)e[r]=.5-.5*Math.cos(2*Math.PI*r/(t-1));return e},sine:function(t){for(var e=Math.PI/(t-1),r=new Float32Array(t),n=0;n<t;n++)r[n]=Math.sin(e*n);return r}}),a={};function o(t){for(;t%2==0&&t>1;)t/=2;return 1===t}function i(t,e){if("rect"!==e){if(""!==e&&e||(e="hanning"),a[e]||(a[e]={}),!a[e][t.length])try{a[e][t.length]=n[e](t.length)}catch(t){throw new Error("Invalid windowing function")}t=function(t,e){for(var r=[],n=0;n<Math.min(t.length,e.length);n++)r[n]=t[n]*e[n];return r}(t,a[e][t.length])}return t}function u(t,e,r){for(var n=new Float32Array(t),a=0;a<n.length;a++)n[a]=a*e/r,n[a]=13*Math.atan(n[a]/1315.8)+3.5*Math.atan(Math.pow(n[a]/7518,2));return n}function f(t){return Float32Array.from(t)}function s(t){return 1125*Math.log(1+t/700)}function c(t,e,r){for(var n,a=new Float32Array(t+2),o=new Float32Array(t+2),i=e/2,u=s(0),f=(s(i)-u)/(t+1),c=new Array(t+2),p=0;p<a.length;p++)a[p]=p*f,o[p]=(n=a[p],700*(Math.exp(n/1125)-1)),c[p]=Math.floor((r+1)*o[p]/e);for(var h=new Array(t),m=0;m<h.length;m++){h[m]=new Array(r/2+1).fill(0);for(p=c[m];p<c[m+1];p++)h[m][p]=(p-c[m])/(c[m+1]-c[m]);for(p=c[m+1];p<c[m+2];p++)h[m][p]=(c[m+2]-p)/(c[m+2]-c[m+1])}return h}function p(t,e,n,a,o,i,u){void 0===a&&(a=5),void 0===o&&(o=2),void 0===i&&(i=!0),void 0===u&&(u=440);var f=Math.floor(n/2)+1,s=new Array(n).fill(0).map((function(r,a){return t*function(t,e){return Math.log2(16*t/e)}(e*a/n,u)}));s[0]=s[1]-1.5*t;var c,p,h,m=s.slice(1).map((function(t,e){return Math.max(t-s[e])}),1).concat([1]),l=Math.round(t/2),w=new Array(t).fill(0).map((function(e,r){return s.map((function(e){return(10*t+l+e-r)%t-l}))})),d=w.map((function(t,e){return t.map((function(t,r){return Math.exp(-.5*Math.pow(2*w[e][r]/m[r],2))}))}));if(p=(c=d)[0].map((function(){return 0})),h=c.reduce((function(t,e){return e.forEach((function(e,r){t[r]+=Math.pow(e,2)})),t}),p).map(Math.sqrt),d=c.map((function(t,e){return t.map((function(t,e){return t/(h[e]||1)}))})),o){var S=s.map((function(e){return Math.exp(-.5*Math.pow((e/t-a)/o,2))}));d=d.map((function(t){return t.map((function(t,e){return t*S[e]}))}))}return i&&(d=r(r([],d.slice(3),!0),d.slice(0,3),!0)),d.map((function(t){return t.slice(0,f)}))}function h(t,e){for(var r=0,n=0,a=0;a<e.length;a++)r+=Math.pow(a,t)*Math.abs(e[a]),n+=e[a];return r/n}function m(t){var e=t.ampSpectrum,r=t.barkScale,n=t.numberOfBarkBands,a=void 0===n?24:n;if("object"!=typeof e||"object"!=typeof r)throw new TypeError;var o=a,i=new Float32Array(o),u=0,f=e,s=new Int32Array(o+1);s[0]=0;for(var c=r[f.length-1]/o,p=1,h=0;h<f.length;h++)for(;r[h]>c;)s[p++]=h,c=p*r[f.length-1]/o;s[o]=f.length-1;for(h=0;h<o;h++){for(var m=0,l=s[h];l<s[h+1];l++)m+=f[l];i[h]=Math.pow(m,.23)}for(h=0;h<i.length;h++)u+=i[h];return{specific:i,total:u}}function l(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;for(var r=new Float32Array(e.length),n=0;n<r.length;n++)r[n]=Math.pow(e[n],2);return r}function w(t){var e=t.ampSpectrum,r=t.melFilterBank,n=t.bufferSize;if("object"!=typeof e)throw new TypeError("Valid ampSpectrum is required to generate melBands");if("object"!=typeof r)throw new TypeError("Valid melFilterBank is required to generate melBands");for(var a=l({ampSpectrum:e}),o=r.length,i=Array(o),u=new Float32Array(o),f=0;f<u.length;f++){i[f]=new Float32Array(n/2),u[f]=0;for(var s=0;s<n/2;s++)i[f][s]=r[f][s]*a[s],u[f]+=i[f][s];u[f]=Math.log(u[f]+1)}return Array.prototype.slice.call(u)}var d=Object.freeze({__proto__:null,amplitudeSpectrum:function(t){return t.ampSpectrum},buffer:function(t){return t.signal},chroma:function(t){var e=t.ampSpectrum,r=t.chromaFilterBank;if("object"!=typeof e)throw new TypeError("Valid ampSpectrum is required to generate chroma");if("object"!=typeof r)throw new TypeError("Valid chromaFilterBank is required to generate chroma");var n=r.map((function(t,r){return e.reduce((function(e,r,n){return e+r*t[n]}),0)})),a=Math.max.apply(Math,n);return a?n.map((function(t){return t/a})):n},complexSpectrum:function(t){return t.complexSpectrum},energy:function(t){var e=t.signal;if("object"!=typeof e)throw new TypeError;for(var r=0,n=0;n<e.length;n++)r+=Math.pow(Math.abs(e[n]),2);return r},loudness:m,melBands:w,mfcc:function(e){var r=e.ampSpectrum,n=e.melFilterBank,a=e.numberOfMFCCCoefficients,o=e.bufferSize,i=Math.min(40,Math.max(1,a||13));if(n.length<i)throw new Error("Insufficient filter bank for requested number of coefficients");var u=w({ampSpectrum:r,melFilterBank:n,bufferSize:o});return t(u).slice(0,i)},perceptualSharpness:function(t){for(var e=m({ampSpectrum:t.ampSpectrum,barkScale:t.barkScale}),r=e.specific,n=0,a=0;a<r.length;a++)n+=a<15?(a+1)*r[a+1]:.066*Math.exp(.171*(a+1));return n*=.11/e.total},perceptualSpread:function(t){for(var e=m({ampSpectrum:t.ampSpectrum,barkScale:t.barkScale}),r=0,n=0;n<e.specific.length;n++)e.specific[n]>r&&(r=e.specific[n]);return Math.pow((e.total-r)/e.total,2)},powerSpectrum:l,rms:function(t){var e=t.signal;if("object"!=typeof e)throw new TypeError;for(var r=0,n=0;n<e.length;n++)r+=Math.pow(e[n],2);return r/=e.length,r=Math.sqrt(r)},spectralCentroid:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;return h(1,e)},spectralCrest:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;var r=0,n=-1/0;return e.forEach((function(t){r+=Math.pow(t,2),n=t>n?t:n})),r/=e.length,r=Math.sqrt(r),n/r},spectralFlatness:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;for(var r=0,n=0,a=0;a<e.length;a++)r+=Math.log(e[a]),n+=e[a];return Math.exp(r/e.length)*e.length/n},spectralFlux:function(t){var e=t.signal,r=t.previousSignal,n=t.bufferSize;if("object"!=typeof e||"object"!=typeof r)throw new TypeError;for(var a=0,o=-n/2;o<e.length/2-1;o++)x=Math.abs(e[o])-Math.abs(r[o]),a+=(x+Math.abs(x))/2;return a},spectralKurtosis:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;var r=e,n=h(1,r),a=h(2,r),o=h(3,r),i=h(4,r);return(-3*Math.pow(n,4)+6*n*a-4*n*o+i)/Math.pow(Math.sqrt(a-Math.pow(n,2)),4)},spectralRolloff:function(t){var e=t.ampSpectrum,r=t.sampleRate;if("object"!=typeof e)throw new TypeError;for(var n=e,a=r/(2*(n.length-1)),o=0,i=0;i<n.length;i++)o+=n[i];for(var u=.99*o,f=n.length-1;o>u&&f>=0;)o-=n[f],--f;return(f+1)*a},spectralSkewness:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;var r=h(1,e),n=h(2,e),a=h(3,e);return(2*Math.pow(r,3)-3*r*n+a)/Math.pow(Math.sqrt(n-Math.pow(r,2)),3)},spectralSlope:function(t){var e=t.ampSpectrum,r=t.sampleRate,n=t.bufferSize;if("object"!=typeof e)throw new TypeError;for(var a=0,o=0,i=new Float32Array(e.length),u=0,f=0,s=0;s<e.length;s++){a+=e[s];var c=s*r/n;i[s]=c,u+=c*c,o+=c,f+=c*e[s]}return(e.length*f-o*a)/(a*(u-Math.pow(o,2)))},spectralSpread:function(t){var e=t.ampSpectrum;if("object"!=typeof e)throw new TypeError;return Math.sqrt(h(2,e)-Math.pow(h(1,e),2))},zcr:function(t){var e=t.signal;if("object"!=typeof e)throw new TypeError;for(var r=0,n=1;n<e.length;n++)(e[n-1]>=0&&e[n]<0||e[n-1]<0&&e[n]>=0)&&r++;return r}}),S=function(){function t(t,e){var r=this;if(this._m=e,!t.audioContext)throw this._m.errors.noAC;if(t.bufferSize&&!o(t.bufferSize))throw this._m._errors.notPow2;if(!t.source)throw this._m._errors.noSource;this._m.audioContext=t.audioContext,this._m.bufferSize=t.bufferSize||this._m.bufferSize||256,this._m.hopSize=t.hopSize||this._m.hopSize||this._m.bufferSize,this._m.sampleRate=t.sampleRate||this._m.audioContext.sampleRate||44100,this._m.callback=t.callback,this._m.windowingFunction=t.windowingFunction||"hanning",this._m.featureExtractors=d,this._m.EXTRACTION_STARTED=t.startImmediately||!1,this._m.channel="number"==typeof t.channel?t.channel:0,this._m.inputs=t.inputs||1,this._m.outputs=t.outputs||1,this._m.numberOfMFCCCoefficients=t.numberOfMFCCCoefficients||this._m.numberOfMFCCCoefficients||13,this._m.numberOfBarkBands=t.numberOfBarkBands||this._m.numberOfBarkBands||24,this._m.spn=this._m.audioContext.createScriptProcessor(this._m.bufferSize,this._m.inputs,this._m.outputs),this._m.spn.connect(this._m.audioContext.destination),this._m._featuresToExtract=t.featureExtractors||[],this._m.barkScale=u(this._m.bufferSize,this._m.sampleRate,this._m.bufferSize),this._m.melFilterBank=c(Math.max(this._m.melBands,this._m.numberOfMFCCCoefficients),this._m.sampleRate,this._m.bufferSize),this._m.inputData=null,this._m.previousInputData=null,this._m.frame=null,this._m.previousFrame=null,this.setSource(t.source),this._m.spn.onaudioprocess=function(t){var e;null!==r._m.inputData&&(r._m.previousInputData=r._m.inputData),r._m.inputData=t.inputBuffer.getChannelData(r._m.channel),r._m.previousInputData?((e=new Float32Array(r._m.previousInputData.length+r._m.inputData.length-r._m.hopSize)).set(r._m.previousInputData.slice(r._m.hopSize)),e.set(r._m.inputData,r._m.previousInputData.length-r._m.hopSize)):e=r._m.inputData;var n=function(t,e,r){if(t.length<e)throw new Error("Buffer is too short for frame length");if(r<1)throw new Error("Hop length cannot be less that 1");if(e<1)throw new Error("Frame length cannot be less that 1");var n=1+Math.floor((t.length-e)/r);return new Array(n).fill(0).map((function(n,a){return t.slice(a*r,a*r+e)}))}(e,r._m.bufferSize,r._m.hopSize);n.forEach((function(t){r._m.frame=t;var e=r._m.extract(r._m._featuresToExtract,r._m.frame,r._m.previousFrame);"function"==typeof r._m.callback&&r._m.EXTRACTION_STARTED&&r._m.callback(e),r._m.previousFrame=r._m.frame}))}}return t.prototype.start=function(t){this._m._featuresToExtract=t||this._m._featuresToExtract,this._m.EXTRACTION_STARTED=!0},t.prototype.stop=function(){this._m.EXTRACTION_STARTED=!1},t.prototype.setSource=function(t){this._m.source&&this._m.source.disconnect(this._m.spn),this._m.source=t,this._m.source.connect(this._m.spn)},t.prototype.setChannel=function(t){t<=this._m.inputs?this._m.channel=t:console.error("Channel ".concat(t," does not exist. Make sure you've provided a value for 'inputs' that is greater than ").concat(t," when instantiating the MeydaAnalyzer"))},t.prototype.get=function(t){return this._m.inputData?this._m.extract(t||this._m._featuresToExtract,this._m.inputData,this._m.previousInputData):null},t}(),_={audioContext:null,spn:null,bufferSize:512,sampleRate:44100,melBands:26,chromaBands:12,callback:null,windowingFunction:"hanning",featureExtractors:d,EXTRACTION_STARTED:!1,numberOfMFCCCoefficients:13,numberOfBarkBands:24,_featuresToExtract:[],windowing:i,_errors:{notPow2:new Error("Meyda: Buffer size must be a power of 2, e.g. 64 or 512"),featureUndef:new Error("Meyda: No features defined."),invalidFeatureFmt:new Error("Meyda: Invalid feature format"),invalidInput:new Error("Meyda: Invalid input."),noAC:new Error("Meyda: No AudioContext specified."),noSource:new Error("Meyda: No source node specified.")},createMeydaAnalyzer:function(t){return new S(t,Object.assign({},_))},listAvailableFeatureExtractors:function(){return Object.keys(this.featureExtractors)},extract:function(t,e,r){var n=this;if(!e)throw this._errors.invalidInput;if("object"!=typeof e)throw this._errors.invalidInput;if(!t)throw this._errors.featureUndef;if(!o(e.length))throw this._errors.notPow2;void 0!==this.barkScale&&this.barkScale.length==this.bufferSize||(this.barkScale=u(this.bufferSize,this.sampleRate,this.bufferSize)),void 0!==this.melFilterBank&&this.barkScale.length==this.bufferSize&&this.melFilterBank.length==this.melBands||(this.melFilterBank=c(Math.max(this.melBands,this.numberOfMFCCCoefficients),this.sampleRate,this.bufferSize)),void 0!==this.chromaFilterBank&&this.chromaFilterBank.length==this.chromaBands||(this.chromaFilterBank=p(this.chromaBands,this.sampleRate,this.bufferSize)),"buffer"in e&&void 0===e.buffer?this.signal=f(e):this.signal=e;var a=v(e,this.windowingFunction,this.bufferSize);if(this.signal=a.windowedSignal,this.complexSpectrum=a.complexSpectrum,this.ampSpectrum=a.ampSpectrum,r){var i=v(r,this.windowingFunction,this.bufferSize);this.previousSignal=i.windowedSignal,this.previousComplexSpectrum=i.complexSpectrum,this.previousAmpSpectrum=i.ampSpectrum}var s=function(t){return n.featureExtractors[t]({ampSpectrum:n.ampSpectrum,chromaFilterBank:n.chromaFilterBank,complexSpectrum:n.complexSpectrum,signal:n.signal,bufferSize:n.bufferSize,sampleRate:n.sampleRate,barkScale:n.barkScale,melFilterBank:n.melFilterBank,previousSignal:n.previousSignal,previousAmpSpectrum:n.previousAmpSpectrum,previousComplexSpectrum:n.previousComplexSpectrum,numberOfMFCCCoefficients:n.numberOfMFCCCoefficients,numberOfBarkBands:n.numberOfBarkBands})};if("object"==typeof t)return t.reduce((function(t,e){var r;return Object.assign({},t,((r={})[e]=s(e),r))}),{});if("string"==typeof t)return s(t);throw this._errors.invalidFeatureFmt}},v=function(t,r,n){var a={};void 0===t.buffer?a.signal=f(t):a.signal=t,a.windowedSignal=i(a.signal,r),a.complexSpectrum=e.fft(a.windowedSignal),a.ampSpectrum=new Float32Array(n/2);for(var o=0;o<n/2;o++)a.ampSpectrum[o]=Math.sqrt(Math.pow(a.complexSpectrum.real[o],2)+Math.pow(a.complexSpectrum.imag[o],2));return a};return"undefined"!=typeof window&&(window.Meyda=_),_}));


},{"dct":1,"fftjs":3}],6:[function(require,module,exports){
"use strict";
window.AudioContext = window.AudioContext || window.webkitAudioContext;

const Meyda = require("meyda");
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
},{"meyda":5}]},{},[6]);
