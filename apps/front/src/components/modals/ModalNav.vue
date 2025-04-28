<template>
    <Transition name="modalnav-fade">
        <div id="modalContainer" v-if="showNav" class="modal-nav-container">
            <div>
                <nav v-if="showNav" class="top-nav-bar">
                    <!-- <buttons v-for="item in navItems" :key="item.id"
                        :class="['nav-button', { active: activeViewId === item.id }]" @click="selectItem(item.id)"
                        :aria-label="item.label">
                        <span class="icon-placeholder" aria-hidden="true">{{ item.icon }}</span>
                        <span class="label-text">{{ item.label }}</span>
                        <span v-if="activeViewId === item.id && item.id === 'funmeter'" class="start-label">START</span>
                    </buttons> -->
                    <!-- <GameProgressButton :progress="item.progress" :icon="item.icon" :label="item.label" :isActive="item.isActive" :showStartLabel="item.showStartLabel" 
                    v-for="item in navItems" :key="item.id" /> -->
                    <!-- <CircleButton style="position: relative" v-for="item in navItems" v-bind:key="item.id">
                        <button style=" top: 0; left: 0;  position: absolute"
                            :class="['nav-button', { active: activeViewId === item.id }]" @click="selectItem(item.id)"
                            :aria-label="item.label">
                            <span class="icon-placeholder" aria-hidden="true">{{ item.icon }}</span>
                            <span class="label-text">{{ item.label }}</span>
                            <span v-if="activeViewId === item.id && item.id === 'funmeter'"
                                class="start-label">START</span>
                        </button>

                    </CircleButton> -->
                    <!--  <button @click="selectItem(item.id)">
                        <button :class="['nav-button', { active: activeViewId === 'race' }]"
                            @click="selectItem(item.id)">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M16.6794 5.33368L12.7307 1.97472C12.5092 1.78528 12.2297 1.67697 11.9384 1.66765C11.6471 1.65833 11.3613 1.74855 11.1281 1.92344L9.41661 3.20548L8.3397 2.12857C8.09949 1.88979 7.77455 1.75576 7.43586 1.75576C7.09716 1.75576 6.77222 1.88979 6.53201 2.12857L3.3269 5.36573C2.86914 5.42887 2.44942 5.65473 2.14454 6.00199C1.83967 6.34924 1.67002 6.79466 1.66666 7.25675V16.2311C1.66666 16.7411 1.86926 17.2302 2.22991 17.5909C2.59055 17.9515 3.07969 18.1541 3.58972 18.1541H16.4102C16.9202 18.1541 17.4093 17.9515 17.77 17.5909C18.1306 17.2302 18.3332 16.7411 18.3332 16.2311V7.25675C18.3378 6.79011 18.1726 6.33772 17.8683 5.9839C17.564 5.63009 17.1415 5.39899 16.6794 5.33368ZM17.0512 13.0259H15.7691C15.4291 13.0259 15.103 12.8909 14.8626 12.6504C14.6222 12.41 14.4871 12.0839 14.4871 11.7439C14.4871 11.4039 14.6222 11.0778 14.8626 10.8374C15.103 10.5969 15.4291 10.4619 15.7691 10.4619H17.0512V13.0259ZM11.923 2.94908L14.6794 5.33368H11.5448L10.3333 4.12215L11.923 2.94908ZM7.43586 3.03241L9.73713 5.33368H5.13459L7.43586 3.03241ZM16.4102 16.8721H3.58972C3.41971 16.8721 3.25667 16.8045 3.13645 16.6843C3.01624 16.5641 2.9487 16.4011 2.9487 16.2311V7.25675C2.9487 7.08674 3.01624 6.92369 3.13645 6.80347C3.25667 6.68326 3.41971 6.61572 3.58972 6.61572H16.4102C16.5802 6.61572 16.7432 6.68326 16.8634 6.80347C16.9837 6.92369 17.0512 7.08674 17.0512 7.25675V9.17981H15.7691C15.0891 9.17981 14.4369 9.44996 13.9561 9.93082C13.4752 10.4117 13.2051 11.0639 13.2051 11.7439C13.2051 12.4239 13.4752 13.0761 13.9561 13.557C14.4369 14.0378 15.0891 14.308 15.7691 14.308H17.0512V16.2311C17.0512 16.4011 16.9837 16.5641 16.8634 16.6843C16.7432 16.8045 16.5802 16.8721 16.4102 16.8721Z"
                                    fill="white"></path>
                                <path
                                    d="M15.314 11.2892C15.1969 11.4121 15.1305 11.5746 15.1281 11.7444C15.1281 11.9144 15.1956 12.0774 15.3159 12.1976C15.4361 12.3178 15.5991 12.3854 15.7691 12.3854C15.9391 12.3854 16.1022 12.3178 16.2224 12.1976C16.3426 12.0774 16.4102 11.9144 16.4102 11.7444C16.4109 11.617 16.3737 11.4924 16.3033 11.3863C16.2329 11.2802 16.1325 11.1974 16.015 11.1486C15.8974 11.0998 15.7679 11.0871 15.6431 11.1121C15.5182 11.1372 15.4037 11.1988 15.314 11.2892Z"
                                    fill="white"></path>
                            </svg>
                        </button>
                    </button> -->
                    <!-- </nav> -->
                    <ProgressIconButton2 label="RACE" :progress="raceProgress" :is-active="activeView === 'race'"
                        @click="setActiveView('race')" labelText="race" imageUrl="race" />
                    <ProgressIconButton2 label="CASHBACK" :progress="playbackProgress"
                        :is-active="activeView === 'cashback'" labelText="cashback" :imageUrl
                        @click="setActiveView('cashback')" />
                    <ProgressIconButton2 label="FUNMETER" imageUrl="litening" :progress="funmeterProgress"
                        :is-active="activeView === 'funmeter'" :show-start-label="false"
                        @click="setActiveView('funmeter')" labelText="funmeter" />

                </nav>
                <PlaybackPopup :is-visible="activeView === 'cashback'" :showCashback :activeView />
                <RaceInfoPopup :otherGames="otherGames" :is-visible="activeView === 'race'" :showRace :activeView
                    :mainEvent="event" />

                <FunMeterPopup :is-visible="activeView === 'funmeter'" :current-charge="funMeterCharge" :showMeter
                    :activeView :max-charge="funMeterMaxCharge" @close="hideFunMeterPopup" />
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

