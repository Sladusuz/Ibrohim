FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Baza /data da saqlanadi: hostingda /data ga doimiy disk (volume) ulang
ENV PORT=8080 DB_PATH=/data/market.db
EXPOSE 8080
CMD ["python", "bot.py"]
