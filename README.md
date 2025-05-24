# Business Valuation Calculator

A modern web application for calculating business valuations using multiple methods including EBITDA Multiple, Discounted Cash Flow (DCF), and Comparable Company Analysis.

## Features

- Clean, modern UI with responsive design
- Multiple valuation methods:
  - EBITDA Multiple Method
  - Discounted Cash Flow (DCF)
  - Comparable Company Analysis (using Perplexity API)
- Industry-specific multiples
- Risk-adjusted calculations
- Real-time comparable company data
- Mobile-friendly interface

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd business-valuation-calculator
```

2. Set up your Perplexity API key:
   - Sign up for a Perplexity API key at https://www.perplexity.ai
   - Replace `YOUR_PERPLEXITY_API_KEY` in `script.js` with your actual API key

3. Serve the application:
   You can use any local server. For example, with Python:
```bash
python -m http.server 8000
```
Or with Node.js and `http-server`:
```bash
npx http-server
```

4. Open the application in your browser:
```
http://localhost:8000
```

## Usage

1. Fill in the Company Information:
   - Company name
   - Website URL
   - Industry sector
   - Sub-sector
   - Location
   - Business age

2. Enter Financial Information:
   - Annual revenue
   - EBITDA
   - Gross margin
   - Growth rate
   - Customer retention rate (optional)
   - Number of employees
   - Risk level
   - Comparable type preference

3. Click "Calculate Valuation" to see results using all three methods:
   - EBITDA Multiple Valuation
   - DCF Valuation
   - Comparable Company Analysis

## Technical Details

### Valuation Methods

1. **EBITDA Multiple Method**
   - Uses industry-specific multiples
   - Adjusts for risk level
   - Considers market conditions

2. **Discounted Cash Flow (DCF)**
   - 5-year projection
   - Risk-adjusted discount rate
   - Terminal value calculation
   - Growth rate considerations

3. **Comparable Company Analysis**
   - Real-time data from Perplexity API
   - Industry-specific comparables
   - Size-appropriate matches
   - Multiple types (EV/EBITDA, P/E)

## Security Notes

- Never commit your API key to version control
- Consider using environment variables for sensitive data
- Implement rate limiting for API calls
- Add input validation and sanitization

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes. 