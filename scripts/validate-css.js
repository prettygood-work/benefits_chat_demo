#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Simple CSS syntax validator to catch common issues
 * This helps prevent deployment failures due to CSS syntax errors
 */
function validateCSS(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const issues = [];
  let braceCount = 0;
  let inRule = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    
    // Skip comments and empty lines
    if (line.startsWith('/*') || line.startsWith('//') || !line) continue;
    
    // Count braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    braceCount += openBraces - closeBraces;
    
    // Check for basic syntax issues
    if (openBraces > 1) {
      issues.push(`Line ${lineNum}: Multiple opening braces on one line: ${line}`);
    }
    
    if (closeBraces > 1) {
      issues.push(`Line ${lineNum}: Multiple closing braces on one line: ${line}`);
    }
    
    // Check for orphaned closing braces
    if (closeBraces > 0 && braceCount < 0) {
      issues.push(`Line ${lineNum}: Unexpected closing brace: ${line}`);
      braceCount = 0; // Reset to continue checking
    }
    
    // Check for missing semicolons in CSS properties (simple check)
    if (line.includes(':') && !line.includes('{') && !line.includes('}') && !line.endsWith(';') && !line.startsWith('@')) {
      issues.push(`Line ${lineNum}: Missing semicolon: ${line}`);
    }
  }
  
  // Check for unmatched braces at end
  if (braceCount !== 0) {
    issues.push(`Unmatched braces: ${braceCount > 0 ? 'missing closing' : 'extra closing'} braces`);
  }
  
  return issues;
}

// Validate the main CSS file
const cssPath = path.join(__dirname, '../app/globals.css');

if (!fs.existsSync(cssPath)) {
  console.error('CSS file not found:', cssPath);
  process.exit(1);
}

const issues = validateCSS(cssPath);

if (issues.length > 0) {
  console.error('❌ CSS validation failed:');
  issues.forEach(issue => console.error(`  ${issue}`));
  process.exit(1);
} else {
  console.log('✅ CSS validation passed');
}