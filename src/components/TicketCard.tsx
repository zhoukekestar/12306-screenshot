import React, { useRef, useState } from 'react';
import { Download, Edit3, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { TicketInfo } from '../utils/parser';

interface TicketCardProps {
  initialInfo: TicketInfo;
  onReset: () => void;
}

export default function TicketCard({ initialInfo, onReset }: TicketCardProps) {
  const [info, setInfo] = useState<TicketInfo>(initialInfo);
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `乘车卡片_${info.trainNumber || '12306'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Oops, something went wrong!', err);
        alert('保存失败，请稍后再试');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof TicketInfo) => {
    setInfo(prev => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 操作按钮区 */}
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <button 
          onClick={onReset}
          className="text-gray-500 font-medium text-lg px-4 py-2 bg-white rounded-full shadow-sm active:scale-95 transition-transform"
        >
          重新上传
        </button>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 font-medium text-lg px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform ${isEditing ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
        >
          {isEditing ? <CheckCircle2 size={20}/> : <Edit3 size={20}/>}
          {isEditing ? '完成修改' : '修改信息'}
        </button>
      </div>

      {/* 乘车卡片 */}
      <div 
        ref={cardRef} 
        className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 sm:p-8"
      >
        {/* 顶部：站点信息 */}
        <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-gray-200 pb-8 gap-2">
          <div className="flex-1 min-w-0 text-center">
            {isEditing ? (
              <input 
                className="w-full min-w-0 text-center text-3xl sm:text-4xl font-black text-gray-900 border-b-2 border-blue-400 focus:outline-none bg-blue-50/50 rounded py-1 transition-colors" 
                value={info.departureStation} 
                onChange={e => handleChange(e, 'departureStation')}
                placeholder="出发站"
              />
            ) : (
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight break-words">
                {info.departureStation || '未知站'}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center shrink-0 px-2">
            <div className="text-gray-400 font-bold mb-1 text-sm tracking-widest">
              {isEditing ? (
                <input 
                  className="w-full min-w-[80px] text-center text-xl font-bold text-blue-600 border-b-2 border-blue-400 focus:outline-none bg-blue-50/50 rounded py-0.5" 
                  value={info.trainNumber} 
                  onChange={e => handleChange(e, 'trainNumber')}
                  placeholder="车次"
                />
              ) : (
                <span className="text-2xl text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{info.trainNumber || '未知车次'}</span>
              )}
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full my-2 relative">
               <div className="absolute right-0 -top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center">
            {isEditing ? (
              <input 
                className="w-full min-w-0 text-center text-3xl sm:text-4xl font-black text-gray-900 border-b-2 border-blue-400 focus:outline-none bg-blue-50/50 rounded py-1 transition-colors" 
                value={info.arrivalStation} 
                onChange={e => handleChange(e, 'arrivalStation')}
                placeholder="到达站"
              />
            ) : (
              <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight break-words">
                {info.arrivalStation || '未知站'}
              </div>
            )}
          </div>
        </div>

        {/* 核心信息区 */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl gap-4">
            <span className="text-xl text-gray-500 font-medium shrink-0 whitespace-nowrap">发车时间</span>
            <div className="flex flex-col items-end flex-1 min-w-0">
              {isEditing ? (
                <>
                   <input className="w-full max-w-[150px] text-right text-lg text-gray-500 border-b border-blue-300 focus:outline-none mb-1 bg-transparent py-0.5" value={info.date} onChange={e => handleChange(e, 'date')} placeholder="日期"/>
                   <input className="w-full max-w-[150px] text-right text-4xl font-black text-gray-900 border-b border-blue-300 focus:outline-none bg-transparent py-0.5" value={info.time} onChange={e => handleChange(e, 'time')} placeholder="时间"/>
                </>
              ) : (
                <>
                  <span className="text-xl text-gray-600 font-bold mb-1 truncate max-w-full">{info.date || '未知日期'}</span>
                  <span className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight">{info.time || '--:--'}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl gap-4">
            <span className="text-xl text-gray-500 font-medium shrink-0 whitespace-nowrap">座位号</span>
            <div className="flex-1 min-w-0 flex justify-end">
              {isEditing ? (
                <input 
                  className="w-full max-w-[200px] text-right text-2xl sm:text-3xl font-black text-gray-900 border-b border-blue-300 focus:outline-none bg-transparent py-0.5" 
                  value={info.seat} 
                  onChange={e => handleChange(e, 'seat')}
                  placeholder="座位号"
                />
              ) : (
                <div className="text-right text-2xl sm:text-3xl font-black text-gray-900 break-words leading-tight">{info.seat || '无座'}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* 底部提示语 */}
        <div className="mt-8 text-center text-gray-400 text-sm font-medium">
          请提前到达检票口等候
        </div>
      </div>

      {/* 极简超大保存按钮 */}
      <button 
        onClick={handleDownload}
        className="mt-8 w-full bg-blue-600 text-white rounded-3xl py-6 flex items-center justify-center gap-3 text-2xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
        style={{ minHeight: '80px' }}
      >
        <Download size={32} strokeWidth={2.5}/>
        保存到相册
      </button>
      
      {/* 底部温馨提示 */}
      <p className="mt-6 text-gray-500 text-lg font-medium">
        直接向工作人员展示此卡片即可
      </p>
    </div>
  );
}
