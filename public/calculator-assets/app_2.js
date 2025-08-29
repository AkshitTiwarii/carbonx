// Carbon Credit Prediction Platform JavaScript

// Application Data
const industryData = {
  "manufacturing": {
    "name": "Manufacturing",
    "emission_factor": 0.52,
    "parameters": ["production_volume", "energy_consumption", "fuel_usage", "transportation"],
    "typical_emissions": {"scope1": 2500, "scope2": 1800, "scope3": 4200},
    "labels": {
      "production_volume": "Production Volume (units/month)",
      "energy_consumption": "Energy Consumption (MWh/month)",
      "fuel_usage": "Fuel Usage (liters/month)",
      "transportation": "Transportation Distance (km/month)"
    }
  },
  "automotive": {
    "name": "Automotive",
    "emission_factor": 8.5,
    "parameters": ["vehicle_production", "assembly_energy", "paint_shop", "testing"],
    "typical_emissions": {"scope1": 3200, "scope2": 2400, "scope3": 5800},
    "labels": {
      "vehicle_production": "Vehicle Production (units/month)",
      "assembly_energy": "Assembly Line Energy (MWh/month)",
      "paint_shop": "Paint Shop Emissions (kg CO₂/month)",
      "testing": "Testing Energy (MWh/month)"
    }
  },
  "steel": {
    "name": "Steel Production",
    "emission_factor": 2.3,
    "parameters": ["raw_materials", "furnace_operations", "electricity", "transportation"],
    "typical_emissions": {"scope1": 4500, "scope2": 1200, "scope3": 2800},
    "labels": {
      "raw_materials": "Raw Materials Input (tons/month)",
      "furnace_operations": "Furnace Operations (hours/month)",
      "electricity": "Electricity Usage (MWh/month)",
      "transportation": "Transportation Distance (km/month)"
    }
  },
  "cement": {
    "name": "Cement",
    "emission_factor": 0.7,
    "parameters": ["limestone", "kiln_fuel", "grinding_energy", "transportation"],
    "typical_emissions": {"scope1": 5200, "scope2": 800, "scope3": 1500},
    "labels": {
      "limestone": "Limestone Usage (tons/month)",
      "kiln_fuel": "Kiln Fuel Consumption (GJ/month)",
      "grinding_energy": "Grinding Energy (MWh/month)",
      "transportation": "Transportation Distance (km/month)"
    }
  },
  "chemical": {
    "name": "Chemical Industry",
    "emission_factor": 1.5,
    "parameters": ["process_heat", "reactions", "steam_generation", "cooling"],
    "typical_emissions": {"scope1": 3800, "scope2": 1600, "scope3": 3200},
    "labels": {
      "process_heat": "Process Heat (GJ/month)",
      "reactions": "Chemical Reactions (batch/month)",
      "steam_generation": "Steam Generation (tons/month)",
      "cooling": "Cooling Energy (MWh/month)"
    }
  },
  "power": {
    "name": "Power Generation",
    "emission_factor": 820,
    "parameters": ["fuel_type", "capacity", "efficiency", "transmission"],
    "typical_emissions": {"scope1": 8500, "scope2": 200, "scope3": 1200},
    "labels": {
      "fuel_type": "Fuel Type Usage (GWh/month)",
      "capacity": "Generation Capacity (MW)",
      "efficiency": "Plant Efficiency (%)",
      "transmission": "Transmission Losses (%)"
    }
  }
};

const mlModels = {
  "random_forest": {"accuracy": 0.89, "confidence": 0.85},
  "xgboost": {"accuracy": 0.92, "confidence": 0.88},
  "lstm": {"accuracy": 0.87, "confidence": 0.82}
};

const carbonPrices = {
  "voluntary": 15.50,
  "compliance": 85.20,
  "future_predicted": 120.00
};

const reductionStrategies = [
  {"strategy": "Energy Efficiency", "reduction_potential": 15, "cost": "Medium", "timeline": "6-12 months"},
  {"strategy": "Renewable Energy", "reduction_potential": 25, "cost": "High", "timeline": "12-24 months"},
  {"strategy": "Process Optimization", "reduction_potential": 12, "cost": "Low", "timeline": "3-6 months"},
  {"strategy": "Technology Upgrade", "reduction_potential": 30, "cost": "Very High", "timeline": "18-36 months"}
];

// Global state
let currentIndustry = null;
let currentResults = null;
let charts = {};

// Chart colors from design system
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing application');
    initializeApplication();
});

