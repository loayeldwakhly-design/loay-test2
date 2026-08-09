/* =========================================================
   LOAY — MY UNIVERSE
   AQUA 2.0
   ORIGINAL PROCEDURAL CINEMATIC AUDIO
   ========================================================= */


/* =========================================================
   GLOBAL AUDIO STATE
   ========================================================= */

let audioContext = null;
let masterGain = null;

let soundEnabled = true;
let masterVolume = 3.5;

let audioReady = false;

let lastHoverSound = 0;
let lastScrollSound = 0;


/* =========================================================
   AUDIO INITIALIZATION
   ========================================================= */

function initAudio() {

    if (audioContext) return;

    const AudioCtx =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioCtx) return;

    audioContext =
        new AudioCtx();

    masterGain =
        audioContext.createGain();

    masterGain.gain.value =
        masterVolume;

    masterGain.connect(
        audioContext.destination
    );

    audioReady = true;
}


/* =========================================================
   RESUME
   ========================================================= */

function resumeAudio() {

    initAudio();

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }
}


/* =========================================================
   GAIN HELPER
   ========================================================= */

function createGain(
    value = .1
) {

    const gain =
        audioContext.createGain();

    gain.gain.value =
        value;

    gain.connect(
        masterGain
    );

    return gain;
}


/* =========================================================
   OSCILLATOR TONE
   ========================================================= */

function playTone({

    frequency = 500,
    duration = .1,
    type = "sine",
    volume = .05,
    attack = .01,
    startFrequency = null,
    endFrequency = null,
    detune = 0

} = {}) {

    if (!soundEnabled) return;

    resumeAudio();

    if (
        !audioContext ||
        !masterGain
    ) return;

    const now =
        audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type =
        type;

    oscillator.detune.value =
        detune;

    const start =
        startFrequency ??
        frequency;

    const end =
        endFrequency ??
        frequency;

    oscillator.frequency.setValueAtTime(
        Math.max(start, 20),
        now
    );

    if (start !== end) {

        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(end, 20),
            now + duration
        );
    }

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        Math.max(volume, .0001),
        now + attack
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + duration
    );

    oscillator.connect(gain);

    gain.connect(
        masterGain
    );

    oscillator.start(now);

    oscillator.stop(
        now + duration + .03
    );
}


/* =========================================================
   FILTERED NOISE
   ========================================================= */

function playNoise({

    duration = .5,
    volume = .02,
    filterType = "bandpass",
    frequency = 1200,
    q = 2,
    attack = .05

} = {}) {

    if (!soundEnabled) return;

    resumeAudio();

    if (!audioContext) return;

    const bufferSize =
        audioContext.sampleRate *
        duration;

    const buffer =
        audioContext.createBuffer(
            1,
            bufferSize,
            audioContext.sampleRate
        );

    const data =
        buffer.getChannelData(0);

    for (
        let i = 0;
        i < bufferSize;
        i++
    ) {

        data[i] =
            Math.random() * 2 - 1;
    }

    const source =
        audioContext.createBufferSource();

    source.buffer =
        buffer;

    const filter =
        audioContext.createBiquadFilter();

    filter.type =
        filterType;

    filter.frequency.value =
        frequency;

    filter.Q.value =
        q;

    const gain =
        audioContext.createGain();

    const now =
        audioContext.currentTime;

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        now + attack
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now + duration
    );

    source
        .connect(filter)
        .connect(gain)
        .connect(masterGain);

    source.start(now);

    source.stop(
        now + duration + .03
    );
}


/* =========================================================
   ORIGINAL AQUA HOVER SOUND
   ========================================================= */

function playPhotoHoverSound() {

    if (!soundEnabled) return;

    const now =
        performance.now();

    if (
        now - lastHoverSound <
        110
    ) {
        return;
    }

    lastHoverSound =
        now;

    /*
        Layer 1:
        very low underwater pulse
    */

    playTone({

        startFrequency: 170,
        endFrequency: 105,

        duration: .16,

        type: "sine",

        volume: .025,

        attack: .015
    });


    /*
        Layer 2:
        glass resonance
    */

    setTimeout(() => {

        playTone({

            startFrequency: 720,
            endFrequency: 980,

            duration: .12,

            type: "triangle",

            volume: .022,

            attack: .006,

            detune: -8
        });

    }, 25);


    /*
        Layer 3:
        tiny air/water shimmer
    */

    setTimeout(() => {

        playNoise({

            duration: .09,

            volume: .008,

            filterType: "highpass",

            frequency: 3000,

            q: .8,

            attack: .008
        });

    }, 45);
}


