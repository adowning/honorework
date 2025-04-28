<script setup lang="ts">
import { computed, watch, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";
import { useVipStore } from "@/stores/vip";
import { useRefferalStore } from "@/stores/refferal";
import { useAppBarStore } from "@/stores/appBar";
import SuccessIcon from "@/components/icons/SuccessIcon.vue";
import WarningIcon from "@/components/icons/WarningIcon.vue";
import { UButton, UFormGroup, UInput, UListbox, UDropdown, URadio, UCheckbox, UModal } from 'nuxt-ui-pro/dist/runtime/types';
import { useToast } from "vue-toastification";
import { useBannerStore } from "@/stores/banner";
import { useCurrencyStore } from "@/stores/currency";


const props = defineProps<{}>();
const emit = defineEmits(["close", "switch"]);
const mailOptions = [
  { value: 'gmail.com', label: 'gmail.com' },
  { value: 'hotmail.com', label: 'hotmail.com' },
  { value: 'yahoo.com', label: 'yahoo.com' },
  { value: 'icloud.com', label: 'icloud.com' },
  { value: 'outlook.com', label: 'outlook.com' }
];
const selectedMail = ref();
const { dispatchSignIn, dispatchUserProfile, setAuthModalType, setAuthDialogVisible, getSuccess, getErrMessage } = authStore;
const userStore = useUserStore()
const authStore = useAuthStore()
const appBarStore = useAppBarStore()
const refferalStore = useRefferalStore()
const socketStore = useSocketStore()
const currencyStore = useCurrencyStore()
const vipStore = useVipStore()
const { dispatchUserBalance } = userStore;
const { dispatchVipInfo, dispatchVipLevels, dispatchVipLevelAward } = vipStore;
const { setOverlayScrimShow } = appBarStore;
const { setRefferalDialogShow } = refferalStore;
const { dispatchSocketConnect } = socketStore;
const { dispatchCurrencyList } = currencyStore

const currentPage = ref(0); // default login form
const PAGE_TYPE = ref({
  LOGIN_FORM: 0,
  FORGOT_PASSWORD: 1,
});
const emailAddress = ref("");
const password = ref("");
const socialIconList = ref([
  new URL("@/assets/public/svg/icon_public_28.svg", import.meta.url).href,
  new URL("@/assets/public/svg/icon_public_29.svg", import.meta.url).href,
  new URL("@/assets/public/svg/icon_public_30.svg", import.meta.url).href,
  new URL("@/assets/public/svg/icon_public_31.svg", import.meta.url).href,
]);
const isShowPassword = ref(false);
const notificationShow = ref(false);
const { isLoading, withLoading, stopLoading } = useLoading()

const checkIcon = ref(new URL("@/assets/public/svg/icon_public_18.svg", import.meta.url).href);
const notificationText = ref("notification");
const mailCardHeight = ref(0);
const emailPartName = ref("");
const closeBtnHeight = ref(0);
const containerHeight = ref<number | undefined>(0);
const bodyHeight = ref(0);
const formData = reactive({
  username: 'ash',
  password: 'asdfasdf',
  confirm: 'asdfasdf',
  faceIndex: 0,
  loginErr: '',
  passwErr: '',
  agentCode: '',
})

const mobileWidth = computed(() => window.innerWidth);

const isFormDataReady = computed(() =>
 formData.username.length > 0 && formData.password.length > 0
);

const success = computed(() => getSuccess);
const errMessage = computed(() => getErrMessage);

const handleForgotPassword = () => {
  const toast = useToast();
  toast.success("notification", {
    timeout: 3000,
    closeOnClick: false,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
    draggable: false,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: SuccessIcon,
    rtl: false,
  });
  currentPage.value = PAGE_TYPE.value.LOGIN_FORM;
};

const handleLoginFormSubmit = async () => {
 isLoading.value = true;

  await dispatchSignIn({
    username: emailAddress.value,
    password: password.value,
  });

  if (success.value) {
    await dispatchUserProfile();
    await dispatchUserBalance();
    await dispatchCurrencyList();
    await dispatchVipInfo();
    await dispatchVipLevels();
    await dispatchVipLevelAward();
    setOverlayScrimShow(false);
    setRefferalDialogShow(true);
    const toast = useToast();
    toast.success("success_text", {
      timeout: 3000,
      closeOnClick: false,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      showCloseButtonOnHover: false,
      hideProgressBar: true,
      closeButton: "button",
      icon: SuccessIcon,
      rtl: false,
    });
    setTimeout(() => {
      setAuthModalType("");
      setAuthDialogVisible(false);
    }, 100);
    await dispatchSocketConnect();
  } else {
    const toast = useToast();
    toast.success("err_text", {
      timeout: 3000,
      closeOnClick: false,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      showCloseButtonOnHover: false,
      hideProgressBar: true,
      closeButton: "button",
      icon: WarningIcon,
      rtl: false,
    });
  }

  isLoading.value = false;
};

const showPassword = () => {
  isShowPassword.value = !isShowPassword.value;
};

const handleEmailBlur = () => {
  setTimeout(() => {
    mailCardHeight.value = 0;
  }, 100);
};

const handleEmailChange = () => {
  if (emailAddress.value.includes("@")) {
    emailPartName.value = emailAddress.value.split("@")[0];
    mailCardHeight.value = 220;
  } else {
    setTimeout(() => {
      mailCardHeight.value = 0;
    }, 100);
  }
};

const mergeEmail = (email: string) => {
  if(formData.username.includes('@')){
    formData.username = formData.username.split("@")[0] + '@' + email;
  }
  else {
    formData.username = formData.username + '@' + email;
  }
  setTimeout(() => {
    mailCardHeight.value = 0;
  }, 100);
};

const selectMail = (email: string) => {
  if(emailAddress.value.includes('@')){
    emailAddress.value = emailAddress.value.split("@")[0] + '@' + email;
  }
  else {
    emailAddress.value = emailAddress.value + '@' + email;
  }
  setTimeout(() => {
    mailCardHeight.value = 0;
  }, 100);
};

watch(
  mobileWidth,
  (newValue) => {
    containerHeight.value = window.innerHeight - 54;
    bodyHeight.value = window.innerHeight - 194;
  }
);
</script>

<script lang="ts">
export default {
  components: {
    SuccessIcon,
    WarningIcon,
  },
};
</script>

<template>
  <div class="m-login-container px-6">
    <div class="my-15 d-flex justify-center align-center">
      <img src="@/assets/public/image/logo_public_01.png" width="86" alt="logo" />
      <div class="ml-2">
        <div class="text-800-16 text-white">
          signup.formPage.header.titleLine1
        </div>
        <div class="text-900-20 text-white">
          signup.formPage.header.titleLine2
        </div>
      </div>
    </div>

    <template v-if="currentPage === PAGE_TYPE.value.LOGIN_FORM">
      <UFormGroup class="relative mt-8" :label="'signup.formPage.emailAddress'">
        <UInput type="email"
                class="form-textfield dark-textfield m-login-email mx-0"
                v-model="emailAddress"
                :onblur="handleEmailBlur"
                @input="handleEmailChange"
                 />
        <div class="m-login-mail-card" :style="{ height: mailCardHeight + 'px' }" v-if="mailCardHeight">
          <UDropdown :options="mailOptions" :popper="{ placement: 'bottom-start' }" class="dark-dropdown-list">
            <template #item="{ option }">
             <div class="text-600-12 white" @click="selectMail(option.value)" >{{emailPartName}}@{{option.value}}</div>
            </template>
          </UDropdown>
        </div>
      </UFormGroup>
      <UFormGroup class="mt-6 relative pa-0" :label="'signup.formPage.password'">
        <UInput
          class="form-textfield dark-textfield ma-0 m-login-password"
          :type="isShowPassword ? 'text' : 'password'""
          v-model="password"
        />
          <div v-if="isShowPassword" @click="showPassword" class="m-password-icon" >
          <img 
            src="@/assets/public/svg/icon_public_07.svg"
            class="m-disable-password"
            width="16"
            alt="show password"
          />
        </div>
        <div v-else @click="showPassword" class="m-password-icon">
          <img
            src="@/assets/public/svg/icon_public_06.svg"
            class="m-disable-password"
            width="16"
            alt="hide password"
          />
        </div>
      </UFormGroup>
      <div class="mt-2 flex">
        <p class="ml-9 login-forget-passwrod-text text-400-12" @click="currentPage = PAGE_TYPE.value.FORGOT_PASSWORD">
          login.formPage.forgetPassword
        </p>
      </div>
      <div class="mt-10">
        <UButton class="w-full button-bright m-signin-btn-text" :loading="loading" :disabled="!isFormDataReady" @click="handleLoginFormSubmit">
          login.formPage.button
        </UButton>
      </div>
      <div class="mt-4 flex items-center">
        <p class="m-divide-text">
          signup.formPage.divider
        </p>
        <div class="mx-10 h-[1px] w-full" style="border: 1px solid #414968 !important"/>
      </div>
      <div class="mt-6">
        <div class="flex justify-around bg-surface-variant social-icon-wrapper">
          <div v-for="(item, index) in socialIconList" :key="index" class="rounded-md bg-[#131828]">
            <UButton color="gray" variant="solid" class="m-social-icon-button" :padded="false">
              <img :src="item" width="36" alt="social icon" />
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Forgot password -->

    <template v-if="currentPage == PAGE_TYPE.value.FORGOT_PASSWORD">
      <UFormGroup class="relative mt-8" :label="'signup.formPage.emailAddress'">
        <UInput type="email"
                class="form-textfield dark-textfield m-login-forgot"
                v-model="emailAddress"
                :onblur="handleEmailBlur"
                @input="handleEmailChange"
                :onfocus="handleEmailFocus" />
        <div class="m-forgot-mail-card" :style="{ height: mailCardHeight + 'px' }">
           <UDropdown :options="mailOptions" v-model="selectedMail" :popper="{ placement: 'bottom-start' }" class="dark-dropdown-list">
            <template #item="{ option }">
             <div class="text-600-12 white" @click="selectMail(option.value)" >{{emailPartName}}@{{option.value}}</div>
            </template>
          </UDropdown>
        </div>
      </UFormGroup>
      <div class="mt-10">
        <UButton class="ma-3 w-full button-bright m-signin-btn-text" @click="handleForgotPassword">
          login.forgotPasswordPage.submit
        </UButton>
      </div>
      <div>
        <UButton class="ma-3 w-full m-forgot-back-btn" @click="currentPage = PAGE_TYPE.value.LOGIN_FORM">
          login.forgotPasswordPage.back_text
        </UButton>
      </div>
       <div class="mt-4 flex items-center">
        <p class="m-divide-text">
          signup.formPage.divider
        </p>
        <div class="mx-10 h-[1px] w-full" style="border: 1px solid #414968 !important"/>
      </div>
      <div class="mt-6">
        <div class="flex justify-around bg-surface-variant social-icon-wrapper">
          <div v-for="(item, index) in socialIconList" :key="index" class="rounded-md bg-[#131828]">
            <UButton color="gray" variant="solid" class="m-social-icon-button" :padded="false">
              <img :src="item" width="36" alt="social icon" />
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@media (max-width: 600px) {

  input {
      padding-top: 6px !important;
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
  }
}

.dark-dropdown-list{
  .dropdown-list{
    background-color: #1d2027;
  }
}

.m-forgot-back-btn {
  background: #23262f;
  box-shadow: 0px 4px 6px 1px #0000004d;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-weight: 700;
    line-height: 17px;
    letter-spacing: 0em;
    text-align: center;
    color: #ffffff;
}

.m-login-mail-card {
  position: absolute;
  top: 42px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d2027;
  width: 100%;
  border-radius: 16px;
  z-index: 200;
  overflow: hidden;
  transition: height 0.3s ease-out;
}

.m-forgot-mail-card {
  position: absolute;
  top: 55px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d2027;
  width: calc(100% - 48px);
  border-radius: 16px;
  z-index: 200;
  overflow: hidden;
  transition: height 0.3s ease-out;
}


.m-signin-btn-text {
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
}

.m-password-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 50px;
  height: 40px;
}