// Initialize application
function initializeApplication() {
    console.log('Starting application initialization');
    
    // Initialize in sequence
    setTimeout(() => {
        initializeCharts();
        initializeEventListeners();
        updateDashboardMetrics();
        showInitialSections();
        console.log('Application initialized successfully');
    }, 100);
}

// Show initial sections
function showInitialSections() {
    console.log('Setting initial section visibility');
    
    // Show dashboard and industry selection initially
    const dashboard = document.getElementById('dashboard');
    const industrySelection = document.getElementById('industrySelection');
    
    if (dashboard) {
        dashboard.classList.remove('hidden');
        console.log('Dashboard shown');
    }
    
    if (industrySelection) {
        industrySelection.classList.remove('hidden');
        console.log('Industry selection shown');
    }
    
    // Hide other sections
    const sectionsToHide = ['dataInput', 'loadingSection', 'results', 'recommendations'];
    sectionsToHide.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('hidden');
            console.log(`${sectionId} hidden`);
        }
    });
}

// Event Listeners
function initializeEventListeners() {
    console.log('Initializing event listeners');
    
    // Industry selection - use event delegation for better reliability
    const industryGrid = document.querySelector('.industry-grid');
    if (industryGrid) {
        industryGrid.addEventListener('click', function(e) {
            const industryCard = e.target.closest('.industry-card');
            if (industryCard) {
                const industry = industryCard.getAttribute('data-industry');
                console.log('Industry card clicked:', industry);
                if (industry) {
                    selectIndustry(industry);
                }
            }
        });
        console.log('Industry grid event listener added');
    } else {
        console.error('Industry grid not found');
    }

    // Also add direct listeners to industry cards as backup
    const industryCards = document.querySelectorAll('.industry-card');
    console.log('Found industry cards:', industryCards.length);
    
    industryCards.forEach((card, index) => {
        const industry = card.getAttribute('data-industry');
        console.log(`Setting up card ${index}: ${industry}`);
        
        // Make cards keyboard accessible
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Select ${industry} industry`);
        
        // Add click listener
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Direct industry card clicked:', industry);
            if (industry) {
                selectIndustry(industry);
            }
        });
        
        // Add keyboard listener
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                console.log('Keyboard activation for industry:', industry);
                if (industry) {
                    selectIndustry(industry);
                }
            }
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            card.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0)';
        });
    });

    // Navigation
    const backToIndustriesBtn = document.getElementById('backToIndustries');
    if (backToIndustriesBtn) {
        backToIndustriesBtn.addEventListener('click', function() {
            console.log('Back to industries clicked');
            showInitialSections();
            // Clear selection
            industryCards.forEach(card => card.classList.remove('selected'));
            currentIndustry = null;
        });
    }

    // Form handling
    const emissionForm = document.getElementById('emissionForm');
    if (emissionForm) {
        emissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            processEmissionData();
        });
    }

    const resetFormBtn = document.getElementById('resetForm');
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', function() {
            console.log('Form reset clicked');
            if (emissionForm) {
                emissionForm.reset();
            }
        });
    }

    // Modal handling
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('Export report clicked');
            const reportModal = document.getElementById('reportModal');
            if (reportModal) {
                reportModal.classList.remove('hidden');
            }
        });
    }

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            const reportModal = document.getElementById('reportModal');
            if (reportModal) {
                reportModal.classList.add('hidden');
            }
        });
    }

    const cancelReport = document.getElementById('cancelReport');
    if (cancelReport) {
        cancelReport.addEventListener('click', function() {
            const reportModal = document.getElementById('reportModal');
            if (reportModal) {
                reportModal.classList.add('hidden');
            }
        });
    }

    const generateReport = document.getElementById('generateReport');
    if (generateReport) {
        generateReport.addEventListener('click', function() {
            console.log('Generate report clicked');
            generateReportFile();
        });
    }

    // Refresh data
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Refresh data clicked');
            refreshDashboard();
        });
    }

    // Close modal on backdrop click
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('click', function(e) {
            if (e.target === reportModal) {
                reportModal.classList.add('hidden');
            }
        });
    }
}

// Industry Selection
function selectIndustry(industryKey) {
    console.log('Selecting industry:', industryKey);
    
    currentIndustry = industryKey;
    const industry = industryData[industryKey];
    
    if (!industry) {
        console.error('Industry not found:', industryKey);
        return;
    }
    
    // Update selected state
    const industryCards = document.querySelectorAll('.industry-card');
    industryCards.forEach(card => card.classList.remove('selected'));
    const selectedCard = document.querySelector(`[data-industry="${industryKey}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        console.log('Industry card selected:', industryKey);
    }
    
    // Generate form fields
    generateFormFields(industry);
    
    // Show data input section and hide industry selection
    const dashboard = document.getElementById('dashboard');
    const industrySelection = document.getElementById('industrySelection');
    const dataInput = document.getElementById('dataInput');
    const loadingSection = document.getElementById('loadingSection');
    const results = document.getElementById('results');
    const recommendations = document.getElementById('recommendations');
    
    if (dashboard) dashboard.classList.remove('hidden');
    if (industrySelection) industrySelection.classList.add('hidden');
    if (dataInput) dataInput.classList.remove('hidden');
    if (loadingSection) loadingSection.classList.add('hidden');
    if (results) results.classList.add('hidden');
    if (recommendations) recommendations.classList.add('hidden');
    
    console.log('Transitioned to data input section');
}

// Generate dynamic form fields
function generateFormFields(industry) {
    const formFields = document.getElementById('formFields');
    if (!formFields) {
        console.error('Form fields container not found');
        return;
    }
    
    console.log('Generating form fields for:', industry.name);
    formFields.innerHTML = '';
    
    industry.parameters.forEach(param => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = industry.labels[param];
        label.setAttribute('for', param);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = param;
        input.name = param;
        input.className = 'form-control';
        input.step = 'any';
        input.required = true;
        input.placeholder = `Enter ${industry.labels[param].toLowerCase()}`;
        
        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        formFields.appendChild(fieldDiv);
    });
    
    console.log(`Generated ${industry.parameters.length} form fields`);
}

// Process emission data with ML simulation
async function processEmissionData() {
    console.log('Processing emission data');
    
    const emissionForm = document.getElementById('emissionForm');
    if (!emissionForm) {
        console.error('Emission form not found');
        return;
    }
    
    const formData = new FormData(emissionForm);
    const inputData = {};
    
    // Collect form data
    for (let [key, value] of formData.entries()) {
        inputData[key] = parseFloat(value);
    }
    
    console.log('Form data collected:', inputData);
    
    // Show loading section
    const dashboard = document.getElementById('dashboard');
    const industrySelection = document.getElementById('industrySelection');
    const dataInput = document.getElementById('dataInput');
    const loadingSection = document.getElementById('loadingSection');
    const results = document.getElementById('results');
    const recommendations = document.getElementById('recommendations');
    
    if (dashboard) dashboard.classList.remove('hidden');
    if (industrySelection) industrySelection.classList.add('hidden');
    if (dataInput) dataInput.classList.add('hidden');
    if (loadingSection) loadingSection.classList.remove('hidden');
    if (results) results.classList.add('hidden');
    if (recommendations) recommendations.classList.add('hidden');
    
    console.log('Switched to loading section');
    
    // Simulate ML processing
    await simulateMLProcessing();
    
    // Calculate results
    calculateEmissionResults(inputData);
    
    // Show results and recommendations
    if (dashboard) dashboard.classList.remove('hidden');
    if (industrySelection) industrySelection.classList.add('hidden');
    if (dataInput) dataInput.classList.add('hidden');
    if (loadingSection) loadingSection.classList.add('hidden');
    if (results) results.classList.remove('hidden');
    if (recommendations) recommendations.classList.remove('hidden');
    
    console.log('Switched to results section');
}

// Simulate ML processing with progress
async function simulateMLProcessing() {
    console.log('Starting ML processing simulation');
    
    const progressFill = document.getElementById('progressFill');
    const loadingStatus = document.getElementById('loadingStatus');
    
    if (!progressFill || !loadingStatus) {
        console.error('Loading elements not found');
        return;
    }
    
    const steps = [
        { progress: 20, message: 'Preprocessing input data...' },
        { progress: 40, message: 'Running Random Forest model...' },
        { progress: 60, message: 'Executing XGBoost predictions...' },
        { progress: 80, message: 'Processing LSTM time series...' },
        { progress: 100, message: 'Finalizing results...' }
    ];
    
    for (let step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        progressFill.style.width = `${step.progress}%`;
        loadingStatus.textContent = step.message;
        console.log(`ML Progress: ${step.progress}% - ${step.message}`);
    }
}

// Calculate emission results
function calculateEmissionResults(inputData) {
    console.log('Calculating emission results');
    
    const industry = industryData[currentIndustry];
    const baseEmissions = industry.typical_emissions;
    
    // Apply scaling factors based on input data
    const scaleFactor = calculateScaleFactor(inputData, industry);
    
    const scope1 = Math.round(baseEmissions.scope1 * scaleFactor);
    const scope2 = Math.round(baseEmissions.scope2 * scaleFactor);
    const scope3 = Math.round(baseEmissions.scope3 * scaleFactor);
    
    const totalEmissions = scope1 + scope2 + scope3;
    const excessEmissions = Math.max(0, totalEmissions - 7500); // Assume 7500 is the compliance limit
    const creditCost = Math.round(excessEmissions * carbonPrices.compliance);
    
    currentResults = {
        scope1,
        scope2,
        scope3,
        totalEmissions,
        excessEmissions,
        creditCost,
        scaleFactor
    };
    
    console.log('Results calculated:', currentResults);
    
    // Update UI
    updateResultsDisplay();
    updateChartsWithResults();
    generateRecommendations();
    
    // Update dashboard metrics
    updateDashboardMetrics();
}

// Calculate scale factor based on input data
function calculateScaleFactor(inputData, industry) {
    const values = Object.values(inputData);
    const avgInput = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Simple scaling based on average input relative to typical values
    const baseScale = 1000; // Typical baseline
    return Math.max(0.1, Math.min(5.0, avgInput / baseScale));
}

// Update results display
function updateResultsDisplay() {
    if (!currentResults) return;
    
    console.log('Updating results display');
    
    const scope1El = document.getElementById('scope1Value');
    const scope2El = document.getElementById('scope2Value');
    const scope3El = document.getElementById('scope3Value');
    const excessEl = document.getElementById('excessEmissions');
    const costEl = document.getElementById('totalCreditCost');
    const confidenceEl = document.getElementById('mlConfidence');
    
    if (scope1El) scope1El.textContent = currentResults.scope1.toLocaleString();
    if (scope2El) scope2El.textContent = currentResults.scope2.toLocaleString();
    if (scope3El) scope3El.textContent = currentResults.scope3.toLocaleString();
    if (excessEl) excessEl.textContent = `${currentResults.excessEmissions.toLocaleString()} tCO₂e`;
    if (costEl) costEl.textContent = `$${currentResults.creditCost.toLocaleString()}`;
    
    // Update ML confidence
    const bestModel = mlModels.xgboost;
    if (confidenceEl) confidenceEl.textContent = `${Math.round(bestModel.confidence * 100)}%`;
}

// Generate recommendations
function generateRecommendations() {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    if (!recommendationsGrid) return;
    
    console.log('Generating recommendations');
    recommendationsGrid.innerHTML = '';
    
    reductionStrategies.forEach(strategy => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const potentialReduction = currentResults ? Math.round(currentResults.totalEmissions * strategy.reduction_potential / 100) : 0;
        const costSavings = Math.round(potentialReduction * carbonPrices.compliance);
        
        card.innerHTML = `
            <h4>${strategy.strategy}</h4>
            <div class="recommendation-meta">
                <span class="meta-tag meta-tag--potential">${strategy.reduction_potential}% reduction</span>
                <span class="meta-tag meta-tag--cost">${strategy.cost} cost</span>
                <span class="meta-tag meta-tag--timeline">${strategy.timeline}</span>
            </div>
            <p>Potential reduction: <strong>${potentialReduction.toLocaleString()} tCO₂e</strong></p>
            <p>Estimated savings: <strong>$${costSavings.toLocaleString()}</strong></p>
        `;
        
        recommendationsGrid.appendChild(card);
    });
}

