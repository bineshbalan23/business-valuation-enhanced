// Constants for valuation calculations
const RISK_RATES = {
    low: 0.10,    // 10% discount rate
    medium: 0.15, // 15% discount rate
    high: 0.20    // 20% discount rate
};

const INDUSTRY_MULTIPLES = {
    technology: { min: 10, max: 15 },
    healthcare: { min: 8, max: 12 },
    financial: { min: 6, max: 10 },
    retail: { min: 5, max: 8 },
    manufacturing: { min: 4, max: 7 },
    energy: { min: 6, max: 9 },
    telecom: { min: 5, max: 8 },
    consumer: { min: 6, max: 9 },
    real_estate: { min: 12, max: 18 },
    materials: { min: 4, max: 7 },
    utilities: { min: 8, max: 12 },
    industrials: { min: 5, max: 8 },
    education: { min: 6, max: 10 },
    entertainment: { min: 8, max: 12 },
    automotive: { min: 4, max: 7 },
    agriculture: { min: 5, max: 8 },
    aerospace: { min: 7, max: 11 },
    biotech: { min: 12, max: 18 },
    media: { min: 7, max: 11 },
    transportation: { min: 5, max: 8 }
};

// Utility functions
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const calculateEBITDAValuation = (ebitda, sector, riskLevel) => {
    const multiple = INDUSTRY_MULTIPLES[sector] || { min: 5, max: 8 };
    const riskAdjustment = 1 - (RISK_RATES[riskLevel] || 0.15);
    const averageMultiple = (multiple.min + multiple.max) / 2 * riskAdjustment;
    return ebitda * averageMultiple;
};

const calculateDCF = (ebitda, growthRate, riskLevel) => {
    const discountRate = RISK_RATES[riskLevel] || 0.15;
    let presentValue = 0;
    let projectedCashFlow = ebitda;

    // Calculate 5-year projection
    for (let year = 1; year <= 5; year++) {
        projectedCashFlow *= (1 + growthRate / 100);
        presentValue += projectedCashFlow / Math.pow(1 + discountRate, year);
    }

    // Terminal value calculation (Gordon Growth Model)
    const terminalGrowthRate = Math.min(growthRate / 100, 0.03); // Cap at 3%
    const terminalValue = (projectedCashFlow * (1 + terminalGrowthRate)) / 
                         (discountRate - terminalGrowthRate);
    const presentTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);

    return presentValue + presentTerminalValue;
};

const fetchComparables = async (sector, location, revenue) => {
    try {
        // Note: In a real implementation, you would use your actual API key
        const response = await fetch("https://api.perplexity.ai/v1/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_PERPLEXITY_API_KEY"
            },
            body: JSON.stringify({
                query: `Find 5 public or private companies similar to a ${sector} company in ${location} with approx. $${revenue.toLocaleString()} revenue. Return company name, valuation, multiple (EV/EBITDA or P/E), and sector.`
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch comparables');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching comparables:', error);
        return null;
    }
};

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('valuationForm');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerHTML = '<div class="spinner"></div><p>Calculating valuation...</p>';
    form.appendChild(loadingIndicator);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        loadingIndicator.classList.add('active');

        // Get form values
        const formData = new FormData(form);
        const values = {
            revenue: parseFloat(formData.get('revenue')),
            ebitda: parseFloat(formData.get('ebitda')),
            growthRate: parseFloat(formData.get('growthRate')),
            sector: formData.get('sector'),
            location: formData.get('location'),
            riskLevel: formData.get('riskLevel')
        };

        try {
            // Calculate EBITDA Multiple Valuation
            const ebitdaValuation = calculateEBITDAValuation(
                values.ebitda,
                values.sector,
                values.riskLevel
            );
            document.getElementById('ebitdaResult').textContent = formatCurrency(ebitdaValuation);

            // Calculate DCF Valuation
            const dcfValuation = calculateDCF(
                values.ebitda,
                values.growthRate,
                values.riskLevel
            );
            document.getElementById('dcfResult').textContent = formatCurrency(dcfValuation);

            // Fetch and display comparables
            const comparablesData = await fetchComparables(
                values.sector,
                values.location,
                values.revenue
            );

            if (comparablesData) {
                // Calculate average valuation from comparables
                const avgValuation = ebitdaValuation; // Placeholder - would use actual comparable data
                document.getElementById('comparablesResult').textContent = formatCurrency(avgValuation);

                // Display comparables table
                const tableHtml = `
                    <table>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Valuation</th>
                                <th>Multiple</th>
                                <th>Sector</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="4">API response would be parsed and displayed here</td>
                            </tr>
                        </tbody>
                    </table>
                `;
                document.getElementById('comparablesTable').innerHTML = tableHtml;
            }
        } catch (error) {
            console.error('Error calculating valuation:', error);
            alert('An error occurred while calculating the valuation. Please try again.');
        } finally {
            loadingIndicator.classList.remove('active');
        }
    });
}); 