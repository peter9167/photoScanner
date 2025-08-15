import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './PhotoAnalysis.css';

// WARNING: DO NOT EXPOSE YOUR API KEY PUBLICLY.
// This is for local testing ONLY. Remove or secure via a backend for production.
const GEMINI_API_KEY = 'AIzaSyDkx4L2FvHs8Xqd_YSuhVCPhU0rx37PHZM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Helper function to convert file to base64
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

function PhotoAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(selectedFile);
      const prompt = "이 사진을 자세히 설명해주세요. 사진 속에 무엇이 있는지, 어떤 분위기인지, 어떤 감정이 느껴지는지 알려주세요. 마크다운 형식(예: **중요한 부분**)을 사용하여 강조할 부분을 표시해주세요. 또한, 이 사진과 관련하여 사용자와 상호작용할 수 있는 창의적인 활동이나 질문 3가지를 제안해주세요.";
      
      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              imagePart,
            ],
          },
        ],
        // Optional: Add generationConfig if needed
        // generationConfig: {
        //   maxOutputTokens: 2048,
        //   temperature: 0.4,
        //   topP: 1,
        //   topK: 32
        // }
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
      }

      const responseData = await response.json();
      
      if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content) {
        const parts = responseData.candidates[0].content.parts;
        let fullTextResponse = "";
        parts.forEach(part => {
          if (part.text) {
            fullTextResponse += part.text + '\n';
          }
        });

        setAnalysisResult({
          fileName: selectedFile.name,
          apiResponseText: fullTextResponse.trim(),
          // You might want to parse more structured data if the API provides it,
          // or use further prompts to get structured JSON.
          // For now, we display the raw text response.
        });
      } else if (responseData.promptFeedback && responseData.promptFeedback.blockReason) {
        setError(`분석이 차단되었습니다: ${responseData.promptFeedback.blockReason} - ${responseData.promptFeedback.safetyRatings?.map(r => `${r.category} (${r.probability})`).join(', ') || '세부 정보 없음'}`);
      } else {
        console.warn("Unexpected API response structure:", responseData);
        setError('AI 분석 결과를 가져왔으나, 예상치 못한 응답 구조입니다.');
      }

    } catch (err) {
      console.error("Error during API call:", err);
      setError(`분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  return (
    <section className="photo-analysis-section">
      <h2>📸 사진 분석 및 상호작용</h2>
      
      <div className="upload-area">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="업로드된 사진 미리보기" />
          </div>
        )}
      </div>

      <button 
        className="analysis-button" 
        onClick={handleAnalysis} 
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? 'Gemini AI 분석 중...' : 'AI 분석 시작'}
      </button>

      {isLoading && <p className="loading-message">Gemini AI가 사진을 분석하고 있습니다. 잠시만 기다려 주세요...</p>}
      {error && <p className="error-message" style={{color: 'red', textAlign: 'center', whiteSpace: 'pre-wrap'}}>{error}</p>}

      {analysisResult && (
        <div className="analysis-result">
          <h3>AI 분석 결과</h3>
          <p><strong>파일명:</strong> {analysisResult.fileName}</p>
          <h4>AI의 분석 내용:</h4>
          <div className="markdown-content">
            <ReactMarkdown>{analysisResult.apiResponseText}</ReactMarkdown>
          </div>
        </div>
      )}
    </section>
  );
}

export default PhotoAnalysis; 