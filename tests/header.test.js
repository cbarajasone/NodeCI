
const Page = require('./helpers/Page');

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

test('Should check the header has the correct text', async () => {
    
    const brandText = await page.getElementContent('a.brand-logo');

    expect(brandText).toEqual('Blogster');

});

test('Should click login starts OAuth Flow', async() => {
    
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);

});

test('Should show logout button when signed in', async () => {

    await page.login();

    const LogoutBtnTxt = await page.getElementContent('a[href="/auth/logout"]');

    expect(LogoutBtnTxt).toEqual('Logout');

})

afterEach(async() => {
    await page.closeBrowser();
})