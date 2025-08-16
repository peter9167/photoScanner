import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [selectedFeature, setSelectedFeature] = useState('photo-to-video');
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'photo-to-video'
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedVideoStyle, setSelectedVideoStyle] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1min');
  const [videoPrompt, setVideoPrompt] = useState('');
  const fileInputRef = useRef(null);

  // 샘플 갤러리 데이터
  const sampleGallery = [
    {
      id: 1,
      title: "돌잔치",
      subtitle: "성장 기록",
      emoji: "🎂",
      gradient: "from-pink-500 to-purple-600",
      description: "아이의 첫 번째 생일을 감동적인 영상으로",
      image: "https://cdn.pixabay.com/photo/2023/03/14/23/56/kids-7853414_1280.jpg"
    },
    {
      id: 2,
      title: "칠순잔치",
      subtitle: "축하 영상",
      emoji: "🎉",
      gradient: "from-yellow-500 to-orange-600",
      description: "어르신의 소중한 순간을 기록하여",
      image: "https://images.pexels.com/photos/5774920/pexels-photo-5774920.jpeg"
    },
    {
      id: 3,
      title: "가족 여행",
      subtitle: "추억 보관함",
      emoji: "✈️",
      gradient: "from-blue-500 to-teal-600",
      description: "함께한 여행의 모든 순간을 하나로",
      image: "https://images.pexels.com/photos/39691/family-pier-man-woman-39691.jpeg"
    },
    {
      id: 4,
      title: "학창시절 다큐멘터리",
      subtitle: "청춘 기록",
      emoji: "🎓",
      gradient: "from-green-500 to-blue-600",
      description: "잊지 못할 학창시절 추억들을 영상으로",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop&crop=center"
    }
  ];

  // 영상 스타일 데이터
  const videoStyles = [
    {
      id: 1,
      name: "클래식",
      description: "우아하고 감성적인 스타일",
      preview: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      name: "모던",
      description: "깔끔하고 현대적인 스타일",
      preview: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 3,
      name: "시네마틱",
      description: "영화같은 드라마틱한 스타일",
      preview: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200&fit=crop",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: 4,
      name: "빈티지",
      description: "따뜻하고 클래식한 느낌",
      preview: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      color: "from-green-500 to-teal-500",
    }
  ];

  // 영상 시간 옵션
  const videoDurations = [
    { id: 1, label: "1min", value: "1min" },
    { id: 2, label: "3min", value: "3min" },
    { id: 3, label: "5min", value: "5min" },
    { id: 4, label: "5~10min", value: "5-10min" },
    { id: 5, label: "10~20min", value: "10-20min" },
    { id: 6, label: "20~30min", value: "20-30min" }
  ];

  // 이미지 업로드 처리
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: e.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 이미지 삭제
  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const event = { target: { files: imageFiles } };
      handleImageUpload(event);
    }
  };

  // 파일 선택 트리거
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 영상 생성 가능 여부 확인
  const canGenerateVideo = uploadedImages.length > 0;

  // 영상 생성 처리
  const handleGenerateVideo = () => {
    if (!canGenerateVideo) {
      alert('먼저 사진을 업로드해주세요.');
      return;
    }
    
    const generationData = {
      images: uploadedImages,
      prompt: videoPrompt,
      style: selectedVideoStyle,
      duration: selectedDuration
    };
    
    console.log('영상 생성 데이터:', generationData);
    alert(`영상 생성을 시작합니다!\n\n사진: ${uploadedImages.length}장\n스타일: ${videoStyles.find(s => s.id === selectedVideoStyle)?.name || '선택 안함'}\n길이: ${selectedDuration}\n프롬프트 길이: ${videoPrompt.length}자`);
  };

  const renderPhotoToVideoPage = () => (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card-bg border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentPage('home')}
              className="w-10 h-10 rounded-lg bg-card-hover hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">사진을 영상으로</h1>
              <p className="text-text-secondary">AI가 여러분의 소중한 사진들을 감동적인 영상으로 만들어드립니다</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-card-hover hover:bg-gray-600 text-text-primary rounded-lg transition-colors">
              저장하기
            </button>
            <button 
              onClick={handleGenerateVideo}
              disabled={!canGenerateVideo}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                canGenerateVideo 
                  ? 'bg-primary hover:bg-primary-hover text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              영상 생성
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Photo Upload Section */}
        <div className="bg-card-bg rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
            <span className="mr-3">📸</span>
            사진 업로드
          </h2>
          
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Left Side - Photo Upload */}
             <div className="space-y-6">
               {/* Upload Area */}
               <div className="relative group">
                 <input
                   ref={fileInputRef}
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={handleImageUpload}
                   className="hidden"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                 <div 
                   className="relative bg-gradient-to-br from-card-bg via-card-bg to-card-hover rounded-2xl p-6 border border-gray-600/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group-hover:shadow-2xl"
                   onDragOver={handleDragOver}
                   onDrop={handleDrop}
                   onClick={triggerFileSelect}
                 >
                   
                   {/* Floating Icons Animation */}
                   <div className="absolute top-3 left-4 w-3 h-3 bg-primary/20 rounded-full animate-pulse"></div>
                   <div className="absolute top-5 right-6 w-2 h-2 bg-purple-500/20 rounded-full animate-pulse delay-300"></div>
                   <div className="absolute bottom-4 left-6 w-2 h-2 bg-pink-500/20 rounded-full animate-pulse delay-700"></div>
                   
                   <div className="text-center">
                     {/* Main Icon */}
                     <div className="relative mx-auto mb-4">
                       <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary via-orange-400 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                       </div>
                       <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                         <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                         </svg>
                       </div>
                     </div>

                     {/* Text Content */}
                     <div className="space-y-2">
                       <h3 className="text-xl font-bold text-text-primary">
                         사진을 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">업로드</span>하세요
                       </h3>
                       <p className="text-text-secondary text-sm">드래그 앤 드롭하거나 클릭해서 파일을 선택하세요</p>
                       <div className="flex items-center justify-center space-x-3 text-xs text-text-secondary">
                         <span className="flex items-center">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                           JPG, PNG
                         </span>
                         <span className="flex items-center">
                           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                           최대 10MB
                         </span>
                         <span className="flex items-center">
                           <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1"></span>
                           고품질
                         </span>
                       </div>
                     </div>

                     {/* Action Button */}
                     <button className="mt-4 px-6 py-2 bg-gradient-to-r from-primary to-orange-400 hover:from-primary-hover hover:to-orange-500 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm">
                       <span className="flex items-center justify-center">
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                         </svg>
                         파일 선택하기
                       </span>
                     </button>
                   </div>
                 </div>
               </div>

               {/* Photo Preview with Enhanced Design */}
               {uploadedImages.length > 0 && (
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-text-primary">업로드된 사진 ({uploadedImages.length}장)</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {uploadedImages.map((image) => (
                       <div key={image.id} className="relative group">
                         <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                         <div className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer transform group-hover:scale-105 transition-all duration-300">
                           <img 
                             src={image.url}
                             alt={image.name}
                             className="w-full h-full object-cover"
                           />
                           
                           {/* Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                           
                           {/* Delete Button */}
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               removeImage(image.id);
                             }}
                             className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                           >
                             <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                             </svg>
                           </button>
                           
                           {/* Success Badge */}
                           <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center">
                             <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                             완료
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* Right Side - Video Description */}
             <div className="flex flex-col">
               <div className="relative h-full">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm"></div>
                 <div className="relative bg-card-bg/80 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 h-full flex flex-col">
                   <div className="flex items-center mb-4">
                     <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                       <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                     </div>
                     <h3 className="text-lg font-semibold text-text-primary">영상 설명</h3>
                     <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">선택사항</span>
                   </div>
                   
                   <div className="flex-1 flex flex-col">
                     <textarea 
                       value={videoPrompt}
                       onChange={(e) => setVideoPrompt(e.target.value)}
                       placeholder="당신의 특별한 순간을 어떤 이야기로 만들고 싶으신가요?&#13;&#10;🎂 할아버지 칠순잔치 예시:&#10;&quot;평생 농사를 지으며 가족을 키워내신 할아버지의 칠순을 맞아, 온 가족이 모였습니다. 할아버지께서 손수 쓰신 초대장처럼 따뜻하고 정성스러운 영상을 만들어주세요. 젊은 시절 흑백사진부터 지금까지의 추억들이 담긴 감동적인 이야기로...&quot;&#13;&#10;👶 돌잔치 예시:&#10;&quot;우리 아이의 첫 번째 생일, 온 가족의 사랑을 받으며 자라온 소중한 365일의 기록입니다. 아이의 첫 미소, 첫 걸음마까지 모든 순간이 기적같았어요. 밝고 사랑스러운 분위기로 아이의 성장 스토리를 담아주세요.&quot;&#13;&#10;✈️ 가족여행 예시:&#10;&quot;3년 만에 온 가족이 함께한 제주도 여행. 코로나로 힘들었던 시간을 뒤로하고 다시 웃을 수 있었던 소중한 시간이었습니다. 바다와 함께한 자유로운 순간들, 아이들의 환한 웃음소리가 들리는 듯한 영상으로 만들어주세요.&quot;"
                       className="flex-1 w-full bg-card-hover/50 border border-gray-600/50 rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary/50 focus:bg-card-hover/70 transition-all resize-none text-sm leading-relaxed min-h-[200px]"
                     />
                     
                     <div className="flex items-center justify-between mt-3">
                       <div className="flex items-center space-x-4 text-xs text-text-secondary">
                         <span className="flex items-center">
                           <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                           </svg>
                           AI가 더 정확한 영상을 만들 수 있어요
                         </span>
                       </div>
                       <span className="text-xs text-text-secondary">{videoPrompt.length}/500자</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Style Selection */}
         <div className="bg-card-bg rounded-xl p-6 border border-gray-700">
           <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
             <span className="mr-3">🎨</span>
             스타일 선택
           </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoStyles.map((style) => (
              <div 
                key={style.id} 
                onClick={() => setSelectedVideoStyle(style.id)}
                className={`relative rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors ${
                  selectedVideoStyle === style.id 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-transparent hover:border-primary'
                }`}
              >
                <div 
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url(${style.preview})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-white text-sm">{style.name}</h3>
                    <p className="text-white/80 text-xs">{style.description}</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

                 {/* Video Duration */}
         <div className="bg-card-bg rounded-xl p-6 border border-gray-700">
           <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center">
             <span className="mr-3">⏱️</span>
             Video duration
           </h2>
           
           <div className="flex flex-wrap gap-3 justify-center">
             {videoDurations.map((duration) => (
               <button
                 key={duration.id}
                 onClick={() => setSelectedDuration(duration.value)}
                 className={`px-6 py-3 rounded-lg border transition-all font-medium ${
                   selectedDuration === duration.value
                     ? 'bg-yellow-500 text-dark-bg border-yellow-500'
                     : 'bg-transparent text-text-primary border-gray-600 hover:border-yellow-500/50 hover:bg-yellow-500/10'
                 }`}
               >
                 {duration.label}
               </button>
             ))}
           </div>
         </div>

        {/* Generation Button */}
        <div className="text-center">
          <button 
            onClick={handleGenerateVideo}
            disabled={!canGenerateVideo}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all transform shadow-lg ${
              canGenerateVideo 
                ? 'bg-gradient-to-r from-primary to-orange-400 hover:from-primary-hover hover:to-orange-500 text-white hover:scale-105' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="mr-3">✨</span>
            AI 영상 생성하기
          </button>
          <p className="text-text-secondary text-sm mt-2">
            {canGenerateVideo 
              ? '예상 생성 시간: 2-3분' 
              : '사진을 업로드하면 영상을 생성할 수 있습니다'
            }
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-card-bg border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">📸</span>
            </div>
            <span className="text-xl font-bold">PhotoMemory AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <div 
              className={`flex items-center space-x-2 mb-4 px-3 py-2 rounded-lg cursor-pointer ${
                currentPage === 'home' ? 'bg-primary/10' : 'hover:bg-card-hover'
              }`}
              onClick={() => setCurrentPage('home')}
            >
              <span className={`w-2 h-2 rounded-full ${currentPage === 'home' ? 'bg-primary' : 'bg-gray-500'}`}></span>
              <span className={`font-medium ${currentPage === 'home' ? 'text-primary' : 'text-text-primary'}`}>홈</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-text-secondary text-sm font-medium px-3 mb-3">AI 생성</div>
            
            <button 
              onClick={() => {
                setSelectedFeature('photo-to-video');
                setCurrentPage('photo-to-video');
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                selectedFeature === 'photo-to-video' && currentPage === 'photo-to-video' ? 'bg-card-hover' : 'hover:bg-card-hover'
              }`}
            >
              <span className="text-2xl">🎬</span>
              <span>사진을 영상으로</span>
            </button>

            <button 
              onClick={() => setSelectedFeature('memory-story')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                selectedFeature === 'memory-story' ? 'bg-card-hover' : 'hover:bg-card-hover'
              }`}
            >
              <span className="text-2xl">📖</span>
              <span>추억 스토리</span>
            </button>

            <button 
              onClick={() => setSelectedFeature('ai-enhance')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                selectedFeature === 'ai-enhance' ? 'bg-card-hover' : 'hover:bg-card-hover'
              }`}
            >
              <span className="text-2xl">✨</span>
              <span>AI 향상</span>
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <div className="text-text-secondary text-sm font-medium px-3 mb-3">크리에이티브</div>
            
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-orange-400 rounded-full flex items-center justify-center text-xs">
                📸
              </div>
              <span className="text-sm">PhotoMemory AI</span>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex items-center space-x-2 text-primary text-sm">
            <span>⚡</span>
            <span>업그레이드</span>
            <span className="bg-primary text-dark-bg px-2 py-1 rounded text-xs font-bold">✨</span>
          </div>
          <div className="text-text-secondary text-xs">
            개인정보처리방침 | 이용약관
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentPage === 'photo-to-video' ? renderPhotoToVideoPage() : (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-card-bg border-b border-gray-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  AI로 마법같은 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                    추억을 영상으로
                  </span>
                </h1>
                <p className="text-text-secondary text-lg">
                  소중한 사진들을 감동적인 영상으로 변환하세요
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentPage('photo-to-video')}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  무료 체험
                </button>
                <div className="flex items-center space-x-2 text-text-secondary">
                  <span>🔥 300</span>
                  <span>👤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Feature Cards */}
              <div 
                className="bg-gradient-to-br from-card-bg to-card-hover rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => setCurrentPage('photo-to-video')}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-text-secondary text-sm">생성</span>
                    <h3 className="text-xl font-semibold mb-2">사진을 영상으로</h3>
                    <p className="text-text-secondary">
                      단 몇 장의 사진만으로도 AI가 감동적인 영상을 생성합니다.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-orange-400 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    🎬
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-card-bg to-card-hover rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-text-secondary text-sm">생성</span>
                    <h3 className="text-xl font-semibold mb-2">추억 스토리</h3>
                    <p className="text-text-secondary">
                      사진 속 이야기를 AI가 자동으로 구성하여 완성된 스토리로 만듭니다.
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    📖
                  </div>
                </div>
              </div>
            </div>

            {/* Video Preview Section */}
            <div className="bg-card-bg rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-3">✨</span>
                크리에이티브
              </h2>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Main Video Area */}
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                  <div className="z-10 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                      </svg>
                    </div>
                    <p className="text-white text-lg font-medium">PhotoMemory AI</p>
                    <p className="text-white/70">미리보기</p>
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white/20 rounded-full px-4 py-1 text-sm">
                        00:33 / 00:33
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Gallery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">샘플 갤러리</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sampleGallery.map((sample) => (
                      <div 
                        key={sample.id} 
                        className="relative aspect-video rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                      >
                        {/* Background Image */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                          style={{ backgroundImage: `url(${sample.image})` }}
                        ></div>
                        
                        {/* Gradient Overlay for brand identity */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${sample.gradient} opacity-60 mix-blend-overlay`}></div>
                        
                        {/* 텍스트 가독성 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-between p-3">
                          <div className="flex justify-between items-start">
                            <div className="text-white text-xs bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                              {sample.subtitle}
                            </div>
                            <div className="text-2xl group-hover:scale-110 transition-transform drop-shadow-lg">
                              {sample.emoji}
                            </div>
                          </div>
                          
                          <div className="text-white">
                            <div className="font-bold text-sm mb-1 drop-shadow-md">{sample.title}</div>
                            <div className="text-xs text-white/90 line-clamp-2 drop-shadow-sm">
                              {sample.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Category Gallery */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">인기 카테고리</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sampleGallery.map((category) => (
                    <div 
                      key={category.id} 
                      className="bg-gradient-to-br from-card-hover to-gray-800 rounded-lg p-4 text-center hover:scale-105 transition-all cursor-pointer group border border-gray-700 hover:border-primary/30"
                      onClick={() => setCurrentPage('photo-to-video')}
                    >
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {category.emoji}
                      </div>
                      <div className="text-sm font-medium mb-1">{category.title}</div>
                      <div className="text-xs text-text-secondary">
                        {category.subtitle}
                      </div>
                      <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        샘플 보기 →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
