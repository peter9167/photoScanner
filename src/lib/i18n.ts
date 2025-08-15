import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success!',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      confirm: 'Confirm',
      close: 'Close',
    },
    navigation: {
      home: 'Home',
      projects: 'Projects',
      profile: 'Profile',
      billing: 'Billing',
      settings: 'Settings',
    },
    video: {
      title: 'Video Title',
      description: 'Video Description',
      play: 'Play',
      photos: 'photos',
      style: {
        classic: 'Classic',
        modern: 'Modern',
        cinematic: 'Cinematic',
        vintage: 'Vintage',
      },
      duration: {
        '1min': '1 minute',
        '3min': '3 minutes',
        '5min': '5 minutes',
      },
      generation: {
        start: 'Generate Video',
        progress: 'Generating... {{progress}}%',
        complete: 'Video Ready!',
      },
      status: {
        draft: 'Draft',
        processing: 'Processing',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Cancelled',
      },
    },
    upload: {
      title: 'Upload Photos',
      description: 'Drag and drop or click to select files',
      maxSize: 'Max size: {{size}}',
      maxFiles: 'Max {{count}} files',
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      photoLimit: 'Maximum {{max}} photos allowed',
      fileSize: 'File size must be less than {{size}}',
      fileType: 'Invalid file type',
    },
  },
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공!',
      edit: '편집',
      create: '생성',
      update: '업데이트',
      confirm: '확인',
      close: '닫기',
    },
    navigation: {
      home: '홈',
      projects: '프로젝트',
      profile: '프로필',
      billing: '결제',
      settings: '설정',
    },
    video: {
      title: '영상 제목',
      description: '영상 설명',
      play: '재생',
      photos: '장',
      style: {
        classic: '클래식',
        modern: '모던',
        cinematic: '시네마틱',
        vintage: '빈티지',
      },
      duration: {
        '1min': '1분',
        '3min': '3분',
        '5min': '5분',
      },
      generation: {
        start: '영상 생성하기',
        progress: '생성 중... {{progress}}%',
        complete: '영상 완성!',
      },
      status: {
        draft: '초안',
        processing: '처리 중',
        completed: '완료',
        failed: '실패',
        cancelled: '취소됨',
      },
    },
    upload: {
      title: '사진 업로드',
      description: '드래그 앤 드롭하거나 클릭해서 파일을 선택하세요',
      maxSize: '최대 크기: {{size}}',
      maxFiles: '최대 {{count}}개 파일',
    },
    validation: {
      required: '필수 입력 항목입니다',
      email: '올바른 이메일 주소를 입력해주세요',
      photoLimit: '최대 {{max}}장까지 업로드 가능합니다',
      fileSize: '파일 크기는 {{size}} 이하여야 합니다',
      fileType: '지원하지 않는 파일 형식입니다',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;