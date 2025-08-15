# REST API Specification
# PhotoMemory AI - OpenAPI 3.0 REST API Specification

## 🎯 API Design Philosophy

**Backend-First Approach**: Reliability > performance > convenience > features

**Core Principles**:
1. **Reliability First**: 99.9% uptime with graceful degradation
2. **Security by Default**: Defense in depth with zero trust architecture  
3. **Data Integrity**: ACID compliance and consistency guarantees
4. **Performance Optimization**: Sub-200ms API responses with intelligent caching
5. **Validation-Driven**: Comprehensive input/output validation at all layers

---

## 📋 OpenAPI 3.0 Specification

```yaml
openapi: 3.0.3
info:
  title: PhotoMemory AI REST API
  description: |
    PhotoMemory AI backend REST API for video generation from photos.
    
    ## Authentication
    Uses Bearer token authentication with Supabase JWT tokens.
    
    ## Rate Limiting
    - Public endpoints: 100 requests/hour per IP
    - Authenticated endpoints: 1000 requests/hour per user
    - Video generation: 10 requests/hour per user
    
    ## Error Handling
    All errors follow RFC 7807 Problem Details specification.
    
  version: 2.0.0
  contact:
    name: PhotoMemory AI Support
    email: api-support@photomemory.ai
    url: https://docs.photomemory.ai
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.photomemory.ai/v2
    description: Production server
  - url: https://staging-api.photomemory.ai/v2
    description: Staging server
  - url: http://localhost:3000/api/v2
    description: Development server

security:
  - BearerAuth: []

paths:
  # ==========================================
  # Authentication Endpoints
  # ==========================================
  
  /auth/register:
    post:
      tags: [Authentication]
      summary: Register new user account
      description: Create a new user account with email verification
      operationId: registerUser
      security: []  # Public endpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistrationRequest'
            examples:
              basic_registration:
                summary: Basic user registration
                value:
                  email: "user@example.com"
                  password: "SecurePass123!"
                  displayName: "John Doe"
                  language: "en"
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthSuccessResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '409':
          $ref: '#/components/responses/ConflictError'
        '429':
          $ref: '#/components/responses/RateLimitError'

  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      description: Authenticate user and return JWT token
      operationId: loginUser
      security: []  # Public endpoint
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthSuccessResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '429':
          $ref: '#/components/responses/RateLimitError'

  /auth/refresh:
    post:
      tags: [Authentication]
      summary: Refresh access token
      description: Get new access token using refresh token
      operationId: refreshToken
      security: []  # Uses refresh token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [refreshToken]
              properties:
                refreshToken:
                  type: string
                  format: jwt
                  description: Valid refresh token
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TokenResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /auth/logout:
    post:
      tags: [Authentication]
      summary: User logout
      description: Invalidate current session and tokens
      operationId: logoutUser
      responses:
        '200':
          description: Logout successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  # ==========================================
  # User Management Endpoints
  # ==========================================

  /users/me:
    get:
      tags: [User Management]
      summary: Get current user profile
      description: Retrieve authenticated user's profile information
      operationId: getCurrentUser
      responses:
        '200':
          description: User profile retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

    patch:
      tags: [User Management]
      summary: Update user profile
      description: Update current user's profile information
      operationId: updateUserProfile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserProfileUpdateRequest'
      responses:
        '200':
          description: Profile updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  /users/me/subscription:
    get:
      tags: [User Management]
      summary: Get user subscription details
      description: Retrieve current user's subscription information and usage
      operationId: getUserSubscription
      responses:
        '200':
          description: Subscription details retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubscriptionDetails'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

  # ==========================================
  # Video Project Endpoints
  # ==========================================

  /projects:
    get:
      tags: [Video Projects]
      summary: List user's video projects
      description: Get paginated list of user's video projects with optional filtering
      operationId: listVideoProjects
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - $ref: '#/components/parameters/StatusFilterParam'
        - name: sortBy
          in: query
          description: Sort field
          schema:
            type: string
            enum: [created_at, updated_at, title, status]
            default: created_at
        - name: sortOrder
          in: query
          description: Sort order
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        '200':
          description: Projects retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectListResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'

    post:
      tags: [Video Projects]
      summary: Create new video project
      description: Create a new video generation project
      operationId: createVideoProject
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProjectRequest'
            examples:
              basic_project:
                summary: Basic project creation
                value:
                  title: "Family Vacation 2024"
                  description: "Summer vacation memories"
                  style: "cinematic"
                  durationMinutes: 2
                  titleTranslations:
                    en: "Family Vacation 2024"
                    es: "Vacaciones Familiares 2024"
      responses:
        '201':
          description: Project created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VideoProject'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'

  /projects/{projectId}:
    parameters:
      - $ref: '#/components/parameters/ProjectIdParam'

    get:
      tags: [Video Projects]
      summary: Get video project details
      description: Retrieve detailed information about a specific video project
      operationId: getVideoProject
      responses:
        '200':
          description: Project details retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VideoProjectDetail'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    patch:
      tags: [Video Projects]
      summary: Update video project
      description: Update project metadata and settings
      operationId: updateVideoProject
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateProjectRequest'
      responses:
        '200':
          description: Project updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VideoProject'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    delete:
      tags: [Video Projects]
      summary: Delete video project
      description: Permanently delete a video project and all associated media
      operationId: deleteVideoProject
      responses:
        '200':
          description: Project deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '409':
          description: Cannot delete project in processing state
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # ==========================================
  # Media Management Endpoints
  # ==========================================

  /projects/{projectId}/media:
    parameters:
      - $ref: '#/components/parameters/ProjectIdParam'

    get:
      tags: [Media Management]
      summary: Get project media files
      description: Retrieve all media files associated with a project
      operationId: getProjectMedia
      parameters:
        - name: type
          in: query
          description: Filter by media type
          schema:
            type: string
            enum: [image, video, audio]
      responses:
        '200':
          description: Media files retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaListResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    post:
      tags: [Media Management]
      summary: Upload media file
      description: Upload and process media file for project
      operationId: uploadMediaFile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
                  description: Media file to upload (max 50MB)
                displayOrder:
                  type: integer
                  minimum: 0
                  description: Order for display in project
                  default: 0
                tags:
                  type: array
                  items:
                    type: string
                  maxItems: 10
                  description: Optional tags for organization
            encoding:
              file:
                contentType: image/jpeg, image/png, image/webp, video/mp4
      responses:
        '201':
          description: Media file uploaded successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaFile'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '413':
          description: File too large
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /projects/{projectId}/media/{mediaId}:
    parameters:
      - $ref: '#/components/parameters/ProjectIdParam'
      - $ref: '#/components/parameters/MediaIdParam'

    get:
      tags: [Media Management]
      summary: Get media file details
      description: Retrieve detailed information about a specific media file
      operationId: getMediaFile
      responses:
        '200':
          description: Media file details retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaFileDetail'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    patch:
      tags: [Media Management]
      summary: Update media file metadata
      description: Update media file metadata and settings
      operationId: updateMediaFile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateMediaFileRequest'
      responses:
        '200':
          description: Media file updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MediaFile'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    delete:
      tags: [Media Management]
      summary: Delete media file
      description: Remove media file from project and storage
      operationId: deleteMediaFile
      responses:
        '200':
          description: Media file deleted successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '409':
          description: Cannot delete media file in use by active generation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # ==========================================
  # Video Generation Endpoints
  # ==========================================

  /projects/{projectId}/generate:
    parameters:
      - $ref: '#/components/parameters/ProjectIdParam'

    post:
      tags: [Video Generation]
      summary: Start video generation
      description: Begin video generation process for project
      operationId: generateVideo
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateVideoRequest'
            examples:
              basic_generation:
                summary: Basic video generation
                value:
                  prompt: "Create a heartwarming family video with smooth transitions"
                  priority: "normal"
                  settings:
                    includeAudio: true
                    watermark: false
                    resolution: "1080p"
      responses:
        '202':
          description: Video generation started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerationJobResponse'
        '400':
          $ref: '#/components/responses/ValidationError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '429':
          description: Generation rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /generation-jobs/{jobId}:
    parameters:
      - $ref: '#/components/parameters/JobIdParam'

    get:
      tags: [Video Generation]
      summary: Get generation job status
      description: Check the status and progress of a video generation job
      operationId: getGenerationJobStatus
      responses:
        '200':
          description: Generation job status retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerationJob'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

    delete:
      tags: [Video Generation]
      summary: Cancel generation job
      description: Cancel a running or queued video generation job
      operationId: cancelGenerationJob
      responses:
        '200':
          description: Generation job cancelled successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '409':
          description: Cannot cancel completed job
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  # ==========================================
  # System Health & Monitoring
  # ==========================================

  /health:
    get:
      tags: [System]
      summary: Health check endpoint
      description: Check API health status and dependencies
      operationId: healthCheck
      security: []  # Public endpoint
      responses:
        '200':
          description: System is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'
        '503':
          description: System is unhealthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token from Supabase authentication

  parameters:
    ProjectIdParam:
      name: projectId
      in: path
      required: true
      description: Unique project identifier
      schema:
        type: string
        format: uuid
      example: "123e4567-e89b-12d3-a456-426614174000"

    MediaIdParam:
      name: mediaId
      in: path
      required: true
      description: Unique media file identifier
      schema:
        type: string
        format: uuid

    JobIdParam:
      name: jobId
      in: path
      required: true
      description: Unique generation job identifier
      schema:
        type: string
        format: uuid

    PageParam:
      name: page
      in: query
      description: Page number (1-based)
      schema:
        type: integer
        minimum: 1
        default: 1
      example: 1

    LimitParam:
      name: limit
      in: query
      description: Number of items per page
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      example: 20

    StatusFilterParam:
      name: status
      in: query
      description: Filter by project status
      schema:
        $ref: '#/components/schemas/ProjectStatus'

  schemas:
    # ==========================================
    # Authentication Schemas
    # ==========================================

    UserRegistrationRequest:
      type: object
      required: [email, password, displayName]
      properties:
        email:
          type: string
          format: email
          maxLength: 255
          description: Valid email address
          example: "user@example.com"
        password:
          type: string
          minLength: 8
          maxLength: 128
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
          description: Password with uppercase, lowercase, number, and special character
          example: "SecurePass123!"
        displayName:
          type: string
          minLength: 2
          maxLength: 100
          pattern: '^[a-zA-Z\s\-\.\']+$'
          description: User's display name
          example: "John Doe"
        language:
          $ref: '#/components/schemas/LanguageCode'
          default: "en"

    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
          description: User's email address
        password:
          type: string
          description: User's password

    AuthSuccessResponse:
      type: object
      required: [user, tokens, message]
      properties:
        user:
          $ref: '#/components/schemas/UserProfile'
        tokens:
          $ref: '#/components/schemas/TokenResponse'
        message:
          type: string
          example: "Authentication successful"

    TokenResponse:
      type: object
      required: [accessToken, refreshToken, expiresIn, tokenType]
      properties:
        accessToken:
          type: string
          format: jwt
          description: JWT access token
        refreshToken:
          type: string
          format: jwt
          description: Refresh token for obtaining new access tokens
        expiresIn:
          type: integer
          description: Token expiration time in seconds
          example: 3600
        tokenType:
          type: string
          enum: [Bearer]
          default: "Bearer"

    # ==========================================
    # User Management Schemas
    # ==========================================

    UserProfile:
      type: object
      required: [id, email, displayName, language, subscriptionPlan, createdAt]
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
        email:
          type: string
          format: email
          description: User's email address
        displayName:
          type: string
          description: User's display name
          example: "John Doe"
        avatarUrl:
          type: string
          format: uri
          nullable: true
          description: URL to user's avatar image
          example: "https://storage.photomemory.ai/avatars/user123.jpg"
        language:
          $ref: '#/components/schemas/LanguageCode'
        timezone:
          type: string
          description: User's timezone (IANA format)
          example: "America/New_York"
          default: "UTC"
        subscriptionPlan:
          $ref: '#/components/schemas/SubscriptionPlan'
        preferences:
          $ref: '#/components/schemas/UserPreferences'
        onboardingCompleted:
          type: boolean
          description: Whether user has completed onboarding
          default: false
        lastActivityAt:
          type: string
          format: date-time
          nullable: true
          description: Last activity timestamp
        createdAt:
          type: string
          format: date-time
          description: Account creation timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last profile update timestamp

    UserProfileUpdateRequest:
      type: object
      properties:
        displayName:
          type: string
          minLength: 2
          maxLength: 100
        avatarUrl:
          type: string
          format: uri
          nullable: true
        language:
          $ref: '#/components/schemas/LanguageCode'
        timezone:
          type: string
        preferences:
          $ref: '#/components/schemas/UserPreferences'

    UserPreferences:
      type: object
      additionalProperties: false
      properties:
        notifications:
          type: object
          properties:
            email:
              type: boolean
              default: true
            push:
              type: boolean
              default: true
            videoCompleted:
              type: boolean
              default: true
            weeklyDigest:
              type: boolean
              default: false
        privacy:
          type: object
          properties:
            shareProjects:
              type: boolean
              default: false
            analytics:
              type: boolean
              default: true
        ui:
          type: object
          properties:
            theme:
              type: string
              enum: [light, dark, system]
              default: "system"
            compactMode:
              type: boolean
              default: false

    SubscriptionDetails:
      type: object
      required: [plan, status, usage, limits]
      properties:
        plan:
          $ref: '#/components/schemas/SubscriptionPlan'
        status:
          $ref: '#/components/schemas/SubscriptionStatus'
        currentPeriodStart:
          type: string
          format: date-time
          description: Current billing period start
        currentPeriodEnd:
          type: string
          format: date-time
          description: Current billing period end
        cancelAtPeriodEnd:
          type: boolean
          description: Whether subscription will cancel at period end
          default: false
        usage:
          $ref: '#/components/schemas/UsageMetrics'
        limits:
          $ref: '#/components/schemas/PlanLimits'

    # ==========================================
    # Video Project Schemas
    # ==========================================

    VideoProject:
      type: object
      required: [id, userId, title, style, durationMinutes, status, createdAt]
      properties:
        id:
          type: string
          format: uuid
          description: Unique project identifier
        userId:
          type: string
          format: uuid
          description: Owner user ID
        title:
          type: string
          description: Project title in user's language
          example: "Family Vacation 2024"
        titleTranslations:
          $ref: '#/components/schemas/I18nContent'
        description:
          type: string
          nullable: true
          description: Project description
          example: "Beautiful memories from our summer vacation"
        descriptionTranslations:
          $ref: '#/components/schemas/I18nContent'
        style:
          $ref: '#/components/schemas/VideoStyle'
        durationMinutes:
          type: integer
          minimum: 1
          maximum: 30
          description: Target video duration in minutes
          example: 2
        aspectRatio:
          type: string
          enum: ["16:9", "9:16", "1:1", "4:3"]
          default: "16:9"
          description: Video aspect ratio
        resolution:
          type: string
          enum: ["720p", "1080p", "4k"]
          default: "1080p"
          description: Video resolution
        status:
          $ref: '#/components/schemas/ProjectStatus'
        progressPercentage:
          type: integer
          minimum: 0
          maximum: 100
          description: Overall project progress
          default: 0
        mediaCount:
          type: integer
          minimum: 0
          description: Number of media files in project
          default: 0
        totalFileSizeBytes:
          type: integer
          format: int64
          minimum: 0
          description: Total size of all project files in bytes
          default: 0
        aiPrompt:
          type: string
          nullable: true
          maxLength: 1000
          description: AI generation prompt
        generationSettings:
          type: object
          additionalProperties: true
          description: Video generation configuration
        metadata:
          type: object
          additionalProperties: true
          description: Additional project metadata
        templateId:
          type: string
          format: uuid
          nullable: true
          description: Template used for project creation
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        startedAt:
          type: string
          format: date-time
          nullable: true
          description: When project generation started
        completedAt:
          type: string
          format: date-time
          nullable: true
          description: When project was completed

    VideoProjectDetail:
      allOf:
        - $ref: '#/components/schemas/VideoProject'
        - type: object
          properties:
            mediaFiles:
              type: array
              items:
                $ref: '#/components/schemas/MediaFile'
              description: Associated media files
            generationJobs:
              type: array
              items:
                $ref: '#/components/schemas/GenerationJob'
              description: Generation jobs for this project
            generatedVideos:
              type: array
              items:
                $ref: '#/components/schemas/GeneratedVideo'
              description: Completed generated videos

    CreateProjectRequest:
      type: object
      required: [title, style, durationMinutes]
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 100
          description: Project title
        description:
          type: string
          maxLength: 500
          nullable: true
          description: Project description
        titleTranslations:
          $ref: '#/components/schemas/I18nContent'
        descriptionTranslations:
          $ref: '#/components/schemas/I18nContent'
        style:
          $ref: '#/components/schemas/VideoStyle'
        durationMinutes:
          type: integer
          minimum: 1
          maximum: 30
          description: Target duration in minutes
        aspectRatio:
          type: string
          enum: ["16:9", "9:16", "1:1", "4:3"]
          default: "16:9"
        resolution:
          type: string
          enum: ["720p", "1080p", "4k"]
          default: "1080p"
        aiPrompt:
          type: string
          maxLength: 1000
          nullable: true
        autoTranslate:
          type: boolean
          default: false
          description: Automatically translate content

    UpdateProjectRequest:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
          nullable: true
        titleTranslations:
          $ref: '#/components/schemas/I18nContent'
        descriptionTranslations:
          $ref: '#/components/schemas/I18nContent'
        style:
          $ref: '#/components/schemas/VideoStyle'
        durationMinutes:
          type: integer
          minimum: 1
          maximum: 30
        aspectRatio:
          type: string
          enum: ["16:9", "9:16", "1:1", "4:3"]
        resolution:
          type: string
          enum: ["720p", "1080p", "4k"]
        aiPrompt:
          type: string
          maxLength: 1000
          nullable: true

    ProjectListResponse:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/VideoProject'
        pagination:
          $ref: '#/components/schemas/PaginationInfo'

    # ==========================================
    # Media Management Schemas
    # ==========================================

    MediaFile:
      type: object
      required: [id, userId, originalFilename, fileKey, fileUrl, fileType, fileSizeBytes, createdAt]
      properties:
        id:
          type: string
          format: uuid
          description: Unique media file identifier
        userId:
          type: string
          format: uuid
          description: Owner user ID
        originalFilename:
          type: string
          maxLength: 255
          description: Original filename when uploaded
          example: "vacation-photo-001.jpg"
        fileKey:
          type: string
          description: Storage key for file access
          example: "projects/123/media/1640995200000-vacation-photo-001.jpg"
        fileUrl:
          type: string
          format: uri
          description: Public URL for file access
          example: "https://storage.photomemory.ai/projects/123/media/1640995200000-vacation-photo-001.jpg"
        thumbnailUrl:
          type: string
          format: uri
          nullable: true
          description: Thumbnail image URL
        fileType:
          $ref: '#/components/schemas/MediaType'
        mimeType:
          type: string
          description: MIME type of the file
          example: "image/jpeg"
        fileSizeBytes:
          type: integer
          format: int64
          minimum: 1
          description: File size in bytes
        width:
          type: integer
          nullable: true
          minimum: 1
          description: Image/video width in pixels
        height:
          type: integer
          nullable: true
          minimum: 1
          description: Image/video height in pixels
        durationSeconds:
          type: number
          format: float
          nullable: true
          minimum: 0
          description: Duration for video/audio files
        processingStatus:
          $ref: '#/components/schemas/ProcessingStatus'
        processingError:
          type: string
          nullable: true
          description: Error message if processing failed
        contentHash:
          type: string
          nullable: true
          description: Hash for deduplication
          example: "sha256:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
        folderPath:
          type: string
          default: "/"
          description: Virtual folder path for organization
          example: "/2024/summer-vacation/"
        tags:
          type: array
          items:
            type: string
            maxLength: 50
          maxItems: 10
          description: User-defined tags for organization
          example: ["vacation", "family", "beach"]
        metadata:
          type: object
          additionalProperties: true
          description: Additional file metadata (EXIF, etc.)
        displayOrder:
          type: integer
          minimum: 0
          default: 0
          description: Order for display in project
        uploadedAt:
          type: string
          format: date-time
          description: When file was uploaded
        lastAccessedAt:
          type: string
          format: date-time
          nullable: true
          description: Last time file was accessed
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    MediaFileDetail:
      allOf:
        - $ref: '#/components/schemas/MediaFile'
        - type: object
          properties:
            projects:
              type: array
              items:
                type: object
                properties:
                  projectId:
                    type: string
                    format: uuid
                  projectTitle:
                    type: string
                  displayOrder:
                    type: integer
              description: Projects using this media file
            generationHistory:
              type: array
              items:
                type: object
                properties:
                  generationId:
                    type: string
                    format: uuid
                  status:
                    type: string
                  createdAt:
                    type: string
                    format: date-time
              description: Generation jobs that used this file

    UpdateMediaFileRequest:
      type: object
      properties:
        displayOrder:
          type: integer
          minimum: 0
        folderPath:
          type: string
          maxLength: 500
        tags:
          type: array
          items:
            type: string
            maxLength: 50
          maxItems: 10
        metadata:
          type: object
          additionalProperties: true

    MediaListResponse:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/MediaFile'
        pagination:
          $ref: '#/components/schemas/PaginationInfo'

    # ==========================================
    # Video Generation Schemas
    # ==========================================

    GenerateVideoRequest:
      type: object
      properties:
        prompt:
          type: string
          maxLength: 1000
          nullable: true
          description: AI generation prompt override
          example: "Create a heartwarming family video with smooth transitions"
        priority:
          $ref: '#/components/schemas/GenerationPriority'
        settings:
          type: object
          properties:
            includeAudio:
              type: boolean
              default: true
              description: Include background music
            watermark:
              type: boolean
              default: false
              description: Add watermark to video
            resolution:
              type: string
              enum: ["720p", "1080p", "4k"]
              default: "1080p"
            frameRate:
              type: number
              enum: [24, 30, 60]
              default: 30
              description: Video frame rate (fps)
            transitions:
              type: object
              properties:
                type:
                  type: string
                  enum: [fade, slide, zoom, dissolve, wipe]
                  default: "fade"
                duration:
                  type: number
                  minimum: 0.1
                  maximum: 3.0
                  default: 0.5
                  description: Transition duration in seconds
            audioSettings:
              type: object
              properties:
                musicVolume:
                  type: number
                  minimum: 0.0
                  maximum: 1.0
                  default: 0.3
                musicGenre:
                  type: string
                  enum: [ambient, upbeat, cinematic, emotional, energetic]
                  default: "ambient"

    GenerationJobResponse:
      type: object
      required: [jobId, projectId, status, estimatedCompletionTime]
      properties:
        jobId:
          type: string
          format: uuid
          description: Unique generation job identifier
        projectId:
          type: string
          format: uuid
          description: Associated project ID
        status:
          $ref: '#/components/schemas/GenerationStatus'
        priority:
          $ref: '#/components/schemas/GenerationPriority'
        progressPercentage:
          type: integer
          minimum: 0
          maximum: 100
          default: 0
        estimatedCompletionTime:
          type: string
          format: date-time
          description: Estimated completion timestamp
        message:
          type: string
          example: "Video generation started successfully"

    GenerationJob:
      type: object
      required: [id, projectId, userId, jobType, status, priority, queuedAt]
      properties:
        id:
          type: string
          format: uuid
          description: Unique job identifier
        projectId:
          type: string
          format: uuid
          description: Associated project ID
        userId:
          type: string
          format: uuid
          description: User who requested generation
        jobType:
          $ref: '#/components/schemas/JobType'
        priority:
          $ref: '#/components/schemas/GenerationPriority'
        status:
          $ref: '#/components/schemas/GenerationStatus'
        progressPercentage:
          type: integer
          minimum: 0
          maximum: 100
          default: 0
        generationService:
          type: string
          description: Service handling the generation
          example: "openai-video-v1"
        externalJobId:
          type: string
          nullable: true
          description: External service job identifier
        estimatedDurationSeconds:
          type: integer
          nullable: true
          minimum: 0
          description: Estimated processing time
        actualDurationSeconds:
          type: integer
          nullable: true
          minimum: 0
          description: Actual processing time
        computeCostCents:
          type: integer
          nullable: true
          minimum: 0
          description: Processing cost in cents
        outputFileId:
          type: string
          format: uuid
          nullable: true
          description: Generated file ID
        outputMetadata:
          type: object
          additionalProperties: true
          description: Generation output metadata
        errorMessage:
          type: string
          nullable: true
          description: Error message if generation failed
        retryCount:
          type: integer
          minimum: 0
          default: 0
          description: Number of retry attempts
        maxRetries:
          type: integer
          minimum: 0
          default: 3
          description: Maximum allowed retries
        queuedAt:
          type: string
          format: date-time
          description: When job was queued
        startedAt:
          type: string
          format: date-time
          nullable: true
          description: When processing started
        completedAt:
          type: string
          format: date-time
          nullable: true
          description: When job was completed
        failedAt:
          type: string
          format: date-time
          nullable: true
          description: When job failed

    GeneratedVideo:
      type: object
      required: [id, projectId, generationJobId, status, createdAt]
      properties:
        id:
          type: string
          format: uuid
          description: Unique generated video identifier
        projectId:
          type: string
          format: uuid
          description: Source project ID
        generationJobId:
          type: string
          format: uuid
          description: Generation job that created this video
        fileUrl:
          type: string
          format: uri
          nullable: true
          description: Generated video file URL
        thumbnailUrl:
          type: string
          format: uri
          nullable: true
          description: Video thumbnail URL
        durationSeconds:
          type: number
          format: float
          nullable: true
          minimum: 0
          description: Video duration
        fileSizeBytes:
          type: integer
          format: int64
          nullable: true
          minimum: 0
          description: File size in bytes
        status:
          $ref: '#/components/schemas/GenerationStatus'
        resolution:
          type: string
          nullable: true
          description: Video resolution
          example: "1920x1080"
        frameRate:
          type: number
          nullable: true
          description: Video frame rate
          example: 30
        codecInfo:
          type: object
          properties:
            video:
              type: string
              example: "H.264"
            audio:
              type: string
              example: "AAC"
        qualityMetrics:
          type: object
          properties:
            averageBitrate:
              type: number
              description: Average bitrate in kbps
            peakSignalToNoise:
              type: number
              description: PSNR quality metric
        generationMetadata:
          type: object
          additionalProperties: true
          description: Metadata from generation process
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # ==========================================
    # Common Response Schemas
    # ==========================================

    SuccessResponse:
      type: object
      required: [message]
      properties:
        message:
          type: string
          description: Success message
          example: "Operation completed successfully"
        timestamp:
          type: string
          format: date-time
          description: Response timestamp

    ErrorResponse:
      type: object
      required: [type, title, status, detail]
      properties:
        type:
          type: string
          format: uri
          description: Problem type URI (RFC 7807)
          example: "https://api.photomemory.ai/problems/validation-error"
        title:
          type: string
          description: Short, human-readable summary
          example: "Validation Error"
        status:
          type: integer
          description: HTTP status code
          example: 400
        detail:
          type: string
          description: Human-readable explanation
          example: "The request body contains invalid data"
        instance:
          type: string
          format: uri
          description: URI reference for this specific occurrence
          example: "/projects/123e4567-e89b-12d3-a456-426614174000"
        timestamp:
          type: string
          format: date-time
          description: Error timestamp
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
                description: Field name that caused the error
              code:
                type: string
                description: Error code
              message:
                type: string
                description: Field-specific error message
          description: Detailed field-level errors for validation failures

    PaginationInfo:
      type: object
      required: [page, limit, total, totalPages, hasNext, hasPrev]
      properties:
        page:
          type: integer
          minimum: 1
          description: Current page number
        limit:
          type: integer
          minimum: 1
          description: Items per page
        total:
          type: integer
          minimum: 0
          description: Total number of items
        totalPages:
          type: integer
          minimum: 0
          description: Total number of pages
        hasNext:
          type: boolean
          description: Whether there is a next page
        hasPrev:
          type: boolean
          description: Whether there is a previous page

    HealthResponse:
      type: object
      required: [status, timestamp]
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
          description: Overall system health status
        timestamp:
          type: string
          format: date-time
          description: Health check timestamp
        version:
          type: string
          description: API version
          example: "2.0.0"
        uptime:
          type: number
          description: System uptime in seconds
        services:
          type: object
          additionalProperties:
            type: object
            properties:
              status:
                type: string
                enum: [healthy, degraded, unhealthy]
              responseTime:
                type: number
                description: Response time in milliseconds
              lastChecked:
                type: string
                format: date-time
          description: Status of dependent services
          example:
            database:
              status: "healthy"
              responseTime: 15
              lastChecked: "2024-01-15T10:30:00Z"
            storage:
              status: "healthy"
              responseTime: 8
              lastChecked: "2024-01-15T10:30:00Z"
            generation_service:
              status: "degraded"
              responseTime: 1200
              lastChecked: "2024-01-15T10:30:00Z"

    # ==========================================
    # Utility Schemas
    # ==========================================

    UsageMetrics:
      type: object
      required: [currentPeriod, limits]
      properties:
        currentPeriod:
          type: object
          properties:
            projectsCreated:
              type: integer
              minimum: 0
              description: Projects created in current billing period
            videosGenerated:
              type: integer
              minimum: 0
              description: Videos generated in current billing period
            storageUsedBytes:
              type: integer
              format: int64
              minimum: 0
              description: Storage used in bytes
            apiRequestsCount:
              type: integer
              minimum: 0
              description: API requests made in current period
        limits:
          $ref: '#/components/schemas/PlanLimits'
        billingPeriod:
          type: object
          properties:
            start:
              type: string
              format: date-time
            end:
              type: string
              format: date-time

    PlanLimits:
      type: object
      properties:
        maxProjects:
          type: integer
          nullable: true
          description: Maximum projects (-1 for unlimited)
          example: 50
        maxVideosPerMonth:
          type: integer
          nullable: true
          description: Maximum videos per month (-1 for unlimited)
          example: 100
        maxStorageBytes:
          type: integer
          format: int64
          nullable: true
          description: Maximum storage in bytes (-1 for unlimited)
        maxFileSizeBytes:
          type: integer
          format: int64
          description: Maximum file size in bytes
          example: 52428800  # 50MB
        features:
          type: array
          items:
            type: string
          description: Enabled features for plan
          example: ["no_watermark", "priority_support", "custom_branding"]
        apiRateLimit:
          type: object
          properties:
            requestsPerHour:
              type: integer
              example: 1000
            generationsPerHour:
              type: integer
              example: 10

    I18nContent:
      type: object
      additionalProperties:
        type: string
      description: Internationalized content by language code
      example:
        en: "Family Vacation 2024"
        es: "Vacaciones Familiares 2024"
        fr: "Vacances en Famille 2024"

    # ==========================================
    # Enum Schemas
    # ==========================================

    LanguageCode:
      type: string
      enum: [en, ko, ja, zh-cn, es, fr, de]
      description: Supported language codes
      example: "en"

    SubscriptionPlan:
      type: string
      enum: [free, pro, enterprise]
      description: Available subscription plans
      example: "pro"

    SubscriptionStatus:
      type: string
      enum: [active, past_due, cancelled, unpaid]
      description: Subscription status
      example: "active"

    ProjectStatus:
      type: string
      enum: [draft, processing, completed, failed, cancelled]
      description: Video project status
      example: "draft"

    VideoStyle:
      type: string
      enum: [classic, modern, cinematic, vintage]
      description: Video generation style
      example: "cinematic"

    MediaType:
      type: string
      enum: [image, video, audio, document]
      description: Media file type
      example: "image"

    ProcessingStatus:
      type: string
      enum: [pending, processing, completed, failed]
      description: Media file processing status
      example: "completed"

    GenerationStatus:
      type: string
      enum: [queued, processing, completed, failed, cancelled]
      description: Generation job status
      example: "processing"

    GenerationPriority:
      type: string
      enum: [low, normal, high, urgent]
      description: Generation job priority
      default: "normal"
      example: "normal"

    JobType:
      type: string
      enum: [video, thumbnail, preview, audio]
      description: Type of generation job
      example: "video"

  responses:
    ValidationError:
      description: Validation error in request data
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            field_validation:
              summary: Field validation error
              value:
                type: "https://api.photomemory.ai/problems/validation-error"
                title: "Validation Error"
                status: 400
                detail: "The request contains invalid data"
                instance: "/projects"
                timestamp: "2024-01-15T10:30:00Z"
                errors:
                  - field: "durationMinutes"
                    code: "out_of_range"
                    message: "Duration must be between 1 and 30 minutes"
                  - field: "title"
                    code: "too_short"
                    message: "Title must be at least 1 character long"

    UnauthorizedError:
      description: Authentication required or token invalid
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            missing_token:
              summary: Missing authentication token
              value:
                type: "https://api.photomemory.ai/problems/unauthorized"
                title: "Authentication Required"
                status: 401
                detail: "Valid authentication token is required"
                timestamp: "2024-01-15T10:30:00Z"
            invalid_token:
              summary: Invalid or expired token
              value:
                type: "https://api.photomemory.ai/problems/invalid-token"
                title: "Invalid Token"
                status: 401
                detail: "The provided authentication token is invalid or expired"
                timestamp: "2024-01-15T10:30:00Z"

    ForbiddenError:
      description: Access denied - insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            subscription_limit:
              summary: Subscription limit exceeded
              value:
                type: "https://api.photomemory.ai/problems/subscription-limit"
                title: "Subscription Limit Exceeded"
                status: 403
                detail: "Your current plan allows up to 3 projects. Please upgrade to create more."
                timestamp: "2024-01-15T10:30:00Z"
            resource_access:
              summary: Resource access denied
              value:
                type: "https://api.photomemory.ai/problems/access-denied"
                title: "Access Denied"
                status: 403
                detail: "You don't have permission to access this resource"
                timestamp: "2024-01-15T10:30:00Z"

    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            project_not_found:
              summary: Project not found
              value:
                type: "https://api.photomemory.ai/problems/resource-not-found"
                title: "Resource Not Found"
                status: 404
                detail: "The requested project does not exist or has been deleted"
                instance: "/projects/123e4567-e89b-12d3-a456-426614174000"
                timestamp: "2024-01-15T10:30:00Z"

    ConflictError:
      description: Request conflicts with current state
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            email_exists:
              summary: Email already registered
              value:
                type: "https://api.photomemory.ai/problems/resource-conflict"
                title: "Resource Conflict"
                status: 409
                detail: "An account with this email address already exists"
                timestamp: "2024-01-15T10:30:00Z"

    RateLimitError:
      description: Rate limit exceeded
      headers:
        Retry-After:
          description: Seconds to wait before retrying
          schema:
            type: integer
        X-RateLimit-Limit:
          description: Request limit per time window
          schema:
            type: integer
        X-RateLimit-Remaining:
          description: Remaining requests in current window
          schema:
            type: integer
        X-RateLimit-Reset:
          description: Unix timestamp when rate limit resets
          schema:
            type: integer
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            rate_limit_exceeded:
              summary: Rate limit exceeded
              value:
                type: "https://api.photomemory.ai/problems/rate-limit-exceeded"
                title: "Rate Limit Exceeded"
                status: 429
                detail: "You have exceeded the rate limit. Please wait 60 seconds before trying again."
                timestamp: "2024-01-15T10:30:00Z"

tags:
  - name: Authentication
    description: User authentication and session management
  - name: User Management
    description: User profile and account operations
  - name: Video Projects
    description: Video project creation and management
  - name: Media Management
    description: Media file upload and organization
  - name: Video Generation
    description: AI-powered video generation
  - name: System
    description: System health and monitoring endpoints
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  aud: string;           // Audience (photomemory-ai)
  iss: string;           // Issuer (supabase)
  exp: number;           // Expiration timestamp
  iat: number;           // Issued at timestamp
  role: string;          // User role (authenticated/service_role)
  app_metadata: {
    provider: string;    // Auth provider
    providers: string[]; // Available providers
  };
  user_metadata: {
    display_name: string;
    language: string;
    avatar_url?: string;
  };
  session_id: string;    // Session identifier
}
```

