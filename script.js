// ===== YOUTUBE VIDEO API SCRIPT =====

// 1. This code loads the YouTube IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. This array will hold all the player objects
var players = [];

// 3. This function creates an <iframe> (and YT.Player)
//    after the API code downloads. It's called automatically.
function onYouTubeIframeAPIReady() {
    
    // Check if the player divs exist (so this only runs on the homepage)
    if (document.getElementById('player1')) {
        
        // Create Player 1
        players[0] = new YT.Player('player1', {
            height: '100%',
            width: '100%',
            videoId: 'r0c6vC1mw0Y', // Video ID for "How to File RTI"
            playerVars: { 'playsinline': 1 },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });

        // Create Player 2
        players[1] = new YT.Player('player2', {
            height: '100%',
            width: '100%',
            videoId: 'mkLBtwTN7Fc', // Video ID for "CPI"
            playerVars: { 'playsinline': 1 },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });

        // Create Player 3
        players[2] = new YT.Player('player3', {
            height: '100%',
            width: '100%',
            videoId: 'oW-4-UCnk1Y', // Video ID for "ADR Report"
            playerVars: { 'playsinline': 1 },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

// 4. The API will call this function when any video's state changes.
function onPlayerStateChange(event) {
    // Check if a video has started playing
    if (event.data == YT.PlayerState.PLAYING) {
        
        // Get the player that just started
        var currentPlayer = event.target;
        
        // Loop through all players
        for (var i = 0; i < players.length; i++) {
            // If this is NOT the player that just started
            if (players[i] != currentPlayer) {
                // And if it's currently playing, pause it.
                if (players[i].getPlayerState() == YT.PlayerState.PLAYING) {
                    players[i].pauseVideo();
                }
            }
        }
    }
}

// ===== END OF YOUTUBE SCRIPT =====


// ===== ALL OTHER SCRIPTS GO INSIDE THIS ONE DOMContentLoaded =====
document.addEventListener("DOMContentLoaded", function() {

    // --- Pledge Modal & Counter Logic ---
    const pledgeBtn = document.getElementById('pledge-btn');
    const pledgeSection = document.getElementById('pledge'); // Get the section
    const modal = document.getElementById('pledge-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const confirmPledgeBtn = document.getElementById('confirm-pledge-btn');
    const pledgeCounter = document.getElementById('pledge-counter');

    // Only run this code if the pledge button exists on the page
    if (pledgeBtn) {
        let count = parseInt(localStorage.getItem('pledgeCount') || 245801);
        let hasPledged = localStorage.getItem('hasPledged') === 'true';

        const formatCount = (num) => num.toLocaleString('en-IN');
        
        // --- NEW ANIMATION LOGIC ---
        // Set initial text to 0
        pledgeCounter.textContent = '0'; 
        let animationStarted = false;

        // The function that runs the animation
        const startCountAnimation = () => {
            if (animationStarted) return; // Prevent re-running
            animationStarted = true;
            
            const finalCount = count;
            const duration = 2000; // 2 seconds
            let startTime = null;

            function animationStep(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                
                // Calculate current number
                let currentNumber = Math.floor(progress / duration * finalCount);
                
                if (currentNumber >= finalCount) {
                    currentNumber = finalCount;
                    pledgeCounter.textContent = formatCount(currentNumber);
                } else {
                    pledgeCounter.textContent = formatCount(currentNumber);
                    requestAnimationFrame(animationStep);
                }
            }
            requestAnimationFrame(animationStep);
        };

        // Create an observer to start animation on scroll
        const observer = new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting) {
                startCountAnimation();
                obs.unobserve(pledgeSection); // Stop observing once it has run
            }
        }, { threshold: 0.5 }); // Start when 50% of the section is visible

        // Start observing the pledge section
        observer.observe(pledgeSection);
        // --- END OF NEW ANIMATION LOGIC ---


        if (hasPledged) {
            pledgeBtn.textContent = 'You Have Pledged!';
            pledgeBtn.disabled = true;
        }

        pledgeBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        confirmPledgeBtn.addEventListener('click', () => {
            if (hasPledged) return;
            count++;
            
            // Update the counter text immediately when clicked
            pledgeCounter.textContent = formatCount(count); 
            
            localStorage.setItem('pledgeCount', count);
            localStorage.setItem('hasPledged', 'true');
            hasPledged = true;
            pledgeBtn.textContent = 'Pledge Taken!';
            pledgeBtn.disabled = true;
            confirmPledgeBtn.textContent = 'Thank You!';
            confirmPledgeBtn.disabled = true;
            setTimeout(() => {
                modal.style.display = 'none';
            }, 1000);
        });
    } // End of pledge button check


    // --- Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            
            const href = this.getAttribute('href');
            const targetId = href.substring(href.indexOf('#')); 
            
            if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
                if (targetId.length > 1) { 
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    });


    // --- Contact Form Logic ---
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !subject || !message) {
                formStatus.textContent = 'Please fill out all fields.';
                formStatus.style.color = 'red';
                return;
            }

            console.log('Form Data Submitted:', { name, email, subject, message });
            formStatus.textContent = 'Thank you! Your message has been sent.';
            formStatus.style.color = 'var(--primary-green)';
            contactForm.querySelector('.submit-btn').disabled = true;
            contactForm.querySelector('.submit-btn').textContent = 'Sent!';
            contactForm.reset();
        });
    } // End of contact form check


    // --- Responsive Navbar (Hamburger Menu) Logic ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-link-item');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });

        const closeSidebar = () => {
            navLinks.classList.remove('active');
            hamburgerBtn.classList.remove('active');
        };

        navLinkItems.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    } // End of hamburger check


    // --- Dark Mode / Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
        }

        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    } // End of theme toggle check
    
    
    // --- Custom Video Player Logic ---
    if (document.querySelector('.video-card')) {
        const videoCards = document.querySelectorAll('.video-card');

        videoCards.forEach((card, index) => {
            const playButton = card.querySelector('.video-play-btn');
            const wrapper = card.querySelector('.video-embed-wrapper');
            
            if(playButton) { // Check if play button exists
                playButton.addEventListener('click', () => {
                    // Check if players array is ready
                    if (players[index]) { 
                        const currentPlayer = players[index];
                        wrapper.classList.add('video-is-playing');
                        currentPlayer.playVideo();
                    }
                });
            }
        });
    } // End of video card check

}); // End of DOMContentLoaded