// Update dashboard metrics
function updateDashboardMetrics() {
    const totalEmissions = currentResults ? currentResults.totalEmissions : 8450;
    const creditsRequired = currentResults ? currentResults.excessEmissions : 1250;
    const estimatedCost = currentResults ? currentResults.creditCost : 106500;
    
    const totalEl = document.getElementById('totalEmissions');
    const creditsEl = document.getElementById('creditsRequired');
    const costEl = document.getElementById('estimatedCost');
    const complianceEl = document.getElementById('complianceScore');
    
    if (totalEl) totalEl.textContent = totalEmissions.toLocaleString();
    if (creditsEl) creditsEl.textContent = creditsRequired.toLocaleString();
    if (costEl) costEl.textContent = `$${estimatedCost.toLocaleString()}`;
    
    // Update compliance score based on emissions
    const complianceScore = Math.max(50, Math.min(100, Math.round(100 - (totalEmissions - 7500) / 100)));
    if (complianceEl) complianceEl.textContent = complianceScore;
}

// Initialize charts
function initializeCharts() {
    console.log('Initializing charts');
    // Wait for DOM to be ready
    setTimeout(() => {
        initializeEmissionsChart();
        initializeIndustryChart();
        initializePredictionChart();
        initializeFeatureChart();
    }, 100);
}