/* =========================================================
   MICRO CLICK
   ========================================================= */

function playClickSound() {

    if (!soundEnabled) return;

    playTone({

        startFrequency: 390,
        endFrequency: 510,

        duration: .08,

        type: "sine",

        volume: .028,

        attack: .004
    });

    setTimeout(() => {

        playTone({

            startFrequency: 760,
            endFrequency: 620,

            duration: .07,

            type: "triangle",

            volume: .018,

            attack: .004
        });

    }, 28);
}


/* =========================================================
   ENTER — CINEMATIC SIGNATURE
   ========================================================= */

function playEnterSound() {

    if (!soundEnabled) return;

    resumeAudio();

    /*
        SUB DROP
    */

    playTone({

        startFrequency: 72,
        endFrequency: 27,

        duration: 1.15,

        type: "sine",

        volume: .18,

        attack: .015
    });


    /*
        UNDERWATER RISE
    */

    setTimeout(() => {

        playTone({

            startFrequency: 90,
            endFrequency: 720,

            duration: 1.15,

            type: "triangle",

            volume: .035,

            attack: .25
        });

    }, 100);


    /*
        FILTERED AIR SWELL
    */

    setTimeout(() => {

        playNoise({

            duration: .9,

            volume: .018,

            filterType: "bandpass",

            frequency: 900,

            q: 1.3,

            attack: .25
        });

    }, 150);


    /*
        GLASS NOTE
    */

    setTimeout(() => {

        playTone({

            frequency: 1240,

            duration: .65,

            type: "sine",

            volume: .025,

            attack: .01,

            detune: -5
        });

        playTone({

            frequency: 1860,

            duration: .45,

            type: "triangle",

            volume: .012,

            attack: .015,

            detune: 7
        });

    }, 620);


    /*
        FINAL AIR RELEASE
    */

    setTimeout(() => {

        playNoise({

            duration: .45,

            volume: .009,

            filterType: "highpass",

            frequency: 4000,

            q: .7,

            attack: .03
        });

    }, 780);
}


/* =========================================================
   PHOTO OPEN
   ========================================================= */

function playImageOpenSound() {

    if (!soundEnabled) return;

    /*
        deep impact
    */

    playTone({

        startFrequency: 95,
        endFrequency: 38,

        duration: .65,

        type: "sine",

        volume: .1,

        attack: .01
    });


    /*
        reverse-like sweep
    */

    setTimeout(() => {

        playTone({

            startFrequency: 260,
            endFrequency: 1500,

            duration: .55,

            type: "triangle",

            volume: .035,

            attack: .04
        });

    }, 45);


    /*
        glass flash
    */

    setTimeout(() => {

        playTone({

            frequency: 1760,

            duration: .32,

            type: "sine",

            volume: .018,

            attack: .005
        });

    }, 180);


    /*
        airy texture
    */

    setTimeout(() => {

        playNoise({

            duration: .45,

            volume: .012,

            filterType: "highpass",

            frequency: 2400,

            q: .7,

            attack: .04
        });

    }, 100);
}


/* =========================================================
   PHOTO CLOSE
   ========================================================= */

function playImageCloseSound() {

    if (!soundEnabled) return;

    playTone({

        startFrequency: 880,
        endFrequency: 230,

        duration: .35,

        type: "sine",

        volume: .03,

        attack: .01
    });

    setTimeout(() => {

        playTone({

            startFrequency: 260,
            endFrequency: 90,

            duration: .25,

            type: "triangle",

            volume: .018,

            attack: .005
        });

    }, 40);
}


/* =========================================================
   ENTER SYSTEM
   ========================================================= */

const enterBtn =
    document.getElementById(
        "enterBtn"
    );

const intro =
    document.getElementById(
        "intro"
    );

