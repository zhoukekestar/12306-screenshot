const { parseTicketText } = require('./dist/utils/parser.js') || {};
// We'll just copy the logic to test it locally
const text = `
20:32 1 全 国
《 订单 详情 …
订单 号 :E479513942 [复制 ] 下 单 时 间 :2026.02.17
借
多
09:10 sso 10:03
经 停 六
嵊州 新 昌 ， 历时 53 分 杭州 东 ，
发 车 时 间 : 2026.02.19 星期 四 车 票 当 日 当 次 有 效
检票 口 1 (如 有 变更 ， 请 以 现场 公告 为 准 )
变更 到 站 | 改 签 退票
赵 波 燕 成 人 要 种 二 等 座 10 车 08B 号 ，
中 国 居民 身份 证 Y65 | 9.5 折
改 签 票 退 改 说 明
订餐 购 乘 意 险
周 贤 君 成 人 村 静 针 言 二 等 座 10 车 08A 号 ，
中 国 居民 身份 证 Y65 | 9.5 折
改 签 票 退 改 说 明
订餐 购 乘 意 险
`;

function parse(text) {
  const result = { trainNumber: '', date: '', time: '', seat: '', departureStation: '', arrivalStation: '' };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const noSpaceText = text.replace(/[\s\n]+/g, '');

  const dateMatch = noSpaceText.match(/20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}(日)?/);
  if (dateMatch) result.date = dateMatch[0].replace(/\./g, '-').replace('年', '-').replace('月', '-').replace('日', '');

  const seatMatches = [...noSpaceText.matchAll(/\d{1,2}车\d{1,3}[A-Z]?号/gi)];
  if (seatMatches.length > 0) {
    const uniqueSeats = Array.from(new Set(seatMatches.map(m => m[0].toUpperCase())));
    result.seat = uniqueSeats.join(', ');
  }

  for (const line of lines) {
    const cleanLine = line.replace(/\s+/g, '');
    if (cleanLine.includes('历时')) {
      const stationMatch = cleanLine.match(/(.+?)[,，]?历时\d+分(.+?)[,，]?$/);
      if (stationMatch) {
        result.departureStation = stationMatch[1].replace(/站$/, '');
        result.arrivalStation = stationMatch[2].replace(/站$/, '').replace(/发车时间.*/, '');
      }
    }
    const timeTrainMatch = cleanLine.match(/(\d{2}:\d{2})([a-zA-Z0-9，,]+?)(\d{2}:\d{2}|\d{4})/);
    if (timeTrainMatch) {
      if (!result.time) result.time = timeTrainMatch[1];
      const middleText = timeTrainMatch[2].replace(/[,，]/g, '').toUpperCase();
      const validTrainMatch = middleText.match(/[A-Z]\d{2,4}/);
      if (validTrainMatch) {
        result.trainNumber = validTrainMatch[0];
      } else if (!result.trainNumber && middleText.length >= 2) {
        result.trainNumber = middleText;
      }
    }
  }

  if (!result.trainNumber) {
    const safeText = noSpaceText.replace(/订单号[:：A-Za-z0-9]+/g, '');
    const trainMatch = safeText.match(/[A-Za-z]\d{2,4}/);
    if (trainMatch) result.trainNumber = trainMatch[0].toUpperCase();
  }

  if (!result.time) {
    const times = [...noSpaceText.matchAll(/\d{2}:\d{2}/g)];
    if (times.length > 1) result.time = times[1][0];
    else if (times.length === 1) result.time = times[0][0];
  }

  return result;
}

console.log(parse(text));
console.log(parse('”10:32 e7712， 1116\n嵊州 新 昌 ， 历时 44 分 杭州 东 ，'));
