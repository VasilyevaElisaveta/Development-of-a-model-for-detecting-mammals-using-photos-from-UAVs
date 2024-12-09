from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from requests import post
from .forms import UploadFileForm


FASTAPI_URL = 'http://127.0.0.1:8000/process/'

def detect_mammals(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES['file']

            response = post(
                FASTAPI_URL,
                files={"file": (uploaded_file.name, uploaded_file.read(), uploaded_file.content_type)}
            )

            if response.status_code == 200:
                status = response.json()['status']
                if status:
                    file_system = FileSystemStorage()
                    processed_file_path = response.json()["processed_file"]
                    download_url = file_system.url(processed_file_path)
                    return render(request, "result.html", {"status": status, "download_url": download_url})
                else:
                    error = response.json()['error']
                    return render(request, "result.html", {"status": status, "error": error})
            else:
                return render(request, "result.html", {"status": False, "error": response.text})
    else:
        form = UploadFileForm()

    return render(request, 'result.html', {'form': form})
