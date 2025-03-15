import characters from './characters.js';

// UI Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Message List Management
    const messageList = document.getElementById('messageList');
    const newMessageInput = document.getElementById('newMessage');
    const addMessageBtn = document.getElementById('addMessage');
    const hiddenTextarea = document.getElementById('messagesText');
    const statusContainer = document.querySelector('.status-container');
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    let messages = [];
    
    // Initialize with default messages if textarea has content
    if (hiddenTextarea.value.trim()) {
        const initialMessages = hiddenTextarea.value.split('\n')
            .filter(msg => msg.trim() !== '')
            .map(msg => msg.trim());
        
        messages = initialMessages;
        renderMessageList();
    } else {
        // Add default messages
        messages = ["MAKE SURE TO STAR AND FAVOURITE", "THANKS :)"];
        renderMessageList();
        updateHiddenTextarea();
    }
    
    // Set initial status
    setStatusWithStyle('Ready to display messages', 'idle');
    
    function renderMessageList() {
        // Clear the message list
        messageList.innerHTML = '';
        
        if (messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'message-empty';
            emptyMessage.textContent = 'No messages yet. Add your first message below.';
            messageList.appendChild(emptyMessage);
            return;
        }
        
        // Add each message to the list
        messages.forEach((message, index) => {
            const messageItem = document.createElement('div');
            messageItem.className = 'message-item';
            messageItem.setAttribute('data-index', index);
            messageItem.draggable = true;
            
            // Message order and text
            const messageOrder = document.createElement('div');
            messageOrder.className = 'message-order';
            
            const messageNumber = document.createElement('div');
            messageNumber.className = 'message-number';
            messageNumber.textContent = index + 1;
            
            const messageText = document.createElement('div');
            messageText.className = 'message-text';
            messageText.textContent = message;
            
            messageOrder.appendChild(messageNumber);
            messageOrder.appendChild(messageText);
            
            // Message controls
            const messageControls = document.createElement('div');
            messageControls.className = 'message-controls';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit message';
            editBtn.addEventListener('click', () => {
                editMessage(index);
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete message';
            deleteBtn.addEventListener('click', () => {
                deleteMessage(index);
            });
            
            // Move up button
            if (index > 0) {
                const moveUpBtn = document.createElement('button');
                moveUpBtn.className = 'move-up-btn';
                moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
                moveUpBtn.title = 'Move up';
                moveUpBtn.addEventListener('click', () => {
                    moveMessage(index, index - 1);
                });
                messageControls.appendChild(moveUpBtn);
            }
            
            // Move down button
            if (index < messages.length - 1) {
                const moveDownBtn = document.createElement('button');
                moveDownBtn.className = 'move-down-btn';
                moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
                moveDownBtn.title = 'Move down';
                moveDownBtn.addEventListener('click', () => {
                    moveMessage(index, index + 1);
                });
                messageControls.appendChild(moveDownBtn);
            }
            
            messageControls.appendChild(editBtn);
            messageControls.appendChild(deleteBtn);
            
            messageItem.appendChild(messageOrder);
            messageItem.appendChild(messageControls);
            
            // Drag and drop functionality
            messageItem.addEventListener('dragstart', handleDragStart);
            messageItem.addEventListener('dragover', handleDragOver);
            messageItem.addEventListener('dragleave', handleDragLeave);
            messageItem.addEventListener('drop', handleDrop);
            messageItem.addEventListener('dragend', handleDragEnd);
            
            messageList.appendChild(messageItem);
        });
    }
    
    // Drag and drop handlers
    let draggedItem = null;
    
    function handleDragStart(e) {
        draggedItem = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }
    
    function handleDragLeave() {
        this.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedItem !== this) {
            const fromIndex = parseInt(draggedItem.getAttribute('data-index'));
            const toIndex = parseInt(this.getAttribute('data-index'));
            moveMessage(fromIndex, toIndex);
        }
    }
    
    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItem = null;
    }
    
    function addMessage(message) {
        if (!message.trim()) return;
        
        messages.push(message.trim().toUpperCase());
        renderMessageList();
        updateHiddenTextarea();
        newMessageInput.value = '';
        newMessageInput.focus();
        
        setStatusWithStyle(`Added message: "${message.trim()}"`, 'success');
    }
    
    function editMessage(index) {
        const message = messages[index];
        const newMessage = prompt('Edit message:', message);
        
        if (newMessage !== null && newMessage.trim() !== '') {
            messages[index] = newMessage.trim().toUpperCase();
            renderMessageList();
            updateHiddenTextarea();
            setStatusWithStyle(`Updated message #${index + 1}`, 'info');
        }
    }
    
    function deleteMessage(index) {
        if (confirm('Are you sure you want to delete this message?')) {
            const deletedMessage = messages[index];
            messages.splice(index, 1);
            renderMessageList();
            updateHiddenTextarea();
            setStatusWithStyle(`Deleted message: "${deletedMessage}"`, 'warning');
        }
    }
    
    function moveMessage(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const message = messages[fromIndex];
        messages.splice(fromIndex, 1);
        messages.splice(toIndex, 0, message);
        renderMessageList();
        updateHiddenTextarea();
        
        const direction = fromIndex > toIndex ? 'up' : 'down';
        setStatusWithStyle(`Moved message #${fromIndex + 1} ${direction}`, 'info');
    }
    
    function updateHiddenTextarea() {
        hiddenTextarea.value = messages.join('\n');
    }
    
    // Event listeners for message management
    addMessageBtn.addEventListener('click', () => {
        addMessage(newMessageInput.value);
    });
    
    newMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMessage(newMessageInput.value);
        }
    });
    
    // Enhanced status message system
    function setStatusWithStyle(message, type = 'info') {
        // Remove all status classes
        statusContainer.className = 'status-container';
        // Add the specific status class
        statusContainer.classList.add(type);
        // Update the message
        setStatus(message);
        
        // Hide progress bar unless we're processing
        if (type !== 'processing') {
            progressBar.style.width = '0%';
            progressLabel.textContent = '0%';
        }
        
        // Log for debugging
        console.log(`Status updated [${type}]: ${message}`);
    }
    
    // Export the status functions to the window for use by capture.js
    window.setStatusWithStyle = setStatusWithStyle;
    window.updateProgress = updateProgress;
    
    // Progress bar functionality
    function updateProgress(percent) {
        percent = Math.min(100, Math.max(0, percent)); // Ensure between 0-100
        progressBar.style.width = `${percent}%`;
        progressLabel.textContent = `${Math.round(percent)}%`;
        progressLabel.setAttribute('data-progress', `Progress: ${Math.round(percent)}%`);
        
        // Update milestone states
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(milestone => {
            const position = parseFloat(milestone.style.left);
            if (percent >= position) {
                milestone.classList.add('reached');
            } else {
                milestone.classList.remove('reached');
            }
        });
        
        // Update stages
        const stages = document.querySelectorAll('.stage');
        stages.forEach(stage => {
            stage.classList.remove('active');
        });
        
        if (percent < 33) {
            document.querySelector('[data-stage="prepare"]').classList.add('active');
        } else if (percent < 66) {
            document.querySelector('[data-stage="prepare"]').classList.add('active');
            document.querySelector('[data-stage="process"]').classList.add('active');
        } else if (percent <= 100) {
            document.querySelector('[data-stage="prepare"]').classList.add('active');
            document.querySelector('[data-stage="process"]').classList.add('active');
            document.querySelector('[data-stage="complete"]').classList.add('active');
        }
        
        // Add some subtle animation when reaching milestones
        if (percent === 25 || percent === 50 || percent === 75 || percent === 100) {
            addPulseEffect();
        }
    }
    
    // Add pulse effect for progress bar
    function addPulseEffect() {
        progressBar.classList.add('pulse');
        setTimeout(() => {
            progressBar.classList.remove('pulse');
        }, 700);
    }
    
    // Initialize progress bar interaction
    const progressContainer = document.querySelector('.progress-container');
    progressContainer.addEventListener('mousemove', (e) => {
        if (!statusContainer.classList.contains('processing')) {
            const rect = progressContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
            
            // Show hover position without actually updating progress
            const hoverProgress = document.createElement('div');
            hoverProgress.className = 'hover-progress';
            hoverProgress.style.width = `${percent}%`;
            hoverProgress.style.opacity = '0.3';
            
            // Remove any existing hover progress
            const existingHover = progressContainer.querySelector('.hover-progress');
            if (existingHover) {
                progressContainer.removeChild(existingHover);
            }
            
            // Insert before the actual progress bar
            progressContainer.insertBefore(hoverProgress, progressBar);
            
            // Clean up hover effect
            progressContainer.addEventListener('mouseleave', () => {
                if (hoverProgress.parentNode === progressContainer) {
                    progressContainer.removeChild(hoverProgress);
                }
            }, { once: true });
        }
    });
    
    // Update the RenderText function to show progress
    window.updateRenderProgress = function(current, total) {
        const percent = Math.min(100, Math.max(0, (current / total) * 100));
        updateProgress(percent);
        
        // Add pulse animation on significant milestones
        if (percent >= 25 && percent < 26) addPulseEffect();
        if (percent >= 50 && percent < 51) addPulseEffect();
        if (percent >= 75 && percent < 76) addPulseEffect();
        if (percent >= 99 && percent <= 100) addPulseEffect();
    };
    
    // Initialize tooltips
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.setAttribute('title', button.textContent.trim());
    });
    
    // Event listeners for buttons
    const startButton = document.getElementById('start');
    startButton.addEventListener('click', () => {
        setStatusWithStyle('Recording started... Preparing to capture display', 'processing');
        updateProgress(5); // Start with some initial progress
        
        // Create a progress update function that can be called from capture.js
        window.updateCaptureProgress = function(percent) {
            updateProgress(percent);
        };
    });
    
    const testButton = document.getElementById('test');
    testButton.addEventListener('click', () => {
        if (messages.length === 0) {
            setStatusWithStyle('Please add at least one message before testing', 'error');
            return;
        }
        
        setStatusWithStyle(`Starting test with ${messages.length} messages...`, 'processing');
        updateProgress(10); // Initial progress
    });
});

