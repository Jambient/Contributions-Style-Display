import {resetAnimation, rows, cells, renderMessages, parseMessages, setStatus} from './script.js';

const startButton = document.getElementById('start');
const testButton = document.getElementById('test');
const content = document.getElementById('content');

const frameDelay = 150;
let gif = new GIF({
    workers: 1,
    quality: 10,
    delay: frameDelay,
    width: 740,
    height: 138,
    workerScript: 'gif.worker.js',
    transparent: 0x000000,
    debug: true
});

let recording = false;
let iframe = null;
let captureTimeout = null;
let totalFrames = 0;
let currentFrame = 0;

// Create an invisible iframe for recording
function createRecordingEnvironment() {
    try {
        // Remove any existing iframe
        if (iframe && iframe.parentNode) {
            document.body.removeChild(iframe);
        }
        
        // Create a new iframe with more reliable settings
        iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '750px';
        iframe.style.height = '150px';
        iframe.style.border = 'none';
        iframe.style.padding = '0';
        iframe.style.margin = '0';
        iframe.style.zIndex = '-1000'; // Hide it but keep it in the document flow
        iframe.style.opacity = '0.01'; // Nearly invisible but still rendered
        iframe.style.overflow = 'hidden';
        document.body.appendChild(iframe);
        
        return setupIframeContent();
    } catch (error) {
        console.error("Error creating recording environment:", error);
        if (window.setStatusWithStyle) {
            window.setStatusWithStyle("Error creating recording environment: " + error.message, "error");
        } else {
            setStatus("Error: Could not create recording environment");
        }
        return null;
    }
}

