import {test,expect} from '@playwright/test';


test.describe.configure({ mode: 'parallel' }); //now all the test of this file will run in || (by default test cases run in sequantional manner)..
//..but ager playwright config  'fully parellal: false' h tbhi ye line work kregi..
test.only('verify user login', async ({page})=>
{
    await page.goto('http://www.rahulshettyacademy.com/loginpagePractise/');

    //login with incorrect credentials

    //const,let: universal data types of all variables in playwright
    const usernsme = page.locator('#username');     //storing located element in variable
    const pwd = page.locator('#password');
    const sgnIn = page.locator('#signInBtn');
    await usernsme.fill("shivam");
    await pwd.fill("123");      //fill() similar to sendkeys()
    await sgnIn.click();

    //storing text of below located element in 'text' variable
    const text = await page.locator("[style*= 'block']").textContent();  //textContent() similar to gettext()
    
    //logging text
    console.log(text);

    //validating text
    expect(text).toBe('Incorrect username/password.');  //tobe() ke saath await not required
    console.log('validated text successfully');

    //validating text using another method
   //assertion used: await expect(locator).toContainText()  //toContainText() ke saath await required
    console.log('validated text successfully');
   //implementation of above assertion: 
   //await expect(page.locator("[style*= 'block']")).toContainText('Incorrect') //validates on partial text also
   



    //login with correct credentials
    await usernsme.fill("");  //clearing username inputbox
    await usernsme.fill("rahulshettyacademy");
    await pwd.fill("learning");
    await sgnIn.click();
    console.log('logged in successfully');

    //.card-title a: this css locates 4 elements
    const t1 = await page.locator('.card-title a').first().textContent(); //getting text of first element i.e. iphone
    const t2 = await page.locator('.card-title a').nth(1).textContent(); //getting text of 2nd element 
    console.log(t1);
    console.log(t2);
    
    const t3 = await page.locator('.card-title a').allTextContents(); //getting text of all elements located by this locator
    //Note: allTextContents() array of elements return krta h...to playwright wait nhi krta for..
    //..this function..bcoz pta ni hota ki kitne elements ke liye wait krna h..ager empty array bhi mila to print kr dega use hi
    //..isliye use 'await page.locator('.card-title a').first().textContent();' before this..taaki elements load ho jaye..nhi to ye empty array return kr dega

    console.log(t3);


    //if test runner file contains multiple browsers and we want to run our cases on chrome then use command:
    //npx playwright test --project=chromium...to run test cases...playwright ke config file m..
    //..project array m multiple browsers mentioned h..har browser ke 'use:' section m uski configrations h...
    //..is command se hum chrome browser choose kr rhe h..to test case chrome pr run honge with chrome configrations.
    //npx playwright show-report: command to see html report of test ececution


    //report issue
    //lsof -i :9323
    //kill -9 38794


    
    //integrating allure report with playwright:

    //npm install -D allure-playwright: Install Allure Playwright adapter
    //npm install -g allure-commandline: Install Allure Command Line (CLI)...or use: npx allure-commandline --version
    //mention this in playwright runner class: reporter: [
    //                                             ['allure-playwright'],
    //                                                    ],

    //run this command after execution to see allure report: allure serve allure-results..or: npx allure-commandline serve allure-results

}); 