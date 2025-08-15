# Layered Architecture Design

## 🏛️ Clean Architecture Implementation

PhotoMemory AI follows the Clean Architecture principles with 4 distinct layers, ensuring dependency inversion and separation of concerns.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  React App  │  │  Mobile     │  │   Admin     │                │
│  │   (Web)     │  │    Web      │  │  Dashboard  │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (Interface Adapters)
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Use Cases │  │  Controllers│  │   Mappers   │                │
│  │ (Commands/  │  │   (HTTP/    │  │  (DTO/VM    │                │
│  │  Queries)   │  │   GraphQL)  │  │ Conversion) │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (Interface Boundaries)
┌─────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Entities   │  │    Value    │  │   Domain    │                │
│  │    & AGG    │  │   Objects   │  │  Services   │                │
│  │    Roots    │  │             │  │   Events    │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (Repository Interfaces)
┌─────────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Supabase   │  │   External  │  │ File System │                │
│  │ Repositories│  │  API Clients│  │ & Storage   │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── presentation/                 # Presentation Layer
│   ├── components/               # React Components
│   │   ├── ui/                   # Reusable UI Components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── index.ts
│   │   ├── features/             # Feature-specific Components
│   │   │   ├── video-generation/
│   │   │   │   ├── VideoProjectForm/
│   │   │   │   ├── PhotoUpload/
│   │   │   │   ├── StyleSelector/
│   │   │   │   └── GenerationQueue/
│   │   │   ├── user-profile/
│   │   │   └── billing/
│   │   └── layout/               # Layout Components
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       └── Footer/
│   ├── pages/                    # Page Components
│   │   ├── Home/
│   │   ├── Dashboard/
│   │   ├── VideoEditor/
│   │   └── Profile/
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useVideoGeneration.ts
│   │   └── useUpload.ts
│   ├── stores/                   # State Management
│   │   ├── auth.store.ts
│   │   ├── video.store.ts
│   │   └── ui.store.ts
│   └── utils/                    # Presentation Utils
│       ├── formatting.ts
│       ├── validation.ts
│       └── i18n.ts
├── application/                  # Application Layer
│   ├── use-cases/                # Use Cases (Commands/Queries)
│   │   ├── video-generation/
│   │   │   ├── CreateVideoProject.ts
│   │   │   ├── UploadPhoto.ts
│   │   │   ├── RequestVideoGeneration.ts
│   │   │   └── GetVideoProjects.ts
│   │   ├── user/
│   │   │   ├── RegisterUser.ts
│   │   │   ├── AuthenticateUser.ts
│   │   │   └── UpdateProfile.ts
│   │   └── media/
│   │       ├── UploadMedia.ts
│   │       └── GetMediaLibrary.ts
│   ├── dtos/                     # Data Transfer Objects
│   │   ├── VideoProjectDto.ts
│   │   ├── UserDto.ts
│   │   └── MediaItemDto.ts
│   ├── mappers/                  # Domain ↔ DTO Mapping
│   │   ├── VideoProjectMapper.ts
│   │   ├── UserMapper.ts
│   │   └── MediaMapper.ts
│   ├── services/                 # Application Services
│   │   ├── VideoGenerationOrchestrator.ts
│   │   ├── NotificationService.ts
│   │   └── AnalyticsService.ts
│   ├── handlers/                 # Event Handlers
│   │   ├── VideoGenerationHandlers.ts
│   │   ├── UserEventHandlers.ts
│   │   └── PaymentEventHandlers.ts
│   └── ports/                    # Interface Definitions
│       ├── repositories/
│       │   ├── IUserRepository.ts
│       │   ├── IVideoProjectRepository.ts
│       │   └── IMediaRepository.ts
│       └── services/
│           ├── IVideoGenerationService.ts
│           ├── IPaymentService.ts
│           └── IStorageService.ts
├── domain/                       # Domain Layer
│   ├── entities/                 # Domain Entities
│   │   ├── User/
│   │   │   ├── User.ts
│   │   │   ├── UserProfile.ts
│   │   │   └── Subscription.ts
│   │   ├── VideoProject/
│   │   │   ├── VideoProject.ts
│   │   │   ├── Photo.ts
│   │   │   └── GeneratedVideo.ts
│   │   └── Media/
│   │       ├── MediaLibrary.ts
│   │       └── MediaItem.ts
│   ├── value-objects/            # Value Objects
│   │   ├── common/
│   │   │   ├── Id.ts
│   │   │   ├── Email.ts
│   │   │   └── Language.ts
│   │   ├── video/
│   │   │   ├── VideoStyle.ts
│   │   │   ├── VideoDuration.ts
│   │   │   └── VideoPrompt.ts
│   │   └── payment/
│   │       ├── SubscriptionPlan.ts
│   │       └── PaymentAmount.ts
│   ├── domain-services/          # Domain Services
│   │   ├── VideoGenerationPolicy.ts
│   │   ├── SubscriptionLimitChecker.ts
│   │   └── MediaValidationService.ts
│   ├── events/                   # Domain Events
│   │   ├── user/
│   │   │   ├── UserCreated.ts
│   │   │   └── UserSubscriptionChanged.ts
│   │   ├── video/
│   │   │   ├── VideoProjectCreated.ts
│   │   │   ├── PhotoAdded.ts
│   │   │   └── VideoGenerationCompleted.ts
│   │   └── base/
│   │       ├── DomainEvent.ts
│   │       └── EventHandler.ts
│   └── exceptions/               # Domain Exceptions
│       ├── ValidationException.ts
│       ├── BusinessRuleViolation.ts
│       └── ResourceNotFoundException.ts
└── infrastructure/               # Infrastructure Layer
    ├── database/                 # Database Implementation
    │   ├── supabase/
    │   │   ├── SupabaseClient.ts
    │   │   ├── migrations/
    │   │   │   ├── 001_users.sql
    │   │   │   ├── 002_video_projects.sql
    │   │   │   └── 003_media_items.sql
    │   │   └── repositories/
    │   │       ├── SupabaseUserRepository.ts
    │   │       ├── SupabaseVideoRepository.ts
    │   │       └── SupabaseMediaRepository.ts
    │   └── seeders/
    │       └── dev-data.ts
    ├── external-services/        # External API Clients
    │   ├── ai/
    │   │   ├── OpenAIClient.ts
    │   │   ├── ReplicateClient.ts
    │   │   └── VideoGenerationAdapter.ts
    │   ├── payment/
    │   │   ├── StripeClient.ts
    │   │   └── PaymentAdapter.ts
    │   └── storage/
    │       ├── SupabaseStorageClient.ts
    │       └── CloudinaryClient.ts
    ├── messaging/                # Event Bus & Messaging
    │   ├── EventBus.ts
    │   ├── MessageQueue.ts
    │   └── webhooks/
    │       ├── StripeWebhook.ts
    │       └── AIServiceWebhook.ts
    ├── logging/                  # Logging & Monitoring
    │   ├── Logger.ts
    │   ├── Metrics.ts
    │   └── Tracing.ts
    └── config/                   # Configuration
        ├── database.config.ts
        ├── auth.config.ts
        ├── storage.config.ts
        └── environment.ts
