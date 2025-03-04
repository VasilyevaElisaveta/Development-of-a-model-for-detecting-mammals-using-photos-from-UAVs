from django.urls import path, include
from . import views

from django.conf import settings
from django.conf.urls.static import static


app_name = 'detection'

urlpatterns = [
    path('', views.detect_mammals, name='detect_mammals')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)