$(document).ready(function() {
    $('#google-translate').change(function() {
      var selectedLanguage = $(this).val();
      if (selectedLanguage === 'hindi') {
        var englishText = $('#name').val();
        translateText(englishText, $('#name2'));
        englishText = $('#dob').val();
        translateText(englishText, $('#dob2'));
        englishText = $('#gender1').val();
        translateText(englishText, $('#gender2'));
        englishText = $('#number').val();
        translateText(englishText, $('#number2'));
        englishText = $('#address').val();
        translateText(englishText, $('#address2'));
        englishText = $('#address2').val();
        translateText(englishText, $('#fathernamehindi'));
      } else {
        $('.inputd input, .inputd select').val('');
      }
    });
  
    $('#gender1').change(translateGenderOptions);
  
    function translateText(englishText, element) {
      if (!englishText) {
        element.val('');
        return;
      }
      $.ajax({
        url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURI(englishText)}`,
        success: function(result) {
          if (result[0] != undefined && result[0] != null) {
            var hindiText = result[0][0][0];
            element.val(hindiText);
          }
        }
      });
    }
  
    function translateGenderOptions() {
      var gender1 = $('#gender1').val();
      var gender2 = $('#gender2');
      if (gender1 === "male") {
        gender2.html("<option value='general'>सामान्य</option><option value='male'>पुरुष</option>");
      } else if (gender1 === "female") {
        gender2.html("<option value='general'>सामान्य</option><option value='female'>महिला</option>");
      } else {
        gender2.html("<option value='general'>सामान्य</option><option value='male'>पुरुष</option><option value='female'>महिला</option>");
      }
    }
  
    document.getElementById('submit').addEventListener('click', displayDetails);
  
    function displayDetails() {
      // Capture form data
      const fullName = document.getElementById('name').value;
      const fatherName = document.getElementById('fathername').value;
      const dob = document.getElementById('dob').value;
      const gender = document.getElementById('gender1').value;
      const aadharNumber = document.getElementById('number').value;
      const address = document.getElementById('address').value;
  
      // Create an object to store the form data
      const formData = {
        fullName,
        fatherName,
        dob,
        gender,
        aadharNumber,
        address
      };
  
      // Convert the form data object to a JSON string
      const formDataString = JSON.stringify(formData);
  
      // Generate QR code
      const qrCodeContainer = document.getElementById('qr-code-container');
      qrCodeContainer.innerHTML = ''; // Clear previous QR code
      QRCode.toDataURL(formDataString, function (err, url) {
        if (err) console.error(err);
        const img = document.createElement('img');
        img.src = url;
        qrCodeContainer.appendChild(img);
  
        // Store the QR code image URL in local storage
        localStorage.setItem('qrCode', url);
      });
  
      // Handle photo upload and store it in local storage
      const photo = $('#photo')[0].files[0];
      if (photo) {
        const reader = new FileReader();
        reader.onload = function(event) {
          localStorage.setItem('uploadedImage', event.target.result);
          redirectToSecondPage();
        };
        reader.readAsDataURL(photo);
      } else {
        alert('Please upload a photo.');
      }
    }
  
    function redirectToSecondPage() {
      const name = $('#name').val();
      const dob = $('#dob').val();
      const number = $('#number').val();
      const address = $('#address').val();
      const name2 = $('#name2').val();
      const fatherName = $('#fathername').val();
      const dob2 = $('#dob2').val();
      const gender1 = $('#gender1').val();
      const gender2 = $('#gender2').val();
      const number2 = $('#number2').val();
      const address2 = $('#address2').val();
  
      const queryParams = `Second.html?name=${encodeURIComponent(name)}&dob=${encodeURIComponent(dob)}&number=${encodeURIComponent(number)}&address=${encodeURIComponent(address)}&namehind=${encodeURIComponent(name2)}&fathername=${encodeURIComponent(fatherName)}&dob2=${encodeURIComponent(dob2)}&gender=${encodeURIComponent(gender1)}&genderhindi=${encodeURIComponent(gender2)}&number2=${encodeURIComponent(number2)}&addresshind=${encodeURIComponent(address2)}`;
      window.location.href = queryParams;
    }
  });