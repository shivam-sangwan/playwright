import com.axis.maximus.jenkins.library.*  // Importing Groovy classes from Jenkins Shared Library (src/) for reuse in pipeline...Note: Files inside the (vars/) folder are auto-loaded, so no explicit import is required.
def call(Map config = [:]) {               //to make this file as callable from main jenkinsfile..usually groovy file m hoti h ye line
  pipeline {
    agent {
      kubernetes {                    //once pipeline starts: Jenkins requests kubernates to create pod                                          
        yaml libraryResource('build-agent-node-v22-13-0-newdev.yaml') //pulling mentioned yaml file from resources folder of shared library to create pod...Pipeline steps run inside pod containers
        podRetention onFailure()      //If build FAILS → pod retained...If build SUCCESS → pod deleted
        activeDeadlineSeconds 18000   //If pod runs for more than 18000 secs → kubernates deletes it
      }
    }


    parameters {      //appear on the Jenkins job UI before triggering the build.
        choice(       //choice parameter hamesha dropdown ke form me UI par dikhta hai
            name: 'ENV',   //name of jenkins parameter
            choices: ['uat', 'dev', 'qa', 'sit', 'prodSandbox'],     //values it can take...will come as dropdown..dropdown m by default first value(uat) selected rhegi
            description: 'Select the environment to run tests against'  //reflect at jenkins ui between parameter name and its values
        )
        string(      //choice parameter hamesha 'text input' ke form me UI par dikhta hai
            name: 'TAGS',
            defaultValue: '@smoke',
            description: 'Enter test tags to run (e.g., @smoke, @regression, @critical, @api, @ui, @smoke @api, @smoke @ui, @critical @api, @critical @ui, all)'
        )
        string(
            name: 'WORKERS',
            defaultValue: '5',
            description: 'Enter number of parallel workers for test execution (e.g., 1, 2, 3, 4, 5, 6, 8, 10)'
        )
        string(
            name: 'BRANCH_NAME',
            defaultValue: 'master',
            description: 'Enter the Git branch name to run the pipeline'
        )
    }

    //defining environmnet variables...alternative of .env file of local
    environment {     //variables defined under environment can be used anywhere in this file..ye variables hi process.Env ke through pyawright.config m jate h
        TEST_ENV = "${params.ENV}"    //parameters se ENV ki value(ex: uat) utha kr TEST_ENV variable ko assign krna
        WORKERS = "${params.WORKERS}"
        HEADLESS = 'true'
        CI = 'true'
        NODE_OPTIONS = '--max-old-space-size=4096'  //Node.js ko 4GB RAM deta hai..to run heavy test suites
        NODE_TLS_REJECT_UNAUTHORIZED = '0'          //to disable SSL verification...0 ki jagah 1 hota to enable hoti
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'     //Playwright ko browser auto-download se rokta hai..Kyunki browser Manually Artifactory se aa raha hai..Internet dependency avoid karni hai


        BUILD_NUMBER = "${env.BUILD_NUMBER}"   //env.BUILD_NUMBER: jenkins ke inbuilt env variables m se ek h
        BUILD_URL = "${env.BUILD_URL}"         //env.BUILD_URL: jenkins ke inbuilt env variables m se ek h
        JOB_NAME = "${env.JOB_NAME}"
        
        PROJECT_NAME = 'CAAS CAP Automation'
        PROJECT_OWNER = 'Automation Team'
        
        // Artifactory: Central repository of an organization
        // All project dependencies (allure, dotenv, playwright, etc.) are fetched from Artifactory instead of directly from the internet
        // These dependencies are made available in Artifactory from internet by the DevOps team
        // Jenkins test reports, All builds of application are also stored in Artifactory
        // In short, Artifactory stores all application-related artifacts and dependencies in a centralized and controlled way
        
        
        ARTIFACTORY_CREDS = credentials('ARTIFACTORY_CREDENTIALS') //fetching credentials of artifactory from jenkins store using credentials() method of jenkins and storing them in ARTIFACTORY_CREDS variable...so that test jenkins artifactory se dependencies la paye and test reports ko artifactory pr store kra paye
        GIT_AUTH = credentials('GIT_USER')                         //similarly, fetching crdentials of bitbucket..so that jenkins bitbucket access krke wahan se code laakr job chala paye...ye credentials devops team bnati h for jenkins job only..these are different from our normal bitbucket credentials
        NPM_ARTIFACTORY_TOKEN = credentials("NPM_ARTIFACTORY_TOKEN")  //fetches a secret NPM authentication token from Jenkins store...this is needed to access 'private npm packages' from artifactory..
                                                                      //..iss 'npm package' main jars(dotenv,playwright,allure etc.) hoti h 
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))  //keep only 10 latest build in jenkins...discards old builds
        timeout(time: 60, unit: 'MINUTES')     //Agar pipeline 60 minutes se zyada run hogi → Jenkins automatically abort kar dega
        timestamps()    //add date and time in jenkins console logs, ex: [2026-01-17 12:15:20] npm install started
    }

    //Jenkins goes to Bitbucket, checks out the specified branch, and..
    //..brings the latest code into the pipeline workspace from that branch
    stages {
        stage('Checkout') {   //this name will reflect in pipeline as stage 1
            steps {
                script {
                    echo "Checking out branch: ${params.BRANCH_NAME}" //print this in jenkins console
                    checkout([                        
                        $class: 'GitSCM',
                        branches: [[name: "*/${params.BRANCH_NAME}"]],  //checking out to branch
                        userRemoteConfigs: [[
                            url: 'https://bitbucket.axisb.com/scm/caas/caas-cap-automation.git',
                            credentialsId: 'GIT_USER'      //logging in to above url using this credentials
                        ]]
                    ])
                }
            }
        }

        //This stage just prints key pipeline info (environment, branch, test tags, workers, build number)..
        //..to the Jenkins console logs for clarity and reference.
        stage('Environment Info') {
            steps {
                script {
                    echo """
                    CAAS CAP Automation Pipeline Started
                    =====================================
                    Environment: ${params.ENV}
                    Test Tags: ${params.TAGS}
                    Workers: ${params.WORKERS}
                    Branch: ${params.BRANCH_NAME}
                    Build: #${env.BUILD_NUMBER}
                    =====================================
                    """
                }
            }
        }
        
        //Installs project dependencies from Artifactory and installs Playwright browsers for headless test execution.
        stage('Setup Dependencies') {
            steps {
                script {
                    echo "Setting up npm configuration and installing dependencies..."
                    sh '''
                        npm config set registry https://artifactory.axisb.com/artifactory/api/npm/npm/  //From now on all npm packages will be fetched from Artifactory instead of internet
                        npm config set strict-ssl false                                                 //ignore SSL certificate validation while downloading npm dependencies
                        echo "_auth=${NPM_ARTIFACTORY_TOKEN}" >> ~/.npmrc  //echo normally prints to console, but with output redirection (>>), it writes the content into a file instead of the console...//Adding authentication token to npm’s config file (.npmrc) so that npm install can download 'npm packages' from Artifactory.
                        echo "always-auth=true" >> ~/.npmrc                
                        npm config fix                                     //Automatically fixes common issues in npm configuration (like invalid or deprecated settings)
                        npm cache clean --force
                        rm -rf node_modules package-lock.json
                        npm install --prefer-online --no-audit --no-fund   //npm install: installs all dependencies(allure,dotenv) listed in package.json from artifactory

                    '''
                    
                    echo "Setting up Playwright browsers..."
                    withCredentials([usernamePassword(credentialsId: 'ARTIFACTORY_CREDENTIALS', usernameVariable: 'ARTIFACTORY_USER', passwordVariable: 'ARTIFACTORY_PASS')]) {
                        sh '''
                            export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
                            mkdir -p $PLAYWRIGHT_BROWSERS_PATH
                            
                            # Download chromium from Artifactory only
                            curl -u ${ARTIFACTORY_USER}:${ARTIFACTORY_PASS} -k -L \
                                 https://artifactory.axisb.com:443/artifactory/docker/playwright_1.57.0/ms-playwright-chromium-1.57.0-linux.zip \
                                 -o /tmp/chromium.zip
                            
                            if [ -f /tmp/chromium.zip ] && [ -s /tmp/chromium.zip ]; then
                                unzip -o /tmp/chromium.zip -d $PLAYWRIGHT_BROWSERS_PATH/
                                find $PLAYWRIGHT_BROWSERS_PATH -name "chrome*" -type f -exec chmod +x {} + || true
                                echo "Chrome browser installed from Artifactory"
                            else
                                echo "Failed to download browser from Artifactory"
                                exit 1
                            fi
                            
                            # Ensure both chromium and chromium_headless_shell are available
                            if [ -d "$PLAYWRIGHT_BROWSERS_PATH" ]; then
                                # Find chromium installation
                                CHROMIUM_PATH=$(find $PLAYWRIGHT_BROWSERS_PATH -name "chrome" -type f | head -1)
                                if [ -n "$CHROMIUM_PATH" ]; then
                                    CHROMIUM_DIR=$(dirname "$CHROMIUM_PATH")
                                    CHROMIUM_VERSION=$(echo "$CHROMIUM_DIR" | grep -o 'chromium-[0-9]*' | head -1)
                                    
                                    if [ -n "$CHROMIUM_VERSION" ]; then
                                        # Create headless shell directory structure
                                        HEADLESS_DIR="$PLAYWRIGHT_BROWSERS_PATH/ms-playwright/chromium_headless_shell-${CHROMIUM_VERSION#chromium-}/chrome-headless-shell-linux64"
                                        mkdir -p "$HEADLESS_DIR"
                                        
                                        # Create symlink for headless shell
                                        ln -sf "$CHROMIUM_PATH" "$HEADLESS_DIR/chrome-headless-shell" || true
                                        echo "Created headless shell symlink"
                                    fi
                                fi
                            fi
                        '''
                    }
                }
            }
        }

        //Verifies that the test framework and required Playwright browsers are correctly installed and the CLI(command prompt) is working before running tests.
        stage('Verify Setup') {
            steps {
                script {
                    echo "Verifying framework setup..."
                    sh '''
                        # Check if verify-setup.js exists before running
                        if [ -f "verify-setup.js" ]; then
                            echo "Running framework verification..."
                            npm run verify || echo "Verify setup failed, continuing..."
                        else
                            echo "verify-setup.js not found, skipping verification"
                        fi
                        
                        # Verify browser installations
                        export PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright
                        echo "Checking browser installations..."
                        
                        if [ -d "$PLAYWRIGHT_BROWSERS_PATH" ]; then
                            echo "Browser cache directory found"
                            
                            # Check for chromium
                            if find $PLAYWRIGHT_BROWSERS_PATH -name "chrome" -type f | head -1 | grep -q chrome; then
                                echo "✅ Chromium browser found"
                            else
                                echo "❌ Chromium browser not found"
                            fi
                            
                            # Check for headless shell
                            if find $PLAYWRIGHT_BROWSERS_PATH -name "chrome-headless-shell" \( -type f -o -type l \) | head -1 | grep -q chrome-headless-shell; then
                                echo "✅ Chromium headless shell found"
                            else
                                echo "❌ Chromium headless shell not found"
                            fi
                            
                            # List available browsers
                            echo "Available browser files:"
                            find $PLAYWRIGHT_BROWSERS_PATH -name "chrome*" -type f | head -5
                        else
                            echo "❌ No browser cache directory found, tests may fail"
                        fi
                        
                        # Test Playwright CLI
                        echo "Testing Playwright CLI..."
                        npx playwright --version || echo "Playwright CLI not working"
                    '''
                }
            }
        }
        
        //Executes final test command, captures the exit status, marks the build UNSTABLE if any tests fail, and continues the pipeline for reporting
        stage('Run Tests') {
            steps {
                script {
                    def testCommand = buildTestCommand(params.TAGS, params.WORKERS, params.ENV)
                    
                    echo "Running tests with command: ${testCommand}"
                    
                    //running testCommand to run test cases
                    def exitCode = sh(script: testCommand, returnStatus: true) 
                    
                    //sh(): shell command run karta hai, aur failure par pipeline ko red fail kar deta hai, exit code return krta h
                    //..ager ek bhi test case fail > exit code become 0 > pipeline = red/fail
                    //but..if returnStatus: true → sh() sirf exit code return karta hai, pipeline ko auto-fail nahi karta

                    
                    env.TEST_EXIT_CODE = exitCode.toString() // Stores the test execution exit code as a string in a Jenkins environment variable so it can be used in later stages(ex: reporting)

                    
                    if (exitCode != 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Some tests failed, but continuing with reporting..."
                    } else {
                        echo "All tests passed successfully!"
                    }
                }
            }
        }

        stage('Generate Reports') {
            steps {
                script {
                    echo "Generating Playwright HTML reports..."
                    sh '''
                        if [ -d "playwright-report" ] && [ -f "playwright-report/index.html" ]; then
                            echo "Playwright HTML report found"
                        else
                            echo "Playwright HTML report not found, creating placeholder"
                            mkdir -p playwright-report
                            echo "<html><body><h1>No test results available</h1></body></html>" > playwright-report/index.html
                        fi
                    '''
                }
            }
        }

        stage('Allure Report') {
            steps {
                script {
                    echo "Installing Allure and generating report..."
                    sh '''
                        npm install -g allure-commandline
                        npx allure generate allure-results --clean -o allure-report
                    '''
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                script {
                    echo "Archiving test artifacts..."
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'allure-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: '*.json', allowEmptyArchive: true
                    archiveArtifacts artifacts: '*.xml', allowEmptyArchive: true
                }
            }
        }

        stage('Publish Reports') {
            steps {
                script {
                    echo "Publishing test reports..."
                    
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Report',
                        reportTitles: 'Test Results'
                    ])
                    
                    if (fileExists('results.xml')) {
                        junit testResults: 'results.xml', allowEmptyResults: true
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "Cleaning up workspace..."
                sh '''
                    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
                    find . -name ".playwright" -type d -exec rm -rf {} + 2>/dev/null || true
                '''
                
                def testResult = env.TEST_EXIT_CODE == '0' ? 'PASSED' : 'FAILED' 
                def buildStatus = currentBuild.result ?: 'SUCCESS'
                
                echo """
                Pipeline Completed
                ====================
                Environment: ${params.ENV}
                Test Tags: ${params.TAGS}
                Workers: ${params.WORKERS}
                Branch: ${params.BRANCH_NAME}
                Test Result: ${testResult}
                Build Status: ${buildStatus}
                Duration: ${currentBuild.durationString}
                
                Reports Available:
                - Playwright HTML: ${env.BUILD_URL}Playwright_HTML_Report/
                - Build Artifacts: ${env.BUILD_URL}artifact/
                ====================
                """
            }
        }
        success {
            script {
                echo "Pipeline completed successfully!"
            }
        }
        failure {
            script {
                echo "Pipeline failed!"
            }
        }
        unstable {
            script {
                echo "Pipeline completed with test failures!"
            }
        }
    }
}
}

