import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { NETWORK } from '@/net/NetworkCfg';
import { Network } from '@/net/Network';
import type * as Currency from '@/interface/currency';
import { handleException } from './exception';

export const useCurrencyStore = defineStore('useCurrencyStore', () => {
  const success = ref(false);
  const errMessage = ref('');
  const currencyList = ref<Array<Currency.GetCurrencyBalanceList>>([]);

  const getCurrencyList = computed(() => currencyList.value);

  const dispatchCurrencyList = async () => {
    success.value = false;
    const route: string = NETWORK.Currency.CURRENCY_LIST;
    const network: Network = Network.getInstance();
    
    // response call back function
    const next = (response: Currency.GetCurrencyBalanceListResponse) => {
      if (response.code == 200) {
        success.value = true;
        currencyList.value = response.data;
      } else {
        errMessage.value = handleException(response.code);
      }
    };
    await network.sendMsg(route, {}, next, 1, 4);
  };

  return {
    success,
    errMessage,
    currencyList,
    getCurrencyList,
    dispatchCurrencyList,
  };
});