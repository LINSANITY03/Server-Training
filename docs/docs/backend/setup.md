# Backend Setup

# Local Development Setup

This guide walks you through setting up the AI-powered custom server training platform backend on your local machine. 

We use **[uv](https://docs.astral.sh/uv/)** for lightning-fast Python dependency management and **Docker Compose** to run our PostgreSQL database.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
* **Python:** `>= 3.11`
* **Docker & Docker Compose:** [Install Docker Desktop](https://www.docker.com/products/docker-desktop/)
* **uv:** Install via curl or Homebrew (macOS):
  ```bash
  # macOS / Linux
  curl -LsSf [https://astral.sh/uv/install.sh](https://astral.sh/uv/install.sh) | sh
  
  # macOS (Homebrew alternative)
  brew install uv

# Project Setup Guide

This project uses **Docker Compose** for the database, **uv** for Python dependency management, and **Django** as the backend framework.

---

## 1. Start the Database

We use Docker Compose to spin up a local PostgreSQL instance.

### Prerequisite
Ensure the Docker daemon is running on your machine.

### Run the database

In the root of the project (where your `docker-compose.yml` lives), run:

    ```bash
    docker compose --env-file .env.local up
    ```

## 2. Setup the Python Environment

Uv automatically creates virtual environment.

### Install dependencies
Run the following command in the directory containing `pyproject.toml`:

    ```bash
    uv sync
    ```

Activate the virutal environment.
    ```bash
    source .venv/bin/activate
    ```

## 3. Environment variables

This project uses python-dotenv to manage secrets. You need to create a local `.env.local` file so Django can connect to your Dockerized database.

Create a file named `.env.local` in the root directory(same as compose.yml) or change the `load_dotenv` path in `servox/settings` and add the following:

    ```bash
    # .env.local
    DJANGO_SECRET_KEY=your-local-secret-key-do-not-use-in-prod

    # Database Configuration (matches Docker Compose)
    POSTGRESQL_DB_ENGINE=django.db.backends.postgresql
    POSTGRESQL_DB_NAME=postgres
    POSTGRESQL_DB_USER=postgres
    POSTGRESQL_DB_PASSWORD=postgres
    POSTGRESQL_DB_HOST=localhost
    POSTGRESQL_DB_PORT=5432
    ```

## 4. Run Migrations

With the database running and dependencies installed, apply the Django migrations to build your database schema:

    ```bash
    uv run manage.py migrate
    ```

## 5. (Optional) Create an admin user

To log into the Django admin backend:

    ```bash
    uv run manage.py createsuperuser
    ```

## 6. Start the Server

You are ready to go! Start the Django development server:

    ```bash
    uv run manage.py runserver
    ```

The API will now be available at:
    ```bash
    http://localhost:8000/api/
    ```

---

## Linting & Formatting

To keep the codebase clean and consistent, we use Ruff for linting and Black for formatting.

### Format your code

    ```bash
    black .
    ```

### Run the linter

    ```bash
    ruff check .
    ```

