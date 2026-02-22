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

  // Split by newline to find the line that might contain stations
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Replace multiple spaces and common OCR errors for general matching
  const flatText = text.replace(/[\s\n]+/g, ' ');

  // 提取车次 (e.g., G123, D12, K345, Z9)
  const trainMatch = flatText.match(/[A-Z]\d{1,4}/);
  if (trainMatch) {
    result.trainNumber = trainMatch[0];
  }

  // 提取日期 (e.g., 2023年05月01日 or 2023-05-01 or 05月01日)
  const dateMatch = flatText.match(/(\d{4}年)?\d{1,2}月\d{1,2}日/);
  if (dateMatch) {
    result.date = dateMatch[0];
  }

  // 提取时间 (e.g., 14:30开 or 14:30)
  const timeMatch = flatText.match(/\d{1,2}:\d{2}/);
  if (timeMatch) {
    result.time = timeMatch[0];
  }

  // 提取座位 (e.g., 05车12A号)
  const seatMatch = flatText.match(/\d{1,2}车\s*\d{1,3}[A-Z]?号/i);
  if (seatMatch) {
    result.seat = seatMatch[0].replace(/\s+/g, '');
  }

  // 提取站点 (A站 - B站 or A - B)
  for (const line of lines) {
    if (line.includes('-') || line.includes('一') || line.includes('—')) {
      // It's likely the station line
      const parts = line.split(/[-一—]/).map(p => p.trim());
      if (parts.length >= 2) {
        // Clean up common station suffix if needed, but keeping it is fine
        // exclude if it looks like date "2023-10-01"
        if (!/\d{4}/.test(parts[0])) {
           result.departureStation = parts[0];
           result.arrivalStation = parts[parts.length - 1];
           break;
        }
      }
    }
  }

  return result;
}
