from django.urls import path
from . import views

from django.conf import settings
from django.conf.urls.static import static


app_name = 'homepage'

urlpatterns = [
    path('', views.index, name='index')
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)