const mainContent =
    document.getElementById(
        "mainContent"
    );


if (enterBtn) {

    enterBtn.addEventListener(
        "click",
        () => {

            resumeAudio();

            playEnterSound();

            intro.style.transition =
                "opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1)";

            intro.style.opacity =
                "0";

            intro.style.transform =
                "scale(1.05)";

            setTimeout(() => {

                intro.style.display =
                    "none";

                mainContent.style.display =
                    "block";

                window.scrollTo({
                    top: 0,
                    behavior: "instant"
                });

                initScrollAnimations();

            }, 850);

        },
        {
            once: true
        }
    );
}


/* =========================================================
   UNIVERSAL HOVER SOUND
   ========================================================= */

document
    .querySelectorAll(
        ".sound-hover"
    )
    .forEach(
        element => {

            element.addEventListener(
                "mouseenter",
                () => {

                    playPhotoHoverSound();

                }
            );

        }
    );


/* =========================================================
   CLICK SOUND FOR INTERACTIVE ELEMENTS
   ========================================================= */

document
    .querySelectorAll(
        ".sound-hover, .aqua-interactive"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    if (
                        element.id ===
                        "enterBtn"
                    ) {
                        return;
                    }

                    playClickSound();

                }
            );

        }
    );


/* =========================================================
   CINEMATIC IMAGE ZOOM
   ========================================================= */

const memoryCards =
    document.querySelectorAll(
        ".memory-card"
    );

let currentClone =
    null;

let currentOverlay =
    null;

let originalImage =
    null;

let originalRect =
    null;


memoryCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                if (
                    currentClone
                ) {
                    return;
                }

                const image =
                    card.querySelector(
                        "img"
                    );

                if (!image) {
                    return;
                }

                playImageOpenSound();

                originalImage =
                    image;

                originalRect =
                    image.getBoundingClientRect();


                currentOverlay =
                    document.createElement(
                        "div"
                    );

                currentOverlay.className =
                    "cinematic-overlay";

                document.body.appendChild(
                    currentOverlay
                );


                currentClone =
                    image.cloneNode(true);

                currentClone.className =
                    "cinematic-clone";

                currentClone.style.top =
                    originalRect.top +
                    "px";

                currentClone.style.left =
                    originalRect.left +
                    "px";

                currentClone.style.width =
                    originalRect.width +
                    "px";

                currentClone.style.height =
                    originalRect.height +
                    "px";

                document.body.appendChild(
                    currentClone
                );


                originalImage.style.visibility =
                    "hidden";


                requestAnimationFrame(
                    () => {

                        currentOverlay.classList.add(
                            "active"
                        );

                        const padding =
                            40;

                        let finalWidth =
                            window.innerWidth -
                            padding * 2;

                        let finalHeight =
                            finalWidth *
                            (
                                originalRect.height /
                                originalRect.width
                            );


                        if (
                            finalHeight >
                            window.innerHeight -
                            padding * 2
                        ) {

                            finalHeight =
                                window.innerHeight -
                                padding * 2;

                            finalWidth =
                                finalHeight *
                                (
                                    originalRect.width /
                                    originalRect.height
                                );
                        }


                        const finalLeft =
                            (
                                window.innerWidth -
                                finalWidth
                            ) / 2;

                        const finalTop =
                            (
                                window.innerHeight -
                                finalHeight
                            ) / 2;


                        currentClone.style.top =
                            finalTop +
                            "px";

                        currentClone.style.left =
                            finalLeft +
                            "px";

                        currentClone.style.width =
                            finalWidth +
                            "px";

                        currentClone.style.height =
                            finalHeight +
                            "px";

                    }
                );


                currentOverlay.addEventListener(
                    "click",
                    closeCinematic
                );

            }
        );

    }
);


/* =========================================================
   CLOSE IMAGE
   ========================================================= */

