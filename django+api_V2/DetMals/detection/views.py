from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from requests import post
from .forms import UploadFileForm


FASTAPI_PROCESS_URL = 'http://127.0.0.1:8000/process/'
FASTAPI_PREPARE_ANNOTATIONS_URL = 'http://127.0.0.1:8000/prepare/'

def detect_mammals(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES['file']

            response = post(
                FASTAPI_PROCESS_URL,
                files={"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)}
            )

            if response.status_code == 200:
                status = response.json()['status']
                if status:
                    file_system = FileSystemStorage()
                    processed_file_path = response.json()["processed_file"]
                    download_url = file_system.url(processed_file_path)
                    return render(request, "detection_result.html", {"status": status, "download_url": download_url})
                else:
                    error = response.json()['error']
                    return render(request, "detection_result.html", {"status": status, "error": error})
            else:
                return render(request, "detection_result.html", {"status": False, "error": response.text})
    else:
        form = UploadFileForm()

    return render(request, "detection_result.html", {'form': form})

def edit_detection(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES['file']
            response = post(
                FASTAPI_PREPARE_ANNOTATIONS_URL,
                files={"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)}
            )

            if response.status_code == 200:
                response_data = response.json()
                status = response_data["status"]

                if not status:
                    return render(request, "edit_detection.html", {"error": response_data["text"]})
                
                image_data = response_data["image_data"]
                class_data = response_data["class_data"]
                amount = response_data["amount"]
                return render(request, "annotation_tool.html", {"image_data": image_data, "class_data": class_data, "amount": amount})
            else:
                return render(request, "edit_detection.html", {"error": response.text})
    else:
        form = UploadFileForm()

    return render(request, "edit_detection.html", {"form": form})
