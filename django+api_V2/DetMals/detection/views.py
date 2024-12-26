from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from requests import post
from json import dumps
from config import (DJANGO_BASE_URL, DJANGO_DETECTION_URL, DJANGO_DETECTION_EDITING_URL, FASTAPI_PROCESS_URL, 
                    FASTAPI_PREPARE_ANNOTATIONS_URL, FASTAPI_COMPLETION_URL, class_data)


def detect_mammals(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        class_name: str = request.POST.get('class')

        response = post(
            FASTAPI_PROCESS_URL,
            files = {"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)},
            data = {"class_name": class_name}
        )

        if response.status_code == 200:
            status = response.json()['status']
            if status:
                file_system = FileSystemStorage()
                processed_file_path = response.json()["processed_file"]
                download_url = file_system.url(processed_file_path)
                return render(request, "process_detection.html", {"is_form": False, "status": True, "download_url": download_url})
            else:
                error = response.json()['error']
                return render(request, "process_detection.html", {"is_form": False, "status": False, "error": error})
        else:
            return render(request, "process_detection.html", {"is_form": False, "status": False, "error": response.text})
    else:
        return render(request, "process_detection.html", {'is_form': True, "class_data": dumps(class_data), 'detection_url': DJANGO_DETECTION_URL})

def edit_detection(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['file']
        response = post(
            FASTAPI_PREPARE_ANNOTATIONS_URL,
            files={"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)}
        )

        if response.status_code == 200:
            response_data: dict = response.json()
            status: bool = response_data["status"]

            if not status:
                return render(request, "edit_detection.html", {"error": response_data["text"]})
            image_data: str = response_data["image_data"]
            class_data: str = response_data["class_data"]
            amount: int = response_data["amount"]
            return render(request, "annotation_tool.html", {"image_data": image_data, "class_data": class_data, "amount": amount,
                                                            "django_url": DJANGO_BASE_URL, "api_url": FASTAPI_COMPLETION_URL})
        else:
            return render(request, "edit_detection.html", {"error": response.text})
    else:
        return render(request, "edit_detection.html", {'detection_editing_url': DJANGO_DETECTION_EDITING_URL})
