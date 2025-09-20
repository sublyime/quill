# DataQuill

DataQuill is a modern, real-time data ingestion and visualization platform built with Next.js, Spring Boot, and a robust tech stack. It enables seamless data source connection management, real-time data visualization, and intelligent storage configuration.

## Features

- 🔌 **Connection Management**: Configure and manage various data source connections (MQTT, TCP, etc.)
- 📊 **Real-time Visualization**: Dynamic dashboards for real-time data monitoring
- 💾 **Storage Configuration**: Flexible storage backend configuration with multiple provider support
- 👥 **User Management**: Role-based access control with comprehensive user administration
- 🔐 **Security**: Built-in authentication and authorization
- 🎨 **Modern UI**: Sleek, responsive interface built with Tailwind CSS and shadcn/ui

## Tech Stack

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- xterm.js for Terminal Emulation
- React Hook Form for Form Management
- Zod for Schema Validation

### Backend
- Spring Boot
- Java 17+
- PostgreSQL
- Maven
- Flyway for Database Migrations

## Getting Started

### Prerequisites

- Node.js 18+
- Java Development Kit (JDK) 17+
- PostgreSQL 12+
- Maven 3.8+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sublyime/quill.git
   cd quill
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Setup the database:
   - Create a PostgreSQL database named 'quill'
   - Update database credentials in `backend/src/main/resources/application.properties`

4. Run database migrations:
   ```bash
   cd backend
   mvn flyway:migrate
   ```

5. Start the backend server:
   ```bash
   mvn spring-boot:run
   ```

6. Start the frontend development server:
   ```bash
   npm run dev
   ```

7. Visit http://localhost:3000 to access the application

## Development

### Project Structure

```
quill/
├── src/                    # Frontend source code
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable React components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and APIs
├── backend/               # Backend source code
│   └── src/
│       └── main/
│           ├── java/     # Java source files
│           └── resources/ # Configuration files
└── docs/                 # Documentation
```

### Key Components

- **Connection Management**: Configure data source connections with dynamic form generation based on connection type
- **Storage Configuration**: Set up and manage different storage backends with automated testing
- **User Management**: Comprehensive user administration with role-based permissions
- **Terminal**: Interactive terminal component for direct data source interaction
- **Data Visualization**: Real-time data visualization tools with multiple chart types

## Configuration

### Frontend Configuration

Environment variables can be set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend Configuration

Configure the application in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/quill
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## API Documentation

The backend API is documented using Swagger UI. Access it at `http://localhost:8080/swagger-ui.html` when the backend is running.

## Security

- Built-in authentication and authorization
- Role-based access control
- Secure password hashing
- CORS configuration for API security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

## License

MIT License. See [LICENSE](LICENSE) for more information.
