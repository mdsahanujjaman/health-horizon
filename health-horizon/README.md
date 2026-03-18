# Health Horizon

This is the Health Horizon application, a full-stack health management system.

## Project Structure

- `health-horizon`: Backend (Node.js)
- `health-horizon-frontend`: Frontend (React + Vite)
- `health-horizon/ml-service`: Machine Learning Service (Python/Flask)
- `docker-compose.yml`: Docker orchestration file

## Prerequisites

To run this application on another machine, you need to install:

1.  **Git**: To clone the repository.
2.  **Docker Desktop**: To run the application containers.
    - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

## How to Run

1.  **Clone the Repository** (or copy the project folder):
    ```bash
    git clone <your-repo-url>
    cd health-horizon
    ```

2.  **Start the Application**:
    Open a terminal in the project root folder (where `docker-compose.yml` is located) and run:
    ```bash
    docker-compose up --build
    ```
    *Note: The `--build` flag ensures that any changes are recompiled into the Docker images.*

3.  **Access the Application**:
    - **Frontend**: [http://localhost:80](http://localhost:80)
    - **Backend API**: [http://localhost:8080](http://localhost:8080)
    - **ML Service**: [http://localhost:5000](http://localhost:5000)
    - **Database**: [localhost:5433](localhost:5433) (User: `healthuser`, Password: `healthpass`, DB: `health_horizon`)

## Troubleshooting

- **Port Conflicts**: If you cannot start the app, ensure ports `80`, `8080`, `5000`, and `5433` are free.
- **Docker Not Running**: Ensure Docker Desktop is started and running in the background.
- **Database Connection**: The backend waits for the database to be healthy using a healthcheck. If it fails, check the logs with `docker-compose logs postgres`.

## Development vs Docker

- **Docker Mode** (`docker-compose up`):
  - Frontend: `http://localhost:80` (served via Nginx)
  - Backend: `http://localhost:8080`

- **Development Mode** (Running locally without Docker):
  - If you run `npm run dev` in the frontend folder, it will start on **http://localhost:5173**.
  - If you run `npm start` in the backend folder, it will start on **http://localhost:8080**.