function closeCinematic() {

    if (
        !currentClone
    ) {
        return;
    }

    playImageCloseSound();

    currentClone.style.top =
        originalRect.top +
        "px";

    currentClone.style.left =
        originalRect.left +
        "px";

    currentClone.style.width =
        originalRect.width +
        "px";

    currentClone.style.height =
        originalRect.height +
        "px";

    currentOverlay.classList.remove(
        "active"
    );


    setTimeout(
        () => {

            if (
                originalImage
            ) {

                originalImage.style.visibility =
                    "visible";
            }

            if (
                currentClone
            ) {

                currentClone.remove();
            }

            if (
                currentOverlay
            ) {

                currentOverlay.remove();
            }

            currentClone =
                null;

            currentOverlay =
                null;

            originalImage =
                null;

            originalRect =
                null;

        },
        750
    );
}


/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeCinematic();

            closeSecretRoom();

        }

    }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

document
    .querySelectorAll(
        ".nav-links a, .explore-btn"
    )
    .forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    const target =
                        document.querySelector(
                            href
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    playClickSound();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            );

        }
    );


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function initScrollAnimations() {

    const revealElements =
        document.querySelectorAll(
            ".reveal, .reveal-left, .reveal-right, .reveal-card"
        );

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                        }

                    }
                );

            },
            {
                threshold: .16,
                rootMargin:
                    "0px 0px -70px 0px"
            }
        );


    revealElements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );


    const finalSection =
        document.querySelector(
            ".final-message"
        );

    if (finalSection) {

        const finalObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                finalSection.classList.add(
                                    "visible"
                                );

                                playEndingSound();

                            }

                        }
                    );

                },
                {
                    threshold: .45
                }
            );

        finalObserver.observe(
            finalSection
        );
    }
}


/* =========================================================
   ENDING SOUND
   ========================================================= */

let endingPlayed =
    false;

function playEndingSound() {

    if (
        endingPlayed ||
        !soundEnabled
    ) {
        return;
    }

    endingPlayed =
        true;


    /*
        Deep final tone
    */

    playTone({

        startFrequency: 70,
        endFrequency: 32,

        duration: 1.5,

        type: "sine",

        volume: .08,

        attack: .3
    });


    /*
        Rising emotional layer
    */

    setTimeout(() => {

        playTone({

            startFrequency: 180,
            endFrequency: 620,

            duration: 1.6,

            type: "triangle",

            volume: .022,

            attack: .4
        });

    }, 200);


    /*
        final glass constellation
    */

    setTimeout(() => {

        playTone({

            frequency: 920,

            duration: .8,

            type: "sine",

            volume: .016,

            attack: .02
        });

        setTimeout(() => {

            playTone({

                frequency: 1380,

                duration: .7,

                type: "triangle",

                volume: .012,

                attack: .02
            });

        }, 120);

    }, 800);
}


/* =========================================================
   NAVBAR SCROLL
   ========================================================= */

const navbar =
    document.querySelector(
        ".navbar"
    );

window.addEventListener(
    "scroll",
    () => {

        if (!navbar) return;

        if (
            window.scrollY >
            80
        ) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   SCROLL MICRO SOUND
   ========================================================= */

window.addEventListener(
    "scroll",
    () => {

        if (!soundEnabled) {
            return;
        }

        const now =
            performance.now();

        if (
            now - lastScrollSound <
            900
        ) {
            return;
        }

        lastScrollSound =
            now;

        /*
            Extremely quiet:
            almost felt rather than heard.
        */

        playTone({

            startFrequency: 190,
            endFrequency: 240,

            duration: .12,

            type: "sine",

            volume: .008,

            attack: .03
        });

    },
    {
        passive: true
    }
);


/* =========================================================
   MOUSE PARALLAX
   ========================================================= */

const cursorGlow =
    document.querySelector(
        ".cursor-glow"
    );

const orbs =
    document.querySelectorAll(
        ".orb"
    );

let mouseX =
    window.innerWidth / 2;

let mouseY =
    window.innerHeight / 2;

let targetX =
    mouseX;

let targetY =
    mouseY;

window.addEventListener(
    "pointermove",
    event => {

        targetX =
            event.clientX;

        targetY =
            event.clientY;

        if (cursorGlow) {

            cursorGlow.style.left =
                event.clientX +
                "px";

            cursorGlow.style.top =
                event.clientY +
                "px";
        }

    },
    {
        passive: true
    }
);


function animateParallax() {

    mouseX +=
        (targetX - mouseX) *
        .045;

    mouseY +=
        (targetY - mouseY) *
        .045;


    orbs.forEach(
        (orb, index) => {

            const amount =
                (index + 1) *
                7;

            const x =
                (
                    mouseX -
                    window.innerWidth / 2
                ) /
                window.innerWidth *
                amount;

            const y =
                (
                    mouseY -
                    window.innerHeight / 2
                ) /
                window.innerHeight *
                amount;

            orb.style.translate =
                `${x}px ${y}px`;
        }
    );


    requestAnimationFrame(
        animateParallax
    );
}

animateParallax();


/* =========================================================
   CARD TILT
   ========================================================= */

document
    .querySelectorAll(
        ".build-card, .social-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const rotateY =
                        (
                            x /
                            rect.width -
                            .5
                        ) *
                        4;

                    const rotateX =
                        (
                            y /
                            rect.height -
                            .5
                        ) *
                        -4;

                    card.style.transform =
                        `
                        translateY(-10px)
                        perspective(800px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        `;
                }
            );


            card.addEventListener(
                "pointerleave",
                () => {

                    card.style.transform =
                        "";
                }
            );

        }
    );


