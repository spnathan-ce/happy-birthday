/* ===== CONFIG ===== */

// Add your carousel photo filenames here (place files in /)
const CAROUSEL_PHOTOS = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg',
    '6.jpg',
    '7.jpg',
    '8.jpg',
    '9.jpg',
    '10.jpg',
];

// Mystery door game config — update the location text as needed
const GIFT_ROUNDS = [
    {
        giftNum: 1,
        correctDoor: null, // randomized at runtime
        revealEmoji: '🎁',
        revealTitle: 'Gift #1 Found!',
        // UPDATE THIS: where you hid the Melodica
        revealText: 'Ganesh Room Loft la paaru! ♫⋆｡♪ ₊˚♬ ﾟ.',
    },
    {
        giftNum: 2,
        correctDoor: null,
        revealEmoji: '🎁',
        revealTitle: 'Gift #2 Found!',
        // UPDATE THIS: where you hid the Vegetable Cutter
        revealText: 'Laundry bag la nalla thedu!!!!!! 🥕🥦🍅🥬🌽',
    },
    {
        giftNum: 3,
        correctDoor: null,
        revealEmoji: '💝',
        revealTitle: 'Gift #3 — A Very Special One...',
        revealText: 'This gift is right here. Tap "Next" to see it.',
    },
];

const WRONG_MESSAGES = [
    "Nope! Not this one 😄",
    "Try again! 🙈",
    "Oops, empty! Keep going!",
    "Almost... but not quite! 😜",
    "This door says 'Not me!' 🚪",
    "Haha, nice try! Pick another!",
    "The gift escaped this door! 😂",
    "Nada! You're getting warmer though 🔥",
    "So close... maybe next door? 🤔",
    "This one's shy, try another! 🙊",
];

/* ===== DOM REFS ===== */
const screens = {
    permission: document.getElementById('screen-permission'),
    birthday: document.getElementById('screen-birthday'),
    game: document.getElementById('screen-game'),
    grandma: document.getElementById('screen-grandma'),
    note: document.getElementById('screen-note'),
};

const bgMusic = document.getElementById('bg-music');
const grandmaMusic = document.getElementById('grandma-music');
const heartsContainer = document.getElementById('hearts-container');

/* ===== STATE ===== */
let currentRound = 0;
let isShuffling = false;
let carouselIndex = 0;

/* ===== FLOATING HEARTS ===== */
function spawnHeart() {
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    const hearts = ['💕', '💖', '💗', '❤️', '💓', '🩷', '✨', '💛'];
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (16 + Math.random() * 20) + 'px';
    heart.style.animationDuration = (6 + Math.random() * 8) + 's';
    heart.style.animationDelay = Math.random() * 2 + 's';
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 16000);
}

setInterval(spawnHeart, 800);

/* ===== CONFETTI ===== */
function launchConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#ff6b9d', '#ffd700', '#c44dff', '#ff4081', '#ffab40', '#69f0ae', '#40c4ff'];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = (6 + Math.random() * 8) + 'px';
        piece.style.height = (6 + Math.random() * 8) + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = (2 + Math.random() * 3) + 's';
        piece.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(piece);
        setTimeout(() => piece.remove(), 6000);
    }
}

/* ===== SPARKLE ON TAP ===== */
function sparkleAt(x, y) {
    const emojis = ['✨', '💖', '🌟', '💫', '⭐'];
    for (let i = 0; i < 5; i++) {
        const s = document.createElement('div');
        s.classList.add('sparkle');
        s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        s.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
        s.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
}

document.addEventListener('click', (e) => sparkleAt(e.clientX, e.clientY));

/* ===== SCREEN TRANSITIONS ===== */
function goToScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    // Scroll to top of the new screen
    screens[name].scrollTop = 0;
}

/* ===== SCREEN 1: START ===== */
document.getElementById('btn-start').addEventListener('click', () => {
    // User tap = user gesture — this unlocks audio on all browsers (iOS Safari, Chrome, etc.)
    bgMusic.volume = 0.5;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            // Fallback: try again on next user interaction
            document.addEventListener('click', function retryPlay() {
                bgMusic.play().catch(() => {});
                document.removeEventListener('click', retryPlay);
            }, { once: true });
        });
    }
    goToScreen('birthday');
    launchConfetti();
    setTimeout(launchConfetti, 2000);
    initCarousel();
});