.m-disable-password {
  position: absolute;
  top: 16px;
  right: 10px;
  cursor: pointer;
}

// container
.m-login-container {
  width: 100%;
  background: $color_1;
  overflow-y: auto;
  height: calc(100vh - 50px);
}

.m-login-container::-webkit-scrollbar {
  width: 0px;
}

// divider
.m-divide-text {
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: #414968;
  position: relative;
  top: 12px;
  text-align: center;
  width: 120px;
  background-color: #1d2027;
  margin: auto;
  z-index: 1;
}

// divider
.divide-text {
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  color: #23262f;
  position: relative;
  top: 12px;
  text-align: center;
  width: 120px;
  background-color: #2e274c;
  margin: auto;
  z-index: 1;
}

// social icon list component
.social-icon-wrapper {
  background-color: #1d2027 !important;
  display: flex;
  justify-content: space-around;

  .v-sheet {
    border-radius: 50px !important;
  }
}

.m-social-icon-button {
  background-color: #131828 !important;
  width: 36px;
  height: 36px;
    padding: 0 !important;

}

.login-forget-passwrod-text {
  cursor: pointer;
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #7782aa;
}

.text-large {
  font-size: 32px !important;
}

.m-login-email {
  transform-origin: top !important;
}

.m-login-password {
  transform-origin: top !important;
}

.m-login-forgot {
  transform-origin: top !important;
}

.form-textfield {
  background: transparent !important;
  box-shadow: 2px 0px 4px 1px rgba(0, 0, 0, 0.12) inset !important;
  border-radius: 0 !important;
    border: none !important;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px !important;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: #7782aa !important;
      opacity: 1 !important;
      --input-color: #7782aa !important;
      --input-background: transparent !important;
      --input-font-size: 12px !important;

}
</style>