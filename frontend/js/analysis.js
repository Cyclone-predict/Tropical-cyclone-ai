/**
 * CycloneAI Labs — Analysis Module
 * Handles satellite image upload, preview, API inference,
 * result rendering, and Grad-CAM display.
 */

const CycloneAnalysis = (function () {
  // State
  var selectedFile = null;
  var lastResult = null;
  var isAnalyzing = false;

  // Supported image types
  var SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  /**
   * Initialize the analysis module — bind events
   */
  function init() {
    var dropzone = document.getElementById('upload-dropzone');
    var fileInput = document.getElementById('file-input');
    var clearBtn = document.getElementById('preview-clear-btn');
    var runBtn = document.getElementById('run-analysis-btn');

    if (dropzone) {
      dropzone.addEventListener('click', function () {
        if (fileInput) fileInput.click();
      });
      dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone.addEventListener('dragleave', function () {
        dropzone.classList.remove('drag-over');
      });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', clearSelection);
    }

    if (runBtn) {
      runBtn.addEventListener('click', runAnalysis);
    }
  }


  /**
   * Handle file selection (from input or drag/drop)
   */
  function handleFileSelect(file) {
    hideError();

    // Validate type
    if (!file.type || SUPPORTED_TYPES.indexOf(file.type) === -1) {
      showError('Unsupported image format. Please select a PNG, JPG, or JPEG file.');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showError('File too large. Maximum file size is 10 MB.');
      return;
    }

    selectedFile = file;
    lastResult = null;
    showPreview(file);
    resetResults();
  }


  /**
   * Show the image preview
   */
  function showPreview(file) {
    var dropzone = document.getElementById('upload-dropzone');
    var previewArea = document.getElementById('preview-area');
    var previewImage = document.getElementById('preview-image');
    var previewMeta = document.getElementById('preview-meta');

    if (dropzone) dropzone.style.display = 'none';
    if (previewArea) previewArea.style.display = 'flex';

    // Create object URL for preview
    var objectUrl = URL.createObjectURL(file);
    if (previewImage) {
      previewImage.src = objectUrl;
      previewImage.onload = function () {
        var metaText = file.name + ' · ' +
          previewImage.naturalWidth + '×' + previewImage.naturalHeight + ' · ' +
          formatFileSize(file.size);
        if (previewMeta) previewMeta.textContent = metaText;
      };
    }
  }


  /**
   * Clear image selection and reset
   */
  function clearSelection() {
    selectedFile = null;
    lastResult = null;

    var dropzone = document.getElementById('upload-dropzone');
    var previewArea = document.getElementById('preview-area');
    var previewImage = document.getElementById('preview-image');
    var fileInput = document.getElementById('file-input');

    if (dropzone) dropzone.style.display = 'flex';
    if (previewArea) previewArea.style.display = 'none';
    if (previewImage && previewImage.src) {
      URL.revokeObjectURL(previewImage.src);
      previewImage.src = '';
    }
    if (fileInput) fileInput.value = '';

    resetResults();
    hideError();

    // Also reset XAI
    resetXAI();
  }


  /**
   * Run the AI analysis
   */
  async function runAnalysis() {
    if (!selectedFile || isAnalyzing) return;

    isAnalyzing = true;
    hideError();
    hideResultsError();
    showProcessing();
    updateRunButton(true);

    try {
      // Animate processing steps
      await animateProcessingStep('pstep-upload', 300);
      await animateProcessingStep('pstep-preprocess', 500);
      await animateProcessingStep('pstep-analysis', 0);

      // Make actual API call
      var result = await CycloneAPI.predictSatelliteImage(selectedFile);

      await animateProcessingStep('pstep-result', 300);
      await animateProcessingStep('pstep-xai', 200);

      lastResult = result;
      showResults(result);
      updateOverviewFromResult(result);
      updateXAIFromResult(result);

    } catch (err) {
      console.error('Analysis error:', err);

      var msg = 'Failed to analyze image.';
      if (err.message) {
        if (err.message.indexOf('Failed to fetch') !== -1 ||
            err.message.indexOf('NetworkError') !== -1 ||
            err.message.indexOf('Load failed') !== -1) {
          msg = 'Backend API unreachable. Ensure the server is running at ' +
            CycloneAPI.getBaseUrl() + ' and CORS is enabled.';
        } else {
          msg = err.message;
        }
      }
      showResultsError(msg);
    } finally {
      isAnalyzing = false;
      updateRunButton(false);
    }
  }


  /**
   * Show processing state
   */
  function showProcessing() {
    toggleElement('results-awaiting', false);
    toggleElement('results-display', false);
    toggleElement('results-error', false);
    toggleElement('results-processing', true);

    // Reset all steps
    var steps = document.querySelectorAll('.processing-step');
    steps.forEach(function (step) {
      step.classList.remove('active', 'done');
    });
  }


  /**
   * Animate a single processing step
   */
  function animateProcessingStep(stepId, delay) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        // Mark previous active steps as done
        var steps = document.querySelectorAll('.processing-step.active');
        steps.forEach(function (s) {
          s.classList.remove('active');
          s.classList.add('done');
        });
        // Mark current step as active
        var step = document.getElementById(stepId);
        if (step) step.classList.add('active');
        resolve();
      }, delay);
    });
  }


  /**
   * Display the actual inference results
   */
  function showResults(result) {
    toggleElement('results-processing', false);
    toggleElement('results-awaiting', false);
    toggleElement('results-error', false);
    toggleElement('results-display', true);

    // Detection banner
    var banner = document.getElementById('result-detection-banner');
    var iconEl = document.getElementById('detection-icon');
    var titleEl = document.getElementById('detection-title');
    var confEl = document.getElementById('detection-confidence');

    var detected = result.cyclone_detected;
    if (detected === undefined || detected === null) {
      // If the field doesn't exist, show a neutral state
      if (iconEl) {
        iconEl.className = 'detection-icon';
        iconEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
      }
      if (titleEl) titleEl.textContent = 'Detection Status Unknown';
    } else if (detected) {
      if (iconEl) {
        iconEl.className = 'detection-icon detected';
        iconEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
      }
      if (titleEl) titleEl.textContent = 'Cyclone Pattern Confirmed';
    } else {
      if (iconEl) {
        iconEl.className = 'detection-icon not-detected';
        iconEl.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      }
      if (titleEl) titleEl.textContent = 'No Cyclone Structure Detected';
    }

    // Confidence
    if (confEl) {
      if (result.confidence !== undefined && result.confidence !== null) {
        confEl.textContent = 'CONFIDENCE: ' + CycloneUI.formatConfidence(result.confidence);
        confEl.style.display = 'block';
      } else {
        confEl.style.display = 'none';
      }
    }

    // Result cards
    setResultField('result-pattern', result.pattern);
    setResultField('result-intensity', result.predicted_vmax !== undefined ?
      (typeof result.predicted_vmax === 'number' ? result.predicted_vmax.toFixed(2) : result.predicted_vmax) :
      result.intensity);
    setResultField('result-trend', result.trend);
    setResultField('result-vmax', result.predicted_vmax !== undefined ?
      result.predicted_vmax : undefined);

    // Note field
    var noteEl = document.getElementById('result-note');
    if (noteEl) {
      if (result.note) {
        noteEl.textContent = result.note;
        noteEl.style.display = 'block';
      } else {
        noteEl.style.display = 'none';
      }
    }

    // Extra fields (any fields beyond the known ones)
    var knownFields = [
      'cyclone_detected', 'pattern', 'predicted_vmax', 'confidence',
      'trend', 'note', 'heatmap_url', 'gradcam_url', 'gradcam',
      'explanation', 'intensity', 'heatmap', 'overlay_url'
    ];
    var extraEl = document.getElementById('result-extra');
    if (extraEl) {
      extraEl.innerHTML = '';
      var keys = Object.keys(result);
      var hasExtra = false;
      for (var i = 0; i < keys.length; i++) {
        if (knownFields.indexOf(keys[i]) === -1 && result[keys[i]] !== undefined) {
          hasExtra = true;
          var item = document.createElement('div');
          item.className = 'result-extra-item';
          item.innerHTML =
            '<span class="result-extra-key">' + escapeHtml(keys[i]) + '</span>' +
            '<span class="result-extra-val">' + escapeHtml(String(result[keys[i]])) + '</span>';
          extraEl.appendChild(item);
        }
      }
    }
  }


  /**
   * Set a result field value, showing "Not available" if missing
   */
  function setResultField(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = CycloneUI.safeValue(value);
    if (value === null || value === undefined || value === '') {
      el.classList.add('awaiting');
    } else {
      el.classList.remove('awaiting');
    }
  }


  /**
   * Update the overview summary cards from a result
   */
  function updateOverviewFromResult(result) {
    var detEl = document.getElementById('summary-detection');
    var patEl = document.getElementById('summary-pattern');
    var intEl = document.getElementById('summary-intensity');
    var trnEl = document.getElementById('summary-trend');
    var confEl = document.getElementById('summary-confidence');

    if (detEl) {
      if (result.cyclone_detected !== undefined) {
        detEl.textContent = result.cyclone_detected ? 'Detected' : 'Not Detected';
        detEl.classList.remove('awaiting');
      }
    }
    if (patEl) {
      patEl.textContent = CycloneUI.safeValue(result.pattern);
      if (result.pattern) patEl.classList.remove('awaiting');
    }
    if (intEl) {
      var intVal = result.predicted_vmax !== undefined ? result.predicted_vmax : result.intensity;
      intEl.textContent = CycloneUI.safeValue(intVal !== undefined ?
        (typeof intVal === 'number' ? intVal.toFixed(2) : intVal) : undefined);
      if (intVal !== undefined) intEl.classList.remove('awaiting');
    }
    if (trnEl) {
      trnEl.textContent = CycloneUI.safeValue(result.trend);
      if (result.trend) trnEl.classList.remove('awaiting');
    }
    if (confEl) {
      if (result.confidence !== undefined && result.confidence !== null) {
        confEl.textContent = CycloneUI.formatConfidence(result.confidence);
        confEl.classList.remove('awaiting');
      }
    }
  }


  /**
   * Update XAI section from result
   */
  function updateXAIFromResult(result) {
    var gradcamUrl = result.heatmap_url || result.gradcam_url || result.gradcam || result.heatmap || null;
    var overlayUrl = result.overlay_url || null;
    var originalSrc = document.getElementById('preview-image') ?
      document.getElementById('preview-image').src : null;

    var emptyEl = document.getElementById('xai-empty');
    var displayEl = document.getElementById('xai-display');

    if (gradcamUrl || overlayUrl) {
      if (emptyEl) emptyEl.style.display = 'none';
      if (displayEl) displayEl.style.display = 'block';

      // Store URLs for tab switching
      displayEl.dataset.original = originalSrc || '';
      displayEl.dataset.heatmap = gradcamUrl || '';
      displayEl.dataset.overlay = overlayUrl || gradcamUrl || '';

      // Show original by default
      var xaiImage = document.getElementById('xai-image');
      if (xaiImage && originalSrc) {
        xaiImage.src = originalSrc;
      }

      // Reset button states
      setActiveXAIButton('xai-btn-original');
      var captionEl = document.getElementById('xai-caption');
      if (captionEl) captionEl.textContent = 'Original satellite image';

    } else {
      if (emptyEl) {
        emptyEl.style.display = 'flex';
        emptyEl.querySelector('h3').textContent = 'Explainability Visualization Unavailable';
        emptyEl.querySelector('p').textContent =
          'Explainability visualization unavailable for this analysis. ' +
          'The backend did not return a Grad-CAM heatmap for the submitted image.';
      }
      if (displayEl) displayEl.style.display = 'none';
    }
  }


  /**
   * Reset XAI to empty state
   */
  function resetXAI() {
    var emptyEl = document.getElementById('xai-empty');
    var displayEl = document.getElementById('xai-display');
    if (emptyEl) {
      emptyEl.style.display = 'flex';
      emptyEl.querySelector('h3').textContent = 'Explainability Visualization Unavailable';
      emptyEl.querySelector('p').textContent =
        'Run an AI analysis first. Grad-CAM heatmaps will be displayed when the backend provides explainability data.';
    }
    if (displayEl) displayEl.style.display = 'none';
  }


  /**
   * Set the active XAI view button
   */
  function setActiveXAIButton(activeId) {
    var buttons = document.querySelectorAll('.xai-btn');
    buttons.forEach(function (btn) {
      btn.classList.remove('active');
    });
    var activeBtn = document.getElementById(activeId);
    if (activeBtn) activeBtn.classList.add('active');
  }


  /**
   * Handle XAI tab switching
   */
  function initXAIControls() {
    var buttons = document.querySelectorAll('.xai-btn');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var view = btn.getAttribute('data-view');
        var display = document.getElementById('xai-display');
        var xaiImage = document.getElementById('xai-image');
        var caption = document.getElementById('xai-caption');
        if (!display || !xaiImage) return;

        setActiveXAIButton(btn.id);

        if (view === 'original') {
          xaiImage.src = display.dataset.original || '';
          if (caption) caption.textContent = 'Original satellite image';
        } else if (view === 'heatmap') {
          var hm = display.dataset.heatmap;
          if (hm) {
            xaiImage.src = hm;
            if (caption) caption.textContent = 'Grad-CAM heatmap — regions influencing model output';
          }
        } else if (view === 'overlay') {
          var ov = display.dataset.overlay;
          if (ov) {
            xaiImage.src = ov;
            if (caption) caption.textContent = 'Heatmap overlay on original image';
          }
        }
      });
    });
  }


  /**
   * Reset the results area to awaiting state
   */
  function resetResults() {
    toggleElement('results-awaiting', true);
    toggleElement('results-processing', false);
    toggleElement('results-display', false);
    toggleElement('results-error', false);
  }


  /**
   * Update the run button state
   */
  function updateRunButton(loading) {
    var btn = document.getElementById('run-analysis-btn');
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.innerHTML =
        '<div class="processing-spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div>' +
        'Analyzing...';
    } else {
      btn.disabled = false;
      btn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' +
        'Run AI Analysis';
    }
  }


  // ===== Error Handling =====

  function showError(msg) {
    var el = document.getElementById('upload-error');
    if (el) {
      el.textContent = msg;
      el.style.display = 'flex';
    }
  }

  function hideError() {
    var el = document.getElementById('upload-error');
    if (el) el.style.display = 'none';
  }

  function showResultsError(msg) {
    toggleElement('results-processing', false);
    toggleElement('results-awaiting', false);
    toggleElement('results-display', false);
    toggleElement('results-error', true);
    var msgEl = document.getElementById('results-error-msg');
    if (msgEl) msgEl.textContent = msg;
  }

  function hideResultsError() {
    toggleElement('results-error', false);
  }


  // ===== Helpers =====

  function toggleElement(id, show) {
    var el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }


  /**
   * Get the last analysis result (for other modules)
   */
  function getLastResult() {
    return lastResult;
  }


  // Public API
  return {
    init: init,
    initXAIControls: initXAIControls,
    clearSelection: clearSelection,
    getLastResult: getLastResult,
    resetXAI: resetXAI
  };
})();
