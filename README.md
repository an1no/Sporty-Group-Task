# Sports Leagues Application

This project is a single-page application (SPA) built with Angular that consumes the SportsDB API to display and filter a list of sports leagues.

## 🌐 Live Demo

The application is deployed and accessible at: **[http://sporty.ngrok.app](http://sporty.ngrok.app)**


### ✅ Core Features
- **API Integration**: The application successfully fetches data from the `all_leagues.php` endpoint and displays the `strLeague`, `strSport`, and `strLeagueAlternate` fields
- **Filtering**: A search bar allows for real-time filtering of leagues by name, and a dropdown menu enables filtering by sport type. The search is case-insensitive and also checks the alternate league name
- **Component-Based Architecture**: The application logic is modular and organized into distinct, reusable components: `AppComponent`, `SearchFilterComponent`, and `LeagueListComponent`
- **Dynamic Badge Display**: Clicking on a league card triggers an API call to fetch a season badge, which is then displayed in the card. Clicking the card again hides the badge
- **Responsive UI**: The layout is responsive and provides a functional experience on both desktop and mobile devices

## 🚀 Going Above and Beyond

In addition to the core requirements, several advanced features have been incorporated:

### 🏎️ Advanced Caching
- **IndexedDB Integration**: A custom `CacheService` was implemented using IndexedDB with the Dexie library
- **Performance Optimization**: Caches API responses for extended periods, significantly improving performance on repeat visits by reducing unnecessary network calls
- **Smart Cache Management**: Implements cache expiration and automatic cleanup mechanisms

### 🧪 Comprehensive Testing
- **Unit Tests**: Extensive unit tests written using Karma and Jasmine ensure reliability of all core application logic
- **API Testing**: Complete test coverage for API service calls and caching behavior
- **Component Testing**: Full test suite for component functionality and user interactions

### 🐳 Containerization & DevOps
- **Docker Support**: The entire application has been containerized using a multi-stage Dockerfile
- **Production Ready**: Configured with nginx for optimal performance and production deployment
- **Docker Compose**: Includes `docker-compose.yml` for easy local development and deployment

### 🔄 CI/CD Pipeline
- **GitHub Actions**: Automated workflow for build, test, and deployment processes
- **Automated Testing**: Pipeline runs comprehensive unit tests on every push
- **Automated Deployment**: Manual trigger for building Docker images and deploying to live environment
- **Raspberry Pi Deployment**: Configured for deployment to Raspberry Pi with SSH automation

## 🛠️ Technical Stack

- **Framework**: Angular 20+ with standalone components
- **Language**: TypeScript with strict typing
- **Styling**: Modern CSS with responsive design
- **State Management**: Angular Signals for reactive programming
- **Caching**: Dexie.js for IndexedDB integration
- **Testing**: Karma, Jasmine with comprehensive test coverage
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions
- **Deployment**: nginx, Raspberry Pi, ngrok tunneling

## 📂 Project Structure

```
src/
├── app.component.ts              # Main application component with signals
├── app.component.html            # Root template
├── components/
│   ├── league-list/              # League display component
│   │   ├── league-list.component.ts
│   │   └── league-list.component.html
│   └── search-filter/            # Search and filtering component
│       ├── search-filter.component.ts
│       └── search-filter.component.html
├── models/
│   ├── league.model.ts           # League interface definition
│   └── season.model.ts           # Season interface definition
├── services/
│   ├── sports.service.ts         # API service with caching
│   └── cache.service.ts          # IndexedDB cache management
├── config/
│   └── api.config.ts             # API configuration
└── environments/                 # Environment configurations
```

## 🤖 AI-Powered Development

This project was developed using various AI tools that significantly accelerated the development process and enhanced code quality:

### 🧠 Development Phases

**Initial Development Phase**
- **Google AI Studio (Gemini 2.5 Pro)**: Used for initial project architecture, component design, and core Angular implementation. The model provided excellent guidance on modern Angular patterns, standalone components, and signal-based state management.

**Advanced Features & Testing**
- **GitHub Copilot (Claude Sonnet 4 & GPT-4.1)**: Leveraged for implementing advanced features such as IndexedDB caching with Dexie.js, comprehensive unit testing, and CI/CD pipeline configuration. The AI assistance was particularly valuable for:
  - Writing extensive test suites with high coverage
  - Docker containerization and multi-stage builds
  - GitHub Actions workflow optimization
  - Code refactoring and best practices implementation

**Infrastructure & Deployment**
- **Gemini CLI (Gemini 2.5 Flash)**: Utilized for Raspberry Pi setup, server configuration, and ngrok tunneling implementation. This tool was instrumental in:
  - Automated deployment script creation
  - SSH configuration and security setup
  - Network tunneling and external access configuration
