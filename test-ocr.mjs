const noSpaceText = "订单号:E479513942下单时间:2026.02.1709:10sso10:03经停六嵊州新昌，历时53分杭州东，发车时间:2026.02.19星期四";
let rawDate = '';
const specificDateMatch = noSpaceText.match(/发车时间.*?[:：]?(20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}日?)/);
if (specificDateMatch) {
  rawDate = specificDateMatch[1];
} else {
  const allDates = [...noSpaceText.matchAll(/20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}日?/g)];
  if (allDates.length > 1) rawDate = allDates[1][0];
  else if (allDates.length === 1) rawDate = allDates[0][0];
}
console.log(rawDate.replace(/\./g, '-').replace('年', '-').replace('月', '-').replace('日', ''));
