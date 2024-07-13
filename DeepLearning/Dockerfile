FROM python:3.12.3-bullseye

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0

WORKDIR /usr/app

COPY . .

RUN pip install -r requirements.txt

CMD ["flask", "--app","app","run","--debug","--host=0.0.0.0"]