### Authorization Patterns

```typescript
// Middleware for route protection
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      type: "https://api.photomemory.ai/problems/unauthorized",
      title: "Authentication Required",
      status: 401,
      detail: "Valid authentication token is required",
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        type: "https://api.photomemory.ai/problems/invalid-token", 
        title: "Invalid Token",
        status: 401,
        detail: "The provided authentication token is invalid or expired",
        timestamp: new Date().toISOString()
      });
    }

    // Add user to request context
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      type: "https://api.photomemory.ai/problems/server-error",
      title: "Internal Server Error", 
      status: 500,
      detail: "Authentication service temporarily unavailable",
      timestamp: new Date().toISOString()
    });
  }
};

// Resource ownership validation
export const validateProjectOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const { data: project, error } = await supabase
    .from('video_projects')
    .select('user_id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !project) {
    return res.status(403).json({
      type: "https://api.photomemory.ai/problems/access-denied",
      title: "Access Denied",
      status: 403, 
      detail: "You don't have permission to access this resource",
      instance: `/projects/${projectId}`,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Subscription limit checking
export const checkSubscriptionLimits = (limitType: 'projects' | 'videos' | 'storage') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    
    try {
      const hasPermission = await subscriptionService.checkUserLimit(userId, limitType);
      
      if (!hasPermission) {
        return res.status(403).json({
          type: "https://api.photomemory.ai/problems/subscription-limit",
          title: "Subscription Limit Exceeded", 
          status: 403,
          detail: `Your current plan doesn't allow this operation. Please upgrade your subscription.`,
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        type: "https://api.photomemory.ai/problems/server-error",
        title: "Internal Server Error",
        status: 500, 
        detail: "Unable to verify subscription limits",
        timestamp: new Date().toISOString()
      });
    }
  };
};
```

---

## 📝 Request/Response Validation

### Zod Validation Schemas

```typescript
// Input validation schemas
export const schemas = {
  // User registration
  userRegistration: z.object({
    email: z.string()
      .email("Invalid email format")
      .max(255, "Email too long")
      .transform(email => email.toLowerCase()),
    
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    
    displayName: z.string()
      .min(2, "Display name too short")
      .max(100, "Display name too long")
      .regex(/^[a-zA-Z\s\-\.\']+$/, "Invalid characters in display name"),
    
    language: z.enum(['en', 'ko', 'ja', 'zh-cn', 'es', 'fr', 'de'])
      .default('en')
  }),

  // Project creation
  createProject: z.object({
    title: z.string()
      .min(1, "Title is required")
      .max(100, "Title too long")
      .trim(),
    
    description: z.string()
      .max(500, "Description too long")
      .trim()
      .optional(),
    
    style: z.enum(['classic', 'modern', 'cinematic', 'vintage']),
    
    durationMinutes: z.number()
      .int("Duration must be a whole number")
      .min(1, "Duration must be at least 1 minute")
      .max(30, "Duration cannot exceed 30 minutes"),
    
    aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).default('16:9'),
    
    resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
    
    aiPrompt: z.string()
      .max(1000, "AI prompt too long")
      .trim()
      .optional(),
    
    titleTranslations: z.record(
      z.enum(['en', 'ko', 'ja', 'zh-cn', 'es', 'fr', 'de']),
      z.string().min(1).max(100)
    ).optional(),
    
    autoTranslate: z.boolean().default(false)
  }),

  // File upload validation
  fileUpload: z.object({
    file: z.object({
      originalname: z.string().min(1, "Filename required"),
      mimetype: z.enum([
        'image/jpeg', 'image/png', 'image/webp',
        'video/mp4', 'video/quicktime'
      ], { errorMap: () => ({ message: "Unsupported file type" }) }),
      size: z.number()
        .max(50 * 1024 * 1024, "File size cannot exceed 50MB")
        .min(1, "File cannot be empty")
    }),
    displayOrder: z.number().int().min(0).default(0),
    tags: z.array(z.string().max(50)).max(10).optional()
  }),

  // Video generation
  generateVideo: z.object({
    prompt: z.string()
      .max(1000, "Prompt too long")
      .trim()
      .optional(),
    
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    
    settings: z.object({
      includeAudio: z.boolean().default(true),
      watermark: z.boolean().default(false),
      resolution: z.enum(['720p', '1080p', '4k']).default('1080p'),
      frameRate: z.enum([24, 30, 60]).default(30),
      
      transitions: z.object({
        type: z.enum(['fade', 'slide', 'zoom', 'dissolve', 'wipe']).default('fade'),
        duration: z.number().min(0.1).max(3.0).default(0.5)
      }).optional(),
      
      audioSettings: z.object({
        musicVolume: z.number().min(0.0).max(1.0).default(0.3),
        musicGenre: z.enum([
          'ambient', 'upbeat', 'cinematic', 'emotional', 'energetic'
        ]).default('ambient')
      }).optional()
    }).optional()
  }),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20)
  })
};

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
        file: req.file
      });
      
      // Replace request data with validated/transformed data
      Object.assign(req, result);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          type: "https://api.photomemory.ai/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "The request contains invalid data",
          instance: req.originalUrl,
          timestamp: new Date().toISOString(),
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            code: err.code,
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
};
```

### Response Validation

```typescript
// Response transformation and validation
export const transformResponse = <T>(data: T, schema?: z.ZodSchema): T => {
  // Remove sensitive fields
  const cleaned = removePrivateFields(data);
  
  // Validate against response schema if provided
  if (schema) {
    try {
      return schema.parse(cleaned);
    } catch (error) {
      console.error('Response validation failed:', error);
      // Log but don't fail - return original data
    }
  }
  
  return cleaned;
};

