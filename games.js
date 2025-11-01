// This runs all the game logic, but only on the pages where the games exist.
document.addEventListener("DOMContentLoaded", function() {

    // ===== GAME SECTION LOGIC =====
    
    // --- Shared Modal ---
    const gameModal = document.getElementById('game-modal');
    if (gameModal) { // Only run if a modal exists on this page
        const gameModalClose = document.getElementById('game-modal-close');
        const gameModalTitle = document.getElementById('game-modal-title');
        const gameModalText = document.getElementById('game-modal-text');
        let gameModalBtn = document.getElementById('game-modal-btn'); // Use let

        // --- Game Modal Controls ---
        function showGameModal(title, text, buttonText, buttonAction) {
            gameModalTitle.textContent = title;
            gameModalText.textContent = text;
            gameModalBtn.textContent = buttonText;
            gameModal.style.display = 'flex';
            
            // Remove old action and add new one
            const newBtn = gameModalBtn.cloneNode(true);
            gameModalBtn.parentNode.replaceChild(newBtn, gameModalBtn);
            newBtn.addEventListener('click', () => {
                gameModal.style.display = 'none';
                buttonAction();
            });
            
            gameModalBtn = newBtn; // Re-assign
        }
        gameModalClose.addEventListener('click', () => {
            gameModal.style.display = 'none';
        });

        
        // --- Game 1: File Catcher ---
        const gameArea = document.getElementById('catcher-game-area');
        if (gameArea) { // Check if this is the Catcher game page
            
            const player = document.getElementById('catcher-player');
            const scoreEl = document.getElementById('catcher-score');
            const timeEl = document.getElementById('catcher-time');
            const startBtn = document.getElementById('start-catcher-game');
            const instructions = document.querySelector('.catcher-instructions');

            let score = 0;
            let timeLeft = 30; 
            let gameActive = false;
            let gameInterval = null;
            let timerInterval = null;
            let itemSpeed = 3;

            // Move player with mouse
            gameArea.addEventListener('mousemove', (e) => {
                if (!gameActive) return;
                let gameRect = gameArea.getBoundingClientRect();
                let newLeft = e.clientX - gameRect.left - (player.offsetWidth / 2);
                
                if (newLeft < 0) newLeft = 0;
                if (newLeft > gameRect.width - player.offsetWidth) newLeft = gameRect.width - player.offsetWidth;
                
                player.style.left = newLeft + 'px';
            });

            // Start Game
            startBtn.addEventListener('click', () => {
                if (gameActive) return;
                gameActive = true;
                score = 0;
                timeLeft = 30; 
                itemSpeed = 3;
                scoreEl.textContent = score;
                timeEl.textContent = timeLeft;
                startBtn.disabled = true;
                instructions.style.display = 'none';

                gameInterval = setInterval(gameLoop, 16); // 60 FPS
                
                timerInterval = setInterval(() => {
                    timeLeft--;
                    timeEl.textContent = timeLeft;
                    
                    if (timeLeft == 20) itemSpeed = 4;
                    if (timeLeft == 10) itemSpeed = 5;

                    if (timeLeft <= 0) {
                        endGame();
                    }
                }, 1000);
            });

            // Game Loop
            function gameLoop() {
                if (Math.random() < 0.05) { 
                    createItem();
                }
                
                let items = document.querySelectorAll('.catcher-item');
                items.forEach(item => {
                    item.style.top = item.offsetTop + itemSpeed + 'px';
                    
                    if (checkCollision(player, item)) {
                        if (item.dataset.type === 'good') {
                            updateScore(10);
                        } else {
                            updateScore(-5);
                        }
                        item.remove();
                    }
                    
                    if (item.offsetTop > gameArea.offsetHeight) {
                        item.remove();
                    }
                });
            }

            // Create a new falling item
            function createItem() {
                const item = document.createElement('div');
                item.classList.add('catcher-item');
                
                const isGood = Math.random() > 0.4; 
                if (isGood) {
                    item.classList.add('item-good');
                    item.dataset.type = 'good';
                    item.innerHTML = '<i class="fa-solid fa-file-lines"></i>'; // RTI File
                } else {
                    item.classList.add('item-bad');
                    item.dataset.type = 'bad';
                    item.innerHTML = '<i class="fa-solid fa-hand-holding-dollar"></i>'; // Bribe
                }
                
                item.style.left = Math.random() * (gameArea.offsetWidth - 40) + 'px';
                gameArea.appendChild(item);
            }

            // Check for collision
            function checkCollision(player, item) {
                let playerRect = player.getBoundingClientRect();
                let itemRect = item.getBoundingClientRect();
                
                return !(
                    playerRect.right < itemRect.left || 
                    playerRect.left > itemRect.right || 
                    playerRect.bottom < itemRect.top || 
                    playerRect.top > itemRect.bottom
                );
            }

            // Update score
            function updateScore(points) {
                score += points;
                scoreEl.textContent = score;
            }

            // End Game
            function endGame() {
                gameActive = false;
                clearInterval(gameInterval);
                clearInterval(timerInterval);
                startBtn.disabled = false;
                instructions.style.display = 'block';
                
                document.querySelectorAll('.catcher-item').forEach(item => item.remove());
                
                showGameModal('Game Over!', `You saved the files and finished with a score of ${score}!`, 'Play Again', () => {
                    scoreEl.textContent = 0;
                    timeEl.textContent = 30; 
                });
            }
        } // End of File Catcher game check
        

        // --- Game 2: Stamp or Shred ---
        const stampDesk = document.getElementById('bribe-game-desk');
        if (stampDesk) { // Check if this is the Stamp or Shred game page
            
            // Get new UI elements
            const scoreEl = document.getElementById('stamp-score');
            const integrityEl = document.getElementById('stamp-integrity');
            const timeEl = document.getElementById('stamp-time');
            const startBtn = document.getElementById('start-stamp-game');
            const instructions = document.querySelector('.bribe-instructions');
            const fileArea = document.getElementById('bribe-file-area');
            const stampBtn = document.getElementById('stamp-stamp-btn');
            const shredBtn = document.getElementById('stamp-shred-btn');

            let efficiencyScore = 0;
            let integrityScore = 100;
            let timeLeft = 30;
            let gameActive = false;
            let timerInterval = null;
            let currentFile = null;

            // Define the 3 file types
            // Define the 12 file types
const fileTypes = [
    // --- 4 Valid Files (Stamp is correct) ---
    { type: 'valid', text: 'Valid Permit', icon: 'fa-solid fa-file-circle-check', correctAction: 'stamp' },
    { type: 'valid', text: 'Approved: Public Works', icon: 'fa-solid fa-trowel-bricks', correctAction: 'stamp' },
    { type: 'valid', text: 'License Renewal: OK', icon: 'fa-solid fa-id-card', correctAction: 'stamp' },
    { type: 'valid', text: 'Standard Invoice', icon: 'fa-solid fa-file-invoice-dollar', correctAction: 'stamp' },

    // --- 4 Invalid Files (Shred is correct) ---
    { type: 'invalid', text: 'Forged Permit', icon: 'fa-solid fa-file-circle-xmark', correctAction: 'shred' },
    { type: 'invalid', text: 'Expired Document', icon: 'fa-solid fa-calendar-times', correctAction: 'shred' },
    { type: 'invalid', text: 'Missing Signature', icon: 'fa-solid fa-file-pen', correctAction: 'shred' },
    { type: 'invalid', text: 'Data Mismatch', icon: 'fa-solid fa-right-left', correctAction: 'shred' },

    // --- 4 Bribe Files (Shred is honest, Stamp is corrupt) ---
    { type: 'bribe', text: 'Invalid Permit<br>(+ Bribe)', icon: 'fa-solid fa-hand-holding-dollar', correctAction: 'shred' },
    { type: 'bribe', text: '"RUSH" Request<br>(+ "Gift")', icon: 'fa-solid fa-gift', correctAction: 'shred' },
    { type: 'bribe', text: 'Just Stamp It<br>(+ Envelope)', icon: 'fa-solid fa-envelope', correctAction: 'shred' },
    { type: 'bribe', text: '"Forget" This File<br>(+ Cash)', icon: 'fa-solid fa-money-bill-wave', correctAction: 'shred' }
];

            function startGame() {
                if (gameActive) return;
                gameActive = true;
                efficiencyScore = 0;
                integrityScore = 100;
                timeLeft = 30;
                updateUI();
                startBtn.disabled = true;
                startBtn.textContent = "Game in Progress...";
                instructions.style.display = 'none';
                
                spawnFile();

                timerInterval = setInterval(() => {
                    timeLeft--;
                    updateUI();
                    if (timeLeft <= 0 || integrityScore <= 0) {
                        endGame();
                    }
                }, 1000);
            }

            function spawnFile() {
                if (!gameActive) return;
                
                currentFile = fileTypes[Math.floor(Math.random() * fileTypes.length)];
                
                fileArea.innerHTML = `<i class="${currentFile.icon}"></i><p>${currentFile.text}</p>`;
                fileArea.className = 'file-' + currentFile.type; 
                fileArea.style.display = 'flex';
                
                stampBtn.disabled = false;
                shredBtn.disabled = false;
            }

            function processFile(action) {
                if (!currentFile || !gameActive) return;

                stampBtn.disabled = true;
                shredBtn.disabled = true;

                let fileType = currentFile.type;
                
                if (action === 'stamp') {
                    if (fileType === 'valid') {
                        efficiencyScore += 100;
                    } else if (fileType === 'invalid') {
                        efficiencyScore -= 50;
                    } else if (fileType === 'bribe') {
                        efficiencyScore += 500;
                        integrityScore -= 30;
                    }
                } 
                else if (action === 'shred') {
                    if (fileType === 'valid') {
                        efficiencyScore -= 50;
                    } else if (fileType === 'invalid') {
                        efficiencyScore += 100;
                    } else if (fileType === 'bribe') {
                        integrityScore += 10;
                    }
                }
                
                if (integrityScore > 100) integrityScore = 100;
                if (integrityScore < 0) integrityScore = 0;
                
                updateUI();
                
                let feedbackColor = (action === 'stamp') ? 'var(--primary-green)' : '#E74C3C';
                stampDesk.style.borderColor = feedbackColor;
                
                setTimeout(() => {
                    fileArea.style.display = 'none';
                    stampDesk.style.borderColor = 'var(--dark-border)'; // Reset border
                    if (gameActive) {
                        spawnFile();
                    }
                }, 300); 
            }
            
            function updateUI() {
                scoreEl.textContent = efficiencyScore;
                integrityEl.textContent = integrityScore;
                timeEl.textContent = timeLeft;
            }

            function endGame() {
                gameActive = false;
                clearInterval(timerInterval);
                startBtn.disabled = false;
                startBtn.textContent = "Start Game";
                instructions.style.display = 'block';
                fileArea.style.display = 'none';
                stampBtn.disabled = true;
                shredBtn.disabled = true;
                
                let finalScore = Math.round(efficiencyScore * (integrityScore / 100));
                let endMessage = `Time's up! Efficiency: ${efficiencyScore}, Integrity: ${integrityScore}%. Final Score: ${finalScore}!`;
                
                if (integrityScore <= 0) {
                    endMessage = `GAME OVER! Your integrity hit 0%. You're fired!`;
                }

                showGameModal('Game Over!', endMessage, 'Play Again', () => {
                    scoreEl.textContent = 0;
                    integrityEl.textContent = 100;
                    timeEl.textContent = 30;
                });
            }

            startBtn.addEventListener('click', startGame);
            stampBtn.addEventListener('click', () => processFile('stamp'));
            shredBtn.addEventListener('click', () => processFile('shred'));
            
            stampBtn.disabled = true;
            shredBtn.disabled = true;
        }


        // --- Game 3: Accountability Quiz ---
        // --- Game 3: Accountability Quiz ---
        const quizContainer = document.getElementById('quiz-container');
        if (quizContainer) { // Check if this is the quiz page

            // --- THE 50 QUESTIONS BANK ---
            const allQuizQuestions = [
                // RTI Questions
                { q: "What does 'RTI' stand for?", a: ["Right to Information", "Right to Integrity", "Road Transport Initiative", "Refuse to Inform"] },
                { q: "What is the standard fee for an RTI application?", a: ["₹10", "₹100", "₹50", "It's free"] },
                { q: "A public authority must respond to an RTI within...?", a: ["30 days", "60 days", "1 week", "90 days"] },
                { q: "Who does the CVC (Central Vigilance Commission) investigate?", a: ["Central Govt. Officials", "All Indian Citizens", "State Govt. Officials", "Private Companies"] },
                { q: "What is the CVC's toll-free helpline for reporting corruption?", a: ["1964", "100", "1098", "1947"] },
                { q: "The 'Adarsh' scam was exposed primarily using what tool?", a: ["RTI Act", "Police Investigation", "Media Sting", "Lokpal"] },
                { q: "What does 'CPIO' stand for in the RTI Act?", a: ["Central Public Information Officer", "Chief Police Investigation Officer", "Central Political Integrity Office", "Corruption Prevention & Inquiry Office"] },
                { q: "The 'PIDPI' Resolution is for protecting...?", a: ["Whistleblowers", "Corrupt Officials", "Public Property", "Foreign Diplomats"] },
                { q: "Who was Satyendra Dubey?", a: ["An NHAI whistleblower who was murdered", "A former CVC Commissioner", "The creator of the RTI Act", "A famous anti-corruption lawyer"] },
                { q: "Who was Shanmugam Manjunath?", a: ["An IOC officer murdered for sealing a corrupt petrol pump", "The founder of the Lokpal movement", "A journalist who exposed the 2G scam", "The first person to file an RTI"] },
                { q: "The Lokpal investigates corruption at the...?", a: ["Central Level", "State Level", "Municipal Level", "District Level"] },
                { q: "The state-level equivalent of the Lokpal is the...?", a: ["Lokayukta", "Chief Minister", "Governor", "State Vigilance Commission"] },
                { q: "What is 'Transparency International' known for?", a: ["Publishing the Corruption Perceptions Index (CPI)", "Funding political campaigns", "Auditing private banks", "Arresting corrupt officials"] },
                { q: "A 'quid pro quo' bribe means...?", a: ["'Something for something'", "'For the public good'", "'In good faith'", "'Let the buyer beware'"] },
                { q: "What does ADR (Association for Democratic Reforms) primarily analyze?", a: ["Criminal & Financial records of election candidates", "Stock market fluctuations", "The national budget", "Police efficiency"] },
                { q: "A high score on the Corruption Perceptions Index (CPI) means a country is...?", a: ["Very clean", "Very corrupt", "Very poor", "Very populated"] },
                { q: "India's approximate rank in the 2023 CPI was...?", a: ["93rd", "1st", "180th", "25th"] },
                { q: "The Govt. e-Marketplace (GeM) portal was built to increase transparency in...?", a: ["Public Procurement (Govt. Buying)", "Election Voting", "Hiring Government Staff", "Judicial Cases"] },
                { q: "A public official asking for 'tea money' is an example of...?", a: ["A petty bribe", "A polite custom", "A standard service fee", "A legal donation"] },
                { q: "Can you file an RTI with a private company like Infosys or Tata?", a: ["No, only with public authorities", "Yes, with any company in India", "Yes, but only if they agree", "Only if the company is corrupt"] },
                { q: "What happens if a CPIO fails to reply to an RTI in 30 days?", a: ["The information is deemed refused", "The CPIO is immediately fired", "The CPIO is fined ₹25,000", "The information is automatically made public"] },
                { q: "The 'Vyapam' scam, exposed by an RTI, was related to...?", a: ["Admissions and recruitment exams", "Highway construction", "Coal block allocation", "Housing allotments"] },
                { q: "What is the final score of the 'Stamp or Shred' game?", a: ["Efficiency Score x Integrity %", "Efficiency Score only", "Integrity % only", "Efficiency + Integrity"] },
                { q: "Who appoints the Lokpal?", a: ["A selection committee (PM, CJI, etc.)", "The Supreme Court", "The People (Direct Election)", "The CVC"] },
                { q: "What is the CVC's 'Integrity Pledge'?", a: ["A commitment to be honest and not take bribes", "A pledge to become a whistleblower", "A loan application", "A password for the CVC portal"] },
                // ... (I'll add 25 more to reach 50)
                { q: "What is a 'Benami' transaction?", a: ["A transaction where property is in one person's name but paid for by another", "A legal business loan", "A term for a failed RTI", "A type of government tender"] },
                { q: "The 'Refuse the Bribe' (Whack-a-Mole) game penalizes you for hitting...?", a: ["Good deeds (e.g., filing a document)", "Bribes (money bags)", "All items", "Nothing, it's a speed test"] },
                { q: "The Whistle Blowers Protection Act, 2014, designates which body to receive complaints?", a: ["Central Vigilance Commission (CVC)", "Prime Minister's Office (PMO)", "Supreme Court", "Central Bureau of Investigation (CBI)"] },
                { q: "In the 'File Catcher' game, which item is 'bad' to catch?", a: ["A bribe (hand with money)", "An RTI file", "A folder", "All items"] },
                { q: "What is the website to check your election candidates' records?", a: ["myneta.info", "eci.gov.in", "pmo.gov.in", "cvc.gov.in"] },
                { q: "What is 'Social Audit'?", a: ["A process where citizens review official records for government projects", "A new social media platform", "An audit of a company's social media accounts", "A type of tax"] },
                { q: "According to ADR, what % of 2024 Lok Sabha MPs had declared criminal cases?", a: ["46%", "10%", "90%", "2%"] },
                { q: "The '2G Spectrum' scam was an example of corruption in...?", a: ["Allocation of public resources", "Hospital management", "Road building", "Voting"] },
                { q: "Can you ask for a 'sample' of a product in an RTI (e.g., road material)?", a: ["Yes, the Act allows for taking certified samples", "No, you can only ask for documents", "No, that is illegal", "Only if you pay for the full sample"] },
                { q: "If you 'STAMP' a Bribe in the 'Stamp or Shred' game, what happens?", a: ["Integrity goes down, Efficiency goes up", "Integrity goes up, Efficiency goes up", "Both go down", "Only Integrity goes down"] },
                { q: "The 'Coal Allocation' scam (Coalgate) was a case of...?", a: ["Arbitrary allocation of coal blocks to companies", "Miners stealing coal", "A coal train robbery", "A tax calculation error"] },
                { q: "What is the 'First Appeal' in an RTI case?", a: ["An appeal to a senior officer in the same department", "A lawsuit in the High Court", "A complaint to the CVC", "A new RTI application"] },
                { q: "Which of these is NOT a 'public authority' under the RTI Act?", a: ["A private family trust", "The Prime Minister's Office (PMO)", "A Municipal Corporation", "A public sector bank (like SBI)"] },
                { q: "What does the CVC's 'Vigilance Awareness Week' promote?", a: ["Public integrity and anti-corruption", "Neighborhood watch programs", "Financial investing", "Physical fitness"] },
                { q: "A 'Shell Company' is often used to...?", a: ["Launder black money", "Build seashells", "Design software", "Run a charity"] },
                { q: "What is the penalty a CPIO may face for wrongly denying information?", a: ["₹250 per day, up to ₹25,000", "Jail time", "Community service", "No penalty, just a warning"] },
                { q: "The 'Electoral Bonds' scheme was criticized for reducing transparency in...?", a: ["Political funding", "Judicial appointments", "Military spending", "Healthcare"] },
                { q: "Who can file an RTI?", a: ["Any citizen of India", "Only lawyers and journalists", "Only people above 21", "Only government employees"] },
                { q: "What is a 'Conflict of Interest'?", a: ["When a public official's personal interests clash with their official duties", "A disagreement between two CVC officers", "A legal term for a protest", "A bad RTI application"] },
                { q: "Which game on this site tests your speed in processing files?", a: ["Stamp or Shred", "Transparency Match", "File Catcher", "Accountability Quiz"] },
                { q: "The Prevention of Corruption Act (PCA) is the main law that punishes...?", a: ["Bribe-taking by public servants", "Tax evasion", "Jaywalking", "Private company fraud"] },
                { q: "If your RTI is rejected for 'national security', what is your next step?", a: ["File a First Appeal", "Pay a bribe", "Forget about it", "Protest outside the office"] },
                { q: "What is 'Nepotism'?", a: ["Favoritism shown to relatives and friends in jobs or appointments", "A belief in a single god", "A type of tax", "A political party"] },
                { q: "The 'Fodder Scam' in Bihar was related to...?", a: ["Embezzlement of funds for non-existent livestock feed", "Contaminated animal food", "A failed farm", "A tax on farmers"] },
                { q: "What is the goal of the 'Transparency Match' game?", a: ["To match pairs of corrupt practices", "To catch files", "To answer questions", "To 'shred' bribes"] }
            ].map(item => ({ question: item.q, answers: item.a.map(ans => ({ text: ans, correct: ans === item.a[0] })) }));
            // Note: The first answer (index 0) is always the correct one. We'll shuffle them.

            // --- Game State Variables ---
            let currentGameQuestions = [];
            let currentQuestionIndex = 0;
            let userScore = 0;
            let userAnswers = [];
            let isAnswered = false; // To prevent double-clicks

            // --- UI Elements ---
            const quizGameView = document.getElementById('quiz-game-view');
            const quizResultsView = document.getElementById('quiz-results-view');
            const quizQuestionEl = document.getElementById('quiz-question');
            const quizAnswersEl = document.getElementById('quiz-answers');
            const quizProgressText = document.getElementById('quiz-progress-text');
            const quizProgressFill = document.getElementById('quiz-progress-fill');
            const quizFinalScoreEl = document.getElementById('quiz-final-score-text');
            const quizResultsSummaryEl = document.getElementById('quiz-results-summary');
            const restartQuizBtn = document.getElementById('restart-quiz-btn');

            // --- Game Functions ---

            // Function to shuffle an array (Fisher-Yates)
            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            function startQuiz() {
                currentQuestionIndex = 0;
                userScore = 0;
                userAnswers = [];
                isAnswered = false;

                // Randomly select 5 questions from the bank
                currentGameQuestions = shuffleArray([...allQuizQuestions]).slice(0, 5);
                
                // Shuffle the answers for each selected question
                currentGameQuestions.forEach(q => {
                    q.answers = shuffleArray([...q.answers]);
                });

                quizResultsView.style.display = 'none';
                quizGameView.style.display = 'block';
                showQuestion();
            }

            function showQuestion() {
                resetQuizState();
                let question = currentGameQuestions[currentQuestionIndex];
                quizQuestionEl.textContent = question.question;
                
                // Update progress
                quizProgressText.textContent = `Question ${currentQuestionIndex + 1} of 5`;
                quizProgressFill.style.width = `${((currentQuestionIndex + 1) / 5) * 100}%`;

                question.answers.forEach(answer => {
                    const button = document.createElement('button');
                    button.textContent = answer.text;
                    button.classList.add('quiz-answer-btn');
                    if (answer.correct) {
                        button.dataset.correct = true;
                    }
                    button.addEventListener('click', selectQuizAnswer);
                    quizAnswersEl.appendChild(button);
                });
            }

            function resetQuizState() {
                isAnswered = false;
                while (quizAnswersEl.firstChild) {
                    quizAnswersEl.removeChild(quizAnswersEl.firstChild);
                }
            }

            function selectQuizAnswer(e) {
                if (isAnswered) return; // Prevent clicking again
                isAnswered = true;

                const selectedBtn = e.target;
                const isCorrect = selectedBtn.dataset.correct === 'true';
                let correctText = '';

                // Highlight correct/incorrect and disable all buttons
                Array.from(quizAnswersEl.children).forEach(button => {
                    if (button.dataset.correct === 'true') {
                        button.classList.add('correct');
                        correctText = button.textContent; // Get text of correct answer
                    } else {
                        button.classList.add('incorrect');
                    }
                    button.disabled = true;
                });
                
                // Mark the selected button
                if (isCorrect) {
                    selectedBtn.classList.add('correct');
                    userScore++;
                } else {
                    selectedBtn.classList.add('incorrect');
                }

                // Store result for summary
                userAnswers.push({
                    question: currentGameQuestions[currentQuestionIndex].question,
                    selected: selectedBtn.textContent,
                    correct: correctText,
                    isCorrect: isCorrect
                });

                // Wait 1.5 seconds, then go to next question or end game
                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < 5) {
                        showQuestion();
                    } else {
                        showResults();
                    }
                }, 1500);
            }

            function showResults() {
                quizGameView.style.display = 'none';
                quizResultsView.style.display = 'block';

                quizFinalScoreEl.textContent = `${userScore}`;
                quizResultsSummaryEl.innerHTML = ''; // Clear previous results

                userAnswers.forEach((answer, index) => {
                    const resultEl = document.createElement('div');
                    resultEl.classList.add('result-item');
                    
                    if (answer.isCorrect) {
                        resultEl.classList.add('correct');
                        resultEl.innerHTML = `
                            <p><i class="fa-solid fa-check"></i> Q ${index + 1}: ${answer.question}</p>
                            <span>Your answer: ${answer.selected}</span>
                        `;
                    } else {
                        resultEl.classList.add('incorrect');
                        resultEl.innerHTML = `
                            <p><i class="fa-solid fa-times"></i> Q ${index + 1}: ${answer.question}</p>
                            <span>Your answer: ${answer.selected}</span><br>
                            <span>Correct answer: ${answer.correct}</span>
                        `;
                    }
                    quizResultsSummaryEl.appendChild(resultEl);
                });
            }
            
            restartQuizBtn.addEventListener('click', startQuiz);
            startQuiz(); // Start quiz on load
        }
    } // End of modal check
}); // End of DOMContentLoaded// End of DOMContentLoaded