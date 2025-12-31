# Plantheon Admin Dashboard

A comprehensive web-based administration panel for managing the Plantheon plant disease detection system. This dashboard provides administrators with powerful tools to manage plants, diseases, user reports, news content, and monitor AI-powered scan analytics.

## Overview

Plantheon Admin is built on Ant Design, offering a modern, responsive interface for managing all aspects of the Plantheon ecosystem. The platform enables administrators to oversee plant disease detection operations, manage content, handle user complaints, and analyze system performance through detailed analytics.

## Key Features

### 📊 Scan Reports & Analytics
- Real-time dashboard displaying scan statistics and trends
- Visual analytics with charts and graphs powered by `@ant-design/plots`
- Monitor AI model performance and detection accuracy
- Track user engagement and scan patterns

### 🌱 Plant Management
- Create, update, and delete plant entries
- Manage plant information including images, descriptions, and characteristics
- Organize plant database for the mobile application

### 🐛 Disease Management
- Comprehensive disease catalog management
- Add disease information, symptoms, and treatment solutions
- Upload and manage disease reference images
- Link diseases to affected plant species

### ⚠️ Complaint Management
- Review and verify user-submitted scan complaints
- Handle reports of incorrect AI predictions
- Track complaint resolution status
- Analyze problematic disease patterns

### 👥 User Management
- View and manage registered users
- Monitor user activity and contributions
- Track top contributors to the system

### 📰 News & Content Management
- Create and publish news articles with markdown editor
- Manage farming tips and agricultural guides
- Rich text editing with `@uiw/react-md-editor`

### 🔑 Activity Keywords
- Manage system-wide activity keywords
- Configure search and categorization terms

## Technology Stack

### Core Framework
- **React 19.1.0** - Modern UI library with latest features
- **TypeScript 5.6.3** - Type-safe development
- **Umi 4.6.9** - Enterprise-level React application framework
- **Ant Design 5.25.4** - Professional UI component library
- **Ant Design Pro Components 2.7.19** - Advanced business components

### Data Visualization
- **@ant-design/plots 2.6.6** - Statistical charts and graphs
- **Recharts 2.10.3** - Composable charting library
- **@antv/l7** - Geospatial data visualization

### Content Management
- **@uiw/react-md-editor** - Markdown editor for news and guides
- **markdown-it** - Markdown parser
- **react-markdown-editor-lite** - Lightweight markdown editor

### Development Tools
- **Cross-env** - Cross-platform environment variables
- **Day.js** - Date manipulation library
- **Numeral** - Number formatting

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** or **yarn** package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SE505_Plantheon_Admin
```

2. Install dependencies:
```bash
npm install
```

or

```bash
yarn
```

3. Configure environment variables (if needed):
Create a `.env` file in the root directory with necessary configuration.

## Available Scripts

### Development

Start the development server:
```bash
npm start
```

Start with specific environment:
```bash
npm run start:dev    # Development environment
npm run start:test   # Test environment
npm run start:pre    # Pre-production environment
```

Start without mock data:
```bash
npm run start:no-mock
```

### Production

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

Analyze bundle size:
```bash
npm run analyze
```

### Code Quality

Run TypeScript type checking:
```bash
npm run tsc
```

Lint code:
```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint:fix
```

## Project Structure

```
SE505_Plantheon_Admin/
├── config/              # Application configuration
│   └── routes.ts       # Route definitions
├── public/             # Static assets
├── src/
│   ├── pages/          # Page components
│   │   ├── scan-reports/      # Analytics dashboard
│   │   ├── plant/             # Plant management
│   │   ├── disease/           # Disease management
│   │   ├── complaint/         # Complaint handling
│   │   ├── users/             # User management
│   │   ├── news/              # News management
│   │   ├── farming-guide/     # Farming tips
│   │   ├── activity-keyword/  # Keyword management
│   │   └── user/              # Authentication
│   ├── components/     # Reusable components
│   ├── services/       # API services
│   └── types/          # TypeScript type definitions
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Main Routes

- `/scan-reports` - Scan analytics dashboard (default)
- `/plant` - Plant management
- `/disease` - Disease management
- `/complaint` - Complaint management
- `/users` - User management
- `/news` - News management
- `/farming-guide` - Farming guide management
- `/activity-keyword` - Activity keyword management

## Development Guidelines

1. **Code Style**: Follow the project's ESLint and TypeScript configurations
2. **Component Structure**: Use functional components with React Hooks
3. **Type Safety**: Leverage TypeScript for type checking
4. **State Management**: Utilize Umi's built-in state management
5. **API Integration**: Use the services layer for backend communication

## Browser Support

Modern browsers with ES2015+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Run tests and linting before committing
4. Submit a pull request with a clear description

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team or create an issue in the project repository.
