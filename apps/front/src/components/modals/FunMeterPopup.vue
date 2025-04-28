<template>
    <Transition name="popup-fade">
        <div class="funmeter-view-content" v-if="activeView == 'funmeter'">
            <h2 id="funmeter-view-title" class="view-title">FUNMETER</h2>

            <p class="view-description">
                Charge FunMeter to win Free Plays, extra Entries, or other exciting rewards!
            </p>

            <div style="transform: scale(2) translateX(50px)" class="lightning-container">
                <svg :width="lightningWidth" :height="lightningHeight" :viewBox="`0 0 ${baseSvgWidth} ${baseSvgHeight}`"
                    class="lightning-svg">
                    <defs>
                        <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#2a1a4a; stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#facc15; stop-opacity:1" />
                        </linearGradient>
                        <clipPath id="lightningClipPathLarge">
                            <path :d="lightningPathData" />
                        </clipPath>
                    </defs>
                    <path class="lightning-bolt-shape" :d="lightningPathData" />
                </svg>

                <div class="balls-container">
                    <div v-for="ball in balls" :key="ball.id" class="ball" :style="{
                        left: ball.left,
                        bottom: ball.bottom,
                        animationDelay: ball.delay,
                        animationDuration: ball.duration,
                        transform: `scale(${ball.scale})`,
                        '--translate-y-end': `-${lightningHeight * 0.95}px` // Pass end position via CSS var
                    }"></div>
                </div>
            </div>

            <!-- <p class="progress-text">Every play charges FunMeter</p> -->
            <p class="progress-value">{{ currentCharge }} / {{ maxCharge }}</p>

            <button class="action-button">
                SWITCH TO FUNMETER
            </button>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

// --- Props ---
interface Props {
    currentCharge?: number;
    maxCharge?: number;
    showMeter: boolean
    activeView: string
}

const props = withDefaults(defineProps<Props>(), {
    currentCharge: 30,
    maxCharge: 65,
    showMeter: false,
    activeView: ''
});

// --- Lightning Bolt Size & Path ---
const baseSvgWidth = 40;
const baseSvgHeight = 65;
const scaleFactor = 1;
const lightningWidth = baseSvgWidth * scaleFactor;
const lightningHeight = baseSvgHeight * scaleFactor;
const lightningPathData = "M25 0 L10 40 L20 40 L15 65 L35 45 L25 45 L40 20 Z";

// --- Ball Animation Data ---
interface Ball { id: number; left: string; bottom: string; delay: string; duration: string; scale: number; }
const balls = ref<Ball[]>([]);
const numberOfBalls = 20;

const generateBalls = () => {
    const newBalls: Ball[] = [];
    for (let i = 0; i < numberOfBalls; i++) {
        newBalls.push({
            id: i,
            left: `${Math.random() * 60 + 20}%`,
            bottom: `${Math.random() * 10}%`,
            delay: `${Math.random() * 3}s`,
            duration: `${4 + Math.random() * 5}s`,
            scale: 0.9 + Math.random() * 0.4,
        });
    }
    balls.value = newBalls;
};

onMounted(() => {
    generateBalls();
});

</script>

<style scoped>

    /* --- Main Container --- */
    .funmeter-view-content {
        position: absolute;
        margin-left: 0px;
        margin-top: 5px;
        background-color: #0F172A;
        /* Very dark blue/black background */
        color: white;
        border-radius: 15px;
        text-align: center;
        padding-bottom: 10px;
        /* width: 100%;
        max-width: 100%;
        max-height: 80%; */
        /* justify-content: center;
        align-items: center; */

    }

    /* --- Text Styles --- */
    .view-title {
        font-size: 1.6rem;
        font-weight: bold;
        color: #fde047;
        /* Bright Gold/Yellow color */
        text-transform: uppercase;
    }

    .view-description {
        font-size: 0.89rem;
        color: #cbd5e1;
        /* Lighter grey/blue text */
        margin-bottom: 0px;
        line-height: 1.5;
        max-width: 350px;
        margin-left: auto;
        margin-right: auto;
        padding-left: 5px;
        padding-right: 5px;
        margin-bottom: 30px;

    }

    /* --- Lightning Bolt and Animation (Larger) --- */
    .lightning-container {
        position: relative;
        height: v-bind(lightningHeight + 'px');
        width: v-bind(lightningWidth + 'px');
        clip-path: url(#lightningClipPathLarge);
        -webkit-clip-path: url(#lightningClipPathLarge);

    }

    .lightning-svg {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;

    }

    .lightning-bolt-shape {
        fill: url(#lightningGradient);
        stroke: #fde047;
        /* Bright Gold/Yellow stroke */
        stroke-width: 1.5;
        filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.6));
    }

    .balls-container {
        position: absolute;
        inset: 0;
        z-index: 2;
    }

    .ball {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #fde047;
        /* Bright yellow/gold */
        border-radius: 50%;
        box-shadow: 0 0 5px #facc15;
        animation-name: floatUpLarge;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        opacity: 0;
    }

    /* --- Keyframes for Ball Animation --- */
    @keyframes floatUpLarge {
        0% {
            transform: translateY(0) scale(var(--scale, 1));
            opacity: 0.7;
        }

        20% {
            opacity: 1;
        }

        90% {
            opacity: 0.8;
        }

        100% {
            transform: translateY(var(--translate-y-end)) scale(var(--scale, 1));
            opacity: 0;
        }
    }

    /* --- Progress Text --- */
    .progress-text {
        font-size: 0.85rem;
        color: #c1ccdb;
        /* Medium grey/blue */
        margin-top: 10px;
    }

    .progress-value {
        font-size: 1.2rem;
        font-weight: bold;
        color: #fde047;
        /* Match title gold color */
        margin-bottom: 3px;
        margin-top: 33px;
        /* More space before button */
    }

    /* --- Action Button --- */
    .action-button {
        background-color: #1e293b;
        /* Dark background matching header buttons */
        color: #e2e8f0;
        /* Light text color */
        border: 2px solid #ec4899;
        /* Pink/Magenta border */
        border-radius: 25px;
        /* Pill shape */
        padding: 8px 20px;
        /* Generous padding */
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
        text-transform: uppercase;
        box-shadow: 0 3px 6px rgba(236, 72, 153, 0.3);
        /* Subtle pink shadow */
    }

    .action-button:hover {
        background-color: #334155;
        /* Slightly lighter background on hover */
        box-shadow: 0 5px 10px rgba(236, 72, 153, 0.4);
        transform: translateY(-1px);
    }

    .action-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
    }


    /* --- Transition Styles --- */
    .popup-fade-enter-active,
    .popup-fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .popup-fade-enter-from,
    .popup-fade-leave-to {
        opacity: 0;
    }

    .popup-fade-enter-active .popup-content,
    .popup-fade-leave-active .popup-content {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .popup-fade-enter-from .popup-content,
    .popup-fade-leave-to .popup-content {
        opacity: 0;
        transform: scale(0.95);
    }

</style>