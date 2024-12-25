from django.urls import path, include
from . import views

from django.conf import settings
from django.conf.urls.static import static


app_name = 'detection'

urlpatterns = [
    path('', views.detect_mammals, name='detect_mammals'),
    path('edit_detection/', views.edit_detection, name='edit_detection')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)