// Emissions trend chart
function initializeEmissionsChart() {
    const ctx = document.getElementById('emissionsChart');
    if (!ctx) {
        console.log('Emissions chart canvas not found');
        return;
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const emissionsData = [8200, 7800, 8100, 8600, 8300, 8450, 8200, 8350, 8500, 8100, 8300, 8450];
    
    charts.emissions = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Emissions (tCO₂e)',
                data: emissionsData,
                borderColor: chartColors[0],
                backgroundColor: chartColors[0] + '20',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Emissions (tCO₂e)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    console.log('Emissions chart initialized');
}

// Industry comparison chart
function initializeIndustryChart() {
    const ctx = document.getElementById('industryChart');
    if (!ctx) {
        console.log('Industry chart canvas not found');
        return;
    }
    
    const industries = Object.keys(industryData);
    const emissionsData = industries.map(key => {
        const industry = industryData[key];
        return industry.typical_emissions.scope1 + industry.typical_emissions.scope2 + industry.typical_emissions.scope3;
    });
    
    charts.industry = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: industries.map(key => industryData[key].name),
            datasets: [{
                label: 'Average Emissions',
                data: emissionsData,
                backgroundColor: chartColors.slice(0, industries.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Emissions (tCO₂e)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    console.log('Industry chart initialized');
}

// Prediction chart (shown in results)
function initializePredictionChart() {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) {
        console.log('Prediction chart canvas not found');
        return;
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const historicalData = [8200, 7800, 8100, 8600, 8300, 8450, 8200, 8350];
    const predictedData = [8500, 8300, 8400, 8600];
    
    charts.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Historical Emissions',
                    data: [...historicalData, ...Array(4).fill(null)],
                    borderColor: chartColors[0],
                    backgroundColor: chartColors[0] + '20',
                    fill: false
                },
                {
                    label: 'Predicted Emissions',
                    data: [...Array(8).fill(null), ...predictedData],
                    borderColor: chartColors[1],
                    backgroundColor: chartColors[1] + '20',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Emissions (tCO₂e)'
                    }
                }
            }
        }
    });
    console.log('Prediction chart initialized');
}

