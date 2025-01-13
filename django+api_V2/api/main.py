from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api.interface import DetectionInterface
from api.file_management import FileManager
from pathlib import Path
from sys import path
from config import DJANGO_BASE_URL, API_PATH_FOR_DETECTION, API_PATH_FOR_FILE_PREPARETION, API_PATH_FOR_PROCESS_COMPLETION


path.append(str(Path(__file__).resolve().parent.parent))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[DJANGO_BASE_URL],
    allow_credentials=True,
    allow_methods=["POST"], 
    allow_headers=["*"],
)

@app.post(f'/{API_PATH_FOR_DETECTION}/')
async def process(file: UploadFile = File(...), class_name: str = Form(...)) -> JSONResponse:

    if not FileManager.check_file_extension(file.filename):
        return JSONResponse(content={"status": False, "is_list": True, "error": FileManager.get_supported_file_extensions_message()})
        
    file_path: str = FileManager.save_file(file.file, file.filename)
    output_file: str = DetectionInterface.run_detection(file_path, class_name)
    return JSONResponse(content={"status" : True, "processed_file": output_file})

@app.post(f'/{API_PATH_FOR_FILE_PREPARETION}/')
async def prepare(file: UploadFile = File(...)) -> JSONResponse:

    if not FileManager.check_file_extension(file.filename, is_editing=True):
        return JSONResponse(content={"status": False, "is_list": True, "text": FileManager.get_supported_file_extensions_message(is_editing=True)})
    
    file_path: str = FileManager.save_file(file.file, file.filename)
    preparation_result: tuple = DetectionInterface.run_editing_preparation(file_path)
    preparation_status: bool = preparation_result[0]
    if not preparation_status:
        return JSONResponse(content={"status": False, "is_list": False, "text": preparation_result[1]})
    
    image_data, class_data, amount = preparation_result[1:]
    return JSONResponse(content={"status": True, "image_data": image_data, "class_data": class_data, "amount": amount})

@app.post(f'/{API_PATH_FOR_PROCESS_COMPLETION}/')
async def complete_editing(image_data: str = Form(...), class_data: str = Form(...)) -> JSONResponse:
    output_file: str = DetectionInterface.run_editing_completion(image_data, class_data)
    return JSONResponse(content={"file_path": output_file})
