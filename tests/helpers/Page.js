const puppeteer = require('puppeteer');

const keys = require('../../config/keys');
const userFactory = require('../factories/user.factory');
const sessionFactory = require('../factories/session.factory');

const pptrConfig = {
    headless: keys.puppeteerHeadless,
    args: ['--no-sandbox']
}

class CustomPage {

    constructor(browser, page){
        this.browser = browser;
        this.page = page;
    }

    static async build() {
        const browser = await puppeteer.launch(pptrConfig);
        const page = await browser.newPage();

        const customPage = new CustomPage(browser, page);
        
        return new Proxy(customPage, {
            get: function(target, property) {
                return target[property] || 
                        page[property] || 
                        browser[property];
            }
        })
    }

    async login () {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);
    
        await this.page.setCookie({name: 'session', value: session})
        await this.page.setCookie({name: 'session.sig', value: sig})
    
        await this.page.goto('http://localhost:3000/blogs');
    
        await this.page.waitFor('a[href="/auth/logout"]');
    }
    
    async getElementContent(selector) {
        return await this.page.$eval(selector, el => el.innerHTML)

    }
    async closeBrowser () {
        await this.browser.close();
    }

    async get(path) {
        return await this.page.evaluate((_path) => {

            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());

        }, path)
    }

    async post(path, payload) {
        return await this.page.evaluate((_path, _payload) => {

            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_payload)
            }).then(res => res.json());

        }, path, payload)
    }

    async execRequests(actions) {
        return Promise.all(
            actions.map(({method, path, data}) => this[method](path, data))
        );
    }
}

module.exports = CustomPage;
