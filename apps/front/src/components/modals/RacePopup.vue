<template>
    <Transition name="popup-fade">
        <div v-if="activeView === 'race'" class="race-view-container">
            <h1 class="race-view-header">TO THE RACE</h1>

            <div class="race-content-area">
                <div class="race-card main-event-card">
                    <div class="coming-soon-banner">COMING SOON</div>

                    <!-- <img src="" alt="Twilight Clash" class="event-image" /> -->
                    <div class="event-details">
                        <h2 class="event-title">TWILIGHT CLASH</h2>
                        <div class="prize-pool">1,000,000</div>

                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Time left</span>
                                <span class="info-value">02 H 40 M 23 S</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Min play level</span>
                                <span class="info-value">100</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Plays</span>
                                <span class="info-value">2000</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Duration</span>
                                <span class="info-value">13 h 58 m</span>
                            </div>
                        </div>

                        <button class="show-prizes-button">Show prizes</button>
                        <button class="lobby-button">Lobby</button>
                    </div>
                </div>

                <div class="other-games-section">
                    <div class="race-card game-card">
                        <h3 class="game-title">GALAXY FISHING</h3>
                        <span class="game-type">FISH TABLE</span>
                        <div class="game-icons">
                            <span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span>
                            <span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span>
                        </div>
                    </div>
                    <div class="race-card game-card">
                        <h3 class="game-title">FISH TABLE</h3>
                        <span class="game-type">FISH TABLE 3</span>
                        <div class="game-icons">
                            <span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span>
                            <span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span>
                        </div>
                    </div>
                    <button class="quick-play-button">QUICK PLAY</button>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
// This component might receive props for the race data in a real application
// For now, it uses static placeholder content based on the image.

// Example Props structure (if needed later)

interface RaceEvent {
    title?: string;
    prize?: string | number;
    imageUrl?: string;
    timeLeft: string;
    minLevel?: number;
    plays?: number;
    duration?: string;
    isComingSoon?: boolean;
}

interface GameInfo {
    title: string;
    type: string;
    // other relevant info
}

interface Props {
    mainEvent: RaceEvent;
    otherGames: GameInfo[];
    showRace: boolean;
    activeView: string

}

// const props = defineProps<Props>();
const props = withDefaults(defineProps<Props>(), {
    // currentCharge: 30,
    // maxCharge: 65,
    // showMeter: false,
    activeView: ''
});

</script>

<style scoped>
    .race-view-container {
        /* position: relative; */
        position: absolute;

        /* margin-left: 1000px;
        margin-bottom: 500px; */
        /* padding: 20px; */
        /* Example background - replace with your actual game background */
        background: #1a2035 url('/placeholder-images/space-background.jpg') center center / cover no-repeat;
        color: white;
        height: 100%;
        /* padding-top: 60px; */
        max-height: 100%;
        /* Adjust as needed for layout */
        overflow-y: auto;
        /* Allow scrolling if content exceeds height */
    }

    .race-view-header {
        text-align: center;
        font-size: 1.5rem;
        color: #e0e0e0;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: bold;
    }

    .race-content-area {
        display: flex;
        gap: 20px;
        /* Space between left and right sections */
        align-items: flex-start;
        /* Align items to the top */
    }

    /* --- Base Card Style --- */
    .race-card {
        background: rgba(42, 58, 102, 0.8);
        /* Semi-transparent dark blue */
        border: 1px solid rgba(111, 173, 222, 0.5);
        /* Light blue border */
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        /* For absolute positioning like the banner */
        overflow: hidden;
        /* Ensure banner stays within bounds */
    }

    /* --- Main Event Card (Left) --- */
    .main-event-card {
        flex: 2;
        /* Take more space */
        display: flex;
        flex-direction: column;
        background: linear-gradient(145deg, rgba(40, 50, 90, 0.85), rgba(60, 70, 110, 0.9));
    }

    .coming-soon-banner {
        position: absolute;
        top: 15px;
        left: -35px;
        /* Position outside the card */
        background-color: #ec4899;
        /* Pink color */
        color: white;
        padding: 5px 40px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        transform: rotate(-45deg);
        /* Rotate the banner */
        transform-origin: top left;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
    }

    .event-image {
        width: 100%;
        height: 150px;
        /* Adjust height as needed */
        object-fit: cover;
        /* Cover the area */
        border-radius: 10px;
        margin-bottom: 15px;
        border: 2px solid #ec4899;
        /* Pink border */
    }

    .event-image-placeholder {
        /* Fallback style */
        width: 100%;
        height: 150px;
        background-color: #334155;
        border-radius: 10px;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
    }


    .event-details {
        text-align: center;
    }

    .event-title {
        font-size: 1.3rem;
        font-weight: bold;
        color: #facc15;
        /* Gold color */
        margin-bottom: 5px;
        text-transform: uppercase;
    }

    .prize-pool {
        font-size: 1.1rem;
        font-weight: bold;
        color: #ffffff;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 3px 8px;
        border-radius: 5px;
        display: inline-block;
        margin-bottom: 15px;
    }

    .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        /* Two columns */
        gap: 10px 15px;
        /* Row and column gap */
        margin-bottom: 20px;
        text-align: left;
        font-size: 0.85rem;
    }

    .info-item {
        display: flex;
        flex-direction: column;
    }

    .info-label {
        color: #a0aec0;
        /* Lighter grey */
        font-size: 0.75rem;
        margin-bottom: 2px;
    }

    .info-value {
        color: #ffffff;
        font-weight: bold;
    }

    .show-prizes-button,
    .lobby-button {
        background: none;
        border: 1px solid #6faede;
        /* Light blue border */
        color: #6faede;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: bold;
        transition: background-color 0.2s ease, color 0.2s ease;
        margin: 0 5px;
    }

    .show-prizes-button:hover,
    .lobby-button:hover {
        background-color: rgba(111, 173, 222, 0.2);
        color: #ffffff;
    }

    /* --- Other Games Section (Right) --- */
    .other-games-section {
        flex: 1;
        /* Take less space */
        display: flex;
        flex-direction: column;
        gap: 15px;
        /* Space between game cards */
    }

    .game-card {
        background: linear-gradient(145deg, rgba(20, 30, 60, 0.8), rgba(30, 40, 70, 0.85));
        padding: 15px;
        text-align: center;
    }

    .game-title {
        font-size: 1rem;
        font-weight: bold;
        color: #e0e0e0;
        margin-bottom: 3px;
        text-transform: uppercase;
    }

    .game-type {
        font-size: 0.75rem;
        color: #a0aec0;
        margin-bottom: 10px;
        display: block;
    }

    .game-icons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        /* 4 icons per row */
        gap: 5px;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 8px;
    }

    .game-icons span {
        font-size: 1.2rem;
        /* Adjust icon size */
        /* Placeholder styling for dice/88 */
        background-color: #1e40af;
        /* Dark blue background */
        color: #60a5fa;
        /* Light blue icon color */
        border-radius: 5px;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .quick-play-button {
        background: linear-gradient(to bottom, #22c55e, #16a34a);
        /* Green gradient */
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        text-transform: uppercase;
        margin-top: auto;
        /* Push to bottom if container has extra space */
    }

    .quick-play-button:hover {
        background: linear-gradient(to bottom, #4ade80, #22c55e);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    }

    /* Responsive adjustments if needed */
    @media (max-width: 768px) {
        .race-content-area {
            flex-direction: column;
        }

        .main-event-card,
        .other-games-section {
            flex: none;
            /* Reset flex basis */
            width: 100%;
            /* Take full width on smaller screens */
        }
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