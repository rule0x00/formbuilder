# FormBuilder App

A simple dynamic form builder application with **admin** and **user** functionality.

---

## Running with Docker

1. **Navigate to the backend folder**

```bash
cd backend_formbuilder
Build Docker images

bash
Copy code
docker compose build
Start the application

bash
Copy code
docker compose up
The app will be available at:
http://localhost:3000

Running Locally (Without Docker)
If you want to run the app directly on your machine:

Install dependencies

bash
Copy code
npm install
Start the development server

bash
Copy code
npm run dev
The app will be available at:
http://localhost:3000

Admin User Creation
Run the app locally.

Change the role of a user in your MongoDB users collection.

Set the user's role field to "AdminUser" to enable admin privileges.

markdown
Copy code