import But from './CircleButton.vue';
import RaceInfoPopup from './RacePopup.vue';
import FunMeterPopup from './FunMeterPopup.vue';
import PlaybackPopup from './PlaybackPopup.vue'

// --- Props ---
interface Props {
    // activeViewId: string | null;
    imageUrl: string;
    showNav: boolean// ID of the currently active view ('race', 'playback', 'funmeter')
}



const raceProgress = ref(22);
const playbackProgress = ref(13);
const funmeterProgress = ref(1);
const activeView = ref(''); // Example active state

const setActiveView = (viewId: string) => {
    activeView.value = viewId;
    console.log(`${viewId} button clicked!`);
};


// const props = defineProps<Props>();
const props = withDefaults(defineProps<Props>(), {
    // activeViewId: '',
    showNav: false

});

// --- FunMeter Data ---
const funMeterCharge = ref<number>(50);
const funMeterMaxCharge = ref<number>(200);
const activeViewId = ref<string>('race'); // Keep track of visually active item
const isLevelPopupVisible = ref<boolean>(false);
const showMeter = ref(false)
const showCashback = ref(false)
const showRace = ref(false)
const isVisible = ref(false)
const isFunMeterPopupVisible = ref<boolean>(false);
const showRacePopup = (b?): void => {
    if (!b) {
        showRace.value = b

    } else {
        showRace.value = !props.showNav

    }

};
const hideLevelPopup = (): void => { isLevelPopupVisible.value = false; };


const navItems = [{
    id: 'race',
    // icon: 'mdi-race-horse',
    imageUrl: 'wallet',
    label: 'Race',
    showPopup: showRacePopup,
    popup: RaceInfoPopup,
    popupProps: { show: showRace, hide: hideLevelPopup }
},
{
    id: 'playback', label: 'PLAYBACK',
    imageUrl: 'asdf',
    showPopup: showCashback,
    popup: PlaybackPopup,
    popupProps: { show: showRace, hide: hideLevelPopup }
},
{
    id: 'funmeter',
    imageUrl: 'wallet',
    label: 'Fun Meter',
    popup: FunMeterPopup,

},]

// --- FunMeter Popup Control Methods ---

