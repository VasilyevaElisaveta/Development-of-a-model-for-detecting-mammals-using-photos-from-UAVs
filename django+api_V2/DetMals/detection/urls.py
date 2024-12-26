from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static

from config import DJANGO_PATH_FOR_DETECTION_EDITING


app_name = 'detection'

urlpatterns = [
    path('', views.detect_mammals, name='detect_mammals'),
    path(f'{DJANGO_PATH_FOR_DETECTION_EDITING}/', views.edit_detection, name='edit_detection')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)