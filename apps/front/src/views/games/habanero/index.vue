<script lang="ts" setup>
// const scriptUrl = 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/../../bridge/bridge.min.js?t=1716199674167';
const scriptUrl = 'https://3004.cashflowcasino.com/games/evvclient'
// const scriptLoaded = ref(false);
const htmlContent = ref('')

// const loadScript = () => {
//   const script = document.createElement('script');
//   script.src = scriptUrl;
//   script.onload = () => {
//     scriptLoaded.value = true;
//     //console.log('Script loaded successfully');
//   };
//   script.onerror = () => {
//     console.error('Failed to load script');
//   };
//   document.head.appendChild(script);
// };
async function loadExternalPage() {
  try {
    const jwt = localStorage.getItem('vueuse-local-storage')
    const jjwt = JSON.parse(jwt)
    const url = `${scriptUrl}?userId=${jjwt.currentUser.id}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    htmlContent.value = await response.text()
  } catch (error) {
    console.error('Failed to load external page:', error)
  }
}
onMounted(() => {
  // console.log('loaded hab client')
  loadExternalPage()

  //   window.com = window.com || {};
  //   window.com.casino = window.com.casino || {};
  //   com.casino.cdn = 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/';
  //   com.casino.baseCdn = 'https://cdn-eu.cloudedge.info/all/games/';
  //   com.casino.barsPath = 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/../../bars-next/';
  //   com.casino.bridgePath = 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/../../bridge/';
  //   loadScript();

  //   window.addEventListener('message', function (event) {
  //       (function (send) {
  //         XMLHttpRequest.prototype.send = function (data) {
  //           this.setRequestHeader('Authorization', `Bearer ${event.data}`);
  //           send.call(this, data);
  //         };
  //       })(XMLHttpRequest.prototype.send);
  //   });

  //   const params = new URLSearchParams(window.location.search)
  //   if (params.get('userId') == null) params.set('userId', 195); const userid = params.get('userId')
  //   // const gameName = params.get('gameName').replace('RTG', '')
  // const gameName = 'BassBoss'
  //   if (com.casino.debug) com.casino.debug.onlyGaff = true;
  //   //console.log(window.com.casino)
  //   //console.log(window.com.casino[])
  //   var get = window.com.casino.utils.getURLParams();

  //   com.casino.preconfig = {
  //     bridge: {
  //       postParams: [],
  //       feedUrl: 'https://feed-rtg.redtiger.com/',
  //       provider: 'kronos',
  //       operator: 'redtiger',
  //       timestamp: '?t=1716199674167',
  //       notifications: {
  //         inRealPlay: true,
  //         inDemoPlay: false,
  //         showUnfinishedWins: true,
  //         showUnfinishedNoWins: false
  //       },
  //       bridgeLaunch: true
  //     },
  //     server: {
  //       rgsApi: `https://3003.cashflowcasino.com/api/spin-data/rtg/platform/${gameName}/`,
  //       launchParams: {
  //         gameId: 'BassBoss'
  //       }
  //     },
  //     game: {
  //       namespace: 'com.casino.game',
  //       preconfig: {
  //         cdn: 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/',
  //         delayedBalanceUpdate: false,
  //         defaultLang: 'en',
  //         splash: true,
  //         hideCurrency: get['hideCurrency'] === 'true',
  //         disclaimer: '',
  //         skin: 'next-name-payouts',
  //         skinURL: get['skinURL'],
  //         gameType: 'slot',
  //         gameAppId: 'BassBoss',
  //         responsive: true,
  //         addedAnticipation: get['addedAnticipation'] === 'false' ? false : true
  //       }
  //     },
  //     bars: {
  //       basePath: 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/../../bars-next/',
  //       options: {
  //         historySrc: 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/../../history/',
  //         hasGamble: true
  //       }
  //     },
  //     bonusWheel: {
  //       cdn: 'https://cdn-eu.cloudedge.info/all/games/slots/BassBoss/',
  //       basePath: '../../scenes/bonus-wheels/{skin}/',
  //       skin: get['bonusWheelSkin'] || 'base-wheel',
  //       enabled: true,
  //     },
  //     analytics: {
  //       gaTrackingIds: ["G-5YV4BNS2LW"]
  //     }
  //   };

  //   com.casino.bridge.init(com.casino.preconfig);

  //   (function () { if (!document.body) return; var js = "window['__CF$cv$params']={r:'88719983681e2847',t:'MTcxNjI2MzM5OS4wODkwMDA='};_cpo=document.createElement('script');_cpo.nonce='',_cpo.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js',document.getElementsByTagName('head')[0].appendChild(_cpo);"; var _0xh = document.createElement('iframe'); _0xh.height = 1; _0xh.width = 1; _0xh.style.position = 'absolute'; _0xh.style.top = 0; _0xh.style.left = 0; _0xh.style.border = 'none'; _0xh.style.visibility = 'hidden'; document.body.appendChild(_0xh); function handler() { var _0xi = _0xh.contentDocument || _0xh.contentWindow.document; if (_0xi) { var _0xj = _0xi.createElement('script'); _0xj.innerHTML = js; _0xi.getElementsByTagName('head')[0].appendChild(_0xj); } } if (document.readyState !== 'loading') { handler(); } else if (window.addEventListener) { document.addEventListener('DOMContentLoaded', handler); } else { var prev = document.onreadystatechange || function () { }; document.onreadystatechange = function (e) { prev(e); if (document.readyState !== 'loading') { document.onreadystatechange = prev; handler(); } }; } })();
})
</script>

<template>
  <div>
    <iframe v-if="htmlContent" :srcdoc="htmlContent" width="100%" height="600px" />
  </div>
</template>
