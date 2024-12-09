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
async def test(file: UploadFile = File(...)) -> JSONResponse:
    file_path: str = os_path.join(MEDIA_DIR_UPLOADED_FILES, file.filename)

    if not FileManager.check_file_extension(file_path):
        return JSONResponse(content={"status": False, "error": FileManager.get_supported_file_extensions_message()})
        
    with open(file_path, "wb") as f:
        copyfileobj(file.file, f)
    output_file: str = DetectionInterface.run(file_path)
    return JSONResponse(content={"status" : True, "processed_file": output_file})