/* ===== SCREEN 2: CAROUSEL (auto-play only, no manual controls) ===== */
const SLIDE_DURATION = 11000; // 7 seconds per photo

function initCarousel() {
    const carousel = document.getElementById('carousel');
    const counter = document.getElementById('carousel-counter');
    const progressBar = document.getElementById('carousel-progress-bar');
    carousel.innerHTML = '';

    CAROUSEL_PHOTOS.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Memory ${i + 1}`;
        img.loading = i < 3 ? 'eager' : 'lazy';
        slide.appendChild(img);
        carousel.appendChild(slide);
    });

    carouselIndex = 0;
    updateCarousel();
    autoAdvanceCarousel();
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const counter = document.getElementById('carousel-counter');
    const progressBar = document.getElementById('carousel-progress-bar');

    carousel.style.transform = `translateX(-${carouselIndex * 100}%)`;
    counter.textContent = `${carouselIndex + 1} / ${CAROUSEL_PHOTOS.length}`;

    // Animate progress bar for this slide
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    // Force reflow
    progressBar.offsetWidth;
    progressBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
    progressBar.style.width = '100%';
}

function autoAdvanceCarousel() {
    setTimeout(() => {
        carouselIndex++;
        if (carouselIndex < CAROUSEL_PHOTOS.length) {
            updateCarousel();
            autoAdvanceCarousel();
        } else {
            // All photos shown — reveal the button
            const btn = document.getElementById('btn-to-gifts');
            btn.classList.remove('hidden');
            btn.classList.add('pulse');
        }
    }, SLIDE_DURATION);
}

/* ===== SCREEN 2 → GAME ===== */
document.getElementById('btn-to-gifts').addEventListener('click', () => {
    goToScreen('game');
    currentRound = 0;
    setupRound();
});

/* ===== SCREEN 3: MYSTERY DOORS ===== */
const NUM_DOORS = 6;
const DOOR_FACES = ['🚪', '🎪', '🏠', '🏰', '⛩️', '🚪'];

function setupRound() {
    const round = GIFT_ROUNDS[currentRound];
    round.correctDoor = Math.floor(Math.random() * NUM_DOORS);

    document.getElementById('round-num').textContent = currentRound + 1;
    document.getElementById('game-instruction').textContent =
        'Watch the doors shuffle, then pick the right one!';
    document.getElementById('gift-reveal').classList.add('hidden');

    const container = document.getElementById('doors-container');
    container.innerHTML = '';

    // Create doors
    for (let i = 0; i < NUM_DOORS; i++) {
        const door = document.createElement('div');
        door.classList.add('door');
        door.dataset.index = i;

        const inner = document.createElement('div');
        inner.classList.add('door-inner');

        const front = document.createElement('div');
        front.classList.add('door-front');
        front.innerHTML = `
            <span class="door-emoji">${DOOR_FACES[i % DOOR_FACES.length]}</span>
            <span class="door-number">Door ${i + 1}</span>
        `;

        const back = document.createElement('div');
        back.classList.add('door-back');
        if (i === round.correctDoor) {
            back.classList.add('correct');
            back.innerHTML = `
                <span class="door-result-emoji">🎉</span>
                <span>YOU FOUND IT!</span>
            `;
        } else {
            const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
            back.innerHTML = `
                <span class="door-result-emoji">😅</span>
                <span>${msg}</span>
            `;
        }

        inner.appendChild(front);
        inner.appendChild(back);
        door.appendChild(inner);

        door.addEventListener('click', () => handleDoorClick(door, parseInt(door.dataset.index)));
        container.appendChild(door);
    }

    // Shuffle the doors visually after a brief pause
    shuffleDoors(container);
}

function shuffleDoors(container) {
    isShuffling = true;
    const notice = document.getElementById('shuffle-notice');
    notice.classList.remove('hidden');

    const doors = Array.from(container.children);

    // Disable clicking during shuffle
    doors.forEach(d => d.classList.add('shuffling'));

    // Number of shuffle swaps increases each round
    const swapCount = 3 + currentRound * 2;
    let swapsDone = 0;

    const doSwap = () => {
        if (swapsDone >= swapCount) {
            // Shuffle done — renumber doors and enable clicking
            doors.forEach(d => d.classList.remove('shuffling'));
            // Update door numbers to match new positions
            Array.from(container.children).forEach((d, i) => {
                d.querySelector('.door-number').textContent = `Door ${i + 1}`;
            });
            notice.classList.add('hidden');
            isShuffling = false;
            return;
        }

        // Pick two random different doors to swap
        let a = Math.floor(Math.random() * doors.length);
        let b = Math.floor(Math.random() * doors.length);
        while (b === a) b = Math.floor(Math.random() * doors.length);

        const doorA = container.children[a];
        const doorB = container.children[b];

        // Animate: scale down, swap, scale up
        doorA.style.transform = 'scale(0.7) rotate(-10deg)';
        doorB.style.transform = 'scale(0.7) rotate(10deg)';

        setTimeout(() => {
            // Swap in DOM
            if (a < b) {
                container.insertBefore(doorB, doorA);
                container.insertBefore(doorA, container.children[b]);
            } else {
                container.insertBefore(doorA, doorB);
                container.insertBefore(doorB, container.children[a]);
            }

            doorA.style.transform = '';
            doorB.style.transform = '';
            swapsDone++;
            setTimeout(doSwap, 250);
        }, 250);
    };

    // Start shuffling after a brief moment
    setTimeout(doSwap, 600);
}

function handleDoorClick(doorEl, index) {
    if (doorEl.classList.contains('opened') || isShuffling) return;

    const round = GIFT_ROUNDS[currentRound];
    doorEl.classList.add('opened');

    if (index === round.correctDoor) {
        // Correct!
        launchConfetti();
        setTimeout(() => {
            // Disable all doors
            document.querySelectorAll('.door').forEach(d => {
                d.style.pointerEvents = 'none';
            });
            showGiftReveal(round);
        }, 800);
    } else {
        doorEl.classList.add('wrong');
    }
}

function showGiftReveal(round) {
    const reveal = document.getElementById('gift-reveal');
    const content = document.getElementById('reveal-content');
    reveal.classList.remove('hidden');

    content.innerHTML = `
        <div class="reveal-emoji">${round.revealEmoji}</div>
        <h3 class="reveal-title cursive">${round.revealTitle}</h3>
        <p class="reveal-text">${round.revealText}</p>
    `;

    const btn = document.getElementById('btn-next-round');
    if (currentRound < GIFT_ROUNDS.length - 1) {
        btn.textContent = 'Next Gift 🎁';
        btn.onclick = () => {
            currentRound++;
            setupRound();
            // Scroll game screen back to top
            screens.game.scrollTop = 0;
        };
    } else {
        // Last round (gift 3) — go to grandma screen
        btn.textContent = 'See Your Special Gift 💝';
        btn.onclick = () => {
            // Fade out bg music, start grandma song
            bgMusic.pause();
            grandmaMusic.volume = 0.5;
            grandmaMusic.play().catch(() => {});
            goToScreen('grandma');
        };
    }
}

/* ===== SCREEN 4: GRANDMA → NOTE ===== */
document.getElementById('btn-to-note').addEventListener('click', () => {
    goToScreen('note');
    launchFinalHearts();
});

function launchFinalHearts() {
    const container = document.getElementById('final-hearts');
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const h = document.createElement('span');
            h.style.display = 'inline-block';
            h.style.fontSize = (20 + Math.random() * 20) + 'px';
            h.style.animation = 'fadeInUp 1s ease forwards';
            h.style.animationDelay = (i * 0.1) + 's';
            h.style.opacity = '0';
            h.textContent = ['💕', '💖', '❤️', '💗', '🩷', '💛'][Math.floor(Math.random() * 6)];
            container.appendChild(h);
        }, i * 100);
    }
}
