# Docker stack

The Compose project runs PostgreSQL, Redis, Django/Gunicorn, Celery, and the Vue/Nginx frontend.

## Start everything

From the repository root, ensure `backend/.env` exists, then run:

```sh
docker compose up --build -d
docker compose ps
```

Open the portfolio at <http://localhost:3000>. The Django API remains available at <http://localhost:8000/api/v1/> and the admin is proxied at <http://localhost:3000/admin/>.

Uploaded files are served at `/media/` by Nginx directly from the mounted `backend/media` directory. Database fields continue to store only their relative uploaded-file paths.

Database migrations and static-file collection run automatically before Gunicorn starts. PostgreSQL and Redis data use named volumes; uploaded media remains in `backend/media`.

## Useful commands

```sh
docker compose logs -f
docker compose exec server python manage.py createsuperuser
docker compose down
```

Use `docker compose down -v` only when you intentionally want to delete PostgreSQL and Redis data.
