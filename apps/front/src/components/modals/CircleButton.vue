<template>
    <button class="progress-start-button" type="button" aria-label="Start button with progress indicator">
        <svg style="top: 0; left: 0; position: absolute" class="button-svg" :viewBox="`0 0 ${svgSize} ${svgSize}`">
            <circle style="background: transparent; top: 0; left: 0; position: absolute" class="inner-circle"
                :cx="center" :cy="center" :r="innerRadius" fill="none" />
            <!-- </circle> -->
            <slot />
            <circle style="top: 0; left: 0; position: absolute" class="outer-track" :cx="center" :cy="center"
                :r="outerRadius" :stroke-width="strokeWidth" fill="none" />

            <circle style=" top: 0; left: 0;  position: absolute" class="outer-progress" :cx="center" :cy="center"
                :r="outerRadius" :stroke-width="strokeWidth" :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset" fill="none" :transform="`rotate(-90 ${center} ${center})`" />
            <!-- <text class="button-text" :x="center" :y="center" dominant-baseline="central" text-anchor="middle">
                START
            </text>  -->
        </svg>

    </button>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';

// --- Props ---
interface Props {
    progress?: number; // Progress percentage (0-100)
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
    progress: 0, // Default to 0% progress
});

// --- SVG Dimensions and Calculations ---
const svgSize = 100; // ViewBox size (can be scaled by parent CSS)
const strokeWidth = 8; // Width of the outer progress ring
const center = svgSize / 2;
const outerRadius = (svgSize / 2) - (strokeWidth / 2); // Radius for the outer rings
const innerRadius = outerRadius - (strokeWidth / 2) - 2; // Radius for inner circle (adjust gap: -2)
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
    .progress-start-button {
        /* Reset button defaults */
        background: none;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        display: inline-block;
        /* Allow setting width/height */
        width: 50px;
        /* Default size, can be overridden */
        height: 50px;
        position: relative;
        /* If needed for pseudo-elements or tooltips */
        transition: transform 0.1s ease;
        /* Add slight press effect */
    }

    .progress-start-button:active {
        transform: scale(0.97);
        /* Press down effect */
    }

    .button-svg {
        display: block;
        /* Remove extra space below SVG */
        width: 100%;
        height: 100%;
        overflow: visible;
        /* Allow potential stroke glow to show */
    }

    /* 1. Inner Purple Circle */
    .inner-circle {
        /* fill: #6d28d9; */
        /* Purple color from image */
    }

    /* 2. Outer Ring Background Track */
    .outer-track {
        stroke: #374151;
        /* Dark grey/blue track color */
    }

    /* 3. Outer Ring Progress Fill */
    .outer-progress {
        stroke: #facc15;
        /* Yellow/gold progress color */
        stroke-linecap: round;
        /* Optional: makes the start/end of the progress arc rounded */
        transition: stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1);
        /* Smooth animation */
        filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5));
        /* Subtle glow */
    }

    /* 4. "START" Text */
    .button-text {
        fill: #facc15;
        /* Yellow/gold text color */
        font-size: 20px;
        /* Adjust font size as needed */
        font-weight: bold;
        text-transform: uppercase;
        font-family: sans-serif;
        /* Choose a suitable font */
        /* Prevent text selection */
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
</style>