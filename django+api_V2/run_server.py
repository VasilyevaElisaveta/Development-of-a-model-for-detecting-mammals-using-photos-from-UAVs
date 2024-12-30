from uvicorn import run
from os import system
from multiprocessing import Process
from config import PATH_TO_DJANGO_STARTUP_FILE, PATH_TO_FASTAPI_STARTUP_FILE, LOCAL_HOST, PORT_FOR_DJANGO, PORT_FOR_API


def run_django():
    system(f'python {PATH_TO_DJANGO_STARTUP_FILE} runserver {LOCAL_HOST}:{PORT_FOR_DJANGO}')

def run_fastapi():
    run(f"{PATH_TO_FASTAPI_STARTUP_FILE}:app", host=f"{LOCAL_HOST}", port=PORT_FOR_API)

if __name__ == "__main__":
    try:
        django_process = Process(target=run_django)
        fastapi_process = Process(target=run_fastapi)

        django_process.start()
        fastapi_process.start()

        django_process.join()
        fastapi_process.join()

    except KeyboardInterrupt:
        django_process.terminate()
        fastapi_process.terminate()
        