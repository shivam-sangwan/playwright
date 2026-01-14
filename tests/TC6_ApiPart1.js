import {test,expect,request} from '@playwright/test';  //request module is required to work with apis in playwright

//E2E automation to login on app and purchase a product(zara coat)
//But login steps are skipped in Ui as it is handled by hittinh login APi


//storing login api payload in javascript object
const payload1 = {
   name: "falana",
   pwd: "abc"
};

//storing 'create order' api payload in javascript object
const payload2 = {
   orderId: "falana",
   productId: "abc"
};


//creating global variable
let tokn;
let orderId;


//executes once before exicuting all tests of this class
test.beforeAll( async ()=>
{
       //setting up apis...just like browser context in ui testing
       const apiContext = await request.newContext(); 

       //hitting login api with given info and storing respose
       const response = await apiContext.post("endpoint of login api", 
         {
            data: payload1
         })

        //verifying status code of response using assertion
         expect(response.status()).toBe(200); //response.status(): gives actual status code

      //storing response body and extraction token from it
      const responseBody = await response.json();  //returns response body in json form
      tokn = responseBody.token; //response ke token field ki value 'tokn' variable m store kra li



      //hitting 'create order' api with given info and storing respose
      const response2 = await apiContext.post("endpoint of create order api", 
         {
            data: payload2,
            headers:                     
            {
               'Authorization' : tokn,                  //tokn extracted from loginapi response is used as header in 'create order' api
               'Content-Type': "application/json"
            }
         })

         const responseBody2 = await response.json();   //storing response
         orderId = responseBody2.order[0];            //response ke order[0] field ki value 'orderId' variable m store kra li
      
})




//executes  before each test of this class
test.beforeEach( ()=>
    {
        
    })



    
test('@Webst Client App login', async ({ page }) => {

     //storing tokn in local storage, before browser gets loaded,to skip login from ui each time
      await page.addInitScript( value => {              //page.addInitScript(): code provided in this method runs brfore the page is loaded
         window.localStorage.setItem('token',value);    //setting key: 'token' and value in local storage of browser
       }, tokn);                                        //here 'tokn' is getting passed as value to 'token' key

      //before writting above code ask developer where to store token?...session storage or local storage
       
      await page.goto("https://rahulshettyacademy.com/client"); //after hitting this url user will be directly logged in using token



    //login steps skipped
    
    //create order steps skipped


    //navigating to our order from list of all orders > click on view to view our order details > check if our orderid mentioned there is correct
   //Note: suppose our test case is only to view the order details of our created order then we can skip the order creation..
   //..steps from ui and hit 'create order' api instead to directly get the 'orderId'


   //beforeAll m 'create order' hit krke orderId mili or 'orderId' variable m store kra li



    await page.locator("button[routerlink*='myorders']").click(); //click on orders button
    await page.locator("tbody").waitFor(); //wait for table of all rows to get loaded (tbody is for table body)
    const rows = await page.locator("tbody tr"); //location all rows of given table
  
  
    for (let i = 0; i < await rows.count(); ++i) {
       const rowOrderId = await rows.nth(i).locator("th").textContent(); //inside row, 'th' tag containing orderId..so fetching that here
       if (orderId.includes(rowOrderId)) {       //=== ki jagah includes() use kiya...we can use any...includes(): sane as contains() of java..here 'orderId' is provided by 'create Order' Api
          await rows.nth(i).locator("button").first().click(); //clicking on first button of row i.e. 'view' button
          break;
       }
    }
    const orderIdDetails = await page.locator(".col-text").textContent(); //getting orderId from view order page
    expect(orderId.includes(orderIdDetails)).toBe(true);  //checking if our orderid mentioned there is correct


    
 });