// Remove private/internal fields
const removePrivateFields = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(removePrivateFields);
  }
  
  const cleaned = { ...obj };
  
  // Remove internal fields
  delete cleaned.internal_id;
  delete cleaned.created_by_system;
  delete cleaned.debug_info;
  
  // Remove sensitive fields
  delete cleaned.password_hash;
  delete cleaned.payment_method_details;
  delete cleaned.api_keys;
  
  // Recursively clean nested objects
  Object.keys(cleaned).forEach(key => {
    cleaned[key] = removePrivateFields(cleaned[key]);
  });
  
  return cleaned;
};
```

---

## ⚡ Rate Limiting & Security

### Rate Limiting Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiting configurations
const rateLimits = {
  // Public endpoints
  public: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '1 h'), // 100/hour per IP
    analytics: true
  }),
  
  // Authenticated endpoints
  authenticated: new Ratelimit({
    redis: Redis.fromEnv(), 
    limiter: Ratelimit.slidingWindow(1000, '1 h'), // 1000/hour per user
    analytics: true
  }),
  
  // Video generation (most expensive)
  generation: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10/hour per user
    analytics: true
  }),
  
  // File uploads
  upload: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, '1 h'), // 50/hour per user
    analytics: true
  })
};

// Rate limiting middleware
export const rateLimit = (type: keyof typeof rateLimits) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const ratelimit = rateLimits[type];
    
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString()
      });
      
      if (!success) {
        const retryAfter = Math.round((reset - Date.now()) / 1000);
        
        return res.status(429)
          .set('Retry-After', retryAfter.toString())
          .json({
            type: "https://api.photomemory.ai/problems/rate-limit-exceeded",
            title: "Rate Limit Exceeded",
            status: 429,
            detail: `You have exceeded the rate limit. Please wait ${retryAfter} seconds before trying again.`,
            timestamp: new Date().toISOString()
          });
      }
      
      next();
    } catch (error) {
      // Fail open on rate limiter errors
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
```

