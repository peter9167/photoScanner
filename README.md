# PhotoMemory AI 🎬✨

Transform your precious photos into stunning AI-generated videos with ease. PhotoMemory AI uses cutting-edge artificial intelligence to create cinematic experiences from your memories.

## 🌟 Features

- 🎨 **AI-Powered Video Generation**: Transform photos into beautiful videos using advanced AI
- 🌍 **Multi-Language Support**: English, Korean, Japanese, and Chinese
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Updates**: Live progress tracking for video generation
- 🎭 **Multiple Video Styles**: Classic, Modern, Cinematic, and Vintage themes
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 💾 **Cloud Storage**: Secure file storage and management
- 💳 **Subscription Management**: Flexible pricing plans with Stripe integration

## 🏗️ Architecture

This project follows Domain-Driven Design (DDD) principles with Clean Architecture:

```
src/
├── app/                    # Next.js App Router
├── components/             # React Components
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── providers/         # Context providers
├── domain/                # Domain logic (DDD)
├── application/           # Application services & use cases
├── infrastructure/        # External integrations
├── lib/                  # Utilities & configurations
├── stores/               # State management (Zustand)
└── styles/               # Global styles
```

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Radix UI
- **State Management**: Zustand + React Query
- **Internationalization**: react-i18next
- **Animations**: Framer Motion

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Services**: OpenAI API
- **Payments**: Stripe
- **Caching**: Redis (Upstash)

### Infrastructure
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/photo-memory-ai.git
   cd photo-memory-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database & Authentication
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # AI Services
   OPENAI_API_KEY=your_openai_api_key
   
   # Payments (optional for development)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Database setup**
   
   Run the SQL migrations in your Supabase dashboard or use the Supabase CLI:
   ```bash
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run Playwright E2E tests

# Database
npm run db:generate-types    # Generate TypeScript types from Supabase
npm run db:reset            # Reset local database
npm run db:seed             # Seed database with sample data

# Analysis
npm run analyze         # Analyze bundle size
```

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main tables:

- `users` - User profiles and preferences
- `video_projects` - Video generation projects
- `photos` - Uploaded photos and metadata
- `generated_videos` - Generated video results
- `subscriptions` - User subscription information
- `usage_records` - Usage tracking and billing

See [Database Design Documentation](./docs/architecture/03-database-design.md) for detailed schema.

## 🌐 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Video Generation
- `GET /api/video/projects` - List user's projects
- `POST /api/video/projects` - Create new project
- `POST /api/video/generate` - Start video generation
- `GET /api/video/status/:id` - Check generation status

### Media Management
- `POST /api/media/upload` - Get signed upload URL
- `DELETE /api/media/:id` - Delete media file

See [API Documentation](./docs/architecture/04-api-design.md) for complete API reference.

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:ci
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [🏗️ Architecture Overview](./docs/architecture/README.md)
- [🎯 Domain Model](./docs/architecture/01-domain-model.md)
- [🏛️ Layered Architecture](./docs/architecture/02-layered-architecture.md)
- [🗄️ Database Design](./docs/architecture/03-database-design.md)
- [🔌 API Design](./docs/architecture/04-api-design.md)
- [🎨 Component Architecture](./docs/architecture/05-component-architecture.md)
- [🌍 Internationalization](./docs/architecture/06-i18n-strategy.md)
- [🔄 State Management](./docs/architecture/07-state-management.md)
- [🏗️ Infrastructure](./docs/architecture/08-infrastructure.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@photomemory-ai.com
- 💬 Discord: [Join our community](https://discord.gg/photomemory-ai)
- 📖 Documentation: [docs.photomemory-ai.com](https://docs.photomemory-ai.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/photo-memory-ai/issues)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for AI video generation capabilities
- [Supabase](https://supabase.com) for backend infrastructure
- [Vercel](https://vercel.com) for hosting and deployment
- [Stripe](https://stripe.com) for payment processing

---

Made with ❤️ by the PhotoMemory AI team