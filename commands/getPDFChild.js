const fs = require('fs').promises
const puppeteer = require('puppeteer');
const blockedPageReqRegexes = require('../mediaProfilesBlockedPageReqRegex')
process.on('message', async (msg) => {
    let pdf = await toPDF(msg.link, msg.ua, blockedPageReqRegexes[msg.reg], msg.allowCookies, msg.removeCookiesAfterLoad, msg.removeAllCookiesExcept, msg.removeCertainCookies, msg.disableJS, msg.outline)
    console.log('spawned')
    // console.log(msg.reg)
    if (msg.outline) {
        process.send(pdf) // this will be an outline link
        console.log(`exited with code 0`)
        process.exit(0)
    } else {
        try {
            await fs.writeFile(msg.filename, pdf)
            process.exit(0)
        } catch (err) {
            if (err) console.error(err)
            process.exit(1)
        }
    }
})

async function toPDF(link, ua, reg, allowCookies, removeCookiesAfterLoad, removeAllCookiesExcept, removeCertainCookies, disableJS, outline) {
    // https://intoli.com/blog/not-possible-to-block-chrome-headless/
    if (outline) {
        return `https://outline.com/${link}`
    }
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
            `--user-agent=${ua}`,
            '--disable-features=ImprovedCookieControls'
        ], headless: true, defaultViewport: null, ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        delete Object.getPrototypeOf(navigator).webdriver

        Object.defineProperty(navigator, 'plugins', {
            get: function () {
                // this just needs to have `length > 0`, but we could mock the plugins too
                return [1, 2, 3, 4, 5];
            },
        });

        window.navigator.chrome = {
            app: {
                isInstalled: false,
            },
            webstore: {
                onInstallStageChanged: {},
                onDownloadProgress: {},
            },
            runtime: {
                PlatformOs: {
                    MAC: 'mac',
                    WIN: 'win',
                    ANDROID: 'android',
                    CROS: 'cros',
                    LINUX: 'linux',
                    OPENBSD: 'openbsd',
                },
                PlatformArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64',
                },
                PlatformNaclArch: {
                    ARM: 'arm',
                    X86_32: 'x86-32',
                    X86_64: 'x86-64',
                },
                RequestUpdateCheckStatus: {
                    THROTTLED: 'throttled',
                    NO_UPDATE: 'no_update',
                    UPDATE_AVAILABLE: 'update_available',
                },
                OnInstalledReason: {
                    INSTALL: 'install',
                    UPDATE: 'update',
                    CHROME_UPDATE: 'chrome_update',
                    SHARED_MODULE_UPDATE: 'shared_module_update',
                },
                OnRestartRequiredReason: {
                    APP_UPDATE: 'app_update',
                    OS_UPDATE: 'os_update',
                    PERIODIC: 'periodic',
                }
            }
        };

        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

    })

    if (ua != "") {
        page.setUserAgent = ua
        if (ua.includes('google')) {
            await page.setExtraHTTPHeaders({
                // "X-Forwarded-For": '64.249.66.1'
                "X-Forwarded-For": '64.233.160.0'
            })
        }
    }
    // if !allowcookies -> block cookies from being set? - done automaticlaly in pptr because each new run is a new browser
    // if removecookiesafterload -> remove all cookies after load

    if (reg != undefined && reg != "") {
        await page.setRequestInterception(true)
        page.on("request", req => {
            if (RegExp(reg).test(req.url())) {
                req.abort();
            } else {
                req.continue();
            }
        })
    }
    if (disableJS) {
        console.log('jsdisabled')
        await page.setRequestInterception(true)
        page.on('request', request => {
            if (request.resourceType() === 'script')
                request.abort();
            else
                request.continue();
        });
    }
    // if (link.includes('seekingalpha.com')) { // special cases
    //   await page.goto(link)
    //   // await page.waitForSelector('[data-test-id="article-content"]')
    //   // .then(async () =>await page.evaluate(() => window.stop()));
    //   // .then(async () => console.log('fuck'))
    //   // await page.waitForTimeout(10)
    //   await page.setRequestInterception(true)
    // }

    const client = await page.target().createCDPSession()
    await page.goto(link)
    await page.screenshot({ path: 'test.png' });
    // await page.exposeFunction('removeDOMElement', removeDOMElement())
    // cant expose functions and pass in DOM: https://github.com/puppeteer/puppeteer/issues/5320 https://github.com/puppeteer/puppeteer/issues/1590

    if (removeCookiesAfterLoad && removeAllCookiesExcept == undefined && removeCertainCookies == undefined) {
        // await client.send('Network.clearBrowserCookies')
    } else if (removeAllCookiesExcept != undefined) {
        var cookies = await page.cookies()
        cookies.forEach(async pageCookies => {
            removeAllCookiesExcept.forEach(async removeCookies => {
                if (pageCookies.name != removeCookies) {
                    await page.deleteCookie({ name: pageCookies.name })
                }
            })
        });
    } else if (removeCertainCookies != undefined) {
        removeCertainCookies.forEach(async element => {
            await page.deleteCookie([{ name: element }])
        });
    } else {
        await client.send('Emulation.setDocumentCookieDisabled', { disabled: true })
    }
    await page.waitForTimeout(2000)

    if (link.includes('americanbanker.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const inlineGate = document.querySelector('.inline-gate');
            if (inlineGate) {
                inlineGate.classList.remove('inline-gate');
                const inlineGated = document.querySelectorAll('.inline-gated');
                for (const elem of inlineGated) { elem.classList.remove('inline-gated'); }
            }
        })
    }
    else if (['ad.nl', 'ed.nl', 'bndestem.nl', 'bd.nl', 'tubantia.nl', 'destentor.nl', 'pzc.nl', 'gelderlander.nl'].some(str => str.includes(link))) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            var paywall = document.querySelector('.article__component.article__component--paywall-module-notification');
            for (var element of paywall) {
                if (element) {
                    element.remove()
                }
            }
        })
    }
    else if (link.includes('washingtonpost.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            var leaderboard = document.querySelector('#leaderboard-wrapper');
            var banner = document.querySelector('#leaderboard-wrapper')
            var adverts = document.querySelectorAll('div[data-qa="article-body-ad"]');
            removeDOMElement(document.querySelector('#wall-bottom-drawer'))
            removeDOMElement(banner)
            removeDOMElement(adverts)
            removeDOMElement(leaderboard)
        })
    }
    else if (link.includes('wsj.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            if (window.location.href.includes('/articles/')) {
                const closeButton = document.querySelector('div.close-btn[role="button"]');
                if (closeButton) { closeButton.click(); }
            }

            const url = window.location.href;
            const snippet = document.querySelector('.snippet-promotion');
            const wsjPro = document.querySelector('meta[name="page.site"][content="wsjpro"]');
            if (snippet || wsjPro) {
                if (!window.location.hash) {
                    if (url.includes('?')) {
                        window.location.href = url.replace('?', '#refreshed?');
                    } else { window.location.href = url + '#refreshed'; }
                } else { window.location.href = window.location.href.replace('wsj.com', 'wsj.com/amp').replace('#refreshed', ''); }
            }

        })
    }
    else if (link.includes('sloanreview.mit.edu')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const readMore = document.querySelector('.btn-read-more');
            if (readMore) {
                readMore.click();
            }
        })
    }
    else if (link.includes('mexiconewsdaily.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            window.setTimeout(function () {
                const popup = document.querySelector('div.pigeon-widget-prompt');
                const cproOverlay = document.querySelector('.cpro-overlay');
                removeDOMElement(popup, cproOverlay);
            }, 500);
        })
    }
    else if (link.includes('the-american-interest.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const counter = document.getElementById('article-counter');
            removeDOMElement(counter);
        })
    }
    else if (link.includes('afr.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            document.addEventListener('DOMContentLoaded', () => {
                const hiddenImage = document.querySelectorAll('img');
                for (const image of hiddenImage) {
                    const src = image.src;
                    if ('src: ' + src.indexOf('.gif') !== -1) {
                        const dataSrc = image.getAttribute('data-src');
                        if (dataSrc) {
                            image.setAttribute('src', dataSrc);
                        }
                    }
                }
                const plista = document.querySelector('div[data-plista-placement="underArticle_Group"]');
                removeDOMElement(plista);
            });
        })
    }
    else if (link.includes('firstthings.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const paywall = document.getElementsByClassName('paywall')[0];
            removeDOMElement(paywall);
        })
    }
    else if (link.includes('bloomberg.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const paywall = document.querySelector('#graphics-paywall-overlay')
            removeDOMElement(paywall);
        })
    }
    else if (link.includes('bloombergquint.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const articlesLeftModal = document.getElementsByClassName('paywall-meter-module__story-paywall-container__1UgCE')[0];
            const paywall = document.getElementById('paywallDmp');
            removeDOMElement(articlesLeftModal, paywall);
            removeDOMElement(paywall);
        })
    }
    else if (link.includes('medium.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const bottomMessageText = 'Get one more story in your member preview when you sign up. It’s free.';
            const DOMElementsToTextDiv = pageContains('div', bottomMessageText);
            if (DOMElementsToTextDiv[2]) removeDOMElement(DOMElementsToTextDiv[2]);
        })
    }
    else if (link.includes('ft.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const cookieBanner = document.querySelector('.o-banner__outer');
            const ribbon = document.querySelector('.js-article-ribbon');
            const ads = document.querySelector('.o-ads');
            removeDOMElement(cookieBanner, ads, ribbon);
        })
    }
    else if (link.includes('nytimes.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const previewButton = document.querySelector('.css-3s1ce0');
            if (previewButton) { previewButton.remove(); }
            // document.querySelector('.css-3fbowa').remove()
            var gatewayContent = document.querySelector('#gateway-content')

            var css1bd8f1 = document.querySelector('.css-1bd8bfl')
            if (gatewayContent) gatewayContent.remove()
            if (css1bd8f1) css1bd8f1.remove()
            // Restore scrolling
            if (document.querySelector('.css-mcm29f')) {
                document.querySelector('.css-mcm29f').setAttribute('style', 'position:relative');
            }
        })
    }
    else if (link.includes('technologyreview.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            window.setTimeout(function () {
                const bodyObscured = document.querySelector('body[class*="body__obscureContent"]');
                if (bodyObscured) { removeClassesByPrefix(bodyObscured, 'body__obscureContent'); }
                const overlay = document.querySelector('div[class*="overlayFooter__wrapper"]');
                if (overlay) { overlay.setAttribute('style', 'display:none'); }
                const contentBodyHidden = document.querySelector('div[class*="contentBody__contentHidden"]');
                if (contentBodyHidden) { removeClassesByPrefix(contentBodyHidden, 'contentBody__contentHidden'); }
                const contentBodyOverlay = document.querySelector('div[class*="contentBody__overlay"]');
                if (contentBodyOverlay) { contentBodyOverlay.removeAttribute('class'); }
            }, 500);
        })
    }
    else if (link.includes('bizjournals.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const sheetOverlay = document.querySelector('.sheet-overlay');
            const chunkPaywall = document.querySelector('.chunk--paywall');
            removeDOMElement(sheetOverlay, chunkPaywall);
            const overlaid = document.querySelectorAll('.is-overlaid');
            for (const el of overlaid) {
                el.classList.remove('is-overlaid');
            }
            const bodyHidden = document.querySelector('.js-pre-chunks__story-body');
            bodyHidden.removeAttribute('style');
        })
    }
    else if (link.includes('barrons.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            document.addEventListener('DOMContentLoaded', () => {
                const bodyContinuous = document.querySelector('body.is-continuous');
                const snippet = document.querySelector('meta[content="snippet"]');
                if (bodyContinuous && snippet) {
                    window.location.href = window.location.href.replace('barrons.com', 'barrons.com/amp');
                }
            });
            if (!window.location.href.includes('barrons.com/amp/')) {
                let href = '';
                const signinLinks = document.querySelectorAll('a.primary-button--link');
                for (const signinLink of signinLinks) {
                    href = signinLink.href;
                    if (href.includes('target=')) {
                        href = href.split('target')[1].split('%3F')[0];
                        href = href.replace('=', '').replace('%3A', ':').replace(/%2F/g, '/');
                        signinLink.href = href;
                        signinLink.text = 'Click';
                    }
                }
            }
        })
    }
    else if (link.includes('seattletimes.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            window.setTimeout(function () {
                // remove modal class from all elements
                document.querySelectorAll('div.modal').forEach(function (el) {
                    removeDOMElement(el);
                });
                // Remove Blurred Style from all matching Divs
                document.getElementById('container').removeAttribute('style');
                document.querySelectorAll('div[style~="filter"]').forEach(function (el) {
                    el.removeAttribute('style');
                });
                document
                    .querySelectorAll('div[class~="NewsletterSignupSplash"]')
                    .forEach(function (el) {
                        el.removeAttribute('class');
                    });
            }, 1000); // Delay (in milliseconds)
        })
    }
    else if (link.includes('theatlantic.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            // Remove all nudge elements
            document.querySelectorAll('div[class*="c-nudge"]').forEach(function (el) {
                removeDOMElement(el);
            });
            // Remove all FancyBox ads
            document.querySelectorAll('div[class*="fancybox"]').forEach(function (el) {
                removeDOMElement(el);
            });
        })
    }
    else if (link.includes('newyorker.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            document.querySelector('.paywall-bar').remove()
            document.querySelector('.paywall-modal').remove()
        })
    }
    else if (link.includes('time.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const body = document.querySelector('body');
            if (body) {
                body.setAttribute('style', 'position:relative !important;');
            }
        })
    }
    else if (link.includes('chicagobusiness.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const body = document.querySelector('body[class]');
            if (body) {
                body.removeAttribute('class');
            }
        })
    }
    else if (link.includes('latimes.com')) {
        await page.evaluate(() => {
            async function removeDOMElement(elements) {
                if (Array.isArray(elements)) {
                    for (var element of elements) {
                        if (element) {
                            element.remove()
                        }
                    }
                } else {
                    elements.remove()
                }
            }
            const paywall = document.querySelector('metering-modal');
            const incognitoWall = document.querySelector('metering-toppanel');
            if (paywall) {
                removeDOMElement(paywall);
            } else if (incognitoWall) {
                removeDOMElement(incognitoWall);
            }
            if (paywall || incognitoWall) {
                document.body.removeAttribute('style');
            }
        })
    } else if (link.includes('forbes.com')) {
        await page.evaluate(() => {
            var paywall = document.querySelector('.paywall_ribbon')
            if (paywall) { paywall.remove() }
        })
    } else if (link.includes('foreignpolicy.com')) {
        await page.evaluate(() => {
            document.querySelector('div.content-ungated').remove()
            var gated = document.querySelector('div.content-gated');
            if (gated) { gated.classList.remove('content-gated') }
        })
    }

    await page.evaluate(() => {
        window.scrollBy(0, document.body.scrollHeight);
    })
    await page.waitForTimeout(150)

    const pdf = await page.pdf({
        format: 'Letter', margin: {
            left: '2.54cm',
            top: '2.54cm',
            right: '2.54cm',
            bottom: '2.54cm'
        }
    });
    await browser.close();
    return pdf
}