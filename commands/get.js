exports.run = async function (client, message, args) {
    const superagent = require('superagent');
    // require('superagent-proxy')(superagent);
    const querystring = require('querystring');
    var scholar = require('google-scholar-link')
    const Discord = require('discord.js');
    const { http, https } = require('follow-redirects');
    const config = client.config
    const mediaDomains = require('../mediaDomains.json');
    const mediaProfilesAllowCookies = require('../mediaProfilesAllowCookies.json') // dont remove before page load - if not in the remove after page load, the cookie is kept
    const mediaProfilesRemoveCookies = require('../mediaProfilesRemoveCookies.json') // remove after page load
    const mediaProfilesRemoveAllExcept = require('../mediaProfilesRemoveAllExcept.json')
    const mediaProfilesRemove = require('../mediaProfilesRemove.json')
    const googleBotList = require('../googleBot.json')
    const bingBotList = require('../bingBot.json')
    const mediaProfilesAmp = require('../mediaProfilesAMP.json')
    const blockedPageReqRegexes = require('../mediaProfilesBlockedPageReqRegex')
    const mediaProfilesDisableJS = require('../mediaProfilesDisableJS.json')
    var uas = {
        "google": 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        "bing": "'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'"
    }
    const puppeteer = require('puppeteer');
    const psl = require('psl');
    const fs = require('fs')
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var scholarLink = ""
    if (client.optINOUT.get(message.author.id) != undefined) {
        if (client.optINOUT.get(message.author.id).value.includes(__filename.substring(__filename.lastIndexOf("/") + 1, __filename.indexOf(".js")))) return message.channel.send("You have opted out of this service. Use the `optout` command to remove this optout.")
    } if (args.join(' ') === "" || args.join(' ').indexOf("http") === -1) {
        const help = new Discord.MessageEmbed()
            .setColor("#f0ffff")
            .setDescription("**Command: **" + `${config.prefix}get`)
            .addField("**Usage:**", `${config.prefix}get <research report link/doi link>`)
            .addField("**Example:**", `${config.prefix}get https://www.doi.org/10.2307/1342499/`)
            .addField("**Expected Result From Example:**", "Bot will search sci-hub for the specified document. If it is found, it will return a PDF to the channel. If PDF is too large, the PDF link will be sent.")
        message.channel.send({ embed: help })
        return;
    }



    if ((args[0].toLowerCase() != 'r') && (args[0].toLowerCase() === 'm' || (mediaDomains.some(v => args[args.length - 1].includes(v))))) {
        var url = args.pop()
        var filename = "./newsTempOutFiles/" + getRndInteger(999, 999999).toString() + message.channel.id + "x" + ".pdf"
        var urlParsed = psl.parse(url.replace('https://', "").replace('http://', "").split('/')[0])
        if (googleBotList.some(str => str.includes(urlParsed.domain))) {
            var ua = uas['google']
        } else if (bingBotList.some(str => str.includes(urlParsed.domain))) {
            var ua = uas['bing']
        } else {
            var ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4538.0 Safari/537.36"
        }
        var options = { // flags
            "allowCookies": mediaProfilesAllowCookies.some(str => str.includes(urlParsed.domain)),
            "removeCookiesAfterLoad": mediaProfilesRemoveCookies.some(str => str.includes(urlParsed.domain)),
            "removeAllCookiesExcept": mediaProfilesRemoveAllExcept[urlParsed.domain],
            "removeCertainCookies": mediaProfilesRemove[urlParsed.domain],
            "bot": googleBotList.some(str => str.includes(urlParsed.domain)) ? 'google' : bingBotList.some(str => str.includes(urlParsed.domain)) ? 'bing' : "",
            "ua": ua,
            "amp": mediaProfilesAmp[urlParsed.domain],
            "blockedPageReqRegex": blockedPageReqRegexes[urlParsed.domain],
            "disableJS": mediaProfilesDisableJS.some(str => str.includes(urlParsed.domain))
        }
        console.log(options)
        message.channel.send(`OPTIONS:\nallowCookies: ${options.allowCookies}\nremoveCookiesAfterLoad: ${options.removeCookiesAfterLoad}\nremoveAllCookiesExcept: ${options.removeAllCookiesExcept}\nremoveCertainCookies: ${options.removeCertainCookies}\nBot: ${options.bot}\nUseragent UA: ${options.ua}\nAMP?: ${options.amp}\nblockedPageReqRegex: \`${options.blockedPageReqRegex}\`\nGive it a second, it might be slow...`)

        if (options.amp != undefined && options.amp != "") {
            url = url.replace(urlParsed.domain, options.amp).replace('www.', "") // make sure we go to the amp site if it has the amp flag
        }

        var result = await toPDF(url, ua, options.blockedPageReqRegex, options.allowCookies, options.removeCookiesAfterLoad, options.removeAllCookiesExcept, options.removeCertainCookies, options.disableJS)
        fs.writeFile(filename.toString(), result, function (err) {
            if (err) return console.log(err)
        })
        setTimeout(() => {
            message.channel.send({ files: [filename] })
        }, 700);
        setTimeout(() => {
            fs.unlink(filename, (err) => {
                if (err) console.log(err)
                console.log(`${filename} was deleted.`)
            })
        }, 1700);





        async function toPDF(link, ua, reg, allowCookies, removeCookiesAfterLoad, removeAllCookiesExcept, removeCertainCookies, disableJS) {
            // https://intoli.com/blog/not-possible-to-block-chrome-headless/
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
                    var banner = document.querySelector('#leaderboard-wrapper')
                    var adverts = document.querySelectorAll('div[data-qa="article-body-ad"]');
                    removeDOMElement(document.querySelector('#wall-bottom-drawer'))
                    removeDOMElement(banner)
                    removeDOMElement(adverts)
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
            }



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

    }
    // sci hub section below
    else if (args[0].toLowerCase() === 'r' || !mediaDomains.some(v => args[args.length - 1].includes(v))) {

        superagent
            .get(`https://sci-hub.se/${args.join(' ')}`)
            // .get(`https://sci-hub.se/https://www.doi.org/10.2307/1342499/`)
            .set("Cache-Control", "no-cache")
            .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
            .set("Accept", "*/*")
            .set("Accept-Encoding", "gzip, deflate, br")
            .set("Connection", "keep-alive")
            .set("Host", "sci-hub.se")
            .redirects(5)
            // .proxy(config.proxy)
            .end((err, res) => {
                client.logger.log('info', `get command used by ${message.author.username} Time: ${Date()} Guild: ${message.guild}`)
                // Calling the end function will send the request
                // console.log(res.text)
                try {
                    var found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
                } catch {
                    found = null
                }
                // console.log(found)
                if (found === null) {
                    if (res.text.includes('libgen')) { // libgen download
                        var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                        libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                        message.channel.send(`Document on libgen - Mirror selection page: ${res.request.url}`)
                        message.channel.send(`Working Download Mirror Link: ${libgenSection}`)
                    } else if (args.join(' ').includes('doi.org')) {
                        const doiRequest = https.request({
                            host: 'doi.org',
                            path: args.join(' ').substring(15)
                        }, response => {
                            // console.log(response.responseUrl);
                            superagent
                                .get(`https://sci-hub.se/${response.responseUrl}`)
                                .set("Cache-Control", "no-cache")
                                .set('User-Agent', "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36")
                                .set("Accept", "*/*")
                                .set("Accept-Encoding", "gzip, deflate, br")
                                .set("Connection", "keep-alive")
                                .set("Host", "sci-hub.se")
                                // .proxy(config.proxy)
                                .end((err, res) => {
                                    found = res.text.match(/<iframe src = \"(.*?)\" id = \"pdf\"><\/iframe>/)
                                    if (found === null) {
                                        if (res.text.includes('libgen')) { // libgen download
                                            var libgenSection = res.text.substring(res.text.indexOf('<td colspan=2>') + 14, res.text.indexOf('</a></b></td>'))
                                            libgenSection = libgenSection.substring(libgenSection.indexOf(`<b><a href='`) + 12, libgenSection.indexOf(`'>`))
                                            const request = https.request({
                                                host: 'sci-hub.se',
                                                path: args.join(' '),
                                            }, response => {
                                                console.log(response.responseUrl);
                                                message.channel.send(`Document on libgen - Mirror selection page: ${response.responseUrl}`)
                                            });
                                            request.end();
                                            message.channel.send(`Working Download Mirror Link: ${libgenSection}`)
                                        } else {
                                            message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                                            scholarLink = scholar(querystring.escape(args.join(' ')))
                                            scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                                            scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                                            message.channel.send(scholarLink)
                                        }
                                    } else {
                                        if (found[1].indexOf("https") === -1) {
                                            found[1] = "https:" + found[1];
                                        }
                                        try {
                                            message.channel.send(found[1])
                                            message.channel.send({
                                                files: [found[1] + ".pdf"]
                                            }).catch(err => console.log(err))
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }
                                })
                        });
                        doiRequest.end();
                    } else {
                        message.reply(`Not found on Sci-Hub! :( Try the following Google Scholar link (Incase they have a free PDF)`)
                        scholarLink = scholar(querystring.escape(args.join(' ')))
                        scholarLink = scholarLink.substring(0, scholarLink.length - 1)
                        scholarLink = scholarLink.substring(0, scholarLink.indexOf('"')) + scholarLink.substring(scholarLink.indexOf('"') + 1)
                        message.channel.send(scholarLink)
                    }

                } else {
                    if (found[1].indexOf("https") === -1) {
                        found[1] = "https:" + found[1];
                    }
                    try {
                        message.channel.send(found[1])
                        message.channel.send({
                            files: [found[1] + ".pdf"]
                        }).catch(err => console.log(err))
                    } catch (e) {
                        console.log(e)
                    }
                }
            })

    }
}

// ARCHIVAL2: 
 // console.log(args.join(' '))
                // pyshell.send(args.join(' '));
                // pyshell.on('message', function (message) {
                //     // received a message sent from the Python script (a simple "print" statement)
                //     console.log(message);
                // });

                // // end the input stream and allow the process to exit
                // pyshell.end(function (err, code, signal) {
                //     if (err) throw err;
                //     console.log('The exit code was: ' + code);
                //     console.log('The exit signal was: ' + signal);
                //     console.log('finished');
                //     console.log('finished');
                // });
                // scholar rate limited by google :(

// ARCHIVAL1:

 // // message.reply(`Not found on sci-hub!`)
                // // return
                // console.log("WOOO")
                // // PythonShell.run('./script.py', null, function (err, results) {
                // //     if (err) throw err;
                // //     console.log('finished');
                // //     console.log(results)
                // //     // console.log(results.)
                // // });
                // pyshell.send(args.join(' '))
                // console.log("sent....")
                // pyshell.on('message', function (msg) {
                //     // eprint = msg;
                //     console.log(msg)
                //     // console.log(message.indexOf("eprint"))
                //     // callback(msg)
                //     // if (msg.indexOf("eprint") != -1) {

                //     //     eprint = msg.substring(msg.indexOf('eprint'))
                //     //     // return eprint
                //     //     console.log(eprint)
                //     // }
                // });
                // // message.channel.send(eprint)
                // // console.log(eprint)

                // // eprint = runPy(args.join(' '))
                // // function runPy(data){
                // //     return new Promise((resolve, reject) => {
                // //       let result;
                // //       let pyshell = new PythonShell('script.py'); // , {mode: 'text', args: [date]}

                // //       pyshell.send(data);

                // //       pyshell.on('message', function (message) {
                // //         // result = JSON.parse(message);
                // //         result = message;
                // //       });

                // //       pyshell.on('stderr', function (stderr) {
                // //         console.log(stderr);
                // //       });

                // //       pyshell.end(function (err, code, signal) {
                // //         if (err) reject(err);
                // //         console.log('The exit code was: ' + code);
                // //         console.log('The exit signal was: ' + signal);
                // //         console.log('finished');
                // //         resolve(result);
                // //       });
                // //     });
                // //   }