// Feature importance chart
function initializeFeatureChart() {
    const ctx = document.getElementById('featureChart');
    if (!ctx) {
        console.log('Feature chart canvas not found');
        return;
    }
    
    const features = ['Energy Consumption', 'Production Volume', 'Transportation', 'Process Efficiency'];
    const importance = [0.35, 0.28, 0.22, 0.15];
    
    charts.feature = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: features,
            datasets: [{
                data: importance,
                backgroundColor: chartColors.slice(0, features.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    console.log('Feature chart initialized');
}

// Update charts with results
function updateChartsWithResults() {
    if (!currentResults) return;
    
    // Update emissions chart with current data point
    const currentMonth = new Date().getMonth();
    if (charts.emissions && charts.emissions.data.datasets[0].data[currentMonth]) {
        charts.emissions.data.datasets[0].data[currentMonth] = currentResults.totalEmissions;
        charts.emissions.update();
    }
}

// Refresh dashboard
function refreshDashboard() {
    console.log('Refreshing dashboard');
    
    // Simulate data refresh
    updateDashboardMetrics();
    
    // Add some randomness to the metrics
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const totalEl = document.getElementById('totalEmissions');
    if (totalEl) {
        const currentEmissions = parseInt(totalEl.textContent.replace(/,/g, ''));
        const newEmissions = Math.round(currentEmissions * (1 + variation));
        totalEl.textContent = newEmissions.toLocaleString();
    }
    
    // Show refresh feedback
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const originalText = refreshBtn.textContent;
        refreshBtn.textContent = 'Updated!';
        refreshBtn.disabled = true;
        setTimeout(() => {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        }, 2000);
    }
}

// Generate report file
function generateReportFile() {
    const reportTypeEl = document.getElementById('reportType');
    const reportFormatEl = document.getElementById('reportFormat');
    
    if (!reportTypeEl || !reportFormatEl) return;
    
    const reportType = reportTypeEl.value;
    const reportFormat = reportFormatEl.value;
    
    console.log(`Generating ${reportType} report in ${reportFormat} format`);
    
    let reportContent = '';
    
    // Generate report content based on type
    switch (reportType) {
        case 'summary':
            reportContent = generateExecutiveSummary();
            break;
        case 'detailed':
            reportContent = generateDetailedAnalysis();
            break;
        case 'compliance':
            reportContent = generateComplianceReport();
            break;
        case 'forecast':
            reportContent = generateForecastReport();
            break;
    }
    
    // Download based on format
    if (reportFormat === 'csv') {
        downloadCSV(reportContent, `carbon-report-${reportType}.csv`);
    } else if (reportFormat === 'json') {
        downloadJSON(reportContent, `carbon-report-${reportType}.json`);
    } else {
        // Simulate PDF download
        alert(`${reportType} report in ${reportFormat} format has been generated and would be downloaded in a real implementation.`);
    }
    
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.classList.add('hidden');
    }
}

// Generate executive summary
function generateExecutiveSummary() {
    const data = currentResults || {
        totalEmissions: 8450,
        excessEmissions: 1250,
        creditCost: 106500
    };
    
    return `Carbon Footprint Executive Summary
Generated: ${new Date().toISOString()}
Industry: ${currentIndustry ? industryData[currentIndustry].name : 'Not specified'}

Key Metrics:
Total Emissions: ${data.totalEmissions} tCO₂e
Carbon Credits Required: ${data.excessEmissions} credits
Estimated Cost: $${data.creditCost}

Recommendations:
- Implement energy efficiency measures
- Consider renewable energy transition
- Optimize operational processes`;
}

// Generate detailed analysis
function generateDetailedAnalysis() {
    if (!currentResults) {
        return 'No analysis data available. Please complete the emission calculation first.';
    }
    
    return `Detailed Carbon Analysis Report
Generated: ${new Date().toISOString()}

Emission Breakdown:
Scope 1 (Direct): ${currentResults.scope1} tCO₂e
Scope 2 (Energy): ${currentResults.scope2} tCO₂e  
Scope 3 (Value Chain): ${currentResults.scope3} tCO₂e
Total: ${currentResults.totalEmissions} tCO₂e

Carbon Credit Analysis:
Excess Emissions: ${currentResults.excessEmissions} tCO₂e
Voluntary Market Cost: $${Math.round(currentResults.excessEmissions * carbonPrices.voluntary)}
Compliance Market Cost: $${currentResults.creditCost}

ML Model Performance:
Random Forest Accuracy: ${Math.round(mlModels.random_forest.accuracy * 100)}%
XGBoost Accuracy: ${Math.round(mlModels.xgboost.accuracy * 100)}%
LSTM Accuracy: ${Math.round(mlModels.lstm.accuracy * 100)}%`;
}

// Generate compliance report
function generateComplianceReport() {
    const complianceEl = document.getElementById('complianceScore');
    const complianceScore = complianceEl ? complianceEl.textContent : '87';
    
    return `Compliance Status Report
Generated: ${new Date().toISOString()}

Regulatory Compliance:
Current Status: ${complianceScore}% Compliant
Required Actions: Carbon offset purchase required

Carbon Credit Requirements:
Credits Needed: ${currentResults ? currentResults.excessEmissions : 1250}
Compliance Deadline: December 31, 2025
Market Price: $${carbonPrices.compliance}/credit

Audit Information:
Last Updated: ${new Date().toLocaleDateString()}
Data Sources: Operational reporting systems
Verification: AI-powered validation`;
}

// Generate forecast report
function generateForecastReport() {
    return `12-Month Emission Forecast Report
Generated: ${new Date().toISOString()}

Forecast Summary:
Current Trajectory: Increasing trend
Predicted Peak: October 2025
Expected Range: 8,300 - 8,600 tCO₂e

Risk Assessment:
Compliance Risk: Medium
Cost Impact: $${Math.round(carbonPrices.future_predicted * 1250)}
Mitigation Priority: High

Recommended Actions:
1. Implement reduction strategies within 6 months
2. Secure carbon credits at current market rates
3. Monitor monthly progress against targets`;
}

// Download CSV
function downloadCSV(content, filename) {
    const csvContent = convertToCSV(content);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, filename);
}

// Download JSON
function downloadJSON(content, filename) {
    const jsonData = {
        timestamp: new Date().toISOString(),
        report_content: content,
        results: currentResults,
        industry: currentIndustry
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

// Convert text to CSV format
function convertToCSV(text) {
    const lines = text.split('\n');
    return lines.map(line => `"${line.replace(/"/g, '""')}"`).join('\n');
}

// Download blob
function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}