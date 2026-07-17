#!/bin/sh
set -eu

readonly DB_WAIT_ATTEMPTS="${DB_WAIT_ATTEMPTS:-30}"
readonly DB_WAIT_INTERVAL_SECONDS="${DB_WAIT_INTERVAL_SECONDS:-2}"

attempt=1
until python -c "import os; from sqlalchemy import create_engine; create_engine(os.environ['DATABASE_URL']).connect().close()"; do
    if [ "$attempt" -ge "$DB_WAIT_ATTEMPTS" ]; then
        echo "Database did not become available after ${DB_WAIT_ATTEMPTS} attempts." >&2
        exit 1
    fi

    echo "Waiting for database (${attempt}/${DB_WAIT_ATTEMPTS})..." >&2
    attempt=$((attempt + 1))
    sleep "$DB_WAIT_INTERVAL_SECONDS"
done

alembic upgrade head
exec "$@"