// Original script functionality
let body = document.querySelector('body');
let tableBody = document.querySelector('tbody');
let rows = tableBody.querySelectorAll('tr');

let intervalId;
let totalSteps = 0;
let currentStep = 0;

function parseMessages() {
    const messagesTextArea = document.getElementById('messagesText');

    messagesTextArea.value = messagesTextArea.value.toUpperCase();
    let messages = messagesTextArea.value.split('\n').filter(message => message.trim() !== '');
    messages.push(' ');
    return messages;
}

function setStatus(message) {
    document.getElementById('status').innerText = "Status: " + message;
}

function get2DArray(rows, columns) {
    return Array.from({ length: rows }, () => Array(columns).fill(0));
}

function getRandomNumber(min, max) {
    return Math.floor((Math.random() * (max + 1 - min)) + min);
}

let cells = get2DArray(7, 52);
for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    for (let i = 0; i < 52; i++) {
        let cell = document.createElement('td');
        cell.classList.add('cell');
        rows[rowIndex].appendChild(cell);
        cells[rowIndex][i] = cell;
    }
}

async function RenderText(str) {
    let grid = get2DArray(7, 200);
    let currentColumn = 0;
    let maxRow = 0;
    for (const c of str) {
        let letterData = characters[c];

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
        let gap = Math.floor((51 - maxRow) / 2);
        for (let y = 0; y < grid.length; y++) {
            grid[y] = Array(gap).fill(0).concat(grid[y].slice(0, -gap));
        }
    }

    // Update total steps for progress calculation
    totalSteps = 7 * 52; // Initial fill
    if (isScrolling) {
        totalSteps += maxRow - 51; // Add scrolling steps
    }
    currentStep = 0;
    
    // Set status to processing
    const statusContainer = document.querySelector('.status-container');
    statusContainer.className = 'status-container processing';
    setStatus(`Displaying: "${str}"`);

    let revealTimes = get2DArray(7, 52);
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 52; x++) {
            revealTimes[y][x] = getRandomNumber(10, 15);
        }
    }

    let allowedRow = 1;
    body.classList.remove('scrolling');
    await new Promise((resolve) => {
        intervalId = setInterval(function () {
            let allZero = true;

            for (let y = 0; y < Math.min(7, allowedRow); y++) {
                const row = grid[y];
                for (let x = 0; x < 52; x++) {
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
                    
                    // Update progress
                    currentStep++;
                    if (typeof window.updateRenderProgress === 'function' && currentStep % 10 === 0) {
                        const progress = Math.min(95, (currentStep / totalSteps) * 100);
                        window.updateRenderProgress(currentStep, totalSteps);
                    }
                }
            }

            allowedRow += 1;

            if (allZero) {
                clearInterval(intervalId);
                resolve();
            }
        }, 100);
    });

    if (isScrolling) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        body.classList.add('scrolling');

        await new Promise((resolve) => {
            let scrollAmount = 1;
            intervalId = setInterval(function () {
                for (let y = 0; y < 7; y++) {
                    const row = grid[y];
                    for (let x = 0; x < 52; x++) {
                        const cell = cells[y][x];
                        let randomFill = row[scrollAmount + x] === 1 ? getRandomNumber(3, 4) : getRandomNumber(0, 0);
                        cell.style.backgroundColor = "var(--fill-color-" + randomFill + ")";
                    }
                }

                scrollAmount += 1;
                currentStep += 7; // 7 rows updated
                
                // Update progress during scrolling
                if (typeof window.updateRenderProgress === 'function') {
                    const progress = Math.min(95, (currentStep / totalSteps) * 100);
                    window.updateRenderProgress(currentStep, totalSteps);
                }

                if (maxRow - scrollAmount < 51) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 100);
        });
    }
    
    // Complete progress at 100%
    if (typeof window.updateRenderProgress === 'function') {
        window.updateRenderProgress(100, 100);
    }
}

