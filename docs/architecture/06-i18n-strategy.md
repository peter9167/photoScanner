# Multi-Language (i18n) Implementation Strategy

## 🌍 Internationalization Overview

PhotoMemory AI supports multiple languages with a comprehensive i18n strategy that covers UI, user-generated content, and AI-generated content.

### 🎯 Supported Languages

**Phase 1 (Launch)**
- 🇺🇸 English (en) - Default
- 🇰🇷 Korean (ko) - Primary market
- 🇯🇵 Japanese (ja) - Early expansion

**Phase 2 (Expansion)**
- 🇨🇳 Chinese Simplified (zh-CN)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

### 📊 i18n Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │react-i18next│  │ Locale      │  │ Number/Date │                │
│  │  (UI Text)  │  │ Detection   │  │ Formatting  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        Application Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Content   │  │ Translation │  │    Email    │                │
│  │ Translation │  │  Service    │  │ Templates   │                │
│  │   Service   │  │             │  │   (i18n)    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          Domain Layer                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Multilingual│  │  Language   │  │   Locale    │                │
│  │    Text     │  │ Value Object│  │  Settings   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Translation │  │   Database  │  │  External   │                │
│  │   Storage   │  │  (JSONB)    │  │Translation  │                │
│  │   (Redis)   │  │             │  │  APIs       │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Frontend i18n Implementation

### React-i18next Setup

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from './locales/en.json';
import koTranslations from './locales/ko.json';
import jaTranslations from './locales/ja.json';

const resources = {
  en: { translation: enTranslations },
  ko: { translation: koTranslations },
  ja: { translation: jaTranslations }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation', 'validation', 'video', 'billing']
  });

export default i18n;
```

### Translation File Structure

```json
// src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "navigation": {
    "home": "Home",
    "projects": "Projects",
    "profile": "Profile",
    "billing": "Billing"
  },
  "video": {
    "title": "Video Title",
    "description": "Video Description",
    "style": {
      "classic": "Classic",
      "modern": "Modern", 
      "cinematic": "Cinematic",
      "vintage": "Vintage"
    },
    "duration": {
      "1min": "1 minute",
      "3min": "3 minutes",
      "5min": "5 minutes"
    },
    "generation": {
      "start": "Generate Video",
      "progress": "Generating... {{progress}}%",
      "complete": "Video Ready!"
    }
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "photoLimit": "Maximum {{max}} photos allowed",
    "fileSize": "File size must be less than {{size}}MB"
  },
  "billing": {
    "plans": {
      "free": "Free Plan",
      "pro": "Pro Plan",
      "enterprise": "Enterprise Plan"
    },
    "features": {
      "videos_per_month": "{{count}} videos per month",
      "storage": "{{amount}} GB storage",
      "no_watermark": "No watermark"
    }
  }
}
```

```json
// src/i18n/locales/ko.json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "loading": "로딩 중...",
    "error": "오류가 발생했습니다"
  },
  "navigation": {
    "home": "홈",
    "projects": "프로젝트",
    "profile": "프로필",
    "billing": "결제"
  },
  "video": {
    "title": "영상 제목",
    "description": "영상 설명",
    "style": {
      "classic": "클래식",
      "modern": "모던", 
      "cinematic": "시네마틱",
      "vintage": "빈티지"
    },
    "duration": {
      "1min": "1분",
      "3min": "3분",
      "5min": "5분"
    },
    "generation": {
      "start": "영상 생성하기",
      "progress": "생성 중... {{progress}}%",
      "complete": "영상 완성!"
    }
  },
  "validation": {
    "required": "필수 입력 항목입니다",
    "email": "올바른 이메일 주소를 입력해주세요",
    "photoLimit": "최대 {{max}}장까지 업로드 가능합니다",
    "fileSize": "파일 크기는 {{size}}MB 이하여야 합니다"
  },
  "billing": {
    "plans": {
      "free": "무료 플랜",
      "pro": "프로 플랜",
      "enterprise": "기업 플랜"
    },
    "features": {
      "videos_per_month": "월 {{count}}개 영상",
      "storage": "{{amount}}GB 저장공간",
      "no_watermark": "워터마크 없음"
    }
  }
}
```

### Custom i18n Hooks

```typescript
// src/hooks/useTranslation.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth.store';