/* =========================================================
   SECRET ROOM
   ========================================================= */

const secretTrigger =
    document.getElementById(
        "secretTrigger"
    );

const secretRoom =
    document.getElementById(
        "secretRoom"
    );

const closeSecret =
    document.getElementById(
        "closeSecret"
    );

let secretClicks =
    0;

if (secretTrigger) {

    secretTrigger.addEventListener(
        "click",
        () => {

            secretClicks++;

            if (
                secretClicks >= 3
            ) {

                openSecretRoom();

                secretClicks =
                    0;
            }

        }
    );

}


function openSecretRoom() {

    if (!secretRoom) {
        return;
    }

    secretRoom.classList.add(
        "active"
    );

    playSecretSound();
}


function closeSecretRoom() {

    if (!secretRoom) {
        return;
    }

    if (
        !secretRoom.classList.contains(
            "active"
        )
    ) {
        return;
    }

    secretRoom.classList.remove(
        "active"
    );

    playClickSound();
}


if (closeSecret) {

    closeSecret.addEventListener(
        "click",
        closeSecretRoom
    );

}


/* =========================================================
   SECRET SOUND
   ========================================================= */

function playSecretSound() {

    if (!soundEnabled) {
        return;
    }

    /*
        unusual low pulse
    */

    playTone({

        startFrequency: 48,
        endFrequency: 22,

        duration: 1.2,

        type: "sine",

        volume: .12,

        attack: .08
    });


    /*
        mysterious rising resonance
    */

    setTimeout(() => {

        playTone({

            startFrequency: 110,
            endFrequency: 880,

            duration: 1.4,

            type: "triangle",

            volume: .025,

            attack: .25
        });

    }, 180);


    /*
        metallic underwater texture
    */

    setTimeout(() => {

        playNoise({

            duration: .8,

            volume: .014,

            filterType: "bandpass",

            frequency: 1800,

            q: 4,

            attack: .08
        });

    }, 300);
}


/* =========================================================
   SOUND CONTROL
   ========================================================= */

const soundIcon =
    document.getElementById(
        "soundIcon"
    );

const volumeSlider =
    document.getElementById(
        "volumeSlider"
    );

const soundStatus =
    document.getElementById(
        "soundStatus"
    );

const soundControl =
    document.getElementById(
        "soundControl"
    );


function updateSoundUI() {

    if (soundStatus) {

        soundStatus.textContent =
            soundEnabled
                ? "ON"
                : "OFF";
    }

    if (soundControl) {

        soundControl.classList.toggle(
            "muted",
            !soundEnabled
        );
    }
}


if (soundIcon) {

    soundIcon.addEventListener(
        "click",
        () => {

            resumeAudio();

            soundEnabled =
                !soundEnabled;

            if (
                soundEnabled
            ) {

                playClickSound();

            } else {

                /*
                    Fade instead of
                    instantly killing.
                */

                if (
                    masterGain &&
                    audioContext
                ) {

                    masterGain.gain.setTargetAtTime(
                        0,
                        audioContext.currentTime,
                        .05
                    );
                }

                setTimeout(() => {

                    if (
                        masterGain &&
                        audioContext
                    ) {

                        masterGain.gain.value =
                            0;
                    }

                }, 120);
            }

            updateSoundUI();

        }
    );
}


