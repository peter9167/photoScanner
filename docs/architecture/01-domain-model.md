# Domain Model Design

## 🎯 Domain-Driven Design Implementation

### Bounded Contexts Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PhotoMemory AI Domain Model                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐      ┌─────────────────┐                    │
│  │      User       │      │     Video       │                    │
│  │   Management    │◄────►│   Generation    │                    │
│  │    Context      │      │    Context      │                    │
│  └─────────────────┘      └─────────────────┘                    │
│           ▲                        ▲                              │
│           │                        │                              │
│           ▼                        ▼                              │
│  ┌─────────────────┐      ┌─────────────────┐                    │
│  │    Payment      │      │     Media       │                    │
│  │    Context      │◄────►│   Management    │                    │
│  └─────────────────┘      │    Context      │                    │
│                           └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘
```

## 📋 Core Domain Entities

### 1. User Management Context

```typescript
// Aggregate Root
export class User {
  readonly id: UserId;
  email: Email;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: Subscription;
  
  constructor(props: UserProps) {
    this.validateInvariants(props);
    // ...
  }
  
  changeLanguage(language: Language): void {
    this.preferences.updateLanguage(language);
    this.addDomainEvent(new UserLanguageChanged(this.id, language));
  }
  
  upgradeSubscription(plan: SubscriptionPlan): void {
    this.subscription.upgrade(plan);
    this.addDomainEvent(new UserSubscriptionUpgraded(this.id, plan));
  }
}

// Value Objects
export class Email {
  private readonly value: string;
  
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
    this.value = value;
  }
  
  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

export class UserProfile {
  readonly displayName: string;
  readonly avatar?: string;
  readonly language: Language;
  readonly timezone: string;
  
  constructor(props: UserProfileProps) {
    this.validateProps(props);
    Object.assign(this, props);
  }
}

// Domain Events
export class UserCreated extends DomainEvent {
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
    public readonly language: Language
  ) {
    super();
  }
}
```

### 2. Video Generation Context

```typescript
// Aggregate Root
export class VideoProject {
  readonly id: ProjectId;
  readonly userId: UserId;
  title: MultilingualText;
  description: MultilingualText;
  photos: Photo[];
  style: VideoStyle;
  duration: VideoDuration;
  status: ProjectStatus;
  generatedVideos: GeneratedVideo[];
  
  constructor(props: VideoProjectProps) {
    this.validateBusinessRules(props);
    // ...
  }
  
  addPhoto(photo: Photo): void {
    if (this.photos.length >= MAX_PHOTOS_PER_PROJECT) {
      throw new PhotoLimitExceededError();
    }
    this.photos.push(photo);
    this.addDomainEvent(new PhotoAddedToProject(this.id, photo.id));
  }
  
  requestVideoGeneration(prompt: VideoPrompt): void {
    if (!this.canGenerateVideo()) {
      throw new InvalidProjectStateError();
    }
    this.status = ProjectStatus.Processing;
    this.addDomainEvent(new VideoGenerationRequested(this.id, prompt));
  }
  
  private canGenerateVideo(): boolean {
    return this.photos.length > 0 && 
           this.status === ProjectStatus.Draft;
  }
}

// Value Objects
export class VideoStyle {
  static readonly CLASSIC = new VideoStyle('classic');
  static readonly MODERN = new VideoStyle('modern');
  static readonly CINEMATIC = new VideoStyle('cinematic');
  static readonly VINTAGE = new VideoStyle('vintage');
  
  private constructor(public readonly value: string) {}
}

export class VideoDuration {
  private constructor(
    public readonly minutes: number,
    public readonly label: string
  ) {}
  
  static fromMinutes(minutes: number): VideoDuration {
    if (minutes < 1 || minutes > 30) {
      throw new InvalidVideoDurationError();
    }
    return new VideoDuration(minutes, `${minutes}min`);
  }
}

export class MultilingualText {
  private texts: Map<Language, string>;
  
  constructor(defaultText: string, language: Language) {
    this.texts = new Map([[language, defaultText]]);
  }
  
  addTranslation(language: Language, text: string): void {
    this.texts.set(language, text);
  }
  
  getText(language: Language): string {
    return this.texts.get(language) || 
           this.texts.get(Language.EN) || 
           '';
  }
}

// Domain Services
export interface VideoGenerationService {
  generateVideo(
    project: VideoProject,
    prompt: VideoPrompt
  ): Promise<GenerationResult>;
  
  getGenerationStatus(
    jobId: GenerationJobId
  ): Promise<GenerationStatus>;
}
```

### 3. Media Management Context

```typescript
// Aggregate Root
export class MediaLibrary {
  readonly id: LibraryId;
  readonly userId: UserId;
  private items: MediaItem[];
  private totalSize: StorageSize;
  
  addMedia(file: UploadedFile): MediaItem {
    this.validateStorageLimit(file.size);
    
    const mediaItem = MediaItem.fromFile(file);
    this.items.push(mediaItem);
    this.totalSize = this.totalSize.add(file.size);
    
    this.addDomainEvent(new MediaItemAdded(this.id, mediaItem));
    return mediaItem;
  }
  
  private validateStorageLimit(fileSize: number): void {
    const newTotal = this.totalSize.add(fileSize);
    if (newTotal.exceedsLimit()) {
      throw new StorageLimitExceededError();
    }
  }
}

