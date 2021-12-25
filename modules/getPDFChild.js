const puppeteer = require('puppeteer')
// const fs = require('fs').promises
const paywallExtPath = `${process.cwd()}/modules/mediaExt/bypass-paywalls-chrome-master`
// const paywallExtPath = `${process.cwd()}/mediaExt/bypass-paywalls-chrome-master` // use if in child-process mode
const cookieExtPath = `${process.cwd()}/modules/cookieExt/i-dont-care-about-cookies`
const Xvfb = require('xvfb')

process.on('message', async (msg) => {
    try {
        const mhtml = await toMhtml(msg.link, msg.ua)
        console.log('spawned')
        console.log(msg.link)
        process.send(mhtml)
        console.log('sent')
        // const pdf = await toPDF(msg.filename)
        // console.log("FILENAME" + msg.filename)
        // await fs.writeFile(msg.filename + "p.pdf", pdf)
        // process exits automatically after disconnecting from main process
    } catch (err) {
        if (err) console.error(err)
        process.exit(1)
    }
})

async function toMhtml(link, ua) {
    const xvfb = new Xvfb({
        silent: true,
        xvfb_args: ['-screen', '0', '1024x768x24', '-ac']
    })
    xvfb.startSync()
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            `--user-agent=${ua}`,
            '--disable-features=ImprovedCookieControls',
            `--disable-extensions-except=${paywallExtPath},${cookieExtPath}`,
            `--load-extension=${paywallExtPath},${cookieExtPath}`,
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--display=' + xvfb._display
        ],
        headless: false,
        defaultViewport: null,
        ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()

    await page.waitForTimeout(800) // ext loading time

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

    await page.waitForTimeout(1000)
    await Promise.race([page.goto(link).catch(e => void e), new Promise(timer => setTimeout(timer, 10 * 1000))])

    await page.waitForTimeout(1000)

    await page.evaluate(() => window.stop())

    await autoScroll(page)

    console.log('done, exporting')

    const client = await page.target().createCDPSession()
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' })
    await browser.close()
    xvfb.stopSync()
    return data
}

// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 100
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight
                window.scrollBy(0, distance)
                totalHeight += distance

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 50) // original 100
        })
    })
}
