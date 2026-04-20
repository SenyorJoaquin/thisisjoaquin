document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       GATEKEEPER PUZZLE LOGIC
       ========================================= */
    const puzzleBoard = document.getElementById('puzzle-board');
    const surrenderZone = document.getElementById('surrender-zone');
    const giveUpBtn = document.getElementById('give-up-btn');
    const overlay = document.getElementById('gatekeeper-overlay');
    
    // Check if the user already bypassed the puzzle this session
    if (sessionStorage.getItem('portfolioUnlocked') === 'true') {
        // Remove the puzzle entirely from the DOM flow to avoid layout issues
        if (overlay) {
            overlay.style.display = 'none';
        }
        document.body.classList.remove('locked');
        
        // Trigger scroll animations for returning users
        setTimeout(() => window.dispatchEvent(new Event('scroll')), 100);
    } 
    else {
        // Initialize the torture device for new users
        let tiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
        let hasClickedOnce = false;

        // Simulate random valid moves to ensure the puzzle is actually solvable
        function shuffleTiles() {
            let emptyIdx = 8;
            for(let i = 0; i < 150; i++) {
                const validMoves = getValidMoves(emptyIdx);
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                tiles[emptyIdx] = tiles[randomMove];
                tiles[randomMove] = null;
                emptyIdx = randomMove;
            }
        }

        // Determine which adjacent tiles can slide into the empty space
        function getValidMoves(emptyIdx) {
            const moves = [];
            const row = Math.floor(emptyIdx / 3);
            const col = emptyIdx % 3;
            if (row > 0) moves.push(emptyIdx - 3); // Top neighbor
            if (row < 2) moves.push(emptyIdx + 3); // Bottom neighbor
            if (col > 0) moves.push(emptyIdx - 1); // Left neighbor
            if (col < 2) moves.push(emptyIdx + 1); // Right neighbor
            return moves;
        }

        // Draw the grid
        function renderPuzzle() {
            if (!puzzleBoard) return;
            puzzleBoard.innerHTML = '';
            tiles.forEach((number, index) => {
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                if (number === null) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = number;
                    tile.addEventListener('click', () => moveTile(index));
                }
                puzzleBoard.appendChild(tile);
            });
        }

        // Handle tile clicks
        function moveTile(index) {
            const emptyIdx = tiles.indexOf(null);
            const validMoves = getValidMoves(emptyIdx);
            
            if (validMoves.includes(index)) {
                // Swap the clicked tile with the empty space
                tiles[emptyIdx] = tiles[index];
                tiles[index] = null;
                renderPuzzle();
                
                // Show the taunt and the giant "give up" button after they realize how annoying this is
                if (!hasClickedOnce && surrenderZone) {
                    hasClickedOnce = true;
                    surrenderZone.classList.remove('hidden');
                }

                checkWin();
            }
        }

        // Check if the array is perfectly ordered 1-8 with null at the end
        function checkWin() {
            const winState = [1, 2, 3, 4, 5, 6, 7, 8, null];
            if (JSON.stringify(tiles) === JSON.stringify(winState)) {
                unlockWebsite();
            }
        }

        // The function that grants access to the actual portfolio
        function unlockWebsite() {
            // Set the session memory so it doesn't bother them again
            sessionStorage.setItem('portfolioUnlocked', 'true');
            
            if(overlay) {
                overlay.classList.add('hidden');
            }
            document.body.classList.remove('locked'); 
            
            // Wait for fade out, then trigger scroll animations and clean up DOM
            setTimeout(() => {
                window.dispatchEvent(new Event('scroll'));
                if(overlay) {
                    overlay.style.display = 'none'; 
                }
            }, 800); 
        }

        if (giveUpBtn) {
            giveUpBtn.addEventListener('click', unlockWebsite);
        }

        shuffleTiles();
        renderPuzzle();
    }


    /* =========================================
       SCROLL ANIMATIONS & UI OBSERVERS
       ========================================= */
       
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // Dynamic Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});