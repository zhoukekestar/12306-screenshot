export interface TicketInfo {
  trainNumber: string;
  date: string;
  time: string;
  seat: string;
  departureStation: string;
  arrivalStation: string;
  ticketGate: string;
}

export function parseTicketText(text: string): TicketInfo {
  const result: TicketInfo = {
    trainNumber: '',
    date: '',
    time: '',
    seat: '',
    departureStation: '',
    arrivalStation: '',
    ticketGate: '',
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const noSpaceText = text.replace(/[\s\n]+/g, '');

  // 1. 提取日期 (跳过"下单时间"，优先找"发车时间"后的日期)
  let rawDate = '';
  const specificDateMatch = noSpaceText.match(/发车时间.*?[:：]?(20\d{2}[-年.]\d{1,2}[-月.]\d{1,2}日?)/);
  if (specificDateMatch) {
    rawDate = specificDateMatch[1];
  } else {
    // 若找不到"发车时间"标识，找所有符合特征的日期（通常第二个是发车日期）
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

  // 2. 提取座位号 (处理多人订单，提取并换行拼接，格式转换：10车08B号 -> 10车08排B号)
  const seatMatches = [...noSpaceText.matchAll(/(\d{1,2})车(\d{1,3})([A-Z]?)号?/gi)];
  if (seatMatches.length > 0) {
    const formattedSeats = seatMatches.map(m => {
      const car = m[1];
      const row = m[2];
      const seatChar = m[3] ? m[3].toUpperCase() : '';
      if (seatChar) {
        return `${car}车${row}排${seatChar}号`;
      }
      return `${car}车${row}号`;
    });
    const uniqueSeats = Array.from(new Set(formattedSeats));
    result.seat = uniqueSeats.join('\n');
  }

  // 3. 逐行分析强关联特征 (时间段、历时/站点段)
  for (const line of lines) {
    const cleanLine = line.replace(/\s+/g, '');

    // 匹配站点 (特征："出发站，历时53分到达站")
    if (cleanLine.includes('历时')) {
      const stationMatch = cleanLine.match(/(.+?)[,，]?历时\d+分(.+?)[,，]?$/);
      if (stationMatch) {
        result.departureStation = stationMatch[1].replace(/站$/, '');
        result.arrivalStation = stationMatch[2].replace(/站$/, '').replace(/发车时间.*/, '');
      }
    }

    // 匹配发车时间 (特征：夹在两个时间之间的内容，例如 "09:10sso10:03")
    // 车次识别准确率较低，OCR后不自动填入，留空由用户手动输入
    const timeTrainMatch = cleanLine.match(/(\d{2}:\d{2})([a-zA-Z0-9，,]+?)(\d{2}:\d{2}|\d{4})/);
    if (timeTrainMatch) {
      if (!result.time) {
        result.time = timeTrainMatch[1]; // 选取第一个时间作为出发时间
      }
    }
  }

  // 4. 提取检票口 (特征："检票口 1" 或 "检票口12A")
  const gateMatch = noSpaceText.match(/检票口([a-zA-Z0-9]+)/i);
  if (gateMatch) {
    result.ticketGate = gateMatch[1].toUpperCase();
  }

  // 5. 车次识别准确率低，不做 fallback 兜底，trainNumber 始终留空由用户手动填写

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
