const fs = require('fs');
const babel = require('@babel/core');
const { execSync } = require('child_process');

console.log('Building standalone HTML...');

// Read app.jsx
let appCode = fs.readFileSync('app.jsx', 'utf8');

// Remove imports and exports BEFORE transforming
appCode = appCode.replace(/import.*from\s*['"]react['"];?\n?/g, '');
appCode = appCode.replace(/export\s+default\s+.*;?\n?/g, '');

// Add React hooks to the code BEFORE Babel transformation
const prelude = `
const { useState, useEffect, useRef, useCallback } = React;
`;

appCode = prelude + appCode;

// Transform JSX to JS
const { code: transformedCode } = babel.transformSync(appCode, {
  presets: ['@babel/preset-react'],
  filename: 'app.jsx'
});

// Build Tailwind CSS
console.log('Generating Tailwind CSS...');
execSync('npx @tailwindcss/cli -i input.css -o output.css --minify', { stdio: 'pipe' });
const tailwindCSS = fs.readFileSync('output.css', 'utf8');
console.log(`Tailwind CSS: ${(tailwindCSS.length / 1024).toFixed(2)} KB`);

// Create the complete HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>Enterprise Security Readiness Self-Assessment | Adversis</title>
  <meta name="title" content="Enterprise Security Readiness Self-Assessment | Adversis">
  <meta name="description" content="25-question assessment that evaluates your security program the way enterprise buyers do — across compliance, pen testing, architecture, operations, and live calls. Score 0-75 and discover your readiness stage.">
  <meta name="keywords" content="enterprise security readiness, security assessment, SOC 2, penetration testing, security program maturity, enterprise sales, SaaS security, compliance">
  <meta name="author" content="Adversis">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://adversis.github.io/enterprise-readiness/">
  <meta property="og:title" content="Enterprise Security Readiness Self-Assessment | Adversis">
  <meta property="og:description" content="25-question assessment that evaluates your security program the way enterprise buyers do — across compliance, pen testing, architecture, operations, and live calls.">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://adversis.github.io/enterprise-readiness/">
  <meta property="twitter:title" content="Enterprise Security Readiness Self-Assessment | Adversis">
  <meta property="twitter:description" content="25-question assessment that evaluates your security program the way enterprise buyers do — across compliance, pen testing, architecture, operations, and live calls.">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://adversis.github.io/enterprise-readiness/">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Enterprise Security Readiness Self-Assessment",
    "description": "25-question assessment that evaluates your security program the way enterprise buyers do",
    "url": "https://adversis.github.io/enterprise-readiness/",
    "applicationCategory": "SecurityApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Adversis",
      "url": "https://adversis.io"
    }
  }
  </script>

  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Tailwind CSS (production build) -->
  <style>${tailwindCSS}</style>

  <style>
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 5px; }
    ::-webkit-scrollbar-thumb:hover { background: #64748b; }
    #root { min-height: 100vh; }
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    .count-up { animation: countUp 0.6s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    .slide-in { animation: slideIn 0.3s ease-out; }
  </style>
</head>
<body class="bg-[#FAFBFC]">
  <noscript>
    <div style="padding: 2rem; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <h1>JavaScript Required</h1>
      <p>This assessment tool requires JavaScript. Please enable JavaScript to continue.</p>
    </div>
  </noscript>

  <div id="root"></div>

  <!-- React 18 Production -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Botpoison (temporarily disabled)
  <script src="https://unpkg.com/@botpoison/browser"></script>
  -->

  <script>
    // Compiled app code
    ${transformedCode}

    // Render app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(EnterpriseReadinessAssessment));
  </script>
</body>
</html>`;

// Write the file
fs.writeFileSync('index.html', html);

console.log('index.html created successfully!');
console.log('File size:', (html.length / 1024).toFixed(2), 'KB');
console.log('Ready to deploy!');
