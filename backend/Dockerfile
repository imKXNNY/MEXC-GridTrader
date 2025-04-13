FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --only main

COPY . .

EXPOSE 5000
CMD ["poetry", "run", "python", "app.py"]
