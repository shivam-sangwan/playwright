import {test,expect} from '@playwright/test';

test('@Regression verify dynamc waits' , async ({page})=>    //title m @Regression tagging di h...taaki future m ager hum chahe to bus @Regression tagging ke test case chala ske
    {
         await page.goto('http://www.rahulshettyacademy.com/client/');
         await page.locator('#userEmail').fill('Shivamsangwan2011@gmail.com');
         await page.locator('#userPassword').fill('Aa1@Aa1@K');
         await page.locator('[type="submit"]').click();
         
         await page.waitForLoadState('networkidle'); 
         //signIn button click ke baad sare api calls hokar...
         //..page load hone tk wait krega

         //ager upar wait nhi lgate to allTextContents() empty array de deta..same reason ki wajah se waitFor() wali line bhi use ki h

         //another way to wait for an element:
         //await page.locator('.card_body b').waitFor();  //this will wait till located element is fully loaded
         //waitfor() only works with locators which returns only single element..
         //..so updating above wait: 
        
         const text = await page.locator('.card_body b').first().waitFor();
         except(text).toBe('ZARA COAT 3');
         const text2 =  await page.locator('.card_body b').allTextContents();
         console.log(text2);
         


         //npx playwright test: runs all classes in tests folder
         //npx playwright test --grep @Regression: runs only those test cases from all classes jinke title m @Regression ho
         //npx playwright test /tests/TC2.spec.js: runs specified file(TC2.spec.js) of tests folder
         //npx playwright test /tests/TC2.spec.js --debug: open specified file in debug mode i.e. open 'playwright inspector window'
         
         //in playwright inspector we can see logs for every step
         //in playwright inspector we can also get readymade locator to locate an element:
         //open playwright inspector > click on 'pick locator' icon > click on desired element > 
         // > come back to inspector > locator will be autopopulated in a search window

         //npx playwright codegen http:/google.com: this will open google along with 'playwright instructor'
         //..and whatever actions we now perform on google..their script will automatically be generated 
         //..from instructor..we can copy paste this script and create a new test case..this is called 'Record and Playback'
    }
);