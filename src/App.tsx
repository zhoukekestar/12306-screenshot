import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, Loader2 } from 'lucide-react';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    
    // TODO: 调用 tesseract.js 解析图片
    // 模拟进度条
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    // 模拟处理完成
    setTimeout(() => {
      clearInterval(interval);
      setIsProcessing(false);
      setProgress(100);
      alert('模拟解析成功！接下来会显示超大字号结果卡片。');
    }, 2000);
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex flex-col items-center justify-center p-4 selection:bg-blue-200">
      
      {/* 隐藏的文件上传输入框 */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />

      <div className="w-full max-w-md flex flex-col items-center">
        {/* 标题部分 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">乘车信息提取</h1>
          <p className="text-xl text-gray-600 font-medium">看清车次，轻松出行</p>
        </div>

        {/* 核心交互区 */}
        <div className="w-full relative">
          {!isProcessing ? (
            // 上传按钮状态
            <button
              onClick={handleClickUpload}
              className="w-full aspect-square md:aspect-video bg-white rounded-3xl shadow-sm border-2 border-dashed border-blue-400 flex flex-col items-center justify-center transition-all active:scale-95 active:shadow-inner"
              style={{ minHeight: '300px' }} // 确保极大的点击热区
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <UploadCloud size={48} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-bold text-gray-800 mb-3">点击上传截图</span>
              <span className="text-lg text-gray-500 font-medium flex items-center gap-2">
                <FileImage size={20} /> 支持手机相册选图
              </span>
            </button>
          ) : (
            // 处理中状态
            <div 
              className="w-full aspect-square md:aspect-video bg-white rounded-3xl shadow-sm border-2 border-transparent flex flex-col items-center justify-center"
              style={{ minHeight: '300px' }}
            >
              <Loader2 size={64} className="text-blue-500 animate-spin mb-6" strokeWidth={2} />
              <span className="text-2xl font-bold text-gray-800 mb-4">正在提取关键信息...</span>
              
              {/* 进度条 */}
              <div className="w-3/4 max-w-[280px] h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="mt-3 text-lg text-gray-500 font-medium">{progress}%</span>
            </div>
          )}
        </div>

        {/* 底部温馨提示 (适老化超大字体) */}
        {!isProcessing && (
          <div className="mt-12 text-center px-4">
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              请上传包含车次和座位的<br/><strong className="text-gray-700">12306 官方订单截图</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