// Entities
export class MediaItem {
  readonly id: MediaItemId;
  readonly type: MediaType;
  readonly originalUrl: string;
  readonly thumbnailUrl?: string;
  readonly metadata: MediaMetadata;
  readonly uploadedAt: Date;
  
  static fromFile(file: UploadedFile): MediaItem {
    return new MediaItem({
      id: MediaItemId.generate(),
      type: MediaType.fromMimeType(file.mimeType),
      originalUrl: file.url,
      metadata: MediaMetadata.extract(file),
      uploadedAt: new Date()
    });
  }
}

// Value Objects
export class StorageSize {
  constructor(private readonly bytes: number) {}
  
  add(bytes: number): StorageSize {
    return new StorageSize(this.bytes + bytes);
  }
  
  exceedsLimit(): boolean {
    return this.bytes > MAX_STORAGE_BYTES;
  }
  
  toMegabytes(): number {
    return this.bytes / (1024 * 1024);
  }
}
```

### 4. Payment Context

```typescript
// Aggregate Root
export class CustomerAccount {
  readonly id: CustomerId;
  readonly userId: UserId;
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
  billingHistory: BillingRecord[];
  
  changeSubscriptionPlan(
    newPlan: SubscriptionPlan,
    paymentMethodId: PaymentMethodId
  ): void {
    const paymentMethod = this.getPaymentMethod(paymentMethodId);
    
    this.subscription = this.subscription.changeTo(newPlan);
    
    this.addDomainEvent(
      new SubscriptionPlanChanged(this.id, newPlan, paymentMethod)
    );
  }
  
  recordUsage(usage: UsageRecord): void {
    if (this.subscription.isUsageExceeded(usage)) {
      this.addDomainEvent(new UsageLimitExceeded(this.id, usage));
    }
  }
}

// Value Objects
export class SubscriptionPlan {
  static readonly FREE = new SubscriptionPlan('free', 0, {
    maxProjects: 3,
    maxVideosPerMonth: 5,
    maxStorageGB: 1,
    watermark: true
  });
  
  static readonly PRO = new SubscriptionPlan('pro', 1900, {
    maxProjects: 50,
    maxVideosPerMonth: 100,
    maxStorageGB: 50,
    watermark: false
  });
  
  static readonly ENTERPRISE = new SubscriptionPlan('enterprise', 9900, {
    maxProjects: -1, // unlimited
    maxVideosPerMonth: -1,
    maxStorageGB: 500,
    watermark: false,
    prioritySupport: true
  });
  
  constructor(
    public readonly id: string,
    public readonly priceInCents: number,
    public readonly features: PlanFeatures
  ) {}
}
```

## 🔄 Domain Events Flow

```
User Creates Project
    │
    ├─► ProjectCreated Event
    │   ├─► Create Media Library
    │   └─► Initialize Project Status
    │
    ├─► User Uploads Photos
    │   ├─► PhotoUploaded Event
    │   ├─► Update Storage Usage
    │   └─► Generate Thumbnails
    │
    ├─► User Requests Video Generation
    │   ├─► VideoGenerationRequested Event
    │   ├─► Check Subscription Limits
    │   ├─► Queue Generation Job
    │   └─► Update Usage Metrics
    │
    └─► Video Generation Complete
        ├─► VideoGenerationCompleted Event
        ├─► Store Generated Video
        ├─► Send Notification
        └─► Update Billing Usage
```

## 🏛️ Repository Interfaces

```typescript
// User Context
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// Video Generation Context
export interface VideoProjectRepository {
  findById(id: ProjectId): Promise<VideoProject | null>;
  findByUserId(userId: UserId): Promise<VideoProject[]>;
  save(project: VideoProject): Promise<void>;
  delete(id: ProjectId): Promise<void>;
}

// Media Context
export interface MediaRepository {
  findById(id: MediaItemId): Promise<MediaItem | null>;
  findByLibraryId(libraryId: LibraryId): Promise<MediaItem[]>;
  save(item: MediaItem): Promise<void>;
  delete(id: MediaItemId): Promise<void>;
}

// Payment Context
export interface CustomerAccountRepository {
  findByUserId(userId: UserId): Promise<CustomerAccount | null>;
  save(account: CustomerAccount): Promise<void>;
}
```

## 🎯 Anti-Corruption Layer

External service integrations are isolated through ACL:

```typescript
// AI Service Adapter
export interface AIVideoGenerator {
  generate(request: VideoGenerationRequest): Promise<VideoResult>;
}

export class OpenAIVideoAdapter implements AIVideoGenerator {
  async generate(request: VideoGenerationRequest): Promise<VideoResult> {
    // Transform domain model to external API format
    const apiRequest = this.transformToAPIRequest(request);
    const response = await this.openAIClient.generateVideo(apiRequest);
    // Transform external response to domain model
    return this.transformToDomainModel(response);
  }
}

// Payment Service Adapter
export interface PaymentProcessor {
  createSubscription(customer: CustomerAccount, plan: SubscriptionPlan): Promise<PaymentResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export class StripePaymentAdapter implements PaymentProcessor {
  // Implementation details isolated from domain
}
```