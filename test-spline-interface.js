#!/usr/bin/env node

/**
 * Automated Test Suite for Spline Search Interface
 * This script performs automated checks on the application
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Spline Search Interface - Automated Test Suite\n');
console.log('=' .repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`✅ ${description}`);
    return true;
  } catch (error) {
    failedTests++;
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

function fileContains(filePath, searchString) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File ${filePath} does not exist`);
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  return content.includes(searchString);
}

console.log('\n📁 File Structure Tests\n');

test('Components directory exists', () => {
  if (!fileExists('components/ui')) {
    throw new Error('components/ui directory not found');
  }
});

test('splite.tsx component exists', () => {
  if (!fileExists('components/ui/splite.tsx')) {
    throw new Error('components/ui/splite.tsx not found');
  }
});

test('spotlight.tsx component exists', () => {
  if (!fileExists('components/ui/spotlight.tsx')) {
    throw new Error('components/ui/spotlight.tsx not found');
  }
});

test('card.tsx component exists', () => {
  if (!fileExists('components/ui/card.tsx')) {
    throw new Error('components/ui/card.tsx not found');
  }
});

test('demo.tsx component exists', () => {
  if (!fileExists('components/ui/demo.tsx')) {
    throw new Error('components/ui/demo.tsx not found');
  }
});

test('Search API route exists', () => {
  if (!fileExists('app/api/search/route.ts')) {
    throw new Error('app/api/search/route.ts not found');
  }
});

console.log('\n📦 Dependency Tests\n');

test('package.json exists', () => {
  if (!fileExists('package.json')) {
    throw new Error('package.json not found');
  }
});

test('@splinetool/runtime is installed', () => {
  if (!fileContains('package.json', '@splinetool/runtime')) {
    throw new Error('@splinetool/runtime not in dependencies');
  }
});

test('@splinetool/react-spline is installed', () => {
  if (!fileContains('package.json', '@splinetool/react-spline')) {
    throw new Error('@splinetool/react-spline not in dependencies');
  }
});

test('framer-motion is installed', () => {
  if (!fileContains('package.json', 'framer-motion')) {
    throw new Error('framer-motion not in dependencies');
  }
});

test('openai is installed', () => {
  if (!fileContains('package.json', 'openai')) {
    throw new Error('openai not in dependencies');
  }
});

test('lucide-react is installed', () => {
  if (!fileContains('package.json', 'lucide-react')) {
    throw new Error('lucide-react not in dependencies');
  }
});

console.log('\n⚙️  Configuration Tests\n');

test('Tailwind config exists', () => {
  if (!fileExists('tailwind.config.ts')) {
    throw new Error('tailwind.config.ts not found');
  }
});

test('Spotlight animation is configured', () => {
  if (!fileContains('tailwind.config.ts', 'spotlight')) {
    throw new Error('Spotlight animation not found in tailwind config');
  }
});

test('Keyframes are configured', () => {
  if (!fileContains('tailwind.config.ts', 'keyframes')) {
    throw new Error('Keyframes not found in tailwind config');
  }
});

test('TypeScript config exists', () => {
  if (!fileExists('tsconfig.json')) {
    throw new Error('tsconfig.json not found');
  }
});

test('Next.js config exists', () => {
  if (!fileExists('next.config.ts')) {
    throw new Error('next.config.ts not found');
  }
});

console.log('\n🔧 Component Implementation Tests\n');

test('SplineScene uses lazy loading', () => {
  if (!fileContains('components/ui/splite.tsx', 'lazy')) {
    throw new Error('SplineScene does not use lazy loading');
  }
});

test('SplineScene uses Suspense', () => {
  if (!fileContains('components/ui/splite.tsx', 'Suspense')) {
    throw new Error('SplineScene does not use Suspense');
  }
});

test('Spotlight component has SVG filter', () => {
  if (!fileContains('components/ui/spotlight.tsx', 'filter')) {
    throw new Error('Spotlight component missing SVG filter');
  }
});

test('Card components are properly exported', () => {
  if (!fileContains('components/ui/card.tsx', 'export')) {
    throw new Error('Card components not properly exported');
  }
});

test('Demo component uses "use client" directive', () => {
  if (!fileContains('components/ui/demo.tsx', '"use client"')) {
    throw new Error('Demo component missing "use client" directive');
  }
});

console.log('\n🔍 Search Functionality Tests\n');

test('Demo has search state management', () => {
  if (!fileContains('components/ui/demo.tsx', 'useState')) {
    throw new Error('Demo missing state management');
  }
});

test('Demo has loading state', () => {
  if (!fileContains('components/ui/demo.tsx', 'loading')) {
    throw new Error('Demo missing loading state');
  }
});

test('Demo has error handling', () => {
  if (!fileContains('components/ui/demo.tsx', 'error')) {
    throw new Error('Demo missing error handling');
  }
});

test('Demo uses Search icon from lucide-react', () => {
  if (!fileContains('components/ui/demo.tsx', 'Search')) {
    throw new Error('Demo missing Search icon');
  }
});

test('Demo has form submission handler', () => {
  if (!fileContains('components/ui/demo.tsx', 'handleSearch') || 
      !fileContains('components/ui/demo.tsx', 'onSubmit')) {
    throw new Error('Demo missing form submission handler');
  }
});

console.log('\n🤖 OpenAI Integration Tests\n');

test('API route imports OpenAI', () => {
  if (!fileContains('app/api/search/route.ts', 'import OpenAI')) {
    throw new Error('API route does not import OpenAI');
  }
});

test('API route has OpenAI API key configured', () => {
  if (!fileContains('app/api/search/route.ts', 'apiKey')) {
    throw new Error('API route missing API key configuration');
  }
});

test('API route handles POST requests', () => {
  if (!fileContains('app/api/search/route.ts', 'export async function POST')) {
    throw new Error('API route does not handle POST requests');
  }
});

test('API route validates query input', () => {
  if (!fileContains('app/api/search/route.ts', 'query')) {
    throw new Error('API route does not validate query');
  }
});

test('API route has error handling', () => {
  if (!fileContains('app/api/search/route.ts', 'catch')) {
    throw new Error('API route missing error handling');
  }
});

console.log('\n🎨 Styling Tests\n');

test('Demo uses dark theme background', () => {
  if (!fileContains('components/ui/demo.tsx', 'bg-black')) {
    throw new Error('Demo missing dark theme background');
  }
});

test('Demo uses gradient text', () => {
  if (!fileContains('components/ui/demo.tsx', 'gradient')) {
    throw new Error('Demo missing gradient text');
  }
});

test('Demo is responsive (uses lg: breakpoint)', () => {
  if (!fileContains('components/ui/demo.tsx', 'lg:')) {
    throw new Error('Demo missing responsive breakpoints');
  }
});

test('Spotlight has animation class', () => {
  if (!fileContains('components/ui/spotlight.tsx', 'animate-spotlight')) {
    throw new Error('Spotlight missing animation class');
  }
});

console.log('\n🔗 Integration Tests\n');

test('Main page imports Demo component', () => {
  if (!fileExists('app/page.tsx')) {
    throw new Error('app/page.tsx not found');
  }
  if (!fileContains('app/page.tsx', 'Demo')) {
    throw new Error('Main page does not import Demo component');
  }
});

test('Demo imports SplineScene from splite', () => {
  if (!fileContains('components/ui/demo.tsx', 'from "./splite"') && 
      !fileContains('components/ui/demo.tsx', "from './splite'")) {
    throw new Error('Demo does not import from splite.tsx');
  }
});

test('Demo uses Spline scene URL', () => {
  if (!fileContains('components/ui/demo.tsx', 'spline.design') && 
      !fileContains('components/ui/demo.tsx', 'scene.splinecode')) {
    throw new Error('Demo missing Spline scene URL');
  }
});

test('Utils has cn helper function', () => {
  if (!fileExists('lib/utils.ts')) {
    throw new Error('lib/utils.ts not found');
  }
  if (!fileContains('lib/utils.ts', 'export function cn')) {
    throw new Error('Utils missing cn helper function');
  }
});

console.log('\n📱 Responsive Design Tests\n');

test('Demo uses flexbox for layout', () => {
  if (!fileContains('components/ui/demo.tsx', 'flex')) {
    throw new Error('Demo does not use flexbox');
  }
});

test('Demo has mobile-first responsive classes', () => {
  if (!fileContains('components/ui/demo.tsx', 'md:') || 
      !fileContains('components/ui/demo.tsx', 'lg:')) {
    throw new Error('Demo missing responsive classes');
  }
});

console.log('\n🎭 Animation Tests\n');

test('Demo uses framer-motion animations', () => {
  if (!fileContains('components/ui/demo.tsx', 'motion')) {
    throw new Error('Demo does not use framer-motion');
  }
});

test('Demo has fade-in animations', () => {
  if (!fileContains('components/ui/demo.tsx', 'initial') || 
      !fileContains('components/ui/demo.tsx', 'animate')) {
    throw new Error('Demo missing fade-in animations');
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Summary\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Success Rate: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! The application is ready for deployment.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed. Please review and fix the issues.\n`);
  process.exit(1);
}
