<script setup lang="ts">
import { reactive, toRefs, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import ValidationBox from "./ValidationBox.vue";
import { useDisplay } from "vuetify";
import { authStore } from "@/stores/auth";
import { userStore } from "@/stores/user";
import { socketStore } from "@/stores/socket";
import { storeToRefs } from "pinia";
import SuccessIcon from "@/components/icons/SuccessIcon.vue";
import WarningIcon from "@/components/icons/WarningIcon.vue";
import { useToast } from "vue-toastification";
//import * as Toast from "vue-toastification/dist/index.mjs"
//import SimpleToast from '@/components/SimpleToast/SimpleToast.vue'

//const { useToast } = Toast
import { useRoute, useRouter } from "vue-router";
import { bannerStore } from "@/store/banner";
import { currencyStore } from "@/store/currency";
const components = {
  ValidationBox,
  SuccessIcon,
  WarningIcon,
};
const props = defineProps({
    signUpDialogCheck: {
      type: Boolean,
      required: true,
    },
  },
);

const emit = defineEmits(["close", "switchAuthDialog"]);
// translation
const { t } = useI18n();
const { name } = useDisplay();
const { dispatchSignUp, setAuthDialogVisible, dispatchUserProfile, setNickNameDialogVisible } = authStore();
const { dispatchUserBalance } = userStore();
const { dispatchSocketConnect } = socketStore();
const { dispatchCurrencyList } = currencyStore();
    const { dispatchCurrencyList } = currencyStore();

    const { width } = useDisplay();
    const route = useRoute();

    // initiate component state
    const state = reactive({
      currentPage: 0, // default signup form
      dialog: true,
      isAgreed: true,
      socialIconList: [
        new URL("@/assets/public/svg/icon_public_28.svg", import.meta.url).href,
        new URL("@/assets/public/svg/icon_public_29.svg", import.meta.url).href,
        new URL("@/assets/public/svg/icon_public_30.svg", import.meta.url).href,
        new URL("@/assets/public/svg/icon_public_31.svg", import.meta.url).href,
      ],
      PAGE_TYPE: {
        SIGNUP_FORM: 0,
        CONFIRM_CANCEL: 1,
        ALREADY_REGISTERED: 2,
      },
      formData: {
        emailAddress: "",
        password: "",
        promoCode: "",
        isAgreed: true,
        visible: false,
      },
      userName: "",
      isShowPassword: false,
      // isShowEmailValidaton: true,
      isShowEmailValidaton: false,
      // isShowPasswordValidation: true,
      isShowPasswordValidation: false,
      isShowUsernameValidation: false,
      passwordValidationStrList: [
        t("signup.formPage.validation.password.items[0]"),
        // t("signup.formPage.validation.password.items[1]"),
        // t("signup.formPage.validation.password.items[2]"),
        // t("signup.formPage.validation.password.items[3]"),
      ],
      userNameValidationStrList: [
        t("signup.displayNamePage.validation.username.items[0]"),
        t("signup.displayNamePage.validation.username.items[1]"),
      ],
      slides: [
        new URL("@/assets/public/image/ua_public_01.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_02.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_03.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_04.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_05.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_06.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_07.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_08.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_09.png", import.meta.url).href,
        new URL("@/assets/public/image/ua_public_10.png", import.meta.url).href,
      ],
      loading: false,
      mailCardHeight: 0,
      emailPartName: "",
    });

    watch(
      props,
      (value) => {
        if (state.currentPage == state.PAGE_TYPE.SIGNUP_FORM) {
          state.currentPage = state.PAGE_TYPE.CONFIRM_CANCEL;
        } else if (state.currentPage == state.PAGE_TYPE.CONFIRM_CANCEL) {
          setAuthDialogVisible(false);
        }
      },
      { deep: true }
    );

    const showPassword = () => {
      state.isShowPassword = !state.isShowPassword;
    };

    const mobileWidth = computed(() => {
      return width.value;
    });

    // computed variables
    const isFormDataReady = computed(
      (): boolean => validateEmail() && validatePassword() && state.formData.isAgreed
    );

    const mobileVersion = computed(() => {
      return name.value;
    });

    // flag when login successed
    const success = computed(() => {
      const { getSuccess } = storeToRefs(authStore());
      return getSuccess.value;
    });

    // error message when login failed

    const errMessage = computed(() => {
      const { getErrMessage } = storeToRefs(authStore());
      return getErrMessage.value;
    });

    const passwordValidationList = computed((): boolean[] => {
      const password = state.formData.password;

      // 8-30 Characters in length
      const condition1 = password.length <= 30 && password.length >= 8;

      // Contains one upper and one lowercase character
      // const condition2 = /[A-Z]/.test(password) && /[a-z]/.test(password);

      // Contains a number
      // const condition3 = /\d/.test(password);

      // Contains Special Code
      // const condition4 = /[~!@#$%&*()_-]/.test(password);

      // return [condition1, condition2, condition3, condition4];
      return [condition1];
    });

    const userNameValidationList = computed((): boolean[] => {
      const username = state.userName;
      // 2-20 characters in length
      const condition1 = username.length <= 20 && username.length >= 2;
      // Nickname must not be like your email
      const condition2 = !(
        username.toLowerCase().trim() === state.formData.emailAddress.toLowerCase().trim()
      );

      return [condition1, condition2];
    });

    const currentLanguage = computed((): string => localStorage.getItem("lang") || "en");

    // validation functions
    const validateEmail = (): boolean => {
      const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isMatch = state.formData.emailAddress.match(validRegex);

      return !!isMatch;
    };

    const handleValidateEmail = (): void => {
      if (validateEmail()) {
        state.isShowEmailValidaton = false;
      } else {
        state.isShowEmailValidaton = true;
      }
    };

    const validatePassword = (): boolean => {
      return passwordValidationList.value.reduce((res, item) => res && item, true);
    };

    const validateUserName = (): boolean => {
      return userNameValidationList.value.reduce((res, item) => res && item, true);
    };

    // event handler functions, needs to be updated
    const handleOnPasswordInputFocus = (): void => {
      // handleValidateEmail();
      // if (validateEmail()) {
      state.isShowPasswordValidation = true;
      // }
    };

    const handleOnPasswordInputBlur = (): void => {
      state.isShowPasswordValidation = false;
    };

    const handleOnUserNameInputFocus = (): void => {
      state.isShowUsernameValidation = true;
    };

    const handleOnUserNameInputBlur = (): void => {
      state.isShowUsernameValidation = false;
    };

    const handleOnEmailInputBlur = (): void => {
      // handleValidateEmail();
      state.isShowEmailValidaton = false;
      setTimeout(() => {
        state.mailCardHeight = 0;
      }, 100);
    };

    const handleClickContinueButton = (): void => {
      state.currentPage = state.PAGE_TYPE.SIGNUP_FORM;
    };

    const goSignInPage = (): void => {
      emit("switchAuthDialog", "login");
    };

    // handle form submit
    const handleSignupFormSubmit = async () => {
      if (!validateEmail()) {
        state.isShowEmailValidaton = true;
        return;
      }

      if (!validatePassword()) {
        state.isShowPasswordValidation = true;
        return;
      }

            if (!state.formData.isAgreed) {
        const toast = useToast();
        toast.success(t("signup.formPage.agree_alert_text"), {
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
        return;
      }

      state.loading = true;
      await dispatchSignUp({
        uid: state.formData.emailAddress,
        password: state.formData.password,
        referral_code: state.formData.promoCode,
        browser: "",
        device: "",
        model: "",
        brand: "",
        imei: "",
      });
      state.loading = false;
      if (success.value) {
        await dispatchUserProfile();
        await dispatchUserBalance();
        await dispatchSocketConnect();
        await dispatchCurrencyList();

        setAuthDialogVisible(false);
        setNickNameDialogVisible(true);
        const toast = useToast();
        toast.success(t("signup.submit_result.success_text"), {
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
      } else {
        console.log;
        if (
          errMessage.value ==
          "The account you entered has been used by someone else, please input again"
        ) {
          state.currentPage = state.PAGE_TYPE.ALREADY_REGISTERED;
        } else {
          const toast = useToast();
          toast.success(errMessage.value, {
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
      }
    };

      const goRegisterPage = (): void => {
      state.currentPage = state.PAGE_TYPE.SIGNUP_FORM;
    };

    const handleEmailChange = () => {
      handleValidateEmail();
      if (state.formData.emailAddress.includes("@")) {
        state.emailPartName = state.formData.emailAddress.split("@")[0];
        state.mailCardHeight = 220;
      } else {
        setTimeout(() => {
          state.mailCardHeight = 0;
        }, 100);
      }
    };

    const handleEmailFocus = () => {
      handleValidateEmail();
      if (state.formData.emailAddress.includes("@")) {
        state.emailPartName = state.formData.emailAddress.split("@")[0];
        state.mailCardHeight = 220;
      }
    };

    const mergeEmail = (mail: string) => {
      state.formData.emailAddress = state.formData.emailAddress.split("@")[0] + mail;
      setTimeout(() => {
        state.mailCardHeight = 0;
      }, 100);
    };

    const cancelConfirm = () => {
      setAuthDialogVisible(false);
    };

    onMounted(() => {
      console.log("promo code::::::::::::::::::::", route.query.code);
      state.formData.promoCode = route.query.code ? route.query.code.toString() : "";
    });

    const router = useRouter();

    const goPrivatePolicy = async () => {
      await router.push({ name: "About_US", query: { index: 1 } });
      setAuthDialogVisible(false);
    };


export default {
  components,
  emits,
  props,
  setup() {
    return {
        t,
        ...toRefs(state),
        isFormDataReady,
        currentLanguage,
        passwordValidationList,
        userNameValidationList,
        mobileVersion,
        validateUserName,
        handleOnPasswordInputFocus,
        handleOnPasswordInputBlur,
        handleOnUserNameInputFocus,
        handleOnUserNameInputBlur,
        handleOnEmailInputBlur,
        handleClickContinueButton,
        goSignInPage,
        handleSignupFormSubmit,
        showPassword,
        goRegisterPage,
        handleEmailChange,
        handleEmailFocus,
        mergeEmail,
        cancelConfirm,
        goPrivatePolicy,
      };
  }
}
</script>

<template>
  <div class="m-signup-container px-6"> <div class="my-15 d-flex justify-center align-center">
  <img src="@/assets/public/image/logo_public_01.png" width="86" />
  <div class="ml-2">
    <div class="text-800-16 white">
      {{ t("signup.formPage.header.titleLine1") }}
    </div>
    <div class="text-900-20 white">
      {{ t("signup.formPage.header.titleLine2") }}
    </div>
  </div>
</div>
    <v-form v-if="currentPage === PAGE_TYPE.SIGNUP_FORM" class="full-width">
      <div class="relative mt-10 pa-0">
        <v-text-field
          :label="t('signup.formPage.emailAddress')"
          class="form-textfield dark-textfield ma-0 m-text-field m-signup-email"
          variant="solo"
          density="comfortable"
          v-model="formData.emailAddress"
          :onblur="handleOnEmailInputBlur"
          @input="handleEmailChange"
          :onfocus="handleEmailFocus"
        />
        <ValidationBox
          v-if="isShowEmailValidaton"
          :title="
            t(
              `signup.formPage.validation.email.${
                formData.emailAddress.length ? 'title2' : 'title'
              }`
            )
          "
          :withCautionIcon="true"
        />
        <div class="m-register-mail-card" :style="{ height: mailCardHeight + 'px' }">
          <v-list theme="dark" bg-color="#1D2027">
            <v-list-item
              class="text-600-12 white"
              value="gmail"
              @click="mergeEmail('@gmail.com')"
            >
              {{ emailPartName }}@gmail.com
            </v-list-item>
            <v-list-item
              class="text-600-12 white"
              value="hotmail"
              @click="mergeEmail('@hotmail.com')"
              >{{ emailPartName }}@hotmail.com</v-list-item
            >
            <v-list-item
              class="text-600-12 white"
              value="yahoo"
              @click="mergeEmail('@yahoo.com')"
              >{{ emailPartName }}@yahoo.com</v-list-item
            >
            <v-list-item
              class="text-600-12 white"
              value="icloud"
              @click="mergeEmail('@icloud.com')"
              >{{ emailPartName }}@icloud.com</v-list-item
            >
            <v-list-item
              class="text-600-12 white"
              value="outlook"
              @click="mergeEmail('@outlook.com')"
              >{{ emailPartName }}@outlook.com</v-list-item
            >
          </v-list>
        </div>
      </div>
      <div class="mt-6 relative pa-0">
        <v-text-field
          :label="t('signup.formPage.password')"
          class="form-textfield dark-textfield ma-0 m-signup-password"
          variant="solo"
          density="comfortable"
          :type="isShowPassword ? 'text' : 'password'"
          v-model="formData.password"
          :onfocus="handleOnPasswordInputFocus"
          :onblur="handleOnPasswordInputBlur"
        />
        <img
          v-if="isShowPassword"
          src="@/assets/public/svg/icon_public_07.svg"
          class="m-disable-password"
          @click="showPassword"
          width="16"
        />
        <img
          v-else
          src="@/assets/public/svg/icon_public_06.svg"
          class="m-disable-password"
          @click="showPassword"
          width="16"
        />
        <ValidationBox
          v-if="isShowPasswordValidation"
          :descriptionList="passwordValidationStrList"
          :validationList="passwordValidationList"
        />
      </div>
      <v-row class="mt-2">
        <v-text-field
          :label="t('signup.formPage.promoCode')"
          class="form-textfield normal-textfield m-signup-promo"
          variant="solo"
          density="comfortable"
          v-model="formData.promoCode"
        />
      </v-row>
      <div class="mt-2" style="display: flex; align-items: center; height: 46px">
        <v-checkbox
          v-model="formData.isAgreed"
          hide-details
          icon
          class="m-agreement-checkbox"
          style="margin-bottom: 20px"
        />
        <p class="text-600-12 gray ml-1">
          {{ t("signup.formPage.agree.prefix") }}
          <span class="white pointer" @click="goPrivatePolicy">
            {{ t("signup.formPage.agree.bold") }}
          </span>
          {{ t("signup.formPage.agree.suffix") }}
        </p>
      </div>
      <v-row>
        <v-btn
          class="mt-8 mx-3"
          :class="isFormDataReady ? 'm-signup-btn' : 'm-signup-disabled-btn'"
          width="94%"
          height="48px"
          :loading="loading"
          :onclick="handleSignupFormSubmit"
        >
          {{ t("signup.formPage.button") }}
        </v-btn>
      </v-row>
      <v-row class="mt-6">
        <p class="m-divide-text">
          {{ t("signup.formPage.divider") }}
        </p>
        <v-divider class="mx-10" style="border: 1px solid #414968 !important" />
      </v-row>
      <v-row class="mt-6">
        <v-col cols="8" offset="2">
          <div class="d-flex justify-space-around bg-surface-variant social-icon-wrapper">
            <v-sheet
              v-for="(item, index) in socialIconList"
              :key="index"
              color="#131828"
              class="rounded"
            >
              <v-btn
                color="grey-darken-4"
                class="m-social-icon-button"
                icon=""
                height="36px"
                width="36px"
              >
                <img :src="item" width="36" />
              </v-btn>
            </v-sheet>
          </div>
        </v-col>
      </v-row>
    </v-form>

    <!-- Confirm cancel. -->
    <div v-if="currentPage == PAGE_TYPE.CONFIRM_CANCEL" class="full-width">
      <v-row style="margin-top: 100px" class="mx-4">
        <p class="text-700-20 white center full-width">
          {{ t("signup.confirmCancelPage.title") }}
        </p>
      </v-row>
      <v-row class="mt-7">
        <p class="text-400-14 slate-gray center full-width">
          {{ t("signup.confirmCancelPage.description") }}
        </p>
      </v-row>
      <v-row style="margin-top: 100px">
        <v-btn
          class="ma-3 button-bright m-signup-continue-btn"
          width="94%"
          height="48px"
          @click="handleClickContinueButton"
        >
          {{ t("signup.confirmCancelPage.continue") }}
        </v-btn>
      </v-row>
      <v-row class="mt-4">
        <v-btn
          class="ma-3 button-dark m-signup-cancel-btn"
          width="94%"
          height="48px"
          @click="cancelConfirm"
        >
          {{ t("signup.confirmCancelPage.cancel") }}
        </v-btn>
      </v-row>
    </div>

    <!-- Already registered notification -->
    <div v-if="currentPage == PAGE_TYPE.ALREADY_REGISTERED" class="full-width">
      <v-row>
        <p class="m-label-text-md slate-gray center full-width px-8">
          {{ t("signup.alreadyRegisterPage.title") }}
        </p>
      </v-row>
      <v-row style="margin-top: 126px">
        <v-btn
          class="ma-3 button-bright m-signup-confirm-btn"
          width="-webkit-fill-available"
          height="48px"
          autocapitalize="off"
          @click="goSignInPage"
        >
          {{ t("signup.alreadyRegisterPage.confirm") }}
        </v-btn>
      </v-row>
      <v-row class="mt-4">
        <v-btn
          class="ma-3 button-dark m-signup-cancel-btn"
          width="-webkit-fill-available"
          height="48px"
          autocapitalize="off"
          @click="goRegisterPage"
        >
          {{ t("signup.alreadyRegisterPage.cancel") }}
        </v-btn>
      </v-row>
    </div>
  </div>
</template>



<style scoped lang="scss">
@media (max-width: 600px) {
  .v-field__field {
    color: var(--sec-text-7782-aa, #7782aa);
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    height: 40px !important;

    input {
      padding-top: 6px !important;
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }

    .v-label.v-field-label {
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 10px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }

    .v-label.v-field-label--floating {
      --v-field-label-scale: 0.88em;
      font-size: var(--v-field-label-scale);
      max-width: 100%;
    }
  }

  .v-list-item--density-default.v-list-item--one-line {
    min-height: 42px !important;
  }
}

.m-label-text-md {
  margin-top: 80px;
  font-weight: 600;
  font-size: 16px;
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
}

.m-signup-continue-btn {
  .v-btn__content {
    color: var(--text-dark-black, white);
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
  }
}

.m-signup-confirm-btn {
  .v-btn__content {
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
}

.m-signup-cancel-btn {
  .v-btn__content {
    color: var(--text-dark-black, #fff);
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
}

.m-register-mail-card {
  position: absolute;
  top: 43px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d2027;
  width: 100%;
  border-radius: 16px;
  z-index: 200;
  overflow: hidden;
  transition: height 0.3s ease-out;
}

.m-signup-btn {
  background: #009b3a;
  color: white;
  border-radius: 8px !important;

  .v-btn__content {
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
}

.m-signup-btn:hover:enabled {
  background: #009b3a;
}

.m-signup-disabled-btn {
  border-radius: 8px;
  background: var(--Secondary-Button, #23262f);
  box-shadow: 0px 3px 4px 1px rgba(0, 0, 0, 0.21);

  .v-btn__content {
    color: #ffffff;
    text-align: center;
    font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
}

.m-disable-password {
  position: absolute;
  top: 16px;
  right: 10px;
  cursor: pointer;
}

// mobile dialog contaier
.m-signup-container {
  height: calc(100vh - 50px);
  width: 100%;
  background: $color_1;
  overflow-y: auto;

  .v-field--variant-solo {
    background: transparent !important;
  }

  .form-textfield div.v-field__field {
    background: #15161c;
    box-shadow: 2px 0px 4px 1px rgba(0, 0, 0, 0.12) inset !important;
  }
}

.m-signup-container::-webkit-scrollbar {
  width: 0px;
}

.m-display-name-input {
  .form-textfield div.v-field__field {
    box-shadow: 2px 0px 4px 1px rgba(0, 0, 0, 0.12) inset !important;
  }
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

// social icon list component
.social-icon-wrapper {
  background-color: #1d2027 !important;

  .v-sheet {
    border-radius: 50px !important;
  }
}

.m-social-icon-button {
  background-color: #131828 !important;
  width: 36px;
  height: 36px;
}

// ask signin text
.signin-text {
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  text-align: right;
}

.signin-text2 {
  cursor: pointer;
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 16px;
  line-height: 19px;
  color: #009b3a;
}

// agreement
.agreement-text {
  font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  margin-top: 13px;
  color: #7782aa;
}

.m-agreement-checkbox {
  i.v-icon {
    color: #15161c;
    background-color: #01983a;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-top: 4px;
  }

  i.mdi-checkbox-blank-outline {
    background-color: #1d2027;
    box-shadow: inset 1px 0px 2px 1px rgba(0, 0, 0, 0.11);
    border-radius: 4px;
  }
}

// carousel
.carousel-container {
  width: 100%;
}

.m-signup-email {
  transform-origin: top !important;

  .v-field__field {
    input {
      padding-top: 2px !important;
    }

    .v-label.v-field-label {
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px !important;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: #7782aa !important;
      opacity: 1 !important;
    }

    .v-label.v-field-label--floating {
      --v-field-label-scale: 0.88em;
      font-size: 8px !important;
      max-width: 100%;
      color: #7782aa !important;
      opacity: 1 !important;
    }
  }
}

.m-signup-password {
  transform-origin: top !important;

  .v-field__field {
    input {
      padding-top: 2px !important;
      padding-right: 30px !important;
    }

    .v-label.v-field-label {
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px !important;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: #7782aa !important;
      opacity: 1 !important;
    }

    .v-label.v-field-label--floating {
      --v-field-label-scale: 0.88em;
      font-size: 8px !important;
      max-width: 100%;
      color: #7782aa !important;
      opacity: 1 !important;
    }
  }
}

.m-signup-promo {
  transform-origin: top !important;

  .v-field__field {
    background: #15161c;

    input {
      padding-top: 2px !important;
    }

    .v-label.v-field-label {
      font-family: Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif;
      font-size: 12px !important;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: #7782aa !important;
      opacity: 1 !important;
    }

    .v-label.v-field-label--floating {
      --v-field-label-scale: 0.88em;
      font-size: 8px !important;
      max-width: 100%;
      color: #7782aa !important;
      opacity: 1 !important;
    }
  }
}
</style>