// Helper function, Builds and returns the final command jise chalane pr test cases run honge
def buildTestCommand(tags, workers, env) {
    def baseCommand = "TEST_ENV=${env} WORKERS=${workers} NODE_TLS_REJECT_UNAUTHORIZED=0"  //NODE_TLS_REJECT_UNAUTHORIZED=0: Disables SSL certificate verification
    def testCommand = ""
    
    switch(tags) {
        case '@smoke':
            testCommand = "npm run test:smoke"
            break
        case '@regression':
            testCommand = "npm run test:regression"
            break
        case '@critical':
            testCommand = "npm run test:critical"
            break
        case '@api':
            testCommand = "npm run test:api"
            break
        case '@ui':
            testCommand = "npm run test:ui"
            break
        case '@smoke @api':
            testCommand = "npx playwright test --grep '@smoke.*@api|@api.*@smoke'"
            break
        case '@smoke @ui':
            testCommand = "npx playwright test --grep '@smoke.*@ui|@ui.*@smoke'"
            break
        case '@critical @api':
            testCommand = "npx playwright test --grep '@critical.*@api|@api.*@critical'"
            break
        case '@critical @ui':
            testCommand = "npx playwright test --grep '@critical.*@ui|@ui.*@critical'"
            break
        case 'all':
        default:
            testCommand = "npm test"
            break
    }
    
    return "${baseCommand} ${testCommand}"  //ex: final command for uat,5,smoke: TEST_ENV=uat WORKERS=5 NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:smoke
}

