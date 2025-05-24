// Constants for calculations
const RISK_RATES = {
    low: 0.10,
    medium: 0.15,
    high: 0.20
};

const INDUSTRY_MULTIPLES = {
    technology: { min: 10, max: 15 },
    healthcare: { min: 8, max: 12 },
    finance: { min: 6, max: 10 },
    retail: { min: 5, max: 8 },
    manufacturing: { min: 4, max: 7 },
    energy: { min: 6, max: 9 },
    telecom: { min: 5, max: 8 },
    real_estate: { min: 12, max: 18 },
    consumer_goods: { min: 7, max: 11 },
    automotive: { min: 4, max: 7 },
    aerospace: { min: 8, max: 12 },
    biotech: { min: 12, max: 18 },
    media: { min: 6, max: 10 },
    agriculture: { min: 4, max: 7 },
    construction: { min: 4, max: 7 },
    education: { min: 8, max: 12 },
    hospitality: { min: 5, max: 8 },
    logistics: { min: 5, max: 8 },
    mining: { min: 4, max: 7 },
    pharma: { min: 10, max: 15 }
};

// Utility functions
const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
};

const formatPercentage = (number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(number / 100);
};

// Form validation
const validateForm = (formData) => {
    const errors = [];

    if (formData.get('revenue') <= 0) {
        errors.push('Revenue must be greater than 0');
    }

    if (formData.get('ebitda') === '') {
        errors.push('EBITDA is required');
    }

    if (formData.get('grossMargin') < 0 || formData.get('grossMargin') > 100) {
        errors.push('Gross Margin must be between 0 and 100');
    }

    if (!formData.get('industry')) {
        errors.push('Industry is required');
    }

    const comparableTypes = formData.getAll('comparableType');
    if (comparableTypes.length === 0) {
        errors.push('Select at least one comparable type');
    }

    return errors;
};

// Calculation functions
const calculateEBITDAValuation = (ebitda, industry) => {
    const multiple = INDUSTRY_MULTIPLES[industry];
    const minValuation = ebitda * multiple.min;
    const maxValuation = ebitda * multiple.max;
    return {
        min: minValuation,
        max: maxValuation,
        average: (minValuation + maxValuation) / 2
    };
};

const calculateDCF = (ebitda, growthRate, riskLevel) => {
    const discountRate = RISK_RATES[riskLevel];
    let presentValue = 0;
    let currentEbitda = ebitda;

    // 5-year projection
    for (let year = 1; year <= 5; year++) {
        currentEbitda *= (1 + growthRate / 100);
        presentValue += currentEbitda / Math.pow(1 + discountRate, year);
    }

    // Terminal value (using perpetuity growth model)
    const terminalGrowthRate = 0.02; // 2% perpetual growth
    const terminalValue = (currentEbitda * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
    const presentTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);

    return presentValue + presentTerminalValue;
};

// API integration
const fetchComparables = async (industry, location, revenue) => {
    try {
        const response = await fetch("https://api.perplexity.ai/v1/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_PERPLEXITY_API_KEY"
            },
            body: JSON.stringify({
                query: `List 5 comparable companies for a ${industry} company in ${location} with ${formatCurrency(revenue)} revenue.`
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comparables:', error);
        return null;
    }
};

// Update UI functions
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('#valuationForm').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
};

const updateValuationCards = (ebitdaVal, dcfVal, comparableVal) => {
    document.querySelector('#ebitdaValuation').innerHTML = `
        <p>Range: ${formatCurrency(ebitdaVal.min)} - ${formatCurrency(ebitdaVal.max)}</p>
        <p>Average: ${formatCurrency(ebitdaVal.average)}</p>
    `;

    document.querySelector('#dcfValuation').innerHTML = `
        <p>Valuation: ${formatCurrency(dcfVal)}</p>
    `;

    document.querySelector('#comparableValuation').innerHTML = `
        <p>Based on industry comparables</p>
        <p>Details in table below</p>
    `;
};

const updateComparablesTable = (comparables) => {
    const tbody = document.querySelector('#comparablesTable tbody');
    tbody.innerHTML = '';

    if (!comparables || !comparables.length) {
        tbody.innerHTML = '<tr><td colspan="4">No comparable data available</td></tr>';
        return;
    }

    comparables.forEach(company => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${company.name}</td>
            <td>${formatCurrency(company.revenue)}</td>
            <td>${company.ebitdaMultiple}x</td>
            <td>${formatCurrency(company.marketCap)}</td>
        `;
        tbody.appendChild(row);
    });
};

const updateRecommendations = (valuations) => {
    const recommendationsDiv = document.querySelector('#recommendations');
    recommendationsDiv.innerHTML = `
        <p>Based on our analysis:</p>
        <ul>
            <li>EBITDA Multiple Valuation suggests a range of ${formatCurrency(valuations.ebitda.min)} - ${formatCurrency(valuations.ebitda.max)}</li>
            <li>DCF Analysis indicates a value of ${formatCurrency(valuations.dcf)}</li>
            <li>Consider the industry trends and growth potential when making final decisions</li>
        </ul>
    `;
};

// Export to PDF functionality
const exportToPDF = () => {
    window.print(); // For simplicity, using browser's print functionality
    // In a production environment, you would want to use a proper PDF generation library
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#valuationForm');
    const calculateBtn = document.querySelector('#calculateBtn');
    const exportPdfBtn = document.querySelector('#exportPdf');
    const resultsSection = document.querySelector('#results');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        const formData = new FormData(form);
        const errors = validateForm(formData);

        if (errors.length > 0) {
            errors.forEach(showError);
            return;
        }

        // Show loading state
        calculateBtn.classList.add('loading');
        calculateBtn.textContent = 'Calculating...';

        try {
            // Get form values
            const ebitda = parseFloat(formData.get('ebitda'));
            const industry = formData.get('industry');
            const growthRate = parseFloat(formData.get('growthRate'));
            const riskLevel = formData.get('riskLevel');
            const location = formData.get('location');
            const revenue = parseFloat(formData.get('revenue'));

            // Calculate valuations
            const ebitdaValuation = calculateEBITDAValuation(ebitda, industry);
            const dcfValuation = calculateDCF(ebitda, growthRate, riskLevel);

            // Fetch comparables
            const comparables = await fetchComparables(industry, location, revenue);

            // Update UI
            updateValuationCards(ebitdaValuation, dcfValuation, comparables);
            updateComparablesTable(comparables);
            updateRecommendations({
                ebitda: ebitdaValuation,
                dcf: dcfValuation
            });

            // Show results
            resultsSection.classList.remove('hidden');
        } catch (error) {
            console.error('Error during calculation:', error);
            showError('An error occurred during calculation. Please try again.');
        } finally {
            // Reset button state
            calculateBtn.classList.remove('loading');
            calculateBtn.textContent = 'Calculate Valuation';
        }
    });

    exportPdfBtn.addEventListener('click', exportToPDF);
}); 