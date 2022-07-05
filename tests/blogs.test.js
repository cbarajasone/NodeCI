const Page = require('./helpers/Page');

let page;

beforeEach(async() => {
    page = await Page.build();
    
    await page.goto('http://localhost:3000');
});

describe('When logged in', async () => {
    beforeEach(async() => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Should see blog create form', async() => {
        const url = await page.url();
    
        const TitleFormTxt = await page.getElementContent('.title label');
        const ContentFormTxt = await page.getElementContent('.content label');
    
        expect(TitleFormTxt).toEqual('Blog Title');
        expect(ContentFormTxt).toEqual('Content');
    });

    describe('And using valid inputs', async() => {
        
        const blog = {
            title: 'Blog Title Automated',
            content: 'Content Automated',
        }
        beforeEach(async() => {
            await page.type('.title input', blog.title);
            await page.type('.content input', blog.content);

            await page.click('form button');

        });

        test('Submitting takes user to review screen', async () => {
            const TitleSubmit = await page.getElementContent('h5');

            expect(TitleSubmit).toEqual('Please confirm your entries');
        });

        test('Submitting then adds blog to index page', async () => {
            await page.click('button.green');

            await page.waitFor('.card');

            const cardTitle = await page.getElementContent('.card .card-title');
            const cardContent = await page.getElementContent('.card p');

            expect(cardTitle).toEqual(blog.title);
            expect(cardContent).toEqual(blog.content);
        });

    })
    describe('And using invalid inputs', async () => {

        beforeEach(async() => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const errorTitle = await page.getElementContent('.title .red-text');
            const errorContent = await page.getElementContent('.content .red-text');

            expect(errorTitle).toEqual('You must provide a value');
            expect(errorContent).toEqual('You must provide a value');
        })
    })
})

describe('When users is not logged in', async () => {

    const blog = {
        title: 'My Direct Type',
        content: 'My Direct Content',
    };

    const actions = [
        { method: 'get', path: '/api/blogs/'},
        { method: 'post', path: '/api/blogs/', data: blog},
    ]
    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);

        for (let result of results) {
            expect(result).toEqual({error: 'You must log in!'})
        }
    });

    /* 
    test('user cannot create blog posts', async () => {
        
        const blog = {
            title: 'My Direct Type',
            content: 'My Direct Content',
        };

        const result = await page.post('/api/blogs/', blog);

        expect(result).toEqual({error: 'You must log in!'})

    });
    test('user cannot obtain blog posts', async () => {
        
        const result = await page.get('/api/blogs/');

        expect(result).toEqual({error: 'You must log in!'})

    })
    */
}); 

afterEach(async() => {
    page.closeBrowser();
});


