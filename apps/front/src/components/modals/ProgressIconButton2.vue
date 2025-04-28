<template>
    <div class="button-wrapper">
        <button class="progress-icon-button" :class="{ active: isActive }" type="button" :aria-label="label">
            <svg class="button-svg" :viewBox="`0 0 ${svgSize} ${svgSize}`">
                <defs>
                    <clipPath :id="clipPathId">
                        <rect :x="0" :y="clipY" :width="svgSize" :height="clipHeight" />
                    </clipPath>
                </defs>

                <circle class="inner-circle-base" :cx="center" :cy="center" :r="innerRadius" />


                <circle class="outer-track" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth"
                    fill="none" />
                <circle class="outer-progress" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth"
                    :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset" fill="none"
                    :transform="`rotate(-90 ${center} ${center})`" />
            </svg>

            <div class="button-content">
                <span class="icon-placeholder p-1" aria-hidden="true"><img :src="`/images/${imageUrl}.webp`" </span>
                    <!-- <span class="label-text">{{ label }}</span> -->
            </div>
        </button>

        <span v-if="isActive && showStartLabel" class="start-label">START</span>
        <span :class="{ active: isActive }" class="label">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, getCurrentInstance } from 'vue';

// --- Props ---
interface Props {
    progress?: number; // Progress percentage (0-100)
    imageUrl?: string; // Placeholder icon character/emoji
    label?: string; // Button label text
    isActive?: boolean; // Controls active state styling (e.g., border/glow)
    showStartLabel?: boolean; // Controls visibility of the 'START' label below
}

const props = withDefaults(defineProps<Props>(), {
    progress: 0,
    icon: '?',
    label: 'Button',
    isActive: false,
    // imageUrl: '/images/wallet.webp',
    showStartLabel: false,
    imageUrl: 'wallet',
    labelText: 'asdf'
});

// --- SVG Dimensions and Calculations ---
const svgSize = 90;
const imageUrl = props.imageUrl;
const strokeWidth = 9;
const center = svgSize / 2;
const outerRadius = (svgSize / 2) - (strokeWidth / 2);
const innerRadius = outerRadius - strokeWidth; // Adjusted inner radius
const circumference = computed(() => 2 * Math.PI * outerRadius);
// --- Clip Path Calculation ---
const clampedProgress = computed(() => {
    return Math.min(Math.max(props.progress, 0), 100);
});
const clipY = computed(() => {
    return svgSize * (1 - clampedProgress.value / 100);
});
const clipHeight = computed(() => svgSize);
const instance = getCurrentInstance();
const clipPathId = computed(() => `innerCircleClip-${instance?.uid || Math.random().toString(36).substring(7)}`);
const strokeDashoffset = computed(() => {
    return circumference.value * (1 - clampedProgress.value / 100);
});
</script>

<style scoped>

    /* Wrapper to contain button and potential 'START' label */
    .button-wrapper {
        position: relative;
        /* display: inline-block; */
        justify-content: space-evenly;

        align-items: center;
        /* width: 80px; */
        /* Default size, matches button */
        /* height: 80px; */
    }

    .outer-track {
        stroke: #374151;
        /* Dark grey/blue track color */
        transition: stroke 0.2s ease;
    }

    .progress-icon-button {
        /* Reset button defaults */
        background: none;
        justify-content: center;

        align-items: center;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        display: block;
        width: 50px;
        height: 50px;
        position: relative;
        transition: transform 0.1s ease;
        border-radius: 50%;
    }

    .progress-icon-button:active {
        transform: scale(0.97);
    }

    .outer-progress {
        stroke: #facc15;
        /* Yellow/gold progress color */
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1);
        /* Glow effect only when NOT active (active state glow is on the track) */
        /* filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5)); */
    }

    .button-svg {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        overflow: visible;
        /* Allow glow to render outside SVG bounds */
    }

    /* --- SVG Styles --- */
    /* 1. Base Inner Circle (Purple) */
    .inner-circle-base {
        fill: #642fe3;
        /* Darker Purple base - Stays the same when active */
        transition: filter 0.3s ease;
        /* Animate the glow */
    }

    /* Apply glow effect when active */
    .progress-icon-button.active .inner-circle-base {
        filter: drop-shadow(0 0 6px rgb(255, 210, 28));
        /* Yellow glow */
    }

    /* 2. Inner Fill Circle (Yellow) - Revealed by Clip Path */
    /* .inner-circle-fill {
        fill: #facc15;
        transition: filter 0.3s ease;
    } */

    /* Apply matching glow effect when active */
    .progress-icon-button.active .inner-circle-fill {
        filter: drop-shadow(0 0 16px rgba(250, 204, 21, 1));
        /* Yellow glow */
    }


    /* 3. Outer Ring Background Track */
    .outer-track {
        stroke: #374151;
        /* Dark grey/blue track color - Stays the same when active */
        /* Removed transition and active state styles from previous version */
    }

    /* --- HTML Content Overlay --- */
    .button-content {
        position: absolute;
        top: 50%;
        left: 52%;
        transform: translate(-50%, -50%);
        z-index: 3;
        /* Position above SVG elements */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        /* Adjust width */
        pointer-events: none;
        color: #fde047;
        /* Default text/icon color: gold */
    }

    /* Change text color when filled significantly */
    .progress-icon-button .button-content {
        color: v-bind("clampedProgress > 50 ? '#4a0e98' : '#fde047'");
        transition: color 0.3s ease-in-out;
    }


    .icon-placeholder {
        font-size: 30px;
        line-height: 1;
        /* margin-bottom: 4px; */
    }

    .label-text {
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1.1;
        text-align: center;
    }

    .label-text.active {
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1.1;
        text-align: center;
    }

    /* --- START Label --- */
    .start-label {
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fde047;
        color: #1e293b;
        font-size: 0.6rem;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
        z-index: 3;
    }

    .label.active {
        color: white;
        font-weight: 600;


    }

    .label {
        position: absolute;
        bottom: -20px;
        left: 52%;
        transform: translateX(-50%);
        /* background-color: #fde047; */
        /* Yellow background */
        color: #fcfdffd5;
        /* Dark text */
        font-size: 0.7rem;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
    }

</style>