from os import path
from pathlib import Path


LOCAL_HOST = '127.0.0.1'
PORT_FOR_DJANGO = 8001
PORT_FOR_API = 8000
DJANGO_PATH_FOR_ADMIN = 'admin'
DJANGO_PATH_FOR_DETECTION = 'detection'
DJANGO_PATH_FOR_DETECTION_EDITING = f'edit_detection'
DJANGO_PATH_FOR_HOMEPAGE = ''
API_PATH_FOR_DETECTION = 'process'
API_PATH_FOR_FILE_PREPARETION = 'prepare'
API_PATH_FOR_PROCESS_COMPLETION = 'complete'

DJANGO_BASE_URL = f'http://{LOCAL_HOST}:{PORT_FOR_DJANGO}'
DJANGO_DETECTION_URL = f'http://{LOCAL_HOST}:{PORT_FOR_DJANGO}/{DJANGO_PATH_FOR_DETECTION}/'
DJANGO_DETECTION_EDITING_URL = f'http://{LOCAL_HOST}:{PORT_FOR_DJANGO}/{DJANGO_PATH_FOR_DETECTION}/{DJANGO_PATH_FOR_DETECTION_EDITING}/'
FASTAPI_PROCESS_URL = f'http://{LOCAL_HOST}:{PORT_FOR_API}/{API_PATH_FOR_DETECTION}/'
FASTAPI_PREPARE_ANNOTATIONS_URL = f'http://{LOCAL_HOST}:{PORT_FOR_API}/{API_PATH_FOR_FILE_PREPARETION}/'
FASTAPI_COMPLETION_URL = f'http://{LOCAL_HOST}:{PORT_FOR_API}/{API_PATH_FOR_PROCESS_COMPLETION}/'

PATH_TO_DJANGO_STARTUP_FILE = 'DetMals/manage.py'
PATH_TO_FASTAPI_STARTUP_FILE = 'api.main'


BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = path.join(BASE_DIR, "media")
MEDIA_URL = 'media/results'
MEDIA_DIR_UPLOADED_FILES = path.join(MEDIA_DIR, 'uploaded')
MEDIA_DIR_RESULT_FILES = path.join(MEDIA_DIR, 'results')


class_data = [
    {"value": 'deer', "text": 'Олени', "is_selected": True},
    {"value": 'cow', "text": 'Коровы', "is_selectes": False},
    {"value": 'penguin', "text": 'Пингивны', "is_selected": False}
]
models_path = {
    'deer': 'api/models/deers.pt',
    'cow': 'api/models/cows.pt',
    'penguin': 'api/models/mammals.pt'
}
