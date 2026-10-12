run venv: >venv\Scripts\activate.bat
stop venv: deactivate
run fast api: uvicorn app.main:app --reload
