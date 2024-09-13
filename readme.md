# Introduction to our webapplication

## NB! For the application to work, one must be on localhost:8000 for the request security policies not to stop your request.

## To start server

1. Go to /Fitzo
2. Create virtual environment with:

```zsh
python -m venv $NAME
```

3. Once you’ve created the virtual environment, you need to activate it. On Windows, run:

```zsh
source $NAME/Scripts/activate
```

On Unix or MacOS, run:

```zsh
source $NAME/bin/activate
```

4. Run:

```zsh
pip install -r requirements.txt
```

5. Go to /Fitzo_app and run:

```zsh
python manage.py migrate
```

6. Run:

```zsh
python manage.py runserver localhost:8000
```

Server will host site on localhost:8000
NB! For the application to work, one must be on localhost:8000 for the request security policies not to stop your request.

## To Create superuser

1. Go to /Fitzo/Fitzo_app
2. Run:

```zsh
python manage.py createsuperuser
```

## Build frontend (Frontend is allready built in Application folder)

1. Go to /Fitzo_app/fitzo_frontend
2. Run:

```zsh
npm install
```

3. Run:

```zsh
npm run build
```

## Update Database

1. Run:

```zsh
python manage.py makemigrations
```

2. Run:

```zsh
python manage.py migrate
```

Authors: Kevin Klefsås, Henrik Norhus, Ask Thommassen, Pål Kristoffersen and Ludvig Hellesvik
