# Employee Management System

## 1. Project Overview
The Employee Management System is a web application developed to manage employee records. It allows users to view, add, update, delete, and search employee information.

## 2. Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js using the built-in HTTP module
- **Data Storage:** JSON file (`data/employees.json`)
- **API Testing:** Postman
- **Development Environment:** Visual Studio Code

## 3. Project Structure
- `server.js` — Handles the server, API requests, and employee operations.
- `package.json` — Contains project configuration and scripts.
- `public/index.html` — Defines the webpage structure.
- `public/styles.css` — Contains the webpage styling.
- `public/app.js` — Handles frontend interactions and API communication.
- `data/employees.json` — Stores employee records.
- `README.md` — Contains project documentation.

## 4. How to Run the Project
1. Install Node.js.
2. Open the project folder in Visual Studio Code.
3. Open the integrated terminal.
4. Run `npm.cmd start`.
5. Open `http://localhost:3000` in a browser.

## 5. Main Features
- View employee records.
- Add new employees.
- Update existing employee information.
- Delete employee records.
- Search employee records, if enabled in the application.
- Store employee data in a JSON file.

## 6. API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/employees` | Retrieve employee records |
| GET | `/api/employees/:id` | Retrieve one employee |
| POST | `/api/employees` | Add an employee |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

## 7. Testing
The API endpoints are tested using Postman. Screenshots of the actual GET, POST, PUT, and DELETE responses are included as supporting evidence.

## 8. Database and Connectivity
The application uses a JSON file for data storage rather than a separate database server. The frontend sends HTTP requests to the Node.js backend, which processes employee operations and returns responses.

## 9. Conclusion
The Employee Management System demonstrates basic CRUD operations, frontend-backend communication, API development, and file-based data storage using Node.js.
