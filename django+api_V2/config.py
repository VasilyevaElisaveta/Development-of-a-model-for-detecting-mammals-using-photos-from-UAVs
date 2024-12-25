from os import path
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = path.join(BASE_DIR, "media")
MEDIA_URL = 'media/results'
MEDIA_DIR_UPLOADED_FILES = path.join(MEDIA_DIR, 'uploaded')
MEDIA_DIR_RESULT_FILES = path.join(MEDIA_DIR, 'results')