const hideFunMeterPopup = (): void => { isFunMeterPopupVisible.value = false; };
// --- Methods ---
const selectItem = (id: string): void => {
    console.log(id)
    // Set the visually active item
    activeViewId.value = id;

    // Close any open popups first
    // showRacePopup();
    // hideFunMeterPopup();
    if (id === 'playback') {
        //openLevelProgressPopup()
        showRace.value = false
        isFunMeterPopupVisible.value = false;
        showMeter.value = false
    }
    // Handle specific actions or emit navigation event
    if (id === 'funmeter') {
        // FunMeter might still open as a popup directly from the sidebar
        showRace.value = false
        isFunMeterPopupVisible.value = true;
        showMeter.value = true
        // Optionally emit an event as well if needed elsewhere
        // emit('open-funmeter');
    }
    // Example: Simulate gaining EXP only when 'race' is selected (or based on actual gameplay)
    if (id === 'race') {
        // gainExp(50); // Maybe EXP gain happens in the race view itself?
        showRace.value = true
        isFunMeterPopupVisible.value = false;
        showMeter.value = false

    }
    console.log(`Sidebar item selected: ${id}, Emitting: ${id !== 'funmeter' ? 'navigate' : 'none'}`);

};
const otherGames = ref([])
// --- Emits ---
const emit = defineEmits(['navigate']);
const event = {
    title: "string",
    prize: "string",
    imageUrl: "string",
    timeLeft: "string",
    minLevel: 1,
    plays: 2,
    duration: "string",
    isComingSoon: true,
}
// --- Navigation Item Data ---
interface NavItem {
    id: string;
    label: string;
    icon: string; // Placeholder character/emoji for icon
}
// const navItems = ref<NavItem[]>([
//     { id: 'race', label: 'RACE', icon: '🏆' },
//     { id: 'playback', label: 'PLAYBACK', icon: '▶️' }, // Using play icon for playback
//     { id: 'funmeter', label: 'FUNMETER', icon: '⚡' }, // Using lightning for funmeter
// ]);

// --- Methods ---

</script>

<style scoped>

    .modal-nav-container {
        display: flex;
        margin-left: 40vw;
        top: 0px;
        flex-direction: column;
        justify-content: space-between;
        height: 95vh;
        min-height: 95vh;
        min-width: 30vw;
        /* padding-left: 60px; */
        /* background-color: #1e293b; */
        color: white;
        justify-content: start;
        align-items: center;
        /* padding: 0 15px; */
        box-sizing: border-box;
        position: relative;
    }

    /* .modal-nav-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        cursor: pointer;
    }

    .modal-nav-item:hover {
        background-color: #475569;
    }

    .modal-nav-item.active {
        background-color: #475569;
    } */
    .top-nav {
        align-items: flex-start;
        bottom: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        left: 16px;
        max-height: calc(100dvh - 80px);
        max-width: 343px;
        overflow: auto;
        position: fixed;
        right: 16px;
        top: 72px;
        z-index: 3;
        flex-direction: column;

    }

    .top-nav-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        /* Center buttons horizontally */
        align-items: center;
        background-color: #0d0e2d;
        /* padding: 10px; */
        padding-top: 8px;
        padding-bottom: 20px;
        min-width: 30vw;
        /* Dark slate background from image */
        /* padding: 8px 15px; */
        border-radius: 12px;
        /* Rounded corners for the bar */
        /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); */
        /* Space below the nav bar */
        /* Position relative if START label needs absolute positioning relative to button */
    }

    .nav-button {
        background-color: #4a0e98;
        /* Dark purple background for buttons */
        color: #e2e8f0;
        /* Light text */
        border: 2px solid transparent;
        /* Base border */
        border-radius: 50%;
        /* Circular buttons */
        width: 50px;
        /* Fixed width */
        height: 50px;
        /* Fixed height */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
        margin: 0 10px;
        /* Space between buttons */
        position: relative;
        /* For positioning the START label */
        padding: 5px;
        /* Inner padding */
        /* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); */
    }

    .nav-button:hover {
        /* background-color: #581c87; */
        /* Slightly lighter purple on hover */
        transform: translateY(-1px);
    }

    .nav-button.active {
        background-color: #fde047;
        /* Bright yellow/gold border for active */
        /* background-color: #581c87; */
        /* Keep hover color or make distinct active color */
        /* box-shadow: 0 0 10px rgba(253, 224, 71, 0.6); */
        /* Yellow glow */
    }

    .icon-placeholder {
        font-size: 1.8rem;
        /* Size of the icon */
        margin-bottom: 3px;
        line-height: 1;
    }

    .label-text {
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
        line-height: 1;
    }

    .label {
        position: absolute;
        bottom: 0px;
        /* Position below the button */
        left: 50%;
        transform: translateX(-50%);
        /* background-color: #fde047; */
        /* Yellow background */
        color: white;
        /* Dark text */
        font-size: 0.6rem;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
    }

    /* Style for the "START" label on active FunMeter button */
    .start-label {
        position: absolute;
        bottom: -8px;
        /* Position below the button */
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
    }

    .modalnav-fade-enter-active,
    .modalnav-fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .modalnav-fade-enter-from,
    .modalnav-fade-leave-to {
        opacity: 0;
    }

    .modalnav-fade-enter-active .modalnav-content,
    .modalnav-fade-leave-active .modalnav-content {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .modalnav-fade-enter-from .modalnav-content,
    .modalnav-fade-leave-to .modalnav-content {
        opacity: 0;
        transform: scale(0.95);
    }


</style>