// Set up the iframe content in a separate function for better error handling
function setupIframeContent() {
    try {
        // Wait for iframe to be ready
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Copy the HTML structure with a more reliable method
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recording Frame</title>
                <style>
                    body {
                        background-color: #0d1117;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                </style>
            </head>
            <body></body>
            </html>
        `);
        iframeDoc.close();
        
        // Copy CSS variables from the main document
        const rootStyles = window.getComputedStyle(document.documentElement);
        let cssVars = '';
        for (let i = 0; i < rootStyles.length; i++) {
            const prop = rootStyles[i];
            if (prop.startsWith('--')) {
                cssVars += `${prop}: ${rootStyles.getPropertyValue(prop)};\n`;
            }
        }
        
        // Add CSS variables
        const varStyle = document.createElement('style');
        varStyle.textContent = `:root {\n${cssVars}}\n`;
        iframeDoc.head.appendChild(varStyle);
        
        // Copy all styles with a more robust approach
        const mainStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
        mainStyles.forEach(style => {
            const clone = style.cloneNode(true);
            iframeDoc.head.appendChild(clone);
        });
        
        // Create direct copy of the table content
        const contentClone = content.cloneNode(true);
        iframeDoc.body.appendChild(contentClone);
        
        // Force proper sizing and positioning
        contentClone.style.margin = '0';
        contentClone.style.padding = '4px 8px';
        contentClone.style.boxSizing = 'border-box';
        contentClone.style.position = 'relative';
        contentClone.style.top = '0';
        contentClone.style.left = '0';
        
        console.log("Recording iframe created and populated");
        return true;
    } catch (error) {
        console.error("Error setting up iframe content:", error);
        if (window.setStatusWithStyle) {
            window.setStatusWithStyle("Error setting up recording: " + error.message, "error");
        }
        return false;
    }
}

// Capture a frame from the iframe with better error handling
function captureFrame() {
    if (!recording || !iframe) {
        console.warn("Capture frame called but recording is false or iframe is null");
        return;
    }
    
    try {
        // Reference the iframe window and content
        const iframeWindow = iframe.contentWindow;
        const iframeContent = iframe.contentDocument.getElementById('content');
        
        if (!iframeContent) {
            console.error("Could not find content element in iframe");
            updateProgress(10); // Show some progress even if failing
            captureTimeout = setTimeout(captureFrame, frameDelay);
            return;
        }
        
        // Use html2canvas with more reliable settings
        html2canvas(iframeContent, {
            backgroundColor: '#0d1117',
            allowTaint: true,
            useCORS: true,
            logging: true,
            scale: 1,
            onclone: function(clonedDoc) {
                // Additional preparation of the cloned document if needed
                const clonedContent = clonedDoc.getElementById('content');
                if (clonedContent) {
                    clonedContent.style.backgroundColor = '#0d1117';
                }
            }
        }).then(canvas => {
            // Debug the canvas output
            console.log("Frame captured successfully, canvas size:", canvas.width, "x", canvas.height);
            
            // Add the frame to the GIF
            try {
                gif.addFrame(canvas, {copy: true, delay: frameDelay});
                
                // Update progress tracking
                currentFrame++;
                const progress = Math.min(90, (currentFrame / totalFrames) * 100);
                
                if (window.updateCaptureProgress) {
                    window.updateCaptureProgress(progress);
                }
                
                // Schedule next frame with fallback progress
                captureTimeout = setTimeout(captureFrame, frameDelay);
            } catch (gifError) {
                console.error("Error adding frame to GIF:", gifError);
                // Continue capturing even if there's an error with this frame
                captureTimeout = setTimeout(captureFrame, frameDelay);
            }
        }).catch(error => {
            console.error("Error capturing frame with html2canvas:", error);
            
            // Continue with the next frame even if this one failed
            currentFrame++;
            const progress = Math.min(90, (currentFrame / totalFrames) * 100);
            if (window.updateCaptureProgress) {
                window.updateCaptureProgress(progress);
            }
            
            captureTimeout = setTimeout(captureFrame, frameDelay);
        });
    } catch (error) {
        console.error("Critical error in captureFrame:", error);
        
        // Try to keep the progress going even on errors
        currentFrame++;
        if (window.updateCaptureProgress) {
            window.updateCaptureProgress(Math.min(50, (currentFrame / totalFrames) * 100));
        }
        
        captureTimeout = setTimeout(captureFrame, frameDelay);
    }
}

// Estimate the total number of frames
function estimateFrames(messages) {
    // Base animation time: 1 second delay before starting + 2 seconds between messages
    let totalTime = 1000 + (messages.length - 1) * 2000;
    
    // Add time for each message (conservatively)
    for (const message of messages) {
        // Rough estimate: 2 seconds per message minimum plus more for longer messages
        totalTime += 2000 + (message.length * 50);
    }
    
    // Convert time to frames (frameDelay = 150ms)
    return Math.ceil(totalTime / frameDelay);
}

// Simple way to run the animation in the iframe
function runAnimationInIframe(messages) {
    return new Promise((resolve, reject) => {
        try {
            if (!iframe || !iframe.contentWindow) {
                reject(new Error("Iframe not available"));
                return;
            }
            
            // Define animation completion callback
            iframe.contentWindow.animationComplete = function() {
                resolve();
            };
            
            // Create a script to run the animation in the iframe
            const script = iframe.contentDocument.createElement('script');
            script.type = 'module';
            script.textContent = `
                import characters from './characters.js';
                
                // Helper functions
                function get2DArray(rows, columns) {
                    return Array.from({ length: rows }, () => Array(columns).fill(0));
                }
                
                function getRandomNumber(min, max) {
                    return Math.floor((Math.random() * (max + 1 - min)) + min);
                }
                
                // Get all table cells
                const tableRows = document.querySelectorAll('tbody tr');
                const cells = get2DArray(7, 52);
                
                // Reference the data cells (skipping the first label cell in each row)
                for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
                    const dataCells = Array.from(tableRows[rowIndex].querySelectorAll('td')).slice(1); // Skip the label cell
                    for (let i = 0; i < dataCells.length; i++) {
                        cells[rowIndex][i] = dataCells[i];
                    }
                }
                
                async function RenderText(str) {
                    let grid = get2DArray(7, 200);
                    let currentColumn = 0;
                    let maxRow = 0;
                    for (const c of str) {
                        let letterData = characters[c];
                        if (!letterData) continue;

                        for (let y = 0; y < letterData.length; y++) {
                            for (let x = 0; x < letterData[0].length; x++) {
                                grid[y][currentColumn + x] = letterData[y][x];
                                maxRow = Math.max(maxRow, currentColumn + x);
                            }
                        }

                        currentColumn += letterData[0].length + 1;
                    }

                    let isScrolling = maxRow >= 51;
                    if (!isScrolling) {
                        // Remove the +1 that was causing the extra column
                        let gap = Math.floor((51 - maxRow) / 2);
                        for (let y = 0; y < grid.length; y++) {
                            grid[y] = Array(gap).fill(0).concat(grid[y].slice(0, -(gap)));
                        }
                    }

                    let revealTimes = get2DArray(7, 52);
                    for (let y = 0; y < 7; y++) {
                        for (let x = 0; x < 52; x++) {
                            revealTimes[y][x] = getRandomNumber(10, 15);
                        }
                    }

                    let allowedRow = 1;
                    document.body.classList.remove('scrolling');
                    
                    await new Promise((resolve) => {
                        let animationInterval = setInterval(function () {
                            let allZero = true;

                            for (let y = 0; y < Math.min(7, allowedRow); y++) {
                                const row = grid[y];
                                for (let x = 0; x < 52; x++) {
                                    if (cells[y] && cells[y][x]) {
                                        const cell = cells[y][x];
                                        let randomFill;

                                        if (revealTimes[y][x] > 0) {
                                            randomFill = getRandomNumber(0, 4);
                                            revealTimes[y][x] -= 1;
                                            allZero = false;
                                        } else {
                                            randomFill = row[x] === 1 ? getRandomNumber(3, 4) : getRandomNumber(0, 0);
                                        }

                                        cell.style.backgroundColor = "var(--fill-color-" + randomFill + ")";
                                    }
                                }
                            }

                            allowedRow += 1;

                            if (allZero) {
                                clearInterval(animationInterval);
                                resolve();
                            }
                        }, 100);
                    });

                    if (isScrolling) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        document.body.classList.add('scrolling');

                        // Remove the extra column shift in scrolling animation
                        await new Promise((resolve) => {
                            let scrollAmount = 0;
                            let scrollInterval = setInterval(function () {
                                for (let y = 0; y < 7; y++) {
                                    const row = grid[y];
                                    for (let x = 0; x < 52; x++) {
                                        if (cells[y] && cells[y][x]) {
                                            const cell = cells[y][x];
                                            // Remove the +1 that was causing the extra column
                                            let randomFill = row[scrollAmount + x] === 1 ? getRandomNumber(3, 4) : getRandomNumber(0, 0);
                                            cell.style.backgroundColor = "var(--fill-color-" + randomFill + ")";
                                        }
                                    }
                                }

                                scrollAmount += 1;

                                if (maxRow - scrollAmount < 51) {
                                    clearInterval(scrollInterval);
                                    resolve();
                                }
                            }, 100);
                        });
                    }
                }
                
                async function renderMessages() {
                    // Clear all data cells first (not the label cells)
                    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
                        for (let i = 0; i < cells[rowIndex].length; i++) {
                            if (cells[rowIndex][i]) {
                                cells[rowIndex][i].style.backgroundColor = "";
                            }
                        }
                    }
                    
                    const messages = ${JSON.stringify(messages)};
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    
                    for (const message of messages) {
                        await RenderText(message);
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                    }
                    
                    // Signal completion back to parent
                    window.animationComplete();
                }
                
                // Start the animation
                renderMessages();
            `;
            
            iframe.contentDocument.body.appendChild(script);
            
        } catch (error) {
            console.error("Error running animation in iframe:", error);
            reject(error);
        }
    });
}

startButton.addEventListener('click', async () => {
    try {
        // Disable buttons to prevent multiple recordings
        startButton.disabled = true;
        testButton.disabled = true;
        
        // Initialize progress
        if (window.updateCaptureProgress) {
            window.updateCaptureProgress(5);
        }
        
        // Get messages
        const messages = parseMessages();
        if (messages.length <= 1) {
            if (window.setStatusWithStyle) {
                window.setStatusWithStyle("Error: Please add at least one message", "error");
            } else {
                setStatus("Error: Please add at least one message");
            }
            startButton.disabled = false;
            testButton.disabled = false;
            return;
        }
        
        // Create the recording environment
        if (!createRecordingEnvironment()) {
            if (window.setStatusWithStyle) {
                window.setStatusWithStyle("Failed to create recording environment", "error");
            }
            startButton.disabled = false;
            testButton.disabled = false;
            return;
        }
        
        // Set progress to show we're starting
        if (window.setStatusWithStyle) {
            window.setStatusWithStyle("Recording in progress...", "processing");
        } else {
            setStatus("Recording in progress... 0%");
        }
        
        if (window.updateCaptureProgress) {
            window.updateCaptureProgress(10);
        }
        
        // Configure recording
        totalFrames = estimateFrames(messages) || 100; // Use fallback if estimation fails
        currentFrame = 0;
        recording = true;
        
        // Start both processes
        captureFrame();
        
        try {
            await runAnimationInIframe(messages);
            stopRecording();
        } catch (animationError) {
            console.error("Animation in iframe failed:", animationError);
            // Try to finish recording anyway
            if (recording) {
                setTimeout(() => stopRecording(), 2000);
            }
        }
    } catch (error) {
        console.error("Recording process failed:", error);
        
        if (window.setStatusWithStyle) {
            window.setStatusWithStyle("Error during recording: " + error.message, "error");
        } else {
            setStatus("Error during recording: " + error.message);
        }
        
        // Clean up
        recording = false;
        if (iframe && iframe.parentNode) {
            document.body.removeChild(iframe);
            iframe = null;
        }
        
        startButton.disabled = false;
        testButton.disabled = false;
    }
});

// Improve GIF rendering process
function stopRecording() {
    recording = false;
    clearTimeout(captureTimeout);
    
    if (window.setStatusWithStyle) {
        window.setStatusWithStyle("Rendering GIF... Please wait", "processing");
    } else {
        setStatus("Recording Finished... Rendering GIF. Please wait...");
    }
    
    // Clean up iframe
    if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
        iframe = null;
    }
    
    try {
        if (gif.frames.length === 0) {
            console.error("No frames were captured");
            if (window.setStatusWithStyle) {
                window.setStatusWithStyle("Error: No frames were captured", "error");
            } else {
                setStatus("Error: No frames were captured");
            }
            startButton.disabled = false;
            testButton.disabled = false;
            return;
        }
        
        // Handle GIF rendering progress
        gif.on('progress', function(p) {
            const renderProgress = 90 + (p * 10);
            if (window.updateProgress) {
                window.updateProgress(renderProgress);
            }
            setStatus(`Rendering GIF... ${Math.floor(p * 100)}%`);
        });
        
        // Handle GIF completion
        gif.on('finished', function(blob) {
            try {
                if (window.updateProgress) {
                    window.updateProgress(100);
                }
                
                if (window.setStatusWithStyle) {
                    window.setStatusWithStyle("Recording Complete! GIF Downloaded.", "success");
                } else {
                    setStatus("Recording Complete! GIF Downloaded.");
                }
                
                // Download the GIF
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'contribution-display.gif';
                document.body.appendChild(link);
                link.click();
                
                // Clean up download resources
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
                
            } catch (error) {
                console.error("Error in download process:", error);
                if (window.setStatusWithStyle) {
                    window.setStatusWithStyle("Error downloading GIF: " + error.message, "error");
                } else {
                    setStatus("Error downloading GIF: " + error.message);
                }
            }
        });
        
        // Render with a slight delay to ensure UI updates
        setTimeout(() => {
            console.log(`Rendering GIF with ${gif.frames.length} frames`);
            gif.render();
        }, 500);
        
    } catch (error) {
        console.error("Error in GIF rendering:", error);
        if (window.setStatusWithStyle) {
            window.setStatusWithStyle("Error rendering GIF: " + error.message, "error");
        } else {
            setStatus("Error rendering GIF: " + error.message);
        }
    }
    
    startButton.disabled = false;
    testButton.disabled = false;
}
