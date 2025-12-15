$(document).ready(function() {
    // Form submission
    $('#fraudForm').on('submit', function(e) {
        e.preventDefault();
        analyzeTransaction();
    });

    // Load sample data
    $('#loadSampleBtn').click(function() {
        loadSampleData();
    });

    // Reset form
    $('#resetBtn').click(function() {
        resetForm();
    });
});

function analyzeTransaction() {
    // Show loading modal
    $('#loadingModal').modal('show');
    
    // Collect form data
    const formData = $('#fraudForm').serialize();
    
    // Send AJAX request
    $.ajax({
        type: 'POST',
        url: '/predict',
        data: formData,
        success: function(response) {
            $('#loadingModal').modal('hide');
            
            if (response.success) {
                displayResults(response);
            } else {
                showError(response.error || 'An error occurred');
            }
        },
        error: function(xhr, status, error) {
            $('#loadingModal').modal('hide');
            showError('Server error: ' + error);
        }
    });
}

function loadSampleData() {
    // Show loading
    $('#loadSampleBtn').html('<span class="spinner-border spinner-border-sm"></span> Loading...');
    
    $.get('/sample_data', function(data) {
        // Populate form fields
        Object.keys(data).forEach(key => {
            $(`#${key}`).val(data[key]);
        });
        
        // Restore button
        setTimeout(() => {
            $('#loadSampleBtn').html('<i class="fas fa-vial"></i> Load Sample Data');
        }, 500);
        
        // Show success message
        showToast('Sample data loaded successfully!', 'success');
    }).fail(function() {
        $('#loadSampleBtn').html('<i class="fas fa-vial"></i> Load Sample Data');
        showError('Failed to load sample data');
    });
}

function displayResults(data) {
    // Show results section
    $('#initialState').hide();
    $('#resultsSection').show();
    
    // Update prediction result
    const isFraud = data.is_fraud;
    const resultText = data.prediction;
    const resultAlert = $('#resultAlert');
    const predictionResult = $('#predictionResult');
    
    predictionResult.text(resultText);
    
    if (isFraud) {
        resultAlert.removeClass('alert-success alert-warning').addClass('alert-danger');
        predictionResult.html(`<i class="fas fa-exclamation-triangle"></i> ${resultText}`);
    } else {
        resultAlert.removeClass('alert-danger alert-warning').addClass('alert-success');
        predictionResult.html(`<i class="fas fa-check-circle"></i> ${resultText}`);
    }
    
    // Update progress bar
    const fraudPercent = data.fraud_probability;
    $('#fraudProgress').css('width', fraudPercent + '%').text(fraudPercent + '%');
    $('#fraudPercentage').text(fraudPercent + '%');
    
    // Update risk level
    const riskLevel = $('#riskLevel');
    const riskAlert = $('#riskAlert');
    riskLevel.text(data.risk_level);
    
    riskAlert.removeClass('alert-success alert-warning alert-danger');
    if (data.risk_color === 'success') {
        riskAlert.addClass('alert-success');
    } else if (data.risk_color === 'warning') {
        riskAlert.addClass('alert-warning');
    } else {
        riskAlert.addClass('alert-danger');
    }
    
    // Update probabilities
    $('#legitProbability').text(data.legitimate_probability + '%');
    $('#fraudProbability').text(data.fraud_probability + '%');
    
    // Update recommendation
    const recommendationText = $('#recommendationText');
    if (isFraud) {
        recommendationText.html('<strong>Recommendation:</strong> This transaction has been flagged as potentially fraudulent. Please verify the transaction with the customer and consider blocking the card.');
        $('#recommendation').removeClass('alert-info').addClass('alert-danger');
    } else if (fraudPercent > 30) {
        recommendationText.html('<strong>Recommendation:</strong> This transaction shows some risk factors. Additional verification is recommended.');
        $('#recommendation').removeClass('alert-info').addClass('alert-warning');
    } else {
        recommendationText.html('<strong>Recommendation:</strong> This transaction appears to be legitimate. No additional action required.');
        $('#recommendation').removeClass('alert-warning alert-danger').addClass('alert-info');
    }
    
    // Scroll to results
    $('html, body').animate({
        scrollTop: $('#resultsSection').offset().top - 100
    }, 500);
    
    // Show success message
    showToast('Analysis complete!', 'success');
}

function resetForm() {
    $('#fraudForm')[0].reset();
    $('#initialState').show();
    $('#resultsSection').hide();
    showToast('Form reset successfully', 'info');
}

function showError(message) {
    showToast(message, 'danger');
}

function showToast(message, type) {
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0 position-fixed" 
             style="top: 20px; right: 20px; z-index: 1050;" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Add to DOM
    $('body').append(toastHtml);
    
    // Show toast
    const toastElement = $('#' + toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove after hide
    toastElement.on('hidden.bs.toast', function() {
        $(this).remove();
    });
}

// Initialize tooltips
$(function () {
    $('[data-bs-toggle="tooltip"]').tooltip();
});