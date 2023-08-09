/* 1D annotation script 
   Manipulate multiple sliders */

//Handle multiple sliders' input change event
function rangeSlider() {
    var sliders = document.querySelectorAll('.range-slider');
  
    sliders.forEach(function (slider) {
      var range = slider.querySelector('.range-slider__range');
      var value = slider.querySelector('.range-slider__value');
  
      var values = slider.querySelectorAll('.range-slider__value');
      values.forEach(function (val) {
        var valValue = val.previousElementSibling.getAttribute('value');
        val.innerHTML = valValue;
      });
  
      range.addEventListener('input', function () {
        value.innerHTML = this.value;
      });
    });
}

rangeSlider();


  