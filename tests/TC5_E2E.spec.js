import {test,expect} from '@playwright/test';

//E2E automation to login on app and purchase a product(zara coat)
test('@Webst Client App login', async ({ page }) => {
    //js file- Login js, DashboardPage
    const email = "Shivamsangwan2011@gmail.com";
    const productName = 'ZARA COAT 3';
    const products = page.locator(".card-body"); //return all products
    await page.goto("https://rahulshettyacademy.com/client");
    await page.locator("#userEmail").fill(email);
    await page.locator("#userPassword").fill("Aa1@Aa1@K");
    await page.locator("[value='Login']").click();
    await page.waitForLoadState('networkidle'); 
    await page.locator(".card-body b").first().waitFor(); //locating first product i.e. 'ZARA COAT 3' to make sure all elements are loaded(otherwise alltestxcontent() may return empty array)
    const titles = await page.locator(".card-body b").allTextContents(); //return all products names, ex: ZARA COAT 3, Adidas Originals
    console.log(titles); 
    const count = await products.count(); //count(): returns number of webelements identified by the given locator...ex: suppose here 'products' locator identified 8 elements so count() will return 8 
    for (let i = 0; i < count; i++) {
       const text =  await products.nth(i).locator("b").textContent();
       //page.locator('falana'): ye locator page ke ander webelement searc krega
       //products.nth(i).locator('falana'): ye locator 'products.nth(i)' locator ne jo section locate kiya h, uske andar search krega i.e. it acts like a sub locator(locator chaining)
       if (text === productName) {
          //add to cart
          await products.nth(i).locator("text= Add To Cart").click();  
          //click on 'add to cart' for 'zara coat 3' product only(as other add to cart buttons have become out of scope due to locator chaining)
          //Note: here we are locating element using 'inner text'
          break;
       }
    }
  
    await page.locator("[routerlink*='cart']").click(); //click on cart to see added items, css is used to locate cart button
    //await page.pause();
  
    //checking if our selected element is visible in cart page

    await page.locator("div li").first().waitFor(); //wait for cart page to be fully loaded(if one element is loaded then other elements should also be loaded)
    
    const bool = await page.locator("h3:has-text('ZARA COAT 3')").isVisible(); 
    //here we are locating element using 'inner text' but that text should be inside <h3> tag
    //isVisible(): check if elemnt is visible or not, returns boolean value

    expect(bool).toBe(true);
    await page.locator("text=Checkout").click();  //clicking on checkout button
  




    //Handling dynamic dropdown(dropdown options will start showing once we enter some partial text in inputbox)
    
    //locating input box and start typing partial text
    //.pressSequentially("ind", { delay: 150 }): this method type text one by one and give time to dropdown to get loaded
    //delay: ye batata h ki har ek key press ke baad kitne mili secs wait krna h(here: 150ms)
    //ager hum fill() use krte to text instantly fill ho jata..dropdown load nhi hota
    await page.locator("[placeholder*='Country']").pressSequentially("ind", { delay: 150 });

    //location and storing entire dropdown with all options
    const dropdown = page.locator(".ta-results"); //will work even if all options are yet to be loaded, bcoz base structure of dd is loaded
    await dropdown.waitFor(); //wait for dropdown options to fully loaded on ui

    //storing all dropdown options count 
    const optionsCount = await dropdown.locator("button").count();

    
    for (let i = 0; i < optionsCount; ++i) {
       const text = await dropdown.locator("button").nth(i).textContent(); //extracting text of each dd option per itration
       if (text === " India") {
          await dropdown.locator("button").nth(i).click(); //if option is india > click on it
          break;
       }
    }
  
    //locating an element and validating its text
    expect(page.locator(".user__name [type='text']").first()).toHaveText(email);

    await page.locator(".action__submit").click(); //click on place order
    await expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. "); //validate confirmation text after placing order
    const orderId = await page.locator(".em-spacer-1 .ng-star-inserted").textContent();
    console.log(orderId); 
  

    //navigating to our order from list of all orders > click on view to view our order details > check if our orderid mentioned there is correct

    await page.locator("button[routerlink*='myorders']").click(); //click on orders button
    await page.locator("tbody").waitFor(); //wait for table of all rows to get loaded (tbody is for table body)
    const rows = await page.locator("tbody tr"); //location all rows of given table
  
  
    for (let i = 0; i < await rows.count(); ++i) {
       const rowOrderId = await rows.nth(i).locator("th").textContent(); //inside row, 'th' tag containing orderId..so fetching that here
       if (orderId.includes(rowOrderId)) {       //=== ki jagah includes() use kiya...we can use any...includes(): sane as contains() of java
          await rows.nth(i).locator("button").first().click(); //clicking on first button of row i.e. 'view' button
          break;
       }
    }
    const orderIdDetails = await page.locator(".col-text").textContent(); //getting orderId from view order page
    expect(orderId.includes(orderIdDetails)).toBe(true);  //checking if our orderid mentioned there is correct


    //Note: whenever we route to a page after clicking on a button or something then..if method mentioned 
    //..in first line of code for that page does not have autowait capability..
    //..then we have to use waitfor() to wait till all elements of that page are loaded
    //ex: after clicking on 'view button' in line 92 we landed on view details page, but in first line of 
    //..code for that page i.e. line 96, there is textContent(), which have autowait capability > so no need for waitFor()
    //..but after clicking in line 84...we landed on orders page...first method: count() don't have autowait capability
    //...so we used waitFor()
 });