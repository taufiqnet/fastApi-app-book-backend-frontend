# Appointment Booking System

## Project Overview

The Appointment Booking System is a web application designed for healthcare providers to manage patient appointments, doctor schedules, and generate reports. It supports three user types: **Admin**, **Doctor**, and **Patient**, with distinct functionalities for each. The system ensures secure user authentication, robust appointment scheduling, and automated tasks like reminders and report generation.

### Technologies Used
- **Backend**: Python with FastAPI
- **Frontend**: React with Next.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **Background Tasks**: APScheduler for reminders and report generation
- **Containerization**: Docker

## Project Architecture

### Backend (FastAPI)
- **Framework**: FastAPI for high-performance, asynchronous API development.
- **Structure**:
  - **`backend/`**: The main directory containing all backend-related code.
  - **`app/`**: Houses the main application logic, including API endpoints under `api/`.
  - **`celery_app/`**: Contains Celery-related configurations and tasks for asynchronous processing.
  - **`core/`**: Includes core utilities and configurations like mail, scheduler, and security settings.
  - **`db/`**: Manages database operations with `crud/` for CRUD operations and `models/` for database models.

- **`schemas/`**: Contains schema definitions and related utilities.
  - **`tasks/`**: Manages background tasks such as reminders and reports.
  - **`utils/`**: Provides helper functions like email and validation logic.
  - **`tests/`**: Includes test cases, e.g., `test_user_registration.py`.

- **Configuration Files**:
  - `.env`: Environment variables.
  - `.gitignore`: Git ignore configuration.
  - `commands.md`: Documentation for commands.
  - `requirements.txt`: Project dependencies.
  - `test.db`: Test database file.
    
  - **Authentication**: JWT-based, with role-based access control (Admin, Doctor, Patient).
  - **Database**: MySQL with SQLAlchemy for ORM, Alembic for migrations.
  - **Background Tasks**: APScheduler for daily reminders and monthly reports.
  - **Logging**: Integrated logging for debugging and monitoring.
  - **Exception Handling**: Custom exception handlers for validation and server errors.

This structure supports a robust backend application with API handling, task scheduling, database management, and testing capabilities.

### Frontend (React/Next.js)
- **Framework**: Next.js for server-side rendering and static site generation.
- **Structure**:
  - **`src/app/`**: Contains the main application pages and features.
  - **`admin/profile/`**: Directory for admin profile-related components or pages.
  - **`appointment/`**: Handles appointment-related functionality.
  - **`auth/`**: Manages authentication logic.
  - **`doctor/`**: Contains doctor-related pages or components.
  - **`patient/`**: Handles patient-related functionality.
  - **`utils/`**: Utility functions or helpers for the app.

- **`src/components/`**: Reusable React components.
  - **`AppointmentList.tsx`**: Component for displaying appointment lists.
  - **`Layout.tsx`**: Main layout component for the application.
  - **`Notification.tsx`**: Component for handling notifications.

- **`src/context/`**: Directory for React context providers or related logic.

- **Global Files**:
  - **`globals.css`**: Global CSS styles for the application.
  - **`layout.tsx`**: Defines the root layout for the Next.js app.
  - **`page.module.css`**: Module-specific CSS for pages.
  - **`page.tsx`**: Main page component or entry point.

- **Configuration and Metadata**:
  - **`favicon.ico`**: Application favicon.
  - **`.gitignore`**: Git ignore configuration.
  - **`eslint.config.mjs`**: ESLint configuration file.
  - **`next-env.d.ts`**: TypeScript environment definitions for Next.js.
  - **`next.config.ts`**: Next.js configuration file.
  - **`package-lock.json`**: Lock file for package dependencies.
  - **`package.json`**: Project dependencies and scripts.
  - **`postcss.config.mjs`**: PostCSS configuration file.

### Database (MySQL)
- **Schema**:
  - **Users**: Stores user details (full name, email, mobile, password, user type, address, profile image).
  - **Appointments**: Stores appointment details (doctor, patient, date, time, status, notes).
  - **Reports**: Stores generated monthly reports (total visits, appointments, earnings per doctor).
- **Relationships**:
  - One-to-Many: Doctor to Appointments, Patient to Appointments.
  - Many-to-One: Appointments to Doctor, Appointments to Patient.

### Workflow
1. **User Registration**: Users register with validated inputs (email, mobile, password, etc.). Doctors provide additional details (license, timeslots).
2. **Authentication**: JWT tokens are issued on login, stored in local storage, and validated for protected routes.
3. **Appointment Booking**: Patients select doctors, dates, and timeslots, validated against doctor availability.
4. **Background Tasks**:
   - Daily reminders sent 24 hours before appointments.
   - Monthly reports generated for admins (patient visits, appointments, earnings).
