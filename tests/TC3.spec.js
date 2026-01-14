import {test,expect} from '@playwright/test';

test('verify ui actions' , async ({page})=>
    {
         await page.goto('http://www.rahulshettyacademy.com/loginpagePractise/');

         //dealing with static dropdown
         //selecting one value from dropdown
         const dropDown = await page.locator('select.form-control'); //loacting dropdown...css: tagname.class
         await dropDown.selectOption('consult'); //seleting consult option from dropdown using value of 'value' attribute..similar to selectbyValue()

         // Get all option elements from the dropdown and storing in array
         const options = await dropDown.locator('.form-control option').all();


         //radio btn 
         const radio = await page.locator('span.checkmark').nth(1);
         await radio.click();  //selecting 2nd radio button
         await page.locator('#okayBtn').click();
         await expect(radio).toBeChecked();  //assertion to check if given radio button is selected
         
         //checkboxes
         const checkBox = await page.locator('#terms');
         await checkBox.click();  //selecting checkBox
         await expect(checkBox).toBeChecked();  //assertion to check if given checkBox is selected

         await checkBox.uncheck();  // deselecting checkBox...checkbox check ho ya uncheck...ye uncheck hi krega
         //await checkBox.click();...ye sirf checked checkbox ko uncheck krega
         await expect(checkBox).not.toBeChecked(); //assertion to check if given checkBox is not selected
         //not: assertion ko ulta krta h
         
         //await page.pause(); //pauses execution and opens 'playwright inspector window'(helpful in debugging)

        //validating blinking fileds
        //the fields which belongs to 'blinkingText' class are blinking fields
        await expect(page.locator(".blinkingText").first()).toHaveAttribute('class','blinkingText');
        //toHaveAttribute(): check if located element have given value(blinkingText) in given attribute(class)
    }
)