async function renderMessages(messages) {
    const statusContainer = document.querySelector('.status-container');
    statusContainer.className = 'status-container processing';
    setStatus(`Starting to display ${messages.length} messages`);
    window.updateRenderProgress(5, 100);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    let msgIndex = 0;
    for (const message of messages) {
        msgIndex++;
        const progress = Math.min(90, (msgIndex / messages.length) * 100);
        window.updateRenderProgress(progress, 100);
        
        await RenderText(message);
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    
    // Complete progress and update status
    window.updateRenderProgress(100, 100);
    statusContainer.className = 'status-container success';
    setStatus(`Completed displaying all ${messages.length} messages`);
}

export function resetAnimation() {
    clearInterval(intervalId);
    body.classList.remove('scrolling');
}

const testButton = document.getElementById('test');
const startRecording = document.getElementById('start');

testButton.addEventListener('click', async () => {
    resetAnimation();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (let i = 0; i < 52; i++) {
            cells[rowIndex][i].style.backgroundColor = "";
        }
    }

    const msgs = parseMessages();
    if (msgs.length <= 1) { // Remember we add a space automatically
        const statusContainer = document.querySelector('.status-container');
        statusContainer.className = 'status-container error';
        setStatus("Error: Please add at least one message");
        return;
    }
    
    setStatus(`Running test with ${msgs.length-1} messages`);
    const statusContainer = document.querySelector('.status-container');
    statusContainer.className = 'status-container processing';
    
    startRecording.disabled = true;
    testButton.disabled = true;
    
    window.updateRenderProgress(10, 100);
    await renderMessages(msgs);
    
    startRecording.disabled = false;
    testButton.disabled = false;
    window.updateRenderProgress(100, 100);
    
    // Final status update
    statusContainer.className = 'status-container success';
    setStatus(`Test completed successfully! All ${msgs.length-1} messages displayed.`);
});

export { rows, cells, renderMessages, parseMessages, setStatus};