```

## 🔄 Data Flow Architecture

### 1. Command Flow (Write Operations)

```typescript
// 1. Presentation Layer
const CreateVideoProjectPage: React.FC = () => {
  const { mutate: createProject } = useMutation({
    mutationFn: createVideoProjectCommand.execute
  });
  
  const handleSubmit = (data: CreateProjectFormData) => {
    createProject(data);
  };
};

// 2. Application Layer
export class CreateVideoProjectCommand {
  constructor(
    private userRepository: IUserRepository,
    private videoRepository: IVideoProjectRepository,
    private eventBus: IEventBus
  ) {}
  
  async execute(request: CreateVideoProjectRequest): Promise<CreateVideoProjectResponse> {
    // Validation
    const user = await this.userRepository.findById(request.userId);
    if (!user) throw new UserNotFoundException();
    
    // Domain Logic
    const project = VideoProject.create({
      userId: request.userId,
      title: MultilingualText.create(request.title, user.language),
      style: VideoStyle.fromString(request.style)
    });
    
    // Persistence
    await this.videoRepository.save(project);
    
    // Event Publishing
    await this.eventBus.publish(project.getEvents());
    
    return VideoProjectMapper.toDto(project);
  }
}

// 3. Domain Layer
export class VideoProject extends AggregateRoot {
  static create(props: CreateVideoProjectProps): VideoProject {
    const project = new VideoProject(props);
    project.addDomainEvent(new VideoProjectCreated(project.id, project.userId));
    return project;
  }
}

// 4. Infrastructure Layer
export class SupabaseVideoRepository implements IVideoProjectRepository {
  async save(project: VideoProject): Promise<void> {
    const data = this.toSupabaseFormat(project);
    await this.supabase.from('video_projects').upsert(data);
  }
}
```

### 2. Query Flow (Read Operations)

```typescript
// 1. Presentation Layer
const VideoProjectsList: React.FC = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['video-projects'],
    queryFn: () => getVideoProjectsQuery.execute({ userId })
  });
  
  return <ProjectGrid projects={projects} />;
};

// 2. Application Layer
export class GetVideoProjectsQuery {
  constructor(private videoRepository: IVideoProjectRepository) {}
  
  async execute(request: GetVideoProjectsRequest): Promise<VideoProjectDto[]> {
    const projects = await this.videoRepository.findByUserId(request.userId);
    return projects.map(VideoProjectMapper.toDto);
  }
}