if (volumeSlider) {

    volumeSlider.addEventListener(
        "input",
        function () {

            masterVolume =
                parseFloat(
                    this.value
                );

            resumeAudio();

            if (
                masterGain &&
                audioContext
            ) {

                masterGain.gain.setTargetAtTime(
                    masterVolume,
                    audioContext.currentTime,
                    .04
                );
            }


            if (
                masterVolume <= 0
            ) {

                soundEnabled =
                    false;

            } else {

                soundEnabled =
                    true;
            }

            updateSoundUI();

        }
    );
}


/* =========================================================
   FIRST INTERACTION
   ========================================================= */

document.addEventListener(
    "pointerdown",
    () => {

        if (!audioReady) {

            initAudio();
        }

    },
    {
        once: true
    }
);


/* =========================================================
   INITIAL UI
   ========================================================= */

updateSoundUI();


/* =========================================================
   INITIAL SCROLL ANIMATIONS
   ========================================================= */

if (
    mainContent &&
    mainContent.style.display !== "none"
) {

    initScrollAnimations();
}
/* =========================================================
   LOAY MUSIC INTERLUDES
   ========================================================= */

document
    .querySelectorAll(".music-interlude")
    .forEach(section => {

        const audio =
            section.querySelector(".music-audio");

console.log("SRC =", audio.src);
console.log("CURRENT SRC =", audio.currentSrc);
console.log("ERROR =", audio.error);
console.log("READY =", audio.readyState);

        const playButton =
            section.querySelector(".music-play");

        const playIcon =
            section.querySelector(".play-icon");

        const progress =
            section.querySelector(".music-progress-fill");

        const line =
            section.querySelector(".music-line");

        const currentTime =
            section.querySelector(".current-time");

        const totalTime =
            section.querySelector(".total-time");


        if (
            !audio ||
            !playButton
        ) {
            return;
        }


        function formatTime(seconds) {

            if (
                !Number.isFinite(seconds)
            ) {
                return "00:00";
            }

            const minutes =
                Math.floor(seconds / 60);

            const secs =
                Math.floor(seconds % 60);

            return (
                String(minutes)
                    .padStart(2, "0")
                +
                ":"
                +
                String(secs)
                    .padStart(2, "0")
            );
        }


        function updateProgress() {

            if (
                !audio.duration
            ) {
                return;
            }

            const percent =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;

            progress.style.width =
                percent + "%";

            currentTime.textContent =
                formatTime(
                    audio.currentTime
                );
        }


        audio.addEventListener(
            "loadedmetadata",
            () => {

                totalTime.textContent =
                    formatTime(
                        audio.duration
                    );

            }
        );


        audio.addEventListener(
            "timeupdate",
            updateProgress
        );


        audio.addEventListener(
            "play",
            () => {

                section.classList.add(
                    "playing"
                );

                playIcon.textContent =
                    "Ⅱ";

            }
        );


        audio.addEventListener(
            "pause",
            () => {

                section.classList.remove(
                    "playing"
                );

                playIcon.textContent =
                    "▶";

            }
        );


        audio.addEventListener(
            "ended",
            () => {

                section.classList.remove(
                    "playing"
                );

                playIcon.textContent =
                    "▶";

                progress.style.width =
                    "0%";

                currentTime.textContent =
                    "00:00";

            }
        );


        playButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                resumeAudio();

                if (audio.paused) {

                    /*
                     * Stop the other music section
                     * so both songs never play together.
                     */

                    document
                        .querySelectorAll(
                            ".music-audio"
                        )
                        .forEach(otherAudio => {

                            if (
                                otherAudio !== audio
                            ) {
                                otherAudio.pause();
                            }

                        });

                    audio.play();

                } else {

                    audio.pause();

                }

            }
        );


        line.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (
                    !audio.duration
                ) {
                    return;
                }

                const rect =
                    line.getBoundingClientRect();

                const percent =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;

                audio.currentTime =
                    percent *
                    audio.duration;

            }
        );

    });