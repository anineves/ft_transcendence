from django.urls import path
from .views import send_invite

urlpatterns = [
    path('send_invite/', send_invite, name='send_invite'),
]