// 3. Infrastructure Layer (Direct Read)
export class SupabaseVideoRepository {
  async findByUserId(userId: UserId): Promise<VideoProject[]> {
    const { data } = await this.supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', userId.value);
      
    return data.map(this.toDomainModel);
  }
}
```

## 🔌 Dependency Injection Setup

```typescript
// infrastructure/di/container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

const container = new Container();

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(SupabaseUserRepository);
container.bind<IVideoProjectRepository>(TYPES.VideoRepository).to(SupabaseVideoRepository);

// Services
container.bind<IVideoGenerationService>(TYPES.VideoService).to(OpenAIVideoService);
container.bind<IPaymentService>(TYPES.PaymentService).to(StripePaymentService);

// Use Cases
container.bind<CreateVideoProjectCommand>(CreateVideoProjectCommand);
container.bind<GetVideoProjectsQuery>(GetVideoProjectsQuery);

export { container };

// application/di/types.ts
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  VideoRepository: Symbol.for('VideoRepository'),
  MediaRepository: Symbol.for('MediaRepository'),
  
  // Services
  VideoService: Symbol.for('VideoService'),
  PaymentService: Symbol.for('PaymentService'),
  StorageService: Symbol.for('StorageService'),
  
  // Infrastructure
  Database: Symbol.for('Database'),
  EventBus: Symbol.for('EventBus'),
  Logger: Symbol.for('Logger')
};
```

## 🧪 Testing Strategy by Layer

### 1. Domain Layer Testing
```typescript
// domain/entities/__tests__/VideoProject.test.ts
describe('VideoProject', () => {
  it('should create a new video project with valid data', () => {
    const project = VideoProject.create({
      userId: new UserId('user-123'),
      title: MultilingualText.create('My Project', Language.EN),
      style: VideoStyle.CLASSIC
    });
    
    expect(project.id).toBeDefined();
    expect(project.getEvents()).toHaveLength(1);
    expect(project.getEvents()[0]).toBeInstanceOf(VideoProjectCreated);
  });
  
  it('should not allow adding photos beyond limit', () => {
    const project = VideoProject.create(validProps);
    
    // Add maximum photos
    for (let i = 0; i < MAX_PHOTOS_PER_PROJECT; i++) {
      project.addPhoto(createValidPhoto());
    }
    
    // This should throw
    expect(() => project.addPhoto(createValidPhoto()))
      .toThrow(PhotoLimitExceededError);
  });
});
```

### 2. Application Layer Testing
```typescript
// application/use-cases/__tests__/CreateVideoProject.test.ts
describe('CreateVideoProjectCommand', () => {
  let command: CreateVideoProjectCommand;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockVideoRepo: jest.Mocked<IVideoProjectRepository>;
  
  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    mockVideoRepo = createMockVideoRepository();
    command = new CreateVideoProjectCommand(mockUserRepo, mockVideoRepo, mockEventBus);
  });
  
  it('should create project successfully', async () => {
    mockUserRepo.findById.mockResolvedValue(createValidUser());
    
    const result = await command.execute({
      userId: 'user-123',
      title: 'Test Project',
      style: 'classic'
    });
    
    expect(result.id).toBeDefined();
    expect(mockVideoRepo.save).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Infrastructure Layer Testing
```typescript
// infrastructure/repositories/__tests__/SupabaseVideoRepository.test.ts
describe('SupabaseVideoRepository', () => {
  let repository: SupabaseVideoRepository;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  
  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    repository = new SupabaseVideoRepository(mockSupabase);
  });
  
  it('should save project to database', async () => {
    const project = createValidProject();
    mockSupabase.from().upsert.mockResolvedValue({ error: null });
    
    await repository.save(project);
    
    expect(mockSupabase.from).toHaveBeenCalledWith('video_projects');
  });
});
```

### 4. Presentation Layer Testing
```typescript
// presentation/components/__tests__/VideoProjectForm.test.tsx
describe('VideoProjectForm', () => {
  it('should submit form with valid data', async () => {
    const mockOnSubmit = jest.fn();
    render(<VideoProjectForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Project' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Project',
        style: 'classic'
      });
    });
  });
});
```

## 🔐 Error Handling Strategy

```typescript
// application/exceptions/ApplicationException.ts
export abstract class ApplicationException extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  
  constructor(
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// presentation/middleware/ErrorHandler.ts
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApplicationException) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        context: error.context
      }
    });
  }
  
  // Domain exceptions
  if (error instanceof DomainException) {
    return res.status(400).json({
      error: {
        code: 'DOMAIN_RULE_VIOLATION',
        message: error.message
      }
    });
  }
  
  // Unknown errors
  logger.error(error);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

This layered architecture ensures:
- **Testability**: Each layer can be tested independently
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations
- **Scalability**: Can evolve independently
- **Domain Focus**: Business logic is protected and isolated