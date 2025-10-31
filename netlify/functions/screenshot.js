const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const sharp = require('sharp');

/**
 * Optimize screenshot for Vision API
 * Compress if size exceeds maxSizeMB limit
 */
async function optimizeScreenshotForVision(screenshot, maxSizeMB = 5) {
    console.log('🔧 === SCREENSHOT OPTIMIZATION START ===');
    console.log('📊 Input buffer length:', screenshot.length);
    console.log('📊 Max size limit:', maxSizeMB, 'MB');
    
    const initialSizeKB = (screenshot.length / 1024).toFixed(2);
    const initialSizeMB = screenshot.length / (1024 * 1024);
    
    console.log(`📊 Initial screenshot size: ${initialSizeKB} KB (${initialSizeMB.toFixed(2)} MB)`);
    console.log('💾 Memory before optimization:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    
    if (initialSizeMB <= maxSizeMB) {
        console.log(`✅ Size within limit (${maxSizeMB} MB), no compression needed`);
        console.log('====================================\n');
        return screenshot;
    }
    
    console.log(`⚙️ Screenshot > ${maxSizeMB}MB, applying compression...`);
    
    const ratioNeeded = maxSizeMB / initialSizeMB;
    const targetQuality = Math.max(50, Math.floor(70 * ratioNeeded));
    
    console.log('📊 Optimization settings:');
    console.log(`   🎯 Size reduction needed: ${(1 - ratioNeeded) * 100}%`);
    console.log(`   🎨 Target quality: ${targetQuality}%`);
    console.log(`   📏 Target resize: 1280x1024 (inside fit)`);
    console.log(`   🔄 Progressive: true`);
    console.log(`   🖼️ Mozjpeg: true`);
    console.log(`   🚫 Without enlargement: true`);
    
    const optimizeStart = Date.now();
    
    try {
        console.log('📍 Step 1: Applying Sharp transformations...');
        
        const optimized = await sharp(screenshot)
            .resize(1280, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: targetQuality,
                progressive: true,
                mozjpeg: true
            })
            .toBuffer();
        
        const optimizeTime = Date.now() - optimizeStart;
        
        const finalSizeKB = (optimized.length / 1024).toFixed(2);
        const finalSizeMB = optimized.length / (1024 * 1024);
        const reductionPercent = ((screenshot.length - optimized.length) / screenshot.length * 100).toFixed(1);
        
        console.log('✅ Optimization completed in', optimizeTime, 'ms');
        console.log(`📊 Final size: ${finalSizeKB} KB (${finalSizeMB.toFixed(2)} MB)`);
        console.log(`📊 Size reduction: ${reductionPercent}%`);
        console.log(`🎨 Final quality: ${targetQuality}%`);
        console.log('💾 Memory after optimization:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        // Check if optimization was successful
        if (finalSizeMB > maxSizeMB) {
            console.warn('⚠️ Warning: Optimized size still exceeds limit');
            console.warn(`📊 Target: ${maxSizeMB}MB, Actual: ${finalSizeMB.toFixed(2)}MB`);
            
            // Try more aggressive compression
            if (finalSizeMB > maxSizeMB * 1.5) {
                console.log('🔧 Applying more aggressive compression...');
                const aggressiveStart = Date.now();
                
                const aggressiveOptimized = await sharp(screenshot)
                    .resize(1024, 768, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: 40,
                        progressive: true,
                        mozjpeg: true
                    })
                    .toBuffer();
                
                const aggressiveTime = Date.now() - aggressiveStart;
                const aggressiveSizeKB = (aggressiveOptimized.length / 1024).toFixed(2);
                const aggressiveSizeMB = aggressiveOptimized.length / (1024 * 1024);
                const aggressiveReduction = ((screenshot.length - aggressiveOptimized.length) / screenshot.length * 100).toFixed(1);
                
                console.log('✅ Aggressive optimization completed in', aggressiveTime, 'ms');
                console.log(`📊 Aggressive size: ${aggressiveSizeKB} KB (${aggressiveSizeMB.toFixed(2)} MB)`);
                console.log(`📊 Aggressive reduction: ${aggressiveReduction}%`);
                console.log('====================================\n');
                
                return aggressiveOptimized;
            }
        }
        
        console.log('====================================\n');
        return optimized;
        
    } catch (error) {
        console.error('\n❌ === OPTIMIZATION ERROR ===');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📋 Error stack:', error.stack);
        console.error('💾 Memory at error:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.error('📊 Input size:', initialSizeMB.toFixed(2), 'MB');
        console.error('🎨 Target quality:', targetQuality, '%');
        console.error('====================================\n');
        
        // Return original screenshot if optimization fails
        console.log('⚠️ Returning original screenshot due to optimization failure');
        return screenshot;
    }
}

/**
 * Load page with retry logic and detailed error reporting
 */
async function loadPageWithRetry(page, url, maxRetries = 3) {
    console.log('🔧 === PAGE LOAD WITH RETRY START ===');
    console.log('🌐 Target URL:', url);
    console.log('🔄 Max retries:', maxRetries);
    console.log('⏱️ Timeout per attempt: 60000ms');
    console.log('📄 Wait until: domcontentloaded');
    
    const errors = [];
    const retryStartTime = Date.now();
    
    for (let i = 0; i < maxRetries; i++) {
        console.log(`\n📍 Attempt ${i + 1}/${maxRetries}`);
        console.log(`🔄 Loading ${url}`);
        console.log(`⏱️ Attempt start time: ${new Date().toISOString()}`);
        console.log(`💾 Memory before attempt: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
        
        try {
            const attemptStart = Date.now();
            
            console.log('📍 Step 1: Calling page.goto()...');
            console.log('📊 Navigation settings:');
            console.log('   - waitUntil: domcontentloaded');
            console.log('   - timeout: 60000ms');
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            const loadTime = Date.now() - attemptStart;
            const totalTime = Date.now() - retryStartTime;
            
            console.log('✅ Page loaded successfully!');
            console.log(`⏱️ Attempt time: ${loadTime}ms`);
            console.log(`⏱️ Total elapsed: ${totalTime}ms`);
            console.log(`💾 Memory after load: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
            
            // Get some page metrics
            try {
                console.log('📍 Step 2: Gathering page metrics...');
                const metrics = await page.evaluate(() => {
                    return {
                        title: document.title,
                        url: window.location.href,
                        readyState: document.readyState,
                        elements: document.querySelectorAll('*').length,
                        images: document.querySelectorAll('img').length,
                        scripts: document.querySelectorAll('script').length,
                        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    };
                });
                
                console.log('📊 Page metrics:');
                console.log(`   📄 Title: ${metrics.title}`);
                console.log(`   🌐 Final URL: ${metrics.url}`);
                console.log(`   📊 Ready state: ${metrics.readyState}`);
                console.log(`   🏷️ Total elements: ${metrics.elements}`);
                console.log(`   🖼️ Images: ${metrics.images}`);
                console.log(`   📜 Scripts: ${metrics.scripts}`);
                console.log(`   🎨 Stylesheets: ${metrics.stylesheets}`);
                console.log(`   📱 Viewport: ${metrics.viewport.width}x${metrics.viewport.height}`);
                
            } catch (metricsError) {
                console.error('⚠️ Failed to gather page metrics:', metricsError.message);
            }
            
            console.log('====================================\n');
            return { success: true, attempts: i + 1, loadTime, errors };
            
        } catch (error) {
            const attemptTime = Date.now() - (Date.now() - 60000); // Approximate
            const errorDetails = {
                attempt: i + 1,
                time: new Date().toISOString(),
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                url: url,
                attemptTime: attemptTime,
                memoryUsage: process.memoryUsage()
            };
            
            errors.push(errorDetails);
            
            console.error(`❌ Attempt ${i + 1} FAILED:`);
            console.error(`🔍 Error type: ${error.name}`);
            console.error(`💬 Error message: ${error.message}`);
            console.error(`🌐 Target URL: ${url}`);
            console.error(`⏱️ Attempt elapsed: ${attemptTime}ms`);
            console.error(`💾 Memory at error: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
            
            // Check for specific error types
            if (error.name === 'TimeoutError') {
                console.error('⏰ This was a timeout error');
            } else if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
                console.error('🔍 DNS resolution failed');
            } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
                console.error('🔍 Connection refused');
            } else if (error.message.includes('net::ERR_SSL')) {
                console.error('🔍 SSL/TLS error');
            } else if (error.message.includes('net::ERR_')) {
                console.error('🔍 Network error detected');
            }
            
            if (i === maxRetries - 1) {
                // Last attempt - create detailed error report
                const totalTime = Date.now() - retryStartTime;
                console.error(`\n❌ ALL ${maxRetries} ATTEMPTS FAILED`);
                console.error(`⏱️ Total time spent: ${totalTime}ms`);
                console.error(`📊 Errors collected: ${errors.length}`);
                
                const errorReport = {
                    success: false,
                    url: url,
                    totalAttempts: maxRetries,
                    totalTime: totalTime,
                    errors: errors,
                    summary: `Failed to load website after ${maxRetries} attempts`,
                    lastError: error.message,
                    errorType: error.name,
                    timestamp: new Date().toISOString()
                };
                
                console.error('📋 Final error report:');
                console.error(JSON.stringify(errorReport, null, 2));
                console.error('====================================\n');
                
                throw new Error(JSON.stringify(errorReport));
            }
            
            console.log(`⏳ Waiting 2 seconds before next attempt...`);
            console.log(`💾 Memory during wait: ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

exports.handler = async (event) => {
    console.log('\n========================================');
    console.log('🔍 SCREENSHOT DEBUG START');
    console.log('========================================');
    
    if (event.httpMethod !== 'POST') {
        console.log('❌ Method not allowed:', event.httpMethod);
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    let parsedBody;
    try {
        parsedBody = JSON.parse(event.body);
        console.log('✅ Request body parsed successfully');
    } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError.message);
        console.error('Raw body:', event.body);
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
    }

    const { url } = parsedBody;
    
    console.log('📍 Step 0: Input URL:', url);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('💾 Memory before:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    console.log('🌐 Environment URL:', process.env.URL);
    console.log('🔧 Node version:', process.version);
    console.log('📦 Event body size:', JSON.stringify(event.body).length, 'bytes');
    
    const performanceMetrics = {
        startTime: Date.now(),
        browserLaunch: null,
        pageLoad: null,
        screenshot: null,
        totalTime: null
    };
    
    let browser;
    try {
        console.log('\n📍 Step 1: Launching browser...');
        console.log('🔧 Chromium args:', chromium.args);
        console.log('📱 Default viewport:', chromium.defaultViewport);
        console.log('🔍 Executable path:', await chromium.executablePath());
        console.log('👻 Headless mode:', chromium.headless);
        
        const launchStart = Date.now();
        
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        
        performanceMetrics.browserLaunch = Date.now() - launchStart;
        console.log('✅ Browser launched in', performanceMetrics.browserLaunch, 'ms');
        console.log('💾 Memory after launch:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        console.log('🔍 Browser process ID:', browser.process()?.pid);
        
        console.log('\n📍 Step 2: Creating new page...');
        const page = await browser.newPage();
        console.log('✅ Page created');
        console.log('🔍 Page target ID:', page.target()._targetId);
        
        console.log('\n📍 Step 3: Setting viewport...');
        await page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Viewport set to 1920x1080');
        
        console.log('\n📍 Step 4: Setting up request interception...');
        await page.setRequestInterception(true);
        
        let blockedResources = 0;
        let allowedResources = 0;
        
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            const url = req.url();
            
            if (['font', 'media', 'stylesheet'].includes(resourceType)) {
                blockedResources++;
                console.log(`🚫 Blocking ${resourceType}: ${url.substring(0, 100)}...`);
                req.abort();
            } else {
                allowedResources++;
                console.log(`✅ Allowing ${resourceType}: ${url.substring(0, 100)}...`);
                req.continue();
            }
        });
        
        console.log('✅ Request interception configured');
        console.log('📊 Will block: font, media, stylesheet');
        console.log('📊 Will allow: document, script, image, xhr, fetch, other');
        
        console.log('\n📍 Step 5: Navigating to URL...');
        console.log('🌐 Target URL:', url);
        console.log('⏱️ Navigation timeout: 60000ms');
        console.log('🔄 Max retries: 3');
        
        const pageLoadStart = Date.now();
        
        const result = await loadPageWithRetry(page, url);
        
        performanceMetrics.pageLoad = Date.now() - pageLoadStart;
        
        console.log('\n📊 === NAVIGATION REPORT ===');
        console.log(`✅ Success: ${result.success}`);
        console.log(`🔢 Attempts required: ${result.attempts}`);
        console.log(`⏱️ Load time: ${result.loadTime}ms`);
        console.log(`🚫 Blocked resources: ${blockedResources}`);
        console.log(`✅ Allowed resources: ${allowedResources}`);
        console.log(`📊 Total requests processed: ${blockedResources + allowedResources}`);
        
        if (result.errors.length > 0) {
            console.log(`⚠️ Previous errors (before success):`);
            result.errors.forEach((err, idx) => {
                console.log(`  ${idx + 1}. ${err.errorMessage}`);
            });
        }
        
        console.log('\n📍 Step 6: Waiting for dynamic content...');
        console.log('⏱️ Waiting 2000ms for rendering...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Dynamic content wait complete');
        console.log('💾 Memory before screenshot:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        console.log('\n📍 Step 7: Taking screenshot...');
        console.log('📸 Screenshot settings:');
        console.log('   - Type: jpeg');
        console.log('   - Quality: 80');
        console.log('   - Full page: false');
        console.log('   - Viewport: 1920x1080');
        
        const screenshotStart = Date.now();
        
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 80,
            fullPage: false
        });
        
        performanceMetrics.screenshot = Date.now() - screenshotStart;
        
        console.log('✅ Screenshot captured in', performanceMetrics.screenshot, 'ms');
        console.log('📊 Screenshot size:', screenshot.length, 'bytes');
        console.log('📊 Screenshot KB:', (screenshot.length / 1024).toFixed(2));
        console.log('📊 Screenshot MB:', (screenshot.length / (1024 * 1024)).toFixed(2));
        console.log('💾 Memory after screenshot:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        console.log('\n📍 Step 8: Optimizing screenshot for Vision API...');
        console.log('🔧 Sharp optimization settings:');
        console.log('   - Max size: 5MB');
        console.log('   - Target resize: 1280x1024 (inside fit)');
        console.log('   - Progressive: true');
        console.log('   - Mozjpeg: true');
        
        const optimizeStart = Date.now();
        const optimizedScreenshot = await optimizeScreenshotForVision(screenshot);
        const optimizeTime = Date.now() - optimizeStart;
        
        console.log('✅ Optimization completed in', optimizeTime, 'ms');
        console.log('📊 Optimized size:', optimizedScreenshot.length, 'bytes');
        console.log('📊 Optimized KB:', (optimizedScreenshot.length / 1024).toFixed(2));
        console.log('📊 Optimized MB:', (optimizedScreenshot.length / (1024 * 1024)).toFixed(2));
        console.log('📊 Size reduction:', ((screenshot.length - optimizedScreenshot.length) / screenshot.length * 100).toFixed(1), '%');
        
        console.log('\n📍 Step 9: Converting to base64...');
        const base64Start = Date.now();
        const base64 = optimizedScreenshot.toString('base64');
        const base64Time = Date.now() - base64Start;
        
        console.log('✅ Base64 conversion in', base64Time, 'ms');
        console.log('📊 Base64 length:', base64.length);
        console.log('📊 Base64 estimated MB:', (base64.length * 0.75 / (1024 * 1024)).toFixed(2));
        
        console.log('\n📍 Step 10: Closing browser...');
        const closeStart = Date.now();
        await browser.close();
        const closeTime = Date.now() - closeStart;
        
        console.log('✅ Browser closed in', closeTime, 'ms');
        console.log('💾 Final memory usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        performanceMetrics.totalTime = Date.now() - performanceMetrics.startTime;
        
        console.log('\n========================================');
        console.log('✅ SCREENSHOT SUCCESS');
        console.log('========================================');
        console.log('📊 === PERFORMANCE METRICS ===');
        console.log(JSON.stringify(performanceMetrics, null, 2));
        console.log('📊 === MEMORY USAGE ===');
        console.log(JSON.stringify(process.memoryUsage(), null, 2));
        console.log('========================================\n');
        
        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                screenshot: `data:image/jpeg;base64,${base64}`,
                metadata: {
                    url: url,
                    attempts: result.attempts,
                    loadTime: result.loadTime,
                    blockedResources: blockedResources,
                    allowedResources: allowedResources,
                    performanceMetrics: performanceMetrics,
                    memoryUsage: process.memoryUsage(),
                    timestamp: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('\n========================================');
        console.error('❌ SCREENSHOT FAILED');
        console.error('========================================');
        console.error('📍 Error step: Unknown - check stack trace');
        console.error('🔍 Error name:', error.name);
        console.error('💬 Error message:', error.message);
        console.error('📋 Error stack:', error.stack);
        console.error('⏰ Error timestamp:', new Date().toISOString());
        console.error('💾 Memory at error:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
        
        let errorReport;
        try {
            errorReport = JSON.parse(error.message);
            console.error('📊 Parsed error report:', JSON.stringify(errorReport, null, 2));
        } catch {
            errorReport = {
                success: false,
                url: url,
                summary: error.message,
                errorType: error.name,
                errorStack: error.stack,
                timestamp: new Date().toISOString(),
                memoryUsage: process.memoryUsage()
            };
        }
        
        console.error('📋 DETAILED ERROR REPORT:');
        console.error(JSON.stringify(errorReport, null, 2));
        console.error('========================================\n');
        
        if (browser) {
            try {
                console.log('🔧 Attempting to close browser after error...');
                await browser.close();
                console.log('✅ Browser closed successfully');
            } catch (closeError) {
                console.error('❌ Failed to close browser:', closeError.message);
            }
        }
        
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: '⏱️ Сайт не ответил вовремя. Проверьте, доступен ли URL и попробуйте снова.',
                details: errorReport,
                timestamp: new Date().toISOString()
            })
        };
    }
};
