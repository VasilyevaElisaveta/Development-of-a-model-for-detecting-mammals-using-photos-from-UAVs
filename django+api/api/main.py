from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from api.interface import DetectionInterface
from api.file_management import FileManager
from config import MEDIA_DIR_UPLOADED_FILES
from pathlib import Path
from sys import path as sys_path
from os import path as os_path
from shutil import copyfileobj


sys_path.append(str(Path(__file__).resolve().parent.parent))

app = FastAPI()

@app.post('/process/')
async def process(file: UploadFile = File(...)) -> JSONResponse:
    file_path: str = os_path.join(MEDIA_DIR_UPLOADED_FILES, file.filename)

    if not FileManager.check_file_extension(file_path):
        return JSONResponse(content={"status": False, "error": FileManager.get_supported_file_extensions_message()})
        
    FileManager.save_file(file.file, file_path)
    output_file: str = DetectionInterface.run_detection(file_path)
    return JSONResponse(content={"status" : True, "processed_file": output_file})