export function useTranslation(namespace?: string) {
  const { user } = useAuthStore();
  const { t, i18n, ...rest } = useI18nTranslation(namespace);
  
  // Sync with user's preferred language
  const changeLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
    if (user) {
      // Update user preference in database
      await updateUserLanguage(user.id, language);
    }
  };
  
  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language,
    ...rest
  };
}

// Language-aware formatting utilities
export function useLocalization() {
  const { i18n } = useI18nTranslation();
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  };
  
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };
  
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency
    }).format(amount);
  };
  
  const formatFileSize = (bytes: number) => {
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatFileSize,
    locale: i18n.language
  };
}
```

### Component Usage Examples

```typescript
// src/components/VideoProjectForm.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalization } from '@/hooks/useLocalization';

const VideoProjectForm: React.FC = () => {
  const { t } = useTranslation();
  const { formatFileSize } = useLocalization();
  
  return (
    <form>
      <div className="form-group">
        <label>{t('video.title')}</label>
        <input 
          type="text" 
          placeholder={t('video.title')}
          required
        />
      </div>
      
      <div className="form-group">
        <label>{t('video.description')}</label>
        <textarea 
          placeholder={t('video.description')}
        />
      </div>
      
      <div className="style-selector">
        <h3>{t('video.style.title')}</h3>
        {videoStyles.map(style => (
          <button key={style.id}>
            {t(`video.style.${style.id}`)}
          </button>
        ))}
      </div>
      
      <div className="file-upload">
        <p>{t('validation.fileSize', { size: formatFileSize(10 * 1024 * 1024) })}</p>
      </div>
      
      <button type="submit">
        {t('video.generation.start')}
      </button>
    </form>
  );
};
```

## 🗄️ Backend i18n Implementation

### Domain Layer - Multilingual Value Objects

```typescript
// domain/value-objects/common/Language.ts
export class Language {
  static readonly EN = new Language('en', 'English');
  static readonly KO = new Language('ko', '한국어');
  static readonly JA = new Language('ja', '日本語');
  static readonly ZH_CN = new Language('zh-cn', '中文(简体)');
  
  private constructor(
    public readonly code: string,
    public readonly nativeName: string
  ) {}
  
  static fromCode(code: string): Language {
    switch (code.toLowerCase()) {
      case 'en': return Language.EN;
      case 'ko': return Language.KO;
      case 'ja': return Language.JA;
      case 'zh-cn': return Language.ZH_CN;
      default: return Language.EN;
    }
  }
  
  static getSupportedLanguages(): Language[] {
    return [Language.EN, Language.KO, Language.JA, Language.ZH_CN];
  }
}

// domain/value-objects/common/MultilingualText.ts
export class MultilingualText {
  private readonly texts: Map<string, string>;
  
  constructor(defaultText: string, defaultLanguage: Language) {
    this.texts = new Map();
    this.texts.set(defaultLanguage.code, defaultText);
  }
  
  static fromObject(obj: Record<string, string>): MultilingualText {
    const text = new MultilingualText('', Language.EN);
    text.texts.clear();
    Object.entries(obj).forEach(([lang, content]) => {
      text.texts.set(lang, content);
    });
    return text;
  }
  
  addTranslation(language: Language, text: string): void {
    this.texts.set(language.code, text);
  }
  
  getText(language: Language): string {
    return this.texts.get(language.code) || 
           this.texts.get(Language.EN.code) || 
           '';
  }
  
  getAllTexts(): Record<string, string> {
    return Object.fromEntries(this.texts);
  }
  
  hasTranslation(language: Language): boolean {
    return this.texts.has(language.code);
  }
}
```

### Application Layer - Translation Services

```typescript
// application/services/TranslationService.ts
export interface ITranslationService {
  translateText(
    text: string, 
    fromLanguage: Language, 
    toLanguage: Language
  ): Promise<string>;
  
  translateMultiple(
    texts: string[], 
    fromLanguage: Language, 
    toLanguage: Language
  ): Promise<string[]>;
  
