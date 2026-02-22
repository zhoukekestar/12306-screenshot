export interface TicketInfo {
  trainNumber: string;
  date: string;
  time: string;
  seat: string;
  departureStation: string;
  arrivalStation: string;
}

export function parseTicketText(text: string): TicketInfo {
  const result: TicketInfo = {
    trainNumber: '',
    date: '',
    time: '',
    seat: '',
    departureStation: '',
    arrivalStation: '',
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const noSpaceText = text.replace(/[\s\n]+/g, '');

  // 1. 提取日期 (跳过“下单时间”，优先找“发车时间”后的日期)
  let rawDate = '';
  const specificDateMatch = noSpaceText.match(/发车时间.*?[:：]?(20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}日?)/);
  if (specificDateMatch) {
    rawDate = specificDateMatch[1];
  } else {
    // 若找不到“发车时间”标识，找所有符合特征的日期（通常第二个是发车日期）
    const allDates = [...noSpaceText.matchAll(/20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}日?/g)];
    if (allDates.length > 1) {
      rawDate = allDates[1][0];
    } else if (allDates.length === 1) {
      rawDate = allDates[0][0];
    }
  }
  if (rawDate) {
    result.date = rawDate.replace(/\./g, '-').replace('年', '-').replace('月', '-').replace('日', '');
  }

  // 2. 提取座位号 (处理多人订单，提取并拼接：10车08B号, 10车08A号)
  const seatMatches = [...noSpaceText.matchAll(/\d{1,2}车\d{1,3}[A-Z]?号/gi)];
  if (seatMatches.length > 0) {
    const uniqueSeats = Array.from(new Set(seatMatches.map(m => m[0].toUpperCase())));
    result.seat = uniqueSeats.join(', ');
  }

  // 3. 逐行分析强关联特征 (时间段、车次段、历时/站点段)
  for (const line of lines) {
    const cleanLine = line.replace(/\s+/g, '');

    // 匹配站点 (特征：“出发站，历时53分到达站”)
    if (cleanLine.includes('历时')) {
      const stationMatch = cleanLine.match(/(.+?)[,，]?历时\d+分(.+?)[,，]?$/);
      if (stationMatch) {
        result.departureStation = stationMatch[1].replace(/站$/, '');
        result.arrivalStation = stationMatch[2].replace(/站$/, '').replace(/发车时间.*/, '');
      }
    }

    // 匹配时间和车次 (特征：夹在两个时间之间的通常是车次，例如 “09:10sso10:03” 或是 “10:32e7712，1116”)
    const timeTrainMatch = cleanLine.match(/(\d{2}:\d{2})([a-zA-Z0-9，,]+?)(\d{2}:\d{2}|\d{4})/);
    if (timeTrainMatch) {
      if (!result.time) {
        result.time = timeTrainMatch[1]; // 选取第一个时间作为出发时间
      }
      
      const middleText = timeTrainMatch[2].replace(/[,，]/g, '').toUpperCase();
      // 判断中间的内容是否像正常车次 (如 E7712)
      const validTrainMatch = middleText.match(/[A-Z]\d{2,4}/);
      if (validTrainMatch) {
        result.trainNumber = validTrainMatch[0];
      } else if (!result.trainNumber && middleText.length >= 2) {
        // 如果OCR识别错乱（例如把G认成sso），也将错就错提取出来，后续供用户手动修改
        result.trainNumber = middleText;
      }
    }
  }

  // 4. 全局 fallback (如果前面的强关联特征失效，再进行全局正则盲抓)
  // 匹配车次，但过滤掉“订单号”开头，避免误抓订单号如 E479513942
  if (!result.trainNumber) {
    const safeText = noSpaceText.replace(/订单号[:：A-Za-z0-9]+/g, '');
    const trainMatch = safeText.match(/[A-Za-z]\d{2,4}/);
    if (trainMatch) {
      result.trainNumber = trainMatch[0].toUpperCase();
    }
  }

  // 匹配全局时间 (避开顶部手机状态栏时间)
  if (!result.time) {
    const times = [...noSpaceText.matchAll(/\d{2}:\d{2}/g)];
    if (times.length > 1) {
      result.time = times[1][0]; // 优先取第二个，大概率是发车时间
    } else if (times.length === 1) {
      result.time = times[0][0];
    }
  }

  // 匹配站点兜底逻辑 (找含有 " - " 的行)
  if (!result.departureStation || !result.arrivalStation) {
    for (const line of lines) {
      if (line.includes('-') || line.includes('一') || line.includes('—')) {
        const parts = line.split(/[-一—]/).map(p => p.trim());
        if (parts.length >= 2 && !/\d{4}/.test(parts[0])) {
           result.departureStation = parts[0];
           result.arrivalStation = parts[parts.length - 1];
           break;
        }
      }
    }
  }

  return result;
}
