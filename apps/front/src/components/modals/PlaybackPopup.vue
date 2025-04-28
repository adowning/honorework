<template>
    <Transition name="popup-fade">
        <div v-if="activeView == 'cashback'" class="popup-overlay" @click.self="closePopup" role="dialog"
            aria-modal="true" aria-labelledby="playback-popup-title">
            <div class="popup-content">
                <div class="timer-status">
                    Claim in {{ formattedClaimTime }}
                </div>

                <h2 id="playback-popup-title" class="popup-title">DAILY PLAYBACK</h2>

                <p class="popup-subtitle">
                    Play today, coins back tomorrow!
                </p>

                <div class="image-placeholder-wrapper">
                    <div class="image-placeholder">
                        <span class="placeholder-text">[Wallet Image Placeholder]</span>
                        <div class="status-tag-placeholder">
                            <span class="percentage">{{ percentage }}%</span>
                            <span class="tag-text">STATUS<br />REWARD</span>
                        </div>
                    </div>
                </div>

                <div class="max-reward-section">
                    <span class="max-reward-label">Max reward</span>
                    <div class="reward-values">
                        <div class="reward-item">
                            <span class="reward-icon">💰</span> <span class="reward-value">{{
                                formatNumber(maxCoinReward) }}</span>
                        </div>
                        <div class="reward-item">
                            <span class="reward-icon cash-icon">💎</span> <span class="reward-value">{{
                                formatNumber(maxCashReward) }}</span>
                        </div>
                    </div>
                </div>

                <button class="how-it-works-link" @click="handleHowItWorks">
                    How It Works
                </button>

                <button class="lobby-button" @click="handleLobbyClick">
                    Lobby
                </button>

            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

// --- Props ---
interface Props {
    showCashback: boolean;
    claimTime?: string | number; // Can be pre-formatted string or seconds for countdown
    maxCoinReward?: number;
    maxCashReward?: number;
    percentage?: number;
    activeView: string

}

const props = withDefaults(defineProps<Props>(), {
    showCashback: false,
    claimTime: '13 H 02 M 28 S', // Default from image
    maxCoinReward: 100000,
    maxCashReward: 10000,
    percentage: 5,
    activeView: ''

});

// --- Emits ---
const emit = defineEmits(['close', 'how-it-works', 'lobby-click']);

// --- Computed ---
// Basic formatting for claim time (can be expanded if needed)
const formattedClaimTime = computed(() => {
    // If claimTime is a number (seconds), you could format it here
    // For now, just return the prop value assuming it's pre-formatted
    return props.claimTime;
});

// Helper to format large numbers (optional)
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
};

// --- Methods ---
const closePopup = (): void => {
    emit('close');
};

const handleHowItWorks = (): void => {
    console.log('How It Works clicked');
    emit('how-it-works');
    // Decide if this should close the popup or open another modal/link
};

const handleLobbyClick = (): void => {
    console.log('Lobby clicked');
    emit('lobby-click');
    closePopup(); // Close the popup when Lobby is clicked
};

</script>

<style scoped>

    /* --- Base Overlay and Content Styles --- */
    .popup-overlay {
        position: relative;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 10px;
    }

    .popup-content {
        background-color: #0F172A;
        /* Very dark blue/black background */
        color: white;
        padding: 20px 25px 25px 25px;
        /* Adjust padding */
        border-radius: 15px;
        border: 1px solid rgba(71, 85, 105, 0.6);
        /* Subtle slate border */
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
        position: relative;
        width: 100%;
        max-width: 380px;
        /* Adjust max width */
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* --- Timer/Status Text --- */
    .timer-status {
        background-color: rgba(255, 255, 255, 0.1);
        /* Light background */
        color: #e2e8f0;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 4px 10px;
        border-radius: 15px;
        /* Pill shape */
        margin-bottom: 15px;
        display: inline-block;
        /* Fit content */
    }

    /* --- Title & Subtitle --- */
    .popup-title {
        font-size: 1.4rem;
        font-weight: bold;
        color: #ffffff;
        /* White title */
        margin-bottom: 5px;
        text-transform: uppercase;
    }

    .popup-subtitle {
        font-size: 0.9rem;
        color: #94a3b8;
        /* Lighter grey/blue text */
        margin-bottom: 25px;
    }

    /* --- Image Placeholder --- */
    .image-placeholder-wrapper {
        margin-bottom: 20px;
        position: relative;
        /* For positioning the tag */
        width: 150px;
        /* Example width */
        height: 120px;
        /* Example height */
    }

    .image-placeholder {
        width: 100%;
        height: 100%;
        background-color: #334155;
        /* Placeholder background */
        border: 1px dashed #64748b;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        font-size: 0.8rem;
    }

    .placeholder-text {
        padding: 10px;
    }

    /* Tag Placeholder */
    .status-tag-placeholder {
        position: absolute;
        top: 10px;
        /* Adjust position */
        right: -15px;
        /* Adjust position */
        background-color: #16a34a;
        /* Green background */
        color: white;
        padding: 8px 10px;
        border-radius: 6px;
        text-align: center;
        line-height: 1.1;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
        transform: rotate(5deg);
        /* Slight rotation */
    }

    .percentage {
        display: block;
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 2px;
    }

    .tag-text {
        display: block;
        font-size: 0.6rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    /* --- Max Reward Section --- */
    .max-reward-section {
        margin-bottom: 15px;
        width: 100%;
    }

    .max-reward-label {
        font-size: 0.9rem;
        color: #cbd5e1;
        margin-bottom: 8px;
        display: block;
    }

    .reward-values {
        display: flex;
        justify-content: center;
        gap: 30px;
        /* Space between reward items */
    }

    .reward-item {
        display: flex;
        align-items: center;
        gap: 6px;
        /* Space between icon and value */
    }

    .reward-icon {
        font-size: 1.4rem;
        /* Icon size */
    }

    .cash-icon {
        /* Optional: different color/style for cash/gem */
        filter: hue-rotate(100deg);
        /* Example to make emoji greenish */
    }

    .reward-value {
        font-size: 1.1rem;
        font-weight: bold;
        color: #ffffff;
    }

    /* --- How It Works Link --- */
    .how-it-works-link {
        background: none;
        border: none;
        color: #60a5fa;
        /* Light blue */
        font-size: 0.9rem;
        font-weight: bold;
        text-decoration: underline;
        cursor: pointer;
        margin-bottom: 25px;
        /* Space before Lobby button */
        padding: 5px;
        transition: color 0.2s ease;
    }

    .how-it-works-link:hover {
        color: #93c5fd;
        /* Lighter blue */
    }

    /* --- Lobby Button --- */
    .lobby-button {
        background-color: #1e293b;
        /* Dark slate background */
        color: #94a3b8;
        /* Muted text color */
        border: 1px solid #334155;
        /* Subtle border */
        border-radius: 8px;
        padding: 10px 40px;
        /* Wider padding */
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease;
        text-transform: uppercase;
    }

    .lobby-button:hover {
        background-color: #334155;
        /* Slightly lighter */
        color: #e2e8f0;
        /* Brighter text */
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