  detectLanguage(text: string): Promise<Language>;
  
  getSupportedLanguages(): Language[];
}

export class GoogleTranslateService implements ITranslationService {
  constructor(private apiKey: string) {}
  
  async translateText(
    text: string, 
    fromLanguage: Language, 
    toLanguage: Language
  ): Promise<string> {
    if (fromLanguage.code === toLanguage.code) {
      return text;
    }
    
    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: fromLanguage.code,
        target: toLanguage.code,
        format: 'text'
      })
    });
    
    const data = await response.json();
    return data.data.translations[0].translatedText;
  }
  
  async translateMultiple(
    texts: string[], 
    fromLanguage: Language, 
    toLanguage: Language
  ): Promise<string[]> {
    // Implementation for batch translation
    const translations = await Promise.all(
      texts.map(text => this.translateText(text, fromLanguage, toLanguage))
    );
    return translations;
  }
  
  async detectLanguage(text: string): Promise<Language> {
    const response = await fetch('https://translation.googleapis.com/language/translate/v2/detect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: text })
    });
    
    const data = await response.json();
    const detectedLang = data.data.detections[0][0].language;
    return Language.fromCode(detectedLang);
  }
  
  getSupportedLanguages(): Language[] {
    return Language.getSupportedLanguages();
  }
}
```

### Use Case Implementation

```typescript
// application/use-cases/video-generation/CreateVideoProjectCommand.ts
export class CreateVideoProjectCommand {
  constructor(
    private videoRepository: IVideoProjectRepository,
    private translationService: ITranslationService,
    private userRepository: IUserRepository
  ) {}
  
  async execute(request: CreateVideoProjectRequest): Promise<VideoProjectDto> {
    const user = await this.userRepository.findById(request.userId);
    if (!user) throw new UserNotFoundException();
    
    // Create multilingual text
    const title = new MultilingualText(request.title, user.language);
    const description = new MultilingualText(request.description, user.language);
    
    // Auto-translate to supported languages if requested
    if (request.autoTranslate) {
      const supportedLanguages = Language.getSupportedLanguages()
        .filter(lang => lang.code !== user.language.code);
      
      for (const targetLang of supportedLanguages) {
        try {
          const translatedTitle = await this.translationService.translateText(
            request.title, user.language, targetLang
          );
          const translatedDescription = await this.translationService.translateText(
            request.description, user.language, targetLang
          );
          
          title.addTranslation(targetLang, translatedTitle);
          description.addTranslation(targetLang, translatedDescription);
        } catch (error) {
          // Log error but don't fail the entire operation
          console.warn(`Translation failed for ${targetLang.code}:`, error);
        }
      }
    }
    
    const project = VideoProject.create({
      userId: request.userId,
      title,
      description,
      style: VideoStyle.fromString(request.style),
      duration: VideoDuration.fromMinutes(request.durationMinutes)
    });
    
    await this.videoRepository.save(project);
    
    return VideoProjectMapper.toDto(project, user.language);
  }
}
```

## 🎨 UI Components with i18n

### Language Selector Component

```typescript
// src/components/ui/LanguageSelector.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/domain/value-objects/Language';

interface LanguageSelectorProps {
  className?: string;
  showLabels?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className, 
  showLabels = true 
}) => {
  const { changeLanguage, currentLanguage } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-cn', name: '中文', flag: '🇨🇳' }
  ];
  
  return (
    <div className={`language-selector ${className}`}>
      <select 
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {showLabels ? lang.name : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
```

### Localized Date/Time Components

```typescript
// src/components/ui/LocalizedDateTime.tsx
import { useLocalization } from '@/hooks/useLocalization';

interface LocalizedDateTimeProps {
  date: Date;
  format?: 'short' | 'medium' | 'long' | 'relative';
  includeTime?: boolean;
}

const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({
  date,
  format = 'medium',
  includeTime = false
}) => {
  const { formatDate } = useLocalization();
  
  const getFormatOptions = (): Intl.DateTimeFormatOptions => {
    const baseOptions: Intl.DateTimeFormatOptions = {};
    
    switch (format) {
      case 'short':
        baseOptions.dateStyle = 'short';
        break;
      case 'medium':
        baseOptions.dateStyle = 'medium';
        break;
      case 'long':
        baseOptions.dateStyle = 'long';
        break;
      case 'relative':
        // Handle relative formatting separately
        return {};
    }
    
    if (includeTime) {
      baseOptions.timeStyle = 'short';
    }
    
    return baseOptions;
  };
  
  if (format === 'relative') {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return <span>{formatDate(date, { timeStyle: 'short' })}</span>;
    } else if (diffInHours < 24 * 7) {
      return <span>{formatDate(date, { weekday: 'short', timeStyle: 'short' })}</span>;
    }
  }
  
  const formattedDate = formatDate(date, getFormatOptions());
  
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {formattedDate}
    </time>
  );
};