5. **Filtering/Pagination**: Doctors and appointments can be filtered by criteria (e.g., specialization, status) with paginated results.
6. **Admin Features**: Admins can manage all users, appointments, and generate reports.

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Docker
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/appointment-booking-system.git
   cd appointment-booking-system/backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and configure:
     ```env
     DATABASE_URL=mysql+mysqlconnector://user:password@localhost:3306/appointment_book
     JWT_SECRET=your_jwt_secret_key
     JWT_ALGORITHM=HS256
     ```
4. Initialize the database:
   ```bash
   alembic upgrade head
   python seed.py  # Run seed script for sample data
   ```
5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create `.env.local` and add:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
     ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
5. Access the application at `http://localhost:3000`.

### Docker Setup (Optional)
1. Ensure Docker and Docker Compose are installed.
2. Build and run the application:
   ```bash
   docker-compose up --build
   ```
3. Access the backend at `http://localhost:8000` and frontend at `http://localhost:3000`.

## API Documentation

### Base URL
`http://localhost:8000/api/v1`

### Authentication
- **POST /auth/register**: Register a new user.
  - Request Body:
    ```json
    {
      "full_name": "Dr. Hasan",
      "email": "drhasan@example.com",
      "mobile_number": "+8801000000001",
      "password": "Doctor@123",
      "user_type": "doctor",
      "division": "Dhaka",
      "district": "Dhaka",
      "thana": "Mirpur",
      "license_number": "DOC-123",
      "experience_years": 5,
      "consultation_fee": 800,
      "available_timeslots": "10:00-11:00"
    }

    ```
  - Response: `201 Created` with user details.
- **POST /auth/login**: Authenticate and receive JWT token.
  - Request Body:
    ```json
      {
        "email": "drhasan@example.com",
        "password": "Doctor@123"
      }
    ```
  - Response: `200 OK` with JWT token.
- **POST /auth/logout**: Invalidate JWT token (client-side token removal).

### Users
- **GET /users/me**: Get current user profile (authenticated).
- **PUT /users/me**: Update user profile.
- **GET /users**: List all users (Admin only, with pagination and filters).

### Appointments
- **POST /appointments**: Book an appointment (Patient only).
  - Request Body:
    ```json
    {
      "doctor_id": 1,
      "appointment_time": "2025-07-18T10:00:00",
      "notes": "Severe headache for 2 days"
    }
    ```
  - Response: `201 Created` with appointment details.
- **GET /appointments**: List appointments with filters (date, status, doctor).
- **PUT /appointments/{id}**: Update appointment status (Doctor/Admin only).

### Reports
- **GET /reports/monthly**: Generate monthly report (Admin only).
  - Response:
    ```json
    {
      "month": "2025-07",
      "total_visits": 100,
      "total_appointments": 120,
      "earnings_per_doctor": [
        { "doctor_id": 1, "total_earnings": 5000 }
      ]
    }
    ```

## Database Schema

### Tables
1. **Users**
   - `id`: INT, Primary Key
   - `full_name`: VARCHAR(100)
   - `email`: VARCHAR(255), Unique
   - `mobile_number`: VARCHAR(14), Unique
   - `password`: VARCHAR(255)
   - `user_type`: ENUM('Patient', 'Doctor', 'Admin')
   - `division_id`: INT, Foreign Key
   - `district_id`: INT, Foreign Key
   - `thana_id`: INT, Foreign Key
   - `profile_image`: TEXT (Base64 encoded)
   - `created_at`: DATETIME
3. **Appointments**
   - `id`: INT, Primary Key
   - `doctor_id`: INT, Foreign Key (Users)
   - `patient_id`: INT, Foreign Key (Users)
   - `appointment_date`: DATE
   - `appointment_time`: TIME
   - `notes`: TEXT
   - `status`: ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed')
   - `created_at`: DATETIME
4. **Reports**
   - `id`: INT, Primary Key
   - `month`: VARCHAR(7) (e.g., "2025-07")
   - `total_visits`: INT
   - `total_appointments`: INT
   - `earnings_per_doctor`: JSON

### Seed Data
A `seed.py` script populates the database with:
- 5 sample users (1 Admin, 2 Doctors, 2 Patients).
- 10 sample appointments.

## Challenges and Assumptions
- **Challenge**: Timeslot validation for appointments.
  - **Solution**: Validate against doctor’s available timeslots stored in JSON format.
- **Assumption**: Business hours are 9:00 AM to 5:00 PM unless specified by doctor timeslots.
- **Assumption**: Profile images are stored as Base64 strings to simplify database schema.

## Demo Video Outline
- **User Registration**: Show registration with validation errors (e.g., invalid mobile, weak password).
- **Login/Logout**: Demonstrate JWT-based authentication and dashboard access.
- **Appointment Booking**: Book an appointment with timeslot validation.
- **Filtering/Pagination**: Show doctor and appointment lists with filters.
- **Reports**: Generate and display a monthly report.
- **Scheduler**: Show reminder email simulation and report generation.