### Security Headers & CORS

```typescript
import helmet from 'helmet';
import cors from 'cors';

// Security configuration
export const securityConfig = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://storage.photomemory.ai"],
        mediaSrc: ["'self'", "https://storage.photomemory.ai"],
        connectSrc: ["'self'", "https://api.photomemory.ai"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  }),
  
  cors: cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://photomemory.ai', 'https://app.photomemory.ai']
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization', 
      'X-Requested-With',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining', 
      'X-RateLimit-Reset',
      'X-Request-ID'
    ]
  })
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.set('X-Request-ID', req.requestId);
  next();
};
```

---

## 📊 Error Handling Standards

### Comprehensive Error Handler

```typescript
// Error types
export class APIError extends Error {
  constructor(
    public type: string,
    public title: string,
    public status: number,
    public detail: string,
    public instance?: string,
    public errors?: Array<{field: string, code: string, message: string}>
  ) {
    super(detail);
    this.name = 'APIError';
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.requestId;
  const timestamp = new Date().toISOString();

  // Log error for monitoring
  console.error(`[${requestId}] Error:`, {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    timestamp
  });

  // Handle known API errors
  if (err instanceof APIError) {
    return res.status(err.status).json({
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.detail,
      instance: err.instance || req.originalUrl,
      timestamp,
      requestId,
      errors: err.errors
    });
  }

  // Handle validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      type: "https://api.photomemory.ai/problems/validation-error",
      title: "Validation Error",
      status: 400,
      detail: "The request contains invalid data",
      instance: req.originalUrl,
      timestamp,
      requestId,
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        code: e.code,
        message: e.message
      }))
    });
  }

  // Handle database errors
  if (err.name === 'PostgrestError') {
    return res.status(500).json({
      type: "https://api.photomemory.ai/problems/database-error",
      title: "Database Error",
      status: 500,
      detail: "A database error occurred",
      instance: req.originalUrl,
      timestamp,
      requestId
    });
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      type: "https://api.photomemory.ai/problems/file-too-large",
      title: "File Too Large",
      status: 413,
      detail: "The uploaded file exceeds the maximum allowed size",
      instance: req.originalUrl,
      timestamp,
      requestId
    });
  }

  // Default server error
  res.status(500).json({
    type: "https://api.photomemory.ai/problems/server-error",
    title: "Internal Server Error",
    status: 500,
    detail: process.env.NODE_ENV === 'production' 
      ? "An unexpected error occurred" 
      : err.message,
    instance: req.originalUrl,
    timestamp,
    requestId
  });
};

// Error factory functions
export const errors = {
  notFound: (resource: string, id?: string) => 
    new APIError(
      "https://api.photomemory.ai/problems/resource-not-found",
      "Resource Not Found",
      404,
      `The requested ${resource} does not exist${id ? ` or has been deleted` : ''}`,
      id ? `/api/v2/${resource}s/${id}` : undefined
    ),

  forbidden: (detail: string = "You don't have permission to access this resource") =>
    new APIError(
      "https://api.photomemory.ai/problems/access-denied", 
      "Access Denied",
      403,
      detail
    ),

  conflict: (detail: string) =>
    new APIError(
      "https://api.photomemory.ai/problems/resource-conflict",
      "Resource Conflict", 
      409,
      detail
    ),

  subscriptionLimit: (feature: string) =>
    new APIError(
      "https://api.photomemory.ai/problems/subscription-limit",
      "Subscription Limit Exceeded",
      403,
      `Your current plan doesn't support ${feature}. Please upgrade your subscription.`
    )
};
```

---

## 🏗️ Implementation Architecture

### Express.js Route Structure

```typescript
// Main router setup
import express from 'express';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';  
import { projectRouter } from './routes/projects';
import { mediaRouter } from './routes/media';
import { generationRouter } from './routes/generation';
import { systemRouter } from './routes/system';

