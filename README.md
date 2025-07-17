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
  - **`/app`**: Main application directory.
    - **`/api/v1`**: Versioned API endpoints.
      - `/auth`: Handles registration, login, logout, and JWT token management.
      - `/users`: User profile management (CRUD operations).
      - `/doctors`: Doctor-specific operations (schedules, availability).
      - `/appointments`: Appointment booking, status updates, and history.
      - `/reports`: Monthly report generation.
    - **`/models`**: SQLAlchemy ORM models for database tables.
    - **`/schemas`**: Pydantic models for request/response validation.
    - **`/services`**: Business logic (e.g., appointment scheduling, report generation).
    - **`/utils`**: Utilities (e.g., JWT handling, password hashing, validation).
    - **`/tasks`**: Background tasks (e.g., appointment reminders, report generation).
    - **`/config`**: Configuration (database, environment variables).
  - **Authentication**: JWT-based, with role-based access control (Admin, Doctor, Patient).
  - **Database**: MySQL with SQLAlchemy for ORM, Alembic for migrations.
  - **Background Tasks**: APScheduler for daily reminders and monthly reports.
  - **Logging**: Integrated logging for debugging and monitoring.
  - **Exception Handling**: Custom exception handlers for validation and server errors.

### Frontend (React/Next.js)
- **Framework**: Next.js for server-side rendering and static site generation.
- **Structure**:
  - **`/pages`**: Next.js pages for routing (e.g., `/login`, `/dashboard`, `/appointments`).
  - **`/components`**: Reusable React components (e.g., `Navbar`, `AppointmentCard`).
  - **`/hooks`**: Custom hooks for API calls and state management.
  - **`/styles`**: Tailwind CSS for responsive styling.
  - **`/lib`**: Utility functions (e.g., API client, JWT handling).
  - **`/public`**: Static assets (e.g., images).
- **Features**:
  - Role-based dashboards (Admin, Doctor, Patient).
  - Responsive design with Tailwind CSS.
  - Client-side validation for forms (e.g., registration, appointment booking).
  - Pagination and filtering for lists (e.g., doctors, appointments).
  - Search functionality for doctors and patients.

### Database (MySQL)
- **Schema**:
  - **Users**: Stores user details (full name, email, mobile, password, user type, address, profile image).
  - **Doctors**: Stores doctor-specific details (license number, experience years, consultation fee, timeslots).
  - **Appointments**: Stores appointment details (doctor, patient, date, time, status, notes).
  - **Reports**: Stores generated monthly reports (total visits, appointments, earnings per doctor).
  - **Divisions**, **Districts**, **Thanas**: Stores hierarchical address data for cascading dropdowns.
- **Relationships**:
  - One-to-Many: Doctor to Appointments, Patient to Appointments.
  - Many-to-One: Appointments to Doctor, Appointments to Patient.
  - Hierarchical: Divisions → Districts → Thanas.

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
- Docker (optional, for containerized deployment)
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
     DATABASE_URL=mysql+mysqlconnector://user:password@localhost:3306/appointment_db
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
      "full_name": "John Doe",
      "email": "john@example.com",
      "mobile_number": "+8801234567890",
      "password": "Password@123",
      "user_type": "Patient",
      "division_id": 1,
      "district_id": 1,
      "thana_id": 1,
      "profile_image": "base64_encoded_image",
      "license_number": "LIC123", // Required for Doctor
      "experience_years": 5, // Required for Doctor
      "consultation_fee": 500, // Required for Doctor
      "available_timeslots": ["10:00-11:00", "14:00-15:00"] // Required for Doctor
    }
    ```
  - Response: `201 Created` with user details.
- **POST /auth/login**: Authenticate and receive JWT token.
  - Request Body:
    ```json
    {
      "email": "john@example.com",
      "password": "Password@123"
    }
    ```
  - Response: `200 OK` with JWT token.
- **POST /auth/logout**: Invalidate JWT token (client-side token removal).

### Users
- **GET /users/me**: Get current user profile (authenticated).
- **PUT /users/me**: Update user profile.
- **GET /users**: List all users (Admin only, with pagination and filters).

### Doctors
- **GET /doctors**: List doctors with filters (specialization, availability, location).
- **PUT /doctors/{id}/schedule**: Update doctor availability (Doctor only).

### Appointments
- **POST /appointments**: Book an appointment (Patient only).
  - Request Body:
    ```json
    {
      "doctor_id": 1,
      "appointment_date": "2025-07-12",
      "appointment_time": "10:00",
      "notes": "Fever and cough",
      "status": "Pending"
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
2. **Doctors**
   - `user_id`: INT, Foreign Key (Users), Primary Key
   - `license_number`: VARCHAR(50)
   - `experience_years`: INT
   - `consultation_fee`: DECIMAL(10,2)
   - `available_timeslots`: JSON
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
5. **Divisions**
   - `id`: INT, Primary Key
   - `name`: VARCHAR(100)
6. **Districts**
   - `id`: INT, Primary Key
   - `name`: VARCHAR(100)
   - `division_id`: INT, Foreign Key
7. **Thanas**
   - `id`: INT, Primary Key
   - `name`: VARCHAR(100)
   - `district_id`: INT, Foreign Key

### Seed Data
A `seed.py` script populates the database with:
- 3 Divisions, 5 Districts, 10 Thanas.
- 5 sample users (1 Admin, 2 Doctors, 2 Patients).
- 10 sample appointments.

## Challenges and Assumptions
- **Challenge**: Handling cascading dropdowns (Division → District → Thana).
  - **Solution**: Preload address data in frontend and use API filtering for dynamic updates.
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