import {test,expect} from '@playwright/test';

test('child windows' , async ({browser})=>  //we used 'browser' fixture instead of 'page' fixture as we have to work on multiple pages/tabs
    {
        //switching pages
        const context = await browser.newContext();  
        const page = await context.newPage(); //page1...opening a tab is browser
        await page.goto('http://www.rahulshettyacademy.com/loginpagePractise/');

        // //waitforEvent(): waits for a event to get triggred and get completed..in this case 'wait for page to get loaded'
        // const page2 = context.waitForEvent('page'); 
        // //clicking on below link will trigger one event to open another page..waitforevent() will store thatt page 
        // await page.locator(".blinkingText").first().click();

        //await: waits for a step to get completed before moving to another step
        //these steps are called: 'promise'
        //3 stages of promise: promise pending(step is in progress), promise fulfilled(step completed), promise rejected(step failed)


        //so line 11 m await nhi lga skte..await ka matlab ki step complete kre bina aage mt bdho
        // but line 11 wala step, line 13 wala step complete hone ke baad hi complete hoga
        //line 13 ko line 11 ke phle bhi use nhi kr skte..bcoz line ye line event trigger ke degi or waitforevent() ko pta nhi chalega
        //solution: use promise.all(): javascript function..runs multiple steps together/parellely and wait till all these actions are completed

        //so, revised code for line 11 and 13
        const [page2] = await Promise.all(
            [
                context.waitForEvent('page'),  //ye jo return kr rha tha wo ab line 26 m return hoga
                //ager promise.all() array 4 cheeze return krta to wo charo line 26 m [] m return hoti
                page.locator(".blinkingText").first().click(),
            ]
        )

        //now locating text of anchor tag element from redirected page:
        //'p.im-para.red strong > a' : css to locate anchor tag element
       const text = await page2.locator("p.im-para.red strong > a").textContent();
       console.log(text); //print: mentor@rahulshettyacademy.com

       const array = text.split('@'); //splitting text into 2 parts from '@' and storing in array
       const text2 = array[1]; //storing 2nd element of array i.e: rahulshettyacademy.com
       console.log(text2);

       //now login in using the above located id: mentor@rahulshettyacademy.com(part of anchor tag text)
       page.locator('#userEmail').fill(text2);
       
       //or use this method for login
       const pages = context.pages(); //storing all created pages in an array
       await pages[0].locator('#userEmail').fill(text2); //perent page is pages[0]...child page = pages[1]
       

       //now lets try to print the value entered in inputBox
       console.log(page.locator('#userEmail').textContent());  //it will return blank as value enterd in inputbox was initially not part of dom

       //solution to above
       console.log(page.locator('#userEmail').inputValue()); //inputValue(): function used to read value entered in inputbox
    }
)
 