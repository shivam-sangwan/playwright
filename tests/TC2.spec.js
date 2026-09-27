import {test,expect} from '@playwright/test';

test('@Regression verify dynamc waits' , async ({page})=>    //title m @Regression tagging di h...taaki future m ager hum chahe to bus @Regression tagging ke test case chala ske
    {
         await page.goto('http://www.rahulshettyacademy.com/client/');
         await page.locator('#userEmail').fill('Shivamsangwan2011@gmail.com');
         await page.locator('#userPassword').fill('Aa1@Aa1@K');
         await page.locator('[type="submit"]').click();
         
         await page.waitForLoadState('networkidle'); 
         const text = await page.locator('.card_body b').first()
         except(text).toBe('ZARA COAT 3');
         const text2 =  await page.locator('.card_body b').allTextContents();
         console.log(text2);


        //if test runner file contains multiple browsers and we want to run our cases on chrome then use command:
        //npx playwright test --project=chromium...to run test cases...playwright ke config file m..
        //..project array m multiple browsers mentioned h..har browser ke 'use:' section m uski configrations h...
        //..is command se hum chrome browser choose kr rhe h..to test case chrome pr run honge with chrome configrations.
         
         
    }
);
