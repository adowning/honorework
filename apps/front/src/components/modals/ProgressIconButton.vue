<template>
    <div class="button-wrapper">
        <button class="progress-icon-button" :class="{ active: isActive }" type="button" :aria-label="label">
            <svg class="button-svg" :viewBox="`0 0 ${svgSize} ${svgSize}`">
                <circle class="inner-circle" :cx="center" :cy="center" :r="innerRadius" />
                <circle class="outer-track" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth"
                    fill="none" />
                <circle class="outer-progress" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth"
                    :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset" fill="none"
                    :transform="`rotate(-90 ${center} ${center})`" />
            </svg>

            <div class="button-content">
                <span class="icon-placeholder" aria-hidden="true">{{ icon }}</span>
                <span class="label-text">{{ label }}</span>
            </div>
        </button>

        <span v-if="isActive && showStartLabel" class="start-label">START</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';

// --- Props ---
interface Props {
    progress?: number; // Progress percentage (0-100)
    icon?: string; // Placeholder icon character/emoji
    label?: string; // Button label text
    isActive?: boolean; // Controls active state styling (e.g., border)
    showStartLabel?: boolean; // Controls visibility of the 'START' label below (used with isActive)
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
    progress: 0,
    icon: '?',
    label: 'Button',
    isActive: false,
    showStartLabel: false,
});

// --- SVG Dimensions and Calculations ---
// Reusing calculations from ProgressStartButton
const svgSize = 100;
const strokeWidth = 8;
const center = svgSize / 2;
const outerRadius = (svgSize / 2) - (strokeWidth / 2);
// Make inner radius slightly smaller to accommodate content better
const innerRadius = outerRadius - strokeWidth;
const circumference = computed(() => 2 * Math.PI * outerRadius);

// Clamp progress value between 0 and 100
const clampedProgress = computed(() => {
    return Math.min(Math.max(props.progress, 0), 100);
});

// Calculate SVG stroke offset for the progress ring
const strokeDashoffset = computed(() => {
    return circumference.value * (1 - clampedProgress.value / 100);
});

</script>

<style scoped>

    /* Wrapper to contain button and potential 'START' label */
    .button-wrapper {
        position: relative;
        display: inline-block;
        /* Fit content */
        width: 100px;
        /* Default size, matches button */
        height: 100px;
    }

    .progress-icon-button {
        /* Reset button defaults */
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        display: block;
        /* Use block to fill wrapper */
        width: 100%;
        height: 100%;
        position: relative;
        /* Needed for positioning content overlay */
        transition: transform 0.1s ease;
        border-radius: 50%;
        /* Ensure interactions respect circle */
    }

    .progress-icon-button:active {
        transform: scale(0.97);
    }

    .button-svg {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        /* Position SVG behind HTML content */
        top: 0;
        left: 0;
        z-index: 1;
        overflow: visible;
    }

    /* --- SVG Styles --- */
    .inner-circle {
        fill: #4a0e98;
        /* Darker Purple for inner circle */
        transition: fill 0.2s ease;
    }

    .progress-icon-button.active .inner-circle {
        fill: #581c87;
        /* Slightly lighter purple when active */
    }

    .outer-track {
        stroke: #374151;
        /* Dark grey/blue track color */
        transition: stroke 0.2s ease;
    }

    /* Active state changes track color to yellow */
    /* .progress-icon-button.active .outer-track {
        stroke: #facc15;
        filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.6));
    } */
    .progress-icon-button.active .inner-circle-base {
        filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.7));
        /* Yellow glow */
    }

    .progress-icon-button.active .inner-circle-fill {
        filter: drop-shadow(10 10 16px rgba(250, 204, 21, 0.7));
        /* Yellow glow */
    }


    .outer-progress {
        stroke: #facc15;
        /* Yellow/gold progress color */
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1);
        /* Glow effect only when NOT active (active state glow is on the track) */
        filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5));
    }

    .progress-icon-button.active .outer-progress {
        filter: none;
        /* Remove individual progress glow if track has glow */
    }


    /* --- HTML Content Overlay --- */
    .button-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        /* Position above SVG */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 80%;
        /* Prevent content from hitting edges */
        pointer-events: none;
        /* Allow clicks to pass through to the button */
        color: #fde047;
        /* Default text/icon color: gold */
    }

    .icon-placeholder {
        font-size: 28px;
        /* Adjust icon size */
        line-height: 1;
        margin-bottom: 4px;
    }

    .label-text {
        font-size: 11px;
        /* Adjust label size */
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1.1;
        text-align: center;
    }

    /* --- START Label (Copied from TopNavBar) --- */
    .start-label {
        position: absolute;
        bottom: -12px;
        /* Adjust position below the button */
        left: 50%;
        transform: translateX(-50%);
        background-color: #fde047;
        /* Yellow background */
        color: #1e293b;
        /* Dark text */
        font-size: 0.6rem;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
        z-index: 3;
        /* Above button */
    }

</style>