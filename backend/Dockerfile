FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system app \
    && adduser --system --ingroup app --uid 10001 app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --chown=app:app . .
RUN mkdir -p /app/uploads \
    && chmod +x /app/docker-entrypoint.sh \
    && chown -R app:app /app

USER app

HEALTHCHECK --interval=5s --timeout=5s --start-period=20s --retries=10 \
    CMD curl --fail --silent --show-error http://localhost:8000/api/v1/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