const app = express();

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(securityConfig.helmet);
app.use(securityConfig.cors);
app.use(requestId);

// API routes
app.use('/api/v2/auth', authRouter);
app.use('/api/v2/users', authMiddleware, userRouter);
app.use('/api/v2/projects', authMiddleware, projectRouter);
app.use('/api/v2/media', authMiddleware, mediaRouter); 
app.use('/api/v2/generation', authMiddleware, generationRouter);
app.use('/api/v2', systemRouter);

// Global error handler
app.use(errorHandler);

// Example route implementation
// routes/projects.ts
export const projectRouter = express.Router();

projectRouter.get(
  '/',
  rateLimit('authenticated'),
  validate(schemas.pagination),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, status, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
      const userId = req.user.id;
      
      let query = supabase
        .from('video_projects')
        .select(`
          id, user_id, title, description, style, duration_minutes,
          aspect_ratio, resolution, status, progress_percentage, 
          media_count, total_file_size_bytes, created_at, updated_at
        `)
        .eq('user_id', userId)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (status) {
        query = query.eq('status', status);
      }

      const offset = (page - 1) * limit;
      const { data: projects, error, count } = await query
        .range(offset, offset + limit - 1)
        .count('exact');

      if (error) {
        throw new APIError(
          "https://api.photomemory.ai/problems/database-error",
          "Database Error",
          500,
          "Failed to retrieve projects"
        );
      }

      const totalPages = Math.ceil(count / limit);

      res.json({
        data: projects.map(project => transformResponse(project)),
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

projectRouter.post(
  '/',
  rateLimit('authenticated'),
  checkSubscriptionLimits('projects'),
  validate(schemas.createProject),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const projectData = {
        user_id: userId,
        title: req.body.title,
        description: req.body.description,
        style: req.body.style,
        duration_minutes: req.body.durationMinutes,
        aspect_ratio: req.body.aspectRatio,
        resolution: req.body.resolution,
        ai_prompt: req.body.aiPrompt,
        // Handle i18n fields
        title_i18n: req.body.titleTranslations || { [req.user.language]: req.body.title },
        description_i18n: req.body.descriptionTranslations || 
          (req.body.description ? { [req.user.language]: req.body.description } : {})
      };

      const { data: project, error } = await supabase
        .from('video_projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        throw new APIError(
          "https://api.photomemory.ai/problems/database-error",
          "Database Error", 
          500,
          "Failed to create project"
        );
      }

      res.status(201).json(transformResponse(project));
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 🧪 Testing Strategy

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Analyze existing architecture and database schema for API requirements", "status": "completed", "priority": "high", "id": "1"}, {"content": "Design core API structure with OpenAPI 3.0 specification", "status": "completed", "priority": "high", "id": "2"}, {"content": "Define authentication and authorization patterns", "status": "completed", "priority": "high", "id": "3"}, {"content": "Create comprehensive request/response validation schemas", "status": "completed", "priority": "high", "id": "4"}, {"content": "Design error handling and status code standards", "status": "completed", "priority": "medium", "id": "5"}, {"content": "Implement rate limiting and security specifications", "status": "completed", "priority": "medium", "id": "6"}]