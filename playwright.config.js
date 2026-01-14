// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { on } from 'events';

/**
 * Read environment variables from .env file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });



/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: 40000,
  expect: {
    timeout: 10000
  },
  retries: 1,   //failed test case will run one more time
  


  //Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  //Retry on CI only
  //retries: process.env.CI ? 2 : 0,
  //Opt out of parallel tests on CI. 
  //workers: process.env.CI ? 1 : undefined,


  //Run tests in files in parallel
  workers: 3, //means 3 test classes will run paralally(tests inside each class will run sequantionly)
  //if workers is not mentioned then at max 8 test classes of framwork runs parally by default in local(tests inside each class will run sequantionly))
  //but fullyParallel should be false..nhi to classes ki jagah methotds ||ly run honge

  fullyParallel: true, //now all the test cases of all the classes will run parallely...classes kitni h doesn't matter


  //it will generate both allure and html report after execution
  //Note: html report excution ke baad hmesha auto open ho jaati h..isliye 'auto open: never' kiya..
  //..now we can manually open allure/html report whichever we want
  reporter: [
    ['allure-playwright'],          // Allure reporter
    ['html', { open: 'never' }]    // HTML reporter with option
  ],
  
  



  //Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    //Base URL to use in actions like `await page.goto('')`:
    baseURL: 'http://localhost:3000',

   
    trace: 'on',        //for each step we can see: before and after screenshots,logs,network calls in report
   //trace: 'retain-on-failure'   //traces sirf failed test cases ke steps ke liye dikhenge
    headless: false,
    video: 'on',
    //video: 'retain-on-failure', //attach video of execution in report for failed test cases
    screenshot : 'on',  //takes screenshot of every test
    //screenshot: 'only-on-failure'    ////takes screenshot of every failure

    //viewport: sets the dimension in which browser will open...if not given default will be picked
    viewport : {width:720,height:720},
    ignoreHttpsErrors:true,   //to handle ssl certifactes issue on sites which need ssl certificate
    //permissions: ['Geolocation']  //to tackle 'google wants to know your location pop ups' i.e to give permission;
  },

  //Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
              ...devices['Desktop Chrome'] //here '...devices' is used, and device is 'desktop chrome'...so dimentions will be auto set to default dimension of a chrome desktop(no need to use viewport)
           },

    }, 

    //Note: ager firefox wala code bhi uncomment hoga to sare test cases firefox pr bhi run honge or chrome pr bhi

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },  
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }, //safari will autp open in dimensions of 'iphone 12' (no need to use viewport)
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