export default LocalizedDateTime;
```

## 📧 Email Template Localization

```typescript
// application/services/EmailTemplateService.ts
export class EmailTemplateService {
  constructor(
    private templateEngine: ITemplateEngine,
    private translationService: ITranslationService
  ) {}
  
  async renderTemplate(
    templateId: string,
    data: any,
    language: Language
  ): Promise<string> {
    const template = await this.getTemplate(templateId, language);
    return this.templateEngine.render(template, data);
  }
  
  private async getTemplate(templateId: string, language: Language): Promise<string> {
    // Try to load language-specific template
    try {
      return await this.loadTemplate(`${templateId}.${language.code}`);
    } catch (error) {
      // Fallback to English template
      return await this.loadTemplate(`${templateId}.en`);
    }
  }
  
  private async loadTemplate(templatePath: string): Promise<string> {
    // Load from file system or database
    return fs.readFileSync(`templates/${templatePath}.hbs`, 'utf8');
  }
}

// Email templates structure
// templates/
//   video-generation-complete.en.hbs
//   video-generation-complete.ko.hbs
//   video-generation-complete.ja.hbs
//   subscription-welcome.en.hbs
//   subscription-welcome.ko.hbs
```

## 🔄 Migration Strategy

### Phase 1: Core Implementation
1. Set up react-i18next with English and Korean
2. Implement MultilingualText domain objects
3. Update database schema with JSONB i18n fields
4. Create translation service interfaces

### Phase 2: Content Translation
1. Translate all UI text to Korean and Japanese
2. Implement auto-translation for user content
3. Set up translation workflows for new content
4. Add language detection for user uploads

### Phase 3: Optimization
1. Implement translation caching
2. Add lazy loading for language packs
3. Set up automated translation pipelines
4. Add A/B testing for translations

### Phase 4: Advanced Features
1. Right-to-left (RTL) language support
2. Cultural adaptation (date formats, number formats)
3. Voice/audio localization for generated videos
4. Regional content customization

## 📊 Performance Considerations

### Frontend Optimization
```typescript
// Lazy loading language packs
const loadLanguagePack = async (language: string) => {
  const module = await import(`../locales/${language}.json`);
  return module.default;
};

// Component-level translation splitting
const useVideoTranslations = () => {
  const { t } = useTranslation('video');
  return t;
};
```

### Backend Caching Strategy
```typescript
// Translation caching service
export class CachedTranslationService implements ITranslationService {
  constructor(
    private translationService: ITranslationService,
    private cache: ICache
  ) {}
  
  async translateText(
    text: string, 
    fromLanguage: Language, 
    toLanguage: Language
  ): Promise<string> {
    const cacheKey = `translation:${fromLanguage.code}:${toLanguage.code}:${hash(text)}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const translated = await this.translationService.translateText(text, fromLanguage, toLanguage);
    
    // Cache for 24 hours
    await this.cache.set(cacheKey, translated, 86400);
    
    return translated;
  }
}
```

This comprehensive i18n strategy ensures:
- **Scalable Architecture**: Easy to add new languages
- **Performance**: Lazy loading and caching
- **User Experience**: Seamless language switching
- **Content Management**: Automated translation workflows
- **Cultural Adaptation**: Locale-aware formatting
- **Maintainability**: Clear separation of concerns