# PhotoMemory AI Architecture Design

## 🏗️ System Architecture Overview

PhotoMemory AI는 Domain-Driven Design (DDD) 원칙과 Clean Architecture를 기반으로 설계된 AI 기반 비디오 생성 플랫폼입니다.

### 📋 Table of Contents
1. [Domain Model](./01-domain-model.md)
2. [Layered Architecture](./02-layered-architecture.md)
3. [Database Design](./03-database-design.md)
4. [API Design](./04-api-design.md)
5. [Component Architecture](./05-component-architecture.md)
6. [Multi-language Strategy](./06-i18n-strategy.md)
7. [State Management](./07-state-management.md)
8. [Infrastructure](./08-infrastructure.md)

## 🎯 Core Design Principles

### 1. Domain-Driven Design (DDD)
- **Bounded Contexts**: 명확하게 구분된 도메인 경계
- **Ubiquitous Language**: 비즈니스와 개발팀이 공유하는 일관된 언어
- **Aggregate Roots**: 도메인 무결성을 보장하는 진입점
- **Domain Events**: 시스템 간 느슨한 결합

### 2. Clean Architecture
- **Independence**: 프레임워크, UI, 데이터베이스로부터 독립적
- **Testability**: 비즈니스 로직의 완전한 테스트 가능성
- **Separation of Concerns**: 명확한 책임 분리

### 3. SOLID Principles
- Single Responsibility Principle
- Open/Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

## 🔧 Technology Stack

### Frontend
- **Framework**: React 19.1 + TypeScript 4.9
- **State Management**: Zustand + React Query
- **Styling**: TailwindCSS + Radix UI
- **i18n**: react-i18next
- **Build Tool**: Vite (migration from CRA)
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: tRPC or GraphQL (with type safety)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI API / Replicate API

### Infrastructure
- **Hosting**: Vercel (Frontend) + Supabase (Backend)
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Vercel Analytics
- **CI/CD**: GitHub Actions

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web App   │  │ Mobile Web  │  │   Admin     │            │
│  │  (React)    │  │  (React)    │  │  Dashboard  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Gateway (tRPC/GraphQL)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
│  │   Auth     │  │   Video    │  │   Media    │  │Payment │  │
│  │  Service   │  │ Generation │  │  Service   │  │Service │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Domain Layer                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
│  │    User    │  │   Video    │  │   Media    │  │Project │  │
│  │   Domain   │  │  Domain    │  │  Domain    │  │Domain  │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐  │
│  │  Supabase  │  │  Storage   │  │    AI      │  │External│  │
│  │    Auth    │  │   (S3)     │  │   APIs     │  │  APIs  │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Supabase Database                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Bounded Contexts

### 1. User Management Context
- User registration/authentication
- Profile management
- Subscription management
- Multi-language preferences

### 2. Video Generation Context
- Project creation
- Photo upload and management
- AI prompt processing
- Video style selection
- Generation queue management

### 3. Media Management Context
- File upload/storage
- Image processing
- Video encoding
- CDN distribution

### 4. Payment Context
- Subscription plans
- Payment processing
- Usage tracking
- Billing history

## 🚀 Next Steps

1. **Immediate Actions**
   - Set up development environment
   - Initialize Supabase project
   - Configure i18n framework
   - Create base component library

2. **Short-term Goals**
   - Implement authentication flow
   - Build file upload system
   - Create video generation queue
   - Set up monitoring

3. **Long-term Vision**
   - Scale to handle concurrent users
   - Add advanced AI features
   - Implement collaborative features
   - Mobile app development