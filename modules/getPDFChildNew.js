const puppeteer = require('puppeteer')
const fs = require('fs').promises
console.log(process.cwd())
const extPath = `${process.cwd()}/modules/mediaExt/bypass-paywalls-chrome-master`
// const extPath = `${process.cwd()}/mediaExt/bypass-paywalls-chrome-master` // use if in child-process mode

process.on('message', async (msg) => {
    // const mhtml = await toMhtml(msg.link, msg.ua, blockedPageReqRegexes[msg.reg], msg.allowCookies, msg.removeCookiesAfterLoad, msg.removeAllCookiesExcept, msg.removeCertainCookies, msg.disableJS)


    try {
        const mhtml = await toMhtml(msg.link, msg.ua)
        console.log('spawned')
        console.log(msg.link)
        await fs.writeFile(msg.filename, mhtml)
        // const pdf = await toPDF(msg.filename)
        // console.log("FILENAME" + msg.filename)
        // await fs.writeFile(msg.filename + "p.pdf", pdf)
        process.exit(0)
    } catch (err) {
        if (err) console.error(err)
        process.exit(1)
    }
})

// async function toMhtml(link, ua, reg, removeCookiesAfterLoad, removeAllCookiesExcept, removeCertainCookies, disableJS, writePath) {
async function toMhtml(link, ua) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            `--user-agent=${ua}`,
            // '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36',
            '--disable-features=ImprovedCookieControls',
            `--disable-extensions-except=${extPath}`,
            `--load-extension=${extPath}`
        ],
        headless: false,
        defaultViewport: null,
        ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()

    await page.waitForTimeout(600)

    // const pages = await browser.pages()
    // console.log(pages.length)
    page.bringToFront()
    await page.evaluateOnNewDocument(() => {
        delete Object.getPrototypeOf(navigator).webdriver

        Object.defineProperty(navigator, 'plugins', {
            get: function () {
                // this just needs to have `length > 0`, but we could mock the plugins too
                return [1, 2, 3, 4, 5]
            }
        })

        window.navigator.chrome = {
            app: {
                isInstalled: false
            },
            webstore: {
                onInstallStageChanged: {},
                onDownloadProgress: {}
            },
            runtime: {
                PlatformOs: {
                    MAC: 'mac',
                    WIN: 'win',
                    ANDROID: 'android',
                    CROS: 'cros',
                    LINUX: 'linux',
                    OPENBSD: 'openbsd'
                },
                PlatformArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64'
                },
                PlatformNaclArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64'
                },
                RequestUpdateCheckStatus: {
                    THROTTLED: 'throttled',
                    NO_UPDATE: 'no_update',
                    UPDATE_AVAILABLE: 'update_available'
                },
                OnInstalledReason: {
                    INSTALL: 'install',
                    UPDATE: 'update',
                    CHROME_UPDATE: 'chrome_update',
                    SHARED_MODULE_UPDATE: 'shared_module_update'
                },
                OnRestartRequiredReason: {
                    APP_UPDATE: 'app_update',
                    OS_UPDATE: 'os_update',
                    PERIODIC: 'periodic'
                }
            }
        }

        const originalQuery = window.navigator.permissions.query
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications'
                ? Promise.resolve({ state: Notification.permission })
                : originalQuery(parameters)
        )
    })


    // if (ua != '') {
    //     page.setUserAgent = ua
    //     if (ua.includes('google')) {
    //         await page.setExtraHTTPHeaders({
    //             // "X-Forwarded-For": '64.249.66.1'
    //             'X-Forwarded-For': '64.233.160.0'
    //         })
    //     }
    // }

    // if (reg !== undefined && reg !== '') {
    //     await page.setRequestInterception(true)
    //     page.on('request', req => {
    //         if (RegExp(reg).test(req.url())) {
    //             req.abort()
    //         } else {
    //             req.continue()
    //         }
    //     })
    // }

    // if (disableJS) {
    //     console.log('jsdisabled')
    //     await page.setRequestInterception(true)
    //     page.on('request', request => {
    //         if (request.resourceType() === 'script') { request.abort() } else { request.continue() }
    //     })
    // }

    // await page[2].close()
    await page.waitForTimeout(1000)
    await Promise.race([page.goto(link).catch(e => void e), new Promise(timer => setTimeout(timer, 10 * 1000))])

    await page.waitForTimeout(1000)

    await page.evaluate(() => window.stop())

    await autoScroll(page)
    // await page.evaluate(() => {
    //     window.scrollBy(0, document.body.scrollHeight)
    //     // window.scrollTo(0, document.body.scrollHeight)
    // })

    console.log('done, exporting')

    // const scrollDimension = await page.evaluate(() => {
    //     return {
    //         width: document.scrollingElement.scrollWidth,
    //         height: document.scrollingElement.scrollHeight
    //     }
    // })
    // await page.setViewport({
    //     width: scrollDimension.width,
    //     height: scrollDimension.height
    // })
    // await page.waitForTimeout(150)
    // const pdf = await page.pdf({
    //     path: 'long.pdf',
    //     printBackground: true,
    //     width: scrollDimension.width,
    //     height: scrollDimension.height
    // })
    // return pdf

    // page.waitForTimeout(1000).then(async () => {

    // })
    const client = await page.target().createCDPSession()
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' })
    await browser.close()
    return data
    // setTimeout(async () => {

    // },
    // 1000);


    // console.log(await browser.pages())
    // await browser.pages()[2].close()
    // await browser.pages()[await browser.pages().length - 1].close()
}

// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50); // original 100
        });
    });
}

// async function toPDF(content) {
//     const browser = await puppeteer.launch({ headless: false })
//     const page = await browser.newPage()
//     await page.goto(content)

//     const scrollDimension = await page.evaluate(() => {
//         return {
//             width: document.scrollingElement.scrollWidth,
//             height: document.scrollingElement.scrollHeight
//         }
//     })
//     await page.setViewport({
//         width: scrollDimension.width,
//         height: scrollDimension.height
//     })
//     await page.waitForTimeout(150)
//     const pdf = await page.pdf({
//         format: 'letter',
//         printBackground: true,
//         width: scrollDimension.width,
//         height: scrollDimension.height
//     })
//     return pdf
// }
