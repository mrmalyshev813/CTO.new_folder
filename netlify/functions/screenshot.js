const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

/**
 * Load page with retry logic and detailed error reporting
 */
async function loadPageWithRetry(page, url, maxRetries = 3) {
    const errors = [];
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            console.log(`🔄 Попытка ${i + 1}/${maxRetries} загрузить ${url}`);
            console.log(`⏱️ Время начала: ${new Date().toISOString()}`);
            
            const startTime = Date.now();
            
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            
            const loadTime = Date.now() - startTime;
            console.log(`✅ Страница загружена за ${loadTime}ms`);
            
            return { success: true, attempts: i + 1, loadTime, errors };
            
        } catch (error) {
            const errorDetails = {
                attempt: i + 1,
                time: new Date().toISOString(),
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
                url: url
            };
            
            errors.push(errorDetails);
            
            console.error(`❌ Попытка ${i + 1} провалена:`);
            console.error(`   Тип ошибки: ${error.name}`);
            console.error(`   Сообщение: ${error.message}`);
            console.error(`   URL: ${url}`);
            
            if (i === maxRetries - 1) {
                // Последняя попытка - формируем детальный отчет
                const errorReport = {
                    success: false,
                    url: url,
                    totalAttempts: maxRetries,
                    errors: errors,
                    summary: `Не удалось загрузить сайт после ${maxRetries} попыток`,
                    lastError: error.message
                };
                
                throw new Error(JSON.stringify(errorReport));
            }
            
            console.log(`⏳ Ожидание 2 секунды перед следующей попыткой...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const { url } = JSON.parse(event.body);
    
    console.log('📊 === НАЧАЛО АНАЛИЗА ===');
    console.log(`URL: ${url}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    const performanceMetrics = {
        startTime: Date.now(),
        browserLaunch: null,
        pageLoad: null,
        screenshot: null,
        totalTime: null
    };
    
    let browser;
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        const launchStart = Date.now();
        
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        
        performanceMetrics.browserLaunch = Date.now() - launchStart;
        console.log(`✅ Браузер запущен за ${performanceMetrics.browserLaunch}ms`);
        
        // Open page
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Отключить загрузку ненужных ресурсов для ускорения
        console.log('⚙️ Настройка оптимизации загрузки...');
        await page.setRequestInterception(true);
        
        let blockedResources = 0;
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['font', 'media', 'stylesheet'].includes(resourceType)) {
                blockedResources++;
                req.abort();
            } else {
                req.continue();
            }
        });
        
        console.log(`✅ Блокировка лишних ресурсов настроена`);
        
        // Navigate with retry logic
        console.log('🌐 Navigating to page...');
        const pageLoadStart = Date.now();
        
        const result = await loadPageWithRetry(page, url);
        
        performanceMetrics.pageLoad = Date.now() - pageLoadStart;
        
        console.log('📊 === ОТЧЕТ О ЗАГРУЗКЕ ===');
        console.log(`✅ Успешно: ${result.success}`);
        console.log(`🔢 Попыток потребовалось: ${result.attempts}`);
        console.log(`⏱️ Время загрузки: ${result.loadTime}ms`);
        console.log(`🚫 Заблокировано ресурсов: ${blockedResources}`);
        
        if (result.errors.length > 0) {
            console.log(`⚠️ Предыдущие ошибки (до успеха):`);
            result.errors.forEach((err, idx) => {
                console.log(`  ${idx + 1}. ${err.errorMessage}`);
            });
        }
        
        // Wait a bit for dynamic content to render
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Capture screenshot
        console.log('📸 Capturing screenshot...');
        const screenshotStart = Date.now();
        
        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png'
        });
        
        performanceMetrics.screenshot = Date.now() - screenshotStart;
        console.log(`✅ Screenshot captured за ${performanceMetrics.screenshot}ms`);
        
        await browser.close();
        
        // Return base64
        const base64 = screenshot.toString('base64');
        
        performanceMetrics.totalTime = Date.now() - performanceMetrics.startTime;
        
        console.log('📊 === МЕТРИКИ ПРОИЗВОДИТЕЛЬНОСТИ ===');
        console.log(JSON.stringify(performanceMetrics, null, 2));
        console.log('✅ === SCREENSHOT SUCCESS ===');
        
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
                screenshot: `data:image/png;base64,${base64}`,
                metadata: {
                    url: url,
                    attempts: result.attempts,
                    loadTime: result.loadTime,
                    blockedResources: blockedResources,
                    performanceMetrics: performanceMetrics,
                    timestamp: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('❌ === КРИТИЧЕСКАЯ ОШИБКА ===');
        
        let errorReport;
        try {
            errorReport = JSON.parse(error.message);
        } catch {
            errorReport = {
                success: false,
                url: url,
                summary: error.message,
                errorType: error.name,
                errorStack: error.stack
            };
        }
        
        console.error('📋 ДЕТАЛЬНЫЙ ОТЧЕТ ОБ ОШИБКЕ:');
        console.error(JSON.stringify(errorReport, null, 2));
        
        if (browser) await browser.close();
        
        // Вернуть детальную ошибку клиенту
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
